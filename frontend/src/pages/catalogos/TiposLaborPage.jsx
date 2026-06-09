import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Search, Wrench, ChevronDown, Check } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.07)', hoverRow: 'rgba(255,255,255,0.04)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

const TIPO_OPTS = [
  { value: 'formacion',  label: 'Formación de planta' },
  { value: 'poda',       label: 'Poda'                },
  { value: 'riego',      label: 'Riego'               },
  { value: 'aplicacion', label: 'Aplicación'          },
  { value: 'cosecha',    label: 'Cosecha'             },
  { value: 'otro',       label: 'Otro'                },
]

const TIPO_COLOR = {
  formacion:  { dark: { bg: 'rgba(34,197,94,0.12)',   c: '#4ade80' }, light: { bg: '#dcfce7', c: '#15803d' } },
  poda:       { dark: { bg: 'rgba(251,191,36,0.12)',  c: '#fbbf24' }, light: { bg: '#fef9c3', c: '#d97706' } },
  riego:      { dark: { bg: 'rgba(56,189,248,0.12)',  c: '#38bdf8' }, light: { bg: '#e0f2fe', c: '#0284c7' } },
  aplicacion: { dark: { bg: 'rgba(239,68,68,0.12)',   c: '#f87171' }, light: { bg: '#fee2e2', c: '#dc2626' } },
  cosecha:    { dark: { bg: 'rgba(168,85,247,0.12)',  c: '#c084fc' }, light: { bg: '#f3e8ff', c: '#7e22ce' } },
  otro:       { dark: { bg: 'rgba(255,255,255,0.08)', c: '#94a3b8' }, light: { bg: '#f3f4f6', c: '#6b7280' } },
}

