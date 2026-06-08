import { useState, useEffect, useCallback } from 'react'
import { Search, ShieldCheck, Check, Loader2 } from 'lucide-react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'

const ALL_ROLES = [
  { value: 'cliente',   label: 'Cliente',   bg: '#dbeafe', color: '#1d4ed8', darkBg: 'rgba(59,130,246,0.18)', darkColor: '#60a5fa' },
  { value: 'productor', label: 'Productor', bg: '#dcfce7', color: '#15803d', darkBg: 'rgba(22,163,74,0.18)',  darkColor: '#4ade80' },
  { value: 'admin',     label: 'Admin',     bg: '#fee2e2', color: '#b91c1c', darkBg: 'rgba(239,68,68,0.18)', darkColor: '#f87171' },
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

function RoleChip({ role, active, dark, saving, onToggle }) {
  const bg    = active ? (dark ? role.darkBg : role.bg) : (dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6')
  const color = active ? (dark ? role.darkColor : role.color) : (dark ? 'rgba(255,255,255,0.35)' : '#9ca3af')
  const border = active
    ? `1.5px solid ${dark ? role.darkColor + '55' : role.color + '55'}`
    : `1.5px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`

  return (
    <button
      onClick={onToggle}
      disabled={saving}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all duration-150 select-none"
      style={{ background: bg, color, border, opacity: saving ? 0.6 : 1 }}
    >
      {saving ? <Loader2 size={10} className="animate-spin" /> : active ? <Check size={10} /> : null}
      {role.label}
    </button>
  )
}

function UserRow({ u, dark, onRolesChanged }) {
  const [roles, setRoles]   = useState(u.roles?.length ? u.roles : [u.rol || 'cliente'])
  const [saving, setSaving] = useState(null)

  const toggle = async (roleValue) => {
    const next = roles.includes(roleValue)
      ? roles.filter(r => r !== roleValue)
      : [...roles, roleValue]

    if (next.length === 0) {
      toast.error('El usuario debe tener al menos un rol.')
      return
    }

    const primary = next.includes('admin') ? 'admin'
      : next.includes('productor') ? 'productor' : 'cliente'

    setSaving(roleValue)
    try {
      await api.patch(`/auth/usuarios/${u.id}/`, { roles: next, rol: primary })
      setRoles(next)
      onRolesChanged(u.id, next, primary)
      toast.success(`Roles de ${u.first_name || u.username} actualizados.`)
    } catch {
      toast.error('No se pudo actualizar.')
    } finally {
      setSaving(null)
    }
  }

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1px solid ${dark ? D.divider : '#f3f4f6'}`,
    borderRadius: '14px',
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4" style={cardStyle}>
      {/* Avatar + info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-sm font-extrabold text-white shrink-0">
          {(u.first_name?.[0] || u.username?.[0] || '?').toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm leading-tight truncate" style={{ color: dark ? D.text : '#111827' }}>
            {u.first_name} {u.last_name}
            {!u.first_name && !u.last_name && <span style={{ color: dark ? D.sub : '#9ca3af' }}>Sin nombre</span>}
          </p>
          <p className="text-xs truncate" style={{ color: dark ? D.sub : '#9ca3af' }}>
            @{u.username} {u.email ? `· ${u.email}` : ''}
          </p>
        </div>
      </div>

      {/* Role chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {ALL_ROLES.map(role => (
          <RoleChip
            key={role.value}
            role={role}
            active={roles.includes(role.value)}
            dark={dark}
            saving={saving === role.value}
            onToggle={() => toggle(role.value)}
          />
        ))}
      </div>
    </div>
  )
}

export default function AsignarRolesPage() {
  const { dark } = useTheme()
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/auth/usuarios/')
      setUsuarios(res.data)
    } catch { toast.error('No se pudo cargar la lista.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleRolesChanged = (id, newRoles, newRol) => {
    setUsuarios(prev => prev.map(u =>
      u.id === id ? { ...u, roles: newRoles, rol: newRol } : u
    ))
  }

  const filtered = usuarios.filter(u => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.username?.toLowerCase().includes(q) ||
      u.first_name?.toLowerCase().includes(q) ||
      u.last_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    )
  })

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <ShieldCheck size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Asignar Roles</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              Haz clic en los chips para activar o desactivar roles
            </p>
          </div>
        </div>

        {/* Leyenda */}
        <div className="flex items-center gap-3 flex-wrap">
          {ALL_ROLES.map(r => (
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
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px', height: '36px',
              fontSize: '13px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151',
            }}
          />
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3">
        {ALL_ROLES.map(r => {
          const count = usuarios.filter(u => (u.roles || [u.rol]).includes(r.value)).length
          return (
            <div key={r.value} className="flex items-center gap-3 p-4 rounded-2xl"
              style={cardStyle}>
              <span className="text-2xl font-extrabold" style={{ color: dark ? r.darkColor : r.color }}>{count}</span>
              <span className="text-sm font-semibold" style={{ color: dark ? D.sub : '#6b7280' }}>{r.label}s</span>
            </div>
          )
        })}
      </div>

      {/* Lista usuarios */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <ShieldCheck size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
          <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron usuarios</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <UserRow key={u.id} u={u} dark={dark} onRolesChanged={handleRolesChanged} />
          ))}
        </div>
      )}
    </div>
  )
}
