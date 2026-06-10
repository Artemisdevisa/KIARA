import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  Bell, Search, CheckCircle, AlertTriangle, Clock,
  Droplets, Leaf, Shield, Wheat, RefreshCw, Bookmark,
  Thermometer, CalendarDays, Cpu,
} from 'lucide-react'

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
  btnIdle:     'rgba(255,255,255,0.07)',
  btnBorder:   'rgba(255,255,255,0.10)',
}

const TIPO_CONFIG = {
  riego:         { Icon: Droplets,     color: '#2563eb', darkColor: '#60a5fa', bg: '#eff6ff',  darkBg: 'rgba(37,99,235,0.15)'   },
  fertilizacion: { Icon: Leaf,         color: '#16a34a', darkColor: '#4ade80', bg: '#f0fdf4',  darkBg: 'rgba(22,163,74,0.15)'   },
  control:       { Icon: Shield,       color: '#7c3aed', darkColor: '#a78bfa', bg: '#f5f3ff',  darkBg: 'rgba(124,58,237,0.15)'  },
  cosecha:       { Icon: Wheat,        color: '#d97706', darkColor: '#fbbf24', bg: '#fffbeb',  darkBg: 'rgba(217,119,6,0.15)'   },
  rotacion:      { Icon: RefreshCw,    color: '#0891b2', darkColor: '#22d3ee', bg: '#ecfeff',  darkBg: 'rgba(8,145,178,0.15)'   },
  seguridad:     { Icon: Shield,       color: '#dc2626', darkColor: '#f87171', bg: '#fee2e2',  darkBg: 'rgba(239,68,68,0.15)'   },
  labor:         { Icon: CalendarDays, color: '#9333ea', darkColor: '#c084fc', bg: '#faf5ff',  darkBg: 'rgba(147,51,234,0.15)'  },
  otro:          { Icon: Bookmark,     color: '#6b7280', darkColor: '#9ca3af', bg: '#f9fafb',  darkBg: 'rgba(107,114,128,0.15)' },
}

const PRIORIDAD_STYLE = {
  alta:  { bg: 'rgba(239,68,68,0.15)',  bgL: '#fee2e2', color: '#f87171', colorL: '#dc2626' },
  media: { bg: 'rgba(245,158,11,0.15)', bgL: '#fef9c3', color: '#fbbf24', colorL: '#d97706' },
  baja:  { bg: 'rgba(107,114,128,0.12)',bgL: '#f3f4f6', color: '#9ca3af', colorL: '#6b7280' },
}

const ORIGEN_CONFIG = {
  monitoreo: { label: 'Monitoreo', color: '#0891b2', darkColor: '#22d3ee', Icon: Thermometer },
  sistema:   { label: 'Sistema',   color: '#7c3aed', darkColor: '#a78bfa', Icon: Cpu         },
  manual:    { label: 'Manual',    color: '#6b7280', darkColor: '#9ca3af', Icon: Bell        },
}

