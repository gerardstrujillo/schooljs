import { supabase } from './supabaseClient'

export const notasService = {
  async getAll() {
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        estudiantes(nombre, apellidos, codigo_estudiante, grados(nombre), secciones(nombre)),
        cursos(nombre),
        periodos(nombre)
      `)
      .order('fecha_registro', { ascending: false })
    return { data, error }
  },

  async getByEstudiante(estudianteId) {
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        cursos(nombre),
        periodos(nombre)
      `)
      .eq('estudiante_id', estudianteId)
      .order('fecha_registro', { ascending: false })
    return { data, error }
  },

  async getByGradoSeccionCurso(gradoId, seccionId, cursoId, periodoId) {
    const { data, error } = await supabase
      .from('notas')
      .select(`
        *,
        estudiantes(nombre, apellidos, codigo_estudiante)
      `)
      .eq('curso_id', cursoId)
      .eq('periodo_id', periodoId)
      .order('fecha_registro', { ascending: false })

    if (data && gradoId && seccionId) {
      return { data: data.filter(n =>
        n.estudiantes &&
        n.estudiantes.grado_id === gradoId &&
        n.estudiantes.seccion_id === seccionId
      ), error }
    }

    return { data, error }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('notas')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  },

  async create(estudianteId, cursoId, periodoId, nota, docenteId) {
    const estado = nota >= 11 ? 'aprobado' : 'desaprobado'
    const { data, error } = await supabase
      .from('notas')
      .insert([{
        estudiante_id: estudianteId,
        curso_id: cursoId,
        periodo_id: periodoId,
        nota,
        estado,
        docente_id: docenteId,
        fecha_registro: new Date().toISOString()
      }])
      .select()
    return { data, error }
  },

  async update(id, nota) {
    const estado = nota >= 11 ? 'aprobado' : 'desaprobado'
    const { data, error } = await supabase
      .from('notas')
      .update({ nota, estado })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('notas')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  async getNotasByEstudianteYPeriodo(estudianteId, periodoId) {
    const { data, error } = await supabase
      .from('notas')
      .select('*, cursos(nombre)')
      .eq('estudiante_id', estudianteId)
      .eq('periodo_id', periodoId)
    return { data, error }
  },

  async existeNota(estudianteId, cursoId, periodoId) {
    const { data, error } = await supabase
      .from('notas')
      .select('id')
      .eq('estudiante_id', estudianteId)
      .eq('curso_id', cursoId)
      .eq('periodo_id', periodoId)
      .single()
    return { data, error }
  },

  async getPromedioEstudiante(estudianteId, periodoId) {
    const { data, error } = await supabase
      .from('notas')
      .select('nota')
      .eq('estudiante_id', estudianteId)
      .eq('periodo_id', periodoId)

    if (error || !data || data.length === 0) {
      return { promedio: 0, error }
    }

    const promedio = data.reduce((sum, n) => sum + n.nota, 0) / data.length
    return { promedio: Math.round(promedio * 100) / 100, error: null }
  }
}
