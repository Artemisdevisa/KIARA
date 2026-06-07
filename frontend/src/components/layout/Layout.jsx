import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { Sun, Moon } from 'lucide-react'

const ROUTE_TITLES = {
  '/dashboard':      'Dashboard',
  '/biohuertos':     'Mis Biohuertos',
  '/cultivos':       'Cultivos',
  '/monitoreo':      'Monitoreo',
  '/alertas':        'Alertas',
  '/diagnostico':    'Diagnóstico Fitosanitario',
  '/cosechas':       'Cosechas Publicadas',
  '/trazabilidad':   'Trazabilidad',
  '/marketplace':    'Marketplace',
  '/administrativo': 'Panel Administrativo',
  '/usuarios':       'Usuarios',
}

export default function Layout() {
  const { dark, toggle } = useTheme()
  const { user } = useAuth()
  const location = useLocation()
  const title = ROUTE_TITLES[location.pathname] || 'BioHuerto'

  const nombreCompleto = user?.first_name
    ? `${user.first_name} ${user.last_name}`.trim()
    : user?.username || ''

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 `} style={{ backgroundColor: dark ? '#1e2433' : undefined }}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className={`h-14 shrink-0 flex items-center px-5 gap-4 border-b transition-colors duration-300 ${dark ? 'bg-gray-750 border-gray-700' : 'bg-white border-gray-200'}`}
          style={{ backgroundColor: dark ? '#252d3d' : undefined }}>

          {/* Izquierda: toggle */}
          <div className="flex items-center pl-10 lg:pl-0">
            <button
              onClick={toggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                dark
                  ? 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {dark ? <Sun size={13} /> : <Moon size={13} />}
              {dark ? 'Claro' : 'Oscuro'}
            </button>
          </div>

          {/* Derecha: avatar + nombre */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="leading-tight text-right">
              <p className={`text-xs font-bold truncate max-w-[160px] ${dark ? 'text-gray-100' : 'text-gray-800'}`}>
                {nombreCompleto}
              </p>
              <p className={`text-[10px] capitalize ${dark ? 'text-gray-400' : 'text-gray-400'}`}>
                {user?.rol || 'productor'}
              </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-xs font-extrabold text-white shrink-0">
              {nombreCompleto?.[0]?.toUpperCase() || '?'}
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-y-auto">
          <div className="w-full px-4 sm:px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
