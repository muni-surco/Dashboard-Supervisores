CREATE OR REPLACE FUNCTION public.clasificar_franja(turno_raw TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  CASE
    WHEN LOWER(turno_raw) LIKE '%mañana%' OR LOWER(turno_raw) LIKE '%m%' THEN RETURN '06–12h';
    WHEN LOWER(turno_raw) LIKE '%tarde%' OR LOWER(turno_raw) LIKE '%t%' THEN RETURN '12–18h';
    WHEN LOWER(turno_raw) LIKE '%noche%' OR LOWER(turno_raw) LIKE '%n%' THEN RETURN '18–24h';
    ELSE RETURN '00–06h';
  END CASE;
END;
$$;