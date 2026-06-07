import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/ui/Loading'
import { Sprout, Bell, ShoppingBasket, Leaf, DollarSign, Calendar, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const SEMAFORO = {
  verde:    { color: 'bg-green-500',  texto: 'VERDE — Excelente práctica sostenible este mes', emoji: '🟢' },
  amarillo: { color: 'bg-yellow-400', texto: 'AMARILLO — Necesitas más prácticas sostenibles',  emoji: '🟡' },
  rojo:     { color: 'bg-red-500',    texto: 'ROJO — Sin prácticas sostenibles este mes',        emoji: '🔴' },
}

function StatCard({ icon: Icon, label, value, color, to }) {
  const content = (
    <div className={`card flex items-center gap-4 ${to ? 'hover:shadow-md transition-shadow cursor-pointer' : ''}`}>
      <div className={`${color} rounded-xl p-3`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

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
        ['Costo total del mes (S/)', data.costo_total_mes.toFixed(2)],
        ['Prácticas sostenibles del mes', data.practicas_mes],
        ['Semáforo ambiental', data.semaforo_ambiental.toUpperCase()],
      ],
    })

    if (data.proximas_cosechas?.length) {
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Cultivo', 'Biohuerto', 'Fecha estimada cosecha']],
        body: data.proximas_cosechas.map(c => [
          c.nombre, c['biohuerto__nombre'], c.fecha_estimada_cosecha
        ]),
      })
    }

    doc.save('reporte-biohuerto.pdf')
    toast.success('PDF generado correctamente.')
  }

  if (loading) return <Loading />

  const semaforo = SEMAFORO[data?.semaforo_ambiental || 'rojo']

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Hola, {user?.first_name} 👋
          </h1>
          <p className="text-gray-500 text-sm">Panel principal de tu biohuerto</p>
        </div>
        <button onClick={generarPDF} className="btn-secondary flex items-center gap-2 text-sm">
          📄 Descargar reporte PDF
        </button>
      </div>

      {/* Semáforo ambiental */}
      <div className="card border-l-4 border-primary-500">
        <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide mb-2">Semáforo ambiental</p>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded-full ${semaforo.color} animate-pulse`} />
          <p className="text-sm font-medium text-gray-700">{semaforo.texto}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1">{data?.practicas_mes} práctica(s) sostenible(s) registrada(s) este mes</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Sprout}       label="Cultivos activos"      value={data?.cultivos_activos}   color="bg-primary-600" to="/cultivos" />
        <StatCard icon={Bell}         label="Alertas pendientes"    value={data?.alertas_pendientes} color="bg-orange-500"  to="/alertas" />
        <StatCard icon={ShoppingBasket} label="Cosechas activas"   value={data?.cosechas_activas}   color="bg-emerald-600" to="/cosechas" />
        <StatCard icon={Leaf}         label="Biohuertos"            value={data?.total_biohuertos}   color="bg-teal-600"    to="/biohuertos" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas cosechas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar size={18} className="text-primary-600" /> Próximas cosechas (7 días)
            </h2>
            <Link to="/cultivos" className="text-xs text-primary-600 hover:underline">Ver todos</Link>
          </div>
          {data?.proximas_cosechas?.length > 0 ? (
            <div className="space-y-2">
              {data.proximas_cosechas.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.nombre}</p>
                    <p className="text-xs text-gray-400">{c['biohuerto__nombre']}</p>
                  </div>
                  <span className="badge-green">{c.fecha_estimada_cosecha}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">Sin cosechas en los próximos 7 días</p>
          )}
        </div>

        {/* Costo del mes y accesos rápidos */}
        <div className="space-y-4">
          <div className="card flex items-center gap-4">
            <div className="bg-blue-500 rounded-xl p-3">
              <DollarSign size={22} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">S/ {data?.costo_total_mes?.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Costo total acumulado del mes</p>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-3">Accesos rápidos</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { to: '/biohuertos/nuevo',  label: '+ Nuevo biohuerto' },
                { to: '/cultivos/nuevo',    label: '+ Nuevo cultivo' },
                { to: '/alertas',           label: '🔔 Ver alertas' },
                { to: '/diagnostico',       label: '🔬 Diagnosticar' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="btn-secondary text-xs text-center py-2">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