export default function AlertasPage() {
  const { dark } = useTheme()
  const [alertas, setAlertas]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [soloActivas, setSoloActivas] = useState(true)
  const [search, setSearch]         = useState('')
  const [filtroOrigen, setFiltroOrigen] = useState('')
  const [filtroBiohuerto, setFiltroBiohuerto] = useState('')

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (soloActivas) params.set('completada', 'false')
      if (filtroOrigen) params.set('origen', filtroOrigen)
      const { data } = await api.get(`/campanas/mis-alertas/?${params}`)
      setAlertas(data)
    } catch { toast.error('Error al cargar alertas.') }
    finally { setLoading(false) }
  }, [soloActivas, filtroOrigen])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleCompletar = async (id) => {
    try {
      await api.post(`/campanas/alertas/${id}/completar/`)
      toast.success('Alerta completada.')
      fetchAll()
    } catch { toast.error('No se pudo completar.') }
  }

  const filtered = alertas.filter(a => {
    if (filtroBiohuerto && a.biohuerto_nombre !== filtroBiohuerto) return false
    if (!search) return true
    const q = search.toLowerCase()
    return (
      a.titulo?.toLowerCase().includes(q) ||
      a.campana_codigo?.toLowerCase().includes(q) ||
      a.variedad_str?.toLowerCase().includes(q) ||
      a.biohuerto_nombre?.toLowerCase().includes(q)
    )
  })

  const biohuertosUnicos = [...new Set(alertas.map(a => a.biohuerto_nombre).filter(Boolean))].sort()

  const vencidas = filtered.filter(a => a.dias_restantes < 0 && !a.completada).length

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  const STATUS_FILTERS = [
    { value: true,  label: 'Pendientes' },
    { value: false, label: 'Todas'      },
  ]
  const ORIGEN_FILTERS = [
    { value: '',           label: 'Todos los orígenes' },
    { value: 'monitoreo', label: 'Monitoreo'           },
    { value: 'sistema',   label: 'Sistema'             },
    { value: 'manual',    label: 'Manual'              },
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
        <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
          Generadas automáticamente por el sistema y monitoreo de clima
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap"
        style={{ ...cardStyle, padding: '14px 16px' }}>

        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar alerta, campaña, variedad..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px',
              fontSize: '13px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151', height: '36px',
            }}
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={String(f.value)} onClick={() => setSoloActivas(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: soloActivas === f.value ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${soloActivas === f.value ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: soloActivas === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {ORIGEN_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFiltroOrigen(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: filtroOrigen === f.value ? '#2563eb' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${filtroOrigen === f.value ? '#2563eb' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: filtroOrigen === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {biohuertosUnicos.length > 1 && (
          <select
            value={filtroBiohuerto}
            onChange={e => setFiltroBiohuerto(e.target.value)}
            style={{
              height: '36px', fontSize: '12px', fontWeight: 700,
              borderRadius: '10px', paddingLeft: '10px', paddingRight: '28px',
              outline: 'none', cursor: 'pointer',
              backgroundColor: filtroBiohuerto ? (dark ? 'rgba(16,185,129,0.18)' : '#ecfdf5') : (dark ? D.btnIdle : '#f3f4f6'),
              border: `1px solid ${filtroBiohuerto ? (dark ? 'rgba(52,211,153,0.4)' : '#6ee7b7') : (dark ? D.btnBorder : '#e5e7eb')}`,
              color: filtroBiohuerto ? (dark ? '#34d399' : '#059669') : (dark ? D.sub : '#6b7280'),
            }}>
            <option value="">Todos los biohuertos</option>
            {biohuertosUnicos.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        )}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={cardStyle} className="flex flex-col items-center justify-center py-16 gap-3">
          <Bell size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
          <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>
            Sin alertas {soloActivas ? 'pendientes' : ''}
          </p>
          <p className="text-xs text-center max-w-xs" style={{ color: dark ? 'rgba(255,255,255,0.25)' : '#d1d5db' }}>
            Las alertas se generan automáticamente al registrar monitoreo de clima o desde el detalle de cada campaña.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => {
            const tipoCfg = TIPO_CONFIG[a.tipo] || TIPO_CONFIG.otro
            const TipoIcon = tipoCfg.Icon
            const priCfg = PRIORIDAD_STYLE[a.prioridad] || PRIORIDAD_STYLE.media
            const origenCfg = ORIGEN_CONFIG[a.origen] || ORIGEN_CONFIG.manual
            const OrigenIcon = origenCfg.Icon
            const vencida = a.dias_restantes < 0 && !a.completada

            return (
              <div key={a.id}
                style={{
                  ...cardStyle,
                  opacity: a.completada ? 0.6 : 1,
                  borderLeft: vencida
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
                      {a.titulo}
                    </p>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: dark ? priCfg.bg : priCfg.bgL,
                        color: dark ? priCfg.color : priCfg.colorL,
                      }}>
                      {a.prioridad_display}
                    </span>
                    {vencida && (
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

                  {/* Campaña y variedad */}
                  <p className="text-xs font-semibold" style={{ color: dark ? D.sub : '#374151' }}>
                    {a.campana_codigo}
                    {a.variedad_str ? ` · ${a.variedad_str}` : ''}
                    {a.biohuerto_nombre ? ` · ${a.biohuerto_nombre}` : ''}
                  </p>

                  {a.descripcion && (
                    <p className="text-xs mt-1" style={{ color: dark ? D.sub : '#6b7280' }}>{a.descripcion}</p>
                  )}

                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <p className="text-xs flex items-center gap-1" style={{ color: dark ? D.sub : '#9ca3af' }}>
                      <Clock size={11} />
                      {a.fecha_programada}
                      {a.dias_restantes === 0 ? ' · Hoy' : a.dias_restantes > 0 ? ` · en ${a.dias_restantes}d` : ` · hace ${Math.abs(a.dias_restantes)}d`}
                    </p>
                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6',
                        color: dark ? origenCfg.darkColor : origenCfg.color,
                      }}>
                      <OrigenIcon size={10} /> {origenCfg.label}
                    </span>
                  </div>
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
    </div>
  )
}
