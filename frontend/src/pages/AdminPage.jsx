import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { quinielaApi } from '../services/api'
import * as XLSX from 'xlsx'

const ORDEN_DIAS = [
  '2026-06-11','2026-06-12','2026-06-13','2026-06-14','2026-06-15',
  '2026-06-16','2026-06-17','2026-06-18','2026-06-19','2026-06-20',
  '2026-06-21','2026-06-22','2026-06-23','2026-06-24','2026-06-25',
  '2026-06-26','2026-06-27',
]

// Resultados reales confirmados al 15 Jun 2026
// L = Local gana, E = Empate, V = Visitante gana
const RESULTADOS_REALES = {
  // 11 Jun
  'México|Sudáfrica':          'L', // 2-0
  'Corea del Sur|Chequia':     'L', // 2-1
  // 12 Jun
  'Canadá|Bosnia y Herz.':     'E', // 1-1
  'Estados Unidos|Paraguay':   'L', // 4-1
  // 13 Jun
  'Qatar|Suiza':               'E', // 1-1
  'Australia|Turquía':         'L', // 2-0
  'Brasil|Marruecos':          'E', // 1-1
  'Haití|Escocia':             'V', // 0-1
  // 14 Jun
  'Alemania|Curazao':          'L', // 7-1
  'Países Bajos|Japón':        'E', // pendiente marcador
  'Costa de Marfil|Ecuador':   'L', // gana Costa de Marfil
  'Suecia|Túnez':              'L', // gana Suecia
  // 15 Jun
  'España|Cabo Verde':         'E', // empate
  'Bélgica|Egipto':            'E', // empate
  'Arabia Saudí|Uruguay':      'E', // empate
  'Irán|Nueva Zelanda':        'E',
  'Francia|Senegal':           'L',
  'Irak|Noruega':              'V',
  'Austria|Jordania':          'L',
  'Argelia|Argentina':         'V',
  'Portugal|Congo DR':         'E',
  'Inglaterra|Croacia':        'L',
  'Ghana|Panamá':              'L',
  'Uzbekistán|Colombia':       'V',
  'Chequia|Sudáfrica':         'E',
  'Bosnia y Herz.|Suiza':      'V',
  'Qatar|Canadá':              'V',
  'México|Corea del Sur':      'L',
  'Estados Unidos|Australia':  'L',
  'Marruecos|Escocia':         'L',
  'Haití|Brasil':              'V',
  'Turquía|Paraguay':          'V',
  'Ecuador|Curazao':           'E',
  'Costa de Marfil|Alemania':  'V',
  'Suecia|Países Bajos':       'V',
  'Japón|Túnez':               'L',
  'Bélgica|Irán':              'E',
  'Cabo Verde|Uruguay':        'E',
  'Arabia Saudí|España':       'V',
  'Nueva Zelanda|Egipto':      'V',
  'Senegal|Noruega':           'V',
  'Irak|Francia':              'V',
  'Argentina|Austria':         'L',
  'Argelia|Jordania':          'L',
  'Croacia|Panamá':            'L',
  'Ghana|Inglaterra':          'E',
  'Congo DR|Colombia':         'V',
  'Uzbekistán|Portugal':       'V',
  'Suiza|Canadá':              'L',
  'Bosnia y Herz.|Qatar':      'L',
  // Irán vs Nueva Zelanda — en curso, se agrega cuando termine
}

