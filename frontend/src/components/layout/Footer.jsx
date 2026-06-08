import { useState } from 'react'
import { Link } from 'react-router-dom'

function FooterLink({ to, children }) {
  return (
    <Link to={to}
      className="text-sm font-semibold transition-colors duration-200"
      style={{ color: 'rgba(255,255,255,0.52)' }}
      onMouseEnter={e => { e.currentTarget.style.color = '#74C69D' }}
      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.52)' }}>
      {children}
    </Link>
  )
}

const COL_PLATAFORMA = [
  { to: '/marketplace',   label: 'Marketplace de cosechas' },
  { to: '/como-funciona', label: 'Cómo funciona'           },
  { to: '/register',      label: 'Crear cuenta gratis'     },
  { to: '/login',         label: 'Iniciar sesión'          },
]

const COL_PROYECTO = [
  { to: '/quienes-somos', label: 'Quiénes somos'          },
  { to: '/como-funciona', label: 'Responsabilidad Social'  },
  { to: '/contacto',      label: 'Contáctanos'            },
]

export default function Footer() {
  const [hovCTA, setHovCTA] = useState(false)

  return (
    <footer style={{ backgroundColor: '#1B4332' }}>
      <div className="px-4 sm:px-6 xl:px-10 pt-16 pb-8">

        {/* ── TOP: marca + CTA ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14">
          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-4">
              <svg width="44" height="44" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.10)" />
                <path d="M18 28 C18 28 8 22 9 14 C12 12 16 15 18 28Z" fill="white" opacity="0.85" />
                <path d="M18 24 C18 24 28 18 27 10 C24 8 20 11 18 24Z" fill="white" />
                <path d="M18 28 L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.45" />
              </svg>
              <p className="font-black tracking-[0.10em] leading-none"
                style={{ fontSize: '2rem', background: 'linear-gradient(135deg,#fff 40%,rgba(255,255,255,0.65) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                KIARA
              </p>
            </div>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.48)' }}>
              Plataforma digital para biohuertos urbanos comunitarios de la
              Universidad Católica Santo Toribio de Mogrovejo, Chiclayo — Perú.
            </p>
          </div>

          {/* CTA */}
          <Link to="/register"
            className="self-start md:self-end inline-flex items-center gap-2 font-black text-sm px-7 py-3.5 rounded-full select-none"
            style={{
              color: '#fff',
              border: '1.5px solid rgba(116,198,157,0.55)',
              background: hovCTA ? 'rgba(116,198,157,0.15)' : 'transparent',
              boxShadow: hovCTA ? '0 0 0 4px rgba(116,198,157,0.10), 0 0 28px rgba(116,198,157,0.14)' : 'none',
              transition: 'background 0.3s, box-shadow 0.35s',
            }}
            onMouseEnter={() => setHovCTA(true)}
            onMouseLeave={() => setHovCTA(false)}>
            Unirme a la red
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"
              style={{ transform: hovCTA ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 0.25s ease' }}>
              <path d="M2 7.5H13M13 7.5L8.5 3M13 7.5L8.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </Link>
        </div>

        {/* ── GRID 4 COLUMNAS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-14">

          {/* Col 1 — Ubicación + stats rápidos */}
          <div className="col-span-2 lg:col-span-1">
            <h4 className="font-black text-[10px] uppercase tracking-[0.22em] mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Dónde estamos
            </h4>
            <p className="text-sm leading-loose mb-5" style={{ color: 'rgba(255,255,255,0.52)' }}>
              Chiclayo, Lambayeque<br />Perú 🇵🇪
            </p>
            {/* Mini stats */}
            <div className="flex gap-6">
              {[['50+','Productores'],['200+','Cosechas'],['8','Comunidades']].map(([n,l]) => (
                <div key={l}>
                  <p className="font-black text-lg leading-none text-white">{n}</p>
                  <p className="text-[10px] font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Col 2 — Plataforma */}
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.22em] mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Plataforma
            </h4>
            <ul className="space-y-3">
              {COL_PLATAFORMA.map(({ to, label }) => (
                <li key={to}><FooterLink to={to}>{label}</FooterLink></li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Proyecto */}
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.22em] mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Proyecto
            </h4>
            <ul className="space-y-3">
              {COL_PROYECTO.map(({ to, label }) => (
                <li key={to}><FooterLink to={to}>{label}</FooterLink></li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contacto */}
          <div>
            <h4 className="font-black text-[10px] uppercase tracking-[0.22em] mb-5" style={{ color: 'rgba(255,255,255,0.28)' }}>
              Contacto
            </h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Correo</p>
                <a href="mailto:kreyes@usat.edu.pe"
                  className="text-sm font-bold transition-colors duration-200"
                  style={{ color: '#74C69D' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#74C69D' }}>
                  kreyes@usat.edu.pe
                </a>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Escuela</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
                  Ingeniería de Sistemas<br />y Computación
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.22)' }}>Universidad</p>
                <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.52)' }}>USAT · Chiclayo</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="flex items-center gap-4 mb-7">
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          <div className="flex gap-1.5">
            {[0.5, 0.3, 0.5].map((op, i) => (
              <span key={i} className="w-1 h-1 rounded-full" style={{ backgroundColor: '#52B788', opacity: op }} />
            ))}
          </div>
          <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* ── PIE ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.26)' }}>
            © 2026 KIARA · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-3">
            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.26)' }}>
              Escuela de Ingeniería · USAT
            </p>
          </div>
        </div>

      </div>
    </footer>
  )
}
