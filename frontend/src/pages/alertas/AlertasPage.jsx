import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  Bell, Plus, Search, CheckCircle, AlertTriangle, Clock,
  Droplets, Leaf, Shield, Wheat, RefreshCw, Bookmark, X, CalendarDays
} from 'lucide-react'

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  divider:     'rgba(255,255,255,0.07)',
  hoverRow:    'rgba(255,255,255,0.04)',
  btnIdle:     'rgba(255,255,255,0.07)',
  btnBorder:   'rgba(255,255,255,0.10)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

const TIPO_CONFIG = {
  riego:         { Icon: Droplets,  color: '#2563eb', darkColor: '#60a5fa', bg: '#eff6ff',  darkBg: 'rgba(37,99,235,0.15)'   },
  fertilizacion: { Icon: Leaf,      color: '#16a34a', darkColor: '#4ade80', bg: '#f0fdf4',  darkBg: 'rgba(22,163,74,0.15)'   },
  control:       { Icon: Shield,    color: '#7c3aed', darkColor: '#a78bfa', bg: '#f5f3ff',  darkBg: 'rgba(124,58,237,0.15)'  },
  cosecha:       { Icon: Wheat,     color: '#d97706', darkColor: '#fbbf24', bg: '#fffbeb',  darkBg: 'rgba(217,119,6,0.15)'   },
  rotacion:      { Icon: RefreshCw, color: '#0891b2', darkColor: '#22d3ee', bg: '#ecfeff',  darkBg: 'rgba(8,145,178,0.15)'   },
  otro:          { Icon: Bookmark,  color: '#6b7280', darkColor: '#9ca3af', bg: '#f9fafb',  darkBg: 'rgba(107,114,128,0.15)' },
}

const PRIORIDAD_STYLE = {
  alta:  { bg: 'rgba(239,68,68,0.15)',  bgL: '#fee2e2', color: '#f87171', colorL: '#dc2626'  },
  media: { bg: 'rgba(245,158,11,0.15)', bgL: '#fef9c3', color: '#fbbf24', colorL: '#d97706'  },
  baja:  { bg: 'rgba(107,114,128,0.12)',bgL: '#f3f4f6', color: '#9ca3af', colorL: '#6b7280'  },
}

