import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/ui/Loading'
import {
  Sprout, Bell, ShoppingBasket, Leaf, DollarSign, Calendar,
  Plus, Stethoscope, ArrowRight, TrendingUp, FileDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const SEMAFORO = {
  verde:    { bg: 'bg-emerald-500', ring: 'ring-emerald-400/30', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', text: 'Excelente práctica sostenible este mes' },
  amarillo: { bg: 'bg-yellow-400',  ring: 'ring-yellow-400/30',  badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',   text: 'Necesitas más prácticas sostenibles' },
  rojo:     { bg: 'bg-red-500',     ring: 'ring-red-400/30',     badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',               text: 'Sin prácticas sostenibles este mes' },
}

const stats = (data) => [
  { icon: Leaf,            label: 'Biohuertos',        value: data?.total_biohuertos,   color: 'bg-teal-500',    dark: 'dark:bg-teal-600',    to: '/biohuertos' },
  { icon: Sprout,          label: 'Cultivos activos',  value: data?.cultivos_activos,   color: 'bg-primary-600', dark: 'dark:bg-primary-700', to: '/cultivos'   },
  { icon: Bell,            label: 'Alertas pendientes',value: data?.alertas_pendientes, color: 'bg-orange-500',  dark: 'dark:bg-orange-600',  to: '/alertas'    },
  { icon: ShoppingBasket,  label: 'Cosechas activas',  value: data?.cosechas_activas,   color: 'bg-emerald-600', dark: 'dark:bg-emerald-700', to: '/cosechas'   },
]

const quickActions = [
  { to: '/biohuertos/nuevo', icon: Plus,         label: 'Nuevo biohuerto',  color: 'text-teal-600 dark:text-teal-400' },
  { to: '/cultivos/nuevo',   icon: Sprout,       label: 'Nuevo cultivo',    color: 'text-green-600 dark:text-green-400' },
  { to: '/alertas',          icon: Bell,         label: 'Ver alertas',      color: 'text-orange-500 dark:text-orange-400' },
  { to: '/diagnostico',      icon: Stethoscope,  label: 'Diagnosticar',     color: 'text-rose-600 dark:text-rose-400' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/')
      .then(res => setData(res.data))
      .catch(() => toast.error('No se pudo cargar el dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const generarPDF = () => {
    if (!data) return
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('Reporte BioHuerto USAT', 14, 20)
    doc.setFontSize(12)
    doc.text(`Productor: ${user?.first_name} ${user?.last_name}`, 14, 32)
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 14, 40)
    autoTable(doc, {
      startY: 50,
      head: [['Indicador', 'Valor']],
      body: [
        ['Biohuertos activos', data.total_biohuertos],
        ['Cultivos activos', data.cultivos_activos],
        ['Alertas pendientes', data.alertas_pendientes],
        ['Cosechas publicadas activas', data.cosechas_activas],
        ['Costo total del mes (S/)', data.costo_total_mes?.toFixed(2)],
        ['Prácticas sostenibles del mes', data.practicas_mes],
        ['Semáforo ambiental', data.semaforo_ambiental?.toUpperCase()],
      ],
    })
    if (data.proximas_cosechas?.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Cultivo', 'Biohuerto', 'Fecha estimada cosecha']],
        body: data.proximas_cosechas.map(c => [c.nombre, c['biohuerto__nombre'], c.fecha_estimada_cosecha]),
      })
    }
    doc.save('reporte-biohuerto.pdf')
    toast.success('PDF generado correctamente.')
  }

  if (loading) return <Loading />

  const semaforo = SEMAFORO[data?.semaforo_ambiental || 'rojo']
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
            {saludo}, {user?.first_name || user?.username} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          onClick={generarPDF}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
            text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700
            shadow-sm transition-all duration-200"
        >
          <FileDown size={16} />
          Descargar reporte PDF
        </button>
      </div>

      {/* Semáforo ambiental */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 flex items-center gap-4 shadow-sm">
        <div className={`relative w-12 h-12 rounded-full ${semaforo.bg} ring-4 ${semaforo.ring} flex items-center justify-center shrink-0`}>
          <div className={`w-3 h-3 rounded-full bg-white/80 animate-pulse`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest mb-1">Semáforo ambiental</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{semaforo.text}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {data?.practicas_mes} práctica(s) sostenible(s) registrada(s) este mes
          </p>
        </div>
        <span className={`hidden sm:inline-flex text-xs font-bold px-3 py-1.5 rounded-full ${semaforo.badge}`}>
          {(data?.semaforo_ambiental || 'rojo').toUpperCase()}
        </span>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats(data).map(({ icon: Icon, label, value, color, dark: darkColor, to }) => (
          <Link key={to} to={to} className="group bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4">
            <div className={`${color} ${darkColor} rounded-xl p-3 shrink-0 group-hover:scale-110 transition-transform duration-200`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 leading-tight">{value ?? '—'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Próximas cosechas */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 text-sm">
              <Calendar size={16} className="text-primary-600" />
              Próximas cosechas <span className="text-gray-400 dark:text-gray-500 font-normal">(7 días)</span>
            </h2>
            <Link to="/cultivos" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={12} />
            </Link>
          </div>

          {data?.proximas_cosechas?.length > 0 ? (
            <div className="divide-y divide-gray-50 dark:divide-gray-800">
              {data.proximas_cosechas.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                      <Sprout size={14} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.nombre}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{c['biohuerto__nombre']}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    {c.fecha_estimada_cosecha}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar size={32} className="text-gray-200 dark:text-gray-700 mb-2" />
              <p className="text-sm text-gray-400 dark:text-gray-500">Sin cosechas en los próximos 7 días</p>
            </div>
          )}
        </div>

        {/* Panel derecho */}
        <div className="space-y-4">
          {/* Costo del mes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm flex items-center gap-4">
            <div className="bg-blue-500 dark:bg-blue-600 rounded-xl p-3 shrink-0">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-gray-800 dark:text-gray-100">
                S/ {data?.costo_total_mes?.toFixed(2) ?? '0.00'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1">
                <TrendingUp size={11} /> Costo acumulado del mes
              </p>
            </div>
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-3">Accesos rápidos</h3>
            <div className="space-y-1">
              {quickActions.map(({ to, icon: Icon, label, color }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 group"
                >
                  <Icon size={16} className={color} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {label}
                  </span>
                  <ArrowRight size={13} className="ml-auto text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
