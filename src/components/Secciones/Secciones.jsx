import { useState, useEffect } from 'react'
import { seccionService } from '../../services/seccionService'
import { gradoService } from '../../services/gradoService'

export default function Secciones() {
  const [secciones, setSecciones] = useState([])
  const [grados, setGrados] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', gradoId: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: gradosData, error: errorGrados } = await gradoService.getAll()
      if (errorGrados) throw errorGrados

      const { data: seccionesData, error: errorSecciones } = await seccionService.getAll()
      if (errorSecciones) throw errorSecciones

      setGrados(gradosData || [])
      setSecciones(seccionesData || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre || !formData.gradoId) {
      setError('Completa todos los campos')
      return
    }

    try {
      if (editingId) {
        const { error } = await seccionService.update(editingId, formData.nombre, formData.gradoId)
        if (error) throw error
      } else {
        const { error } = await seccionService.create(formData.nombre, formData.gradoId)
        if (error) throw error
      }

      setFormData({ nombre: '', gradoId: '' })
      setEditingId(null)
      setShowForm(false)
      await cargarDatos()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (seccion) => {
    setEditingId(seccion.id)
    setFormData({ nombre: seccion.nombre, gradoId: seccion.grado_id })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        const { error } = await seccionService.delete(id)
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
    setFormData({ nombre: '', gradoId: '' })
    setError('')
  }

  const getNombreGrado = (gradoId) => {
    return grados.find(g => g.id === gradoId)?.nombre || 'N/A'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando secciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Secciones</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + Nueva Sección
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
            {editingId ? 'Editar Sección' : 'Nueva Sección'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre (ej: A, B, C)
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grado
                </label>
                <select
                  value={formData.gradoId}
                  onChange={(e) => setFormData({ ...formData, gradoId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar grado</option>
                  {grados.map(g => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
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

      {secciones.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Grado</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {secciones.map(seccion => (
                <tr key={seccion.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">{seccion.nombre}</td>
                  <td className="py-4 px-6 text-gray-700">{getNombreGrado(seccion.grado_id)}</td>
                  <td className="py-4 px-6 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(seccion)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(seccion.id)}
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
          <p>No hay secciones registradas. ¡Crea la primera!</p>
        </div>
      )}
    </div>
  )
}
