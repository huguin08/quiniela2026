import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'

export default function LoginPage() {
  const [tab, setTab] = useState('usuario')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  // Si ya hay sesión activa válida, redirigir directo
  useEffect(() => {
    const token = localStorage.getItem('token')
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
    if (token && usuario.nombre) {
      navigate(usuario.esAdmin ? '/admin' : '/quiniela', { replace: true })
    }
  }, [navigate])

  const handleUsuario = async (e) => {
    e.preventDefault()
    const nombreLimpio = nombre.trim()
    if (!nombreLimpio) { setError('Escribe tu nombre'); return }
    setCargando(true); setError('')
    try {
      const { data } = await authApi.acceso(nombreLimpio)
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify({ nombre: data.nombre, esAdmin: false }))
      // yaRegistrado = true significa que ya tenía pronósticos, mandamos directo al resumen
      navigate(data.yaRegistrado ? '/resumen' : '/quiniela', { replace: true })
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al ingresar, intenta de nuevo')
    } finally { setCargando(false) }
  }

  const handleAdmin = async (e) => {
    e.preventDefault()
    if (!password.trim()) { setError('Escribe la contraseña'); return }
    setCargando(true); setError('')
    try {
      const { data } = await authApi.adminLogin('admin', password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('usuario', JSON.stringify({ nombre: 'admin', esAdmin: true }))
      navigate('/admin', { replace: true })
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
                onChange={e => { setNombre(e.target.value); setError('') }}
                maxLength={60}
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-block mt-16"
              disabled={cargando}
            >
              {cargando ? 'Buscando...' : '¡Entrar a la quiniela! ⚽'}
            </button>
            <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--texto-suave)', textAlign: 'center' }}>
              Si ya llenaste tu quiniela, te reconoceremos por tu nombre y verás tus pronósticos.
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
                onChange={e => { setPassword(e.target.value); setError('') }}
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
