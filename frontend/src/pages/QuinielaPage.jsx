import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { quinielaApi } from '../services/api'

const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L']

const LABEL_RESULTADO = {
  L: 'Local',
  E: 'Empate',
  V: 'Visita',
}

export default function QuinielaPage() {
  const [partidos, setPartidos] = useState([])
  const [pronosticos, setPronosticos] = useState({}) // { partidoId: 'L'|'E'|'V' }
  const [cerrada, setCerrada] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const navigate = useNavigate()

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  const cargarDatos = useCallback(async () => {
    try {
      const [partidosRes, cierreRes] = await Promise.all([
        quinielaApi.getPartidos(),
        quinielaApi.estadoCierre(),
      ])
      setPartidos(partidosRes.data)
      setCerrada(cierreRes.data.cerrada)

      // Prellenar pronósticos guardados
      const mapa = {}
      partidosRes.data.forEach(p => {
        if (p.pronostico) mapa[p.id] = p.pronostico
      })
      setPronosticos(mapa)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarDatos() }, [cargarDatos])

  const seleccionar = (partidoId, resultado) => {
    if (cerrada) return
    setPronosticos(prev => ({
      ...prev,
      [partidoId]: prev[partidoId] === resultado ? undefined : resultado
    }))
  }

  const guardar = async () => {
    setGuardando(true)
    setMensaje(null)
    try {
      const lista = Object.entries(pronosticos)
        .filter(([, v]) => v)
        .map(([partidoId, resultado]) => ({ partidoId: Number(partidoId), resultado }))

      const { data } = await quinielaApi.guardar(lista)
      setMensaje({ texto: data.mensaje, ok: data.exito })

      if (data.exito) {
        setTimeout(() => navigate('/resumen'), 1500)
      }
    } catch (err) {
      setMensaje({ texto: 'Error al guardar. Intenta de nuevo.', ok: false })
    } finally {
      setGuardando(false)
    }
  }

  const totalPartidos = partidos.length
  const completados = Object.values(pronosticos).filter(Boolean).length

  if (cargando) return <div className="spinner" />

  const partidosPorGrupo = GRUPOS.reduce((acc, g) => {
    acc[g] = partidos.filter(p => p.grupo === g)
    return acc
  }, {})

  const formatFecha = (fecha) => {
    if (!fecha) return ''
    const d = new Date(fecha)
    return d.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) +
           ' · ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      {/* Header */}
      <div className="header">
        <div className="app-container">
          <h1>⚽ Quiniela Quevaber 2026</h1>
          <div className="header-usuario">Hola, {usuario.nombre} 👋</div>
        </div>
      </div>

      <div className="app-container page-contenido">
        {/* Banner estado */}
        {cerrada ? (
          <div className="banner-cierre mt-16">
            🔒 La quiniela está cerrada. Solo puedes consultar tus pronósticos.
          </div>
        ) : (
          <div className="banner-cierre banner-abierto mt-16">
            ✅ Quiniela abierta hasta el <strong>11 de junio a las 10:00 AM</strong>
          </div>
        )}

        {/* Progreso */}
        <div className="progreso-bar-wrap">
          <div className="progreso-bar-fill" style={{ width: `${(completados/totalPartidos)*100}%` }} />
        </div>
        <div className="progreso-texto">{completados} / {totalPartidos} partidos pronosticados</div>

        {/* Mensaje de guardado */}
        {mensaje && (
          <div className={`banner-cierre ${mensaje.ok ? 'banner-abierto' : ''} mb-16`}>
            {mensaje.ok ? '✅' : '❌'} {mensaje.texto}
          </div>
        )}

        {/* Partidos por grupo */}
        {GRUPOS.map(grupo => {
          const ps = partidosPorGrupo[grupo]
          if (!ps || ps.length === 0) return null
          const equipos = [...new Set(ps.flatMap(p => [p.equipoLocal, p.equipoVisitante]))]
          return (
            <div key={grupo}>
              <div className="grupo-header">
                <span className="grupo-letra">Grupo {grupo}</span>
                <span className="grupo-titulo">{equipos.join(' · ')}</span>
              </div>
              {ps.map(partido => (
                <div key={partido.id} className="partido-card">
                  <div className="partido-meta">
                    <span>📅 {formatFecha(partido.fechaPartido)}</span>
                    <span>📍 {partido.sede}</span>
                  </div>
                  <div className="partido-equipos">
                    <div className="equipo">
                      <span className="bandera">{partido.banderaLocal}</span>
                      <span>{partido.equipoLocal}</span>
                    </div>
                    <span className="vs-badge">VS</span>
                    <div className="equipo visitante">
                      <span>{partido.equipoVisitante}</span>
                      <span className="bandera">{partido.banderaVisitante}</span>
                    </div>
                  </div>
                  <div className="opciones-resultado">
                    {['L', 'E', 'V'].map(op => {
                      const label = op === 'L'
                        ? partido.equipoLocal.split(' ')[0]
                        : op === 'V'
                          ? partido.equipoVisitante.split(' ')[0]
                          : 'Empate'
                      const sel = pronosticos[partido.id] === op
                      return (
                        <button
                          key={op}
                          className={`btn-resultado ${sel ? `sel-${op}` : ''}`}
                          onClick={() => seleccionar(partido.id, op)}
                          disabled={cerrada}
                          title={LABEL_RESULTADO[op]}
                        >
                          {partido.banderaLocal && op === 'L' ? partido.banderaLocal + ' ' : ''}
                          {label}
                          {partido.banderaVisitante && op === 'V' ? ' ' + partido.banderaVisitante : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {/* Nav fija abajo */}
      <div className="nav-bottom">
        <button className="btn btn-outline" onClick={() => navigate('/resumen')} style={{flex: 1}}>
          📋 Ver resumen
        </button>
        {!cerrada && (
          <button
            className="btn btn-dorado"
            onClick={guardar}
            disabled={guardando || completados === 0}
            style={{flex: 2}}
          >
            {guardando ? 'Guardando...' : `💾 Guardar (${completados}/${totalPartidos})`}
          </button>
        )}
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
