import { useNavigate } from 'react-router-dom'
import { ArrowRight, UserCog, BadgeCheck, Users } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Breadcrumb from '../../components/ui/Breadcrumb'

const cards = [
  {
    icon: Users,
    label: 'Usuarios',
    desc: 'Gestiona los usuarios registrados: productores, consumidores y administradores.',
    to: '/usuarios',
  },
  {
    icon: BadgeCheck,
    label: 'Asignar Roles',
    desc: 'Asigna y modifica los roles de los usuarios: productor, consumidor o administrador.',
    to: '/asignar-roles',
  },
  {
    icon: UserCog,
    label: 'Miembros de Biohuertos',
    desc: 'Asigna operarios y administradores a cada biohuerto del sistema.',
    to: '/administrativo/biohuert-miembros',
  },
]

export default function AdministrativoPage() {
  const navigate = useNavigate()
  const { dark } = useTheme()

  const iconColor = dark ? 'rgba(255,255,255,0.75)' : '#16a34a'

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: 'Administrativo' }]} />
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: dark ? 'rgba(255,255,255,0.92)' : '#111827' }}>
          Panel Administrativo
        </h1>
        <p className="text-sm mt-1" style={{ color: dark ? 'rgba(255,255,255,0.40)' : '#9ca3af' }}>
          Usuarios y permisos del sistema
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl">
        {cards.map(({ icon: Icon, label, desc, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="group text-left flex flex-col gap-5 p-7 rounded-2xl transition-all duration-200 w-full hover:shadow-lg"
            style={{
              backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
              border: dark ? '1.5px solid rgba(255,255,255,0.09)' : '1.5px solid #e5e7eb',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.border = dark ? '1.5px solid rgba(255,255,255,0.20)' : '1.5px solid #16a34a'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.border = dark ? '1.5px solid rgba(255,255,255,0.09)' : '1.5px solid #e5e7eb'
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
              <Icon size={24} style={{ color: iconColor }} />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base font-extrabold" style={{ color: dark ? 'rgba(255,255,255,0.92)' : '#111827' }}>{label}</h2>
              <p className="text-sm leading-relaxed" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#6b7280' }}>{desc}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.40)' : '#9ca3af' }}>
              Ir al módulo
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
