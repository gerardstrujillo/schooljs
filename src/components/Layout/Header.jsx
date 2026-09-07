import { useAuth } from '../../hooks/useAuth.jsx'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Sistema de Riesgo Académico
          </h1>
          <p className="text-sm text-gray-600">
            I.E.P. Los Ingenieros - Chincha, 2026
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700">{user?.email}</p>
          <p className="text-xs text-gray-500">Docente</p>
        </div>
      </div>
    </header>
  )
}
