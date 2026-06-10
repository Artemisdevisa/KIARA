import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.859-3.048.859-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.705A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.705V4.963H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.037l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.963L3.964 7.295C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function GoogleBtnActive({ label, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const trigger = useGoogleLogin({
    onSuccess: async (res) => {
      setLoading(true)
      try { await onSuccess(res) }
      catch { toast.error('No se pudo autenticar con Google.') }
      finally { setLoading(false) }
    },
    onError: () => toast.error('Google cancelado.'),
  })
  return (
    <button type="button" onClick={() => trigger()} disabled={loading}
      className="w-full flex items-center justify-center gap-3 font-bold text-sm py-3 rounded-xl transition-all hover:shadow-md disabled:opacity-60"
      style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151' }}>
      {loading ? 'Conectando...' : <><GoogleIcon /> {label}</>}
    </button>
  )
}

function GoogleBtn({ label, onSuccess }) {
  if (!GOOGLE_CLIENT_ID) {
    return (
      <button type="button"
        onClick={() => toast('Configura VITE_GOOGLE_CLIENT_ID en frontend/.env', { icon: '⚙️' })}
        className="w-full flex items-center justify-center gap-3 font-bold text-sm py-3 rounded-xl transition-all hover:shadow-md"
        style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151' }}>
        <GoogleIcon /> {label}
      </button>
    )
  }
  return <GoogleBtnActive label={label} onSuccess={onSuccess} />
}

const genUsername = (email) =>
  email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30) || 'usuario'

const INPUT_STYLE = {
  border: '1.5px solid #E5E7EB',
  background: '#fff',
  color: '#111827',
}
const INPUT_FOCUS = (e) => {
  e.target.style.borderColor = '#2D6A4F'
  e.target.style.boxShadow   = '0 0 0 3px rgba(45,106,79,0.08)'
}
const INPUT_BLUR = (e) => {
  e.target.style.borderColor = '#E5E7EB'
  e.target.style.boxShadow   = 'none'
}

