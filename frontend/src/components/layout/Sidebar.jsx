import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Leaf, Sprout, Activity, Bell,
  Stethoscope, ShoppingBasket, LineChart, Store, LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/biohuertos',   icon: Leaf,            label: 'Mis Biohuertos' },
  { to: '/cultivos',     icon: Sprout,          label: 'Cultivos' },
  { to: '/monitoreo',    icon: Activity,        label: 'Monitoreo' },
  { to: '/alertas',      icon: Bell,            label: 'Alertas' },
  { to: '/diagnostico',  icon: Stethoscope,     label: 'Diagnóstico' },
  { to: '/cosechas',     icon: ShoppingBasket,  label: 'Cosechas' },
  { to: '/trazabilidad', icon: LineChart,        label: 'Trazabilidad' },
  { to: '/marketplace',  icon: Store,           label: 'Marketplace' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Botón hamburguesa mobile */}
      <button
        className="fixed top-4 left-4 z-50 lg:hidden bg-primary-700 text-white p-2 rounded-lg shadow"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-primary-800 text-white flex flex-col
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="px-5 py-6 border-b border-primary-700">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 rounded-lg p-2">
              <Leaf size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">BioHuerto</h1>
              <p className="text-primary-300 text-xs">USAT</p>
            </div>
          </div>
        </div>

        {/* Perfil */}
        <div className="px-5 py-4 border-b border-primary-700">
          <p className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</p>
          <p className="text-primary-300 text-xs truncate">{user?.username}</p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-200 hover:bg-primary-700/60 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-primary-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full text-sm text-primary-300 hover:text-white py-2 px-3 rounded-lg hover:bg-primary-700/60 transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
