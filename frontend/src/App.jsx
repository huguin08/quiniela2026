import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import QuinielaPage from './pages/QuinielaPage'
import ResumenPage from './pages/ResumenPage'
import AdminPage from './pages/AdminPage'

function isAutenticado() {
  return !!localStorage.getItem('token')
}

function isAdmin() {
  try {
    const u = JSON.parse(localStorage.getItem('usuario') || '{}')
    return u.esAdmin === true
  } catch { return false }
}

function PrivateRoute({ children }) {
  return isAutenticado() ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  return isAdmin() ? children : <Navigate to="/quiniela" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/quiniela" element={<PrivateRoute><QuinielaPage /></PrivateRoute>} />
      <Route path="/resumen" element={<PrivateRoute><ResumenPage /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
