import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Pencil, Trash2, X, Search, SlidersHorizontal } from 'lucide-react'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

export default function CondicionesPage() {
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [data, setData]     = useState([])
  const [search, setSearch] = useState('')
  const [modal, setModal]   = useState(null)
  const [form, setForm]     = useState({ nombre: '', descripcion: '' })
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => { const r = await api.get('/campanas/condiciones/'); setData(r.data) }, [])
  useEffect(() => { fetch() }, [fetch])

  const openNew  = () => { setForm({ nombre: '', descripcion: '' }); setModal('new') }
  const openEdit = item => { setForm({ ...item, descripcion: item.descripcion || '' }); setModal('edit') }
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal === 'edit') { await api.patch(`/campanas/condiciones/${form.id}/`, form); toast.success('Condición actualizada.') }
      else { await api.post('/campanas/condiciones/', form); toast.success('Condición registrada.') }
      setModal(null); fetch()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const del = async item => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return
    try { await api.delete(`/campanas/condiciones/${item.id}/`); toast.success('Eliminada.'); fetch() }
    catch { toast.error('No se pudo eliminar. Puede estar en uso.') }
  }

  const filtered = data.filter(v => {
    const q = search.toLowerCase()
    return !q || `${v.nombre} ${v.descripcion || ''}`.toLowerCase().includes(q)
  })

  const ist = { backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`, color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none' }
  const lst = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }
  const accent = dark ? '#a78bfa' : '#7c3aed'
  const accentBg = dark ? 'rgba(139,92,246,0.12)' : '#f5f3ff'

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/catalogos')} className="p-2 rounded-xl transition-all"
          style={{ color: dark ? D.sub : '#6b7280', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}>
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: accentBg }}>
            <SlidersHorizontal size={18} style={{ color: accent }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Condiciones de aplicación</h1>
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>{data.length} condiciones registradas</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar condición..."
            style={{ ...ist, paddingLeft: '36px', width: '280px', height: '40px', paddingTop: 0, paddingBottom: 0 }} />
        </div>
        <div className="ml-auto">
          <button onClick={openNew} className="btn-primary flex items-center gap-2"><Plus size={15} /> Nueva condición</button>
        </div>
      </div>

      <div style={{ backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px', overflow: 'hidden' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}` }}>
              {['Condición', 'Descripción / cuándo aplicar', 'Acciones'].map(h => (
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
                <td className="px-4 py-3 text-sm font-semibold" style={{ color: dark ? D.text : '#111827', minWidth: 220 }}>
                  <span style={{ backgroundColor: accentBg, color: accent, fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '6px' }}>
                    {item.nombre}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{item.descripcion || '—'}</td>
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
              <tr><td colSpan={3} className="px-4 py-8 text-sm text-center" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin resultados</td></tr>
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
                {modal === 'edit' ? 'Editar condición' : 'Nueva condición'}
              </h2>
              <button onClick={() => setModal(null)} style={{ color: D.sub }}><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="px-6 pb-6 space-y-4">
              <div><label style={lst}>Nombre de la condición *</label>
                <input name="nombre" value={form.nombre} onChange={h} style={ist} required placeholder="En floración (50%)" />
              </div>
              <div><label style={lst}>Descripción / cuándo aplicar</label>
                <textarea name="descripcion" value={form.descripcion} onChange={h} rows={3}
                  style={{ ...ist, resize: 'none' }} placeholder="Cuando el 50% de las flores estén abiertas..." />
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
