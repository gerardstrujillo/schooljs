import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const allowedMethods = ['POST']
const maxQuestionLength = 500

const schemaContext = `
INSTRUCCIONES PARA EL ASISTENTE ACADÉMICO - VERSIÓN MEJORADA:

1. IDENTIDAD Y TONO:
   - Eres el asistente académico de una institución educativa.
   - Responde en español, de forma clara, breve y profesional.
   - Mantén contexto de la conversación anterior.
   - Sé amable pero directo.

2. CONTEXTO CONVERSACIONAL:
   - Si el usuario pregunta sobre un estudiante o curso mencionado antes, recuerda ese contexto.
   - Usa información previa para dar respuestas más precisas y conectadas.
   - Si preguntan "Con qué nota está desaprobado" tras preguntar por desaprobados, proporciona esas notas.

3. CÓMO RESPONDER:
   - Usa ÚNICAMENTE los datos entregados. No inventes información.
   - Si no hay datos para responder, dilo explícitamente (sin "datos proporcionados").
   - Proporciona números exactos, incluyendo notas específicas.
   - Cuando pregunten por notas de un estudiante específico, busca variaciones del nombre.

4. PREGUNTAS COMUNES Y RESPUESTAS ESPERADAS:

   a) "¿Quién está desaprobado en [CURSO]?"
      → Lista: "Nombre Apellidos (nota: X.X) en [Curso]"
      → Incluye la nota específica
   
   b) "¿Con qué nota están desaprobados?"
      → Lista cada estudiante con su nota: "Nombre: X.X, Nombre: Y.Y"
   
   c) "[Estudiante] qué notas tiene?"
      → Busca por nombre similar (tolerancia a errores)
      → Lista todas sus notas por curso con el período
      → Incluye su promedio
   
   d) "¿Cuántos estudiantes desaprobados?"
      → Número + contexto: "X estudiantes tienen al menos una nota <11"
   
   e) "¿Promedio por curso?" → Tabla o lista curso: promedio
   
   f) "¿Riesgo académico?" → Divide en riesgo alto y medio con estudiantes

5. MANEJO DE CURSOS:
   - Reconoce nombres comunes: "mate" = Matemática, "calculo" = Cálculo, etc.
   - Busca por coincidencia parcial en nombre del curso.
   - Si no encuentra el curso exacto, sugiere opciones disponibles.

6. BÚSQUEDA DE ESTUDIANTES:
   - Permite variaciones: "juan" = "Juan", "perez" = "Pérez"
   - Busca por código o nombre parcial si no encuentra exacto.
   - Si hay múltiples coincidencias, lista todas.

7. FORMATO DE RESPUESTA:
   - Sé conciso pero completo (1-4 oraciones máximo).
   - Lista con viñetas cuando hay múltiples items.
   - Incluye siempre: nombre, apellido, nota/valor relevante, curso/contexto.
   - Si el dato es 0 o no existe, sé explícito: "No hay estudiantes..." en lugar de "Los datos no..."

8. NUNCA HAGAS:
   - No inventes notas ni datos.
   - No reveles información técnica.
   - No hagas suposiciones sin datos.
   - No digas "datos proporcionados indican" - da directamente la respuesta.
`

const average = (values) => {
  if (!values.length) return null
  return Number((values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length).toFixed(2))
}

const questionTerms = (question) => question
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .split(/[^a-z0-9]+/)
  .filter((term) => term.length > 3)

