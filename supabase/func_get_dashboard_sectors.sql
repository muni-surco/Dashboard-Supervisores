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
  SELECT
    ja.sector AS id,
    ja.nombre,
    'Sector ' || ja.sector AS sector_display,
    UPPER(SUBSTRING(ja.nombre FROM 1 FOR 1) || COALESCE(SUBSTRING(ja.nombre FROM POSITION(' ' IN ja.nombre) + 1 FOR 1), '')) AS initials,
    COUNT(i.codigo) AS incTotal,
    COALESCE(AVG(i.time_minimo) FILTER (WHERE i.time_minimo > 0)::NUMERIC, 0) AS tasaResp,
    COALESCE(ARRAY_AGG(DISTINCT i.cia) FILTER (WHERE i.cia IS NOT NULL AND i.cia != ''), '{}'::TEXT[]) AS comisarias,
    
    -- Franjas
    JSONB_BUILD_ARRAY(
      JSONB_BUILD_OBJECT('l', '00–06h', 'v', COUNT(i.codigo) FILTER (WHERE public.clasificar_franja(i.turno) = '00–06h'), 'c', '#003D6B'),
      JSONB_BUILD_OBJECT('l', '06–12h', 'v', COUNT(i.codigo) FILTER (WHERE public.clasificar_franja(i.turno) = '06–12h'), 'c', '#27AE60'),
      JSONB_BUILD_OBJECT('l', '12–18h', 'v', COUNT(i.codigo) FILTER (WHERE public.clasificar_franja(i.turno) = '12–18h'), 'c', '#F5A623'),
      JSONB_BUILD_OBJECT('l', '18–24h', 'v', COUNT(i.codigo) FILTER (WHERE public.clasificar_franja(i.turno) = '18–24h'), 'c', '#E03E3E')
    ) AS franjas,

    -- Tipos Delito (top 5 aggregated into a JSONB object)
    COALESCE((
      SELECT JSONB_OBJECT_AGG(type_count.tipo, type_count.count_tipo)
      FROM (
        SELECT i_sub.tipo, COUNT(i_sub.codigo) AS count_tipo
        FROM public.incidencias AS i_sub
        WHERE i_sub.sector = ja.sector
          AND (p_fecha_inicio IS NULL OR i_sub.fecha_apertura >= p_fecha_inicio)
          AND (p_fecha_fin IS NULL OR i_sub.fecha_apertura <= p_fecha_fin)
          AND (p_turno_filter IS NULL OR
            (p_turno_filter = 'manana' AND (LOWER(i_sub.turno) LIKE '%mañana%' OR LOWER(i_sub.turno) LIKE '%m%')) OR
            (p_turno_filter = 'tarde' AND (LOWER(i_sub.turno) LIKE '%tarde%' OR LOWER(i_sub.turno) LIKE '%t%')) OR
            (p_turno_filter = 'noche' AND (LOWER(i_sub.turno) LIKE '%noche%' OR LOWER(i_sub.turno) LIKE '%n%')) OR
            (LOWER(i_sub.turno) LIKE '%' || LOWER(p_turno_filter) || '%'))
        GROUP BY i_sub.tipo
        ORDER BY count_tipo DESC
        LIMIT 5
      ) AS type_count
    ), '{}'::JSONB) AS tiposDelito,

    COUNT(i.codigo) FILTER (WHERE LOWER(i.tipo) LIKE '%robo frustrado%') AS robosFrustrados,
    COUNT(i.codigo) FILTER (WHERE LOWER(i.tipo) LIKE '%operativo%') AS operativosCount,
    COUNT(i.codigo) FILTER (WHERE LOWER(i.tipo) LIKE '%coordinacion%') AS coordVecinales,
    COUNT(i.codigo) FILTER (WHERE LOWER(i.tipo) LIKE '%captura%') AS capturas,
    COUNT(i.codigo) FILTER (WHERE LOWER(i.tipo) LIKE '%patrullaje%') AS patrullajeCount
  FROM
    public.incidencias AS i
  JOIN
    public.jefes_area AS ja ON ja.sector = UPPER(i.sector)
  WHERE
    (p_fecha_inicio IS NULL OR i.fecha_apertura >= p_fecha_inicio) AND
    (p_fecha_fin IS NULL OR i.fecha_apertura <= p_fecha_fin) AND
    (p_turno_filter IS NULL OR
      (p_turno_filter = 'manana' AND (LOWER(i.turno) LIKE '%mañana%' OR LOWER(i.turno) LIKE '%m%')) OR
      (p_turno_filter = 'tarde' AND (LOWER(i.turno) LIKE '%tarde%' OR LOWER(i.turno) LIKE '%t%')) OR
      (p_turno_filter = 'noche' AND (LOWER(i.turno) LIKE '%noche%' OR LOWER(i.turno) LIKE '%n%')) OR
      (LOWER(i.turno) LIKE '%' || LOWER(p_turno_filter) || '%'))
  GROUP BY
    ja.sector, ja.nombre
  ORDER BY
    ja.sector;
END;
$$;