import { useState, useEffect } from 'react'
import { estudianteService } from '../../services/estudianteService'
import { gradoService } from '../../services/gradoService'
import { seccionService } from '../../services/seccionService'

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([])
  const [grados, setGrados] = useState([])
  const [secciones, setSecciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filtroGrado, setFiltroGrado] = useState('')
  const [filtroSeccion, setFiltroSeccion] = useState('')
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    codigoEstudiante: '',
    gradoId: '',
    seccionId: '',
    estado: 'activo'
  })
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: gradosData } = await gradoService.getAll()
      const { data: estudiantesData } = await estudianteService.getAll()

      setGrados(gradosData || [])
      setEstudiantes(estudiantesData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filtroGrado) {
      cargarSeccionesPorGrado()
    }
  }, [filtroGrado])

  useEffect(() => {
    if (formData.gradoId && showForm) {
      cargarSeccionesPorGradoFormulario(formData.gradoId)
    }
  }, [formData.gradoId, showForm])

  const cargarSeccionesPorGrado = async () => {
    if (!filtroGrado) return
    try {
      const { data } = await seccionService.getByGrado(filtroGrado)
      setSecciones(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarSeccionesPorGradoFormulario = async (gradoId) => {
    try {
      const { data } = await seccionService.getByGrado(gradoId)
      setSecciones(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre || !formData.apellidos || !formData.codigoEstudiante || !formData.gradoId || !formData.seccionId) {
      setError('Completa todos los campos')
      return
    }

    try {
      if (editingId) {
        const { error } = await estudianteService.update(
          editingId,
          formData.nombre,
          formData.apellidos,
          formData.codigoEstudiante,
          formData.gradoId,
          formData.seccionId,
          formData.estado
        )
        if (error) throw error
      } else {
        const { error } = await estudianteService.create(
          formData.nombre,
          formData.apellidos,
          formData.codigoEstudiante,
          formData.gradoId,
          formData.seccionId
        )
        if (error) throw error
      }

      setFormData({
        nombre: '',
        apellidos: '',
        codigoEstudiante: '',
        gradoId: '',
        seccionId: '',
        estado: 'activo'
      })
      setEditingId(null)
      setShowForm(false)
      await cargarDatos()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (estudiante) => {
    setEditingId(estudiante.id)
    setFormData({
      nombre: estudiante.nombre,
      apellidos: estudiante.apellidos,
      codigoEstudiante: estudiante.codigo_estudiante,
      gradoId: estudiante.grado_id,
      seccionId: estudiante.seccion_id,
      estado: estudiante.estado
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        const { error } = await estudianteService.delete(id)
        if (error) throw error
        await cargarDatos()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      nombre: '',
      apellidos: '',
      codigoEstudiante: '',
      gradoId: '',
      seccionId: '',
      estado: 'activo'
    })
    setError('')
  }

  const handleBuscar = async () => {
    if (!search.trim()) {
      await cargarDatos()
      return
    }
    try {
      const { data } = await estudianteService.search(search)
      setEstudiantes(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const getNombreGrado = (gradoId) => {
    return grados.find(g => g.id === gradoId)?.nombre || 'N/A'
  }

  const getNombreSeccion = (seccionId) => {
    return secciones.find(s => s.id === seccionId)?.nombre || 'N/A'
  }

  const estudiantesFiltrados = estudiantes.filter(e => {
    let cumpleFiltros = true
    if (filtroGrado) cumpleFiltros = cumpleFiltros && e.grado_id === filtroGrado
    if (filtroSeccion) cumpleFiltros = cumpleFiltros && e.seccion_id === filtroSeccion
    return cumpleFiltros
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando estudiantes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Estudiantes</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + Nuevo Estudiante
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            {editingId ? 'Editar Estudiante' : 'Nuevo Estudiante'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apellidos</label>
                <input
                  type="text"
                  value={formData.apellidos}
                  onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pérez García"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Código Estudiante</label>
              <input
                type="text"
                value={formData.codigoEstudiante}
                onChange={(e) => setFormData({ ...formData, codigoEstudiante: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="EST-001"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
                <select
                  value={formData.gradoId}
                  onChange={(e) => setFormData({ ...formData, gradoId: e.target.value, seccionId: '' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar grado</option>
                  {grados.map(g => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sección</label>
                <select
                  value={formData.seccionId}
                  onChange={(e) => setFormData({ ...formData, seccionId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!formData.gradoId}
                >
                  <option value="">Seleccionar sección</option>
                  {secciones.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            {editingId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {!showForm && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre, apellidos o código"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
              <select
                value={filtroGrado}
                onChange={(e) => setFiltroGrado(e.target.value)}
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
                value={filtroSeccion}
                onChange={(e) => setFiltroSeccion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                {secciones.filter(s => !filtroGrado || s.grado_id === filtroGrado).map(s => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBuscar}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      {estudiantesFiltrados.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Código</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Grado</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Sección</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesFiltrados.map(est => (
                <tr key={est.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">{est.nombre} {est.apellidos}</td>
                  <td className="py-4 px-6 text-gray-700">{est.codigo_estudiante}</td>
                  <td className="py-4 px-6 text-gray-700">{getNombreGrado(est.grado_id)}</td>
                  <td className="py-4 px-6 text-gray-700">{getNombreSeccion(est.seccion_id)}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      est.estado === 'activo'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {est.estado === 'activo' ? '✓ Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(est)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(est.id)}
                      className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <p>No hay estudiantes que coincidan con los filtros</p>
        </div>
      )}
    </div>
  )
}
