-- Datos semilla para poblar los gráficos del Dashboard.
-- Ejecutar después de SQL_SETUP.sql y SQL_PERMISOS.sql en Supabase.
--
-- Los IDs pertenecen exclusivamente a este conjunto de demostración.
-- El bloque elimina y vuelve a crear únicamente los registros con estos IDs
-- para que el script pueda ejecutarse más de una vez sin duplicar notas.

BEGIN;

CREATE TEMP TABLE seed_grados (
  id UUID PRIMARY KEY,
  nombre VARCHAR NOT NULL,
  nivel INT NOT NULL
) ON COMMIT DROP;

INSERT INTO seed_grados (id, nombre, nivel) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Primero de Secundaria', 1),
  ('10000000-0000-0000-0000-000000000002', 'Segundo de Secundaria', 2);

INSERT INTO grados (id, nombre, nivel)
SELECT id, nombre, nivel FROM seed_grados
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre, nivel = EXCLUDED.nivel;

INSERT INTO secciones (id, nombre, grado_id) VALUES
  ('20000000-0000-0000-0000-000000000001', 'A', '10000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', 'A', '10000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre, grado_id = EXCLUDED.grado_id;

INSERT INTO cursos (id, nombre, codigo) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Matemática', 'MAT'),
  ('30000000-0000-0000-0000-000000000002', 'Comunicación', 'COM'),
  ('30000000-0000-0000-0000-000000000003', 'Ciencia y Tecnología', 'CYT'),
  ('30000000-0000-0000-0000-000000000004', 'Inglés', 'ING')
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre, codigo = EXCLUDED.codigo;

INSERT INTO periodos (id, nombre, numero, año, fecha_inicio, fecha_fin) VALUES
  ('40000000-0000-0000-0000-000000000001', 'Primer Bimestre', 1, 2026, '2026-03-01', '2026-05-15'),
  ('40000000-0000-0000-0000-000000000002', 'Segundo Bimestre', 2, 2026, '2026-05-18', '2026-07-17'),
  ('40000000-0000-0000-0000-000000000003', 'Tercer Bimestre', 3, 2026, '2026-07-20', '2026-09-25'),
  ('40000000-0000-0000-0000-000000000004', 'Cuarto Bimestre', 4, 2026, '2026-09-28', '2026-12-18')
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    numero = EXCLUDED.numero,
    año = EXCLUDED.año,
    fecha_inicio = EXCLUDED.fecha_inicio,
    fecha_fin = EXCLUDED.fecha_fin;

INSERT INTO estudiantes (
  id, nombre, apellidos, codigo_estudiante, grado_id, seccion_id, estado
) VALUES
  ('50000000-0000-0000-0000-000000000001', 'Ana', 'García López', 'DEMO-001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'activo'),
  ('50000000-0000-0000-0000-000000000002', 'Bruno', 'Torres Ruiz', 'DEMO-002', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'activo'),
  ('50000000-0000-0000-0000-000000000003', 'Camila', 'Mendoza Díaz', 'DEMO-003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'activo'),
  ('50000000-0000-0000-0000-000000000004', 'Diego', 'Castro Pérez', 'DEMO-004', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'activo'),
  ('50000000-0000-0000-0000-000000000005', 'Elena', 'Vargas Soto', 'DEMO-005', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'activo'),
  ('50000000-0000-0000-0000-000000000006', 'Fabio', 'Ramos León', 'DEMO-006', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'activo'),
  ('50000000-0000-0000-0000-000000000007', 'Gabriela', 'Núñez Flores', 'DEMO-007', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'activo'),
  ('50000000-0000-0000-0000-000000000008', 'Hugo', 'Paredes Cruz', 'DEMO-008', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'activo')
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    apellidos = EXCLUDED.apellidos,
    codigo_estudiante = EXCLUDED.codigo_estudiante,
    grado_id = EXCLUDED.grado_id,
    seccion_id = EXCLUDED.seccion_id,
    estado = EXCLUDED.estado;

-- Permite recalcular los gráficos sin duplicar los registros de demostración.
DELETE FROM puntos_criticos
WHERE estudiante_id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000005',
  '50000000-0000-0000-0000-000000000006',
  '50000000-0000-0000-0000-000000000007',
  '50000000-0000-0000-0000-000000000008'
);

DELETE FROM evaluaciones_riesgo
WHERE estudiante_id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000005',
  '50000000-0000-0000-0000-000000000006',
  '50000000-0000-0000-0000-000000000007',
  '50000000-0000-0000-0000-000000000008'
);

DELETE FROM notas
WHERE estudiante_id IN (
  '50000000-0000-0000-0000-000000000001',
  '50000000-0000-0000-0000-000000000002',
  '50000000-0000-0000-0000-000000000003',
  '50000000-0000-0000-0000-000000000004',
  '50000000-0000-0000-0000-000000000005',
  '50000000-0000-0000-0000-000000000006',
  '50000000-0000-0000-0000-000000000007',
  '50000000-0000-0000-0000-000000000008'
);

-- 1) Datos para "Aprobados vs. desaprobados", "Promedio por curso"
--    y "Evolución del promedio".
INSERT INTO notas (estudiante_id, curso_id, periodo_id, nota, estado, fecha_registro)
SELECT
  e.id,
  c.id,
  p.id,
  ROUND(LEAST(20, GREATEST(0,
    CASE e.codigo_estudiante
      WHEN 'DEMO-001' THEN 17
      WHEN 'DEMO-002' THEN 15
      WHEN 'DEMO-003' THEN 13
      WHEN 'DEMO-004' THEN 10
      WHEN 'DEMO-005' THEN 18
      WHEN 'DEMO-006' THEN 12
      WHEN 'DEMO-007' THEN 9
      WHEN 'DEMO-008' THEN 14
    END
    + ((p.numero - 1) * 0.5)
    + CASE c.codigo
        WHEN 'MAT' THEN -1
        WHEN 'COM' THEN 0
        WHEN 'CYT' THEN 1
        WHEN 'ING' THEN 0.5
      END
  )), 1) AS nota,
  CASE
    WHEN (
      CASE e.codigo_estudiante
        WHEN 'DEMO-001' THEN 17
        WHEN 'DEMO-002' THEN 15
        WHEN 'DEMO-003' THEN 13
        WHEN 'DEMO-004' THEN 10
        WHEN 'DEMO-005' THEN 18
        WHEN 'DEMO-006' THEN 12
        WHEN 'DEMO-007' THEN 9
        WHEN 'DEMO-008' THEN 14
      END
      + ((p.numero - 1) * 0.5)
      + CASE c.codigo WHEN 'MAT' THEN -1 WHEN 'CYT' THEN 1 WHEN 'ING' THEN 0.5 ELSE 0 END
    ) >= 11 THEN 'aprobado'
    ELSE 'desaprobado'
  END,
  make_date(p.año, 3, 1) + ((p.numero - 1) * 90)
