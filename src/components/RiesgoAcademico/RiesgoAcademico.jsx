import { useState, useEffect } from 'react'
import { periodoService } from '../../services/periodoService'
import { riesgoService } from '../../services/riesgoService'
import { notasService } from '../../services/notasService'
import { estudianteService } from '../../services/estudianteService'

export default function RiesgoAcademico() {
  const [periodos, setPeriodos] = useState([])
  const [estudiantesRiesgo, setEstudiantesRiesgo] = useState([])
  const [resumenRiesgo, setResumenRiesgo] = useState({
    bajo: 0,
    medio: 0,
    alto: 0,
    crítico: 0,
    total: 0
  })
  const [filtro, setFiltro] = useState('')
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: periodosData } = await periodoService.getAll()
      setPeriodos(periodosData || [])

      if (periodosData && periodosData.length > 0) {
        setPeriodoSeleccionado(periodosData[0].id)
        await cargarEvaluaciones(periodosData[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cargarEvaluaciones = async (periodoId) => {
    try {
      // Primero obtener todos los estudiantes y sus notas
      const { data: estudiantes } = await estudianteService.getAll()
      const { data: notas } = await notasService.getAll()

      // Filtrar notas por período
      const notasDelPeriodo = notas?.filter(n => n.periodo_id === periodoId) || []

      // Agrupar notas por estudiante
      const notasPorEstudiante = {}
      notasDelPeriodo.forEach(nota => {
        if (!notasPorEstudiante[nota.estudiante_id]) {
          notasPorEstudiante[nota.estudiante_id] = []
        }
        notasPorEstudiante[nota.estudiante_id].push(nota)
      })

      // Evaluar cada estudiante y crear evaluaciones
      const evaluaciones = []
      for (const est of (estudiantes || [])) {
        const notasEstudiante = notasPorEstudiante[est.id] || []

        if (notasEstudiante.length > 0) {
          const nivelRiesgo = riesgoService.calcularNivelRiesgo(notasEstudiante)
          const promedio = notasEstudiante.length > 0
            ? (notasEstudiante.reduce((sum, n) => sum + n.nota, 0) / notasEstudiante.length).toFixed(2)
            : 0
          const cursosDesaprobados = notasEstudiante.filter(n => n.nota < 11).length

          evaluaciones.push({
            estudiante: est,
            nivelRiesgo,
            promedio,
            cursosDesaprobados,
            totalCursos: notasEstudiante.length,
            notas: notasEstudiante
          })
        }
      }

      setEstudiantesRiesgo(evaluaciones)

      // Calcular resumen
      const resumen = {
        bajo: evaluaciones.filter(e => e.nivelRiesgo === 'bajo').length,
        medio: evaluaciones.filter(e => e.nivelRiesgo === 'medio').length,
        alto: evaluaciones.filter(e => e.nivelRiesgo === 'alto').length,
        crítico: evaluaciones.filter(e => e.nivelRiesgo === 'crítico').length,
        total: evaluaciones.length
      }
      setResumenRiesgo(resumen)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCambiarPeriodo = async (e) => {
    const periodoId = e.target.value
    setPeriodoSeleccionado(periodoId)
    await cargarEvaluaciones(periodoId)
  }

  const estudiantesFiltrados = estudiantesRiesgo.filter(e => {
    if (!filtro) return true
    return e.nivelRiesgo === filtro
  })

  const getRiesgoBadgeColor = (nivel) => {
    switch (nivel) {
      case 'bajo':
        return 'bg-green-100 text-green-800'
      case 'medio':
        return 'bg-yellow-100 text-yellow-800'
      case 'alto':
        return 'bg-orange-100 text-orange-800'
      case 'crítico':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiesgoIcon = (nivel) => {
    switch (nivel) {
      case 'bajo':
        return '✓'
      case 'medio':
        return '⚠'
      case 'alto':
        return '⚠'
      case 'crítico':
        return '✗'
      default:
        return '–'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analizando riesgo académico...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Evaluación de Riesgo Académico</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Selector de período */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Período Académico</label>
        <select
          value={periodoSeleccionado}
          onChange={handleCambiarPeriodo}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {periodos.map(p => (
            <option key={p.id} value={p.id}>{p.nombre} ({p.año})</option>
          ))}
        </select>
      </div>

      {/* Resumen de riesgos */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Riesgo Bajo</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{resumenRiesgo.bajo}</p>
          <p className="text-xs text-gray-500 mt-2">
            {resumenRiesgo.total > 0 ? Math.round((resumenRiesgo.bajo / resumenRiesgo.total) * 100) : 0}%
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Riesgo Medio</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{resumenRiesgo.medio}</p>
          <p className="text-xs text-gray-500 mt-2">
            {resumenRiesgo.total > 0 ? Math.round((resumenRiesgo.medio / resumenRiesgo.total) * 100) : 0}%
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Riesgo Alto</p>
          <p className="text-3xl font-bold text-orange-600 mt-2">{resumenRiesgo.alto}</p>
          <p className="text-xs text-gray-500 mt-2">
            {resumenRiesgo.total > 0 ? Math.round((resumenRiesgo.alto / resumenRiesgo.total) * 100) : 0}%
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Riesgo Crítico</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{resumenRiesgo.crítico}</p>
          <p className="text-xs text-gray-500 mt-2">
            {resumenRiesgo.total > 0 ? Math.round((resumenRiesgo.crítico / resumenRiesgo.total) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">Filtrar por nivel de riesgo</label>
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({estudiantesRiesgo.length})
          </button>
          <button
            onClick={() => setFiltro('bajo')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === 'bajo'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Bajo ({resumenRiesgo.bajo})
          </button>
          <button
            onClick={() => setFiltro('medio')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === 'medio'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Medio ({resumenRiesgo.medio})
          </button>
          <button
            onClick={() => setFiltro('alto')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === 'alto'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alto ({resumenRiesgo.alto})
          </button>
          <button
            onClick={() => setFiltro('crítico')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filtro === 'crítico'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Crítico ({resumenRiesgo.crítico})
          </button>
        </div>
      </div>

      {/* Tabla de estudiantes */}
      {estudiantesFiltrados.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estudiante</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Promedio</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Desaprobados</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Total Cursos</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Nivel de Riesgo</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map(est => (
                <tr key={est.estudiante.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">
                    {est.estudiante.nombre} {est.estudiante.apellidos}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`font-bold ${
                      est.promedio >= 14 ? 'text-green-600' :
                      est.promedio >= 11 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {est.promedio}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-gray-900">
                    {est.cursosDesaprobados}
                  </td>
                  <td className="py-4 px-6 text-center text-gray-900">
                    {est.totalCursos}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getRiesgoBadgeColor(est.nivelRiesgo)}`}>
                      {getRiesgoIcon(est.nivelRiesgo)} {est.nivelRiesgo.charAt(0).toUpperCase() + est.nivelRiesgo.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
          <p>No hay estudiantes en esta categoría de riesgo</p>
        </div>
      )}
    </div>
  )
}