export default function Register() {
  const { loginWithTokens, token } = useAuth()
  const navigate = useNavigate()

  const [form, setForm]         = useState({ first_name: '', last_name: '', email: '', password: '', password2: '' })
  const [showPass, setShowPass] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token])

  const field = (key) => ({
    value: form[key],
    onChange: e => setForm({ ...form, [key]: e.target.value }),
  })

  const handleSubmit = async e => {
    e.preventDefault()
    if (form.password !== form.password2) {
      toast.error('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const username = genUsername(form.email)
      await api.post('/auth/register/', {
        username,
        email:      form.email,
        first_name: form.first_name,
        last_name:  form.last_name,
        password:   form.password,
        password2:  form.password2,
        rol:        'cliente',
      })
      toast.success('¡Cuenta creada! Ahora inicia sesión.')
      navigate('/login')
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        Object.values(errors).flat().forEach(msg => toast.error(String(msg)))
      } else {
        toast.error('Error al crear cuenta.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (tokenResponse) => {
    const res = await api.post('/auth/google/', { token: tokenResponse.access_token })
    loginWithTokens(res.data.access, res.data.refresh, res.data.user)
    toast.success('¡Bienvenido!')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#1B4332 0%,#2D6A4F 60%,#40916C 100%)' }}>

        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: '#74C69D' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: '#52B788' }} />

        <div className="relative z-10 flex items-center">
          <img src="/sinfondo.png" alt="Kiara logo" style={{ height: 64, width: 'auto', objectFit: 'contain' }} />
          <span className="font-black tracking-[0.12em] text-2xl text-white" style={{ marginLeft: '-12px' }}>KIARA</span>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            Biohuertos Urbanos · USAT
          </p>
          <h2 className="font-black text-white leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem,3.2vw,2.8rem)' }}>
            Únete a la red<br />de productores.
          </h2>
          <p className="text-base max-w-xs leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.60)' }}>
            Registra tu biohuerto, gestiona tus cosechas y conecta con tu comunidad local.
          </p>
          <div className="flex gap-6 mt-10">
            {[['50+','Productores'],['200+','Cosechas'],['8','Comunidades']].map(([n,l]) => (
              <div key={l} className="text-center">
                <p className="font-black text-2xl text-white leading-none">{n}</p>
                <p className="text-[11px] font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs font-semibold"
          style={{ color: 'rgba(255,255,255,0.28)' }}>
          © 2026 KIARA · Universidad Católica Santo Toribio de Mogrovejo
        </p>
      </div>

      {/* ── Panel derecho — formulario ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12"
        style={{ background: '#FAFAFA' }}>

        {/* Logo móvil */}
        <div className="lg:hidden flex items-center mb-10">
          <img src="/sinfondo.png" alt="Kiara logo" style={{ height: 56, width: 'auto', objectFit: 'contain' }} />
          <span className="font-black tracking-[0.10em] text-xl" style={{ marginLeft: '-12px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            KIARA
          </span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="font-black text-3xl mb-1" style={{ color: '#1B4332' }}>Crear cuenta</h1>
          <p className="text-sm mb-7" style={{ color: '#9CA3AF' }}>
            Únete como productor de biohuertos
          </p>

          {/* Google button */}
          <div className="mb-5">
            <GoogleBtn label="Registrarse con Google" onSuccess={handleGoogleSuccess} />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            <span className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>o con tu correo</span>
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-black uppercase tracking-wider mb-2"
                  style={{ color: '#374151' }}>Nombre</label>
                <input
                  type="text" placeholder="Juan" required
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                  style={INPUT_STYLE} onFocus={INPUT_FOCUS} onBlur={INPUT_BLUR}
                  {...field('first_name')} />
              </div>
              <div>
                <label className="block text-[12px] font-black uppercase tracking-wider mb-2"
                  style={{ color: '#374151' }}>Apellido</label>
                <input
                  type="text" placeholder="Pérez" required
                  className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                  style={INPUT_STYLE} onFocus={INPUT_FOCUS} onBlur={INPUT_BLUR}
                  {...field('last_name')} />
              </div>
            </div>

            {/* Correo */}
            <div>
              <label className="block text-[12px] font-black uppercase tracking-wider mb-2"
                style={{ color: '#374151' }}>Correo electrónico</label>
              <input
                type="email" placeholder="correo@ejemplo.com" required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                style={INPUT_STYLE} onFocus={INPUT_FOCUS} onBlur={INPUT_BLUR}
                {...field('email')} />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[12px] font-black uppercase tracking-wider mb-2"
                style={{ color: '#374151' }}>Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" required
                  className="w-full px-4 py-3 pr-12 text-sm rounded-xl outline-none transition-all"
                  style={INPUT_STYLE} onFocus={INPUT_FOCUS} onBlur={INPUT_BLUR}
                  {...field('password')} />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#9CA3AF' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-[12px] font-black uppercase tracking-wider mb-2"
                style={{ color: '#374151' }}>Confirmar contraseña</label>
              <div className="relative">
                <input
                  type={showPass2 ? 'text' : 'password'} placeholder="Repite tu contraseña" required
                  className="w-full px-4 py-3 pr-12 text-sm rounded-xl outline-none transition-all"
                  style={INPUT_STYLE} onFocus={INPUT_FOCUS} onBlur={INPUT_BLUR}
                  {...field('password2')} />
                <button type="button" onClick={() => setShowPass2(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#9CA3AF' }}>
                  {showPass2 ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-black text-sm py-3.5 rounded-xl text-white transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#6B7280' : 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 20px rgba(45,106,79,0.28)' }}>
              {loading ? 'Creando cuenta...' : <>Crear cuenta <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-7 text-center text-sm" style={{ color: '#6B7280' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-black transition-colors hover:underline" style={{ color: '#2D6A4F' }}>
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
