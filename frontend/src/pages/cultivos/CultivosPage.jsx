import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Sprout, Plus, Search, Pencil, Trash2, X, Calendar, Power, TreeDeciduous, RefreshCw } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

/* ─── Etapas por tipo de ciclo ─── */
const ETAPAS_ANUAL = [
  { value: 'germinacion', label: 'Germinación' },
  { value: 'crecimiento', label: 'Crecimiento' },
  { value: 'floracion',   label: 'Floración'   },
  { value: 'cosecha',     label: 'Cosecha'     },
]
const ETAPAS_PERENNE = [
  { value: 'establecido', label: 'Establecido' },
  { value: 'poda',        label: 'Poda'        },
  { value: 'brotacion',   label: 'Brotación'   },
  { value: 'floracion',   label: 'Floración'   },
  { value: 'cosecha',     label: 'Cosecha'     },
]

const ESTADO_FILTERS = [
  { value: '',          label: 'Todos'     },
  { value: 'activo',    label: 'Activo'    },
  { value: 'cosechado', label: 'Cosechado' },
  { value: 'perdido',   label: 'Perdido'   },
]

const TIPO_FILTERS = [
  { value: '',        label: 'Todos'   },
  { value: 'anual',   label: 'Anual'   },
  { value: 'perenne', label: 'Perenne' },
]

/* Badge colors */
const ETAPA_BADGE = {
  germinacion: { bg: '#fef9c3', color: '#a16207' },
  crecimiento: { bg: '#dbeafe', color: '#1d4ed8' },
  establecido: { bg: '#ccfbf1', color: '#0f766e' },
  poda:        { bg: '#ffedd5', color: '#c2410c' },
  brotacion:   { bg: '#dcfce7', color: '#15803d' },
  floracion:   { bg: '#f3e8ff', color: '#7e22ce' },
  cosecha:     { bg: '#d1fae5', color: '#065f46' },
}
const ETAPA_BADGE_DARK = {
  germinacion: { bg: 'rgba(234,179,8,0.18)',   color: '#fde047' },
  crecimiento: { bg: 'rgba(59,130,246,0.18)',  color: '#60a5fa' },
  establecido: { bg: 'rgba(20,184,166,0.18)',  color: '#2dd4bf' },
  poda:        { bg: 'rgba(249,115,22,0.18)',  color: '#fb923c' },
  brotacion:   { bg: 'rgba(34,197,94,0.18)',   color: '#4ade80' },
  floracion:   { bg: 'rgba(168,85,247,0.18)',  color: '#c084fc' },
  cosecha:     { bg: 'rgba(16,185,129,0.18)',  color: '#34d399' },
}

const EMPTY_FORM = {
  biohuerto: '', nombre: '', tipo_ciclo: 'anual', fecha_siembra: '',
  etapa: 'germinacion', cantidad: '', unidad: 'm²',
  fecha_estimada_cosecha: '', notas: '', estado: 'activo',
}

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

