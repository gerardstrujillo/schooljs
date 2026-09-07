import { useState, useEffect } from 'react'
import { notasService } from '../../services/notasService'
import { gradoService } from '../../services/gradoService'
import { seccionService } from '../../services/seccionService'
import { cursoService } from '../../services/cursoService'
import { periodoService } from '../../services/periodoService'
import { estudianteService } from '../../services/estudianteService'
import { useAuth } from '../../hooks/useAuth'

export default function RegistroNotas() {
  const { user } = useAuth()
  const [notas, setNotas] = useState([])
  const [grados, setGrados] = useState([])
  const [secciones, setSecciones] = useState([])
  const [cursos, setCursos] = useState([])
  const [periodos, setPeriodos] = useState([])
  const [estudiantes, setEstudiantes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingNota, setEditingNota] = useState(null)

  const [filtros, setFiltros] = useState({
    gradoId: '',
    seccionId: '',
    cursoId: '',
    periodoId: ''
  })

  const [nuevaNota, setNuevaNota] = useState({
    estudianteId: '',
    nota: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const { data: gradosData } = await gradoService.getAll()
      const { data: cursosData } = await cursoService.getAll()
      const { data: periodosData } = await periodoService.getAll()

      setGrados(gradosData || [])
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

  useEffect(() => {
    if (filtros.gradoId && filtros.seccionId) {
      cargarEstudiantes()
    }
  }, [filtros.gradoId, filtros.seccionId])

  useEffect(() => {
    if (filtros.gradoId && filtros.seccionId && filtros.cursoId && filtros.periodoId) {
      cargarNotas()
    }
  }, [filtros.gradoId, filtros.seccionId, filtros.cursoId, filtros.periodoId])

  const cargarSeccionesPorGrado = async () => {
    try {
      const { data } = await seccionService.getByGrado(filtros.gradoId)
      setSecciones(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarEstudiantes = async () => {
    try {
      const { data } = await estudianteService.getByGradoSeccion(filtros.gradoId, filtros.seccionId)
      setEstudiantes(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const cargarNotas = async () => {
    try {
      const { data } = await notasService.getByGradoSeccionCurso(
        filtros.gradoId,
        filtros.seccionId,
        filtros.cursoId,
        filtros.periodoId
      )
      setNotas(data || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRegistrarNota = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!nuevaNota.estudianteId || !nuevaNota.nota) {
      setError('Selecciona un estudiante e ingresa la nota')
      return
    }

    const notaNum = parseFloat(nuevaNota.nota)
    if (notaNum < 0 || notaNum > 20) {
      setError('La nota debe estar entre 0 y 20')
      return
    }

    try {
      if (editingNota) {
        const { error } = await notasService.update(editingNota.id, notaNum)
        if (error) throw error
        setSuccess('Nota actualizada correctamente')
        setEditingNota(null)
      } else {
        const { error } = await notasService.create(
          nuevaNota.estudianteId,
          filtros.cursoId,
          filtros.periodoId,
          notaNum,
          user.id
        )
        if (error) throw error
        setSuccess('Nota registrada correctamente')
      }

      setNuevaNota({ estudianteId: '', nota: '' })
      await cargarNotas()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleEditarNota = (nota) => {
    setEditingNota(nota)
    setNuevaNota({
      estudianteId: nota.estudiante_id,
      nota: nota.nota.toString()
    })
  }

  const handleEliminarNota = async (id) => {
    if (confirm('¿Eliminar esta nota?')) {
      try {
        const { error } = await notasService.delete(id)
        if (error) throw error
        setSuccess('Nota eliminada')
        await cargarNotas()
      } catch (err) {
        setError(err.message)
      }
    }
  }

  const handleCancelarEdicion = () => {
    setEditingNota(null)
    setNuevaNota({ estudianteId: '', nota: '' })
  }

  const getNombreEstudiante = (id) => {
    const est = estudiantes.find(e => e.id === id)
    return est ? `${est.nombre} ${est.apellidos}` : 'N/A'
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Registro de Notas</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Filtros */}
      <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Selecciona los datos</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grado</label>
            <select
              value={filtros.gradoId}
              onChange={(e) => setFiltros({ ...filtros, gradoId: e.target.value })}
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
              value={filtros.seccionId}
              onChange={(e) => setFiltros({ ...filtros, seccionId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!filtros.gradoId}
            >
              <option value="">Seleccionar sección</option>
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
              disabled={!filtros.seccionId}
            >
              <option value="">Seleccionar curso</option>
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
              disabled={!filtros.cursoId}
            >
              <option value="">Seleccionar período</option>
              {periodos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formulario para registrar nota */}
      {filtros.periodoId && (
        <div className="mb-8 bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            {editingNota ? 'Editar Nota' : 'Registrar Nueva Nota'}
          </h2>
          <form onSubmit={handleRegistrarNota} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estudiante</label>
                <select
                  value={nuevaNota.estudianteId}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, estudianteId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editingNota}
                >
                  <option value="">Seleccionar estudiante</option>
                  {estudiantes.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nota (0-20)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={nuevaNota.nota}
                  onChange={(e) => setNuevaNota({ ...nuevaNota, nota: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="15"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
              >
                {editingNota ? 'Actualizar Nota' : 'Registrar Nota'}
              </button>
              {editingNota && (
                <button
                  type="button"
                  onClick={handleCancelarEdicion}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tabla de notas */}
      {notas.length > 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estudiante</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Nota</th>
                <th className="text-left py-4 px-6 font-semibold text-gray-700">Estado</th>
                <th className="text-center py-4 px-6 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notas.map(nota => (
                <tr key={nota.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-900">{getNombreEstudiante(nota.estudiante_id)}</td>
                  <td className="py-4 px-6 text-center font-bold text-gray-900">{nota.nota}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      nota.estado === 'aprobado'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {nota.estado === 'aprobado' ? '✓ Aprobado' : '✗ Desaprobado'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center space-x-2">
                    <button
                      onClick={() => handleEditarNota(nota)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded text-sm font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleEliminarNota(nota.id)}
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
      ) : filtros.periodoId ? (
        <div className="text-center py-12 text-gray-500">
          <p>No hay notas registradas para esta selección</p>
        </div>
      ) : null}
    </div>
  )
}
