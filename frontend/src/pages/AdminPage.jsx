import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quinielaApi } from '../services/api'

const DIAS = [
  { fecha: '2026-06-11', label: '11 Jun', partidos: ['México vs Sudáfrica','Corea del Sur vs Chequia'] },
  { fecha: '2026-06-12', label: '12 Jun', partidos: ['Canadá vs Bosnia y Herz.','Estados Unidos vs Paraguay'] },
  { fecha: '2026-06-13', label: '13 Jun', partidos: ['Qatar vs Suiza','Brasil vs Marruecos','Haití vs Escocia','Australia vs Turquía'] },
  { fecha: '2026-06-14', label: '14 Jun', partidos: ['Alemania vs Curazao','Países Bajos vs Japón','Costa de Marfil vs Ecuador','Túnez vs Suecia'] },
  { fecha: '2026-06-15', label: '15 Jun', partidos: ['España vs Cabo Verde','Bélgica vs Egipto','Arabia Saudí vs Uruguay','Irán vs Nueva Zelanda'] },
  { fecha: '2026-06-16', label: '16 Jun', partidos: ['Francia vs Senegal','Irak vs Noruega','Argentina vs Argelia','Austria vs Jordania'] },
  { fecha: '2026-06-17', label: '17 Jun', partidos: ['Portugal vs Congo DR','Inglaterra vs Croacia','Ghana vs Panamá','Uzbekistán vs Colombia'] },
  { fecha: '2026-06-18', label: '18 Jun', partidos: ['Chequia vs Sudáfrica','Suiza vs Bosnia y Herz.','Canadá vs Qatar','México vs Corea del Sur'] },
  { fecha: '2026-06-19', label: '19 Jun', partidos: ['Estados Unidos vs Australia','Escocia vs Marruecos','Brasil vs Haití','Turquía vs Paraguay'] },
  { fecha: '2026-06-20', label: '20 Jun', partidos: ['Ecuador vs Alemania','Japón vs Suecia','Curazao vs Costa de Marfil','Países Bajos vs Túnez'] },
  { fecha: '2026-06-21', label: '21 Jun', partidos: ['España vs Arabia Saudí','Bélgica vs Irán','Cabo Verde vs Uruguay','Egipto vs Nueva Zelanda'] },
  { fecha: '2026-06-22', label: '22 Jun', partidos: ['Senegal vs Irak','Argentina vs Austria','Francia vs Noruega','Argelia vs Jordania'] },
  { fecha: '2026-06-23', label: '23 Jun', partidos: ['Congo DR vs Uzbekistán','Croacia vs Ghana','Portugal vs Colombia','Panamá vs Inglaterra'] },
  { fecha: '2026-06-24', label: '24 Jun', partidos: ['México vs Chequia','Sudáfrica vs Corea del Sur'] },
  { fecha: '2026-06-25', label: '25 Jun', partidos: ['Bosnia y Herz. vs Suiza','Qatar vs Canadá'] },
  { fecha: '2026-06-26', label: '26 Jun', partidos: ['Marruecos vs Escocia','Haití vs Brasil'] },
  { fecha: '2026-06-27', label: '27 Jun', partidos: ['Turquía vs Estados Unidos','Paraguay vs Australia','Ecuador vs Curazao','Costa de Marfil vs Alemania','Japón vs Túnez','Suecia vs Países Bajos','Irán vs Nueva Zelanda','Egipto vs Bélgica'] },
  { fecha: '2026-06-28', label: '28 Jun', partidos: ['Cabo Verde vs Uruguay','Arabia Saudí vs España','Senegal vs Noruega','Irak vs Francia'] },
  { fecha: '2026-06-29', label: '29 Jun', partidos: ['Austria vs Jordania','Argelia vs Argentina','Congo DR vs Colombia','Uzbekistán vs Portugal'] },
  { fecha: '2026-06-30', label: '30 Jun', partidos: ['Croacia vs Panamá','Ghana vs Inglaterra'] },
]

