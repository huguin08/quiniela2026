import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quinielaApi } from '../services/api'

// Fuente de verdad: partidos agrupados por fecha
// Se usa SOLO para ordenar los días en el reporte y la vista
const ORDEN_DIAS = [
  '2026-06-11','2026-06-12','2026-06-13','2026-06-14','2026-06-15',
  '2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20',
  '2026-06-21','2026-06-22','2026-06-23','2026-06-24','2026-06-25',
  '2026-06-26','2026-06-27','2026-06-28','2026-06-29','2026-06-30',
]

function labelDia(fechaStr) {
  const d = new Date(fechaStr + 'T12:00:00')
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
}

function getRes(resultado, equipoLocal, equipoVisitante, flagL, flagV) {
  if (resultado === 'L') return `${flagL} ${equipoLocal}`
  if (resultado === 'V') return `${flagV} ${equipoVisitante}`
  return '🤝 Empate'
}

function getClase(r) {
  return r === 'L' ? 'res-L' : r === 'E' ? 'res-E' : 'res-V'
}

// Construye el mapa dia->partidos usando fechaPartido del backend (fuente real)
function construirMapaPorDia(datos) {
  const mapa = {} // { 'YYYY-MM-DD': [{ equipoLocal, equipoVisitante, grupo, banderaLocal, banderaVisitante }] }
  const vistos = new Set()

  datos.forEach(usuario => {
    usuario.pronosticos.forEach(p => {
      const key = `${p.equipoLocal}|${p.equipoVisitante}`
      if (vistos.has(key)) return
      vistos.add(key)

      // fechaPartido viene como '2026-06-14T15:00:00' — tomamos solo la fecha
      const fecha = p.fechaPartido
        ? p.fechaPartido.substring(0, 10)
        : null

      if (!fecha) return

      if (!mapa[fecha]) mapa[fecha] = []
      mapa[fecha].push({
        equipoLocal: p.equipoLocal,
        equipoVisitante: p.equipoVisitante,
        grupo: p.grupo,
        banderaLocal: p.banderaLocal,
        banderaVisitante: p.banderaVisitante,
        fechaPartido: p.fechaPartido,
      })
    })
  })

  // Ordenar partidos dentro de cada día por hora
  Object.keys(mapa).forEach(fecha => {
    mapa[fecha].sort((a, b) => a.fechaPartido.localeCompare(b.fechaPartido))
  })

  return mapa
}