/* ── Dropdown con buscador ── */
function SearchSelect({ dark, value, onChange, options, placeholder = 'Selecciona', allLabel }) {
  const [open, setOpen]     = useState(false)
  const [q, setQ]           = useState('')
  const ref                 = useRef(null)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = options.filter(o => o.label.toLowerCase().includes(q.toLowerCase()))
  const selected = options.find(o => o.value === value)

  const ist = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? (open ? 'rgba(96,165,250,0.5)' : D.inputBorder) : (open ? '#93c5fd' : '#e5e7eb')}`,
    color: dark ? D.text : '#111827',
    borderRadius: '10px',
    outline: 'none',
  }

  return (
    <div ref={ref} className="relative w-full">
      <button type="button" onClick={() => { setOpen(o => !o); setQ('') }}
        className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-all"
        style={ist}>
        <span style={{ color: selected ? (dark ? D.text : '#111827') : (dark ? D.sub : '#9ca3af') }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`}
          style={{ color: dark ? D.sub : '#9ca3af', flexShrink: 0 }} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: dark ? '#1e2a3a' : '#fff', border: `1.5px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}` }}>
          <div className="p-2" style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)}
                placeholder="Buscar..."
                className="w-full text-sm pl-7 pr-3 py-1.5 rounded-lg outline-none"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f9fafb', color: dark ? D.text : '#111827', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}` }} />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto thin-scroll py-1">
            {allLabel && (
              <button type="button" onClick={() => { onChange(''); setOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors"
                style={{ color: dark ? D.sub : '#6b7280', backgroundColor: value === '' ? (dark ? 'rgba(255,255,255,0.06)' : '#f9fafb') : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = value === '' ? (dark ? 'rgba(255,255,255,0.06)' : '#f9fafb') : 'transparent'}>
                {allLabel}
                {value === '' && <Check size={13} />}
              </button>
            )}
            {filtered.map(o => (
              <button type="button" key={o.value} onClick={() => { onChange(o.value); setOpen(false) }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors"
                style={{ color: dark ? D.text : '#111827', backgroundColor: value === o.value ? (dark ? 'rgba(96,165,250,0.10)' : '#eff6ff') : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = value === o.value ? (dark ? 'rgba(96,165,250,0.10)' : '#eff6ff') : 'transparent'}>
                {o.label}
                {value === o.value && <Check size={13} style={{ color: dark ? '#60a5fa' : '#2563eb', flexShrink: 0 }} />}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-3 text-xs text-center" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Modal({ dark, title, onClose, onSubmit, loading, children }) {
  const ps = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col" style={{ ...ps, maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ color: D.sub }}><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col min-h-0" style={{ flex: 1 }}>
          <div className="overflow-y-auto thin-scroll px-6 pb-4 space-y-4" style={{ flex: 1 }}>{children}</div>
          <div className="flex gap-3 px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}` }}>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TiposLaborPage() {
  const { dark } = useTheme()
  const [data, setData]       = useState([])
  const [search, setSearch]   = useState('')
  const [filtro, setFiltro]   = useState('')
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ codigo: '', nombre: '', tipo: 'otro', unidad_default: 'hora', costo_unitario_default: '' })
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => { const r = await api.get('/campanas/tipos-labor/'); setData(r.data) }, [])
  useEffect(() => { fetch() }, [fetch])

  const openNew  = () => { setForm({ codigo: '', nombre: '', tipo: 'otro', unidad_default: 'hora', costo_unitario_default: '' }); setModal('new') }
  const openEdit = item => { setForm({ ...item }); setModal('edit') }
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal === 'edit') { await api.patch(`/campanas/tipos-labor/${form.id}/`, form); toast.success('Labor actualizada.') }
      else { await api.post('/campanas/tipos-labor/', form); toast.success('Labor registrada.') }
      setModal(null); fetch()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') Object.values(msg).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al guardar.')
    } finally { setLoading(false) }
  }

  const del = async item => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return
    try { await api.delete(`/campanas/tipos-labor/${item.id}/`); toast.success('Eliminada.'); fetch() }
    catch { toast.error('No se pudo eliminar.') }
  }

  const filtered = data.filter(l => {
    const q = search.toLowerCase()
    return (!q || `${l.codigo} ${l.nombre}`.toLowerCase().includes(q)) && (!filtro || l.tipo === filtro)
  })

  const ist = { backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`, color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none' }
  const lst = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }
  const cardStyle = { backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px' }

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Catálogos', to: '/catalogos' }, { label: 'Tipos de labor' }]} />
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: dark ? 'rgba(251,191,36,0.12)' : '#fffbeb' }}>
            <Wrench size={18} style={{ color: dark ? '#fbbf24' : '#d97706' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Tipos de labor</h1>
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>{data.length} tipos registrados</p>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar código o nombre..."
            style={{ ...ist, paddingLeft: '36px', width: '260px', height: '40px', paddingTop: 0, paddingBottom: 0 }} />
        </div>
        <div style={{ width: '200px' }}>
          <SearchSelect dark={dark} value={filtro} onChange={setFiltro}
            options={TIPO_OPTS} placeholder="Todos los tipos" allLabel="Todos los tipos" />
        </div>
        <div className="ml-auto">
          <button onClick={openNew} className="flex items-center gap-2 btn-primary"><Plus size={15} /> Nueva labor</button>
        </div>
      </div>

      {/* Tabla */}
      <div style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              {['Código', 'Nombre', 'Tipo', 'Unidad', 'Costo / unidad', ''].map((col, i) => (
                <th key={i} className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide ${i === 5 ? 'text-right' : ''}`}
                  style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => {
              const tc = dark ? TIPO_COLOR[l.tipo]?.dark : TIPO_COLOR[l.tipo]?.light
              return (
                <tr key={l.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-5 py-3.5 font-mono font-bold text-sm" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{l.codigo}</td>
                  <td className="px-5 py-3.5 font-semibold text-sm" style={{ color: dark ? D.text : '#111827' }}>{l.nombre}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: tc?.bg, color: tc?.c }}>{l.tipo_display}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{l.unidad_default}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>S/. {parseFloat(l.costo_unitario_default).toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(l)} className="p-2 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={15} /></button>
                      <button onClick={() => del(l)} className="p-2 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin tipos de labor registrados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal dark={dark} title={modal === 'edit' ? 'Editar labor' : 'Nueva labor'} onClose={() => setModal(null)} onSubmit={submit} loading={loading}>
          {modal === 'edit' && (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '12px', fontWeight: 700, color: dark ? D.sub : '#6b7280' }}>Código:</span>
              <span className="font-mono font-bold text-sm px-2.5 py-1 rounded-lg"
                style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: dark ? 'rgba(96,165,250,0.10)' : '#eff6ff' }}>
                {form.codigo}
              </span>
            </div>
          )}
          <div>
            <label style={lst}>Tipo</label>
            <SearchSelect dark={dark} value={form.tipo}
              onChange={v => setForm(f => ({ ...f, tipo: v }))}
              options={TIPO_OPTS} placeholder="Selecciona tipo" />
          </div>
          <div><label style={lst}>Nombre *</label><input name="nombre" value={form.nombre} onChange={h} style={ist} placeholder="Poda de formación" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={lst}>Unidad</label>
              <input name="unidad_default" value={form.unidad_default} onChange={h} style={ist} placeholder="hora, jornal, ha" list="unidades-labor" />
              <datalist id="unidades-labor">
                {['hora','jornal','día','m²','ha','m','kg','L','unid.','saco'].map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
            <div><label style={lst}>Costo por unidad (S/.) *</label><input name="costo_unitario_default" type="number" step="0.01" min="0" value={form.costo_unitario_default} onChange={h} style={ist} required /></div>
          </div>
        </Modal>
      )}
    </div>
  )
}
