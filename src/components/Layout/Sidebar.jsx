import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.jsx'
import { BarChart3, Users, ClipboardList, GraduationCap, List, BookOpen, Calendar, AlertTriangle, AlertOctagon, Bot, LogOut } from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  const { logout } = useAuth()

  const isActive = (path) => location.pathname === path

  const iconMap = {
    dashboard: BarChart3,
    estudiantes: Users,
    notas: ClipboardList,
    grados: GraduationCap,
    secciones: List,
    cursos: BookOpen,
    periodos: Calendar,
    riesgo: AlertTriangle,
    puntosCriticos: AlertOctagon,
    asistente: Bot,
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/estudiantes', label: 'Estudiantes', icon: 'estudiantes' },
    { path: '/notas', label: 'Notas', icon: 'notas' },
    { path: '/grados', label: 'Grados', icon: 'grados' },
    { path: '/secciones', label: 'Secciones', icon: 'secciones' },
    { path: '/cursos', label: 'Cursos', icon: 'cursos' },
    { path: '/periodos', label: 'Períodos', icon: 'periodos' },
    { path: '/riesgo', label: 'Riesgo Académico', icon: 'riesgo' },
    { path: '/puntos-criticos', label: 'Puntos Críticos', icon: 'puntosCriticos' },
    { path: '/asistente-ia', label: 'Asistente IA', icon: 'asistente' },
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
        {menuItems.map((item) => {
          const IconComponent = iconMap[item.icon]
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition ${
                isActive(item.path)
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-6 left-4 right-4">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition text-sm font-medium gap-2"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
