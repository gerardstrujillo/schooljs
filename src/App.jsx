import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth.jsx'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Login from './components/Auth/Login'
import Dashboard from './components/Dashboard/Dashboard'
import Grados from './components/Grados/Grados'
import Secciones from './components/Secciones/Secciones'
import Cursos from './components/Cursos/Cursos'
import Periodos from './components/Periodos/Periodos'
import Estudiantes from './components/Estudiantes/Estudiantes'
import RegistroNotas from './components/Notas/RegistroNotas'
import ConsultaNotas from './components/Notas/ConsultaNotas'
import RiesgoAcademico from './components/RiesgoAcademico/RiesgoAcademico'
import PuntosCriticos from './components/PuntosCriticos/PuntosCriticos'
import AsistenteIA from './components/AsistenteIA/AsistenteIA'

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/grados"
            element={
              <ProtectedRoute>
                <Grados />
              </ProtectedRoute>
            }
          />

          <Route
            path="/secciones"
            element={
              <ProtectedRoute>
                <Secciones />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cursos"
            element={
              <ProtectedRoute>
                <Cursos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/periodos"
            element={
              <ProtectedRoute>
                <Periodos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estudiantes"
            element={
              <ProtectedRoute>
                <Estudiantes />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notas"
            element={
              <ProtectedRoute>
                <RegistroNotas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/consulta-notas"
            element={
              <ProtectedRoute>
                <ConsultaNotas />
              </ProtectedRoute>
            }
          />

          <Route
            path="/riesgo"
            element={
              <ProtectedRoute>
                <RiesgoAcademico />
              </ProtectedRoute>
            }
          />

          <Route
            path="/puntos-criticos"
            element={
              <ProtectedRoute>
                <PuntosCriticos />
              </ProtectedRoute>
            }
          />

          <Route
            path="/asistente-ia"
            element={
              <ProtectedRoute>
                <AsistenteIA />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
