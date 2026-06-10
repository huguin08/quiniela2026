import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quinielaApi } from '../services/api'

export default function AdminPage() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vistaActiva, setVistaActiva] = useState('tabla') // 'tabla' | 'posiciones'
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    quinielaApi.adminTodos()
      .then(r => setDatos(r.data))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="spinner" />

  const getClase = (r) => r === 'L' ? 'res-L' : r === 'E' ? 'res-E' : 'res-V'
  const getEtiqueta = (r, local, visita, flagL, flagV) => {
    if (r === 'L') return `${flagL} ${local}`
    if (r === 'V') return `${flagV} ${visita}`
    return '🤝 Empate'
  }

  const datosFiltrados = filtroUsuario
    ? datos.filter(d => d.usuario.toLowerCase().includes(filtroUsuario.toLowerCase()))
    : datos

  // Tabla de posiciones: quien tiene más pronósticos completos
  const tablaPos = [...datos].sort((a, b) => b.completados - a.completados)

  return (
    <div>
      <div className="header">
        <div className="app-container">
          <h1>🔐 Panel Admin</h1>
          <div className="subtitulo">Quiniela Quevaber Mundial 2026</div>
        </div>
      </div>

      <div className="app-container page-contenido">
        {/* Stats generales */}
        <div className="card mt-16" style={{ display: 'flex', gap: 24, justifyContent: 'center', textAlign: 'center', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '2rem', fontFamily: 'Bebas Neue', color: 'var(--dorado)' }}>{datos.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)' }}>Participantes</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontFamily: 'Bebas Neue', color: '#80ffb0' }}>
              {datos.filter(d => d.completados === d.total).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)' }}>Completas</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontFamily: 'Bebas Neue', color: '#90b8ff' }}>
              {datos.reduce((s, d) => s + d.completados, 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)' }}>Total pronósticos</div>
          </div>
        </div>

        {/* Tabs vista */}
        <div className="login-tabs mt-16">
          <button className={`login-tab ${vistaActiva === 'tabla' ? 'activo' : ''}`} onClick={() => setVistaActiva('tabla')}>
            📊 Todos los pronósticos
          </button>
          <button className={`login-tab ${vistaActiva === 'posiciones' ? 'activo' : ''}`} onClick={() => setVistaActiva('posiciones')}>
            🏆 Participantes
          </button>
        </div>

        {vistaActiva === 'posiciones' && (
          <div className="card mt-16">
            <table className="admin-tabla" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Participante</th>
                  <th>Completados</th>
                  <th>Avance</th>
                </tr>
              </thead>
              <tbody>
                {tablaPos.map((d, i) => (
                  <tr key={d.usuario}>
                    <td style={{ color: 'var(--dorado)', fontWeight: 700 }}>{i + 1}</td>
                    <td>{d.usuario}</td>
                    <td className={d.completados === d.total ? 'badge-completado' : 'badge-incompleto'}>
                      {d.completados}/{d.total}
                    </td>
                    <td>
                      <div className="progreso-bar-wrap" style={{ margin: '4px 0', height: 6 }}>
                        <div className="progreso-bar-fill" style={{ width: `${(d.completados/d.total)*100}%` }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {vistaActiva === 'tabla' && (
          <div>
            <div className="form-group mt-16">
              <input
                className="input-field"
                type="text"
                placeholder="🔍 Buscar participante..."
                value={filtroUsuario}
                onChange={e => setFiltroUsuario(e.target.value)}
              />
            </div>

            {datosFiltrados.map(d => (
              <div key={d.usuario} className="mt-16">
                <div className="grupo-header" style={{ borderRadius: 'var(--radio) var(--radio) 0 0' }}>
                  <span className="grupo-letra" style={{ fontSize: '1.1rem' }}>👤</span>
                  <span className="grupo-titulo" style={{ color: 'var(--blanco)', fontWeight: 700 }}>{d.usuario}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: d.completados === d.total ? '#80ffb0' : 'var(--dorado)' }}>
                    {d.completados}/{d.total}
                  </span>
                </div>
                <div style={{ background: 'var(--gris-medio)', borderRadius: '0 0 var(--radio) var(--radio)', padding: 12 }}>
                  {d.pronosticos.length === 0 ? (
                    <p style={{ color: 'var(--texto-suave)', fontSize: '0.85rem', padding: '8px 0' }}>Sin pronósticos aún</p>
                  ) : (
                    <div className="resumen-grid">
                      {d.pronosticos.map(p => (
                        <div key={p.partidoId} className="resumen-partido">
                          <div className="resumen-equipos" style={{ fontSize: '0.83rem' }}>
                            <span style={{ color: 'var(--texto-suave)', fontSize: '0.7rem', marginRight: 6 }}>G{p.grupo}</span>
                            {p.banderaLocal} {p.equipoLocal} vs {p.equipoVisitante} {p.banderaVisitante}
                          </div>
                          <div className={`resumen-resultado ${getClase(p.resultado)}`} style={{ fontSize: '0.78rem' }}>
                            {getEtiqueta(p.resultado, p.equipoLocal, p.equipoVisitante, p.banderaLocal, p.banderaVisitante)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="nav-bottom">
        <button
          className="btn btn-danger"
          onClick={() => { localStorage.clear(); navigate('/') }}
          style={{flex: 0, padding: '10px 18px'}}
        >🚪 Salir</button>
      </div>
    </div>
  )
}