FROM estudiantes e
CROSS JOIN cursos c
CROSS JOIN periodos p
WHERE e.codigo_estudiante LIKE 'DEMO-%'
  AND c.codigo IN ('MAT', 'COM', 'CYT', 'ING')
  AND p.año = 2026;

-- 2) Datos para "Distribución de riesgo".
INSERT INTO evaluaciones_riesgo (
  estudiante_id, periodo_id, nivel_riesgo, promedio_general,
  cursos_desaprobados, notas_bajas, tendencia, fecha_evaluacion
)
SELECT
  e.id,
  p.id,
  CASE
    WHEN AVG(n.nota) >= 16 THEN 'bajo'
    WHEN AVG(n.nota) >= 14 THEN 'medio'
    WHEN AVG(n.nota) >= 11 AND COUNT(*) FILTER (WHERE n.nota < 11) > 0 THEN 'alto'
    WHEN AVG(n.nota) >= 11 THEN 'medio'
    ELSE 'crítico'
  END,
  ROUND(AVG(n.nota), 2),
  COUNT(*) FILTER (WHERE n.nota < 11),
  COUNT(*) FILTER (WHERE n.nota >= 11 AND n.nota < 14),
  CASE WHEN p.numero = 1 THEN 'sin_datos' ELSE 'estable' END,
  make_date(p.año, 3, 1) + ((p.numero - 1) * 90)
FROM estudiantes e
JOIN notas n ON n.estudiante_id = e.id
JOIN periodos p ON p.id = n.periodo_id
WHERE e.codigo_estudiante LIKE 'DEMO-%'
GROUP BY e.id, p.id, p.numero, p.año;

-- Algunos puntos críticos para que el contador del Dashboard también tenga datos.
INSERT INTO puntos_criticos (
  tipo, descripcion, estudiante_id, severidad, fecha_deteccion, resuelta
)
SELECT
  'estudiante_riesgo',
  e.nombre || ' ' || e.apellidos || ' requiere seguimiento académico',
  e.id,
  'alta',
  NOW(),
  FALSE
FROM estudiantes e
WHERE e.codigo_estudiante IN ('DEMO-004', 'DEMO-007');

COMMIT;
