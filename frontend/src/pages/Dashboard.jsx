import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/ui/Loading'
import {
  Sprout, Bell, ShoppingBasket, Leaf, DollarSign, Calendar,
  Plus, Stethoscope, ArrowRight, TrendingUp, FileDown,
  Droplets, Thermometer, AlertTriangle, CheckCircle2,
  FlaskConical, Wheat, BarChart3, Activity
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const SEMAFORO = {
  verde:    { bg: 'from-emerald-500 to-green-600', ring: 'ring-emerald-400/40', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', text: 'Excelente práctica sostenible este mes', icon: CheckCircle2 },
  amarillo: { bg: 'from-yellow-400 to-amber-500',  ring: 'ring-yellow-400/40',  badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',   text: 'Necesitas más prácticas sostenibles', icon: AlertTriangle },
  rojo:     { bg: 'from-red-500 to-rose-600',      ring: 'ring-red-400/40',     badge: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',               text: 'Sin prácticas sostenibles este mes', icon: AlertTriangle  },
}

const STAT_CARDS = (data) => [
  {
    icon: Leaf, label: 'Biohuertos', value: data?.total_biohuertos,
    gradient: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50 dark:bg-teal-900/20',
    border: 'border-teal-100 dark:border-teal-800/40', to: '/biohuertos',
    desc: 'registrados',
  },
  {
    icon: Sprout, label: 'Cultivos activos', value: data?.cultivos_activos,
    gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-100 dark:border-green-800/40', to: '/cultivos',
    desc: 'en producción',
  },
  {
    icon: Bell, label: 'Alertas pendientes', value: data?.alertas_pendientes,
    gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50 dark:bg-orange-900/20',
    border: 'border-orange-100 dark:border-orange-800/40', to: '/alertas',
    desc: 'por atender',
  },
  {
    icon: ShoppingBasket, label: 'Cosechas activas', value: data?.cosechas_activas,
    gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50 dark:bg-violet-900/20',
    border: 'border-violet-100 dark:border-violet-800/40', to: '/cosechas',
    desc: 'disponibles',
  },
]

const QUICK = [
  { to: '/biohuertos/nuevo', icon: Leaf,        label: 'Nuevo biohuerto', gradient: 'from-teal-500 to-cyan-600' },
  { to: '/cultivos/nuevo',   icon: Sprout,      label: 'Nuevo cultivo',   gradient: 'from-green-500 to-emerald-600' },
  { to: '/alertas',          icon: Bell,        label: 'Ver alertas',     gradient: 'from-orange-500 to-amber-600' },
  { to: '/diagnostico',      icon: Stethoscope, label: 'Diagnosticar',    gradient: 'from-rose-500 to-pink-600' },
  { to: '/monitoreo',        icon: Thermometer, label: 'Monitoreo',       gradient: 'from-sky-500 to-blue-600' },
  { to: '/campanas',         icon: Wheat,       label: 'Campañas',        gradient: 'from-violet-500 to-purple-600' },
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
    const W = 210, MAR = 14, BODY = W - MAR * 2
    const C = {
      green:[21,128,61], greenLight:[220,252,231], navy:[30,58,138],
      amber:[180,83,9], amberLight:[254,243,199], red:[185,28,28],
      dark:[17,24,39], gray:[107,114,128], grayLight:[243,244,246], white:[255,255,255],
    }
    let curY = 0
    const fecha = new Date().toLocaleDateString('es-PE',{year:'numeric',month:'long',day:'numeric'})
    const newPage = () => { doc.addPage(); curY = 20 }
    const checkBreak = (n=35) => { if (curY+n>278) newPage() }
    const sectionHeader = (num,title,color) => {
      checkBreak(14); doc.setFillColor(...color); doc.roundedRect(MAR,curY,BODY,8,1,1,'F')
      doc.setTextColor(...C.white); doc.setFontSize(8.5); doc.setFont('helvetica','bold')
      doc.text(`${num}.  ${title}`,MAR+4,curY+5.5); doc.setTextColor(...C.dark); curY+=12
    }
    const emptyMsg = (msg) => {
      doc.setFontSize(8); doc.setFont('helvetica','italic'); doc.setTextColor(...C.gray)
      doc.text(msg,MAR+3,curY+5); doc.setTextColor(...C.dark); curY+=12
    }
    const table = (head,body,headColor,opts={}) => {
      checkBreak(20)
      autoTable(doc,{startY:curY,head:[head],body,headStyles:{fillColor:headColor,fontSize:8,fontStyle:'bold',textColor:C.white,cellPadding:3},bodyStyles:{fontSize:8,cellPadding:3,textColor:C.dark},alternateRowStyles:{fillColor:C.grayLight},tableLineColor:[229,231,235],tableLineWidth:0.1,margin:{left:MAR,right:MAR},...opts})
      curY = doc.lastAutoTable.finalY+8
    }
    doc.setFillColor(...C.green); doc.rect(0,0,W,42,'F')
    doc.setFillColor(16,100,47); doc.rect(0,36,W,6,'F')
    doc.setTextColor(...C.white); doc.setFontSize(20); doc.setFont('helvetica','bold')
    doc.text('REPORTE DE GESTIÓN AGROECOLÓGICA',MAR,16)
    doc.setFontSize(10); doc.setFont('helvetica','normal')
    doc.text('BioHuerto USAT  ·  Chiclayo, Lambayeque — Perú',MAR,24)
    doc.setFontSize(8.5)
    doc.text(`Productor: ${user?.first_name??''} ${user?.last_name??''}`,MAR,31)
    doc.text(`Fecha: ${fecha}`,MAR+100,31)
    doc.setTextColor(...C.dark); curY=52
    sectionHeader(1,'Próximas cosechas — próximos 7 días',C.green)
    if (data.proximas_cosechas?.length) table(['Cultivo','Biohuerto','Fecha estimada'],data.proximas_cosechas.map(c=>[c.nombre,c['biohuerto__nombre'],c.fecha_estimada_cosecha]),C.green,{columnStyles:{2:{halign:'center'}}})
    else emptyMsg('No hay cosechas en los próximos 7 días.')
    sectionHeader(2,'Costos de producción — mes actual',C.navy)
    if (data.costos_por_concepto?.length) { const tot=data.costos_por_concepto.reduce((s,c)=>s+c.total,0); table(['Concepto','Monto (S/)','% total'],data.costos_por_concepto.map(c=>[c.concepto,c.total.toFixed(2),`${((c.total/tot)*100).toFixed(1)}%`]),C.navy,{columnStyles:{1:{halign:'right'},2:{halign:'center'}}}) }
    else emptyMsg('Sin costos registrados este mes.')
    const total=doc.getNumberOfPages()
    for(let i=1;i<=total;i++){doc.setPage(i);doc.setFillColor(...C.grayLight);doc.rect(0,284,W,13,'F');doc.setFontSize(7.5);doc.setFont('helvetica','normal');doc.setTextColor(...C.gray);doc.text('BioHuerto USAT · Gestión Agroecológica · Lambayeque, Perú',MAR,291);doc.text(`Pág ${i}/${total}`,W-MAR,291,{align:'right'})}
    doc.save(`reporte-biohuerto-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('Reporte PDF generado.')
  }

  if (loading) return <Loading />

  const semaforo = SEMAFORO[data?.semaforo_ambiental || 'rojo']
  const SemaforoIcon = semaforo.icon
  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="space-y-6">

      {/* ── Encabezado ── */}
      <div className="rounded-2xl bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-green-200 text-sm font-medium mb-1">
              {new Date().toLocaleDateString('es-PE',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            </p>
            <h1 className="text-2xl font-extrabold leading-tight">
              {saludo}, {user?.first_name || user?.username} 👋
            </h1>
            <p className="text-green-100 text-sm mt-1 opacity-80">
              Aquí está el resumen de tu biohuerto hoy.
            </p>
          </div>
          <button
            onClick={generarPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-white/15 hover:bg-white/25 border border-white/25 text-white
              backdrop-blur-sm transition-all duration-200 shrink-0"
          >
            <FileDown size={16} />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* ── Cards de estadísticas ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS(data).map(({ icon: Icon, label, value, gradient, bg, border, to, desc }) => (
          <Link
            key={to} to={to}
            className={`group relative overflow-hidden rounded-2xl border ${border} ${bg} p-5 shadow-sm hover:shadow-md transition-all duration-200`}
          >
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm mb-3 group-hover:scale-105 transition-transform duration-200`}>
              <Icon size={18} className="text-white" />
            </div>
            <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 leading-none">
              {value ?? '—'}
            </p>
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-1">{label}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{desc}</p>
            <ArrowRight size={14} className="absolute bottom-4 right-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* ── Semáforo + Costo ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Semáforo ambiental */}
        <div className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${semaforo.bg} ring-4 ${semaforo.ring} flex items-center justify-center shrink-0 shadow-md`}>
              <SemaforoIcon size={22} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">
                Semáforo ambiental
              </p>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{semaforo.text}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {data?.practicas_mes ?? 0} práctica(s) sostenibles este mes
              </p>
            </div>
          </div>
          <span className={`mt-3 inline-flex text-xs font-bold px-3 py-1 rounded-full ${semaforo.badge}`}>
            Estado: {(data?.semaforo_ambiental || 'ROJO').toUpperCase()}
          </span>
        </div>

        {/* Costo del mes */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-md">
              <DollarSign size={22} className="text-white" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 dark:text-blue-400 mb-1">
                Costo acumulado del mes
              </p>
              <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 leading-none">
                S/ {data?.costo_total_mes?.toFixed(2) ?? '0.00'}
              </p>
              <p className="text-xs text-blue-400 dark:text-blue-400 mt-1 flex items-center gap-1">
                <TrendingUp size={11} /> Costos de producción registrados
              </p>
            </div>
          </div>
          <Link
            to="/trazabilidad"
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Ver trazabilidad <ArrowRight size={11} />
          </Link>
        </div>
      </div>

      {/* ── Fila principal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Próximas cosechas */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 text-sm">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Calendar size={13} className="text-white" />
              </div>
              Próximas cosechas
              <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(7 días)</span>
            </h2>
            <Link to="/cultivos" className="text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>

          <div className="p-5">
            {data?.proximas_cosechas?.length > 0 ? (
              <div className="space-y-2">
                {data.proximas_cosechas.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/10 transition-colors duration-150">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shrink-0">
                        <Sprout size={14} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{c.nombre}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{c['biohuerto__nombre']}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shrink-0">
                      {c.fecha_estimada_cosecha}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                  <Calendar size={28} className="text-gray-300 dark:text-gray-600" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sin cosechas en los próximos 7 días</p>
                <Link to="/cultivos/nuevo" className="mt-3 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline flex items-center gap-1">
                  <Plus size={11} /> Agregar cultivo
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50 dark:border-gray-800">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Activity size={13} className="text-white" />
            </div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Accesos rápidos</h3>
          </div>
          <div className="p-3 space-y-1">
            {QUICK.map(({ to, icon: Icon, label, gradient }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 group"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-150`}>
                  <Icon size={14} className="text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors flex-1">
                  {label}
                </span>
                <ArrowRight size={13} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
