import { useNavigate } from 'react-router-dom'
import { ArrowRight, Ruler, Bug, Target, SlidersHorizontal } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Breadcrumb from '../../components/ui/Breadcrumb'

const CARDS = [
  {
    icon: Ruler, label: 'Unidades de medida',
    desc: 'mL/L, g/L, kg/ha, L/ha — unidades controladas para registrar dosis.',
    to: '/catalogos/unidades',
    color: { dark: '#60a5fa', light: '#2563eb', bg: { dark: 'rgba(59,130,246,0.12)', light: '#eff6ff' } },
  },
  {
    icon: Bug, label: 'Plagas y enfermedades',
    desc: 'Catálogo de insectos, ácaros, hongos, bacterias y virus que atacan cultivos.',
    to: '/catalogos/plagas',
    color: { dark: '#f87171', light: '#dc2626', bg: { dark: 'rgba(239,68,68,0.12)', light: '#fef2f2' } },
  },
  {
    icon: Target, label: 'Objetivos',
    desc: 'Para qué se aplica cada producto: control, prevención, fertilización, bioestimulación.',
    to: '/catalogos/objetivos',
    color: { dark: '#fb923c', light: '#ea580c', bg: { dark: 'rgba(249,115,22,0.12)', light: '#fff7ed' } },
  },
  {
    icon: SlidersHorizontal, label: 'Condiciones',
    desc: 'Cuándo aplicar: en floración, con lluvia, preventivo, al trasplante, etc.',
    to: '/catalogos/condiciones',
    color: { dark: '#a78bfa', light: '#7c3aed', bg: { dark: 'rgba(139,92,246,0.12)', light: '#f5f3ff' } },
  },
]

function Card({ icon: Icon, label, desc, to, color, dark, navigate }) {
  const ic  = dark ? color.dark : color.light
  const ibg = dark ? color.bg.dark : color.bg.light
  return (
    <button
      onClick={() => navigate(to)}
      className="group text-left flex flex-col gap-5 p-7 rounded-2xl transition-all duration-200 w-full hover:shadow-lg"
      style={{
        backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#ffffff',
        border: dark ? '1.5px solid rgba(255,255,255,0.09)' : '1.5px solid #e5e7eb',
      }}
      onMouseEnter={e => { e.currentTarget.style.border = `1.5px solid ${ic}` }}
      onMouseLeave={e => { e.currentTarget.style.border = dark ? '1.5px solid rgba(255,255,255,0.09)' : '1.5px solid #e5e7eb' }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200"
        style={{ backgroundColor: ibg }}>
        <Icon size={24} style={{ color: ic }} />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-base font-extrabold" style={{ color: dark ? 'rgba(255,255,255,0.92)' : '#111827' }}>{label}</h2>
        <p className="text-sm leading-relaxed" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#6b7280' }}>{desc}</p>
      </div>
      <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: ic, opacity: 0.7 }}>
        Abrir <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </button>
  )
}

export default function CatalogosPage() {
  const navigate = useNavigate()
  const { dark } = useTheme()

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Catálogos' }]} />
      <div>
        <h1 className="text-2xl font-extrabold" style={{ color: dark ? 'rgba(255,255,255,0.92)' : '#111827' }}>
          Catálogos de apoyo
        </h1>
        <p className="text-sm mt-1" style={{ color: dark ? 'rgba(255,255,255,0.40)' : '#9ca3af' }}>
          Datos de referencia del sistema — unidades, plagas, objetivos y condiciones de aplicación
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl">
        {CARDS.map(card => (
          <Card key={card.to} {...card} dark={dark} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}
