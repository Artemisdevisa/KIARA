import { NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import {
  LayoutDashboard, Leaf, Wheat, Thermometer, BellRing,
  Microscope, PackageCheck, BarChart3, ShoppingCart, LogOut, Menu, X, ShieldCheck, BookOpen
} from 'lucide-react'
import { useState } from 'react'

const modules = [
  { to: '/administrativo', icon: ShieldCheck,  label: 'Administrativo', desc: 'Usuarios y biohuertos' },
  { to: '/cultivos',       icon: Wheat,         label: 'Ventas',         desc: 'Siembras activas'     },
  { to: '/monitoreo',      icon: Thermometer,   label: 'Monitoreo',      desc: 'Clima y ambiente'     },
  { to: '/alertas',        icon: BellRing,      label: 'Alertas',        desc: 'Recordatorios'        },
  { to: '/diagnostico',    icon: Microscope,    label: 'Diagnóstico',    desc: 'Fitosanitario'        },
  { to: '/cosechas',       icon: PackageCheck,  label: 'Cosechas',       desc: 'Mis productos'        },
  { to: '/trazabilidad',   icon: BarChart3,     label: 'Trazabilidad',   desc: 'Costos y prácticas'   },
  { to: '/marketplace',    icon: ShoppingCart,  label: 'Marketplace',    desc: 'Mercado local'        },
  { to: '/recomendaciones',icon: BookOpen,      label: 'Guía de cultivos',desc: 'Manejo sostenible'   },
]

/* Paleta sidebar: siempre verde oscuro en light, azul marino en dark */
const S = {
  light: {
    bg:          '#14532d',
    border:      'rgba(255,255,255,0.12)',
    label:       'rgba(255,255,255,0.45)',
    cardIdle:    'rgba(255,255,255,0.05)',
    cardHover:   'rgba(255,255,255,0.10)',
    cardBorder:  'rgba(255,255,255,0.08)',
    descText:    'rgba(255,255,255,0.45)',
    nameText:    'rgba(255,255,255,0.85)',
    dashIdle:    'rgba(255,255,255,0.65)',
    dashHover:   'rgba(255,255,255,0.10)',
    logoutText:  'rgba(255,255,255,0.50)',
    logoutHover: 'rgba(220,38,38,0.25)',
  },
  dark: {
    bg:          '#131929',
    border:      'rgba(255,255,255,0.09)',
    label:       'rgba(255,255,255,0.35)',
    cardIdle:    'rgba(255,255,255,0.04)',
    cardHover:   'rgba(255,255,255,0.08)',
    cardBorder:  'rgba(255,255,255,0.07)',
    descText:    'rgba(255,255,255,0.38)',
    nameText:    'rgba(255,255,255,0.80)',
    dashIdle:    'rgba(255,255,255,0.60)',
    dashHover:   'rgba(255,255,255,0.09)',
    logoutText:  'rgba(255,255,255,0.45)',
    logoutHover: 'rgba(220,38,38,0.22)',
  },
}

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [hoverDash, setHoverDash] = useState(false)
  const [hoverLogout, setHoverLogout] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }
  const p = dark ? S.dark : S.light

  const sidebarContent = (
    <aside
      className="w-72 flex flex-col h-full transition-colors duration-300 text-white"
      style={{ backgroundColor: p.bg }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: `1px solid ${p.border}` }}>
        <Link to="/" className="flex items-center gap-3 group">
          <div className="transition-transform duration-300 group-hover:rotate-6 shrink-0">
            <svg width="38" height="38" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.13)"/>
              <path d="M18 28 C18 28 8 22 9 14 C12 12 16 15 18 28Z" fill="white" opacity="0.85"/>
              <path d="M18 24 C18 24 28 18 27 10 C24 8 20 11 18 24Z" fill="white"/>
              <path d="M18 28 L18 30" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            </svg>
          </div>
          <span
            className="font-black tracking-[0.12em] text-[1.35rem] leading-none"
            style={{
              background: 'linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.72) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            KIARA
          </span>
        </Link>
      </div>

      {/* Dashboard */}
      <div className="px-4 pt-4 pb-1">
        <NavLink
          to="/dashboard"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={({ isActive }) => ({
            backgroundColor: isActive ? '#16a34a' : hoverDash ? p.dashHover : 'transparent',
            color: isActive ? '#fff' : p.dashIdle,
          })}
          onMouseEnter={() => setHoverDash(true)}
          onMouseLeave={() => setHoverDash(false)}
        >
          <LayoutDashboard size={17} />
          Dashboard
        </NavLink>
      </div>

      {/* Módulos */}
      <div className="flex-1 overflow-hidden px-4 py-3">
        <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: p.label }}>
          Módulos
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {modules.map(({ to, icon: Icon, label, desc }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}>
              {({ isActive }) => (
                <div
                  className="flex flex-col gap-3 p-[18px] rounded-xl transition-all duration-200 cursor-pointer min-h-[104px]"
                  style={{
                    backgroundColor: isActive ? 'rgba(22,163,74,0.20)' : p.cardIdle,
                    border: `1px solid ${isActive ? 'rgba(22,163,74,0.50)' : p.cardBorder}`,
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = p.cardHover }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = p.cardIdle }}
                >
                  <Icon
                    size={19}
                    style={{ color: isActive ? '#4ade80' : p.nameText }}
                  />
                  <div>
                    <p className="text-[13px] font-bold leading-tight" style={{ color: isActive ? '#fff' : p.nameText }}>
                      {label}
                    </p>
                    <p className="text-[11px] leading-tight mt-0.5 line-clamp-1" style={{ color: p.descText }}>
                      {desc}
                    </p>
                  </div>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="p-4" style={{ borderTop: `1px solid ${p.border}` }}>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full text-sm py-2.5 px-4 rounded-xl transition-all duration-200"
          style={{
            color: hoverLogout ? '#fff' : p.logoutText,
            backgroundColor: hoverLogout ? p.logoutHover : 'transparent',
          }}
          onMouseEnter={() => setHoverLogout(true)}
          onMouseLeave={() => setHoverLogout(false)}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary-800 text-white p-2 rounded-xl shadow-lg"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />
      )}

      <div className="hidden lg:flex h-screen shrink-0">{sidebarContent}</div>

      <div className={`fixed inset-y-0 left-0 z-40 lg:hidden transform transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>
    </>
  )
}
