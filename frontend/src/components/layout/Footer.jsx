import { useState } from 'react'
import { Link } from 'react-router-dom'

/* ── Botón footer: borde que brilla + flecha que avanza ── */
function FooterCTA({ to, children }) {
  const [hov, setHov] = useState(false)
  return (
    <Link
      to={to}
      className="self-start md:self-end inline-flex items-center gap-2 font-black text-sm px-6 py-3.5 rounded-full select-none"
      style={{
        color: '#fff',
        border: '1.5px solid rgba(82,183,136,0.55)',
        background: hov ? 'rgba(82,183,136,0.15)' : 'transparent',
        boxShadow: hov
          ? '0 0 0 4px rgba(82,183,136,0.12), 0 0 28px rgba(82,183,136,0.18)'
          : '0 0 0 0px rgba(82,183,136,0)',
        transition: 'background 0.3s, box-shadow 0.35s',
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {children}
      <svg
        width="15" height="15" viewBox="0 0 15 15" fill="none"
        style={{ transform: hov ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.25s ease' }}
      >
        <path d="M2 7.5H13M13 7.5L8.5 3M13 7.5L8.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </Link>
  )
}

/* ── Logomark blanco ── */
function KiaraLogomarkWhite() {
  return (
    <svg width="44" height="44" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.10)"/>
      <path d="M18 28 C18 28 8 22 9 14 C12 12 16 15 18 28Z" fill="white" opacity="0.85"/>
      <path d="M18 24 C18 24 28 18 27 10 C24 8 20 11 18 24Z" fill="white"/>
      <path d="M18 28 L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
    </svg>
  )
}

/* ── Divisor decorativo ── */
function Divider() {
  return (
    <div className="flex items-center gap-4 my-10">
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      <div className="flex gap-1.5">
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#52B788', opacity: 0.5 }} />
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#52B788', opacity: 0.3 }} />
        <span className="w-1 h-1 rounded-full" style={{ backgroundColor: '#52B788', opacity: 0.5 }} />
      </div>
      <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
    </div>
  )
}

const COL_PLATAFORMA = [
  { to: '/marketplace',   label: 'Marketplace de cosechas' },
  { to: '/como-funciona', label: 'Cómo funciona' },
  { to: '/register',      label: 'Crear cuenta gratis' },
  { to: '/login',         label: 'Iniciar sesión' },
]

const COL_PROYECTO = [
  { to: '/quienes-somos', label: 'Quiénes somos' },
  { to: '/como-funciona', label: 'Responsabilidad Social' },
  { to: '/contacto',      label: 'Contáctanos' },
]

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1B4332' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">

        {/* ── HERO DEL FOOTER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          {/* Marca */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <KiaraLogomarkWhite />
              <div>
                <p
                  className="font-black tracking-[0.10em] leading-none"
                  style={{
                    fontSize: '2rem',
                    background: 'linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.70) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  KIARA
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.50)' }}>
              Plataforma digital para biohuertos urbanos comunitarios de la
              Universidad Católica Santo Toribio de Mogrovejo, Chiclayo.
            </p>
          </div>

          {/* CTA footer */}
          <FooterCTA to="/register">Unirme a la red</FooterCTA>
        </div>

        {/* ── GRID DE COLUMNAS ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — Ubicación */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Ubicación
            </h4>
            <p className="text-sm leading-loose" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Chiclayo, Lambayeque<br />
              Perú
            </p>
          </div>

          {/* Col 2 — Plataforma */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Plataforma
            </h4>
            <ul className="space-y-3">
              {COL_PLATAFORMA.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#52B788' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Proyecto */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Proyecto
            </h4>
            <ul className="space-y-3">
              {COL_PROYECTO.map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-sm font-semibold transition-colors duration-200"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#52B788' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contacto */}
          <div>
            <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-5" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Contacto
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Correo
                </p>
                <a
                  href="mailto:kreyes@usat.edu.pe"
                  className="text-sm font-bold transition-colors duration-200"
                  style={{ color: '#52B788' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#52B788' }}
                >
                  kreyes@usat.edu.pe
                </a>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Escuela
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Ingeniería de Sistemas<br />y Computación
                </p>
              </div>
            </div>
          </div>
        </div>

        <Divider />

        {/* ── PIE ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-semibold text-center sm:text-left" style={{ color: 'rgba(255,255,255,0.28)' }}>
            © 2026 KIARA · Todos los derechos reservados
          </p>
          <p className="text-xs font-semibold text-center sm:text-right" style={{ color: 'rgba(255,255,255,0.28)' }}>
            Escuela de Ingeniería · USAT
          </p>
        </div>
      </div>
    </footer>
  )
}