function labelDia(fechaStr) {
  const d = new Date(fechaStr + 'T12:00:00')
  return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getRes(resultado, equipoLocal, equipoVisitante) {
  if (resultado === 'L') return equipoLocal
  if (resultado === 'V') return equipoVisitante
  return 'Empate'
}

function getClase(r) {
  return r === 'L' ? 'res-L' : r === 'E' ? 'res-E' : 'res-V'
}

function construirMapaPorDia(datos) {
  const mapa = {}
  const vistos = new Set()

  datos.forEach(usuario => {
    usuario.pronosticos.forEach(p => {
      const key = `${p.equipoLocal}|${p.equipoVisitante}`
      if (vistos.has(key)) return
      vistos.add(key)
      const fecha = p.fechaPartido ? p.fechaPartido.substring(0, 10) : null
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

  Object.keys(mapa).forEach(fecha => {
    mapa[fecha].sort((a, b) => a.fechaPartido.localeCompare(b.fechaPartido))
  })

  return mapa
}

function generarExcel(datos, mapaPartidosPorDia) {
  const diasConPartidos = ORDEN_DIAS.filter(f => mapaPartidosPorDia[f]?.length > 0)
  const participantes = datos.map(d => d.usuario)

  const encabezado = [
    'Fecha', 'Grupo', 'Local', 'Visitante', 'Resultado Real',
    ...participantes,
    ...participantes.map(p => `${p} - Acierto`)
  ]

  const filas = [encabezado]

  diasConPartidos.forEach(fecha => {
    const psDelDia = mapaPartidosPorDia[fecha] || []
    psDelDia.forEach(partido => {
      const key = `${partido.equipoLocal}|${partido.equipoVisitante}`
      const resultadoReal = RESULTADOS_REALES[key] || ''
      const labelReal = resultadoReal === 'L'
        ? partido.equipoLocal
        : resultadoReal === 'V'
          ? partido.equipoVisitante
          : resultadoReal === 'E' ? 'Empate' : 'Pendiente'

      const pronosticosCols = participantes.map(nombre => {
        const usuario = datos.find(d => d.usuario === nombre)
        const pron = usuario?.pronosticos.find(p =>
          p.equipoLocal === partido.equipoLocal && p.equipoVisitante === partido.equipoVisitante)
        if (!pron) return ''
        return pron.resultado === 'L'
          ? partido.equipoLocal
          : pron.resultado === 'V'
            ? partido.equipoVisitante
            : 'Empate'
      })

      const aciertoCols = participantes.map(nombre => {
        if (!resultadoReal) return 'Pendiente'
        const usuario = datos.find(d => d.usuario === nombre)
        const pron = usuario?.pronosticos.find(p =>
          p.equipoLocal === partido.equipoLocal && p.equipoVisitante === partido.equipoVisitante)
        if (!pron) return 'Sin pronóstico'
        return pron.resultado === resultadoReal ? 'Acierto' : 'Error'
      })

      filas.push([
        labelDia(fecha),
        `Grupo ${partido.grupo}`,
        partido.equipoLocal,
        partido.equipoVisitante,
        labelReal,
        ...pronosticosCols,
        ...aciertoCols,
      ])
    })
  })

  // Hoja resumen
  const resumenEncabezado = ['Participante', 'Partidos Jugados', 'Aciertos', 'Errores', 'Sin pronóstico', 'Efectividad %']
  const partidosJugados = Object.keys(RESULTADOS_REALES)

  const resumenFilas = datos.map(d => {
    let aciertos = 0, errores = 0, sinPron = 0
    partidosJugados.forEach(key => {
      const [local, visitante] = key.split('|')
      const pron = d.pronosticos.find(p => p.equipoLocal === local && p.equipoVisitante === visitante)
      if (!pron) { sinPron++; return }
      pron.resultado === RESULTADOS_REALES[key] ? aciertos++ : errores++
    })
    const efectividad = (aciertos + errores) > 0
      ? Math.round((aciertos / (aciertos + errores)) * 100)
      : 0
    return [d.usuario, partidosJugados.length, aciertos, errores, sinPron, `${efectividad}%`]
  }).sort((a, b) => b[2] - a[2])

  const wb = XLSX.utils.book_new()
  const wsPronosticos = XLSX.utils.aoa_to_sheet(filas)
  const wsResumen = XLSX.utils.aoa_to_sheet([resumenEncabezado, ...resumenFilas])

  wsPronosticos['!cols'] = [
    { wch: 14 }, { wch: 8 }, { wch: 18 }, { wch: 18 }, { wch: 16 },
    ...participantes.map(() => ({ wch: 16 })),
    ...participantes.map(() => ({ wch: 16 })),
  ]
  wsResumen['!cols'] = [
    { wch: 20 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 14 }
  ]

  XLSX.utils.book_append_sheet(wb, wsResumen, 'Tabla de posiciones')
  XLSX.utils.book_append_sheet(wb, wsPronosticos, 'Pronósticos completos')

  const fecha = new Date().toLocaleDateString('es-MX').replace(/\//g, '-')
  XLSX.writeFile(wb, `Quiniela_Quevaber_${fecha}.xlsx`)
}

function generarReporteHTML(datos, mapaPartidosPorDia) {
  const diasConPartidos = ORDEN_DIAS.filter(f => mapaPartidosPorDia[f]?.length > 0)

  const filas = diasConPartidos.map(dia => {
    const psDelDia = mapaPartidosPorDia[dia] || []
    return `
      <tr class="dia-row">
        <td colspan="${2 + datos.length}" class="dia-header">📅 ${labelDia(dia)}</td>
      </tr>
      ${psDelDia.map(partido => {
        const celdas = datos.map(u => {
          const pron = u.pronosticos.find(p =>
            p.equipoLocal === partido.equipoLocal && p.equipoVisitante === partido.equipoVisitante)
          if (!pron) return '<td class="sin-pron">—</td>'
          const label = pron.resultado === 'L'
            ? partido.equipoLocal
            : pron.resultado === 'V'
              ? partido.equipoVisitante
              : 'Empate'
          const cls = pron.resultado === 'L' ? 'local' : pron.resultado === 'V' ? 'visita' : 'empate'
          return `<td class="${cls}">${label}</td>`
        }).join('')
        return `<tr>
          <td class="partido-cell">${partido.equipoLocal} vs ${partido.equipoVisitante}</td>
          <td class="grupo-cell">G-${partido.grupo}</td>
          ${celdas}
        </tr>`
      }).join('')}
    `
  }).join('')

  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8">
<title>Reporte Quiniela Quevaber Mundial 2026</title>
<style>
  body{font-family:Arial,sans-serif;font-size:11px;margin:20px;color:#111}
  h1{text-align:center;font-size:18px;margin-bottom:4px}
  p.sub{text-align:center;color:#666;margin-bottom:16px;font-size:11px}
  table{width:100%;border-collapse:collapse}
  th{background:#1a5c2e;color:#FFD700;padding:6px 8px;text-align:center;font-size:10px}
  th.partido-th{text-align:left;min-width:160px}
  td{padding:5px 8px;border-bottom:1px solid #ddd;text-align:center}
  td.partido-cell{text-align:left;font-weight:600}
  td.grupo-cell{color:#888;font-size:10px}
  td.sin-pron{color:#ccc}
  td.local{background:#e6f7ee;color:#1a5c2e;font-weight:700}
  td.empate{background:#fffbe6;color:#8a6900;font-weight:700}
  td.visita{background:#e8f0ff;color:#1a3a8a;font-weight:700}
  tr.dia-row td{background:#f0f0f0;font-weight:700;font-size:12px;padding:8px;border-top:2px solid #aaa}
  @media print{body{margin:8px}}
</style></head><body>
<h1>⚽ Quiniela Quevaber · Mundial 2026</h1>
<p class="sub">Reporte generado el ${new Date().toLocaleString('es-MX')}</p>
<table><thead><tr>
  <th class="partido-th">Partido</th><th>Grp</th>
  ${datos.map(u => `<th>${u.usuario}</th>`).join('')}
</tr></thead><tbody>${filas}</tbody></table>
</body></html>`
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

  const tablaPos = [...datos].sort((a, b) => {
    const calc = (d) => Object.keys(RESULTADOS_REALES).filter(key => {
      const [local, visitante] = key.split('|')
      const p = d.pronosticos.find(p => p.equipoLocal === local && p.equipoVisitante === visitante)
      return p && p.resultado === RESULTADOS_REALES[key]
    }).length
    return calc(b) - calc(a)
  })

  return (
    <div>
      <div className="header">
        <div className="app-container">
          <h1>🔐 Panel Admin</h1>
          <div className="subtitulo">Quiniela Quevaber Mundial 2026</div>
        </div>
      </div>

      <div className="app-container page-contenido">
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
              {Object.keys(RESULTADOS_REALES).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--texto-suave)' }}>Partidos jugados</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn btn-dorado" onClick={() => generarExcel(datos, mapaPartidosPorDia)}
            disabled={datos.length === 0} style={{ flex: 1 }}>
            📊 Descargar Excel
          </button>
          <button className="btn btn-outline" onClick={abrirReporte}
            disabled={datos.length === 0} style={{ flex: 1 }}>
            📄 Reporte PDF
          </button>
        </div>

        <div className="login-tabs mt-16">
          <button className={`login-tab ${vistaActiva === 'tabla' ? 'activo' : ''}`} onClick={() => setVistaActiva('tabla')}>
            📊 Pronósticos
          </button>
          <button className={`login-tab ${vistaActiva === 'posiciones' ? 'activo' : ''}`} onClick={() => setVistaActiva('posiciones')}>
            🏆 Posiciones
          </button>
        </div>

        {vistaActiva === 'posiciones' && (
          <div className="card mt-16">
            <table className="admin-tabla" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>#</th><th>Participante</th><th>Aciertos</th><th>Completados</th><th>Avance</th>
                </tr>
              </thead>
              <tbody>
                {tablaPos.map((d, i) => {
                  const aciertos = Object.keys(RESULTADOS_REALES).filter(key => {
                    const [local, visitante] = key.split('|')
                    const p = d.pronosticos.find(p => p.equipoLocal === local && p.equipoVisitante === visitante)
                    return p && p.resultado === RESULTADOS_REALES[key]
                  }).length
                  return (
                    <tr key={d.usuario}>
                      <td style={{ color: 'var(--dorado)', fontWeight: 700 }}>{i + 1}</td>
                      <td>{d.usuario}</td>
                      <td className="badge-completado">{aciertos} / {Object.keys(RESULTADOS_REALES).length}</td>
                      <td className={d.completados === d.total ? 'badge-completado' : 'badge-incompleto'}>
                        {d.completados}/{d.total}
                      </td>
                      <td>
                        <div className="progreso-bar-wrap" style={{ margin: '4px 0', height: 6 }}>
                          <div className="progreso-bar-fill" style={{ width: `${(d.completados / d.total) * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {vistaActiva === 'tabla' && (
          <div>
            <div className="form-group mt-16">
              <input className="input-field" type="text" placeholder="🔍 Buscar participante..."
                value={filtroUsuario} onChange={e => setFiltroUsuario(e.target.value)} />
            </div>

            {diasConPartidos.map(fecha => {
              const psDelDia = mapaPartidosPorDia[fecha] || []
              return (
                <div key={fecha} className="mt-24">
                  <div className="grupo-header">
                    <span className="grupo-letra" style={{ fontSize: '1rem' }}>📅</span>
                    <span className="grupo-titulo" style={{ color: 'var(--blanco)', fontWeight: 700, fontSize: '1rem' }}>
                      {labelDia(fecha)} · {psDelDia.length} partido{psDelDia.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  {psDelDia.map(partido => {
                    const key = `${partido.equipoLocal}|${partido.equipoVisitante}`
                    const resultadoReal = RESULTADOS_REALES[key]
                    return (
                      <div key={key} style={{ background: 'var(--gris-medio)', borderBottom: '1px solid #2a2a2a', padding: '12px 16px' }}>
                        <div style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                          {partido.equipoLocal}
                          <span style={{ color: 'var(--texto-suave)' }}>vs</span>
                          {partido.equipoVisitante}
                          <span style={{ fontSize: '0.72rem', color: 'var(--dorado)', background: '#2a2a00', padding: '2px 8px', borderRadius: 12 }}>
                            G-{partido.grupo}
                          </span>
                          {resultadoReal && (
                            <span style={{ fontSize: '0.72rem', background: '#003d1a', color: '#80ffb0', padding: '2px 8px', borderRadius: 12 }}>
                              ✅ {getRes(resultadoReal, partido.equipoLocal, partido.equipoVisitante)}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {datosFiltrados.map(u => {
                            const pron = u.pronosticos.find(p =>
                              p.equipoLocal === partido.equipoLocal && p.equipoVisitante === partido.equipoVisitante)
                            const esAcierto = pron && resultadoReal && pron.resultado === resultadoReal
                            const esError = pron && resultadoReal && pron.resultado !== resultadoReal
                            return (
                              <div key={u.usuario} style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 80 }}>
                                <span style={{ color: 'var(--texto-suave)' }}>{u.usuario}</span>
                                {pron ? (
                                  <span className={`resumen-resultado ${getClase(pron.resultado)}`}
                                    style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                                    {getRes(pron.resultado, partido.equipoLocal, partido.equipoVisitante)}
                                    {esAcierto && <span style={{ marginLeft: 4 }}>✅</span>}
                                    {esError && <span style={{ marginLeft: 4 }}>❌</span>}
                                  </span>
                                ) : (
                                  <span style={{ color: '#555', fontSize: '0.7rem' }}>—</span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="nav-bottom">
        <button className="btn btn-danger"
          onClick={() => { localStorage.clear(); navigate('/') }}
          style={{ flex: 0, padding: '10px 18px' }}>
          🚪 Salir
        </button>
      </div>
    </div>
  )
}
