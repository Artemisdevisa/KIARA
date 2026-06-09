import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Search, Users, ChevronDown, ChevronUp, Plus, Trash2, Shield, Wrench, Check, Loader2, X } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const ROL_OPTS = [
  { value: 'admin',    label: 'Admin',    bg: '#eff6ff', color: '#1d4ed8', darkBg: 'rgba(96,165,250,0.18)',  darkColor: '#60a5fa' },
  { value: 'operario', label: 'Operario', bg: '#dcfce7', color: '#15803d', darkBg: 'rgba(74,222,128,0.18)',  darkColor: '#4ade80' },
]

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

function RolChip({ rol, active, dark, onClick }) {
  const r     = ROL_OPTS.find(o => o.value === rol)
  if (!r) return null
  const bg    = active ? (dark ? r.darkBg : r.bg) : (dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6')
  const color = active ? (dark ? r.darkColor : r.color) : (dark ? 'rgba(255,255,255,0.35)' : '#9ca3af')
  const border = active
    ? `1.5px solid ${dark ? r.darkColor + '55' : r.color + '55'}`
    : `1.5px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`
  return (
    <button type={onClick ? 'button' : undefined} onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all duration-150 select-none"
      style={{ background: bg, color, border }}>
      {active && onClick && <Check size={10} />}
      {r.label}
    </button>
  )
}

function UserSearchInput({ dark, value, onChange, usuarios, loadingU }) {
  const [open, setOpen] = useState(false)
  const [q, setQ]       = useState('')
  const ref             = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = usuarios.filter(u =>
    `${u.nombre} ${u.username} ${u.email}`.toLowerCase().includes(q.toLowerCase())
  )
  const selected = usuarios.find(u => u.id === value)

  return (
    <div ref={ref} className="relative flex-1">
      <button type="button" onClick={() => { setOpen(o => !o); setQ('') }}
        className="w-full flex items-center justify-between gap-2 text-sm"
        style={{
          backgroundColor: dark ? D.inputBg : '#f9fafb',
          border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
          color: selected ? (dark ? D.text : '#111827') : (dark ? D.sub : '#9ca3af'),
          borderRadius: '10px', padding: '7px 12px', outline: 'none',
        }}>
        <span className="truncate">
          {selected ? `${selected.nombre} (@${selected.username})` : 'Seleccionar usuario...'}
        </span>
        {selected
          ? <X size={13} onClick={e => { e.stopPropagation(); onChange(null) }} style={{ color: dark ? D.sub : '#9ca3af', flexShrink: 0 }} />
          : <ChevronDown size={13} style={{ color: dark ? D.sub : '#9ca3af', flexShrink: 0 }} />
        }
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: dark ? '#1e2a3a' : '#fff', border: `1.5px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}` }}>
          <div style={{ padding: '8px', borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar..."
                style={{
                  width: '100%', paddingLeft: '28px', paddingRight: '8px', paddingTop: '6px', paddingBottom: '6px',
                  fontSize: '13px', borderRadius: '8px', outline: 'none',
                  backgroundColor: dark ? D.inputBg : '#f9fafb',
                  border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
                  color: dark ? D.text : '#374151',
                }} />
            </div>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {loadingU && <p style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: dark ? D.sub : '#9ca3af' }}>Cargando...</p>}
            {!loadingU && filtered.map(u => (
              <button type="button" key={u.id} onClick={() => { onChange(u.id); setOpen(false) }}
                className="w-full text-left transition-colors"
                style={{ padding: '10px 12px', backgroundColor: value === u.id ? (dark ? 'rgba(96,165,250,0.10)' : '#eff6ff') : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = value === u.id ? (dark ? 'rgba(96,165,250,0.10)' : '#eff6ff') : 'transparent'}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: dark ? D.text : '#111827' }}>{u.nombre}</p>
                <p style={{ fontSize: '12px', color: dark ? D.sub : '#9ca3af' }}>@{u.username} · {u.email}</p>
              </button>
            ))}
            {!loadingU && filtered.length === 0 && (
              <p style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: dark ? D.sub : '#9ca3af' }}>Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function BiohuertCard({ b, dark }) {
  const [open, setOpen]         = useState(false)
  const [miembros, setMiembros] = useState([])
  const [loading, setLoading]   = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [usuarios, setUsuarios] = useState([])
  const [loadingU, setLoadingU] = useState(false)
  const [form, setForm]         = useState({ usuario: null, rol: 'operario' })
  const [saving, setSaving]     = useState(false)

  const fetchMiembros = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get(`/biohuertos/${b.id}/miembros/`); setMiembros(r.data) }
    finally { setLoading(false) }
  }, [b.id])

  const fetchUsuarios = useCallback(async () => {
    setLoadingU(true)
    try { const r = await api.get('/biohuertos/admin/usuarios/'); setUsuarios(r.data) }
    finally { setLoadingU(false) }
  }, [])

  useEffect(() => { if (open) fetchMiembros() }, [open, fetchMiembros])
  useEffect(() => { if (showForm) fetchUsuarios() }, [showForm, fetchUsuarios])

  const addMiembro = async e => {
    e.preventDefault(); setSaving(true)
    try {
      await api.post(`/biohuertos/${b.id}/miembros/`, form)
      toast.success('Miembro agregado.')
      setShowForm(false); setForm({ usuario: null, rol: 'operario' }); fetchMiembros()
    } catch (err) {
      const d = err?.response?.data
      if (d?.usuario || d?.non_field_errors) toast.error('Este usuario ya es miembro.')
      else toast.error('Error al agregar.')
    } finally { setSaving(false) }
  }

  const removeMiembro = async id => {
    if (!confirm('¿Quitar a este miembro?')) return
    await api.delete(`/biohuertos/miembros/${id}/`)
    toast.success('Miembro eliminado.'); fetchMiembros()
  }

  const cambiarRol = async (id, rol) => {
    await api.patch(`/biohuertos/miembros/${id}/`, { rol })
    fetchMiembros()
  }

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1px solid ${dark ? D.divider : '#f3f4f6'}`,
    borderRadius: '14px',
  }

  return (
    <div style={cardStyle}>
      {/* Fila principal del biohuerto */}
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left transition-all"
        style={{ borderRadius: open ? '14px 14px 0 0' : '14px' }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-sm font-extrabold text-white shrink-0">
          {b.nombre[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ color: dark ? D.text : '#111827' }}>
            {b.nombre}
          </p>
          <p className="text-xs truncate" style={{ color: dark ? D.sub : '#9ca3af' }}>
            @{b.productor_username} · {b.miembros_count} miembro{b.miembros_count !== 1 ? 's' : ''}
          </p>
        </div>
        {open
          ? <ChevronUp size={15} style={{ color: dark ? D.sub : '#9ca3af', flexShrink: 0 }} />
          : <ChevronDown size={15} style={{ color: dark ? D.sub : '#9ca3af', flexShrink: 0 }} />
        }
      </button>

      {/* Panel expandido */}
      {open && (
        <div style={{ borderTop: `1px solid ${dark ? D.divider : '#f3f4f6'}`, padding: '12px 16px 16px' }}>
          {loading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Lista de miembros */}
              {miembros.length === 0 && !showForm && (
                <p style={{ fontSize: '13px', color: dark ? D.sub : '#9ca3af', textAlign: 'center', padding: '12px 0' }}>
                  Sin miembros asignados aún.
                </p>
              )}
              {miembros.map(m => (
                <div key={m.id} className="flex items-center gap-3"
                  style={{ padding: '8px 0', borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}>
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0">
                    {(m.usuario_nombre?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: dark ? D.text : '#111827' }}>{m.usuario_nombre}</p>
                    <p className="text-xs truncate" style={{ color: dark ? D.sub : '#9ca3af' }}>@{m.usuario_username}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {ROL_OPTS.map(r => (
                      <RolChip key={r.value} rol={r.value} active={m.rol === r.value} dark={dark}
                        onClick={() => m.rol !== r.value && cambiarRol(m.id, r.value)} />
                    ))}
                    <button onClick={() => removeMiembro(m.id)}
                      className="p-1.5 rounded-lg transition-all"
                      style={{ color: dark ? '#f87171' : '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Formulario agregar */}
              {showForm ? (
                <form onSubmit={addMiembro} className="space-y-3 pt-2">
                  <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: dark ? D.sub : '#9ca3af' }}>
                    Nuevo miembro
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <UserSearchInput dark={dark} value={form.usuario}
                      onChange={v => setForm(f => ({ ...f, usuario: v }))}
                      usuarios={usuarios} loadingU={loadingU} />
                    <div className="flex items-center gap-1.5">
                      {ROL_OPTS.map(r => (
                        <RolChip key={r.value} rol={r.value} active={form.rol === r.value} dark={dark}
                          onClick={() => setForm(f => ({ ...f, rol: r.value }))} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" disabled={!form.usuario || saving}
                      className="btn-primary text-xs flex items-center gap-1.5">
                      {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                      Agregar
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setForm({ usuario: null, rol: 'operario' }) }}
                      className="btn-secondary text-xs">Cancelar</button>
                  </div>
                </form>
              ) : (
                <button type="button" onClick={() => setShowForm(true)}
                  className="flex items-center gap-1.5 text-xs font-bold transition-all"
                  style={{ color: dark ? D.sub : '#9ca3af', padding: '4px 0' }}
                  onMouseEnter={e => e.currentTarget.style.color = dark ? D.text : '#374151'}
                  onMouseLeave={e => e.currentTarget.style.color = dark ? D.sub : '#9ca3af'}>
                  <Plus size={13} /> Agregar miembro
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BiohuertMiembrosPage() {
  const { dark } = useTheme()
  const [biohuertos, setBiohuertos] = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')

  const fetchBiohuertos = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/biohuertos/admin/todos/'); setBiohuertos(r.data) }
    catch { toast.error('No se pudo cargar la lista.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBiohuertos() }, [fetchBiohuertos])

  const filtered = biohuertos.filter(b => {
    if (!search) return true
    const q = search.toLowerCase()
    return b.nombre.toLowerCase().includes(q) || b.productor_username?.toLowerCase().includes(q)
  })

  const totalMiembros = biohuertos.reduce((s, b) => s + b.miembros_count, 0)

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Administrativo', to: '/administrativo' }, { label: 'Miembros de Biohuertos' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <Users size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Miembros de Biohuertos</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              Asigna operarios y administradores a cada biohuerto
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {ROL_OPTS.map(r => (
            <span key={r.value}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: dark ? r.darkBg : r.bg, color: dark ? r.darkColor : r.color }}>
              {r.label}
            </span>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div style={{ ...cardStyle, padding: '12px 16px' }}>
        <div className="relative max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar biohuerto o productor..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px', height: '36px',
              fontSize: '13px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151',
            }} />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Biohuertos', value: biohuertos.length, color: dark ? '#60a5fa' : '#2563eb' },
          { label: 'Con miembros', value: biohuertos.filter(b => b.miembros_count > 0).length, color: dark ? '#4ade80' : '#15803d' },
          { label: 'Total asignados', value: totalMiembros, color: dark ? '#fbbf24' : '#d97706' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-4 rounded-2xl" style={cardStyle}>
            <span className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
            <span className="text-sm font-semibold" style={{ color: dark ? D.sub : '#6b7280' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Users size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
          <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron biohuertos</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => <BiohuertCard key={b.id} b={b} dark={dark} />)}
        </div>
      )}
    </div>
  )
}
