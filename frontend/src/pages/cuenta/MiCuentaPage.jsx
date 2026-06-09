import { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { User, Phone, Mail, Lock, Save, Eye, EyeOff } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

export default function MiCuentaPage() {
  const { dark } = useTheme()
  const { user, refreshUser } = useAuth()

  const [perfil, setPerfil] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    telefono:   user?.telefono   || '',
  })
  const [pass, setPass]       = useState({ password: '', password2: '' })
  const [showPass, setShowPass] = useState(false)
  const [loadingP, setLoadingP] = useState(false)
  const [loadingC, setLoadingC] = useState(false)

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')) || user?.username?.slice(0, 2) || 'U'

  const ist = {
    width: '100%', padding: '10px 13px', fontSize: '13px', borderRadius: '10px',
    outline: 'none', backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#374151',
  }
  const lst = { display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }
  const card = {
    backgroundColor: dark ? '#1e2a3a' : '#fff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '20px', padding: '24px',
  }
  const sectionTitle = { fontSize: '14px', fontWeight: 800, color: dark ? D.text : '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }

  const savePerfil = async e => {
    e.preventDefault()
    setLoadingP(true)
    try {
      await api.patch('/auth/me/', perfil)
      await refreshUser()
      toast.success('Perfil actualizado.')
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al guardar.')
    } finally { setLoadingP(false) }
  }

  const savePassword = async e => {
    e.preventDefault()
    if (pass.password !== pass.password2) { toast.error('Las contraseñas no coinciden.'); return }
    if (pass.password.length < 6) { toast.error('Mínimo 6 caracteres.'); return }
    setLoadingC(true)
    try {
      await api.patch('/auth/me/', { password: pass.password })
      setPass({ password: '', password2: '' })
      toast.success('Contraseña actualizada.')
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al cambiar contraseña.')
    } finally { setLoadingC(false) }
  }

  const hp = key => ({ value: perfil[key], onChange: e => setPerfil({ ...perfil, [key]: e.target.value }) })
  const hc = key => ({ value: pass[key],   onChange: e => setPass({ ...pass, [key]: e.target.value }) })

  return (
    <div className="max-w-xl mx-auto space-y-5">
      <Breadcrumb items={[{ label: 'Mi cuenta' }]} />

      {/* Avatar + nombre */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shrink-0"
          style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
          {initials.toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
          </p>
          <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
            {user?.email} · <span className="font-semibold capitalize">{user?.rol}</span>
          </p>
        </div>
      </div>

      {/* Datos personales */}
      <div style={card}>
        <p style={sectionTitle}><User size={15} /> Datos personales</p>
        <form onSubmit={savePerfil} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={lst}>Nombre</label>
              <input style={ist} placeholder="María" {...hp('first_name')} />
            </div>
            <div>
              <label style={lst}>Apellido</label>
              <input style={ist} placeholder="García" {...hp('last_name')} />
            </div>
          </div>

          <div>
            <label style={lst}>
              <span className="flex items-center gap-1.5"><Phone size={11} /> Teléfono / WhatsApp</span>
            </label>
            <input style={ist} placeholder="979123456" {...hp('telefono')} />
            <p className="text-[11px] mt-1" style={{ color: dark ? D.sub : '#9ca3af' }}>
              Se usa para pre-rellenar el contacto al publicar cosechas.
            </p>
          </div>

          <div>
            <label style={lst}>
              <span className="flex items-center gap-1.5"><Mail size={11} /> Correo electrónico</span>
            </label>
            <input type="email" style={ist} placeholder="correo@ejemplo.com" {...hp('email')} />
          </div>

          <div className="pt-1">
            <button type="submit" disabled={loadingP}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d', border: `1px solid ${dark ? 'rgba(22,163,74,0.3)' : '#86efac'}` }}>
              <Save size={14} />
              {loadingP ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div style={card}>
        <p style={sectionTitle}><Lock size={15} /> Cambiar contraseña</p>
        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label style={lst}>Nueva contraseña</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} style={{ ...ist, paddingRight: '40px' }}
                placeholder="Mínimo 6 caracteres" {...hc('password')} />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: dark ? D.sub : '#9ca3af' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label style={lst}>Confirmar contraseña</label>
            <input type={showPass ? 'text' : 'password'} style={ist}
              placeholder="Repite la contraseña" {...hc('password2')} />
          </div>

          <div className="pt-1">
            <button type="submit" disabled={loadingC || !pass.password}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                backgroundColor: pass.password ? (dark ? 'rgba(239,68,68,0.12)' : '#fef2f2') : (dark ? 'rgba(255,255,255,0.04)' : '#f9fafb'),
                color: pass.password ? (dark ? '#f87171' : '#dc2626') : (dark ? 'rgba(255,255,255,0.2)' : '#d1d5db'),
                border: `1px solid ${pass.password ? (dark ? 'rgba(239,68,68,0.25)' : '#fecaca') : (dark ? 'rgba(255,255,255,0.07)' : '#e5e7eb')}`,
                cursor: pass.password ? 'pointer' : 'not-allowed',
              }}>
              <Lock size={14} />
              {loadingC ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>

      {/* Info de cuenta */}
      <div style={{ ...card, padding: '16px 24px' }}>
        <div className="flex items-center justify-between text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
          <span>Usuario: <strong style={{ color: dark ? D.text : '#374151' }}>@{user?.username}</strong></span>
          <span>Miembro desde {user?.date_joined ? new Date(user.date_joined).toLocaleDateString('es-PE', { year: 'numeric', month: 'long' }) : '—'}</span>
        </div>
      </div>
    </div>
  )
}
