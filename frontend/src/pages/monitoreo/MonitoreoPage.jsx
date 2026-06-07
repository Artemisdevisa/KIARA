import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Activity, Plus, Search, Thermometer, Droplets, Sun, Cloud, CalendarDays, TreePine, X } from 'lucide-react'

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

const LUZ_CONFIG = {
  alta:  { Icon: Sun,   color: '#ca8a04', darkColor: '#fbbf24' },
  media: { Icon: Cloud, color: '#64748b', darkColor: '#94a3b8' },
  baja:  { Icon: Cloud, color: '#94a3b8', darkColor: '#64748b' },
}

function FormModal({ dark, biohuertos, onClose, onSaved }) {
  const [form, setForm] = useState({
    biohuerto: '', fecha: new Date().toISOString().split('T')[0],
    humedad: '', temperatura: '', luminosidad: 'media', incidencias: ''
  })
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/monitoreo/', form)
      toast.success('Registro guardado.')
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
            Registrar variables del día
          </h2>
          <button onClick={onClose} style={{ color: D.sub, padding: '4px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 pb-6" style={{ flex: 1 }}>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Biohuerto</label>
                <select name="biohuerto" value={form.biohuerto} onChange={handle} style={inputStyle} required>
                  <option value="">Seleccionar...</option>
                  {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fecha</label>
                <input name="fecha" type="date" value={form.fecha} onChange={handle} style={inputStyle} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label style={labelStyle}>Humedad (%)</label>
                <input name="humedad" type="number" min="0" max="100" step="0.1"
                  value={form.humedad} onChange={handle} style={inputStyle} placeholder="65" />
              </div>
              <div>
                <label style={labelStyle}>Temperatura (°C)</label>
                <input name="temperatura" type="number" step="0.1"
                  value={form.temperatura} onChange={handle} style={inputStyle} placeholder="24" />
              </div>
              <div>
                <label style={labelStyle}>Luminosidad</label>
                <select name="luminosidad" value={form.luminosidad} onChange={handle} style={inputStyle}>
                  <option value="alta">Alta</option>
                  <option value="media">Media</option>
                  <option value="baja">Baja</option>
                </select>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Incidencias / Novedades</label>
              <textarea name="incidencias" value={form.incidencias} onChange={handle} rows={2}
                style={{ ...inputStyle, resize: 'none' }} placeholder="Novedades del día..." />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
                {loading ? 'Guardando...' : 'Guardar registro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

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
      setRegistros(m.data)
      setBiohuertos(b.data)
    } catch { toast.error('Error al cargar.') }
    finally { setLoading(false) }
  }, [filtroBio])

  useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = registros.filter(r => {
    const q = search.toLowerCase()
    return !search ||
      r.biohuerto_nombre?.toLowerCase().includes(q) ||
      r.fecha?.includes(q)
  })

  const ultimo = registros[0]

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }
  const inputSelectStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#374151',
    borderRadius: '10px', padding: '7px 12px', fontSize: '13px', outline: 'none',
    height: '36px', cursor: 'pointer',
  }

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <Activity size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Monitoreo</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {filtered.length} registro{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 btn-primary text-sm">
          <Plus size={15} /> Nuevo registro
        </button>
      </div>

      {/* Último registro */}
      {ultimo && (
        <div style={cardStyle} className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide mb-4"
            style={{ color: dark ? D.sub : '#9ca3af' }}>
            Último registro — {ultimo.fecha} · {ultimo.biohuerto_nombre}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(37,99,235,0.10)' : '#eff6ff' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(37,99,235,0.20)' : '#dbeafe' }}>
                <Droplets size={20} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />
              </div>
              <p className="text-2xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                {ultimo.humedad != null ? `${ultimo.humedad}%` : '—'}
              </p>
              <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Humedad</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(234,88,12,0.10)' : '#fff7ed' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(234,88,12,0.20)' : '#fed7aa' }}>
                <Thermometer size={20} style={{ color: dark ? '#fb923c' : '#ea580c' }} />
              </div>
              <p className="text-2xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                {ultimo.temperatura != null ? `${ultimo.temperatura}°C` : '—'}
              </p>
              <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Temperatura</p>
            </div>

            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(202,138,4,0.10)' : '#fefce8' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(202,138,4,0.20)' : '#fef9c3' }}>
                <Sun size={20} style={{ color: dark ? '#fbbf24' : '#ca8a04' }} />
              </div>
              <p className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                {ultimo.luminosidad_display || ultimo.luminosidad}
              </p>
              <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Luminosidad</p>
            </div>
          </div>
          {ultimo.incidencias && (
            <div className="mt-3 p-3 rounded-xl text-xs"
              style={{ backgroundColor: dark ? 'rgba(202,138,4,0.08)' : '#fefce8', color: dark ? '#fbbf24' : '#92400e' }}>
              <span className="font-bold">Incidencia: </span>{ultimo.incidencias}
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar biohuerto o fecha..."
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
        <div className="flex items-center gap-2">
          <TreePine size={13} style={{ color: dark ? D.sub : '#9ca3af' }} />
          <select
            value={filtroBio}
            onChange={e => setFiltroBio(e.target.value)}
            style={{ ...inputSelectStyle, minWidth: '160px' }}
          >
            <option value="">Todos los biohuertos</option>
            {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Activity size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin registros de monitoreo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Fecha', 'Biohuerto', 'Humedad', 'Temperatura', 'Luminosidad', 'Incidencias'].map((h, i) => (
                    <th key={i}
                      className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide
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
                  const luzCfg = LUZ_CONFIG[r.luminosidad] || LUZ_CONFIG.media
                  const LuzIcon = luzCfg.Icon
                  const luzColor = dark ? luzCfg.darkColor : luzCfg.color
                  return (
                    <tr key={r.id}
                      style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                          <span className="text-xs font-medium" style={{ color: dark ? D.text : '#374151' }}>
                            {r.fecha}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                          {r.biohuerto_nombre}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        {r.humedad != null ? (
                          <div className="flex items-center gap-1.5">
                            <Droplets size={12} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />
                            <span className="text-xs font-medium" style={{ color: dark ? D.text : '#374151' }}>
                              {r.humedad}%
                            </span>
                          </div>
                        ) : <span className="text-xs" style={{ color: dark ? D.sub : '#d1d5db' }}>—</span>}
                      </td>

                      <td className="px-5 py-3.5">
                        {r.temperatura != null ? (
                          <div className="flex items-center gap-1.5">
                            <Thermometer size={12} style={{ color: dark ? '#fb923c' : '#ea580c' }} />
                            <span className="text-xs font-medium" style={{ color: dark ? D.text : '#374151' }}>
                              {r.temperatura}°C
                            </span>
                          </div>
                        ) : <span className="text-xs" style={{ color: dark ? D.sub : '#d1d5db' }}>—</span>}
                      </td>

                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <LuzIcon size={12} style={{ color: luzColor }} />
                          <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                            {r.luminosidad_display || r.luminosidad}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 hidden xl:table-cell">
                        <span className="text-xs line-clamp-1" style={{ color: dark ? D.sub : '#6b7280' }}>
                          {r.incidencias || '—'}
                        </span>
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
        <FormModal
          dark={dark}
          biohuertos={biohuertos}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); fetchAll() }}
        />
      )}
    </div>
  )
}
