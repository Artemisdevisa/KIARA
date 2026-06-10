import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Loading from '../components/ui/Loading'
import {
  Sprout, BellRing, Wheat, Warehouse,
  Gauge, ScanSearch, Store, CalendarRange,
  FileDown, ArrowRight, Plus,
  FlaskConical, Activity, Wallet,
  Leaf, BarChart3,
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/* ── Traffic light ── */
function TrafficLight({ estado }) {
  const lights = [
    { key: 'verde',    on: 'bg-emerald-400 shadow-[0_0_16px_4px_rgba(52,211,153,0.5)]'  },
    { key: 'amarillo', on: 'bg-amber-400 shadow-[0_0_16px_4px_rgba(251,191,36,0.5)]'    },
    { key: 'rojo',     on: 'bg-red-500 shadow-[0_0_16px_4px_rgba(239,68,68,0.5)]'        },
  ]
  return (
    <div className="flex flex-col items-center gap-2.5 bg-gray-950 rounded-xl px-3 py-4 shrink-0">
      {lights.map(({ key, on }) => (
        <div key={key} className={`w-7 h-7 rounded-full transition-all duration-500 ${estado === key ? on : 'bg-gray-800'}`} />
      ))}
    </div>
  )
}

/* ── Costo bar ── */
function CostoBar({ label, value, total, barClass }) {
  const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-baseline gap-2 text-xs">
        <span className="text-gray-500 dark:text-gray-400 truncate">{label}</span>
        <span className="font-semibold text-gray-800 dark:text-gray-200 tabular-nums shrink-0">S/ {value.toFixed(2)}</span>
      </div>
      <div className="h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${barClass} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/* ── Constants ── */
const SEV = {
  alta:  { dot: 'bg-red-500',   text: 'text-red-600 dark:text-red-400',    label: 'Alta'  },
  media: { dot: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400', label: 'Media' },
  baja:  { dot: 'bg-yellow-400',text: 'text-yellow-600 dark:text-yellow-400',label: 'Baja' },
}

const SM = {
  verde:    { badge: 'text-emerald-600 dark:text-emerald-400', heading: 'Huerto sostenible',       sub: 'Excelente práctica agroecológica este mes' },
  amarillo: { badge: 'text-amber-600 dark:text-amber-400',     heading: 'En proceso de mejora',    sub: 'Agrega al menos una práctica más este mes'  },
  rojo:     { badge: 'text-red-600 dark:text-red-400',         heading: 'Sin prácticas sostenibles', sub: 'Registra prácticas ecológicas este mes'    },
}

const STATS = (d) => [
  {
    icon: Warehouse, label: 'Biohuertos', value: d?.total_biohuertos, desc: 'activos',
    to: '/biohuertos',
    iconCls: 'text-teal-500 dark:text-teal-400',
    border: 'border-l-teal-500',
    num: 'text-teal-700 dark:text-teal-300',
  },
  {
    icon: CalendarRange, label: 'Campañas activas', value: d?.campanas_activas, desc: 'en producción',
    to: '/campanas',
    iconCls: 'text-emerald-500 dark:text-emerald-400',
    border: 'border-l-emerald-500',
    num: 'text-emerald-700 dark:text-emerald-300',
  },
  {
    icon: BellRing, label: 'Alertas pendientes', value: d?.alertas_pendientes, desc: 'por atender',
    to: '/alertas',
    iconCls: 'text-orange-500 dark:text-orange-400',
    border: 'border-l-orange-500',
    num: 'text-orange-700 dark:text-orange-300',
  },
  {
    icon: Wheat, label: 'Cosechas publicadas', value: d?.cosechas_activas, desc: 'disponibles',
    to: '/cosechas',
    iconCls: 'text-amber-500 dark:text-amber-400',
    border: 'border-l-amber-500',
    num: 'text-amber-700 dark:text-amber-300',
  },
]

const QUICK = [
  { to: '/biohuertos/nuevo', icon: Warehouse,    label: 'Nuevo biohuerto', hov: 'group-hover:text-teal-500 dark:group-hover:text-teal-400'    },
  { to: '/cultivos/nuevo',   icon: Sprout,       label: 'Nuevo cultivo',   hov: 'group-hover:text-emerald-500 dark:group-hover:text-emerald-400' },
  { to: '/alertas',          icon: BellRing,     label: 'Ver alertas',     hov: 'group-hover:text-orange-500 dark:group-hover:text-orange-400'  },
  { to: '/diagnostico',      icon: ScanSearch,   label: 'Diagnosticar',    hov: 'group-hover:text-rose-500 dark:group-hover:text-rose-400'      },
  { to: '/monitoreo',        icon: Gauge,        label: 'Monitoreo',       hov: 'group-hover:text-sky-500 dark:group-hover:text-sky-400'        },
  { to: '/campanas',         icon: CalendarRange,label: 'Campañas',        hov: 'group-hover:text-violet-500 dark:group-hover:text-violet-400'  },
  { to: '/marketplace',      icon: Store,        label: 'Marketplace',     hov: 'group-hover:text-lime-600 dark:group-hover:text-lime-400'      },
]

const BAR_COLORS = ['bg-teal-500','bg-emerald-500','bg-blue-500','bg-violet-500','bg-amber-500','bg-rose-500']

/* ── Dashboard ── */
export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dashboard/')
      .then(r => setData(r.data))
      .catch(() => toast.error('No se pudo cargar el dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  /* ── PDF — 5 secciones ── */
  const generarPDF = () => {
    if (!data) return
    const doc  = new jsPDF()
    const W = 210, MAR = 14, BODY = W - MAR * 2
    const C = {
      green:[21,128,61], navy:[30,58,138], amber:[146,64,14], rose:[190,18,60],
      teal:[15,118,110], dark:[17,24,39], gray:[107,114,128],
      grayLight:[243,244,246], white:[255,255,255],
    }
    let curY = 0
    const fecha  = new Date().toLocaleDateString('es-PE',{year:'numeric',month:'long',day:'numeric'})
    const nombre = `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim() || user?.username || '—'
    const newPage    = () => { doc.addPage(); curY = 20 }
    const checkBreak = (n = 35) => { if (curY + n > 278) newPage() }

    const sectionHdr = (num, title, color) => {
      checkBreak(14)
      doc.setFillColor(...color)
      doc.roundedRect(MAR, curY, BODY, 8, 1, 1, 'F')
      doc.setTextColor(...C.white); doc.setFontSize(8.5); doc.setFont('helvetica','bold')
      doc.text(`${num}.  ${title}`, MAR + 4, curY + 5.5)
      doc.setTextColor(...C.dark); curY += 12
    }
    const emptyMsg = msg => {
      doc.setFontSize(8); doc.setFont('helvetica','italic'); doc.setTextColor(...C.gray)
      doc.text(msg, MAR + 3, curY + 5); doc.setTextColor(...C.dark); curY += 12
    }
    const table = (head, body, headColor, opts = {}) => {
      checkBreak(20)
      autoTable(doc, {
        startY: curY, head: [head], body,
        headStyles:  { fillColor: headColor, fontSize: 8, fontStyle: 'bold', textColor: C.white, cellPadding: 3 },
        bodyStyles:  { fontSize: 8, cellPadding: 3, textColor: C.dark },
        alternateRowStyles: { fillColor: C.grayLight },
        tableLineColor: [229,231,235], tableLineWidth: 0.1,
        margin: { left: MAR, right: MAR },
        ...opts,
      })
      curY = doc.lastAutoTable.finalY + 8
    }

    /* Header */
    doc.setFillColor(...C.green); doc.rect(0, 0, W, 44, 'F')
    doc.setFillColor(16,100,47);  doc.rect(0, 38, W, 6, 'F')
    doc.setTextColor(...C.white); doc.setFontSize(18); doc.setFont('helvetica','bold')
    doc.text('REPORTE DE GESTIÓN AGROECOLÓGICA', MAR, 15)
    doc.setFontSize(9.5); doc.setFont('helvetica','normal')
    doc.text('BioHuerto USAT  ·  Chiclayo, Lambayeque — Perú', MAR, 24)
    doc.setFontSize(8.5)
    doc.text(`Productor: ${nombre}`, MAR, 31)
    doc.text(`Fecha: ${fecha}`, MAR + 100, 31)
    doc.setTextColor(...C.dark); curY = 54

    /* 1 — Indicadores resumen */
    sectionHdr(1, 'Indicadores del biohuerto', C.teal)
    const ind = [
      ['Biohuertos activos',     String(data.total_biohuertos ?? 0)],
      ['Cultivos en producción', String(data.cultivos_activos ?? 0)],
      ['Alertas pendientes',     String(data.alertas_pendientes ?? 0)],
      ['Cosechas publicadas',    String(data.cosechas_activas ?? 0)],
      ['Costo acumulado del mes', `S/ ${(data.costo_total_mes ?? 0).toFixed(2)}`],
      ['Prácticas sostenibles',  String(data.practicas_mes ?? 0)],
      ['Semáforo ambiental',     (data.semaforo_ambiental ?? 'rojo').toUpperCase()],
    ]
    table(['Indicador','Valor'], ind, C.teal, { columnStyles: { 1: { halign: 'center', fontStyle: 'bold' } } })

    /* 2 — Próximas cosechas */
    sectionHdr(2, 'Próximas cosechas — próximos 7 días', C.green)
    if (data.proximas_cosechas?.length)
      table(['Cultivo','Biohuerto','Fecha estimada'],
        data.proximas_cosechas.map(c => [c.nombre, c['biohuerto__nombre'], c.fecha_estimada_cosecha]),
        C.green, { columnStyles: { 2: { halign: 'center' } } })
    else emptyMsg('No hay cosechas en los próximos 7 días.')

    /* 3 — Costos por concepto */
    sectionHdr(3, 'Costos de producción — mes actual', C.navy)
    if (data.costos_por_concepto?.length) {
      const tot = data.costos_por_concepto.reduce((s, c) => s + c.total, 0)
      table(['Concepto','Monto (S/)','% total'],
        data.costos_por_concepto.map(c => [
          c.concepto, c.total.toFixed(2), `${((c.total / tot) * 100).toFixed(1)}%`,
        ]),
        C.navy, { columnStyles: { 1: { halign: 'right' }, 2: { halign: 'center' } } })
    } else emptyMsg('Sin costos registrados este mes.')

    /* 4 — Prácticas sostenibles */
    sectionHdr(4, 'Prácticas sostenibles del mes', C.green)
    if (data.practicas_detalle?.length)
      table(['Fecha','Tipo','Cultivo'],
        data.practicas_detalle.map(p => [p.fecha, p.tipo, p['cultivo__nombre'] ?? '—']),
        C.green)
    else emptyMsg('Sin prácticas sostenibles registradas este mes.')

    /* 5 — Diagnósticos recientes */
    sectionHdr(5, 'Diagnósticos fitosanitarios recientes', C.rose)
    if (data.ultimos_diagnosticos?.length)
      table(['Fecha','Diagnóstico','Cultivo','Severidad'],
        data.ultimos_diagnosticos.map(d => [
          d.fecha, d.diagnostico_probable ?? '—', d['cultivo__nombre'] ?? '—', d.severidad ?? '—',
        ]),
        C.rose, { columnStyles: { 3: { halign: 'center' } } })
    else emptyMsg('Sin diagnósticos recientes.')

    /* Footer */
    const pages = doc.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i)
      doc.setFillColor(...C.grayLight); doc.rect(0, 284, W, 13, 'F')
      doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.setTextColor(...C.gray)
      doc.text('BioHuerto USAT · Gestión Agroecológica · Lambayeque, Perú', MAR, 291)
      doc.text(`Pág ${i}/${pages}`, W - MAR, 291, { align: 'right' })
    }

    doc.save(`reporte-biohuerto-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('Reporte PDF generado.')
  }

  if (loading) return <Loading />

  const sm         = SM[data?.semaforo_ambiental || 'rojo']
  const hora       = new Date().getHours()
  const saludo     = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const costoTotal = data?.costos_por_concepto?.reduce((s, c) => s + c.total, 0) || 0

  const diasLabel = (fechaStr) => {
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const diff = Math.round((new Date(fechaStr + 'T00:00:00') - hoy) / 86400000)
    if (diff === 0) return { text: 'Hoy',    hot: true  }
    if (diff === 1) return { text: 'Mañana', hot: false }
    return { text: `${diff}d`, hot: false }
  }

  return (
    <div className="space-y-5">

      {/* ══ HERO ══ */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2d1c] via-[#1a4a2e] to-emerald-700 p-6 shadow-xl text-white">
        <div className="pointer-events-none absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-6 right-20 w-28 h-28 rounded-full bg-white/[0.04]" />
        <svg className="pointer-events-none absolute right-0 top-0 h-full opacity-[0.06]" viewBox="0 0 160 160" fill="white">
          <path d="M0 0 Q80 0 160 80 Q160 160 80 160 Q0 160 0 80 Z" />
          <path d="M160 0 Q160 80 80 160 L160 160 Z" fillOpacity=".5" />
        </svg>
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-emerald-300/70 text-[11px] font-semibold uppercase tracking-widest mb-2">
              {new Date().toLocaleDateString('es-PE',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              {saludo}, {user?.first_name || user?.username}
            </h1>
            <p className="text-emerald-100/55 text-sm mt-1.5">Ecosistema agroecológico BioHuerto USAT</p>
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

      {/* ══ KPI CARDS — sin fondos de burbuja ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS(data).map(({ icon: Icon, label, value, desc, to, iconCls, border, num }) => (
          <Link
            key={to} to={to}
            className={`group relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 border-l-4 ${border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`}
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 leading-tight pr-2">{label}</p>
              <Icon size={16} className={`${iconCls} shrink-0 mt-0.5`} />
            </div>
            <p className={`text-4xl font-extrabold tabular-nums leading-none ${num}`}>{value ?? '—'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 font-medium">{desc}</p>
            <ArrowRight size={12} className="absolute bottom-4 right-4 text-gray-200 dark:text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150" />
          </Link>
        ))}
      </div>

      {/* ══ CONTENT ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* LEFT 2/3 */}
        <div className="lg:col-span-2 space-y-5">

          {/* Próximas cosechas */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/80">
              <div className="flex items-center gap-2">
                <Wheat size={15} className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Próximas cosechas</h2>
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
                    const { text, hot } = diasLabel(c.fecha_estimada_cosecha)
                    return (
                      <div key={i} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors duration-150">
                        <div className="flex items-center gap-3 min-w-0">
                          <Sprout size={15} className="text-emerald-500 dark:text-emerald-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{c.nombre}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">{c['biohuerto__nombre']}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 tabular-nums hidden sm:inline">{c.fecha_estimada_cosecha}</span>
                          <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${hot ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                            {text}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                  <Wheat size={32} className="text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">Sin cosechas esta semana</p>
                  <Link to="/cultivos/nuevo" className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">
                    <Plus size={11} /> Registrar cultivo
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Diagnósticos recientes */}
          {data?.ultimos_diagnosticos?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/80">
                <div className="flex items-center gap-2">
                  <ScanSearch size={15} className="text-rose-500 dark:text-rose-400" />
                  <div>
                    <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100">Diagnósticos recientes</h2>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">Últimos 5 registros</p>
                  </div>
                </div>
                <Link to="/diagnostico" className="inline-flex items-center gap-1 text-xs text-rose-500 dark:text-rose-400 font-semibold hover:underline">
                  <Plus size={11} /> Nuevo
                </Link>
              </div>
              <div className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {data.ultimos_diagnosticos.map((d, i) => {
                  const sev = SEV[d.severidad]
                  return (
                    <div key={i} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors duration-150">
                      <div className="flex items-center gap-3 min-w-0">
                        <FlaskConical size={14} className="text-rose-400 dark:text-rose-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">{d.diagnostico_probable || 'Sin diagnóstico'}</p>
                          <p className="text-[10px] text-gray-400 dark:text-gray-500">{d['cultivo__nombre']} · {d.fecha}</p>
                        </div>
                      </div>
                      {sev ? (
                        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 text-[10px] font-bold ${sev.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                          {sev.label}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-300 dark:text-gray-600">—</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT 1/3 */}
        <div className="space-y-5">

          {/* Semáforo ambiental */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Leaf size={14} className="text-gray-400 dark:text-gray-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Semáforo ambiental</p>
            </div>
            <div className="flex items-center gap-4">
              <TrafficLight estado={data?.semaforo_ambiental || 'rojo'} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-extrabold leading-snug ${sm.badge}`}>{sm.heading}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-snug">{sm.sub}</p>
                <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mt-3">
                  {data?.practicas_mes ?? 0} práctica{(data?.practicas_mes ?? 0) !== 1 ? 's' : ''} este mes
                </p>
              </div>
            </div>
          </div>

          {/* Costos del mes */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-blue-500 dark:text-blue-400" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Costo acumulado</p>
              </div>
              <Link to="/trazabilidad" className="text-[10px] text-blue-500 dark:text-blue-400 font-semibold hover:underline">Ver detalle</Link>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-gray-50 tabular-nums mt-3 mb-4">
              S/&nbsp;{(data?.costo_total_mes ?? 0).toFixed(2)}
            </p>
            {data?.costos_por_concepto?.length > 0 ? (
              <div className="space-y-3">
                {data.costos_por_concepto.map((c, i) => (
                  <CostoBar key={i} label={c.concepto} value={c.total} total={costoTotal} barClass={BAR_COLORS[i % BAR_COLORS.length]} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500 italic">Sin costos este mes</p>
            )}
          </div>

          {/* Accesos rápidos — sin fondos de burbuja */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-50 dark:border-gray-800/80">
              <Activity size={14} className="text-gray-400 dark:text-gray-500" />
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Acciones rápidas</h3>
            </div>
            <div className="p-2 space-y-0.5">
              {QUICK.map(({ to, icon: Icon, label, hov }) => (
                <Link
                  key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors duration-150 group"
                >
                  <Icon size={15} className={`text-gray-350 dark:text-gray-600 transition-colors duration-150 shrink-0 ${hov}`} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors flex-1">{label}</span>
                  <ArrowRight size={11} className="text-gray-200 dark:text-gray-700 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all duration-150" />
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
