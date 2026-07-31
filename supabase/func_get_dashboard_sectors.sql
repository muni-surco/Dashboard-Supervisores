-- Requiere ejecutar primero mv_dashboard.sql (MV incidencias_diaria, incidencias_tipos_diaria)
-- DROP FUNCTION si cambia la firma. Luego: NOTIFY pgrst, 'reload schema';
CREATE OR REPLACE FUNCTION public.get_dashboard_sectors(
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL,
  p_turno_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  "id" TEXT,
  "nombre" TEXT,
  "sector_display" TEXT,
  "initials" TEXT,
  "incTotal" BIGINT,
  "tasaResp" NUMERIC,
  "comisarias" TEXT[],
  "franjas" JSONB,
  "tiposDelito" JSONB,
  "robosFrustrados" BIGINT,
  "operativosCount" BIGINT,
  "coordVecinales" BIGINT,
  "capturas" BIGINT,
  "patrullajeCount" BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH filt AS (
    SELECT
      d.sector,
      d.franja,
      d.inc_total,
      d.tasa_resp,
      d.n_tasa,
      d.comisarias,
      d.robos_frustrados,
      d.operativos,
      d.coord_vecinales,
      d.capturas,
      d.patrullaje
    FROM public.incidencias_diaria d
    WHERE
      (p_fecha_inicio IS NULL OR d.fecha >= p_fecha_inicio) AND
      (p_fecha_fin IS NULL OR d.fecha <= p_fecha_fin) AND
      (p_turno_filter IS NULL OR p_turno_filter = '' OR d.franja = (
        CASE p_turno_filter
          WHEN 'manana' THEN '0612'
          WHEN 'tarde' THEN '1218'
          WHEN 'noche' THEN '1824'
          ELSE NULL
        END))
  ),
  agg AS (
    SELECT
      d.sector,
      SUM(d.inc_total)::BIGINT AS inc_total,
      CASE WHEN SUM(d.n_tasa) = 0 THEN 0 ELSE SUM(d.tasa_resp * d.n_tasa) / SUM(d.n_tasa) END AS tasa_resp,
      SUM(d.inc_total) FILTER (WHERE d.franja = '0006') AS f0006,
      SUM(d.inc_total) FILTER (WHERE d.franja = '0612') AS f0612,
      SUM(d.inc_total) FILTER (WHERE d.franja = '1218') AS f1218,
      SUM(d.inc_total) FILTER (WHERE d.franja = '1824') AS f1824,
      SUM(d.robos_frustrados)::BIGINT AS robos_frustrados,
      SUM(d.operativos)::BIGINT AS operativos,
      SUM(d.coord_vecinales)::BIGINT AS coord_vecinales,
      SUM(d.capturas)::BIGINT AS capturas,
      SUM(d.patrullaje)::BIGINT AS patrullaje
    FROM filt d
    GROUP BY d.sector
  ),
  comis AS (
    SELECT
      d.sector,
      ARRAY_AGG(DISTINCT c ORDER BY c) FILTER (WHERE c IS NOT NULL AND c != '') AS comisarias
    FROM filt d, LATERAL UNNEST(d.comisarias) AS c
    GROUP BY d.sector
  ),
  t AS (
    SELECT
      d.sector,
      d.detalle AS tipo,
      SUM(d.cnt) AS cnt
    FROM public.incidencias_tipos_diaria d
    WHERE
      (p_fecha_inicio IS NULL OR d.fecha >= p_fecha_inicio) AND
      (p_fecha_fin IS NULL OR d.fecha <= p_fecha_fin) AND
      (p_turno_filter IS NULL OR p_turno_filter = '' OR d.franja = (
        CASE p_turno_filter
          WHEN 'manana' THEN '0612'
          WHEN 'tarde' THEN '1218'
          WHEN 'noche' THEN '1824'
          ELSE NULL
        END))
    GROUP BY d.sector, d.detalle
  ),
  ranked AS (
    SELECT sector, tipo, cnt,
      ROW_NUMBER() OVER (PARTITION BY sector ORDER BY cnt DESC) AS rn
    FROM t
  ),
  top5 AS (
    SELECT sector,
      JSONB_OBJECT_AGG(tipo, cnt) AS tipos
    FROM ranked
    WHERE rn <= 5
    GROUP BY sector
  )
  SELECT
    ja.sector AS id,
    ja.nombre,
    'Sector ' || ja.sector AS sector_display,
    UPPER(SUBSTRING(ja.nombre FROM 1 FOR 1) || COALESCE(SUBSTRING(ja.nombre FROM POSITION(' ' IN ja.nombre) + 1 FOR 1), '')) AS initials,
    COALESCE(a.inc_total, 0) AS incTotal,
    COALESCE(a.tasa_resp, 0) AS tasaResp,
    COALESCE(c.comisarias, '{}'::TEXT[]) AS comisarias,
    JSONB_BUILD_ARRAY(
      JSONB_BUILD_OBJECT('l', 'Mañana', 'v', COALESCE(a.f0612, 0), 'c', '#27AE60'),
      JSONB_BUILD_OBJECT('l', 'Tarde', 'v', COALESCE(a.f1218, 0), 'c', '#F5A623'),
      JSONB_BUILD_OBJECT('l', 'Noche', 'v', COALESCE(a.f1824, 0), 'c', '#E03E3E')
    ) AS franjas,
    COALESCE(t.tipos, '{}'::JSONB) AS tiposDelito,
    COALESCE(a.robos_frustrados, 0) AS robosFrustrados,
    COALESCE(a.operativos, 0) AS operativosCount,
    COALESCE(a.coord_vecinales, 0) AS coordVecinales,
    COALESCE(a.capturas, 0) AS capturas,
    COALESCE(a.patrullaje, 0) AS patrullajeCount
  FROM public.jefes_area ja
  LEFT JOIN agg a ON a.sector = ja.sector
  LEFT JOIN comis c ON c.sector = ja.sector
  LEFT JOIN top5 t ON t.sector = ja.sector
  ORDER BY ja.sector;
END;
$$;
