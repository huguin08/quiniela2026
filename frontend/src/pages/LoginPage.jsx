import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

export default function LoginPage() {
  const [tab, setTab] = useState('usuario') // 'usuario' | 'admin'
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleUsuario = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) { setError('Escribe tu nombre'); return }
    setCargando(true); setError('')
    try {
      const { data } = await authApi.acceso(nombre.trim())
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify({ nombre: data.nombre, esAdmin: false }))
      navigate('/quiniela')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al ingresar')
    } finally { setCargando(false) }
  }

  const handleAdmin = async (e) => {
    e.preventDefault()
    setCargando(true); setError('')
    try {
      const { data } = await authApi.adminLogin('admin', password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify({ nombre: 'admin', esAdmin: true }))
      navigate('/admin')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas')
    } finally { setCargando(false) }
  }

  return (
    <div className="login-page">
      <div className="login-logo">⚽</div>
      <h1 className="login-titulo">Quiniela<br/>Quevaber</h1>
      <p className="login-subtitulo">Mundial 2026 · USA · México · Canadá</p>

      <div className="login-card">
        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'usuario' ? 'activo' : ''}`}
            onClick={() => { setTab('usuario'); setError('') }}
          >👤 Soy participante</button>
          <button
            className={`login-tab ${tab === 'admin' ? 'activo' : ''}`}
            onClick={() => { setTab('admin'); setError('') }}
          >🔐 Admin</button>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        {tab === 'usuario' ? (
          <form onSubmit={handleUsuario}>
            <div className="form-group">
              <label className="form-label">¿Cómo te llamas?</label>
              <input
                className="input-field"
                type="text"
                placeholder="Tu nombre o apodo..."
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                maxLength={60}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block mt-16"
              disabled={cargando}
            >
              {cargando ? 'Cargando...' : '¡Entrar a la quiniela! ⚽'}
            </button>
            <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--texto-suave)', textAlign: 'center' }}>
              Si ya llenaste tu quiniela, te reconoceremos por tu nombre.
            </p>
          </form>
        ) : (
          <form onSubmit={handleAdmin}>
            <div className="form-group">
              <label className="form-label">Contraseña de administrador</label>
              <input
                className="input-field"
                type="password"
                placeholder="Contraseña..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-dorado btn-block mt-16"
              disabled={cargando}
            >
              {cargando ? 'Verificando...' : '🔐 Acceder como admin'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
