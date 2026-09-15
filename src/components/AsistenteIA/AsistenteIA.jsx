import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { supabase } from '../../services/supabaseClient'
import { estudianteService } from '../../services/estudianteService'
import { notasService } from '../../services/notasService'
import { cursoService } from '../../services/cursoService'
import { periodoService } from '../../services/periodoService'

const preguntasEjemplo = [
  '¿Cuántos estudiantes hay?',
  '¿Cuál es el promedio general?',
  '¿Qué estudiantes tienen riesgo alto?',
  '¿Cuántos desaprobaron?',
  '¿Cuál es el promedio por curso?'
]

const coloresResumen = {
  blue: { panel: 'bg-blue-50 border-blue-200', count: 'text-blue-600' },
  purple: { panel: 'bg-purple-50 border-purple-200', count: 'text-purple-600' },
  green: { panel: 'bg-green-50 border-green-200', count: 'text-green-600' },
  orange: { panel: 'bg-orange-50 border-orange-200', count: 'text-orange-600' }
}

export default function AsistenteIA() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [historial, setHistorial] = useState([])
  const [datos, setDatos] = useState({
    estudiantes: [],
    notas: [],
    cursos: [],
    periodos: []
  })

  useEffect(() => {
    const cargarResumen = async () => {
      const [estudiantes, notas, cursos, periodos] = await Promise.all([
        estudianteService.getAll(),
        notasService.getAll(),
        cursoService.getAll(),
        periodoService.getAll()
      ])

      const error = estudiantes.error || notas.error || cursos.error || periodos.error
      if (error) {
        console.error('Error cargando el resumen del asistente:', error)
        return
      }

      setDatos({
        estudiantes: estudiantes.data || [],
        notas: notas.data || [],
        cursos: cursos.data || [],
        periodos: periodos.data || []
      })
    }

    cargarResumen().catch((error) => {
      console.error('Error cargando el resumen del asistente:', error)
    })
  }, [])

  const handleEnviarConsulta = async (event) => {
    event.preventDefault()
    const pregunta = query.trim()
    if (!pregunta || loading) return

    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Tu sesión expiró. Vuelve a iniciar sesión.')
      }

      const response = await fetch('/.netlify/functions/ai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ question: pregunta })
      })
      const responseText = await response.text()
      let result

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(
          `El servidor respondió con un formato no válido (HTTP ${response.status}).`
        )
      }

      if (!response.ok) {
        throw new Error(
          result.error || `No se pudo procesar la consulta (HTTP ${response.status}).`
        )
      }

      setHistorial((previous) => [
        ...previous,
        { pregunta, respuesta: result.answer }
      ])
      setQuery('')
    } catch (error) {
      setHistorial((previous) => [
        ...previous,
        { pregunta, respuesta: `Error: ${error.message}` }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Asistente IA</h1>
      <p className="text-gray-600 mb-8">
        Consulta información académica real de tu base de datos en lenguaje natural
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="h-96 overflow-y-auto mb-4 space-y-4 bg-gray-50 rounded-lg p-4">
              {historial.length === 0 && !loading ? (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg mb-2">👋 Bienvenido al Asistente IA</p>
                  <p>Pregunta sobre estudiantes, notas, cursos o riesgo académico.</p>
                </div>
              ) : (
                historial.map((item, index) => (
                  <div key={`${item.pregunta}-${index}`} className="space-y-2">
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xl">
                        <p className="text-sm">{item.pregunta}</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-200 text-gray-900 rounded-lg p-3 max-w-xl">
                        <p className="text-sm whitespace-pre-wrap">{item.respuesta}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 rounded-lg p-3">
                    <p className="text-sm">Consultando la base de datos y Groq...</p>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleEnviarConsulta} className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="¿Cuál es el promedio general?"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50"
              >
                {loading ? 'Consultando...' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Datos disponibles</h3>
            <div className="space-y-3 text-sm">
              {[
                ['Estudiantes', datos.estudiantes.length, 'blue'],
                ['Notas', datos.notas.length, 'purple'],
                ['Cursos', datos.cursos.length, 'green'],
                ['Períodos', datos.periodos.length, 'orange']
              ].map(([label, count, color]) => (
                <div key={label} className={`p-3 border rounded-lg ${coloresResumen[color].panel}`}>
                  <p className="text-gray-600">{label}</p>
                  <p className={`text-2xl font-bold ${coloresResumen[color].count}`}>{count}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">Ejemplos de preguntas</h3>
            <div className="space-y-2 text-xs">
              {preguntasEjemplo.map((pregunta) => (
                <button
                  key={pregunta}
                  onClick={() => setQuery(pregunta)}
                  className="w-full text-left px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition"
                >
                  {pregunta}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="flex items-center gap-2 font-medium text-blue-900 mb-2">
              <Info className="w-4 h-4" />
              Nota sobre IA
            </p>
            <p className="text-blue-800">
              Groq redacta la respuesta usando datos consultados en Supabase. No puede modificar tus registros.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
