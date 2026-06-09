import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Search, Target } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

const TIPO_OPTS = [
  { value: 'control',       label: 'Control fitosanitario' },
  { value: 'prevencion',    label: 'Prevención' },
  { value: 'fertilizacion', label: 'Fertilización' },
  { value: 'estimulacion',  label: 'Bioestimulación' },
  { value: 'otro',          label: 'Otro' },
]

const TIPO_COLORS = {
  control:       { dark: '#f87171', light: '#dc2626', bg: { dark: 'rgba(239,68,68,0.12)',   light: '#fef2f2' } },
  prevencion:    { dark: '#fb923c', light: '#ea580c', bg: { dark: 'rgba(249,115,22,0.12)',  light: '#fff7ed' } },
  fertilizacion: { dark: '#4ade80', light: '#15803d', bg: { dark: 'rgba(22,163,74,0.12)',   light: '#f0fdf4' } },
  estimulacion:  { dark: '#818cf8', light: '#4f46e5', bg: { dark: 'rgba(99,102,241,0.12)',  light: '#eef2ff' } },
  otro:          { dark: '#94a3b8', light: '#475569', bg: { dark: 'rgba(148,163,184,0.10)', light: '#f8fafc' } },
}

function Badge({ tipo, dark }) {
  const c = TIPO_COLORS[tipo] || TIPO_COLORS.otro
  const ic = dark ? c.dark : c.light
  const ibg = dark ? c.bg.dark : c.bg.light
  const label = TIPO_OPTS.find(o => o.value === tipo)?.label || tipo
  return <span style={{ backgroundColor: ibg, color: ic, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{label}</span>
}

export default function ObjetivosPage() {
  const { dark } = useTheme()
  const [data, setData]     = useState([])
  const [plagas, setPlagas] = useState([])
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('')
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({ nombre: '', tipo: 'control', plaga: '' })
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    const [r, p] = await Promise.all([api.get('/campanas/objetivos/'), api.get('/campanas/plagas/')])
    setData(r.data); setPlagas(p.data)
  }, [])
  useEffect(() => { fetch() }, [fetch])

  const openNew  = () => { setForm({ nombre: '', tipo: 'control', plaga: '' }); setModal('new') }
  const openEdit = item => { setForm({ ...item, plaga: item.plaga || '' }); setModal('edit') }
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...form, plaga: form.plaga || null }
      if (modal === 'edit') { await api.patch(`/campanas/objetivos/${form.id}/`, payload); toast.success('Objetivo actualizado.') }
      else { await api.post('/campanas/objetivos/', payload); toast.success('Objetivo registrado.') }
      setModal(null); fetch()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const del = async item => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return
    try { await api.delete(`/campanas/objetivos/${item.id}/`); toast.success('Eliminado.'); fetch() }
    catch { toast.error('No se pudo eliminar. Puede estar en uso.') }
  }

  const filtered = data.filter(v => {
    const q = search.toLowerCase()
    const mQ = !q || `${v.nombre} ${v.plaga_nombre || ''}`.toLowerCase().includes(q)
    const mF = !filtro || v.tipo === filtro
    return mQ && mF
  })

  const ist = { backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`, color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none' }
  const lst = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Catálogos', to: '/catalogos' }, { label: 'Objetivos' }]} />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: dark ? 'rgba(239,68,68,0.15)' : '#fef2f2' }}>
            <Target size={18} style={{ color: dark ? '#f87171' : '#dc2626' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Objetivos de aplicación</h1>
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>{data.length} objetivos registrados</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar objetivo..."
            style={{ ...ist, paddingLeft: '36px', width: '260px', height: '40px', paddingTop: 0, paddingBottom: 0 }} />
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}
          style={{ ...ist, width: 'auto', height: '40px', paddingTop: 0, paddingBottom: 0 }}>
          <option value="">Todos los tipos</option>
          {TIPO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="ml-auto">
          <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={15} /> Nuevo objetivo</button>
        </div>
      </div>

      <div style={{ backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}` }}>
              {['Objetivo', 'Tipo', 'Plaga asociada', 'Acciones'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-extrabold uppercase tracking-wide"
                  style={{ color: dark ? D.sub : '#6b7280' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.04)' : '#f9fafb'}` }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.03)' : '#fafafa'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: dark ? D.text : '#111827' }}>{item.nombre}</td>
                <td className="px-4 py-3"><Badge tipo={item.tipo} dark={dark} /></td>
                <td className="px-4 py-3 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{item.plaga_nombre || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={13} /></button>
                    <button onClick={() => del(item)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-sm text-center" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl z-10"
            style={{ backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }}>
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                {modal === 'edit' ? 'Editar objetivo' : 'Nuevo objetivo'}
              </h2>
              <button onClick={() => setModal(null)} style={{ color: D.sub }}><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="px-6 pb-6 space-y-4">
              <div><label style={lst}>Nombre del objetivo *</label>
                <input name="nombre" value={form.nombre} onChange={h} style={ist} required placeholder="Control de mosca blanca" />
              </div>
              <div><label style={lst}>Tipo</label>
                <select name="tipo" value={form.tipo} onChange={h} style={ist}>
                  {TIPO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div><label style={lst}>Plaga / enfermedad asociada</label>
                <select name="plaga" value={form.plaga} onChange={h} style={ist}>
                  <option value="">Sin asociar</option>
                  {plagas.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.tipo_display})</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 btn-secondary">Cancelar</button>
                <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
