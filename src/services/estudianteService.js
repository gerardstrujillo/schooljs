import { supabase } from './supabaseClient'

export const estudianteService = {
  async getAll() {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*, grados(nombre), secciones(nombre)')
      .order('nombre', { ascending: true })
    return { data, error }
  },

  async getByGradoSeccion(gradoId, seccionId) {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*, grados(nombre), secciones(nombre)')
      .eq('grado_id', gradoId)
      .eq('seccion_id', seccionId)
      .eq('estado', 'activo')
      .order('nombre', { ascending: true })
    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*, grados(nombre), secciones(nombre)')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async search(query) {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*, grados(nombre), secciones(nombre)')
      .or(`nombre.ilike.%${query}%,apellidos.ilike.%${query}%,codigo_estudiante.ilike.%${query}%`)
      .order('nombre', { ascending: true })
    return { data, error }
  },

  async create(nombre, apellidos, codigoEstudiante, gradoId, seccionId) {
    const { data, error } = await supabase
      .from('estudiantes')
      .insert([{
        nombre,
        apellidos,
        codigo_estudiante: codigoEstudiante,
        grado_id: gradoId,
        seccion_id: seccionId,
        estado: 'activo'
      }])
      .select()
    return { data, error }
  },

  async update(id, nombre, apellidos, codigoEstudiante, gradoId, seccionId, estado) {
    const { data, error } = await supabase
      .from('estudiantes')
      .update({
        nombre,
        apellidos,
        codigo_estudiante: codigoEstudiante,
        grado_id: gradoId,
        seccion_id: seccionId,
        estado
      })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('estudiantes')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  async getTotalCount() {
    const { count, error } = await supabase
      .from('estudiantes')
      .select('*', { count: 'exact', head: true })
    return { count, error }
  },

  async getByEstado(estado) {
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*')
      .eq('estado', estado)
    return { data, error }
  }
}
