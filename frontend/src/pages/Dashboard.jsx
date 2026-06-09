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
    const doc  = new jsPDF()
    const W    = 210
    const MAR  = 14
    const BODY = W - MAR * 2

    // ── Paleta ────────────────────────────────────────────────────
    const C = {
      green:     [21,  128,  61],
      greenLight:[220, 252, 231],
      navy:      [30,   58, 138],
      navyLight: [219, 234, 254],
      purple:    [109,  40, 217],
      purpleLight:[237,233,254],
      amber:     [180,  83,   9],
      amberLight:[254, 243, 199],
      red:       [185,  28,  28],
      redLight:  [254, 226, 226],
      dark:      [17,   24,  39],
      gray:      [107, 114, 128],
      grayLight: [243, 244, 246],
      white:     [255, 255, 255],
    }

    const fecha = new Date().toLocaleDateString('es-PE', { year:'numeric', month:'long', day:'numeric' })
    let curY = 0

    // ── Helpers ────────────────────────────────────────────────────
    const newPage = () => { doc.addPage(); curY = 20 }

    const checkBreak = (needed = 35) => {
      if (curY + needed > 278) newPage()
    }

    const sectionHeader = (num, title, color) => {
      checkBreak(14)
      doc.setFillColor(...color)
      doc.roundedRect(MAR, curY, BODY, 8, 1, 1, 'F')
      doc.setTextColor(...C.white)
      doc.setFontSize(8.5)
      doc.setFont('helvetica', 'bold')
      doc.text(`${num}.  ${title}`, MAR + 4, curY + 5.5)
      doc.setTextColor(...C.dark)
      curY += 12
    }

    const emptyMsg = (msg) => {
      doc.setFontSize(8)
      doc.setFont('helvetica', 'italic')
      doc.setTextColor(...C.gray)
      doc.text(msg, MAR + 3, curY + 5)
      doc.setTextColor(...C.dark)
      curY += 12
    }

    const table = (head, body, headColor, opts = {}) => {
      checkBreak(20)
      autoTable(doc, {
        startY: curY,
        head: [head],
        body,
        headStyles: { fillColor: headColor, fontSize: 8, fontStyle: 'bold', textColor: C.white, cellPadding: 3 },
        bodyStyles: { fontSize: 8, cellPadding: 3, textColor: C.dark },
        alternateRowStyles: { fillColor: C.grayLight },
        tableLineColor: [229, 231, 235],
        tableLineWidth: 0.1,
        margin: { left: MAR, right: MAR },
        ...opts,
      })
      curY = doc.lastAutoTable.finalY + 8
    }

    // ══════════════════════════════════════════════════════════════
    // PORTADA / ENCABEZADO
    // ══════════════════════════════════════════════════════════════
    doc.setFillColor(...C.green)
    doc.rect(0, 0, W, 42, 'F')

    // Franja decorativa inferior del header
    doc.setFillColor(16, 100, 47)
    doc.rect(0, 36, W, 6, 'F')

    doc.setTextColor(...C.white)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('REPORTE DE GESTIÓN AGROECOLÓGICA', MAR, 16)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('BioHuerto USAT  ·  Chiclayo, Lambayeque — Perú', MAR, 24)

    doc.setFontSize(8.5)
    doc.text(`Productor: ${user?.first_name ?? ''} ${user?.last_name ?? ''}`, MAR, 31)
    doc.text(`Fecha de generación: ${fecha}`, MAR + 100, 31)

    doc.setTextColor(...C.dark)
    curY = 52

    // ── Tarjetas de métricas (2×3) ────────────────────────────────
    const metricas = [
      { label: 'Biohuertos',        value: data.total_biohuertos ?? 0,                   color: C.green  },
      { label: 'Cultivos activos',  value: data.cultivos_activos ?? 0,                   color: C.navy   },
      { label: 'Alertas pendientes',value: data.alertas_pendientes ?? 0,                 color: C.amber  },
      { label: 'Cosechas activas',  value: data.cosechas_activas ?? 0,                   color: C.green  },
      { label: 'Costo del mes',     value: `S/ ${(data.costo_total_mes ?? 0).toFixed(2)}`,color: C.navy  },
      { label: 'Semáforo ambiental',value: (data.semaforo_ambiental ?? 'rojo').toUpperCase(), color: data.semaforo_ambiental === 'verde' ? C.green : data.semaforo_ambiental === 'amarillo' ? C.amber : C.red },
    ]
    const cardW = (BODY - 8) / 3
    const cardH = 18
    metricas.forEach((m, i) => {
      const col = i % 3
      const row = Math.floor(i / 3)
      const x = MAR + col * (cardW + 4)
      const y = curY + row * (cardH + 4)
      doc.setFillColor(...C.grayLight)
      doc.roundedRect(x, y, cardW, cardH, 2, 2, 'F')
      doc.setFillColor(...m.color)
      doc.roundedRect(x, y, 3, cardH, 1, 1, 'F')
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...m.color)
      doc.text(String(m.value), x + 7, y + 10)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.gray)
      doc.text(m.label, x + 7, y + 15)
    })
    doc.setTextColor(...C.dark)
    curY += 2 * (cardH + 4) + 10

    // Línea separadora
    doc.setDrawColor(...C.grayLight)
    doc.setLineWidth(0.5)
    doc.line(MAR, curY, W - MAR, curY)
    curY += 8

    // ══════════════════════════════════════════════════════════════
    // SECCIÓN 1 — Próximas cosechas
    // ══════════════════════════════════════════════════════════════
    sectionHeader(1, 'Próximas cosechas — próximos 7 días', C.green)
    if (data.proximas_cosechas?.length) {
      table(
        ['Cultivo', 'Biohuerto', 'Fecha estimada de cosecha'],
        data.proximas_cosechas.map(c => [c.nombre, c['biohuerto__nombre'], c.fecha_estimada_cosecha]),
        C.green,
        { columnStyles: { 2: { halign: 'center' } } }
      )
    } else { emptyMsg('No hay cosechas programadas en los próximos 7 días.') }

    // ══════════════════════════════════════════════════════════════
    // SECCIÓN 2 — Costos por concepto
    // ══════════════════════════════════════════════════════════════
    sectionHeader(2, 'Costos de producción por concepto — mes actual', C.navy)
    if (data.costos_por_concepto?.length) {
      const totalMes = data.costos_por_concepto.reduce((s, c) => s + c.total, 0)
      table(
        ['Concepto', 'Monto (S/)', '% del total'],
        data.costos_por_concepto.map(c => [
          c.concepto,
          c.total.toFixed(2),
          `${((c.total / totalMes) * 100).toFixed(1)} %`,
        ]),
        C.navy,
        { columnStyles: { 1: { halign: 'right' }, 2: { halign: 'center' } } }
      )
    } else { emptyMsg('No se registraron costos este mes.') }

    // ══════════════════════════════════════════════════════════════
    // SECCIÓN 3 — Prácticas sostenibles
    // ══════════════════════════════════════════════════════════════
    sectionHeader(3, 'Prácticas sostenibles registradas — mes actual', C.purple)
    if (data.practicas_detalle?.length) {
      const PLABELS = {
        compost:'Uso de compost', biol:'Uso de biol', sin_agroquimicos:'Sin agroquímicos',
        riego_eficiente:'Riego eficiente', mulching:'Mulching',
        control_biologico:'Control biológico', otro:'Otro',
      }
      table(
        ['Práctica sostenible', 'Cultivo', 'Fecha'],
        data.practicas_detalle.map(p => [PLABELS[p.tipo] ?? p.tipo, p['cultivo__nombre'], p.fecha]),
        C.purple,
        { columnStyles: { 2: { halign: 'center' } } }
      )
    } else { emptyMsg('No se registraron prácticas sostenibles este mes.') }

    // ══════════════════════════════════════════════════════════════
    // SECCIÓN 4 — Diagnósticos fitosanitarios
    // ══════════════════════════════════════════════════════════════
    sectionHeader(4, 'Últimos diagnósticos fitosanitarios', C.red)
    if (data.ultimos_diagnosticos?.length) {
      const SEV_LABEL = { leve:'Leve', moderado:'Moderado', grave:'Grave' }
      table(
        ['Diagnóstico probable', 'Cultivo', 'Severidad', 'Fecha'],
        data.ultimos_diagnosticos.map(d => [
          d.diagnostico_probable,
          d['cultivo__nombre'],
          SEV_LABEL[d.severidad] ?? 'Moderado',
          d.fecha,
        ]),
        C.red,
        { columnStyles: { 2: { halign: 'center' }, 3: { halign: 'center' } } }
      )
    } else { emptyMsg('No hay diagnósticos registrados.') }

    // ══════════════════════════════════════════════════════════════
    // PIE DE PÁGINA en todas las páginas
    // ══════════════════════════════════════════════════════════════
    const total = doc.getNumberOfPages()
    for (let i = 1; i <= total; i++) {
      doc.setPage(i)
      doc.setFillColor(...C.grayLight)
      doc.rect(0, 284, W, 13, 'F')
      doc.setFontSize(7.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...C.gray)
      doc.text('BioHuerto USAT  ·  Gestión Agroecológica Urbana  ·  Lambayeque, Perú', MAR, 291)
      doc.text(`Página ${i} de ${total}`, W - MAR, 291, { align: 'right' })
    }

    doc.save(`reporte-biohuerto-${new Date().toISOString().split('T')[0]}.pdf`)
    toast.success('Reporte PDF generado.')
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