const compactData = ({ estudiantes, notas, cursos, periodos, riesgos, puntosCriticos }, question) => {
  const studentRows = estudiantes.data || []
  const noteRows = notas.data || []
  const riskRows = riesgos.data || []
  const criticalRows = puntosCriticos.data || []
  const terms = questionTerms(question)
  
  const asksForStudentNames = terms.some((term) =>
    ['nombre', 'nombres', 'quien', 'quienes'].includes(term)
  )
  const asksAboutFailingStudents = terms.some((term) =>
    term.startsWith('desaprob') || term.startsWith('reprob')
  )
  const asksAboutRisk = terms.some((term) =>
    ['riesgo', 'critico', 'alerta', 'peligro'].includes(term)
  )
  const asksAboutCourse = terms.some((term) => {
    const courseAliases = {
      'mate': ['matemática', 'matematica', 'calculo'],
      'espa': ['español', 'lengua', 'literatura'],
      'ingle': ['inglés', 'english'],
      'cien': ['ciencia', 'fisica', 'biologia', 'quimica'],
      'histo': ['historia', 'social'],
      'artes': ['arte', 'musica', 'educacion']
    }
    return Object.values(courseAliases).flat().some(alias => term.includes(alias))
  })
  const askForSpecificStudent = noteRows.length > 0 && terms.length >= 2
  const includeAllStudents = asksForStudentNames && !asksAboutFailingStudents
  
  const matchesQuestion = (value) => {
    const text = String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return terms.some((term) => text.includes(term))
  }

  const matchingStudents = studentRows
    .filter((student) => includeAllStudents || (!asksAboutFailingStudents && matchesQuestion(
      `${student.nombre} ${student.apellidos} ${student.codigo_estudiante}`.toLowerCase()
    )))
    .slice(0, includeAllStudents ? 1000 : 30)
    .map((student) => ({
      nombre: student.nombre,
      apellidos: student.apellidos,
      codigo_estudiante: student.codigo_estudiante,
      grado: student.grados?.nombre || null,
      seccion: student.secciones?.nombre || null,
      estado: student.estado
    }))

  // Notas desaprobadas con detalle completo
  const notasDesaprobadas = noteRows
    .filter((note) => Number(note.nota) < 11 || note.estado === 'desaprobado')
    .map((note) => ({
      estudiante: note.estudiantes
        ? {
            nombre: note.estudiantes.nombre,
            apellidos: note.estudiantes.apellidos,
            codigo_estudiante: note.estudiantes.codigo_estudiante
          }
        : null,
      curso: note.cursos?.nombre || null,
      periodo: note.periodos?.nombre || null,
      nota: note.nota
    }))
    .sort((a, b) => (a.estudiante?.nombre || '').localeCompare(b.estudiante?.nombre || ''))

  // Desaprobados por curso específico si se pregunta
  const notasDesaprobadaPorCurso = asksAboutCourse ? noteRows
    .filter((note) => Number(note.nota) < 11 && matchesQuestion(note.cursos?.nombre || ''))
    .map((note) => ({
      estudiante: note.estudiantes
        ? {
            nombre: note.estudiantes.nombre,
            apellidos: note.estudiantes.apellidos,
            codigo_estudiante: note.estudiantes.codigo_estudiante
          }
        : null,
      curso: note.cursos?.nombre || null,
      nota: note.nota,
      periodo: note.periodos?.nombre || null
    })) : []

  const estudiantesDesaprobados = Array.from(
    new Map(
      notasDesaprobadas
        .filter((note) => note.estudiante)
        .map((note) => [
          note.estudiante.codigo_estudiante || `${note.estudiante.nombre}-${note.estudiante.apellidos}`,
          note.estudiante
        ])
    ).values()
  )

  // Búsqueda flexible de estudiante específico
  const studentSearch = askForSpecificStudent ? studentRows
    .map(s => ({
      ...s,
      searchKey: `${s.nombre} ${s.apellidos} ${s.codigo_estudiante}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }))
    .filter(s => {
      const allTerms = terms.join(' ')
      const ratio = allTerms.split('').filter(c => s.searchKey.includes(c)).length / Math.max(allTerms.length, 1)
      return ratio > 0.5 || s.searchKey.includes(allTerms.replace(/\s/g, ''))
    })
    .slice(0, 5) : []

  // Notas del estudiante específico si se pregunta
  const studentNotesDetail = studentSearch.length > 0 ? studentSearch.map(student => ({
    estudiante: student,
    notas: noteRows
      .filter(n => n.estudiante_id === student.id || n.estudiantes?.nombre === student.nombre)
      .map(n => ({
        curso: n.cursos?.nombre,
        nota: n.nota,
        periodo: n.periodos?.nombre,
        estado: n.nota < 11 ? 'desaprobado' : 'aprobado'
      }))
  })) : []

  const notasAprobadas = noteRows
    .filter((note) => Number(note.nota) >= 11 && note.estado !== 'desaprobado')
  
  const estudiantesAprobados = Array.from(
    new Map(
      notasAprobadas
        .filter((note) => note.estudiantes)
        .map((note) => [
          note.estudiantes.codigo_estudiante || `${note.estudiantes.nombre}-${note.estudiantes.apellidos}`,
          {
            nombre: note.estudiantes.nombre,
            apellidos: note.estudiantes.apellidos,
            codigo_estudiante: note.estudiantes.codigo_estudiante
          }
        ])
    ).values()
  )

  const notesByCourse = {}
  noteRows.forEach((note) => {
    const course = note.cursos?.nombre || 'Sin curso'
    notesByCourse[course] ||= []
    notesByCourse[course].push(note.nota)
  })

  const riskCounts = riskRows.reduce((counts, risk) => {
    const level = risk.nivel_riesgo || 'sin_datos'
    counts[level] = (counts[level] || 0) + 1
    return counts
  }, {})

  const riesgoAlto = riskRows.filter((r) => r.nivel_riesgo === 'alto').map((r) => ({
    estudiante: r.estudiantes ? {
      nombre: r.estudiantes.nombre,
      apellidos: r.estudiantes.apellidos,
      codigo_estudiante: r.estudiantes.codigo_estudiante
    } : null,
    promedio: r.promedio_general,
    periodo: r.periodos?.nombre || null
  }))

  const riesgoMedio = riskRows.filter((r) => r.nivel_riesgo === 'medio').map((r) => ({
    estudiante: r.estudiantes ? {
      nombre: r.estudiantes.nombre,
      apellidos: r.estudiantes.apellidos,
      codigo_estudiante: r.estudiantes.codigo_estudiante
    } : null,
    promedio: r.promedio_general,
    periodo: r.periodos?.nombre || null
  }))

  return {
    resumen: {
      total_estudiantes: studentRows.length,
      estudiantes_activos: studentRows.filter((student) => student.estado === 'activo').length,
      total_notas: noteRows.length,
      promedio_general: average(noteRows.map((note) => note.nota)),
      notas_desaprobadas: notasDesaprobadas.length,
      notas_aprobadas: notasAprobadas.length,
      estudiantes_desaprobados: estudiantesDesaprobados.length,
      estudiantes_aprobados: estudiantesAprobados.length,
      total_cursos: cursos.data?.length || 0,
      total_periodos: periodos.data?.length || 0,
      evaluaciones_por_riesgo: riskCounts,
      puntos_criticos_pendientes: criticalRows.filter((point) => !point.resuelta).length,
      porcentaje_aprobacion: (notasAprobadas.length / (notasAprobadas.length + notasDesaprobadas.length) * 100).toFixed(1) + '%'
    },
    cursos: cursos.data || [],
    periodos: periodos.data || [],
    promedio_por_curso: Object.fromEntries(
      Object.entries(notesByCourse).map(([course, values]) => [course, average(values)])
    ),
    notas_desaprobadas: notasDesaprobadas,
    notas_desaprobadas_por_curso: notasDesaprobadaPorCurso,
    notas_aprobadas: notasAprobadas,
    estudiantes_desaprobados: estudiantesDesaprobados,
    estudiantes_aprobados: estudiantesAprobados,
    estudiante_detalle: studentNotesDetail,
    riesgo_alto: riesgoAlto,
    riesgo_medio: riesgoMedio,
    estudiantes_relacionados: matchingStudents,
    riesgos_relevantes: riskRows
      .filter((risk) => matchesQuestion(`${risk.nivel_riesgo} ${risk.estudiantes?.nombre} ${risk.estudiantes?.apellidos}`) || asksAboutRisk)
      .slice(0, 50),
    puntos_criticos_relevantes: criticalRows
      .filter((point) => matchesQuestion(`${point.tipo} ${point.descripcion} ${point.severidad} ${point.estudiantes?.nombre}`) || asksAboutRisk)
      .slice(0, 30)
  }
}

const jsonResponse = (body, status = 200) => ({
  statusCode: status,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  },
  body: JSON.stringify(body)
})

async function executeAssistant(event) {
  if (event.httpMethod === 'OPTIONS') {
    return jsonResponse({}, 204)
  }

  if (!allowedMethods.includes(event.httpMethod)) {
    return jsonResponse({ error: 'Método no permitido.' }, 405)
  }

  const authorization = event.headers?.authorization || event.headers?.Authorization
  const token = authorization?.replace(/^Bearer\s+/i, '')
  if (!token) {
    return jsonResponse({ error: 'Debes iniciar sesión para usar el asistente.' }, 401)
  }

  let body
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return jsonResponse({ error: 'La solicitud no tiene un formato válido.' }, 400)
  }

  const question = typeof body.question === 'string' ? body.question.trim() : ''
  if (!question || question.length > maxQuestionLength) {
    return jsonResponse({ error: 'La pregunta es obligatoria y debe tener como máximo 500 caracteres.' }, 400)
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey || !process.env.GROQ_API_KEY) {
    console.error('Faltan variables de entorno para el asistente.')
    return jsonResponse({ error: 'El asistente no está configurado en el servidor.' }, 500)
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseKey,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  )

  const { data: userData, error: userError } = await supabase.auth.getUser(token)
  if (userError || !userData.user) {
    return jsonResponse({ error: 'La sesión no es válida o ha expirado.' }, 401)
  }

  const [estudiantes, notas, cursos, periodos, riesgos, puntosCriticos] = await Promise.all([
    supabase.from('estudiantes').select('nombre, apellidos, codigo_estudiante, estado, grados(nombre), secciones(nombre)').limit(1000),
    supabase.from('notas').select('nota, estado, estudiantes(nombre, apellidos, codigo_estudiante), cursos(nombre), periodos(nombre)').limit(2000),
    supabase.from('cursos').select('nombre, codigo').limit(200),
    supabase.from('periodos').select('nombre, numero, año, fecha_inicio, fecha_fin').limit(100),
    supabase.from('evaluaciones_riesgo').select('nivel_riesgo, promedio_general, cursos_desaprobados, notas_bajas, tendencia, estudiantes(nombre, apellidos, codigo_estudiante), periodos(nombre)').limit(2000),
    supabase.from('puntos_criticos').select('tipo, descripcion, severidad, resuelta, estudiantes(nombre, apellidos, codigo_estudiante), cursos(nombre)').limit(1000)
  ])

  const queryError = [estudiantes, notas, cursos, periodos, riesgos, puntosCriticos].find((result) => result.error)
  if (queryError) {
    console.error('Error consultando datos para el asistente:', queryError.error)
    return jsonResponse({ error: 'No se pudieron consultar los datos académicos.' }, 500)
  }

  const contextData = compactData(
    { estudiantes, notas, cursos, periodos, riesgos, puntosCriticos },
    question
  )

  const estudiantesDesaprobadosTexto = contextData.estudiantes_desaprobados.length > 0 
    ? contextData.estudiantes_desaprobados.map((e) => {
      const notasDelEstudiante = contextData.notas_desaprobadas
        .filter(n => n.estudiante?.codigo_estudiante === e.codigo_estudiante || 
                     (n.estudiante?.nombre === e.nombre && n.estudiante?.apellidos === e.apellidos))
        .map(n => `${n.curso}: ${n.nota}`)
        .join(', ')
      return `• ${e.nombre} ${e.apellidos} (${e.codigo_estudiante}) - Notas: ${notasDelEstudiante}`
    }).join('\n')
    : 'No hay estudiantes desaprobados'

  const notasDesaprobPorCursoTexto = contextData.notas_desaprobadas_por_curso.length > 0
    ? contextData.notas_desaprobadas_por_curso
      .reduce((acc, nota) => {
        const key = nota.curso || 'Sin curso'
        acc[key] ||= []
        acc[key].push(`${nota.estudiante?.nombre} ${nota.estudiante?.apellidos}: ${nota.nota}`)
        return acc
      }, {})
    : {}

  const desaprobPorCursoTexto = Object.entries(notasDesaprobPorCursoTexto)
    .map(([curso, notas]) => `${curso}:\n${notas.map(n => `  • ${n}`).join('\n')}`)
    .join('\n') || 'No hay desaprobados por curso'

  const riesgoAltoTexto = contextData.riesgo_alto.length > 0 
    ? contextData.riesgo_alto.map((r) => r.estudiante ? `${r.estudiante.nombre} ${r.estudiante.apellidos} (promedio: ${r.promedio})` : '').filter(Boolean).join('\n• ')
    : 'Ninguno'

  const riesgoMedioTexto = contextData.riesgo_medio.length > 0 
    ? contextData.riesgo_medio.map((r) => r.estudiante ? `${r.estudiante.nombre} ${r.estudiante.apellidos} (promedio: ${r.promedio})` : '').filter(Boolean).join('\n• ')
    : 'Ninguno'

  const estudianteDetalleTexto = contextData.estudiante_detalle.length > 0
    ? contextData.estudiante_detalle.map((sd) => {
      const notasTexto = sd.notas.map(n => `${n.curso}: ${n.nota} (${n.estado})`).join(', ')
      const promedio = (sd.notas.reduce((sum, n) => sum + Number(n.nota || 0), 0) / Math.max(sd.notas.length, 1)).toFixed(2)
      return `${sd.estudiante.nombre} ${sd.estudiante.apellidos} (${sd.estudiante.codigo_estudiante}):\nNotas: ${notasTexto}\nPromedio: ${promedio}`
    }).join('\n---\n')
    : ''

  const promediosPorCursoTexto = Object.entries(contextData.promedio_por_curso)
    .map(([curso, promedio]) => `• ${curso}: ${promedio}`)
    .join('\n')

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model: 'openai/gpt-oss-120b',
    temperature: 0.1,
    max_completion_tokens: 400,
    messages: [
      { role: 'system', content: schemaContext },
      {
        role: 'user',
        content: `PREGUNTA: ${question}

DATOS ACADÉMICOS DISPONIBLES:

RESUMEN GENERAL:
- Total de estudiantes: ${contextData.resumen.total_estudiantes}
- Estudiantes activos: ${contextData.resumen.estudiantes_activos}
- Promedio general: ${contextData.resumen.promedio_general}
- Total de notas registradas: ${contextData.resumen.total_notas}
- Notas aprobadas (≥11): ${contextData.resumen.notas_aprobadas}
- Notas desaprobadas (<11): ${contextData.resumen.notas_desaprobadas}
- Estudiantes únicos desaprobados: ${contextData.resumen.estudiantes_desaprobados}
- Estudiantes únicos aprobados: ${contextData.resumen.estudiantes_aprobados}
- Tasa de aprobación: ${contextData.resumen.porcentaje_aprobacion}

ESTUDIANTES DESAPROBADOS (con notas):
${estudiantesDesaprobadosTexto}

${contextData.notas_desaprobadas_por_curso.length > 0 ? `DESAPROBADOS POR CURSO:
${desaprobPorCursoTexto}

` : ''}RIESGO ACADÉMICO:
Riesgo Alto (${contextData.riesgo_alto.length}):
${contextData.riesgo_alto.length > 0 ? '• ' + riesgoAltoTexto : 'Ninguno'}

Riesgo Medio (${contextData.riesgo_medio.length}):
${contextData.riesgo_medio.length > 0 ? '• ' + riesgoMedioTexto : 'Ninguno'}

${estudianteDetalleTexto ? `DETALLE DE ESTUDIANTE CONSULTADO:
${estudianteDetalleTexto}

` : ''}PROMEDIOS POR CURSO:
${promediosPorCursoTexto}

INSTRUCCIÓN FINAL:
Responde la pregunta usando SOLO los datos anteriores. Sé directo, claro y conciso. Si es una pregunta sobre estudiantes específicos, proporciona sus nombres completos y notas. No digas "los datos proporcionados indican" - da la respuesta directamente.`
      }
    ]
  })

  const answer = completion.choices[0]?.message?.content?.trim()
  if (!answer) {
    return jsonResponse({ error: 'Groq no devolvió una respuesta.' }, 502)
  }

  return jsonResponse({ answer })
}

export async function handler(event) {
  try {
    return await executeAssistant(event)
  } catch (error) {
    console.error('Error inesperado en el asistente IA:', error)
    if (error?.status === 413 || error?.error?.error?.code === 'rate_limit_exceeded') {
      return jsonResponse({
        error: 'La consulta contiene demasiados datos para el límite actual de Groq. Intenta una pregunta más específica.'
      }, 413)
    }
    return jsonResponse({ error: 'Ocurrió un error interno al consultar el asistente.' }, 500)
  }
}
