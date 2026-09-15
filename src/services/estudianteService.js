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

  async create(nombre, apellidos, gradoId, seccionId) {
    for (let intento = 0; intento < 5; intento += 1) {
      const { data: estudiantes, error: consultaError } = await supabase
        .from('estudiantes')
        .select('codigo_estudiante')

      if (consultaError) return { data: null, error: consultaError }

      const siguienteNumero = (estudiantes || []).reduce((maximo, estudiante) => {
        const coincidencia = String(estudiante.codigo_estudiante || '').match(/^EST-(\d+)$/i)
        return coincidencia ? Math.max(maximo, Number(coincidencia[1])) : maximo
      }, 0) + 1
      const codigoEstudiante = `EST-${String(siguienteNumero).padStart(3, '0')}`

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

      if (!error || error.code !== '23505') return { data, error }
    }

    return {
      data: null,
      error: new Error('No se pudo generar un código único. Intenta nuevamente.')
    }
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
