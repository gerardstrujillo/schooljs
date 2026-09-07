import { useState, useEffect } from 'react'
import { estudianteService } from '../../services/estudianteService'
import { cursoService } from '../../services/cursoService'
import { notasService } from '../../services/notasService'
import { riesgoService } from '../../services/riesgoService'
import { criticalPointsService } from '../../services/criticalPointsService'

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200'
  }

  const textColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  }

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${textColorClasses[color]} mt-2`}>{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalEstudiantes: 0,
    totalCursos: 0,
    totalDocentes: 0,
    riesgoBajo: 0,
    riesgoMedio: 0,
    riesgoAlto: 0,
    riesgoCritico: 0,
    puntosCriticos: 0
  })
  const [ultimasNotas, setUltimasNotas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      // Total estudiantes
      const { count: totalEstudiantes } = await estudianteService.getTotalCount()

      // Total cursos
      const { data: cursos } = await cursoService.getAll()
      const totalCursos = cursos?.length || 0

      // Últimas notas
      const { data: notas } = await notasService.getAll()
      const notasRecientes = notas?.slice(0, 10)?.map(n => ({
        ...n,
        nombreEstudiante: n.estudiantes?.nombre,
        apellidosEstudiante: n.estudiantes?.apellidos,
        nombreCurso: n.cursos?.nombre,
        nombrePeriodo: n.periodos?.nombre
      })) || []

      setStats(prev => ({
        ...prev,
        totalEstudiantes: totalEstudiantes || 0,
        totalCursos,
        totalDocentes: 1, // Por ahora, el usuario actual
        puntosCriticos: 0
      }))

      setUltimasNotas(notasRecientes)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Estudiantes"
          value={stats.totalEstudiantes}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="Total de Cursos"
          value={stats.totalCursos}
          icon="📚"
          color="purple"
        />
        <StatCard
          title="Docentes"
          value={stats.totalDocentes}
          icon="👨‍🏫"
          color="green"
        />
        <StatCard
          title="Puntos Críticos"
          value={stats.puntosCriticos}
          icon="🚨"
          color="red"
        />
      </div>

      {/* Sección de Riesgo Académico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de Riesgo Académico</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <span className="text-gray-700 font-medium">Riesgo Bajo</span>
              <span className="text-2xl font-bold text-green-600">{stats.riesgoBajo}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-gray-700 font-medium">Riesgo Medio</span>
              <span className="text-2xl font-bold text-yellow-600">{stats.riesgoMedio}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <span className="text-gray-700 font-medium">Riesgo Alto</span>
              <span className="text-2xl font-bold text-orange-600">{stats.riesgoAlto}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-gray-700 font-medium">Riesgo Crítico</span>
              <span className="text-2xl font-bold text-red-600">{stats.riesgoCritico}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Información General</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Estudiantes Evaluados</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.riesgoBajo + stats.riesgoMedio + stats.riesgoAlto + stats.riesgoCritico}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Estudiantes en Riesgo (Medio + Alto + Crítico)</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {stats.riesgoMedio + stats.riesgoAlto + stats.riesgoCritico}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Porcentaje en Riesgo</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.riesgoBajo + stats.riesgoMedio + stats.riesgoAlto + stats.riesgoCritico > 0
                  ? Math.round((stats.riesgoMedio + stats.riesgoAlto + stats.riesgoCritico) /
                    (stats.riesgoBajo + stats.riesgoMedio + stats.riesgoAlto + stats.riesgoCritico) * 100) + '%'
                  : '0%'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas notas registradas */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Últimas Notas Registradas</h2>
        {ultimasNotas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Estudiante</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Curso</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Período</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Nota</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Estado</th>
                </tr>
              </thead>
              <tbody>
                {ultimasNotas.map(nota => (
                  <tr key={nota.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-700">{nota.nombreEstudiante} {nota.apellidosEstudiante}</td>
                    <td className="py-3 px-4 text-gray-700">{nota.nombreCurso}</td>
                    <td className="py-3 px-4 text-gray-700">{nota.nombrePeriodo}</td>
                    <td className="py-3 px-4 text-center font-bold text-gray-900">{nota.nota}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        nota.estado === 'aprobado'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {nota.estado === 'aprobado' ? '✓ Aprobado' : '✗ Desaprobado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No hay notas registradas aún</p>
        )}
      </div>
    </div>
  )
}
