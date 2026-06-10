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

export default function Login() {
  const { login, loginWithTokens, token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]         = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true })
  }, [token])

  const handleGoogleSuccess = async (tokenResponse) => {
    const res = await api.post('/auth/google/', { token: tokenResponse.access_token })
    loginWithTokens(res.data.access, res.data.refresh, res.data.user)
    toast.success('¡Bienvenido!')
    navigate('/dashboard')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('¡Bienvenido!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Credenciales incorrectas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Panel izquierdo — branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[46%] shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#1B4332 0%,#2D6A4F 60%,#40916C 100%)' }}>

        {/* Patrón de puntos */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{ backgroundImage: 'radial-gradient(circle,#fff 1px,transparent 1px)', backgroundSize: '28px 28px' }} />

        {/* Blobs */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: '#74C69D' }} />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-15 blur-3xl"
          style={{ background: '#52B788' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center" style={{ gap: '-4px' }}>
          <img src="/sinfondo.png" alt="Kiara logo" style={{ height: 100, width: 'auto', objectFit: 'contain' }} />
          <span className="font-black tracking-[0.12em] text-2xl text-white" style={{ marginLeft: '-12px' }}>KIARA</span>
        </div>

        {/* Centro */}
        <div className="relative z-10">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-4"
            style={{ color: 'rgba(255,255,255,0.55)' }}>
            Biohuertos Urbanos · USAT
          </p>
          <h2 className="font-black text-white leading-tight mb-5"
            style={{ fontSize: 'clamp(2rem,3.2vw,2.8rem)' }}>
            Cultiva, conecta<br />y transforma.
          </h2>
          <p className="text-base max-w-xs leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.60)' }}>
            La plataforma digital para productores de biohuertos urbanos de Lambayeque.
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-10">
            {[['50+','Productores'],['200+','Cosechas'],['8','Comunidades']].map(([n,l]) => (
              <div key={l} className="text-center">
                <p className="font-black text-2xl text-white leading-none">{n}</p>
                <p className="text-[11px] font-semibold mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer branding */}
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
          <img src="/sinfondo.png" alt="Kiara logo" style={{ height: 80, width: 'auto', objectFit: 'contain' }} />
          <span className="font-black tracking-[0.10em] text-xl" style={{ marginLeft: '-12px', background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            KIARA
          </span>
        </div>

        <div className="w-full max-w-sm">
          <h1 className="font-black text-3xl mb-1" style={{ color: '#1B4332' }}>
            Bienvenido
          </h1>
          <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>
            Ingresa a tu cuenta para continuar
          </p>

          {/* Google button */}
          <div className="mb-5">
            <GoogleBtn label="Continuar con Google" onSuccess={handleGoogleSuccess} />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
            <span className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>o con usuario</span>
            <div className="flex-1 h-px" style={{ background: '#E5E7EB' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Usuario */}
            <div>
              <label className="block text-[12px] font-black uppercase tracking-wider mb-2"
                style={{ color: '#374151' }}>
                Usuario
              </label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                placeholder="Tu nombre de usuario"
                required
                className="w-full px-4 py-3 text-sm rounded-xl outline-none transition-all"
                style={{
                  border: '1.5px solid #E5E7EB',
                  background: '#fff',
                  color: '#111827',
                }}
                onFocus={e => { e.target.style.borderColor = '#2D6A4F'; e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.08)' }}
                onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-[12px] font-black uppercase tracking-wider mb-2"
                style={{ color: '#374151' }}>
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Tu contraseña"
                  required
                  className="w-full px-4 py-3 pr-12 text-sm rounded-xl outline-none transition-all"
                  style={{ border: '1.5px solid #E5E7EB', background: '#fff', color: '#111827' }}
                  onFocus={e => { e.target.style.borderColor = '#2D6A4F'; e.target.style.boxShadow = '0 0 0 3px rgba(45,106,79,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                  style={{ color: '#9CA3AF' }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 font-black text-sm py-3.5 rounded-xl text-white transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: loading ? '#6B7280' : 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 20px rgba(45,106,79,0.28)' }}>
              {loading ? 'Ingresando...' : <>Ingresar <ArrowRight size={15} /></>}
            </button>
          </form>

          {/* Links */}
          <div className="mt-7 space-y-3 text-center">
            <p className="text-sm" style={{ color: '#6B7280' }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-black transition-colors hover:underline" style={{ color: '#2D6A4F' }}>
                Regístrate gratis
              </Link>
            </p>
            <Link to="/marketplace" className="block text-sm font-semibold transition-colors hover:underline"
              style={{ color: '#9CA3AF' }}>
              Ver cosechas disponibles →
            </Link>
          </div>

          {/* Demo */}
          <div className="mt-8 px-4 py-3.5 rounded-2xl" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <p className="text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: '#15803D' }}>
              Cuenta demo
            </p>
            <div className="flex gap-4 text-xs" style={{ color: '#166534' }}>
              <span>Usuario: <code className="font-black bg-white px-1.5 py-0.5 rounded-lg">productor_demo</code></span>
              <span>Pass: <code className="font-black bg-white px-1.5 py-0.5 rounded-lg">Demo1234</code></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