function getRes(resultado, equipoLocal, equipoVisitante, flagL, flagV) {
  if (resultado === 'L') return `${flagL} ${equipoLocal}`
  if (resultado === 'V') return `${flagV} ${equipoVisitante}`
  return '🤝 Empate'
}

function getClase(r) {
  return r === 'L' ? 'res-L' : r === 'E' ? 'res-E' : 'res-V'
}

// Genera el HTML del reporte para abrir en nueva ventana / imprimir
function generarReporteHTML(datos, partidosPorDia) {
  const filas = DIAS.map(dia => {
    const psDelDia = partidosPorDia[dia.fecha] || []
    if (psDelDia.length === 0) return ''

    return `
      <tr class="dia-row">
        <td colspan="${2 + datos.length}" class="dia-header">📅 ${dia.label}</td>
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
  th { background: #1a5c2e; color: #FFD700; padding: 6px 8px; text-align: center; font-size: 10px; position: sticky; top: 0; }
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

  // Agrupar partidos por fecha para la vista concentrada
  const partidosPorDia = {}
  if (datos.length > 0) {
    const todosLosPartidos = []
    datos.forEach(u => {
      u.pronosticos.forEach(p => {
        const key = `${p.equipoLocal}-${p.equipoVisitante}`
        if (!todosLosPartidos.find(x => `${x.equipoLocal}-${x.equipoVisitante}` === key)) {
          todosLosPartidos.push(p)
        }
      })
    })
    todosLosPartidos.forEach(p => {
      const fecha = p.fechaModificacion ? p.fechaModificacion.substring(0, 10) : ''
      // Mapear partido a su día real usando el grupo y equipos
      DIAS.forEach(dia => {
        const match = dia.partidos.some(dp => {
          const [local, vis] = dp.split(' vs ')
          return p.equipoLocal.includes(local.trim()) || local.trim().includes(p.equipoLocal)
        })
      })
    })
  }

  // Construir mapa dia -> partidos usando DIAS como fuente de verdad
  const mapaPartidosPorDia = {}
  DIAS.forEach(dia => {
    mapaPartidosPorDia[dia.fecha] = []
    dia.partidos.forEach(dp => {
      const [localLabel, visLabel] = dp.split(' vs ')
      // Buscar partido real en los pronosticos de cualquier usuario
      let partidoRef = null
      for (const u of datos) {
        partidoRef = u.pronosticos.find(p =>
          p.equipoLocal.toLowerCase().includes(localLabel.trim().toLowerCase().substring(0, 5)) ||
          localLabel.trim().toLowerCase().includes(p.equipoLocal.toLowerCase().substring(0, 5))
        )
        if (partidoRef) break
      }
      // Si no encontramos referencia exacta, buscamos por texto parcial más amplio
      for (const u of datos) {
        const found = u.pronosticos.find(p => {
          const localMatch = p.equipoLocal.toLowerCase().split(' ').some(w =>
            w.length > 3 && localLabel.toLowerCase().includes(w))
          return localMatch
        })
        if (found && !mapaPartidosPorDia[dia.fecha].find(x =>
          x.equipoLocal === found.equipoLocal && x.equipoVisitante === found.equipoVisitante)) {
          mapaPartidosPorDia[dia.fecha].push(found)
          break
        }
      }
    })
  })

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

        {/* Botón reporte concentrado */}
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

            {/* Vista agrupada por día */}
            {DIAS.map(dia => {
              const psDelDia = mapaPartidosPorDia[dia.fecha] || []
              if (psDelDia.length === 0) return null

              return (
                <div key={dia.fecha} className="mt-24">
                  <div className="grupo-header">
                    <span className="grupo-letra" style={{ fontSize: '1rem' }}>📅</span>
                    <span className="grupo-titulo" style={{ color: 'var(--blanco)', fontWeight: 700, fontSize: '1rem' }}>
                      {dia.label} · {psDelDia.length} partido{psDelDia.length > 1 ? 's' : ''}
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