function generarReporteHTML(datos, mapaPartidosPorDia) {
  const diasConPartidos = ORDEN_DIAS.filter(f => mapaPartidosPorDia[f]?.length > 0)

  const filas = diasConPartidos.map(fecha => {
    const psDelDia = mapaPartidosPorDia[fecha]
    return `
      <tr class="dia-row">
        <td colspan="${2 + datos.length}" class="dia-header">📅 ${labelDia(fecha)}</td>
      </tr>
      ${psDelDia.map(partido => {
        const celdas = datos.map(usuario => {
          const pron = usuario.pronosticos.find(p =>
            p.equipoLocal === partido.equipoLocal && p.equipoVisitante === partido.equipoVisitante)
          if (!pron) return '<td class="sin-pron">—</td>'
          const label = getRes(pron.resultado, pron.equipoLocal, pron.equipoVisitante, pron.banderaLocal, pron.banderaVisitante)
          const cls = pron.resultado === 'L' ? 'local' : pron.resultado === 'V' ? 'visita' : 'empate'
          return `<td class="${cls}">${label}</td>`
        }).join('')
        return `<tr>
          <td class="partido-cell">${partido.banderaLocal} ${partido.equipoLocal} vs ${partido.equipoVisitante} ${partido.banderaVisitante}</td>
          <td class="grupo-cell">G-${partido.grupo}</td>
          ${celdas}
        </tr>`
      }).join('')}
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Reporte Quiniela Quevaber Mundial 2026</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; color: #111; }
  h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
  p.sub { text-align: center; color: #666; margin-bottom: 16px; font-size: 11px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #1a5c2e; color: #FFD700; padding: 6px 8px; text-align: center; font-size: 10px; }
  th.partido-th { text-align: left; min-width: 180px; }
  td { padding: 5px 8px; border-bottom: 1px solid #ddd; text-align: center; }
  td.partido-cell { text-align: left; font-weight: 600; }
  td.grupo-cell { color: #888; font-size: 10px; }
  td.sin-pron { color: #ccc; }
  td.local { background: #e6f7ee; color: #1a5c2e; font-weight: 700; }
  td.empate { background: #fffbe6; color: #8a6900; font-weight: 700; }
  td.visita { background: #e8f0ff; color: #1a3a8a; font-weight: 700; }
  tr.dia-row td { background: #f0f0f0; font-weight: 700; font-size: 12px; padding: 8px; border-top: 2px solid #aaa; }
  @media print { body { margin: 8px; } }
</style>
</head>
<body>
<h1>⚽ Quiniela Quevaber · Mundial 2026</h1>
<p class="sub">Reporte generado el ${new Date().toLocaleString('es-MX')}</p>
<table>
  <thead>
    <tr>
      <th class="partido-th">Partido</th>
      <th>Grp</th>
      ${datos.map(u => `<th>${u.usuario}</th>`).join('')}
    </tr>
  </thead>
  <tbody>
    ${filas}
  </tbody>
</table>
</body>
</html>`
}

export default function AdminPage() {
  const [datos, setDatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [vistaActiva, setVistaActiva] = useState('tabla')
  const [filtroUsuario, setFiltroUsuario] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    quinielaApi.adminTodos()
      .then(r => setDatos(r.data))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) return <div className="spinner" />

  const mapaPartidosPorDia = construirMapaPorDia(datos)
  const diasConPartidos = ORDEN_DIAS.filter(f => mapaPartidosPorDia[f]?.length > 0)

  const abrirReporte = () => {
    const html = generarReporteHTML(datos, mapaPartidosPorDia)
    const ventana = window.open('', '_blank')
    ventana.document.write(html)
    ventana.document.close()
    setTimeout(() => ventana.print(), 500)
  }

  const datosFiltrados = filtroUsuario
    ? datos.filter(d => d.usuario.toLowerCase().includes(filtroUsuario.toLowerCase()))
    : datos

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

        {/* Botón reporte */}
        <button
          className="btn btn-dorado btn-block mt-16"
          onClick={abrirReporte}
          disabled={datos.length === 0}
        >
          📄 Generar reporte concentrado (por día · por participante)
        </button>

        {/* Tabs */}
        <div className="login-tabs mt-16">
          <button className={`login-tab ${vistaActiva === 'tabla' ? 'activo' : ''}`} onClick={() => setVistaActiva('tabla')}>
            📊 Pronósticos
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
                        <div className="progreso-bar-fill" style={{ width: `${(d.completados / d.total) * 100}%` }} />
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

            {diasConPartidos.map(fecha => {
              const psDelDia = mapaPartidosPorDia[fecha]
              return (
                <div key={fecha} className="mt-24">
                  <div className="grupo-header">
                    <span className="grupo-letra" style={{ fontSize: '1rem' }}>📅</span>
                    <span className="grupo-titulo" style={{ color: 'var(--blanco)', fontWeight: 700, fontSize: '1rem' }}>
                      {labelDia(fecha)} · {psDelDia.length} partido{psDelDia.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  {psDelDia.map(partido => (
                    <div key={`${partido.equipoLocal}-${partido.equipoVisitante}`}
                      style={{ background: 'var(--gris-medio)', borderBottom: '1px solid #2a2a2a', padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
                        {partido.banderaLocal} {partido.equipoLocal}
                        <span style={{ color: 'var(--texto-suave)', margin: '0 8px' }}>vs</span>
                        {partido.equipoVisitante} {partido.banderaVisitante}
                        <span style={{ marginLeft: 8, fontSize: '0.72rem', color: 'var(--dorado)', background: '#2a2a00', padding: '2px 8px', borderRadius: 12 }}>
                          Grupo {partido.grupo}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {datosFiltrados.map(u => {
                          const pron = u.pronosticos.find(p =>
                            p.equipoLocal === partido.equipoLocal && p.equipoVisitante === partido.equipoVisitante)
                          return (
                            <div key={u.usuario} style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80 }}>
                              <span style={{ color: 'var(--texto-suave)' }}>{u.usuario}</span>
                              {pron ? (
                                <span className={`resumen-resultado ${getClase(pron.resultado)}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                  {getRes(pron.resultado, pron.equipoLocal, pron.equipoVisitante, pron.banderaLocal, pron.banderaVisitante)}
                                </span>
                              ) : (
                                <span style={{ color: '#555', fontSize: '0.7rem' }}>—</span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="nav-bottom">
        <button
          className="btn btn-danger"
          onClick={() => { localStorage.clear(); navigate('/') }}
          style={{ flex: 0, padding: '10px 18px' }}
        >🚪 Salir</button>
      </div>
    </div>
  )
}
