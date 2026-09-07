import { useState, useEffect } from 'react'
import { estudianteService } from '../../services/estudianteService'
import { notasService } from '../../services/notasService'
import { cursoService } from '../../services/cursoService'
import { riesgoService } from '../../services/riesgoService'
import { criticalPointsService } from '../../services/criticalPointsService'
import { periodoService } from '../../services/periodoService'

export default function AsistenteIA() {
  const [query, setQuery] = useState('')
  const [respuesta, setRespuesta] = useState('')
  const [loading, setLoading] = useState(false)
  const [historial, setHistorial] = useState([])
  const [datos, setDatos] = useState({
    estudiantes: [],
    notas: [],
    cursos: [],
    periodos: []
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: estudiantesData } = await estudianteService.getAll()
      const { data: notasData } = await notasService.getAll()
      const { data: cursosData } = await cursoService.getAll()
      const { data: periodosData } = await periodoService.getAll()

      setDatos({
        estudiantes: estudiantesData || [],
        notas: notasData || [],
        cursos: cursosData || [],
        periodos: periodosData || []
      })
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }

  const procesarConsulta = async (q) => {
    const queryLower = q.toLowerCase()
    let resultado = ''

    try {
      // Consultas sobre cantidad de estudiantes
      if (queryLower.includes('cuántos estudiantes') || queryLower.includes('cuantos estudiantes')) {
        resultado = `Total de estudiantes: ${datos.estudiantes.length}\n`
        resultado += `Estudiantes activos: ${datos.estudiantes.filter(e => e.estado === 'activo').length}`
      }

      // Consultas sobre riesgo
      else if (queryLower.includes('riesgo alto') || queryLower.includes('riesgo crítico')) {
        const notasAgrupadas = {}
        datos.notas.forEach(nota => {
          if (!notasAgrupadas[nota.estudiante_id]) {
            notasAgrupadas[nota.estudiante_id] = []
          }
          notasAgrupadas[nota.estudiante_id].push(nota)
        })

        const estudiantesRiesgo = []
        Object.entries(notasAgrupadas).forEach(([estId, notas]) => {
          const nivel = riesgoService.calcularNivelRiesgo(notas)
          if (nivel === 'alto' || nivel === 'crítico') {
            const estudiante = datos.estudiantes.find(e => e.id === estId)
            estudiantesRiesgo.push({
              estudiante,
              nivel,
              notas
            })
          }
        })

        resultado = `Se encontraron ${estudiantesRiesgo.length} estudiantes con riesgo alto o crítico:\n\n`
        estudiantesRiesgo.slice(0, 5).forEach(e => {
          resultado += `• ${e.estudiante?.nombre} ${e.estudiante?.apellidos} - Riesgo ${e.nivel}\n`
        })
        if (estudiantesRiesgo.length > 5) {
          resultado += `... y ${estudiantesRiesgo.length - 5} más`
        }
      }

      // Consultas sobre desaprobados
      else if (queryLower.includes('desaprobados') || queryLower.includes('desaprobó')) {
        const desaprobados = datos.notas.filter(n => n.nota < 11)
        const porCurso = {}

        desaprobados.forEach(nota => {
          const nombreCurso = nota.cursos?.nombre || 'Desconocido'
          if (!porCurso[nombreCurso]) {
            porCurso[nombreCurso] = 0
          }
          porCurso[nombreCurso]++
        })

        resultado = `Total de notas desaprobatorias: ${desaprobados.length}\n\n`
        resultado += 'Desaprobados por curso:\n'
        Object.entries(porCurso).forEach(([curso, count]) => {
          resultado += `• ${curso}: ${count} estudiante(s)\n`
        })
      }

      // Consultas sobre cursos
      else if (queryLower.includes('cuántos cursos') || queryLower.includes('cuantos cursos') || queryLower.includes('cursos')) {
        resultado = `Total de cursos: ${datos.cursos.length}\n\n`
        resultado += 'Cursos registrados:\n'
        datos.cursos.forEach(c => {
          resultado += `• ${c.nombre} (${c.codigo})\n`
        })
      }

      // Consultas sobre promedio
      else if (queryLower.includes('promedio')) {
        const promedio = datos.notas.length > 0
          ? (datos.notas.reduce((sum, n) => sum + n.nota, 0) / datos.notas.length).toFixed(2)
          : 0
        resultado = `Promedio general de todas las notas: ${promedio}\n\n`

        // Agrupar por curso
        const porCurso = {}
        datos.notas.forEach(nota => {
          const nombreCurso = nota.cursos?.nombre || 'Desconocido'
          if (!porCurso[nombreCurso]) {
            porCurso[nombreCurso] = []
          }
          porCurso[nombreCurso].push(nota.nota)
        })

        resultado += 'Promedio por curso:\n'
        Object.entries(porCurso).forEach(([curso, notas]) => {
          const promedioCurso = (notas.reduce((a, b) => a + b) / notas.length).toFixed(2)
          resultado += `• ${curso}: ${promedioCurso}\n`
        })
      }

      // Consultas sobre estudiantes con bajo rendimiento
      else if (queryLower.includes('bajo rendimiento') || queryLower.includes('notas bajas')) {
        const notasAgrupadas = {}
        datos.notas.forEach(nota => {
          if (nota.nota < 14) {
            if (!notasAgrupadas[nota.estudiante_id]) {
              notasAgrupadas[nota.estudiante_id] = []
            }
            notasAgrupadas[nota.estudiante_id].push(nota)
          }
        })

        const estudiantesConBajas = Object.entries(notasAgrupadas).filter(([_, notas]) => notas.length >= 2)
        resultado = `Se encontraron ${estudiantesConBajas.length} estudiantes con múltiples notas bajas:\n\n`
        estudiantesConBajas.slice(0, 5).forEach(([estId, notas]) => {
          const estudiante = datos.estudiantes.find(e => e.id === estId)
          resultado += `• ${estudiante?.nombre} ${estudiante?.apellidos} - ${notas.length} notas bajas\n`
        })
      }

      // Consultas sobre períodos
      else if (queryLower.includes('período') || queryLower.includes('periodo')) {
        resultado = `Períodos registrados:\n`
        datos.periodos.forEach(p => {
          resultado += `• ${p.nombre} (${p.año})\n`
        })
      }

      // Consulta por defecto
      else {
        resultado = 'No entendí tu pregunta. Prueba preguntas como:\n\n'
        resultado += '• ¿Cuántos estudiantes hay?\n'
        resultado += '• ¿Cuál es el promedio general?\n'
        resultado += '• ¿Qué estudiantes tienen riesgo alto?\n'
        resultado += '• ¿Cuántos estudiantes desaprobaron?\n'
        resultado += '• ¿Cuál es el promedio de cada curso?\n'
        resultado += '• ¿Qué estudiantes tienen bajo rendimiento?\n'
      }

      return resultado
    } catch (error) {
      return `Error procesando la consulta: ${error.message}`
    }
  }

  const handleEnviarConsulta = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const resultado = await procesarConsulta(query)
      setRespuesta(resultado)
      setHistorial([...historial, { pregunta: query, respuesta: resultado }])
      setQuery('')
    } catch (error) {
      setRespuesta(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Asistente IA</h1>
      <p className="text-gray-600 mb-8">Consulta información académica en lenguaje natural</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Panel principal */}
        <div className="lg:col-span-2">
          {/* Chat */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="h-96 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
              {historial.length === 0 ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg mb-2">👋 Bienvenido al Asistente IA</p>
                  <p className="text-sm">Haz preguntas sobre los estudiantes, notas y rendimiento académico</p>
                </div>
              ) : (
                historial.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                        <p className="text-sm">{item.pregunta}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-900 rounded-lg p-3 max-w-xs">
                        <p className="text-sm whitespace-pre-wrap">{item.respuesta}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {respuesta && historial.length === 0 && (
                <div className="space-y-2">
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-900 rounded-lg p-3 max-w-xs">
                      <p className="text-sm whitespace-pre-wrap">{respuesta}</p>
                    </div>
                  </div>
                </div>
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 rounded-lg p-3">
                    <p className="text-sm">Procesando consulta...</p>
                  </div>
                </div>
              )}
            </div>

            {/* Formulario */}
            <form onSubmit={handleEnviarConsulta} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        {/* Panel de información */}
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Datos Disponibles</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-gray-600">Estudiantes</p>
                <p className="text-2xl font-bold text-blue-600">{datos.estudiantes.length}</p>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-gray-600">Notas</p>
                <p className="text-2xl font-bold text-purple-600">{datos.notas.length}</p>
              </div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-gray-600">Cursos</p>
                <p className="text-2xl font-bold text-green-600">{datos.cursos.length}</p>
              </div>
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-gray-600">Períodos</p>
                <p className="text-2xl font-bold text-orange-600">{datos.periodos.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ejemplos de Preguntas</h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => setQuery('¿Cuántos estudiantes hay?')}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
              >
                ¿Cuántos estudiantes hay?
              </button>
              <button
                onClick={() => setQuery('¿Cuál es el promedio general?')}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
              >
                ¿Cuál es el promedio general?
              </button>
              <button
                onClick={() => setQuery('¿Qué estudiantes tienen riesgo alto?')}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
              >
                ¿Qué estudiantes tienen riesgo alto?
              </button>
              <button
                onClick={() => setQuery('¿Cuántos desaprobaron?')}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
              >
                ¿Cuántos desaprobaron?
              </button>
              <button
                onClick={() => setQuery('¿Promedio por curso?')}
                className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
              >
                ¿Promedio por curso?
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-2">ℹ️ Nota sobre IA</p>
            <p className="text-blue-800">
              Este asistente analiza tus datos locales. Puedes conectar un proveedor de IA (OpenAI, Gemini, Claude) para respuestas más avanzadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
