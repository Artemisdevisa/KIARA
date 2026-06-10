import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  Activity, Plus, Search, Thermometer, Droplets, Sun, Cloud,
  CalendarDays, TreePine, X, AlertTriangle, BellRing, TrendingUp,
  TrendingDown, Minus, CheckCircle, Trash2,
} from 'lucide-react'

/* ── Umbrales óptimos para Lambayeque — INIA Vista Florida (deben coincidir con el backend) ── */
const TEMP_MIN = 18, TEMP_MAX = 32
const HUM_MIN  = 50, HUM_MAX  = 85

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  divider:     'rgba(255,255,255,0.07)',
  hoverRow:    'rgba(255,255,255,0.04)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

/* ── Evalúa si un valor está en rango ── */
function estadoTemp(v) {
  if (v === null || v === undefined) return 'nd'
  const n = parseFloat(v)
  if (n > TEMP_MAX || n < TEMP_MIN) return 'critico'
  if (n > 30 || n < 18) return 'alerta'
  return 'ok'
}
function estadoHum(v) {
  if (v === null || v === undefined) return 'nd'
  const n = parseFloat(v)
  if (n < HUM_MIN || n > HUM_MAX) return 'critico'
  if (n < 50 || n > 80) return 'alerta'
  return 'ok'
}

const ESTADO_COLOR = {
  ok:      { light: '#16a34a', dark: '#4ade80', bg_l: '#f0fdf4', bg_d: 'rgba(22,163,74,0.12)',  border_l: '#bbf7d0', border_d: 'rgba(74,222,128,0.25)'   },
  alerta:  { light: '#d97706', dark: '#fbbf24', bg_l: '#fffbeb', bg_d: 'rgba(202,138,4,0.12)',  border_l: '#fde68a', border_d: 'rgba(251,191,36,0.25)'   },
  critico: { light: '#dc2626', dark: '#f87171', bg_l: '#fef2f2', bg_d: 'rgba(220,38,38,0.12)',  border_l: '#fecaca', border_d: 'rgba(248,113,113,0.25)'  },
  nd:      { light: '#9ca3af', dark: '#6b7280', bg_l: '#f9fafb', bg_d: 'rgba(255,255,255,0.04)', border_l: '#e5e7eb', border_d: 'rgba(255,255,255,0.08)' },
}

function ec(estado, dark, prop) {
  return ESTADO_COLOR[estado]?.[dark ? prop.replace('_l','_d') : prop] ?? '#9ca3af'
}

