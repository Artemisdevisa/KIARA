import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { UserPlus, Search, Pencil, Trash2, X, Eye, EyeOff, UserCog } from 'lucide-react'

const ROLES = [
  { value: '',           label: 'Todos'     },
  { value: 'productor',  label: 'Productor' },
  { value: 'consumidor', label: 'Consumidor'},
  { value: 'admin',      label: 'Admin'     },
]

const ROL_BADGE = {
  productor:  { bg: '#dcfce7', color: '#15803d' },
  consumidor: { bg: '#dbeafe', color: '#1d4ed8' },
  admin:      { bg: '#fee2e2', color: '#b91c1c' },
}
const ROL_BADGE_DARK = {
  productor:  { bg: 'rgba(22,163,74,0.18)',  color: '#4ade80' },
  consumidor: { bg: 'rgba(59,130,246,0.18)', color: '#60a5fa' },
  admin:      { bg: 'rgba(239,68,68,0.18)',  color: '#f87171' },
}

const EMPTY_FORM = {
  username: '', email: '', first_name: '', last_name: '',
  telefono: '', rol: 'productor', password: '', password2: '', is_active: true,
}

/* ── Paleta dark coherente con el tema azul marino ── */
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
  placeholder: 'rgba(255,255,255,0.30)',
}

