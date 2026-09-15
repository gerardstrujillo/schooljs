import { useState, useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import { notasService } from '../../services/notasService'

export default function TodasLasNotas() {
  const [notas, setNotas] = useState([])
  const [notasFiltradas, setNotasFiltradas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarNotas()
  }, [])

  useEffect(() => {
    filtrarNotas()
  }, [busqueda, notas])

  const cargarNotas = async () => {
    try {
      const { data, error: err } = await notasService.getAll()
      if (err) {
        setError('Error al cargar las notas')
        console.error(err)
      } else {
        setNotas(data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filtrarNotas = () => {
    if (!busqueda.trim()) {
      setNotasFiltradas(notas)
      return
    }

    const busquedaLower = busqueda.toLowerCase()
    const filtradas = notas.filter(nota => {
      const nombreCompleto = `${nota.estudiantes?.nombre || ''} ${nota.estudiantes?.apellidos || ''}`.toLowerCase()
      return nombreCompleto.includes(busquedaLower)
    })
    setNotasFiltradas(filtradas)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando notas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Todas las Notas</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Buscador */}
      <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nombre de estudiante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-2 text-sm text-gray-600">
            Mostrando {notasFiltradas.length} de {notas.length} notas
          </p>
        </div>
      </div>

      {/* Tabla de notas */}
      {notasFiltradas.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estudiante</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Código</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Grado</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Sección</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Curso</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Período</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Nota</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {notasFiltradas.map(nota => (
                <tr key={nota.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">
                    {nota.estudiantes?.nombre} {nota.estudiantes?.apellidos}
                  </td>
                  <td className="py-4 px-6 text-gray-700">{nota.estudiantes?.codigo_estudiante}</td>
                  <td className="py-4 px-6 text-gray-700">{nota.estudiantes?.grados?.nombre}</td>
                  <td className="py-4 px-6 text-gray-700">{nota.estudiantes?.secciones?.nombre}</td>
                  <td className="py-4 px-6 text-gray-700">{nota.cursos?.nombre}</td>
                  <td className="py-4 px-6 text-gray-700">{nota.periodos?.nombre}</td>
                  <td className="py-4 px-6 text-center font-bold text-lg">{nota.nota}</td>
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
        <div className="text-center py-12 text-gray-500 bg-white border border-gray-200 rounded-lg">
          <p className="text-lg">No hay notas que coincidan con la búsqueda</p>
        </div>
      )}
    </div>
  )
}
