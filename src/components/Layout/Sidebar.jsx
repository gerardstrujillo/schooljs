import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/estudiantes', label: 'Estudiantes', icon: '👥' },
    { path: '/notas', label: 'Notas', icon: '📝' },
    { path: '/grados', label: 'Grados', icon: '🎓' },
    { path: '/secciones', label: 'Secciones', icon: '📋' },
    { path: '/cursos', label: 'Cursos', icon: '📚' },
    { path: '/periodos', label: 'Períodos', icon: '📅' },
    { path: '/riesgo', label: 'Riesgo Académico', icon: '⚠️' },
    { path: '/puntos-criticos', label: 'Puntos Críticos', icon: '🚨' },
    { path: '/asistente-ia', label: 'Asistente IA', icon: '🤖' },
  ]

  const handleLogout = async () => {
    await logout()
  }

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold">SIRA</h2>
        <p className="text-xs text-gray-400">Sistema Inteligente</p>
      </div>

      <nav className="px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block px-4 py-3 rounded-lg transition ${
              isActive(item.path)
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800'
            }`}
          >
            <span className="inline-block mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium"
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
