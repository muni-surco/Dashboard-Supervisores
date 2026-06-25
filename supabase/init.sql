-- Crear tabla de jefes de área
CREATE TABLE IF NOT EXISTS public.jefes_area (
  sector text PRIMARY KEY,
  nombre text NOT NULL
);

-- Insertar datos de jefes de área
INSERT INTO public.jefes_area (sector, nombre) VALUES
  ('1A', 'ORTEGA LARA VICTOR RAUL'),
  ('1B', 'VASQUEZ IZAGUIRRE ROBERT'),
  ('2A', 'TASSARA FARACH HAROLD JAMES ODDE'),
  ('2B', 'PAREDES LOAYZA CARLOS EDUARDO'),
  ('3',  'LEVEAU ESPINOZA ERNESTO ARMANDO'),
  ('4',  'LEVEAU ESPINOZA ERNESTO ARMANDO'),
  ('5',  'KUSEN UENE LUIS ENRIQUE'),
  ('6',  'AGUILAR QUILLAMA JOHNNY'),
  ('7',  'MITMA LOPEZ MARTIN FELIPE'),
  ('8',  'ALBURQUEQUE ATOCHE FERNANDO'),
  ('9',  'QUISPE HUACHO LUIS MANUEL')
ON CONFLICT (sector) DO UPDATE SET nombre = EXCLUDED.nombre;

-- Crear tabla de supervisores (para migración futura desde spreadsheet)
CREATE TABLE IF NOT EXISTS public.supervisores (
  id SERIAL PRIMARY KEY,
  fecha date,
  sector text,
  turno text,
  supervisor text,
  cant_partes integer
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_incidencias_sector ON public.incidencias (sector);
CREATE INDEX IF NOT EXISTS idx_incidencias_fecha ON public.incidencias (fecha_apertura);
CREATE INDEX IF NOT EXISTS idx_incidencias_turno ON public.incidencias (turno);
