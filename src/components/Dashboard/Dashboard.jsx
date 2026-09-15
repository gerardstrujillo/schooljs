import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, Users, BookOpen, UserCheck, AlertOctagon } from 'lucide-react'
import { estudianteService } from '../../services/estudianteService'
import { cursoService } from '../../services/cursoService'
import { notasService } from '../../services/notasService'
import { riesgoService } from '../../services/riesgoService'
import { criticalPointsService } from '../../services/criticalPointsService'
import { periodoService } from '../../services/periodoService'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ChartContainer,
  ChartTooltipContent,
  DashboardPieChart,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from '../ui/chart'

const riskColors = {
  bajo: '#10b981',
  medio: '#f59e0b',
  alto: '#f97316',
  crítico: '#ef4444'
}

function buildChartData(estudiantes, cursos, notas, periodos, evaluaciones = []) {
    const courseNames = Object.fromEntries((cursos || []).map(curso => [curso.id, curso.nombre]))
    const periodNames = Object.fromEntries((periodos || []).map(periodo => [periodo.id, periodo.nombre]))
    const studentNotes = {}

    ;(notas || []).forEach(nota => {
      if (!studentNotes[nota.estudiante_id]) studentNotes[nota.estudiante_id] = []
      studentNotes[nota.estudiante_id].push(nota)
    })

  const latestEvaluations = Object.values((evaluaciones || []).reduce((latest, evaluation) => {
    const current = latest[evaluation.estudiante_id]
    if (!current || new Date(evaluation.fecha_evaluacion) > new Date(current.fecha_evaluacion)) {
      latest[evaluation.estudiante_id] = evaluation
    }
    return latest
  }, {}))

  const riskData = ['bajo', 'medio', 'alto', 'crítico'].map(nivel => ({
      label: nivel.charAt(0).toUpperCase() + nivel.slice(1),
      value: latestEvaluations.length > 0
        ? latestEvaluations.filter(evaluation => evaluation.nivel_riesgo === nivel).length
        : (estudiantes || []).filter(estudiante =>
            riesgoService.calcularNivelRiesgo(studentNotes[estudiante.id] || []) === nivel
          ).length,
      color: riskColors[nivel]
    })).filter(item => item.value > 0)

    const courseTotals = {}
    const periodTotals = {}
    let approved = 0
    let failed = 0

    ;(notas || []).forEach(nota => {
      const courseId = nota.curso_id
      const periodId = nota.periodo_id
      const value = Number(nota.nota) || 0

      if (!courseTotals[courseId]) courseTotals[courseId] = { total: 0, count: 0 }
      courseTotals[courseId].total += value
      courseTotals[courseId].count += 1

      if (!periodTotals[periodId]) periodTotals[periodId] = { total: 0, count: 0 }
      periodTotals[periodId].total += value
      periodTotals[periodId].count += 1

      if (value >= 11) approved += 1
      else failed += 1
    })

    const courseData = Object.entries(courseTotals)
      .map(([courseId, values]) => ({
        curso: courseNames[courseId] || 'Sin curso',
        promedio: Number((values.total / values.count).toFixed(2))
      }))
      .sort((a, b) => b.promedio - a.promedio)
      .slice(0, 8)

    const periodData = (periodos || [])
      .filter(periodo => periodTotals[periodo.id])
      .map(periodo => ({
        periodo: periodNames[periodo.id] || periodo.nombre,
        promedio: Number((periodTotals[periodo.id].total / periodTotals[periodo.id].count).toFixed(2))
      }))
      .reverse()

    return {
      riskData,
      courseData,
      periodData,
      statusData: [
        { estado: 'Aprobados', cantidad: approved },
        { estado: 'Desaprobados', cantidad: failed }
      ]
    }

}

