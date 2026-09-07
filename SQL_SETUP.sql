-- Script SQL para crear las tablas en Supabase PostgreSQL
-- Ejecuta esto en el SQL Editor de Supabase

-- 1. Tabla de Grados
CREATE TABLE grados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  nivel INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabla de Secciones
CREATE TABLE secciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  grado_id UUID NOT NULL REFERENCES grados(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabla de Cursos
CREATE TABLE cursos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  codigo VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 4. Tabla de Períodos
CREATE TABLE periodos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  numero INT,
  año INT,
  fecha_inicio DATE,
  fecha_fin DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Tabla de Estudiantes
CREATE TABLE estudiantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR NOT NULL,
  apellidos VARCHAR NOT NULL,
  codigo_estudiante VARCHAR UNIQUE NOT NULL,
  grado_id UUID NOT NULL REFERENCES grados(id) ON DELETE CASCADE,
  seccion_id UUID NOT NULL REFERENCES secciones(id) ON DELETE CASCADE,
  estado VARCHAR DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Tabla de Notas
CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
  nota DECIMAL(3,1) NOT NULL,
  estado VARCHAR DEFAULT 'sin_calificar',
  fecha_registro TIMESTAMP DEFAULT NOW(),
  docente_id UUID
);

-- 7. Tabla de Evaluaciones de Riesgo
CREATE TABLE evaluaciones_riesgo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
  periodo_id UUID NOT NULL REFERENCES periodos(id) ON DELETE CASCADE,
  nivel_riesgo VARCHAR,
  promedio_general DECIMAL(4,2),
  cursos_desaprobados INT DEFAULT 0,
  notas_bajas INT DEFAULT 0,
  tendencia VARCHAR DEFAULT 'sin_datos',
  fecha_evaluacion TIMESTAMP DEFAULT NOW()
);

-- 8. Tabla de Puntos Críticos
CREATE TABLE puntos_criticos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR,
  descripcion TEXT,
  estudiante_id UUID REFERENCES estudiantes(id) ON DELETE CASCADE,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  grado_id UUID REFERENCES grados(id) ON DELETE CASCADE,
  severidad VARCHAR,
  fecha_deteccion TIMESTAMP DEFAULT NOW(),
  resuelta BOOLEAN DEFAULT FALSE
);

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_estudiantes_grado_id ON estudiantes(grado_id);
CREATE INDEX idx_estudiantes_seccion_id ON estudiantes(seccion_id);
CREATE INDEX idx_notas_estudiante_id ON notas(estudiante_id);
CREATE INDEX idx_notas_curso_id ON notas(curso_id);
CREATE INDEX idx_notas_periodo_id ON notas(periodo_id);
CREATE INDEX idx_evaluaciones_estudiante_id ON evaluaciones_riesgo(estudiante_id);
CREATE INDEX idx_evaluaciones_periodo_id ON evaluaciones_riesgo(periodo_id);

-- Habilitare RLS (Row Level Security) para seguridad
ALTER TABLE grados ENABLE ROW LEVEL SECURITY;
ALTER TABLE secciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_riesgo ENABLE ROW LEVEL SECURITY;
ALTER TABLE puntos_criticos ENABLE ROW LEVEL SECURITY;

-- Crear policies (permiten acceso a usuarios autenticados)
CREATE POLICY "Allow authenticated users to read all data" ON grados
  FOR SELECT USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to insert grados" ON grados
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to update grados" ON grados
  FOR UPDATE USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to delete grados" ON grados
  FOR DELETE USING (auth.role() = 'authenticated_user');

-- Aplicar políticas similares a otras tablas
CREATE POLICY "Allow authenticated users to read all data" ON secciones
  FOR SELECT USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to insert" ON secciones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to update" ON secciones
  FOR UPDATE USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to delete" ON secciones
  FOR DELETE USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to read all data" ON cursos
  FOR SELECT USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to insert" ON cursos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to update" ON cursos
  FOR UPDATE USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to delete" ON cursos
  FOR DELETE USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to read all data" ON periodos
  FOR SELECT USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to insert" ON periodos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to update" ON periodos
  FOR UPDATE USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to delete" ON periodos
  FOR DELETE USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to read all data" ON estudiantes
  FOR SELECT USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to insert" ON estudiantes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to update" ON estudiantes
  FOR UPDATE USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to delete" ON estudiantes
  FOR DELETE USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to read all data" ON notas
  FOR SELECT USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to insert" ON notas
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to update" ON notas
  FOR UPDATE USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to delete" ON notas
  FOR DELETE USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to read all data" ON evaluaciones_riesgo
  FOR SELECT USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to insert" ON evaluaciones_riesgo
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to update" ON evaluaciones_riesgo
  FOR UPDATE USING (auth.role() = 'authenticated_user');

CREATE POLICY "Allow authenticated users to read all data" ON puntos_criticos
  FOR SELECT USING (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to insert" ON puntos_criticos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated_user');
CREATE POLICY "Allow authenticated users to update" ON puntos_criticos
  FOR UPDATE USING (auth.role() = 'authenticated_user');

-- Datos de ejemplo (opcional)
-- INSERT INTO grados (nombre, nivel) VALUES
-- ('1.º', 1),
-- ('2.º', 2),
-- ('3.º', 3),
-- ('4.º', 4),
-- ('5.º', 5);

-- INSERT INTO cursos (nombre, codigo) VALUES
-- ('Matemática', 'MAT'),
-- ('Comunicación', 'COM'),
-- ('Ciencia y Tecnología', 'CYT'),
-- ('Inglés', 'ING'),
-- ('Historia', 'HIS');
