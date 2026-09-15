import { supabase } from './supabaseClient'
import { notasService } from './notasService'

export const criticalPointsService = {
  async detectarPuntosCriticos(periodoId) {
    const puntosCriticos = []

    // 1. Estudiantes con promedio muy bajo
    const { data: evaluaciones } = await supabase
      .from('evaluaciones_riesgo')
      .select('*, estudiantes(nombre, apellidos, codigo_estudiante)')
      .eq('periodo_id', periodoId)
      .lt('promedio_general', 11)

    if (evaluaciones) {
      evaluaciones.forEach(e => {
        puntosCriticos.push({
          tipo: 'estudiante_riesgo',
          descripcion: `${e.estudiantes.nombre} ${e.estudiantes.apellidos} está por debajo de la nota aprobatoria (${e.promedio_general})`,
          estudiante_id: e.estudiante_id,
          severidad: 'alta',
          periodo_id: periodoId
        })
      })
    }

    // 2. Cursos con alto índice de desaprobados
    const { data: cursos } = await supabase
      .from('cursos')
      .select('*')

    if (cursos) {
      for (const curso of cursos) {
        const { data: notasCurso } = await supabase
          .from('notas')
          .select('*')
          .eq('curso_id', curso.id)
          .eq('periodo_id', periodoId)

        if (notasCurso && notasCurso.length > 0) {
          const desaprobados = notasCurso.filter(n => n.nota < 11).length
          const porcentajeDesaprobados = (desaprobados / notasCurso.length) * 100

          if (porcentajeDesaprobados > 30) {
            puntosCriticos.push({
              tipo: 'curso_bajo_rendimiento',
              descripcion: `El curso "${curso.nombre}" tiene ${porcentajeDesaprobados.toFixed(1)}% de desaprobados (${desaprobados}/${notasCurso.length})`,
              curso_id: curso.id,
              severidad: 'media',
              periodo_id: periodoId
            })
          }
        }
      }
    }

    return puntosCriticos
  },

  async guardarPuntosCriticos(puntosCriticos, resuelta = false) {
    if (puntosCriticos.length === 0) return { data: [], error: null }

    const { data, error } = await supabase
      .from('puntos_criticos')
      .insert(puntosCriticos.map(p => ({
        tipo: p.tipo,
        descripcion: p.descripcion,
        estudiante_id: p.estudiante_id || null,
        curso_id: p.curso_id || null,
        grado_id: p.grado_id || null,
        severidad: p.severidad,
        fecha_deteccion: new Date().toISOString(),
        resuelta
      })))
      .select()

    return { data, error }
  },

  async getAll() {
    const { data, error } = await supabase
      .from('puntos_criticos')
      .select(`
        *,
        estudiantes(nombre, apellidos, codigo_estudiante),
        cursos(nombre)
      `)
      .eq('resuelta', false)
      .order('fecha_deteccion', { ascending: false })
    return { data, error }
  },

  async getPorTipo(tipo) {
    const { data, error } = await supabase
      .from('puntos_criticos')
      .select(`
        *,
        estudiantes(nombre, apellidos, codigo_estudiante),
        cursos(nombre)
      `)
      .eq('tipo', tipo)
      .eq('resuelta', false)
    return { data, error }
  },

  async marcarResuelto(id) {
    const { data, error } = await supabase
      .from('puntos_criticos')
      .update({ resuelta: true })
      .eq('id', id)
      .select()
    return { data, error }
  },

  async eliminar(id) {
    const { data, error } = await supabase
      .from('puntos_criticos')
      .delete()
      .eq('id', id)
    return { data, error }
  },

  async getResumenPuntosCriticos() {
    const { data, error } = await supabase
      .from('puntos_criticos')
      .select('tipo, severidad')
      .eq('resuelta', false)

    if (error || !data) {
      return { resumen: {}, error }
    }

    const resumen = {
      total: data.length,
      estudiantes_riesgo: data.filter(p => p.tipo === 'estudiante_riesgo').length,
      cursos_bajo_rendimiento: data.filter(p => p.tipo === 'curso_bajo_rendimiento').length,
      alta_severidad: data.filter(p => p.severidad === 'alta').length
    }

    return { resumen, error: null }
  }
}