function StatCard({ title, value, IconComponent, color }) {
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
        <IconComponent className={`w-12 h-12 ${textColorClasses[color]}`} />
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
  const [chartData, setChartData] = useState({
    riskData: [],
    courseData: [],
    periodData: [],
    statusData: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const [
        estudiantesResult,
        cursosResult,
        notasResult,
        periodosResult,
        evaluacionesResult,
        puntosResult
      ] = await Promise.all([
        estudianteService.getAll(),
        cursoService.getAll(),
        notasService.getAll(),
        periodoService.getAll(),
        riesgoService.getAll(),
        criticalPointsService.getResumenPuntosCriticos()
      ])

      const results = [
        estudiantesResult,
        cursosResult,
        notasResult,
        periodosResult,
        evaluacionesResult,
        puntosResult
      ]
      const firstError = results.find(result => result.error)?.error
      if (firstError) throw firstError

      const estudiantes = estudiantesResult.data || []
      const cursos = cursosResult.data || []
      const notas = notasResult.data || []
      const periodos = periodosResult.data || []
      const evaluaciones = evaluacionesResult.data || []
      const totalEstudiantes = estudiantes.length
      const totalCursos = cursos.length

      // Últimas notas
      const notasRecientes = notas?.slice(0, 10)?.map(n => ({
        ...n,
        nombreEstudiante: n.estudiantes?.nombre,
        apellidosEstudiante: n.estudiantes?.apellidos,
        nombreCurso: n.cursos?.nombre,
        nombrePeriodo: n.periodos?.nombre
      })) || []

      const charts = buildChartData(estudiantes, cursos, notas, periodos, evaluaciones)
      setChartData(charts)

      const resumenRiesgo = charts.riskData.reduce((resumen, item) => {
        const nivel = item.label.toLowerCase()
        resumen[nivel] = item.value
        return resumen
      }, {})
      const resumenPuntos = puntosResult.resumen

      setStats(prev => ({
        ...prev,
        totalEstudiantes: totalEstudiantes || 0,
        totalCursos,
        totalDocentes: new Set(
          notas.map(nota => nota.docente_id).filter(Boolean)
        ).size,
        riesgoBajo: resumenRiesgo.bajo || 0,
        riesgoMedio: resumenRiesgo.medio || 0,
        riesgoAlto: resumenRiesgo.alto || 0,
        riesgoCritico: resumenRiesgo.crítico || 0,
        puntosCriticos: resumenPuntos?.total || 0
      }))

      setUltimasNotas(notasRecientes)
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      setError(error.message || 'No se pudieron cargar los datos del dashboard.')
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

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          No se pudieron cargar todos los datos: {error}
        </div>
      )}

      {/* Tarjetas de estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total de Estudiantes"
          value={stats.totalEstudiantes}
          IconComponent={Users}
          color="blue"
        />
        <StatCard
          title="Total de Cursos"
          value={stats.totalCursos}
          IconComponent={BookOpen}
          color="purple"
        />
        <StatCard
          title="Docentes con notas"
          value={stats.totalDocentes}
          IconComponent={UserCheck}
          color="green"
        />
        <StatCard
          title="Puntos Críticos"
          value={stats.puntosCriticos}
          IconComponent={AlertOctagon}
          color="red"
        />
      </div>

      {/* Gráficos analíticos */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900">Distribución de riesgo</h2>
          <p className="text-sm text-gray-500 mt-1">Clasificación calculada a partir de las notas registradas</p>
          {chartData.riskData.length > 0 ? (
            <DashboardPieChart data={chartData.riskData} />
          ) : (
            <p className="py-24 text-center text-gray-500">No hay evaluaciones suficientes para mostrar el gráfico.</p>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900">Aprobados vs. desaprobados</h2>
          <p className="text-sm text-gray-500 mt-1">Comparativa global de todas las notas</p>
          <ChartContainer>
            <BarChart data={chartData.statusData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="estado" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="cantidad" name="Notas" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900">Promedio por curso</h2>
          <p className="text-sm text-gray-500 mt-1">Los ocho cursos con datos más recientes</p>
          <ChartContainer>
            <BarChart data={chartData.courseData} layout="vertical" accessibilityLayer>
              <CartesianGrid horizontal={false} strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 20]} tickLine={false} axisLine={false} />
              <YAxis dataKey="curso" type="category" width={100} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent formatter={(value) => `${value}/20`} />} />
              <Bar dataKey="promedio" name="Promedio" fill="var(--chart-2)" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900">Evolución del promedio</h2>
          <p className="text-sm text-gray-500 mt-1">Tendencia del rendimiento por período académico</p>
          <ChartContainer>
            <LineChart data={chartData.periodData} accessibilityLayer>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="periodo" tickLine={false} axisLine={false} />
              <YAxis domain={[0, 20]} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltipContent formatter={(value) => `${value}/20`} />} />
              <Line type="monotone" dataKey="promedio" name="Promedio" stroke="var(--chart-3)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ChartContainer>
        </div>
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

      {/* Centro de decisiones */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Centro de decisiones</h2>
            <p className="text-sm text-gray-500 mt-1">
              Acciones priorizadas a partir de los indicadores actuales.
            </p>
          </div>
          <Link
            to="/puntos-criticos"
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
          >
            Revisar alertas
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">Atención inmediata</p>
            <p className="mt-2 text-sm text-red-700">
              {stats.riesgoCritico + stats.riesgoAlto} estudiante(s) requieren seguimiento prioritario.
            </p>
            <Link to="/riesgo" className="inline-block mt-4 text-sm font-semibold text-red-800 hover:underline">
              Ver estudiantes en riesgo
            </Link>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-semibold text-yellow-800">Prevención</p>
            <p className="mt-2 text-sm text-yellow-700">
              {stats.riesgoMedio} estudiante(s) están en riesgo medio y pueden recibir apoyo antes de empeorar.
            </p>
            <Link to="/riesgo" className="inline-block mt-4 text-sm font-semibold text-yellow-800 hover:underline">
              Revisar riesgo medio
            </Link>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-semibold text-blue-800">Intervención académica</p>
            <p className="mt-2 text-sm text-blue-700">
              {chartData.statusData.find(item => item.estado === 'Desaprobados')?.cantidad || 0} nota(s) desaprobatoria(s) sugieren revisar refuerzos y registrar seguimiento.
            </p>
            <Link to="/notas" className="inline-block mt-4 text-sm font-semibold text-blue-800 hover:underline">
              Revisar notas
            </Link>
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
          <p className="text-gray-500 text-center py-8">No hay notas registradas aún</p>
        )}
      </div>
    </div>
  )
}
