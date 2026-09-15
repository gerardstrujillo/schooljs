import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { notasService } from '../../services/notasService'
import { estudianteService } from '../../services/estudianteService'
import { gradoService } from '../../services/gradoService'
import { seccionService } from '../../services/seccionService'
import { cursoService } from '../../services/cursoService'
import { periodoService } from '../../services/periodoService'

export default function ConsultaNotas() {
  const [notas, setNotas] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [grados, setGrados] = useState([])
  const [secciones, setSecciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)

  const [filtros, setFiltros] = useState({
    estudianteId: '',
    gradoId: '',
    seccionId: '',
    cursoId: '',
    periodoId: ''
  })

  const [infoEstudiante, setInfoEstudiante] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: gradosData } = await gradoService.getAll()
      const { data: estudiantesData } = await estudianteService.getAll()
      const { data: cursosData } = await cursoService.getAll()
      const { data: periodosData } = await periodoService.getAll()

      setGrados(gradosData || [])
      setEstudiantes(estudiantesData || [])
      setCursos(cursosData || [])
      setPeriodos(periodosData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filtros.gradoId) {
      cargarSeccionesPorGrado()
      setFiltros(prev => ({ ...prev, seccionId: '' }))
    }
  }, [filtros.gradoId])

  const cargarSeccionesPorGrado = async () => {
    try {
      const { data } = await seccionService.getByGrado(filtros.gradoId)
      setSecciones(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleConsultarNotas = async () => {
    setError('')
    setInfoEstudiante(null)
    setNotas([])

    try {
      const { data } = await notasService.getAll()
      let notasFiltradas = data || []

      if (filtros.estudianteId) {
        notasFiltradas = notasFiltradas.filter(n => n.estudiante_id === filtros.estudianteId)
      }
      if (filtros.cursoId) {
        notasFiltradas = notasFiltradas.filter(n => n.curso_id === filtros.cursoId)
      }
      if (filtros.periodoId) {
        notasFiltradas = notasFiltradas.filter(n => n.periodo_id === filtros.periodoId)
      }

      setNotas(notasFiltradas)

      // Si se seleccionó un estudiante, mostrar su información
      if (filtros.estudianteId) {
        await cargarInformacionEstudiante(filtros.estudianteId, notasFiltradas)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const cargarInformacionEstudiante = async (estudianteId, notasEstudiante) => {
    try {
      const { data: estudiante } = await estudianteService.getById(estudianteId)

      if (!estudiante) return

      // Calcular promedio general
      const promedio = notasEstudiante.length > 0
        ? (notasEstudiante.reduce((sum, n) => sum + n.nota, 0) / notasEstudiante.length).toFixed(2)
        : 0

      // Agrupar por curso
      const porCurso = {}
      notasEstudiante.forEach(nota => {
        const nombreCurso = nota.cursos?.nombre || 'Desconocido'
        if (!porCurso[nombreCurso]) {
          porCurso[nombreCurso] = []
        }
        porCurso[nombreCurso].push(nota.nota)
      })

      // Calcular promedios por curso
      const promedioPorCurso = {}
      Object.keys(porCurso).forEach(curso => {
        const notas = porCurso[curso]
        promedioPorCurso[curso] = (notas.reduce((sum, n) => sum + n, 0) / notas.length).toFixed(2)
      })

      // Contar desaprobados
      const desaprobados = notasEstudiante.filter(n => n.nota < 11)
      const cursosDesaprobados = [...new Set(desaprobados.map(n => n.cursos?.nombre))]

      // Notas bajas
      const notasBajas = notasEstudiante.filter(n => n.nota >= 11 && n.nota < 14)

      setInfoEstudiante({
        estudiante,
        promedio,
        promedioPorCurso,
        desaprobados: desaprobados.length,
        cursosDesaprobados,
        notasBajas: notasBajas.length,
        totalNotas: notasEstudiante.length
      })
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Consulta de Notas</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Filtros</h2>
        <div className="grid grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
            <select
              value={filtros.estudianteId}
              onChange={(e) => setFiltros({ ...filtros, estudianteId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {estudiantes.map(e => (
                <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
            <select
              value={filtros.gradoId}
              onChange={(e) => setFiltros({ ...filtros, gradoId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {grados.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
            <select
              value={filtros.seccionId}
              onChange={(e) => setFiltros({ ...filtros, seccionId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas</option>
              {secciones.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Curso</label>
            <select
              value={filtros.cursoId}
              onChange={(e) => setFiltros({ ...filtros, cursoId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {cursos.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
            <select
              value={filtros.periodoId}
              onChange={(e) => setFiltros({ ...filtros, periodoId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
        <button
          onClick={handleConsultarNotas}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          Consultar
        </button>
      </div>

      {/* Información del estudiante */}
      {infoEstudiante && (
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Información del Estudiante</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nombre</p>
                <p className="text-lg font-medium text-gray-900">
                  {infoEstudiante.estudiante.nombre} {infoEstudiante.estudiante.apellidos}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Código</p>
                <p className="text-lg font-medium text-gray-900">{infoEstudiante.estudiante.codigo_estudiante}</p>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-600">Promedio General</p>
                <p className={`text-2xl font-bold ${
                  infoEstudiante.promedio >= 14 ? 'text-green-600' :
                  infoEstudiante.promedio >= 11 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {infoEstudiante.promedio}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Resumen Académico</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <span className="text-gray-700">Total de Notas</span>
                <span className="font-bold text-blue-600">{infoEstudiante.totalNotas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="text-gray-700">Notas Desaprobatorias</span>
                <span className="font-bold text-red-600">{infoEstudiante.desaprobados}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="text-gray-700">Notas Bajas (11-13)</span>
                <span className="font-bold text-yellow-600">{infoEstudiante.notasBajas}</span>
              </div>
              {infoEstudiante.cursosDesaprobados.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium mb-2">Cursos Desaprobados:</p>
                  <div className="space-y-1">
                    {infoEstudiante.cursosDesaprobados.map((curso, i) => (
                      <p key={i} className="text-sm text-orange-700">• {curso}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabla de notas */}
      {notas.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <h2 className="text-lg font-bold text-gray-900 p-6 border-b border-gray-200">Notas Registradas</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estudiante</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Curso</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Período</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Nota</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {notas.map(nota => (
                <tr key={nota.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900">
                    {nota.estudiantes?.nombre} {nota.estudiantes?.apellidos}
                  </td>
                  <td className="py-4 px-6 text-gray-700">{nota.cursos?.nombre}</td>
                  <td className="py-4 px-6 text-gray-700">{nota.periodos?.nombre}</td>
                  <td className="py-4 px-6 text-center font-bold text-gray-900">{nota.nota}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                      nota.estado === 'aprobado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {nota.estado === 'aprobado' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Aprobado
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Desaprobado
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        notas.length === 0 && (filtros.estudianteId || filtros.cursoId || filtros.periodoId) && (
          <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
            <p>No hay notas que coincidan con los filtros</p>
          </div>
        )
      )}
    </div>
  )
}