/* ── Modal crear/editar ── */
function UsuarioModal({ dark, onClose, onSaved, editUser }) {
  const [form, setForm]       = useState(editUser ? { ...editUser, password: '', password2: '' } : EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handle = e => setForm(f => ({
    ...f,
    [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }))

  const submit = async e => {
    e.preventDefault()
    if (!editUser && form.password !== form.password2) { toast.error('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      const payload = { ...form }
      delete payload.password2
      if (editUser && !payload.password) delete payload.password
      if (editUser) {
        await api.patch(`/auth/usuarios/${editUser.id}/`, payload)
        toast.success('Usuario actualizado.')
      } else {
        await api.post('/auth/usuarios/', payload)
        toast.success('Usuario registrado.')
      }
      onSaved()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') Object.values(msg).flat().forEach(m => toast.error(m))
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
    width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none',
  }
  const labelStyle = { display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: dark ? D.sub : '#6b7280' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            {editUser ? 'Editar usuario' : 'Registrar usuario'}
          </h2>
          <button onClick={onClose} style={{ color: D.sub, padding: '4px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label style={labelStyle}>Nombre</label><input name="first_name" value={form.first_name} onChange={handle} style={inputStyle} placeholder="María" required /></div>
            <div><label style={labelStyle}>Apellido</label><input name="last_name" value={form.last_name} onChange={handle} style={inputStyle} placeholder="Flores" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={labelStyle}>Usuario</label><input name="username" value={form.username} onChange={handle} style={inputStyle} placeholder="mflores" required /></div>
            <div><label style={labelStyle}>Correo</label><input name="email" type="email" value={form.email} onChange={handle} style={inputStyle} placeholder="correo@usat.pe" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={labelStyle}>Teléfono</label><input name="telefono" value={form.telefono} onChange={handle} style={inputStyle} placeholder="9XXXXXXXX" /></div>
            <div>
              <label style={labelStyle}>Rol</label>
              <select name="rol" value={form.rol} onChange={handle} style={inputStyle}>
                <option value="productor">Productor</option>
                <option value="consumidor">Consumidor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>{editUser ? 'Nueva contraseña (opcional)' : 'Contraseña'}</label>
            <div className="relative">
              <input name="password" type={showPwd ? 'text' : 'password'} value={form.password} onChange={handle} style={{ ...inputStyle, paddingRight: '36px' }} placeholder="Mínimo 6 caracteres" required={!editUser} />
              <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: D.sub }}>
                {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>
          {!editUser && (
            <div><label style={labelStyle}>Confirmar contraseña</label><input name="password2" type={showPwd ? 'text' : 'password'} value={form.password2} onChange={handle} style={inputStyle} placeholder="Repite la contraseña" required /></div>
          )}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" name="is_active" checked={form.is_active} onChange={handle} className="w-4 h-4 accent-primary-600" />
            <span className="text-sm font-medium" style={{ color: dark ? D.sub : '#6b7280' }}>Usuario activo</span>
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
              {loading ? 'Guardando...' : editUser ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal confirmar eliminar ── */
function ConfirmModal({ dark, user, onClose, onConfirm, loading }) {
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
          <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>¿Eliminar usuario?</h3>
          <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>
            Se eliminará a <strong>{user?.first_name} {user?.last_name}</strong> permanentemente.
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
export default function UsuariosPage() {
  const { dark } = useTheme()
  const [usuarios, setUsuarios]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [rolFilter, setRolFilter]   = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editUser, setEditUser]     = useState(null)
  const [deleteUser, setDeleteUser] = useState(null)
  const [delLoading, setDelLoading] = useState(false)

  const fetchUsuarios = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (rolFilter) params.rol = rolFilter
      if (search)    params.search = search
      const res = await api.get('/auth/usuarios/', { params })
      setUsuarios(res.data)
    } catch { toast.error('No se pudo cargar la lista de usuarios.') }
    finally { setLoading(false) }
  }, [rolFilter, search])

  useEffect(() => { fetchUsuarios() }, [fetchUsuarios])

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await api.delete(`/auth/usuarios/${deleteUser.id}/`)
      toast.success('Usuario eliminado.')
      setDeleteUser(null)
      fetchUsuarios()
    } catch { toast.error('No se pudo eliminar.') }
    finally { setDelLoading(false) }
  }

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  const badge = dark ? ROL_BADGE_DARK : ROL_BADGE

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <UserCog size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Usuarios</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} encontrado{usuarios.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button onClick={() => { setEditUser(null); setModalOpen(true) }} className="flex items-center gap-2 btn-primary text-sm">
          <UserPlus size={15} />
          Registrar usuario
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center" style={{ ...cardStyle, padding: '14px 16px' }}>
        {/* Búsqueda — ancho fijo reducido */}
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar usuario..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px',
              fontSize: '13px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151',
              height: '36px',
            }}
          />
        </div>

        {/* Filtros rol */}
        <div className="flex gap-1.5 flex-wrap">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => setRolFilter(r.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: rolFilter === r.value ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${rolFilter === r.value ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: rolFilter === r.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}
            >
              {r.label}
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
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <UserCog size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Usuario','Correo','Teléfono','Rol','Registro','Estado',''].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide ${i === 1 ? 'hidden md:table-cell' : i === 2 ? 'hidden sm:table-cell' : i === 4 ? 'hidden lg:table-cell' : i === 6 ? 'text-right' : ''}`}
                      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr
                    key={u.id}
                    style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Avatar + nombre */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0">
                          {u.first_name?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>{u.first_name} {u.last_name}</p>
                          <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{u.email || '—'}</td>
                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{u.telefono || '—'}</td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{ backgroundColor: badge[u.rol]?.bg, color: badge[u.rol]?.color }}>
                        {u.rol}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
                      {new Date(u.date_joined).toLocaleDateString('es-PE')}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={u.is_active
                          ? { backgroundColor: dark ? 'rgba(22,163,74,0.18)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }
                          : { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: dark ? D.sub : '#9ca3af' }
                        }>
                        {u.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditUser(u); setModalOpen(true) }}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Pencil size={16} /></button>
                        <button
                          onClick={() => setDeleteUser(u)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && <UsuarioModal dark={dark} editUser={editUser} onClose={() => { setModalOpen(false); setEditUser(null) }} onSaved={() => { setModalOpen(false); setEditUser(null); fetchUsuarios() }} />}
      {deleteUser && <ConfirmModal dark={dark} user={deleteUser} loading={delLoading} onClose={() => setDeleteUser(null)} onConfirm={handleDelete} />}
    </div>
  )
}
