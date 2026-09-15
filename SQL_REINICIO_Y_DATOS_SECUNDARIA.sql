-- Reinicio y datos de prueba para el Sistema de Riesgo Académico.
-- Ejecutar en el SQL Editor de Supabase.
--
-- Resultado:
--   * Conserva las tablas y sus relaciones.
--   * Elimina todos los registros actuales.
--   * Crea 5 grados, una sección por grado y 25 estudiantes por sección.
--   * Crea 12 cursos para toda la secundaria.
--   * Crea 4 períodos del año 2026.
--   * No crea estudiantes, notas ni evaluaciones.

BEGIN;

-- Vaciar datos sin eliminar tablas, claves, índices ni políticas RLS.
TRUNCATE TABLE
  puntos_criticos,
  evaluaciones_riesgo,
  notas,
  estudiantes,
  secciones,
  grados,
  cursos,
  periodos
RESTART IDENTITY CASCADE;

-- 1. Grados: uno por cada año de secundaria.
INSERT INTO grados (nombre, nivel)
SELECT
  nivel || '° de Secundaria',
  nivel
FROM generate_series(1, 5) AS niveles(nivel);

-- 2. Una sola sección por grado.
INSERT INTO secciones (nombre, grado_id)
SELECT
  'A',
  g.id
FROM grados AS g
WHERE g.nivel BETWEEN 1 AND 5;

-- 3. Doce cursos disponibles para todos los grados.
INSERT INTO cursos (nombre, codigo)
VALUES
  ('Matemática', 'MAT'),
  ('Comunicación', 'COM'),
  ('Ciencia y Tecnología', 'CYT'),
  ('Inglés', 'ING'),
  ('Historia, Geografía y Economía', 'HGE'),
  ('Educación Física', 'EFI'),
  ('Arte y Cultura', 'ARC'),
  ('Educación para el Trabajo', 'EPT'),
  ('Desarrollo Personal, Ciudadanía y Cívica', 'DPCC'),
  ('Tutoría', 'TUT'),
  ('Religión', 'REL'),
  ('Computación', 'COMPU');

-- 4. Cuatro períodos académicos de 2026.
INSERT INTO periodos (nombre, numero, "año", fecha_inicio, fecha_fin)
VALUES
  ('Primer Bimestre', 1, 2026, '2026-03-02', '2026-05-15'),
  ('Segundo Bimestre', 2, 2026, '2026-05-18', '2026-07-17'),
  ('Tercer Bimestre', 3, 2026, '2026-07-20', '2026-09-25'),
  ('Cuarto Bimestre', 4, 2026, '2026-09-28', '2026-12-18');

COMMIT;
