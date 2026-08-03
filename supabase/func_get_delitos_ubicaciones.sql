-- Ubicaciones de incidencias clasificadas como 'Delitos' (gráfico "Tipo de Delitos")
-- Devuelve JSONB: [{sector, lat, lng, tipo}, ...] para el mapa del dashboard
-- Sector normalizado (9A/9B → 9); filtros por fecha y turno; tope 3000 puntos
-- Luego: NOTIFY pgrst, 'reload schema';

CREATE INDEX IF NOT EXISTS idx_incidencias_subclas ON public.incidencias (sub_clasificacion);

CREATE OR REPLACE FUNCTION public.get_delitos_ubicaciones(
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL,
  p_turno_filter TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_puntos JSONB;
BEGIN
  SELECT COALESCE(JSONB_AGG(JSONB_BUILD_OBJECT(
    'sector',
      CASE UPPER(i.sector) WHEN '9A' THEN '9' WHEN '9B' THEN '9' ELSE UPPER(i.sector) END,
    'lat', i.latitud,
    'lng', i.longitud,
    'tipo',
      CASE WHEN BTRIM(i.subtipo) = ''
           THEN COALESCE(NULLIF(BTRIM(i.tipo), ''), 'Sin tipo')
           ELSE COALESCE(NULLIF(BTRIM(i.tipo), ''), 'Sin tipo') || ' - ' || BTRIM(i.subtipo) END
  )), '[]'::JSONB)
  INTO v_puntos
  FROM (
    SELECT i.sector, i.latitud, i.longitud, i.tipo, i.subtipo
    FROM public.incidencias i
    WHERE LOWER(BTRIM(i.sub_clasificacion)) = 'delitos'
      AND i.latitud IS NOT NULL AND i.longitud IS NOT NULL
      AND (p_fecha_inicio IS NULL OR i.fecha_apertura >= p_fecha_inicio)
      AND (p_fecha_fin IS NULL OR i.fecha_apertura <= p_fecha_fin)
      AND (p_turno_filter IS NULL OR p_turno_filter = '' OR
        CASE p_turno_filter
          WHEN 'manana' THEN LOWER(i.turno) LIKE '%mañana%' OR LOWER(i.turno) LIKE '%m%'
          WHEN 'tarde' THEN LOWER(i.turno) LIKE '%tarde%' OR LOWER(i.turno) LIKE '%t%'
          WHEN 'noche' THEN LOWER(i.turno) LIKE '%noche%' OR LOWER(i.turno) LIKE '%n%'
          ELSE FALSE
        END)
    LIMIT 3000
  ) i;
  RETURN v_puntos;
END;
$$;