function FormModal({ dark, cultivos, onClose, onSaved }) {
  const [form, setForm] = useState({
    cultivo: '', tipo: 'riego', fecha_programada: '', descripcion: '', prioridad: 'media'
  })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/alertas/', form)
      toast.success('Alerta creada.')
      onSaved()
    } catch { toast.error('Error al guardar.') }
    finally { setLoading(false) }
  }

  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  const inputStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px',
    color: dark ? D.sub : '#6b7280',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col"
        style={{ ...panelStyle, maxHeight: '92vh' }}>

        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            Nueva alerta
          </h2>
          <button onClick={onClose} style={{ color: D.sub, padding: '4px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6" style={{ flex: 1 }}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Cultivo</label>
                <select name="cultivo" value={form.cultivo} onChange={handle} style={inputStyle} required>
                  <option value="">Seleccionar...</option>
                  {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Tipo</label>
                <select name="tipo" value={form.tipo} onChange={handle} style={inputStyle}>
                  <option value="riego">Riego</option>
                  <option value="fertilizacion">Fertilización orgánica</option>
                  <option value="control">Control preventivo</option>
                  <option value="cosecha">Cosecha</option>
                  <option value="rotacion">Rotación de cultivos</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Fecha y hora</label>
                <input name="fecha_programada" type="datetime-local"
                  value={form.fecha_programada} onChange={handle} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>Prioridad</label>
                <select name="prioridad" value={form.prioridad} onChange={handle} style={inputStyle}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Descripción o nota</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handle} rows={2}
                style={{ ...inputStyle, resize: 'none' }} />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
                {loading ? 'Guardando...' : 'Crear alerta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AlertasPage() {
  const { dark } = useTheme()
  const [alertas, setAlertas]           = useState([])
  const [cultivos, setCultivos]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [showForm, setShowForm]         = useState(false)
  const [filtroPendientes, setFiltroPendientes] = useState(true)
  const [search, setSearch]             = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = filtroPendientes ? '?completada=false' : ''
      const [a, c] = await Promise.all([
        api.get(`/alertas/${params}`),
        api.get('/cultivos/?estado=activo'),
      ])
      setAlertas(a.data)
      setCultivos(c.data)
    } catch { toast.error('Error al cargar.') }
    finally { setLoading(false) }
  }, [filtroPendientes])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCompletar = async (id) => {
    try {
      await api.post(`/alertas/${id}/completar/`)
      toast.success('Alerta marcada como completada.')
      fetchAll()
    } catch { toast.error('No se pudo completar.') }
  }

  const filtered = alertas.filter(a => {
    const q = search.toLowerCase()
    return !search ||
      a.tipo_display?.toLowerCase().includes(q) ||
      a.cultivo_nombre?.toLowerCase().includes(q)
  })

  const vencidas = alertas.filter(a => a.vencida).length

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  const STATUS_FILTERS = [
    { value: true,  label: 'Pendientes' },
    { value: false, label: 'Todas'      },
  ]

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <Bell size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Alertas</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
                {filtered.length} alerta{filtered.length !== 1 ? 's' : ''}
              </p>
              {vencidas > 0 && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: dark ? 'rgba(239,68,68,0.18)' : '#fee2e2', color: dark ? '#f87171' : '#dc2626' }}>
                  <AlertTriangle size={10} /> {vencidas} vencida{vencidas !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary text-sm">
          <Plus size={15} /> Nueva alerta
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar alerta o cultivo..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px',
              fontSize: '13px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151',
              height: '36px',
            }}
          />
        </div>
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map(f => (
            <button key={String(f.value)} onClick={() => setFiltroPendientes(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: filtroPendientes === f.value ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${filtroPendientes === f.value ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: filtroPendientes === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={cardStyle} className="flex flex-col items-center justify-center py-16 gap-2">
          <Bell size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
          <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>
            Sin alertas {filtroPendientes ? 'pendientes' : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const tipoCfg = TIPO_CONFIG[a.tipo] || TIPO_CONFIG.otro
            const TipoIcon = tipoCfg.Icon
            const priCfg = PRIORIDAD_STYLE[a.prioridad] || PRIORIDAD_STYLE.media

            return (
              <div key={a.id}
                style={{
                  ...cardStyle,
                  opacity: a.completada ? 0.6 : 1,
                  borderLeft: a.vencida && !a.completada
                    ? `3px solid ${dark ? '#f87171' : '#dc2626'}`
                    : cardStyle.border,
                }}
                className="flex items-start gap-4 p-4">

                {/* Icono tipo */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: dark ? tipoCfg.darkBg : tipoCfg.bg }}>
                  <TipoIcon size={18} style={{ color: dark ? tipoCfg.darkColor : tipoCfg.color }} />
                </div>

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-semibold text-sm" style={{ color: dark ? D.text : '#111827' }}>
                      {a.tipo_display}
                    </p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: dark ? priCfg.bg : priCfg.bgL,
                        color: dark ? priCfg.color : priCfg.colorL,
                      }}>
                      {a.prioridad_display}
                    </span>
                    {a.vencida && !a.completada && (
                      <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: dark ? 'rgba(239,68,68,0.15)' : '#fee2e2', color: dark ? '#f87171' : '#dc2626' }}>
                        <AlertTriangle size={9} /> Vencida
                      </span>
                    )}
                    {a.completada && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>
                        Completada
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{a.cultivo_nombre}</p>
                  <p className="text-xs flex items-center gap-1 mt-1" style={{ color: dark ? D.sub : '#9ca3af' }}>
                    <Clock size={11} />
                    {new Date(a.fecha_programada).toLocaleString('es-PE')}
                  </p>
                  {a.descripcion && (
                    <p className="text-xs mt-1" style={{ color: dark ? D.sub : '#6b7280' }}>{a.descripcion}</p>
                  )}
                </div>

                {/* Completar */}
                {!a.completada && (
                  <button
                    onClick={() => handleCompletar(a.id)}
                    className="shrink-0 p-1 rounded-lg transition-all duration-150"
                    title="Marcar como completada"
                    style={{ color: dark ? '#4ade80' : '#16a34a', backgroundColor: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4' }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <CheckCircle size={22} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <FormModal
          dark={dark}
          cultivos={cultivos}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchAll() }}
        />
      )}
    </div>
  )
}
