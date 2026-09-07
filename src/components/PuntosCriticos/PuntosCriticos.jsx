import { useState, useEffect } from 'react'
import { criticalPointsService } from '../../services/criticalPointsService'
import { periodoService } from '../../services/periodoService'

export default function PuntosCriticos() {
  const [puntosCriticos, setPuntosCriticos] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroSeveridad, setFiltroSeveridad] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: periodosData } = await periodoService.getAll()
      setPeriodos(periodosData || [])

      if (periodosData && periodosData.length > 0) {
        setPeriodoSeleccionado(periodosData[0].id)
        await cargarPuntosCriticos(periodosData[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const cargarPuntosCriticos = async (periodoId) => {
    try {
      // Detectar puntos críticos
      const puntos = await criticalPointsService.detectarPuntosCriticos(periodoId)
      setPuntosCriticos(puntos || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCambiarPeriodo = async (e) => {
    const periodoId = e.target.value
    setPeriodoSeleccionado(periodoId)
    await cargarPuntosCriticos(periodoId)
  }

  const handleMarcarResuelto = async (punto) => {
    try {
      const { data, error } = await criticalPointsService.guardarPuntosCriticos([punto])
      if (error) throw error
      await cargarPuntosCriticos(periodoSeleccionado)
    } catch (err) {
      setError(err.message)
    }
  }

  const puntosFiltrados = puntosCriticos.filter(p => {
    let cumpleFiltros = true
    if (filtroTipo) cumpleFiltros = cumpleFiltros && p.tipo === filtroTipo
    if (filtroSeveridad) cumpleFiltros = cumpleFiltros && p.severidad === filtroSeveridad
    return cumpleFiltros
  })

  const getSeveridadBadgeColor = (severidad) => {
    switch (severidad) {
      case 'baja':
        return 'bg-blue-100 text-blue-800'
      case 'media':
        return 'bg-yellow-100 text-yellow-800'
      case 'alta':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoDescripcion = (tipo) => {
    switch (tipo) {
      case 'estudiante_riesgo':
        return 'Estudiante en Riesgo'
      case 'curso_bajo_rendimiento':
        return 'Curso con Bajo Rendimiento'
      case 'grado_bajo_rendimiento':
        return 'Grado con Bajo Rendimiento'
      default:
        return tipo
    }
  }

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'estudiante_riesgo':
        return '👤'
      case 'curso_bajo_rendimiento':
        return '📚'
      case 'grado_bajo_rendimiento':
        return '🎓'
      default:
        return '⚠'
    }
  }

  const conteosPorTipo = {
    estudiante_riesgo: puntosCriticos.filter(p => p.tipo === 'estudiante_riesgo').length,
    curso_bajo_rendimiento: puntosCriticos.filter(p => p.tipo === 'curso_bajo_rendimiento').length,
    grado_bajo_rendimiento: puntosCriticos.filter(p => p.tipo === 'grado_bajo_rendimiento').length
  }

  const conteosPorSeveridad = {
    baja: puntosCriticos.filter(p => p.severidad === 'baja').length,
    media: puntosCriticos.filter(p => p.severidad === 'media').length,
    alta: puntosCriticos.filter(p => p.severidad === 'alta').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analizando puntos críticos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Puntos Críticos Detectados</h1>

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

      {/* Resumen de puntos críticos */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Estudiantes en Riesgo</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{conteosPorTipo.estudiante_riesgo}</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Cursos Bajo Rendimiento</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{conteosPorTipo.curso_bajo_rendimiento}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total de Alertas</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{puntosCriticos.length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Punto Crítico</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="estudiante_riesgo">Estudiante en Riesgo</option>
              <option value="curso_bajo_rendimiento">Curso Bajo Rendimiento</option>
              <option value="grado_bajo_rendimiento">Grado Bajo Rendimiento</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Severidad</label>
            <select
              value={filtroSeveridad}
              onChange={(e) => setFiltroSeveridad(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las severidades</option>
              <option value="baja">Baja ({conteosPorSeveridad.baja})</option>
              <option value="media">Media ({conteosPorSeveridad.media})</option>
              <option value="alta">Alta ({conteosPorSeveridad.alta})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de puntos críticos */}
      {puntosFiltrados.length > 0 ? (
        <div className="space-y-4">
          {puntosFiltrados.map((punto, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{getTipoIcon(punto.tipo)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {getTipoDescripcion(punto.tipo)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Detectado el {new Date(punto.fecha_deteccion).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{punto.descripcion}</p>

                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getSeveridadBadgeColor(punto.severidad)}`}>
                      Severidad: {punto.severidad.charAt(0).toUpperCase() + punto.severidad.slice(1)}
                    </span>
                    {punto.estudiante_id && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        👤 Estudiante
                      </span>
                    )}
                    {punto.curso_id && (
                      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                        📚 Curso
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4">
                  <button
                    onClick={() => handleMarcarResuelto(punto)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Marcar Resuelto
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
          <p className="text-lg">✓ No se detectaron puntos críticos</p>
          <p className="text-sm mt-2">El desempeño académico se ve bien en este período</p>
        </div>
      )}
    </div>
  )
}
