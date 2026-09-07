import { supabase } from './supabaseClient'

export const riesgoService = {
  // Calcula el nivel de riesgo basado en notas
  calcularNivelRiesgo(notas) {
    if (!notas || notas.length === 0) return 'sin_datos'

    const notasArray = notas.map(n => n.nota)
    const promedio = notasArray.reduce((sum, n) => sum + n, 0) / notasArray.length
    const desaprobados = notasArray.filter(n => n < 11).length
    const bajas = notasArray.filter(n => n >= 11 && n < 14).length

    // Lógica simple de clasificación
    if (promedio >= 16) return 'bajo'
    if (promedio >= 14) return 'medio'
    if (promedio >= 11) {
      return desaprobados > 0 ? 'alto' : 'medio'
    }
    return 'crítico'
  },

  // Determina la tendencia del rendimiento
  determinarTendencia(notasActual, notasAnterior) {
    if (!notasActual || notasActual.length === 0) return 'sin_datos'
    if (!notasAnterior || notasAnterior.length === 0) return 'estable'

    const promedioActual = notasActual.reduce((sum, n) => sum + n.nota, 0) / notasActual.length
    const promedioAnterior = notasAnterior.reduce((sum, n) => sum + n.nota, 0) / notasAnterior.length

    const diferencia = promedioActual - promedioAnterior

    if (diferencia > 1) return 'mejorando'
    if (diferencia < -1) return 'empeorando'
    return 'estable'
  },

  async evaluarEstudiante(estudianteId, periodoId, notas) {
    const promedio = notas.length > 0
      ? Math.round((notas.reduce((sum, n) => sum + n.nota, 0) / notas.length) * 100) / 100
      : 0

    const cursosDesaprobados = notas.filter(n => n.nota < 11).length
    const notasBajas = notas.filter(n => n.nota >= 11 && n.nota < 14).length
    const nivelRiesgo = this.calcularNivelRiesgo(notas)

    const { data, error } = await supabase
      .from('evaluaciones_riesgo')
      .insert([{
        estudiante_id: estudianteId,
        periodo_id: periodoId,
        nivel_riesgo: nivelRiesgo,
        promedio_general: promedio,
        cursos_desaprobados: cursosDesaprobados,
        notas_bajas: notasBajas,
        tendencia: 'sin_datos',
        fecha_evaluacion: new Date().toISOString()
      }])
      .select()

    return { data, error }
  },

  async getEvaluacionesEstudiante(estudianteId) {
    const { data, error } = await supabase
      .from('evaluaciones_riesgo')
      .select('*, periodos(nombre)')
      .eq('estudiante_id', estudianteId)
      .order('fecha_evaluacion', { ascending: false })
    return { data, error }
  },

  async getEvaluacionesPeriodo(periodoId) {
    const { data, error } = await supabase
      .from('evaluaciones_riesgo')
      .select(`
        *,
        estudiantes(nombre, apellidos, codigo_estudiante, grados(nombre), secciones(nombre))
      `)
      .eq('periodo_id', periodoId)
      .order('fecha_evaluacion', { ascending: false })
    return { data, error }
  },

  async getEstudiantesPorNivelRiesgo(periodoId, nivelRiesgo) {
    const { data, error } = await supabase
      .from('evaluaciones_riesgo')
      .select(`
        *,
        estudiantes(nombre, apellidos, codigo_estudiante, grados(nombre), secciones(nombre))
      `)
      .eq('periodo_id', periodoId)
      .eq('nivel_riesgo', nivelRiesgo)
      .order('promedio_general', { ascending: true })
    return { data, error }
  },

  async getResumenRiesgoPeriodo(periodoId) {
    const { data, error } = await supabase
      .from('evaluaciones_riesgo')
      .select('nivel_riesgo')
      .eq('periodo_id', periodoId)

    if (error || !data) {
      return { resumen: {}, error }
    }

    const resumen = {
      bajo: data.filter(e => e.nivel_riesgo === 'bajo').length,
      medio: data.filter(e => e.nivel_riesgo === 'medio').length,
      alto: data.filter(e => e.nivel_riesgo === 'alto').length,
      crítico: data.filter(e => e.nivel_riesgo === 'crítico').length,
      total: data.length
    }

    return { resumen, error: null }
  },

  async getUltimaEvaluacionEstudiante(estudianteId) {
    const { data, error } = await supabase
      .from('evaluaciones_riesgo')
      .select('*')
      .eq('estudiante_id', estudianteId)
      .order('fecha_evaluacion', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  }
}
