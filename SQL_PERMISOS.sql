-- Script SQL para otorgar permisos al rol authenticated
-- Ejecuta esto en Supabase SQL Editor

-- Otorgar permisos SELECT, INSERT, UPDATE, DELETE en todas las tablas
GRANT SELECT, INSERT, UPDATE, DELETE ON public.grados TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cursos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.periodos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.estudiantes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluaciones_riesgo TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.puntos_criticos TO authenticated;

-- Otorgar permisos en secuencias (para auto-increment si los hay)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Opcional: Si quieres deshabilitar RLS temporalmente (más permisivo pero menos seguro)
-- Descomenta estas líneas si necesitas acceso total:
/*
ALTER TABLE grados DISABLE ROW LEVEL SECURITY;
ALTER TABLE secciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE cursos DISABLE ROW LEVEL SECURITY;
ALTER TABLE periodos DISABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes DISABLE ROW LEVEL SECURITY;
ALTER TABLE notas DISABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones_riesgo DISABLE ROW LEVEL SECURITY;
ALTER TABLE puntos_criticos DISABLE ROW LEVEL SECURITY;
*/

-- Crear políticas más simples (permiten acceso a cualquier usuario autenticado)
-- Nota: Primero elimina las políticas antiguas si existen

-- Para grados
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON grados;
DROP POLICY IF EXISTS "Allow authenticated users to insert grados" ON grados;
DROP POLICY IF EXISTS "Allow authenticated users to update grados" ON grados;
DROP POLICY IF EXISTS "Allow authenticated users to delete grados" ON grados;

CREATE POLICY "grados_select" ON grados FOR SELECT USING (true);
CREATE POLICY "grados_insert" ON grados FOR INSERT WITH CHECK (true);
CREATE POLICY "grados_update" ON grados FOR UPDATE USING (true);
CREATE POLICY "grados_delete" ON grados FOR DELETE USING (true);

-- Para secciones
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON secciones;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON secciones;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON secciones;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON secciones;

CREATE POLICY "secciones_select" ON secciones FOR SELECT USING (true);
CREATE POLICY "secciones_insert" ON secciones FOR INSERT WITH CHECK (true);
CREATE POLICY "secciones_update" ON secciones FOR UPDATE USING (true);
CREATE POLICY "secciones_delete" ON secciones FOR DELETE USING (true);

-- Para cursos
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON cursos;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON cursos;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON cursos;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON cursos;

CREATE POLICY "cursos_select" ON cursos FOR SELECT USING (true);
CREATE POLICY "cursos_insert" ON cursos FOR INSERT WITH CHECK (true);
CREATE POLICY "cursos_update" ON cursos FOR UPDATE USING (true);
CREATE POLICY "cursos_delete" ON cursos FOR DELETE USING (true);

-- Para periodos
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON periodos;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON periodos;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON periodos;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON periodos;

CREATE POLICY "periodos_select" ON periodos FOR SELECT USING (true);
CREATE POLICY "periodos_insert" ON periodos FOR INSERT WITH CHECK (true);
CREATE POLICY "periodos_update" ON periodos FOR UPDATE USING (true);
CREATE POLICY "periodos_delete" ON periodos FOR DELETE USING (true);

-- Para estudiantes
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON estudiantes;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON estudiantes;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON estudiantes;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON estudiantes;

CREATE POLICY "estudiantes_select" ON estudiantes FOR SELECT USING (true);
CREATE POLICY "estudiantes_insert" ON estudiantes FOR INSERT WITH CHECK (true);
CREATE POLICY "estudiantes_update" ON estudiantes FOR UPDATE USING (true);
CREATE POLICY "estudiantes_delete" ON estudiantes FOR DELETE USING (true);

-- Para notas
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON notas;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON notas;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON notas;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON notas;

CREATE POLICY "notas_select" ON notas FOR SELECT USING (true);
CREATE POLICY "notas_insert" ON notas FOR INSERT WITH CHECK (true);
CREATE POLICY "notas_update" ON notas FOR UPDATE USING (true);
CREATE POLICY "notas_delete" ON notas FOR DELETE USING (true);

-- Para evaluaciones_riesgo
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON evaluaciones_riesgo;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON evaluaciones_riesgo;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON evaluaciones_riesgo;

CREATE POLICY "evaluaciones_riesgo_select" ON evaluaciones_riesgo FOR SELECT USING (true);
CREATE POLICY "evaluaciones_riesgo_insert" ON evaluaciones_riesgo FOR INSERT WITH CHECK (true);
CREATE POLICY "evaluaciones_riesgo_update" ON evaluaciones_riesgo FOR UPDATE USING (true);

-- Para puntos_criticos
DROP POLICY IF EXISTS "Allow authenticated users to read all data" ON puntos_criticos;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON puntos_criticos;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON puntos_criticos;

CREATE POLICY "puntos_criticos_select" ON puntos_criticos FOR SELECT USING (true);
CREATE POLICY "puntos_criticos_insert" ON puntos_criticos FOR INSERT WITH CHECK (true);
CREATE POLICY "puntos_criticos_update" ON puntos_criticos FOR UPDATE USING (true);
