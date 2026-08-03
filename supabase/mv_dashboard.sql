-- ── Materialized Views para rendimiento del dashboard ──
-- Pre-agregan incidencias por (sector, fecha, franja)
-- El dashboard consulta ~8k filas en vez de 184k+
-- Refrescar tras cada importación: SELECT public.refresh_dashboard_mvs();

DROP MATERIALIZED VIEW IF EXISTS public.incidencias_tipos_diaria;
DROP MATERIALIZED VIEW IF EXISTS public.incidencias_diaria;

-- MV 1: KPIs por (sector, fecha, franja)
CREATE MATERIALIZED VIEW public.incidencias_diaria AS
SELECT
  CASE UPPER(i.sector) WHEN '9A' THEN '9' WHEN '9B' THEN '9' ELSE UPPER(i.sector) END AS sector,
  i.fecha_apertura AS fecha,
  CASE
    WHEN LOWER(i.turno) LIKE '%mañana%' OR LOWER(i.turno) LIKE '%m%' THEN '0612'
    WHEN LOWER(i.turno) LIKE '%tarde%' OR LOWER(i.turno) LIKE '%t%' THEN '1218'
    WHEN LOWER(i.turno) LIKE '%noche%' OR LOWER(i.turno) LIKE '%n%' THEN '1824'
    ELSE '0006'
  END AS franja,
  COUNT(*) AS inc_total,
  COALESCE(AVG(i.time_minimo) FILTER (WHERE i.time_minimo > 0)::NUMERIC, 0) AS tasa_resp,
  COUNT(*) FILTER (WHERE i.time_minimo > 0) AS n_tasa,
  COALESCE(ARRAY_AGG(DISTINCT i.cia) FILTER (WHERE i.cia IS NOT NULL AND i.cia != ''), '{}'::TEXT[]) AS comisarias,
  COUNT(*) FILTER (WHERE LOWER(i.tipo) LIKE '%robo frustrado%') AS robos_frustrados,
  COUNT(*) FILTER (WHERE LOWER(i.tipo) LIKE '%operativo%') AS operativos,
  COUNT(*) FILTER (WHERE LOWER(i.tipo) LIKE '%coordinacion%') AS coord_vecinales,
  COUNT(*) FILTER (WHERE LOWER(i.tipo) LIKE '%captura%') AS capturas,
  COUNT(*) FILTER (WHERE LOWER(i.tipo) LIKE '%patrullaje%') AS patrullaje
FROM public.incidencias i
GROUP BY 1, 2, 3;

CREATE INDEX idx_diaria_sector_fecha ON public.incidencias_diaria (sector, fecha);

-- MV 2: Tipos de delito por (sector, fecha, franja, tipo, subtipo) para top-5
CREATE MATERIALIZED VIEW public.incidencias_tipos_diaria AS
SELECT
  CASE UPPER(i.sector) WHEN '9A' THEN '9' WHEN '9B' THEN '9' ELSE UPPER(i.sector) END AS sector,
  i.fecha_apertura AS fecha,
  CASE
    WHEN LOWER(i.turno) LIKE '%mañana%' OR LOWER(i.turno) LIKE '%m%' THEN '0612'
    WHEN LOWER(i.turno) LIKE '%tarde%' OR LOWER(i.turno) LIKE '%t%' THEN '1218'
    WHEN LOWER(i.turno) LIKE '%noche%' OR LOWER(i.turno) LIKE '%n%' THEN '1824'
    ELSE '0006'
  END AS franja,
  COALESCE(NULLIF(BTRIM(i.tipo), ''), 'Sin tipo') AS tipo,
  COALESCE(BTRIM(i.subtipo), '') AS subtipo,
  COUNT(*) AS cnt
FROM public.incidencias i
GROUP BY 1, 2, 3, 4, 5;

CREATE INDEX idx_tipos_sector_fecha ON public.incidencias_tipos_diaria (sector, fecha);

-- MV 3: Desglose para el gráfico "Tipo de Delitos"
-- Solo registros con sub_clasificacion = 'Delitos'; agrupa por tipo + subtipo
DROP MATERIALIZED VIEW IF EXISTS public.incidencias_subclas_diaria;

CREATE MATERIALIZED VIEW public.incidencias_subclas_diaria AS
SELECT
  CASE UPPER(i.sector) WHEN '9A' THEN '9' WHEN '9B' THEN '9' ELSE UPPER(i.sector) END AS sector,
  i.fecha_apertura AS fecha,
  CASE
    WHEN LOWER(i.turno) LIKE '%mañana%' OR LOWER(i.turno) LIKE '%m%' THEN '0612'
    WHEN LOWER(i.turno) LIKE '%tarde%' OR LOWER(i.turno) LIKE '%t%' THEN '1218'
    WHEN LOWER(i.turno) LIKE '%noche%' OR LOWER(i.turno) LIKE '%n%' THEN '1824'
    ELSE '0006'
  END AS franja,
  CASE
    WHEN BTRIM(i.subtipo) = '' THEN COALESCE(NULLIF(BTRIM(i.tipo), ''), 'Sin tipo')
    ELSE COALESCE(NULLIF(BTRIM(i.tipo), ''), 'Sin tipo') || ' - ' || BTRIM(i.subtipo)
  END AS tipo,
  COUNT(*) AS cnt
FROM public.incidencias i
WHERE LOWER(BTRIM(i.sub_clasificacion)) = 'delitos'
GROUP BY 1, 2, 3, 4;

CREATE INDEX idx_subclas_sector_fecha ON public.incidencias_subclas_diaria (sector, fecha);

-- Función de refresco: SELECT public.refresh_dashboard_mvs();
CREATE OR REPLACE FUNCTION public.refresh_dashboard_mvs()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.incidencias_diaria;
  REFRESH MATERIALIZED VIEW public.incidencias_tipos_diaria;
  REFRESH MATERIALIZED VIEW public.incidencias_subclas_diaria;
END;
$$;
