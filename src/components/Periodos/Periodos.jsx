import { useState, useEffect } from 'react'
import { periodoService } from '../../services/periodoService'

export default function Periodos() {
  const [periodos, setPeriodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nombre: '',
    numero: '',
    año: new Date().getFullYear(),
    fechaInicio: '',
    fechaFin: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    cargarPeriodos()
  }, [])

  const cargarPeriodos = async () => {
    try {
      const { data, error } = await periodoService.getAll()
      if (error) throw error
      setPeriodos(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre || !formData.numero || !formData.año) {
      setError('Completa los campos requeridos')
      return
    }

    try {
      if (editingId) {
        const { error } = await periodoService.update(
          editingId,
          formData.nombre,
          parseInt(formData.numero),
          parseInt(formData.año),
          formData.fechaInicio,
          formData.fechaFin
        )
        if (error) throw error
      } else {
        const { error } = await periodoService.create(
          formData.nombre,
          parseInt(formData.numero),
          parseInt(formData.año),
          formData.fechaInicio,
          formData.fechaFin
        )
        if (error) throw error
      }

      setFormData({
        nombre: '',
        numero: '',
        año: new Date().getFullYear(),
        fechaInicio: '',
        fechaFin: ''
      })
      setEditingId(null)
      setShowForm(false)
      await cargarPeriodos()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEdit = (periodo) => {
    setEditingId(periodo.id)
    setFormData({
      nombre: periodo.nombre,
      numero: periodo.numero,
      año: periodo.año,
      fechaInicio: periodo.fecha_inicio || '',
      fechaFin: periodo.fecha_fin || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro?')) {
      try {
        const { error } = await periodoService.delete(id)
        if (error) throw error
        await cargarPeriodos()
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
      numero: '',
      año: new Date().getFullYear(),
      fechaInicio: '',
      fechaFin: ''
    })
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando períodos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Períodos Académicos</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            + Nuevo Período
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
            {editingId ? 'Editar Período' : 'Nuevo Período'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Primer bimestre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número (1-4)
                </label>
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={formData.numero}
                  onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  value={formData.año}
                  onChange={(e) => setFormData({ ...formData, año: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin
                </label>
                <input
                  type="date"
                  value={formData.fechaFin}
                  onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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

      {periodos.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Nombre</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Número</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Año</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Inicio</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Fecha Fin</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {periodos.map(periodo => (
                <tr key={periodo.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900 font-medium">{periodo.nombre}</td>
                  <td className="py-4 px-6 text-center text-gray-700">{periodo.numero}</td>
                  <td className="py-4 px-6 text-center text-gray-700">{periodo.año}</td>
                  <td className="py-4 px-6 text-gray-700">{periodo.fecha_inicio || '-'}</td>
                  <td className="py-4 px-6 text-gray-700">{periodo.fecha_fin || '-'}</td>
                  <td className="py-4 px-6 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(periodo)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(periodo.id)}
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
          <p>No hay períodos registrados. ¡Crea el primero!</p>
        </div>
      )}
    </div>
  )
}
