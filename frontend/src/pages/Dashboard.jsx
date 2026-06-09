import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/ui/Loading'
import {
  Sprout, BellRing, Wheat, Warehouse, Leaf,
  Gauge, ScanSearch, Store, CalendarRange,
  FileDown, ArrowRight, Plus, TrendingUp,
  FlaskConical, Activity, Wallet, CheckCircle2,
  AlertTriangle, Droplets, Stethoscope,
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/* ── Traffic light component ── */
function TrafficLight({ estado }) {
  const lights = [
    { key: 'verde',    on: 'bg-emerald-400 shadow-[0_0_18px_5px_rgba(52,211,153,0.55)]' },
    { key: 'amarillo', on: 'bg-amber-400 shadow-[0_0_18px_5px_rgba(251,191,36,0.55)]'   },
    { key: 'rojo',     on: 'bg-red-500 shadow-[0_0_18px_5px_rgba(239,68,68,0.55)]'       },
  ]
  return (
    <div className="flex flex-col items-center gap-2.5 bg-gray-950 rounded-2xl px-3.5 py-4 shrink-0">
      {lights.map(({ key, on }) => (
        <div
          key={key}
          className={`w-8 h-8 rounded-full transition-all duration-500 ${estado === key ? on : 'bg-gray-700/50'}`}
        />
      ))}
    </div>
  )
}

/* ── Horizontal bar for costos ── */
function CostoBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline gap-2 text-xs">
        <span className="font-semibold text-gray-500 dark:text-gray-400 truncate">{label}</span>
        <span className="font-bold text-gray-800 dark:text-gray-200 tabular-nums shrink-0">S/ {value.toFixed(2)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const SEV = {
  alta:   { bg: 'bg-red-100 dark:bg-red-900/30',     text: 'text-red-700 dark:text-red-400',    dot: 'bg-red-500',    label: 'Alta' },
  media:  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-400',  label: 'Media' },
  baja:   { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-500', dot: 'bg-yellow-400', label: 'Baja' },
}

const SM = {
  verde:    { label: 'VERDE',    badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300', heading: 'Huerto sostenible',       sub: 'Excelente mes de prácticas agroecológicas' },
  amarillo: { label: 'AMARILLO', badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',         heading: 'En proceso de mejora',    sub: 'Agrega al menos una práctica más este mes'  },
  rojo:     { label: 'ROJO',     badge: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',                 heading: 'Sin prácticas sostenibles', sub: 'Registra prácticas ecológicas este mes'    },
}

const STATS = (d) => [
  { icon: Warehouse,  label: 'Biohuertos',  value: d?.total_biohuertos,  desc: 'activos',      to: '/biohuertos', grad: 'from-teal-500 to-cyan-600',    ring: 'ring-teal-200 dark:ring-teal-800',    bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800/40 text-teal-700 dark:text-teal-300'   },
  { icon: Sprout,     label: 'Cultivos',    value: d?.cultivos_activos,  desc: 'en producción', to: '/cultivos',   grad: 'from-green-500 to-emerald-600', ring: 'ring-green-200 dark:ring-green-800',  bg: 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/40 text-green-700 dark:text-green-300' },
  { icon: BellRing,   label: 'Alertas',     value: d?.alertas_pendientes, desc: 'pendientes',   to: '/alertas',    grad: 'from-orange-500 to-amber-600',  ring: 'ring-orange-200 dark:ring-orange-800', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/40 text-orange-700 dark:text-orange-300' },
  { icon: Wheat,      label: 'Cosechas',    value: d?.cosechas_activas,  desc: 'disponibles',  to: '/cosechas',   grad: 'from-amber-500 to-yellow-600',  ring: 'ring-amber-200 dark:ring-amber-800',  bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/40 text-amber-700 dark:text-amber-300'  },
]

const QUICK = [
  { to: '/biohuertos/nuevo', icon: Warehouse,    label: 'Nuevo biohuerto', grad: 'from-teal-500 to-cyan-600'      },
  { to: '/cultivos/nuevo',   icon: Sprout,       label: 'Nuevo cultivo',   grad: 'from-green-500 to-emerald-600'  },
  { to: '/alertas',          icon: BellRing,     label: 'Ver alertas',     grad: 'from-orange-500 to-amber-600'   },
  { to: '/diagnostico',      icon: ScanSearch,   label: 'Diagnosticar',    grad: 'from-rose-500 to-pink-600'      },
  { to: '/monitoreo',        icon: Gauge,        label: 'Monitoreo',       grad: 'from-sky-500 to-blue-600'       },
  { to: '/campanas',         icon: CalendarRange,label: 'Campañas',        grad: 'from-violet-500 to-purple-600'  },
  { to: '/marketplace',      icon: Store,        label: 'Marketplace',     grad: 'from-lime-500 to-green-600'     },
]

const COSTO_COLORS = ['bg-blue-500','bg-violet-500','bg-indigo-400','bg-sky-500','bg-teal-500','bg-cyan-500']

export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/')
      .then(r => setData(r.data))
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

  const sm     = SM[data?.semaforo_ambiental || 'rojo']
  const hora   = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const costoTotal = data?.costos_por_concepto?.reduce((s, c) => s + c.total, 0) || 0

  const diasLabel = (fechaStr) => {
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const d = new Date(fechaStr + 'T00:00:00')
    const diff = Math.round((d - hoy) / 86400000)
    if (diff === 0) return { label: 'Hoy',    hot: true }
    if (diff === 1) return { label: 'Mañana', hot: false }
    return { label: `${diff}d`, hot: false }
  }

  return (
    <div className="space-y-5">

      {/* ══ HERO HEADER ══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2d1c] via-[#1a4a2e] to-emerald-700 p-6 shadow-xl text-white">
        {/* Decorative organic shapes */}
        <div className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-8 right-20 w-32 h-32 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute bottom-2 right-48 w-16 h-16 rounded-full bg-emerald-300/10" />
        {/* Leaf SVG watermark */}
        <svg className="pointer-events-none absolute right-0 top-0 h-full opacity-[0.06]" viewBox="0 0 160 160" fill="white">
          <path d="M0 0 Q80 0 160 80 Q160 160 80 160 Q0 160 0 80 Z" />
          <path d="M160 0 Q160 80 80 160 L160 160 Z" fillOpacity=".5" />
        </svg>

        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-emerald-300/80 text-[11px] font-bold uppercase tracking-widest mb-2">
              {new Date().toLocaleDateString('es-PE',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              {saludo}, {user?.first_name || user?.username}
            </h1>
            <p className="text-emerald-100/60 text-sm mt-1.5 font-medium">
              Ecosistema agroecológico BioHuerto USAT
            </p>
          </div>
          <button
            onClick={generarPDF}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
              bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur-sm
              transition-all duration-200 shrink-0 self-start"
          >
            <FileDown size={15} />
            Descargar PDF
          </button>
        </div>
      </div>

      {/* ══ KPI CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS(data).map(({ icon: Icon, label, value, desc, to, grad, bg }) => (
          <Link
            key={to} to={to}
            className={`group relative overflow-hidden rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all duration-200 ${bg}`}
          >
            <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${grad} shadow mb-3 group-hover:scale-110 transition-transform duration-200`}>
              <Icon size={16} className="text-white" />
            </div>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-50 leading-none tabular-nums">
              {value ?? '—'}
            </p>
            <p className="text-[11px] font-bold mt-0.5 leading-tight">{label}</p>
            <p className="text-[10px] opacity-55 font-medium">{desc}</p>
            <ArrowRight
              size={12}
              className="absolute bottom-3.5 right-3.5 opacity-25 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all duration-150"
            />
          </Link>
        ))}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT col (2/3): cosechas + diagnósticos */}
        <div className="lg:col-span-2 space-y-5">

          {/* Próximas cosechas */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-sm">
                  <Wheat size={13} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 leading-tight">Próximas cosechas</h2>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500">Próximos 7 días</p>
                </div>
              </div>
              <Link to="/cultivos" className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1">
                Ver todos <ArrowRight size={11} />
              </Link>
            </div>

            <div className="p-4">
              {data?.proximas_cosechas?.length > 0 ? (
                <div className="space-y-2">
                  {data.proximas_cosechas.map((c, i) => {
                    const { label: dLabel, hot } = diasLabel(c.fecha_estimada_cosecha)
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors duration-150"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${hot ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-green-500 to-emerald-600'}`}>
                            <Sprout size={14} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{c.nombre}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{c['biohuerto__nombre']}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums hidden sm:inline">{c.fecha_estimada_cosecha}</span>
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${hot ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                            {dLabel}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    <Wheat size={26} className="text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Sin cosechas esta semana</p>
                  <Link to="/cultivos/nuevo" className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                    <Plus size={11} /> Registrar cultivo
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Últimos diagnósticos */}
          {data?.ultimos_diagnosticos?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-sm">
                    <ScanSearch size={13} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 leading-tight">Diagnósticos recientes</h2>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Últimos 5 registros</p>
                  </div>
                </div>
                <Link to="/diagnostico" className="inline-flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 font-semibold hover:underline">
                  <Plus size={11} /> Nuevo
                </Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {data.ultimos_diagnosticos.map((d, i) => {
                  const sev = SEV[d.severidad]
                  return (
                    <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center shrink-0">
                          <FlaskConical size={13} className="text-rose-500 dark:text-rose-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                            {d.diagnostico_probable || 'Sin diagnóstico'}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">
                            {d['cultivo__nombre']} · {d.fecha}
                          </p>
                        </div>
                      </div>
                      {sev ? (
                        <span className={`flex-shrink-0 inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${sev.bg} ${sev.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {sev.label}
                        </span>
                      ) : (
                        <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                          —
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT col (1/3): semáforo + costos + accesos */}
        <div className="space-y-5">

          {/* Semáforo ambiental */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
              Semáforo ambiental
            </p>
            <div className="flex items-center gap-4">
              <TrafficLight estado={data?.semaforo_ambiental || 'rojo'} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-extrabold text-gray-800 dark:text-gray-200 leading-snug">{sm.heading}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-snug">{sm.sub}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-1 rounded-full ${sm.badge}`}>
                    {data?.practicas_mes ?? 0} práctica{(data?.practicas_mes ?? 0) !== 1 ? 's' : ''} este mes
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Costo del mes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm">
                  <Wallet size={13} className="text-white" />
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Costo del mes</p>
              </div>
              <Link to="/trazabilidad" className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Ver detalle
              </Link>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 tabular-nums mt-3 mb-4">
              S/&nbsp;<span>{(data?.costo_total_mes ?? 0).toFixed(2)}</span>
            </p>
            {data?.costos_por_concepto?.length > 0 ? (
              <div className="space-y-3">
                {data.costos_por_concepto.map((c, i) => (
                  <CostoBar
                    key={i} label={c.concepto}
                    value={c.total} total={costoTotal}
                    color={COSTO_COLORS[i % COSTO_COLORS.length]}
                  />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin costos registrados este mes</p>
            )}
          </div>

          {/* Accesos rápidos */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/80">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Activity size={13} className="text-white" />
              </div>
              <h3 className="text-sm font-extrabold text-gray-800 dark:text-gray-100">Acciones rápidas</h3>
            </div>
            <div className="p-2 space-y-0.5">
              {QUICK.map(({ to, icon: Icon, label, grad }) => (
                <Link
                  key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 group"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${grad} flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-150`}>
                    <Icon size={12} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors flex-1">
                    {label}
                  </span>
                  <ArrowRight size={11} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-150" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
