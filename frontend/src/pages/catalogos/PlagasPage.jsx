import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, X, Search, Bug } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

const TIPO_OPTS = [
  { value: 'insecto',  label: 'Insecto' },
  { value: 'acaro',    label: 'Ácaro' },
  { value: 'hongo',    label: 'Hongo' },
  { value: 'bacteria', label: 'Bacteria' },
  { value: 'virus',    label: 'Virus' },
  { value: 'nematodo', label: 'Nematodo' },
  { value: 'maleza',   label: 'Maleza' },
  { value: 'otro',     label: 'Otro' },
]

const TIPO_COLORS = {
  insecto:  { dark: '#f87171', light: '#dc2626', bg: { dark: 'rgba(239,68,68,0.12)',   light: '#fef2f2' } },
  acaro:    { dark: '#fb923c', light: '#ea580c', bg: { dark: 'rgba(249,115,22,0.12)',  light: '#fff7ed' } },
  hongo:    { dark: '#c084fc', light: '#9333ea', bg: { dark: 'rgba(168,85,247,0.12)',  light: '#faf5ff' } },
  bacteria: { dark: '#f59e0b', light: '#d97706', bg: { dark: 'rgba(245,158,11,0.12)', light: '#fffbeb' } },
  virus:    { dark: '#f43f5e', light: '#e11d48', bg: { dark: 'rgba(244,63,94,0.12)',   light: '#fff1f2' } },
  nematodo: { dark: '#a78bfa', light: '#7c3aed', bg: { dark: 'rgba(139,92,246,0.12)', light: '#f5f3ff' } },
  maleza:   { dark: '#86efac', light: '#16a34a', bg: { dark: 'rgba(134,239,172,0.10)','light': '#f0fdf4' } },
  otro:     { dark: '#94a3b8', light: '#475569', bg: { dark: 'rgba(148,163,184,0.10)', light: '#f8fafc' } },
}

function Badge({ tipo, dark }) {
  const c = TIPO_COLORS[tipo] || TIPO_COLORS.otro
  const ic = dark ? c.dark : c.light
  const ibg = dark ? c.bg.dark : c.bg.light
  const label = TIPO_OPTS.find(o => o.value === tipo)?.label || tipo
  return <span style={{ backgroundColor: ibg, color: ic, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px' }}>{label}</span>
}

export default function PlagasPage() {
  const { dark } = useTheme()
  const [data, setData]     = useState([])
  const [search, setSearch] = useState('')
  const [filtro, setFiltro] = useState('')
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({ nombre: '', nombre_cientifico: '', tipo: 'insecto', descripcion: '' })
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => { const r = await api.get('/campanas/plagas/'); setData(r.data) }, [])
  useEffect(() => { fetch() }, [fetch])

  const openNew  = () => { setForm({ nombre: '', nombre_cientifico: '', tipo: 'insecto', descripcion: '' }); setModal('new') }
  const openEdit = item => { setForm({ ...item, descripcion: item.descripcion || '' }); setModal('edit') }
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal === 'edit') { await api.patch(`/campanas/plagas/${form.id}/`, form); toast.success('Plaga actualizada.') }
      else { await api.post('/campanas/plagas/', form); toast.success('Plaga registrada.') }
      setModal(null); fetch()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const del = async item => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return
    try { await api.delete(`/campanas/plagas/${item.id}/`); toast.success('Eliminada.'); fetch() }
    catch { toast.error('No se pudo eliminar. Puede estar en uso.') }
  }

  const filtered = data.filter(v => {
    const q = search.toLowerCase()
    const mQ = !q || `${v.nombre} ${v.nombre_cientifico || ''}`.toLowerCase().includes(q)
    const mF = !filtro || v.tipo === filtro
    return mQ && mF
  })

  const ist = { backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`, color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none' }
  const lst = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Catálogos', to: '/catalogos' }, { label: 'Plagas' }]} />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: dark ? 'rgba(239,68,68,0.15)' : '#fef2f2' }}>
            <Bug size={18} style={{ color: dark ? '#f87171' : '#dc2626' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Plagas y enfermedades</h1>
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>{data.length} registros</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar plaga o enfermedad..."
            style={{ ...ist, paddingLeft: '36px', width: '260px', height: '40px', paddingTop: 0, paddingBottom: 0 }} />
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}
          style={{ ...ist, width: 'auto', height: '40px', paddingTop: 0, paddingBottom: 0 }}>
          <option value="">Todos los tipos</option>
          {TIPO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="ml-auto">
          <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={15} /> Nueva plaga</button>
        </div>
      </div>

      <div style={{ backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}` }}>
              {['Nombre', 'Nombre científico', 'Tipo', 'Descripción', 'Acciones'].map(h => (
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
                <td className="px-4 py-3 text-sm italic" style={{ color: dark ? D.sub : '#6b7280' }}>{item.nombre_cientifico || '—'}</td>
                <td className="px-4 py-3"><Badge tipo={item.tipo} dark={dark} /></td>
                <td className="px-4 py-3 text-sm" style={{ color: dark ? D.sub : '#6b7280', maxWidth: 220 }}>{item.descripcion || '—'}</td>
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
              <tr><td colSpan={5} className="px-4 py-8 text-sm text-center" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin resultados</td></tr>
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
                {modal === 'edit' ? 'Editar plaga' : 'Nueva plaga / enfermedad'}
              </h2>
              <button onClick={() => setModal(null)} style={{ color: D.sub }}><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="px-6 pb-6 space-y-4">
              <div><label style={lst}>Nombre *</label>
                <input name="nombre" value={form.nombre} onChange={h} style={ist} required placeholder="Mosca blanca" />
              </div>
              <div><label style={lst}>Nombre científico</label>
                <input name="nombre_cientifico" value={form.nombre_cientifico} onChange={h} style={ist} placeholder="Bemisia tabaci" />
              </div>
              <div><label style={lst}>Tipo</label>
                <select name="tipo" value={form.tipo} onChange={h} style={ist}>
                  {TIPO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div><label style={lst}>Descripción</label>
                <textarea name="descripcion" value={form.descripcion} onChange={h} rows={3}
                  style={{ ...ist, resize: 'none' }} placeholder="Síntomas y cultivos afectados..." />
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
