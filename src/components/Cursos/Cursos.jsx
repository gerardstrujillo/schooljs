import { useState, useEffect } from 'react'
import { cursoService } from '../../services/cursoService'

export default function Cursos() {
  const [cursos, setCursos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({ nombre: '', codigo: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    cargarCursos()
  }, [])

  const cargarCursos = async () => {
    try {
      const { data, error } = await cursoService.getAll()
      if (error) throw error
      setCursos(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre || !formData.codigo) {
      setError('Completa todos los campos')
      return
    }

    try {
      if (editingId) {
        const { error } = await cursoService.update(editingId, formData.nombre, formData.codigo)
        if (error) throw error
      } else {
        const { error } = await cursoService.create(formData.nombre, formData.codigo)
        if (error) throw error
      }

      setFormData({ nombre: '', codigo: '' })
      setEditingId(null)
      setShowForm(false)
      await cargarCursos()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (curso) => {
    setEditingId(curso.id)
    setFormData({ nombre: curso.nombre, codigo: curso.codigo })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        const { error } = await cursoService.delete(id)
        if (error) throw error
        await cargarCursos()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ nombre: '', codigo: '' })
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Cursos</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + Nuevo Curso
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
            {editingId ? 'Editar Curso' : 'Nuevo Curso'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Matemática"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código
              </label>
              <input
                type="text"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MAT"
              />
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

      {cursos.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nombre</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Código</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cursos.map(curso => (
                <tr key={curso.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">{curso.nombre}</td>
                  <td className="py-4 px-6 text-gray-700">{curso.codigo}</td>
                  <td className="py-4 px-6 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(curso)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(curso.id)}
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
          <p>No hay cursos registrados. ¡Crea el primero!</p>
        </div>
      )}
    </div>
  )
}