/* ── Modal crear/editar ── */
function CultivoModal({ dark, onClose, onSaved, editItem }) {
  const [form,       setForm]       = useState(editItem ? { ...editItem, biohuerto: editItem.biohuerto ?? '' } : EMPTY_FORM)
  const [loading,    setLoading]    = useState(false)
  const [biohuertos, setBiohuertos] = useState([])

  useEffect(() => {
    api.get('/biohuertos/').then(r => setBiohuertos(r.data)).catch(() => {})
  }, [])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleTipoCiclo = tipo => {
    setForm(f => ({
      ...f,
      tipo_ciclo: tipo,
      etapa: tipo === 'anual' ? 'germinacion' : 'establecido',
      fecha_siembra: tipo === 'perenne' ? '' : f.fecha_siembra,
    }))
  }

  const etapaOpts = form.tipo_ciclo === 'perenne' ? ETAPAS_PERENNE : ETAPAS_ANUAL

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        fecha_siembra:          form.fecha_siembra          || null,
        fecha_estimada_cosecha: form.fecha_estimada_cosecha || null,
      }
      if (editItem) {
        await api.patch(`/cultivos/${editItem.id}/`, payload)
        toast.success('Cultivo actualizado.')
      } else {
        await api.post('/cultivos/', payload)
        toast.success('Cultivo registrado.')
      }
      onSaved()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') Object.values(msg).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al guardar.')
    } finally { setLoading(false) }
  }

  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  const inputStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px',
    color: dark ? D.sub : '#6b7280',
  }

  const isPerenne = form.tipo_ciclo === 'perenne'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col"
        style={{ ...panelStyle, maxHeight: '92vh' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            {editItem ? 'Editar cultivo' : 'Registrar cultivo'}
          </h2>
          <button onClick={onClose} style={{ color: D.sub, padding: '4px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col min-h-0" style={{ flex: 1 }}>
          <div className="overflow-y-auto thin-scroll px-6 pb-4 space-y-4" style={{ flex: 1 }}>

            {/* Tipo de ciclo */}
            <div>
              <label style={labelStyle}>Tipo de ciclo *</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    value: 'anual',
                    icon: <RefreshCw size={15} />,
                    title: 'Anual',
                    desc: 'Siembra → cosecha → replanta',
                  },
                  {
                    value: 'perenne',
                    icon: <TreeDeciduous size={15} />,
                    title: 'Perenne',
                    desc: 'Planta permanente, ciclos de cosecha',
                  },
                ].map(opt => {
                  const active = form.tipo_ciclo === opt.value
                  return (
                    <button key={opt.value} type="button" onClick={() => handleTipoCiclo(opt.value)}
                      className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all"
                      style={{
                        border: `1.5px solid ${active
                          ? (opt.value === 'anual' ? '#d97706' : '#16a34a')
                          : dark ? D.inputBorder : '#e5e7eb'}`,
                        backgroundColor: active
                          ? (opt.value === 'anual'
                              ? (dark ? 'rgba(217,119,6,0.12)' : '#fffbeb')
                              : (dark ? 'rgba(22,163,74,0.12)' : '#f0fdf4'))
                          : (dark ? D.inputBg : '#f9fafb'),
                      }}>
                      <span style={{
                        color: active
                          ? (opt.value === 'anual' ? '#d97706' : '#16a34a')
                          : dark ? D.sub : '#9ca3af',
                        marginTop: '1px',
                      }}>
                        {opt.icon}
                      </span>
                      <div>
                        <p className="text-xs font-extrabold" style={{
                          color: active
                            ? (opt.value === 'anual' ? (dark ? '#fbbf24' : '#d97706') : (dark ? '#4ade80' : '#15803d'))
                            : dark ? D.text : '#374151',
                        }}>
                          {opt.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Biohuerto */}
            <div>
              <label style={labelStyle}>Biohuerto *</label>
              <select name="biohuerto" value={form.biohuerto} onChange={handle} style={inputStyle} required>
                <option value="">Selecciona un biohuerto</option>
                {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>

            {/* Nombre + Etapa */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Nombre del cultivo *</label>
                <input name="nombre" value={form.nombre} onChange={handle} style={inputStyle}
                  placeholder={isPerenne ? 'Vid, Manzano…' : 'Lechuga, Tomate…'} required />
              </div>
              <div>
                <label style={labelStyle}>Etapa actual *</label>
                <select name="etapa" value={form.etapa} onChange={handle} style={inputStyle}>
                  {etapaOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            {/* Cantidad + Unidad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Cantidad *</label>
                <input name="cantidad" type="number" step="0.01" min="0" value={form.cantidad}
                  onChange={handle} style={inputStyle} placeholder="50.00" required />
              </div>
              <div>
                <label style={labelStyle}>Unidad</label>
                <input name="unidad" value={form.unidad} onChange={handle} style={inputStyle} placeholder="m²" />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>
                  {isPerenne ? 'Fecha de plantación' : 'Fecha de siembra *'}
                </label>
                <input name="fecha_siembra" type="date" value={form.fecha_siembra}
                  onChange={handle} style={inputStyle}
                  required={!isPerenne} />
                {isPerenne && (
                  <p className="mt-1 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.28)' : '#9ca3af' }}>
                    Opcional si la planta ya estaba establecida
                  </p>
                )}
              </div>
              <div>
                <label style={labelStyle}>
                  {isPerenne ? 'Próxima cosecha est.' : 'Cosecha estimada *'}
                </label>
                <input name="fecha_estimada_cosecha" type="date" value={form.fecha_estimada_cosecha}
                  onChange={handle} style={inputStyle}
                  required={!isPerenne} />
                {isPerenne && (
                  <p className="mt-1 text-xs" style={{ color: dark ? 'rgba(255,255,255,0.28)' : '#9ca3af' }}>
                    Se actualiza cada ciclo
                  </p>
                )}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label style={labelStyle}>Notas</label>
              <textarea name="notas" value={form.notas} onChange={handle} rows={2}
                style={{ ...inputStyle, resize: 'none' }}
                placeholder={isPerenne ? 'Variedad, edad de la planta, últimas podas…' : 'Observaciones adicionales…'} />
            </div>

          </div>

          {/* Footer fijo */}
          <div className="flex gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}` }}>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
              {loading ? 'Guardando...' : editItem ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal confirmar eliminar ── */
function ConfirmModal({ dark, item, onClose, onConfirm, loading }) {
  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>¿Eliminar cultivo?</h3>
          <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>
            Se eliminará <strong>{item?.nombre}</strong> permanentemente.
          </p>
          <div className="flex gap-3 w-full pt-1">
            <button onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 btn-danger text-sm">
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Página principal ── */
export default function CultivosPage() {
  const { dark } = useTheme()
  const [cultivos,      setCultivos]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [estadoFilter,  setEstadoFilter]  = useState('')
  const [tipoFilter,    setTipoFilter]    = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editItem,      setEditItem]      = useState(null)
  const [deleteItem,    setDeleteItem]    = useState(null)
  const [delLoading,    setDelLoading]    = useState(false)

  const fetchCultivos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/cultivos/')
      setCultivos(res.data)
    } catch { toast.error('No se pudo cargar los cultivos.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCultivos() }, [fetchCultivos])

  const ESTADO_CICLO = { activo: 'cosechado', cosechado: 'perdido', perdido: 'activo' }

  const handleToggleEstado = async (c) => {
    const siguiente = ESTADO_CICLO[c.estado]
    try {
      await api.patch(`/cultivos/${c.id}/`, { estado: siguiente })
      toast.success(`Estado → ${siguiente}.`)
      fetchCultivos()
    } catch { toast.error('No se pudo cambiar el estado.') }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await api.delete(`/cultivos/${deleteItem.id}/`)
      toast.success('Cultivo eliminado.')
      setDeleteItem(null)
      fetchCultivos()
    } catch { toast.error('No se pudo eliminar.') }
    finally { setDelLoading(false) }
  }

  const filtered = cultivos.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(q) ||
      c.biohuerto_nombre?.toLowerCase().includes(q)
    const matchEstado = !estadoFilter || c.estado === estadoFilter
    const matchTipo   = !tipoFilter   || c.tipo_ciclo === tipoFilter
    return matchSearch && matchEstado && matchTipo
  })

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }
  const etapaBadge = dark ? ETAPA_BADGE_DARK : ETAPA_BADGE

  const tipoBadge = (tipo) => {
    if (tipo === 'perenne') return {
      bg:    dark ? 'rgba(22,163,74,0.15)'  : '#f0fdf4',
      color: dark ? '#4ade80' : '#15803d',
      icon:  <TreeDeciduous size={10} />,
      label: 'Perenne',
    }
    return {
      bg:    dark ? 'rgba(217,119,6,0.15)' : '#fffbeb',
      color: dark ? '#fbbf24' : '#d97706',
      icon:  <RefreshCw size={10} />,
      label: 'Anual',
    }
  }

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Mi Huerto', to: '/mi-huerto' }, { label: 'Cultivos' }]} />

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <Sprout size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Cultivos</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {filtered.length} cultivo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true) }}
          className="flex items-center gap-2 btn-primary text-sm">
          <Plus size={15} /> Nuevo cultivo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-56 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cultivo..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px',
              fontSize: '15px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151', height: '36px',
            }} />
        </div>

        {/* Filtro ciclo */}
        <div className="flex gap-1.5">
          {TIPO_FILTERS.map(f => (
            <button key={f.value} onClick={() => setTipoFilter(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: tipoFilter === f.value
                  ? (f.value === 'perenne' ? '#16a34a' : f.value === 'anual' ? '#d97706' : '#374151')
                  : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${tipoFilter === f.value
                  ? (f.value === 'perenne' ? '#16a34a' : f.value === 'anual' ? '#d97706' : '#374151')
                  : dark ? D.btnBorder : '#e5e7eb'}`,
                color: tipoFilter === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Filtro estado */}
        <div className="flex gap-1.5 flex-wrap">
          {ESTADO_FILTERS.map(f => (
            <button key={f.value} onClick={() => setEstadoFilter(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: estadoFilter === f.value ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${estadoFilter === f.value ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: estadoFilter === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              {f.label}
            </button>
          ))}
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
            <Sprout size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron cultivos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Cultivo', 'Biohuerto', 'Ciclo', 'Etapa', 'Cantidad', 'Siembra', 'Cosecha est.', 'Estado', ''].map((h, i) => (
                    <th key={i}
                      className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide
                        ${i === 1 ? 'hidden md:table-cell' : ''}
                        ${i === 4 ? 'hidden sm:table-cell' : ''}
                        ${i === 5 ? 'hidden lg:table-cell' : ''}
                        ${i === 6 ? 'hidden lg:table-cell' : ''}
                        ${i === 8 ? 'text-right' : ''}`}
                      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const tb = tipoBadge(c.tipo_ciclo)
                  return (
                    <tr key={c.id}
                      style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                      <td className="px-4 py-3.5">
                        <p className="font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>{c.nombre}</p>
                      </td>

                      <td className="px-4 py-3.5 hidden md:table-cell text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                        {c.biohuerto_nombre}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1 text-[13px] font-bold px-2 py-0.5 rounded-full w-fit"
                          style={{ backgroundColor: tb.bg, color: tb.color }}>
                          {tb.icon} {tb.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                          style={{ backgroundColor: etapaBadge[c.etapa]?.bg, color: etapaBadge[c.etapa]?.color }}>
                          {c.etapa_display}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 hidden sm:table-cell text-xs" style={{ color: dark ? D.text : '#374151' }}>
                        {c.cantidad} {c.unidad}
                      </td>

                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {c.fecha_siembra ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                            <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{c.fecha_siembra}</span>
                          </div>
                        ) : (
                          <span className="text-xs italic" style={{ color: dark ? 'rgba(255,255,255,0.25)' : '#d1d5db' }}>
                            ya establecido
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {c.fecha_estimada_cosecha ? (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                            <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{c.fecha_estimada_cosecha}</span>
                            {c.dias_para_cosecha !== null && c.estado === 'activo' && (
                              <span className="text-xs font-semibold"
                                style={{ color: c.dias_para_cosecha <= 7 ? '#f97316' : dark ? D.sub : '#9ca3af' }}>
                                ({c.dias_para_cosecha >= 0 ? `${c.dias_para_cosecha}d` : `+${Math.abs(c.dias_para_cosecha)}d`})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.25)' : '#d1d5db' }}>—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                          style={
                            c.estado === 'activo'    ? { backgroundColor: dark ? 'rgba(22,163,74,0.18)'  : '#dcfce7', color: dark ? '#4ade80' : '#15803d' } :
                            c.estado === 'cosechado' ? { backgroundColor: dark ? 'rgba(59,130,246,0.18)' : '#dbeafe', color: dark ? '#60a5fa' : '#1d4ed8' } :
                                                       { backgroundColor: dark ? 'rgba(239,68,68,0.18)'  : '#fee2e2', color: dark ? '#f87171' : '#dc2626' }
                          }>
                          {c.estado_display}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditItem(c); setModalOpen(true) }}
                            className="p-2 rounded-lg transition-all duration-150"
                            style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => handleToggleEstado(c)}
                            className="p-2 rounded-lg transition-all duration-150"
                            title={`Estado: ${c.estado} → ${ESTADO_CICLO[c.estado]}`}
                            style={{
                              color: c.estado === 'activo' ? (dark ? '#4ade80' : '#16a34a') : c.estado === 'cosechado' ? (dark ? '#60a5fa' : '#2563eb') : (dark ? '#f87171' : '#dc2626'),
                              backgroundColor: 'transparent',
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Power size={16} />
                          </button>
                          <button onClick={() => setDeleteItem(c)}
                            className="p-2 rounded-lg transition-all duration-150"
                            style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <CultivoModal
          dark={dark}
          editItem={editItem}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
          onSaved={() => { setModalOpen(false); setEditItem(null); fetchCultivos() }}
        />
      )}
      {deleteItem && (
        <ConfirmModal
          dark={dark}
          item={deleteItem}
          loading={delLoading}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
