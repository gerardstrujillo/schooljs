import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const allowedMethods = ['POST']
const maxQuestionLength = 500

const schemaContext = `
INSTRUCCIONES PARA EL ASISTENTE ACADÉMICO:

1. IDENTIDAD Y TONO:
   - Eres el asistente académico de una institución educativa.
   - Responde en español, de forma clara, breve y profesional.
   - Sé amable pero directo.

2. CÓMO RESPONDER:
   - Usa ÚNICAMENTE los datos entregados. No inventes información.
   - Si no hay datos para responder, dilo explícitamente.
   - No hagas conclusiones que no están en los datos.
   - Proporciona números exactos, no aproximaciones.

3. PREGUNTAS COMUNES Y CÓMO RESPONDER:

   a) "¿Cuántos estudiantes hay?" → Usa resumen.total_estudiantes
   
   b) "¿Cuántos estudiantes desaprobados?" → Usa resumen.estudiantes_desaprobados
      - Esto cuenta estudiantes ÚNICOS, no notas.
   
   c) "¿Cuáles son los nombres de los desaprobados?" → Lista los nombres de estudiantes_desaprobados con formato: "Nombre Apellidos (Código)"
   
   d) "¿Cuál es el promedio general?" → Usa resumen.promedio_general
   
   e) "¿Cuál es el promedio por curso?" → Usa promedio_por_curso (es un diccionario curso→promedio)
   
   f) "¿Cuáles estudiantes tienen riesgo?" → Busca en riesgos_relevantes y menciona nivel_riesgo de cada uno
   
   g) "¿Hay puntos críticos?" → Cuenta de resumen.puntos_criticos_pendientes

4. DIFERENCIAS CLAVE:
   - notas_desaprobadas = lista de registros de NOTAS (puede haber múltiples del mismo estudiante)
   - estudiantes_desaprobados = estudiantes ÚNICOS con al menos una nota desaprobada
   - Siempre usa estudiantes_desaprobados para contar "cuántos estudiantes"

5. FORMATO DE RESPUESTA:
   - Sé conciso. Máximo 2-3 oraciones por respuesta.
   - Si es una lista, usa viñetas o numeración.
   - Incluye nombres y apellidos de estudiantes cuando sea relevante.

6. NO HAGAS:
   - No inventes datos ni predicciones.
   - No reveles información técnica o tokens.
   - No hagas suposiciones sobre estudiantes sin datos.
   - No accedas a información que no está en los datos entregados.
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
  const asksAboutApproved = terms.some((term) =>
    ['aprobado', 'aprob', 'exito', 'bien'].includes(term)
  )
  const includeAllStudents = asksForStudentNames && !asksAboutFailingStudents
  
  const matchesQuestion = (value) => {
    const text = String(value || '').toLowerCase()
    return terms.some((term) => text.includes(term))
  }

  const matchingStudents = studentRows
    .filter((student) => includeAllStudents || (!asksAboutFailingStudents && matchesQuestion(
      `${student.nombre} ${student.apellidos} ${student.codigo_estudiante}`
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
    notas_aprobadas: notasAprobadas,
    estudiantes_desaprobados: estudiantesDesaprobados,
    estudiantes_aprobados: estudiantesAprobados,
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
    ? contextData.estudiantes_desaprobados.map((e) => `• ${e.nombre} ${e.apellidos} (${e.codigo_estudiante})`).join('\n')
    : 'Ninguno'

  const riesgoAltoTexto = contextData.riesgo_alto.length > 0 
    ? 'Riesgo Alto: ' + contextData.riesgo_alto.map((r) => r.estudiante ? `${r.estudiante.nombre} (promedio: ${r.promedio})` : '').join(', ')
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
- Total de notas: ${contextData.resumen.total_notas}
- Notas aprobadas: ${contextData.resumen.notas_aprobadas}
- Notas desaprobadas: ${contextData.resumen.notas_desaprobadas}
- Estudiantes desaprobados (únicos): ${contextData.resumen.estudiantes_desaprobados}
- Estudiantes aprobados (únicos): ${contextData.resumen.estudiantes_aprobados}
- Porcentaje de aprobación: ${contextData.resumen.porcentaje_aprobacion}

ESTUDIANTES DESAPROBADOS:
${estudiantesDesaprobadosTexto}

RIESGO ACADÉMICO:
- Estudiantes en riesgo alto: ${contextData.riesgo_alto.length}
- Estudiantes en riesgo medio: ${contextData.riesgo_medio.length}
${riesgoAltoTexto}

PROMEDIOS POR CURSO:
${promediosPorCursoTexto}

Responde la pregunta de forma clara, breve y usando SOLO los datos proporcionados.`
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
