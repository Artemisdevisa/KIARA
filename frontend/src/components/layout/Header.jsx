import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

/* ── Botón primario: shimmer diagonal en hover ── */
function BtnPrimary({ to, children }) {
  const [hov, setHov] = useState(false)
  return (
    <Link
      to={to}
      className="relative overflow-hidden font-black text-sm px-5 py-2.5 rounded-full text-white flex items-center select-none"
      style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow:'0 2px 12px rgba(45,106,79,0.22)' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Shimmer */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(108deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%)',
          transform: hov ? 'translateX(200%)' : 'translateX(-200%)',
          transition: hov ? 'transform 0.55s ease' : 'none',
        }}
      />
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

/* ── Botón secundario: fondo que crece desde la izquierda ── */
function BtnSecondary({ to, children }) {
  const [hov, setHov] = useState(false)
  return (
    <Link
      to={to}
      className="relative overflow-hidden font-bold text-sm px-5 py-2.5 rounded-full select-none"
      style={{ color: hov ? '#1B4332' : '#2D6A4F', border: '1.5px solid #2D6A4F', transition:'color 0.25s' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span
        className="absolute inset-0 pointer-events-none rounded-full"
        style={{
          background: '#D8F3DC',
          transformOrigin: 'left center',
          transform: hov ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
        }}
      />
      <span className="relative z-10">{children}</span>
    </Link>
  )
}

const NAV = [
  { to: '/',              label: 'Inicio',        end: true },
  { to: '/marketplace',   label: 'Marketplace',   end: false },
  { to: '/quienes-somos', label: 'Quiénes Somos', end: false },
  { to: '/como-funciona', label: 'Cómo Funciona', end: false },
  { to: '/contacto',      label: 'Contacto',      end: false },
]

/* ── Logomark SVG único para KIARA ── */
function KiaraLogomark({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Fondo circular con gradiente */}
      <circle cx="18" cy="18" r="18" fill="url(#kiara-grad)"/>
      {/* Hoja izquierda */}
      <path d="M18 28 C18 28 8 22 9 14 C12 12 16 15 18 28Z" fill="white" opacity="0.9"/>
      {/* Hoja derecha */}
      <path d="M18 24 C18 24 28 18 27 10 C24 8 20 11 18 24Z" fill="white"/>
      {/* Tallo */}
      <path d="M18 28 L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
      <defs>
        <linearGradient id="kiara-grad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2D6A4F"/>
          <stop offset="100%" stopColor="#1B4332"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

/* ── Logomark blanco para footer ── */
function KiaraLogomarkWhite({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.12)"/>
      <path d="M18 28 C18 28 8 22 9 14 C12 12 16 15 18 28Z" fill="white" opacity="0.85"/>
      <path d="M18 24 C18 24 28 18 27 10 C24 8 20 11 18 24Z" fill="white"/>
      <path d="M18 28 L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  )
}

/* ── Nombre de marca KIARA ── */
function KiaraWordmark({ dark = true }) {
  return (
    <div className="leading-none">
      <div className="flex items-baseline gap-0">
        <span
          className="font-black tracking-[0.08em] text-[1.35rem]"
          style={{
            background: dark
              ? 'linear-gradient(135deg, #1B4332 30%, #2D6A4F 100%)'
              : 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.75) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          KIARA
        </span>
      </div>
    </div>
  )
}

/* ── Iconos inline (sin librería) ── */
function IconMenu() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 5.5H19M3 11H14M3 16.5H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function Header() {
  const { token }   = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  /* Shadow al scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* Bloquear body cuando drawer abierto */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      {/* ════ HEADER ════ */}
      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? '0 4px 32px rgba(27,67,50,0.09)' : 'none',
          borderBottom: scrolled ? 'none' : '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group" onClick={close}>
              <div className="transition-transform duration-300 group-hover:rotate-6">
                <KiaraLogomark size={36} />
              </div>
              <KiaraWordmark dark />
            </Link>

            {/* Nav desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `text-sm font-bold px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                      isActive
                        ? 'text-bio-dark'
                        : 'text-bio-muted hover:text-bio-dark'
                    }`
                  }
                  style={({ isActive }) => isActive ? { backgroundColor: '#D8F3DC' } : {}}
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Botones desktop */}
            <div className="hidden lg:flex items-center gap-3">
              {token ? (
                <BtnPrimary to="/dashboard">Mi Dashboard</BtnPrimary>
              ) : (
                <>
                  <BtnSecondary to="/login">Ingresar</BtnSecondary>
                  <BtnPrimary to="/register">Registrarme</BtnPrimary>
                </>
              )}
            </div>

            {/* Hamburguesa móvil */}
            <button
              className="lg:hidden p-2.5 rounded-xl transition-colors hover:bg-bio-pale"
              style={{ color: '#1B4332' }}
              onClick={() => setOpen(v => !v)}
            >
              {open ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* ════ OVERLAY ════ */}
      <div
        onClick={close}
        className="fixed inset-0 z-40 lg:hidden transition-all duration-300"
        style={{
          background: 'rgba(27,67,50,0.45)',
          backdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />

      {/* ════ DRAWER ════ */}
      <div
        className="fixed top-0 right-0 h-full w-72 z-50 lg:hidden flex flex-col"
        style={{
          background: '#fff',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link to="/" onClick={close} className="flex items-center gap-2.5">
            <KiaraLogomark size={32} />
            <KiaraWordmark dark />
          </Link>
          <button
            onClick={close}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            style={{ color: '#6B7280' }}
          >
            <IconClose />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 py-4 px-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive ? 'text-bio-dark' : 'text-bio-muted hover:text-bio-dark hover:bg-gray-50'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: '#D8F3DC' } : {}}
            >
              <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: '#52B788' }} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Botones drawer — versión bloque ancho */}
        <div className="px-5 py-5 space-y-3 border-t border-gray-100">
          {token ? (
            <div onClick={close} className="flex justify-center">
              <BtnPrimary to="/dashboard">Mi Dashboard</BtnPrimary>
            </div>
          ) : (
            <>
              <div onClick={close} className="flex justify-center">
                <BtnSecondary to="/login">Ingresar</BtnSecondary>
              </div>
              <div onClick={close} className="flex justify-center">
                <BtnPrimary to="/register">Registrarme gratis</BtnPrimary>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

