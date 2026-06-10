import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quinielaApi } from '../services/api'

const LABEL = { L: 'Local', E: 'Empate', V: 'Visita' }
const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L']

export default function ResumenPage() {
  const [pronosticos, setPronosticos] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  useEffect(() => {
    quinielaApi.getMisPronosticos()
      .then(r => setPronosticos(r.data))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="spinner" />

  const porGrupo = GRUPOS.reduce((acc, g) => {
    acc[g] = pronosticos.filter(p => p.grupo === g)
    return acc
  }, {})

  const getClase = (r) => r === 'L' ? 'res-L' : r === 'E' ? 'res-E' : 'res-V'

  const getLabel = (p) => {
    if (p.resultado === 'L') return `${p.banderaLocal || ''} ${p.equipoLocal}`
    if (p.resultado === 'V') return `${p.banderaVisitante || ''} ${p.equipoVisitante}`
    return 'Empate'
  }

  return (
    <div>
      <div className="header">
        <div className="app-container">
          <h1>📋 Mis Pronósticos</h1>
          <div className="header-usuario">{usuario.nombre} · {pronosticos.length}/72 completados</div>
        </div>
      </div>

      <div className="app-container page-contenido">
        {pronosticos.length === 0 ? (
          <div className="card mt-24 text-center">
            <p style={{ color: 'var(--texto-suave)', marginBottom: 16 }}>
              Aún no has guardado ningún pronóstico.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/quiniela')}>
              ⚽ Llenar quiniela
            </button>
          </div>
        ) : (
          <>
            {/* Resumen estadístico */}
            <div className="card mt-16" style={{ display: 'flex', gap: 24, justifyContent: 'center', textAlign: 'center' }}>
              {['L','E','V'].map(r => {
                const count = pronosticos.filter(p => p.resultado === r).length
                const label = r === 'L' ? '🏠 Local' : r === 'E' ? '🤝 Empate' : '✈️ Visita'
                return (
                  <div key={r}>
                    <div style={{ fontSize: '1.8rem', fontFamily: 'Bebas Neue', color: r === 'L' ? '#80ffb0' : r === 'E' ? 'var(--dorado)' : '#90b8ff' }}>
                      {count}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)' }}>{label}</div>
                  </div>
                )
              })}
            </div>

            {GRUPOS.map(grupo => {
              const ps = porGrupo[grupo]
              if (!ps || ps.length === 0) return null
              return (
                <div key={grupo} className="mt-24">
                  <div className="grupo-header">
                    <span className="grupo-letra">Grupo {grupo}</span>
                    <span className="grupo-titulo">{ps.length} pronósticos</span>
                  </div>
                  <div className="resumen-grid" style={{ background: 'var(--gris-medio)', borderRadius: '0 0 var(--radio) var(--radio)', padding: 12, gap: 8 }}>
                    {ps.map(p => (
                      <div key={p.partidoId} className="resumen-partido">
                        <div className="resumen-equipos">
                          {p.banderaLocal} {p.equipoLocal} <span style={{ color: 'var(--texto-suave)', margin: '0 6px' }}>vs</span> {p.equipoVisitante} {p.banderaVisitante}
                        </div>
                        <div className={`resumen-resultado ${getClase(p.resultado)}`}>
                          {getLabel(p)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      <div className="nav-bottom">
        <button className="btn btn-primary" onClick={() => navigate('/quiniela')} style={{flex: 1}}>
          ✏️ Editar pronósticos
        </button>
        <button
          className="btn btn-danger"
          onClick={() => { localStorage.clear(); navigate('/') }}
          style={{flex: 0, padding: '10px 14px'}}
          title="Cerrar sesión"
        >🚪</button>
      </div>
    </div>
  )
}