/* ── Sparkline SVG ── */
function Sparkline({ data, color, min, max, width = 120, height = 36 }) {
  if (!data || data.length < 2) return (
    <span style={{ fontSize: 10, color: '#9ca3af' }}>Sin datos</span>
  )
  const vals = data.map(v => parseFloat(v))
  const lo   = Math.min(...vals, min)
  const hi   = Math.max(...vals, max)
  const range = hi - lo || 1
  const step  = width / (vals.length - 1)
  const pts   = vals.map((v, i) => {
    const x = i * step
    const y = height - ((v - lo) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"/>
      {vals.map((v, i) => (
        <circle key={i} cx={i * step} cy={height - ((v - lo) / range) * height}
          r={i === vals.length - 1 ? 3.5 : 2} fill={color}/>
      ))}
    </svg>
  )
}

/* ── Icono de tendencia ── */
function TrendIcon({ data, dark }) {
  if (!data || data.length < 2) return null
  const last  = parseFloat(data[data.length - 1])
  const prev  = parseFloat(data[data.length - 2])
  const diff  = last - prev
  if (Math.abs(diff) < 0.5) return <Minus size={12} style={{ color: dark ? '#94a3b8' : '#6b7280' }}/>
  if (diff > 0) return <TrendingUp size={12} style={{ color: '#f87171' }}/>
  return <TrendingDown size={12} style={{ color: '#4ade80' }}/>
}

/* ── Panel de alerta de rango ── */
function AlertaRango({ ultimo, dark }) {
  if (!ultimo) return null
  const alertas = []
  const t = ultimo.temperatura !== null ? parseFloat(ultimo.temperatura) : null
  const h = ultimo.humedad     !== null ? parseFloat(ultimo.humedad)     : null

  if (t !== null && t > TEMP_MAX)
    alertas.push({ msg: `Temperatura muy alta (${t}°C). Rango óptimo: ${TEMP_MIN}–${TEMP_MAX}°C. Considera sombrear o ventilar.`, icon: Thermometer, tipo: 'critico' })
  if (t !== null && t < TEMP_MIN)
    alertas.push({ msg: `Temperatura muy baja (${t}°C). Rango óptimo: ${TEMP_MIN}–${TEMP_MAX}°C. Considera cubrir los cultivos.`, icon: Thermometer, tipo: 'critico' })
  if (h !== null && h < HUM_MIN)
    alertas.push({ msg: `Humedad baja (${h}%). Rango óptimo: ${HUM_MIN}–${HUM_MAX}%. El cultivo puede estar en estrés hídrico — revisa el riego.`, icon: Droplets, tipo: 'critico' })
  if (h !== null && h > HUM_MAX)
    alertas.push({ msg: `Humedad muy alta (${h}%). Rango óptimo: ${HUM_MIN}–${HUM_MAX}%. Riesgo de hongos — mejora la ventilación.`, icon: Droplets, tipo: 'alerta' })

  if (alertas.length === 0) return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
      style={{ backgroundColor: dark ? 'rgba(22,163,74,0.10)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(74,222,128,0.2)' : '#bbf7d0'}` }}>
      <CheckCircle size={14} style={{ color: dark ? '#4ade80' : '#16a34a' }}/>
      <p className="text-xs font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>
        Condiciones dentro del rango óptimo para los cultivos.
      </p>
    </div>
  )

  return (
    <div className="space-y-2">
      {alertas.map((a, i) => {
        const Icon = a.icon
        const col = ESTADO_COLOR[a.tipo]
        return (
          <div key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl"
            style={{
              backgroundColor: dark ? col.bg_d : col.bg_l,
              border: `1px solid ${dark ? col.border_d : col.border_l}`,
            }}>
            <AlertTriangle size={14} className="shrink-0 mt-0.5" style={{ color: dark ? col.dark : col.light }}/>
            <div className="flex-1">
              <p className="text-xs font-semibold" style={{ color: dark ? col.dark : col.light }}>
                {a.msg}
              </p>
              <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: dark ? D.sub : '#9ca3af' }}>
                <BellRing size={9}/> Se generó una alerta automática en tus campañas activas.
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Modal formulario ── */
function FormModal({ dark, biohuertos, onClose, onSaved }) {
  const [form, setForm] = useState({
    biohuerto: '', fecha: new Date().toISOString().split('T')[0],
    humedad: '', temperatura: '', luminosidad: 'media', incidencias: ''
  })
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState({ temp: null, hum: null })

  const handle = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (name === 'temperatura') setPreview(p => ({ ...p, temp: value ? parseFloat(value) : null }))
    if (name === 'humedad')     setPreview(p => ({ ...p, hum:  value ? parseFloat(value) : null }))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/monitoreo/', form)
      const alertas = res.data.alertas_generadas || []
      if (alertas.length > 0) {
        toast((t) => (
          <div className="flex gap-3 items-start">
            <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <div>
              <p className="font-bold text-sm text-gray-800">
                {alertas.length} alerta{alertas.length > 1 ? 's' : ''} generada{alertas.length > 1 ? 's' : ''}
              </p>
              {alertas.map((a, i) => (
                <p key={i} className="text-xs mt-1 text-gray-500 flex items-center gap-1">
                  <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{a.campana_codigo}</span>
                  {a.titulo}
                </p>
              ))}
            </div>
          </div>
        ), { duration: 6000, icon: null })
      } else {
        toast.success('Registro guardado. Condiciones en rango óptimo.')
      }
      onSaved()
    } catch { toast.error('Error al guardar.') }
    finally { setLoading(false) }
  }

  const ist = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none',
  }
  const lst = { display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: dark ? D.sub : '#6b7280' }

  const tempEstado = preview.temp !== null ? estadoTemp(preview.temp) : 'nd'
  const humEstado  = preview.hum  !== null ? estadoHum(preview.hum)   : 'nd'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col"
        style={{ backgroundColor: dark ? '#1e2a3a' : '#fff', border: `1.5px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}`, maxHeight: '92vh' }}>

        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <div>
            <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
              Registrar variables del día
            </h2>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              Si hay valores fuera de rango se crearán alertas automáticamente.
            </p>
          </div>
          <button onClick={onClose} style={{ color: D.sub }}><X size={18}/></button>
        </div>

        <div className="overflow-y-auto px-6 pb-6" style={{ flex: 1 }}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={lst}>Biohuerto *</label>
                <select name="biohuerto" value={form.biohuerto} onChange={handle} style={ist} required>
                  <option value="">Seleccionar...</option>
                  {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={lst}>Fecha *</label>
                <input name="fecha" type="date" value={form.fecha} onChange={handle} style={ist} required/>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label style={lst}>Temperatura (°C)</label>
                <input name="temperatura" type="number" step="0.1"
                  value={form.temperatura} onChange={handle} style={{
                    ...ist,
                    borderColor: tempEstado !== 'nd' ? ec(tempEstado, dark, 'border_l') : undefined,
                    backgroundColor: tempEstado !== 'nd' ? ec(tempEstado, dark, 'bg_l') : undefined,
                  }} placeholder="24"/>
                {preview.temp !== null && (
                  <p className="text-[10px] mt-1 font-semibold" style={{ color: ec(tempEstado, dark, 'light') }}>
                    {tempEstado === 'ok'     && `Óptimo (${TEMP_MIN}–${TEMP_MAX}°C)`}
                    {tempEstado === 'alerta' && `Fuera del ideal`}
                    {tempEstado === 'critico'&& `⚠ Fuera del rango seguro`}
                  </p>
                )}
              </div>
              <div>
                <label style={lst}>Humedad (%)</label>
                <input name="humedad" type="number" min="0" max="100" step="0.1"
                  value={form.humedad} onChange={handle} style={{
                    ...ist,
                    borderColor: humEstado !== 'nd' ? ec(humEstado, dark, 'border_l') : undefined,
                    backgroundColor: humEstado !== 'nd' ? ec(humEstado, dark, 'bg_l') : undefined,
                  }} placeholder="65"/>
                {preview.hum !== null && (
                  <p className="text-[10px] mt-1 font-semibold" style={{ color: ec(humEstado, dark, 'light') }}>
                    {humEstado === 'ok'     && `Óptimo (${HUM_MIN}–${HUM_MAX}%)`}
                    {humEstado === 'alerta' && `Fuera del ideal`}
                    {humEstado === 'critico'&& `⚠ Fuera del rango seguro`}
                  </p>
                )}
              </div>
              <div>
                <label style={lst}>Luminosidad</label>
                <select name="luminosidad" value={form.luminosidad} onChange={handle} style={ist}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>

            {/* Guía de rangos */}
            <div className="rounded-xl p-3 space-y-1.5"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}` }}>
              <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: dark ? D.sub : '#9ca3af' }}>
                Rangos óptimos para biohuertos en Lambayeque
              </p>
              <div className="flex gap-4 flex-wrap">
                <span className="text-[11px]" style={{ color: dark ? D.sub : '#6b7280' }}>
                  <Thermometer size={10} className="inline mr-1"/><strong>Temp:</strong> {TEMP_MIN}–{TEMP_MAX}°C
                </span>
                <span className="text-[11px]" style={{ color: dark ? D.sub : '#6b7280' }}>
                  <Droplets size={10} className="inline mr-1"/><strong>Humedad:</strong> {HUM_MIN}–{HUM_MAX}%
                </span>
              </div>
            </div>

            <div>
              <label style={lst}>Incidencias / Novedades del día</label>
              <textarea name="incidencias" value={form.incidencias} onChange={handle} rows={2}
                style={{ ...ist, resize: 'none' }} placeholder="Ej: Manchas en hojas de lechuga, suelo compactado..."/>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
                {loading ? 'Guardando...' : 'Guardar y verificar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ══ PÁGINA PRINCIPAL ══ */
export default function MonitoreoPage() {
  const { dark } = useTheme()
  const [registros, setRegistros]   = useState([])
  const [biohuertos, setBiohuertos] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]     = useState(false)
  const [search, setSearch]         = useState('')
  const [filtroBio, setFiltroBio]   = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = filtroBio ? `?biohuerto=${filtroBio}` : ''
      const [m, b] = await Promise.all([
        api.get(`/monitoreo/${params}`),
        api.get('/biohuertos/'),
      ])
      setRegistros(m.data.results ?? m.data)
      setBiohuertos(b.data.results ?? b.data)
    } catch { toast.error('Error al cargar.') }
    finally { setLoading(false) }
  }, [filtroBio])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este registro de monitoreo?')) return
    try {
      await api.delete(`/monitoreo/${id}/`)
      toast.success('Registro eliminado.')
      fetchAll()
    } catch { toast.error('No se pudo eliminar.') }
  }

  const filtered = registros.filter(r => {
    const q = search.toLowerCase()
    return !search || r.biohuerto_nombre?.toLowerCase().includes(q) || r.fecha?.includes(q)
  })

  const ultimo = registros[0]

  /* Últimos 7 registros para sparklines */
  const ultimos7 = [...registros].reverse().slice(-7)
  const tempData  = ultimos7.filter(r => r.temperatura !== null).map(r => r.temperatura)
  const humData   = ultimos7.filter(r => r.humedad     !== null).map(r => r.humedad)

  const tEstado = ultimo ? estadoTemp(ultimo.temperatura) : 'nd'
  const hEstado = ultimo ? estadoHum(ultimo.humedad)      : 'nd'

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#fff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }
  const ist = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#374151',
    borderRadius: '10px', padding: '7px 12px', fontSize: '13px', outline: 'none', height: '36px',
  }

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <Activity size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }}/>
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Monitoreo del biohuerto</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              Registra las condiciones diarias. Alertas automáticas si hay valores fuera de rango.
            </p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary text-sm shrink-0">
          <Plus size={15}/> Nuevo registro
        </button>
      </div>

      {/* Estado actual + sparklines */}
      {ultimo && (
        <div style={cardStyle} className="p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: dark ? D.sub : '#9ca3af' }}>
            Último registro — {ultimo.fecha} · {ultimo.biohuerto_nombre}
          </p>

          <div className="grid grid-cols-3 gap-3">

            {/* Temperatura */}
            <div className="rounded-xl p-4" style={{
              backgroundColor: dark ? ec(tEstado, dark, 'bg_l') : ec(tEstado, false, 'bg_l'),
              border: `1.5px solid ${dark ? ec(tEstado, dark, 'border_l') : ec(tEstado, false, 'border_l')}`,
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Thermometer size={14} style={{ color: dark ? ec(tEstado, dark, 'light') : ec(tEstado, false, 'light') }}/>
                  <span className="text-xs font-bold" style={{ color: dark ? D.sub : '#6b7280' }}>Temperatura</span>
                </div>
                <TrendIcon data={tempData} dark={dark}/>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                {ultimo.temperatura != null ? `${ultimo.temperatura}°C` : '—'}
              </p>
              <p className="text-[10px] mt-1 font-semibold" style={{ color: dark ? ec(tEstado, dark, 'light') : ec(tEstado, false, 'light') }}>
                {tEstado === 'ok'      && 'En rango óptimo'}
                {tEstado === 'alerta'  && 'Fuera del ideal'}
                {tEstado === 'critico' && '⚠ Fuera del rango seguro'}
                {tEstado === 'nd'      && 'Sin dato'}
              </p>
              {tempData.length >= 2 && (
                <div className="mt-3">
                  <Sparkline data={tempData} color={dark ? ec(tEstado, dark, 'light') : ec(tEstado, false, 'light')} min={0} max={50} width={160} height={36}/>
                  <p className="text-[9px] mt-1" style={{ color: dark ? D.sub : '#9ca3af' }}>Últimas {tempData.length} lecturas</p>
                </div>
              )}
            </div>

            {/* Humedad */}
            <div className="rounded-xl p-4" style={{
              backgroundColor: dark ? ec(hEstado, dark, 'bg_l') : ec(hEstado, false, 'bg_l'),
              border: `1.5px solid ${dark ? ec(hEstado, dark, 'border_l') : ec(hEstado, false, 'border_l')}`,
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Droplets size={14} style={{ color: dark ? ec(hEstado, dark, 'light') : ec(hEstado, false, 'light') }}/>
                  <span className="text-xs font-bold" style={{ color: dark ? D.sub : '#6b7280' }}>Humedad</span>
                </div>
                <TrendIcon data={humData} dark={dark}/>
              </div>
              <p className="text-3xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                {ultimo.humedad != null ? `${ultimo.humedad}%` : '—'}
              </p>
              <p className="text-[10px] mt-1 font-semibold" style={{ color: dark ? ec(hEstado, dark, 'light') : ec(hEstado, false, 'light') }}>
                {hEstado === 'ok'      && 'En rango óptimo'}
                {hEstado === 'alerta'  && 'Fuera del ideal'}
                {hEstado === 'critico' && '⚠ Fuera del rango seguro'}
                {hEstado === 'nd'      && 'Sin dato'}
              </p>
              {humData.length >= 2 && (
                <div className="mt-3">
                  <Sparkline data={humData} color={dark ? ec(hEstado, dark, 'light') : ec(hEstado, false, 'light')} min={0} max={100} width={160} height={36}/>
                  <p className="text-[9px] mt-1" style={{ color: dark ? D.sub : '#9ca3af' }}>Últimas {humData.length} lecturas</p>
                </div>
              )}
            </div>

            {/* Luminosidad + incidencias */}
            <div className="rounded-xl p-4 flex flex-col gap-3"
              style={{ backgroundColor: dark ? 'rgba(202,138,4,0.08)' : '#fefce8', border: `1.5px solid ${dark ? 'rgba(251,191,36,0.2)' : '#fde68a'}` }}>
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Sun size={14} style={{ color: dark ? '#fbbf24' : '#ca8a04' }}/>
                  <span className="text-xs font-bold" style={{ color: dark ? D.sub : '#6b7280' }}>Luminosidad</span>
                </div>
                <p className="text-2xl font-extrabold capitalize" style={{ color: dark ? D.text : '#111827' }}>
                  {ultimo.luminosidad_display || ultimo.luminosidad}
                </p>
              </div>
              {ultimo.incidencias && (
                <div className="rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#fff7ed', color: dark ? '#fbbf24' : '#92400e' }}>
                  <span className="font-bold block mb-0.5">Incidencia:</span>
                  {ultimo.incidencias}
                </div>
              )}
            </div>
          </div>

          {/* Banner estado de rangos */}
          <AlertaRango ultimo={ultimo} dark={dark}/>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }}/>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar biohuerto o fecha..."
            style={{ ...ist, paddingLeft: '32px', paddingRight: '12px', width: '100%' }}/>
        </div>
        <div className="flex items-center gap-2">
          <TreePine size={13} style={{ color: dark ? D.sub : '#9ca3af' }}/>
          <select value={filtroBio} onChange={e => setFiltroBio(e.target.value)}
            style={{ ...ist, minWidth: '160px', cursor: 'pointer' }}>
            <option value="">Todos los biohuertos</option>
            {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </div>
        <p className="text-xs ml-auto" style={{ color: dark ? D.sub : '#9ca3af' }}>
          {filtered.length} registro{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Activity size={36} style={{ color: dark ? D.sub : '#d1d5db' }}/>
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin registros de monitoreo</p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-xs mt-1 flex items-center gap-1">
              <Plus size={12}/> Primer registro
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Fecha', 'Biohuerto', 'Temperatura', 'Humedad', 'Luminosidad', 'Incidencias', ''].map((h, i) => (
                    <th key={i}
                      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide
                        ${i === 1 ? 'hidden md:table-cell' : ''}
                        ${i === 4 ? 'hidden lg:table-cell' : ''}
                        ${i === 5 ? 'hidden xl:table-cell' : ''}`}
                      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const te = estadoTemp(r.temperatura)
                  const he = estadoHum(r.humedad)
                  const rowAlert = te === 'critico' || he === 'critico'
                  return (
                    <tr key={r.id}
                      style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {rowAlert && <AlertTriangle size={11} style={{ color: dark ? '#f87171' : '#dc2626' }}/>}
                          <div className="flex items-center gap-1.5">
                            <CalendarDays size={11} style={{ color: dark ? D.sub : '#9ca3af' }}/>
                            <span className="text-xs font-medium" style={{ color: dark ? D.text : '#374151' }}>{r.fecha}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{r.biohuerto_nombre}</span>
                      </td>

                      <td className="px-4 py-3">
                        {r.temperatura != null ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: dark ? ec(te, dark, 'bg_l') : ec(te, false, 'bg_l'),
                              color: dark ? ec(te, dark, 'light') : ec(te, false, 'light'),
                            }}>
                            <Thermometer size={10}/> {r.temperatura}°C
                          </span>
                        ) : <span className="text-xs" style={{ color: dark ? D.sub : '#d1d5db' }}>—</span>}
                      </td>

                      <td className="px-4 py-3">
                        {r.humedad != null ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: dark ? ec(he, dark, 'bg_l') : ec(he, false, 'bg_l'),
                              color: dark ? ec(he, dark, 'light') : ec(he, false, 'light'),
                            }}>
                            <Droplets size={10}/> {r.humedad}%
                          </span>
                        ) : <span className="text-xs" style={{ color: dark ? D.sub : '#d1d5db' }}>—</span>}
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs capitalize" style={{ color: dark ? D.sub : '#6b7280' }}>
                          {r.luminosidad_display || r.luminosidad}
                        </span>
                      </td>

                      <td className="px-4 py-3 hidden xl:table-cell">
                        <span className="text-xs line-clamp-1" style={{ color: dark ? D.sub : '#6b7280' }}>
                          {r.incidencias || '—'}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleEliminar(r.id)}
                          title="Eliminar registro"
                          className="p-1.5 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fee2e2' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <FormModal dark={dark} biohuertos={biohuertos} onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchAll() }}/>
      )}
    </div>
  )
}
