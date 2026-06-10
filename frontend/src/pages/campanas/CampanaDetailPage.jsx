import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  CalendarRange, Calendar, ClipboardList, FlaskConical, Droplets,
  Wallet, Leaf, Plus, Pencil, Trash2, X, CheckCircle2, Circle,
  AlertTriangle, Printer, TrendingUp, TrendingDown, Minus, Eye, ChevronDown, ArrowLeft,
  Bell, BellRing, RefreshCw, ShieldAlert, Droplet, Sprout, Scissors, RotateCcw, Wrench, Play,
} from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.07)', hoverRow: 'rgba(255,255,255,0.04)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
  btnIdle: 'rgba(255,255,255,0.07)', btnBorder: 'rgba(255,255,255,0.12)',
}

const ETAPAS = [
  { key: 'preparacion', label: 'Preparación', dc: '#94a3b8', lc: '#64748b', dbg: 'rgba(148,163,184,0.15)', lbg: '#f8fafc' },
  { key: 'germinacion', label: 'Germinación', dc: '#fbbf24', lc: '#d97706', dbg: 'rgba(251,191,36,0.15)',  lbg: '#fffbeb' },
  { key: 'crecimiento', label: 'Crecimiento', dc: '#4ade80', lc: '#15803d', dbg: 'rgba(74,222,128,0.15)', lbg: '#f0fdf4' },
  { key: 'establecido', label: 'Establecido', dc: '#60a5fa', lc: '#2563eb', dbg: 'rgba(96,165,250,0.15)', lbg: '#eff6ff' },
  { key: 'poda',        label: 'Poda',        dc: '#c084fc', lc: '#7c3aed', dbg: 'rgba(192,132,252,0.15)',lbg: '#f5f3ff' },
  { key: 'brotacion',   label: 'Brotación',   dc: '#34d399', lc: '#059669', dbg: 'rgba(52,211,153,0.15)', lbg: '#ecfdf5' },
  { key: 'floracion',   label: 'Floración',   dc: '#f9a8d4', lc: '#db2777', dbg: 'rgba(249,168,212,0.15)',lbg: '#fdf2f8' },
  { key: 'cosecha',     label: 'Cosecha',     dc: '#fb923c', lc: '#ea580c', dbg: 'rgba(251,146,60,0.15)', lbg: '#fff7ed' },
]
const ETAPAS_POR_CICLO = {
  anual:           ['preparacion', 'germinacion', 'crecimiento', 'floracion', 'cosecha'],
  perenne:         ['preparacion', 'establecido', 'poda', 'brotacion', 'floracion', 'cosecha'],
  establecimiento: ['preparacion', 'germinacion', 'crecimiento', 'establecido', 'cosecha'],
  produccion:      ['poda', 'brotacion', 'floracion', 'cosecha'],
}
const etapasPorCiclo = tipoCiclo =>
  ETAPAS.filter(e => (ETAPAS_POR_CICLO[tipoCiclo] ?? ETAPAS.map(x => x.key)).includes(e.key))
const etapaOf = key => ETAPAS.find(e => e.key === key) || { label: 'General', dc: '#94a3b8', lc: '#6b7280', dbg: 'rgba(148,163,184,0.10)', lbg: '#f9fafb' }

// Devuelve mensaje de error si hay etapas anteriores con ítems pendientes, null si está despejado
const checkEtapaOrder = (items, targetEtapa, isDoneFn) => {
  if (!targetEtapa) return null
  const order = ETAPAS.map(e => e.key)
  const targetIdx = order.indexOf(targetEtapa)
  if (targetIdx <= 0) return null
  for (let i = 0; i < targetIdx; i++) {
    const key     = order[i]
    const pending = items.filter(item => item.etapa === key && !isDoneFn(item))
    if (pending.length > 0) {
      const etapa = etapaOf(key)
      return `Hay ${pending.length} ${pending.length === 1 ? 'tarea pendiente' : 'tareas pendientes'} en "${etapa.label}". Completa esa etapa primero.`
    }
  }
  return null
}
const groupByEtapa = items => {
  const order = ETAPAS.map(e => e.key)
  const groups = {}
  items.forEach(i => { const k = i.etapa || ''; if (!groups[k]) groups[k] = []; groups[k].push(i) })
  return Object.entries(groups).sort(([a],[b]) => {
    const ia = order.indexOf(a), ib = order.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

const ESTADO_COLOR = {
  planificada: { dark: { bg: 'rgba(59,130,246,0.15)', c: '#60a5fa' }, light: { bg: '#dbeafe', c: '#1d4ed8' } },
  activa:      { dark: { bg: 'rgba(22,163,74,0.15)',  c: '#4ade80' }, light: { bg: '#dcfce7', c: '#15803d' } },
  cerrada:     { dark: { bg: 'rgba(255,255,255,0.08)', c: '#94a3b8' }, light: { bg: '#f3f4f6', c: '#6b7280' } },
  cancelada:   { dark: { bg: 'rgba(239,68,68,0.15)',  c: '#f87171' }, light: { bg: '#fee2e2', c: '#dc2626' } },
}

// Posición relativa de cada etapa dentro del ciclo (0 = inicio, 1 = fin)
const ETAPA_RATIO = {
  preparacion: 0.00,
  germinacion: 0.05,
  crecimiento: 0.22,
  establecido: 0.12,
  poda:        0.28,
  brotacion:   0.42,
  floracion:   0.62,
  cosecha:     0.84,
}

const sugerirFecha = (etapa, fechaInicio, diasCiclo) => {
  if (!etapa || !fechaInicio || !diasCiclo) return ''
  const ratio = ETAPA_RATIO[etapa] ?? 0
  const d = new Date(fechaInicio)
  d.setDate(d.getDate() + Math.round(ratio * diasCiclo))
  return d.toISOString().slice(0, 10)
}

/* ── helpers ── */
const fmt = n => `S/. ${parseFloat(n || 0).toFixed(2)}`
// Convierte dosis acumulada a la unidad de precio: mL→L y g→kg dividen por 1000
const fitoCostFactor = u => { const s = (u || '').toLowerCase(); return (s.startsWith('ml') || s.startsWith('cc') || s.startsWith('g/') || s === 'g') ? 0.001 : 1 }
const ist_ = dark => ({
  backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
  color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none',
})
const lst_ = dark => ({ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' })

/* ── Generic mini modal ── */
function ConfirmModal({ dark, message = '¿Eliminar este registro?', onConfirm, onCancel }) {
  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>Confirmar eliminación</h3>
          <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{message}</p>
          <div className="flex gap-3 w-full pt-1">
            <button onClick={onCancel} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 btn-danger text-sm">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniModal({ dark, title, onClose, onSubmit, loading, children }) {
  const ps = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl z-10 flex flex-col" style={{ ...ps, maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <h3 className="text-sm font-extrabold" style={{ color: dark ? D.text : '#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ color: D.sub }}><X size={16} /></button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col min-h-0" style={{ flex: 1 }}>
          <div className="overflow-y-auto thin-scroll px-5 pb-4 space-y-3" style={{ flex: 1 }}>{children}</div>
          <div className="flex gap-2 px-5 py-3 shrink-0" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}` }}>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal detalle (solo lectura) ── */
function InfoModal({ dark, title, onClose, children }) {
  const ps = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-5 z-10" style={ps}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-extrabold" style={{ color: dark ? D.text : '#111827' }}>{title}</h3>
          <button onClick={onClose} style={{ color: D.sub }}><X size={16} /></button>
        </div>
        <div className="space-y-0">{children}</div>
      </div>
    </div>
  )
}
function IR({ label, value, dark, color }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="flex justify-between items-start gap-4 py-2" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}` }}>
      <span className="text-xs font-bold shrink-0" style={{ color: dark ? D.sub : '#9ca3af' }}>{label}</span>
      <span className="text-xs font-semibold text-right" style={{ color: color || (dark ? D.text : '#374151') }}>{value}</span>
    </div>
  )
}

/* ── TABS ── */
const TABS = [
  { key: 'labores',       icon: ClipboardList, label: 'Labores'      },
  { key: 'fitosanitario', icon: FlaskConical,  label: 'Fitosanitario' },
  { key: 'riego',         icon: Droplets,      label: 'Riego & Fertirrigación' },
  { key: 'presupuesto',   icon: Wallet,        label: 'Presupuesto'  },
  { key: 'trazabilidad',  icon: Leaf,          label: 'Trazabilidad' },
  { key: 'alertas',       icon: Bell,          label: 'Alertas'      },
  { key: 'diagnosticos',  icon: ShieldAlert,   label: 'Diagnósticos' },
]

function OperarioSelect({ dark, value, onChange, miembros, ist }) {
  const [open, setOpen] = useState(false)
  const [q, setQ]       = useState('')
  const ref             = useRef(null)

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const filtered = miembros.filter(m =>
    !q || `${m.usuario_nombre} ${m.usuario_username}`.toLowerCase().includes(q.toLowerCase())
  )

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => { setOpen(o => !o); setQ('') }}
        className="w-full flex items-center justify-between gap-2"
        style={{ ...ist, padding: '9px 13px', textAlign: 'left', cursor: 'pointer' }}>
        <span style={{ color: value ? (dark ? 'rgba(255,255,255,0.90)' : '#111827') : (dark ? 'rgba(255,255,255,0.30)' : '#9ca3af') }}>
          {value || 'Sin asignar (opcional)'}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <span onClick={e => { e.stopPropagation(); onChange('') }} style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#9ca3af', cursor: 'pointer', lineHeight: 1 }}>
              <X size={12} />
            </span>
          )}
          <ChevronDown size={13} style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#9ca3af' }} />
        </div>
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-xl shadow-2xl overflow-hidden"
          style={{ backgroundColor: dark ? '#1e2a3a' : '#fff', border: `1.5px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}` }}>
          {miembros.length > 3 && (
            <div style={{ padding: '8px', borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar operario..."
                style={{ width: '100%', padding: '6px 10px', fontSize: '13px', borderRadius: '8px', outline: 'none',
                  backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
                  color: dark ? D.text : '#374151' }} />
            </div>
          )}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            <button type="button" onClick={() => { onChange(''); setOpen(false) }}
              className="w-full text-left px-3 py-2.5 text-xs font-semibold transition-colors"
              style={{ color: dark ? D.sub : '#9ca3af', borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              Sin asignar
            </button>
            {filtered.map(m => (
              <button type="button" key={m.id} onClick={() => { onChange(m.usuario_nombre); setOpen(false) }}
                className="w-full text-left px-3 py-2.5 transition-colors"
                style={{ backgroundColor: value === m.usuario_nombre ? (dark ? 'rgba(96,165,250,0.10)' : '#eff6ff') : 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = value === m.usuario_nombre ? (dark ? 'rgba(96,165,250,0.10)' : '#eff6ff') : 'transparent'}>
                <p style={{ fontSize: '13px', fontWeight: 600, color: dark ? D.text : '#111827' }}>{m.usuario_nombre}</p>
                <p style={{ fontSize: '11px', color: dark ? D.sub : '#9ca3af' }}>@{m.usuario_username} · {m.rol_display}</p>
              </button>
            ))}
            {miembros.length === 0 && (
              <p style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: dark ? D.sub : '#9ca3af' }}>
                Sin miembros en este biohuerto
              </p>
            )}
            {miembros.length > 0 && filtered.length === 0 && (
              <p style={{ padding: '12px', textAlign: 'center', fontSize: '13px', color: dark ? D.sub : '#9ca3af' }}>Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: LABORES
══════════════════════════════════════════════════════ */
function LaboresTab({ dark, campanaId, etapaFilter, etapasValidas, campana, onRefreshCampana }) {
  const [data, setData]             = useState([])
  const [tipos, setTipos]           = useState([])
  const [modal, setModal]           = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)
  const [ejModal, setEjModal]       = useState(null)
  const [ejForm, setEjForm]         = useState({ fecha_ejecutada: '', cantidad_ejecutada: '', operario: '' })
  const [viewItem, setViewItem]     = useState(null)
  const [form, setForm]             = useState({ tipo_labor: '', nombre_libre: '', unidad_libre: '', descripcion: '', fecha_programada: '', cantidad_programada: '', costo_unitario: '', operario: '', notas: '' })
  const [loading, setLoading]       = useState(false)
  const [miembros, setMiembros]     = useState([])

  const fetch = useCallback(async () => {
    const [r, t] = await Promise.all([api.get(`/campanas/${campanaId}/labores/`), api.get('/campanas/tipos-labor/')])
    setData(r.data); setTipos(t.data)
  }, [campanaId])
  const refresh = useCallback(() => { fetch(); onRefreshCampana?.() }, [fetch, onRefreshCampana])
  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (campana?.biohuerto) {
      api.get(`/biohuertos/${campana.biohuerto}/miembros/`).then(r => setMiembros(r.data)).catch(() => {})
    }
  }, [campana?.biohuerto])

  const openNew = () => { setForm({ tipo_labor: '', nombre_libre: '', unidad_libre: '', descripcion: '', fecha_programada: '', cantidad_programada: '', costo_unitario: '', etapa: '', operario: '', notas: '' }); setModal('new') }
  const openEdit = item => { setForm({ ...item, tipo_labor: item.tipo_labor }); setModal('edit') }
  const h = e => {
    const { name, value } = e.target
    setForm(f => {
      const next = { ...f, [name]: value }
      if (name === 'etapa' && !f.fecha_programada && modal === 'new') {
        const sugerida = sugerirFecha(value, campana?.fecha_inicio, campana?.variedad_dias_ciclo)
        if (sugerida) next.fecha_programada = sugerida
      }
      return next
    })
  }

  const handleTipoChange = e => {
    const t = tipos.find(t => String(t.id) === e.target.value)
    setForm(f => ({ ...f, tipo_labor: e.target.value, costo_unitario: t ? t.costo_unitario_default : f.costo_unitario }))
  }

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      let tipoId = form.tipo_labor
      if (form.tipo_labor === '__libre__') {
        const res = await api.post('/campanas/tipos-labor/', {
          nombre: form.nombre_libre, tipo: 'otro',
          unidad_default: form.unidad_libre || 'unid.',
          costo_unitario_default: form.costo_unitario || 0,
        })
        tipoId = res.data.id
        setTipos(ts => [...ts, res.data])
      }
      const payload = { ...form, tipo_labor: tipoId }
      if (modal === 'edit') { await api.patch(`/campanas/labores/${form.id}/`, payload); toast.success('Labor actualizada.') }
      else { await api.post(`/campanas/${campanaId}/labores/`, payload); toast.success('Labor registrada.') }
      setModal(null); refresh()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const openEjModal = item => {
    if (item.estado === 'ejecutada') {
      api.patch(`/campanas/labores/${item.id}/`, { estado: 'programada', fecha_ejecutada: null, cantidad_ejecutada: null })
        .then(refresh).catch(() => toast.error('Error.'))
      return
    }
    const blocker = checkEtapaOrder(data, item.etapa, i => i.estado === 'ejecutada')
    if (blocker) { toast.error(blocker); return }
    setEjForm({ fecha_ejecutada: new Date().toISOString().slice(0, 10), cantidad_ejecutada: item.cantidad_programada, operario: item.operario || '' })
    setEjModal(item)
  }

  const confirmEjecucion = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.patch(`/campanas/labores/${ejModal.id}/`, { estado: 'ejecutada', ...ejForm })
      toast.success('Labor marcada como ejecutada.'); setEjModal(null); refresh()
    } catch { toast.error('Error.') } finally { setLoading(false) }
  }

  const del = item => setDelConfirm({ fn: async () => { await api.delete(`/campanas/labores/${item.id}/`); refresh() }, msg: `¿Eliminar la labor "${item.tipo_labor_nombre}"?` })

  const toggleSostenibleLabor = async item => {
    try {
      const res = await api.patch(`/campanas/labores/${item.id}/`, { es_sostenible: !item.es_sostenible })
      setData(prev => prev.map(x => x.id === item.id ? { ...x, es_sostenible: res.data.es_sostenible } : x))
    } catch { toast.error('Error al actualizar.') }
  }

  const etapaOrder = useMemo(() => ETAPAS.map(e => e.key), [])

  const etapaActual = useMemo(() => {
    const pendientes = data.filter(l => l.estado === 'programada' && l.etapa)
    if (!pendientes.length) return null
    return pendientes.reduce((prev, curr) => {
      const ip = etapaOrder.indexOf(prev.etapa), ic = etapaOrder.indexOf(curr.etapa)
      return ic < ip ? curr : prev
    }).etapa
  }, [data, etapaOrder])

  const progreso = useMemo(() => {
    const map = {}
    data.forEach(l => {
      if (!l.etapa) return
      if (!map[l.etapa]) map[l.etapa] = { total: 0, ej: 0 }
      map[l.etapa].total++
      if (l.estado === 'ejecutada') map[l.etapa].ej++
    })
    return map
  }, [data])

  const ist = ist_(dark); const lst = lst_(dark)
  const total_prog = data.reduce((s, l) => s + (l.costo_programado || 0), 0)
  const total_ej   = data.filter(l => l.estado === 'ejecutada').reduce((s, l) => s + (l.costo_ejecutado || 0), 0)

  return (
    <div className="space-y-4">
      {/* Etapa actual + progreso */}
      {etapaActual && (() => {
        const et = etapaOf(etapaActual)
        return (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl flex-wrap"
            style={{ backgroundColor: dark ? et.dbg : et.lbg, border: `1.5px solid ${dark ? et.dc : et.lc}20` }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: dark ? et.dc : et.lc }} />
              <span className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? et.dc : et.lc }}>
                Etapa actual: {et.label}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap ml-2">
              {(etapasValidas ?? ETAPAS).filter(e => progreso[e.key]).map(e => {
                const p = progreso[e.key] || { total: 0, ej: 0 }
                const done = p.ej === p.total
                const isCurrent = e.key === etapaActual
                return (
                  <span key={e.key} className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: done ? (dark ? 'rgba(22,163,74,0.2)' : '#dcfce7') : isCurrent ? (dark ? e.dbg : e.lbg) : (dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'),
                      color: done ? (dark ? '#4ade80' : '#15803d') : isCurrent ? (dark ? e.dc : e.lc) : (dark ? D.sub : '#9ca3af'),
                      border: `1px solid ${done ? (dark ? 'rgba(22,163,74,0.3)' : '#bbf7d0') : isCurrent ? (dark ? e.dc : e.lc) : 'transparent'}`,
                    }}>
                    {e.label} {p.ej}/{p.total}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs">
          <span style={{ color: dark ? D.sub : '#6b7280' }}>Presupuestado: <strong style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(total_prog)}</strong></span>
          <span style={{ color: dark ? D.sub : '#6b7280' }}>Ejecutado: <strong style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(total_ej)}</strong></span>
        </div>
        {campana?.estado !== 'cerrada' && (
          <button onClick={openNew} className="flex items-center gap-1.5 btn-primary text-sm"><Plus size={13} /> Agregar</button>
        )}
      </div>

      <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              {['', 'Labor', 'Fecha prog.', 'Cant. prog.', 'Cant. real', 'Costo', 'Estado', ''].map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${i === 7 ? 'text-right' : ''}`}
                  style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const etapaOrder = ETAPAS.map(e => e.key)
              const visible = (etapaFilter ? data.filter(l => l.etapa === etapaFilter) : data)
                .slice().sort((a, b) => {
                  const ia = etapaOrder.indexOf(a.etapa || ''), ib = etapaOrder.indexOf(b.etapa || '')
                  const ea = ia === -1 ? 999 : ia, eb = ib === -1 ? 999 : ib
                  if (ea !== eb) return ea - eb
                  return (a.fecha_programada || '').localeCompare(b.fecha_programada || '')
                })
              if (visible.length === 0)
                return <tr><td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin labores{etapaFilter ? ' en esta etapa' : ' registradas'}</td></tr>
              return visible.map(l => {
                const et = etapaOf(l.etapa)
                const ec = dark ? et.dc : et.lc
                const ebg = dark ? et.dbg : et.lbg
                return (
                  <tr key={l.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => campana?.estado !== 'cerrada' && openEjModal(l)}
                        title={campana?.estado === 'cerrada' ? 'Campaña cerrada' : l.estado === 'ejecutada' ? 'Revertir a pendiente' : 'Marcar ejecutada'}
                        style={{ opacity: campana?.estado === 'cerrada' ? 0.3 : 1, cursor: campana?.estado === 'cerrada' ? 'not-allowed' : 'pointer' }}>
                        {l.estado === 'ejecutada'
                          ? <CheckCircle2 size={18} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
                          : <Circle size={18} style={{ color: dark ? D.sub : '#d1d5db' }} />}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold" style={{ color: dark ? D.text : '#111827', textDecoration: l.estado === 'ejecutada' ? 'line-through' : 'none', opacity: l.estado === 'ejecutada' ? 0.6 : 1 }}>
                          {l.tipo_labor_nombre}
                        </p>
                        {l.etapa && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                            style={{ backgroundColor: ebg, color: ec }}>{et.label}</span>
                        )}
                        {l.es_sostenible && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>
                            sostenible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{l.fecha_programada}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: dark ? D.text : '#374151' }}>{l.cantidad_programada} {l.tipo_labor_unidad}</td>
                    <td className="px-4 py-3 text-sm">
                      {l.estado === 'ejecutada'
                        ? <span className="font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{l.cantidad_ejecutada} {l.tipo_labor_unidad}</span>
                        : <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                      {l.estado === 'ejecutada' ? fmt(l.costo_ejecutado) : fmt(l.costo_programado)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={l.estado === 'ejecutada'
                          ? { backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }
                          : { backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>
                        {l.estado_display}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleSostenibleLabor(l)}
                          title={l.es_sostenible ? 'Quitar sostenible' : 'Marcar como sostenible'}
                          className="p-1.5 rounded-lg transition-all"
                          style={{
                            backgroundColor: l.es_sostenible ? (dark ? 'rgba(22,163,74,0.15)' : '#dcfce7') : 'transparent',
                            color: l.es_sostenible ? (dark ? '#4ade80' : '#16a34a') : (dark ? D.sub : '#d1d5db'),
                          }}
                          onMouseEnter={e => { if (!l.es_sostenible) e.currentTarget.style.backgroundColor = dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4' }}
                          onMouseLeave={e => { if (!l.es_sostenible) e.currentTarget.style.backgroundColor = 'transparent' }}>
                          <Leaf size={14} />
                        </button>
                        <button onClick={() => setViewItem(l)} className="p-1.5 rounded-lg" style={{ color: dark ? D.sub : '#9ca3af' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Eye size={13} /></button>
                        {campana?.estado !== 'cerrada' && <>
                          <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={13} /></button>
                          <button onClick={() => del(l)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={13} /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                )
              })
            })()}
          </tbody>
        </table>
      </div>

      {modal && (
        <MiniModal dark={dark} title={modal === 'edit' ? 'Editar labor' : 'Agregar labor'} onClose={() => setModal(null)} onSubmit={submit} loading={loading}>
          <div><label style={lst}>Tipo de labor *</label>
            <select name="tipo_labor" value={form.tipo_labor} onChange={handleTipoChange} style={ist} required>
              <option value="">Selecciona</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.codigo} — {t.nombre}</option>)}
              <option value="__libre__">— Escribir labor nueva —</option>
            </select>
          </div>
          {form.tipo_labor === '__libre__' && (
            <div className="rounded-xl px-3 py-2.5 space-y-3"
              style={{ backgroundColor: dark ? 'rgba(251,191,36,0.06)' : '#fffbeb', border: `1px solid ${dark ? 'rgba(251,191,36,0.20)' : '#fde68a'}` }}>
              <p className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: dark ? '#fbbf24' : '#d97706' }}>Nueva labor personalizada</p>
              <div><label style={lst}>Nombre de la labor *</label>
                <input name="nombre_libre" value={form.nombre_libre} onChange={h} style={ist} placeholder="Ej: Instalación cinta de goteo" required={form.tipo_labor === '__libre__'} />
              </div>
              <div><label style={lst}>Unidad</label>
                <input name="unidad_libre" value={form.unidad_libre} onChange={h} style={ist} placeholder="jornal, hora, m, unid." list="unidades-labor-libre" />
                <datalist id="unidades-labor-libre">
                  {['hora','jornal','día','m²','ha','m','kg','L','unid.'].map(u => <option key={u} value={u} />)}
                </datalist>
              </div>
            </div>
          )}
          <div><label style={lst}>Etapa fenológica</label>
            <select name="etapa" value={form.etapa} onChange={h} style={ist}>
              <option value="">Sin etapa</option>
              {(etapasValidas ?? ETAPAS).map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </div>
          <div><label style={lst}>Descripción adicional</label><input name="descripcion" value={form.descripcion} onChange={h} style={ist} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label style={lst}>Fecha programada *</label>
                {modal === 'new' && form.etapa && form.fecha_programada && campana?.variedad_dias_ciclo && (
                  <span className="text-[11px] font-bold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>sugerida</span>
                )}
              </div>
              <input name="fecha_programada" type="date" value={form.fecha_programada} onChange={h} style={ist} required />
            </div>
            <div>
              <label style={lst}>Cantidad *</label>
              <div className="flex items-center gap-2">
                <input name="cantidad_programada" type="number" step="0.01" value={form.cantidad_programada} onChange={h} style={{ ...ist, flex: 1 }} required />
                {tipos.find(t => String(t.id) === String(form.tipo_labor))?.unidad_default && (
                  <span className="text-xs font-extrabold px-2 py-1 rounded-lg shrink-0"
                    style={{ backgroundColor: dark ? 'rgba(96,165,250,0.12)' : '#eff6ff', color: dark ? '#60a5fa' : '#2563eb' }}>
                    {tipos.find(t => String(t.id) === String(form.tipo_labor)).unidad_default}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={lst}>
                Costo por {tipos.find(t => String(t.id) === String(form.tipo_labor))?.unidad_default ?? 'unidad'} (S/.)
              </label>
              <input name="costo_unitario" type="number" step="0.01" value={form.costo_unitario} onChange={h} style={ist} />
            </div>
            <div>
              <label style={lst}>Operario</label>
              <OperarioSelect dark={dark} value={form.operario} ist={ist}
                onChange={v => setForm(f => ({ ...f, operario: v }))}
                miembros={miembros} />
            </div>
          </div>
          <div><label style={lst}>Notas</label><textarea name="notas" value={form.notas} onChange={h} rows={2} style={{ ...ist, resize: 'none' }} /></div>
        </MiniModal>
      )}
      {/* Modal de ejecución */}
      {ejModal && (
        <MiniModal dark={dark} title={`Ejecutar: ${ejModal.tipo_labor_nombre}`} onClose={() => setEjModal(null)} onSubmit={confirmEjecucion} loading={loading}>
          <p className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
            Confirma la fecha y cantidad real de ejecución. Por defecto se sugiere hoy y la cantidad programada.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={lst}>Fecha ejecutada *</label>
              <input type="date" value={ejForm.fecha_ejecutada}
                onChange={e => setEjForm(f => ({ ...f, fecha_ejecutada: e.target.value }))} style={ist} required />
            </div>
            <div>
              <label style={lst}>Cantidad real ({ejModal.tipo_labor_unidad}) *</label>
              <input type="number" step="0.01" value={ejForm.cantidad_ejecutada}
                onChange={e => setEjForm(f => ({ ...f, cantidad_ejecutada: e.target.value }))} style={ist} required />
            </div>
          </div>
          <div>
            <label style={lst}>Operario</label>
            <OperarioSelect dark={dark} value={ejForm.operario} ist={ist} onChange={v => setEjForm(f => ({ ...f, operario: v }))} miembros={miembros} />
          </div>
          <p className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9ca3af' }}>
            Programado: {ejModal.cantidad_programada} {ejModal.tipo_labor_unidad} · {ejModal.fecha_programada}
          </p>
        </MiniModal>
      )}
      {viewItem && (
        <InfoModal dark={dark} title="Detalle de labor" onClose={() => setViewItem(null)}>
          <IR dark={dark} label="Labor"           value={viewItem.tipo_labor_nombre} />
          <IR dark={dark} label="Etapa"           value={etapaOf(viewItem.etapa)?.label} />
          <IR dark={dark} label="Descripción"     value={viewItem.descripcion} />
          <IR dark={dark} label="Fecha programada" value={viewItem.fecha_programada} />
          <IR dark={dark} label="Cantidad prog."  value={`${viewItem.cantidad_programada} ${viewItem.tipo_labor_unidad}`} />
          <IR dark={dark} label="Costo prog."     value={fmt(viewItem.costo_programado)} color={dark ? '#60a5fa' : '#2563eb'} />
          <IR dark={dark} label="Fecha ejecutada" value={viewItem.fecha_ejecutada} />
          <IR dark={dark} label="Cantidad real"   value={viewItem.cantidad_ejecutada ? `${viewItem.cantidad_ejecutada} ${viewItem.tipo_labor_unidad}` : null} color={dark ? '#4ade80' : '#15803d'} />
          <IR dark={dark} label="Costo real"      value={viewItem.costo_ejecutado ? fmt(viewItem.costo_ejecutado) : null} color={dark ? '#4ade80' : '#15803d'} />
          <IR dark={dark} label="Operario"        value={viewItem.operario} />
          <IR dark={dark} label="Notas"           value={viewItem.notas} />
        </InfoModal>
      )}
      {delConfirm && <ConfirmModal dark={dark} message={delConfirm.msg} onConfirm={() => { delConfirm.fn(); setDelConfirm(null) }} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: FITOSANITARIO
══════════════════════════════════════════════════════ */
function FitosanitarioTab({ dark, campanaId, etapaFilter, etapasValidas, campana, onRefreshCampana }) {
  const [plan, setPlan]             = useState([])
  const [prods, setProds]           = useState([])
  const [unidades, setUnidades]     = useState([])
  const [modal, setModal]           = useState(null)
  const [apModal, setApModal]       = useState(null)
  const [apForm, setApForm]         = useState({ fecha_aplicada: '', area_aplicada: '', operario: '', es_sostenible: false, observaciones: '' })
  const [delConfirm, setDelConfirm] = useState(null)
  const [viewItem, setViewItem]     = useState(null)
  const [form, setForm]             = useState({ producto: '', objetivo: '', dosis: '', unidad: '', dias_antes_cosecha: '', condicion: '', frecuencia_dias: '', etapa: '' })
  const [loading, setLoading]       = useState(false)
  const [miembros, setMiembros]     = useState([])

  const fetch = useCallback(async () => {
    const [p, pr, un] = await Promise.all([
      api.get(`/campanas/${campanaId}/fitosanitario/`),
      api.get('/campanas/productos/'),
      api.get('/campanas/unidades/'),
    ])
    setPlan(p.data); setProds(pr.data); setUnidades(un.data)
  }, [campanaId])
  const refresh = useCallback(() => { fetch(); onRefreshCampana?.() }, [fetch, onRefreshCampana])
  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (campana?.biohuerto) {
      api.get(`/biohuertos/${campana.biohuerto}/miembros/`).then(r => setMiembros(r.data)).catch(() => {})
    }
  }, [campana?.biohuerto])

  const h  = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const ha = e => setApForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const openApModal = item => {
    if (item.estado === 'aplicado' && !item.numero_aplicaciones) {
      api.patch(`/campanas/fitosanitario/${item.id}/`, { estado: 'programado', fecha_aplicada: null })
        .then(refresh).catch(() => toast.error('Error.'))
      return
    }
    const blocker = checkEtapaOrder(plan, item.etapa, i => i.estado === 'aplicado')
    if (blocker) { toast.error(blocker); return }
    const prod = prods.find(p => String(p.id) === String(item.producto))
    const esSos = prod ? ['enmienda', 'biologico', 'bioestimulante'].includes(prod.tipo) : false
    setApForm({
      fecha_aplicada: new Date().toISOString().slice(0, 10),
      area_aplicada:  campana?.area ?? '',
      operario:       '',
      es_sostenible:  esSos,
      observaciones:  '',
    })
    setApModal(item)
  }

  const confirmAplicacion = async e => {
    e.preventDefault(); setLoading(true)
    try {
      if (apModal.numero_aplicaciones) {
        await api.post(`/campanas/${campanaId}/aplicaciones/`, {
          item_plan:      apModal.id,
          producto:       apModal.producto,
          fecha:          apForm.fecha_aplicada,
          dosis_aplicada: apModal.dosis,
          area_aplicada:  parseFloat(apForm.area_aplicada || campana?.area || 0),
          operario:       apForm.operario,
          es_sostenible:  apForm.es_sostenible,
          observaciones:  apForm.observaciones,
        })
        const nuevasCont = (apModal.aplicaciones_count || 0) + 1
        if (nuevasCont >= apModal.numero_aplicaciones) toast.success(`Aplicación ${nuevasCont}/${apModal.numero_aplicaciones} registrada. ¡Plan completado!`)
        else toast.success(`Aplicación ${nuevasCont}/${apModal.numero_aplicaciones} registrada.`)
      } else {
        await api.patch(`/campanas/fitosanitario/${apModal.id}/`, {
          estado:         'aplicado',
          fecha_aplicada: apForm.fecha_aplicada,
          area_aplicada:  apForm.area_aplicada  || null,
          operario:       apForm.operario,
          es_sostenible:  apForm.es_sostenible,
          observaciones:  apForm.observaciones,
        })
        toast.success('Marcado como aplicado.')
      }
      setApModal(null); refresh()
    } catch { toast.error('Error.') } finally { setLoading(false) }
  }

  const submitPlan = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = {
        ...form,
        unidad:             form.unidad             || null,
        objetivo:           form.objetivo           || null,
        condicion:          form.condicion          || null,
        dias_antes_cosecha: form.dias_antes_cosecha || null,
        frecuencia_dias:    form.frecuencia_dias    || null,
      }
      if (modal === 'edit') { await api.patch(`/campanas/fitosanitario/${form.id}/`, payload) }
      else { await api.post(`/campanas/${campanaId}/fitosanitario/`, payload) }
      const hasSeg = !!payload.dias_antes_cosecha
      const hasFrq = !!payload.frecuencia_dias
      if (hasSeg && hasFrq)       toast.success('Guardado. Alertas de seguridad y aplicación actualizadas.')
      else if (hasSeg)            toast.success('Guardado. Alerta de intervalo de seguridad creada.')
      else if (hasFrq)            toast.success('Guardado. Alerta de aplicación periódica creada.')
      else                        toast.success(modal === 'edit' ? 'Actualizado.' : 'Agregado al plan.')
      setModal(null); refresh()
    } catch (err) {
      const detail = err?.response?.data
      const msg = detail ? Object.values(detail).flat().join(' · ') : 'Error al guardar.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const toggleSostenible = async item => {
    try {
      const res = await api.patch(`/campanas/fitosanitario/${item.id}/`, { es_sostenible: !item.es_sostenible })
      setPlan(prev => prev.map(x => x.id === item.id ? { ...x, es_sostenible: res.data.es_sostenible } : x))
    } catch { toast.error('Error al actualizar.') }
  }

  const delPlan = (item) => setDelConfirm({ fn: async () => { await api.delete(`/campanas/fitosanitario/${item.id}/`); refresh() }, msg: `¿Eliminar "${item.producto_nombre}" del plan?` })

  const ist = ist_(dark); const lst = lst_(dark)

  const segCount = plan.filter(i => i.dias_antes_cosecha && i.estado === 'programado').length
  const frqCount = plan.filter(i => i.frecuencia_dias).length

  return (
    <div className="space-y-5">
      {/* Banner de alertas automáticas */}
      {(segCount > 0 || frqCount > 0) && (
        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: dark ? 'rgba(234,179,8,0.10)' : '#fefce8', border: `1px solid ${dark ? 'rgba(234,179,8,0.25)' : '#fde68a'}` }}>
          <AlertTriangle size={14} style={{ color: dark ? '#fbbf24' : '#d97706', marginTop: 1, flexShrink: 0 }} />
          <p className="text-xs" style={{ color: dark ? '#fbbf24' : '#92400e' }}>
            {segCount > 0 && <><strong>{segCount} producto{segCount !== 1 ? 's' : ''}</strong> con intervalo de seguridad — se creará alerta automática de límite de aplicación. </>}
            {frqCount > 0 && <><strong>{frqCount} aplicación{frqCount !== 1 ? 'es' : ''}</strong> periódica{frqCount !== 1 ? 's' : ''} — se recordará la próxima fecha. </>}
            Ver en la pestaña <strong>Alertas</strong>.
          </p>
        </div>
      )}

      {/* Plan fitosanitario */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? D.sub : '#6b7280' }}>Plan fitosanitario</p>
          {plan.length > 0 && campana?.area && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: dark ? 'rgba(74,222,128,0.12)' : '#f0fdf4', color: dark ? '#4ade80' : '#15803d' }}>
              {fmt(plan.reduce((s, i) => s + (i.dosis && i.producto_precio ? parseFloat(i.dosis) * parseFloat(campana.area) * parseFloat(i.producto_precio) * fitoCostFactor(i.unidad_codigo) : 0), 0))} est.
            </span>
          )}
        </div>
        {campana?.estado !== 'cerrada' && (
          <button onClick={() => { setForm({ producto: '', objetivo: '', dosis: '', unidad: 'L/ha', dias_antes_cosecha: '', condicion: '', frecuencia_dias: '', numero_aplicaciones: '', fecha_inicio: '', etapa: '' }); setModal('new') }}
            className="flex items-center gap-1.5 btn-primary text-sm">
            <Plus size={13} /> Agregar
          </button>
        )}
      </div>
      <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              {['', 'Producto', 'Tipo', 'Etapa', 'Fecha', 'Dosis/m²', 'Total campo', 'Costo est.', 'Estado', 'Sost.', ''].map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide${i === 10 ? ' text-right' : ''}`}
                  style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const ETAPA_ORDER = ['preparacion','germinacion','crecimiento','establecido','poda','brotacion','floracion','cosecha']
              const visible = (etapaFilter ? plan.filter(i => i.etapa === etapaFilter) : [...plan])
                .sort((a, b) => (ETAPA_ORDER.indexOf(a.etapa) ?? 99) - (ETAPA_ORDER.indexOf(b.etapa) ?? 99))
              if (visible.length === 0)
                return <tr><td colSpan={11} className="px-4 py-10 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin productos{etapaFilter ? ' en esta etapa' : ' en el plan'}</td></tr>
              return visible.map(item => {
                const et = etapaOf(item.etapa)
                const ec = dark ? et.dc : et.lc
                const ebg = dark ? et.dbg : et.lbg
                const aplicado = item.estado === 'aplicado'
                const TIPO_CFG = {
                  enmienda:       { bg: dark ? 'rgba(74,222,128,0.15)' : '#dcfce7',  c: dark ? '#4ade80' : '#15803d',  label: 'Orgánico' },
                  biologico:      { bg: dark ? 'rgba(52,211,153,0.15)' : '#d1fae5',  c: dark ? '#34d399' : '#059669',  label: 'Biológico' },
                  bioestimulante: { bg: dark ? 'rgba(96,165,250,0.15)' : '#dbeafe',  c: dark ? '#60a5fa' : '#2563eb',  label: 'Bioestimulante' },
                  fertilizante:   { bg: dark ? 'rgba(251,191,36,0.15)' : '#fef9c3',  c: dark ? '#fbbf24' : '#d97706',  label: 'Fertilizante' },
                  fitosanitario:  { bg: dark ? 'rgba(248,113,113,0.15)' : '#fee2e2', c: dark ? '#f87171' : '#dc2626',  label: 'Sintético' },
                }
                const tipoCfg = TIPO_CFG[item.producto_tipo]
                const totalCampo = item.dosis && campana?.area
                  ? (parseFloat(item.dosis) * parseFloat(campana.area)).toFixed(2) : null
                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}`, opacity: aplicado ? 0.7 : 1 }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => campana?.estado !== 'cerrada' && openApModal(item)}
                        title={campana?.estado === 'cerrada' ? 'Campaña cerrada' : aplicado ? 'Revertir a pendiente' : 'Marcar como aplicado'}
                        style={{ opacity: campana?.estado === 'cerrada' ? 0.3 : 1, cursor: campana?.estado === 'cerrada' ? 'not-allowed' : 'pointer' }}>
                        {aplicado
                          ? <CheckCircle2 size={18} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
                          : <Circle size={18} style={{ color: dark ? D.sub : '#d1d5db' }} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: dark ? D.text : '#111827', textDecoration: aplicado ? 'line-through' : 'none' }}>
                      {item.producto_nombre}
                      {item.es_sostenible && (
                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>
                          sostenible
                        </span>
                      )}
                      {item.dias_antes_cosecha && (
                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: dark ? 'rgba(234,179,8,0.15)' : '#fef9c3', color: dark ? '#fbbf24' : '#d97706' }}>
                          {item.dias_antes_cosecha}d seguridad
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tipoCfg && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: tipoCfg.bg, color: tipoCfg.c }}>{tipoCfg.label}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {item.etapa && <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                        style={{ backgroundColor: ebg, color: ec }}>{et.label}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ minWidth: 100 }}>
                      {(() => {
                        if (aplicado && item.fecha_aplicada) {
                          return <span style={{ color: dark ? '#4ade80' : '#15803d', fontWeight: 600 }}>{item.fecha_aplicada}</span>
                        }
                        if (!item.fecha_inicio) return <span style={{ color: dark ? 'rgba(255,255,255,0.18)' : '#d1d5db' }}>—</span>
                        if (!item.frecuencia_dias) {
                          return (
                            <span style={{ color: dark ? '#60a5fa' : '#2563eb', fontWeight: 600 }}>
                              {item.fecha_inicio}
                              <span className="block text-[10px] font-normal" style={{ color: dark ? D.sub : '#9ca3af' }}>única vez</span>
                            </span>
                          )
                        }
                        // Calcular próxima fecha desde fecha_inicio + N * frecuencia_dias
                        const today = new Date(); today.setHours(0,0,0,0)
                        let base = new Date(item.fecha_inicio + 'T00:00:00')
                        while (base < today) base = new Date(base.getTime() + item.frecuencia_dias * 86400000)
                        const proxima = base.toISOString().slice(0, 10)
                        const dias = Math.round((base - today) / 86400000)
                        const urgente = dias <= 2
                        return (
                          <span style={{ color: urgente ? (dark ? '#f87171' : '#dc2626') : (dark ? '#fbbf24' : '#d97706'), fontWeight: 600 }}>
                            {proxima}
                            <span className="block text-[10px] font-normal" style={{ color: dark ? D.sub : '#9ca3af' }}>
                              {dias === 0 ? 'hoy' : dias === 1 ? 'mañana' : `en ${dias}d`} · c/{item.frecuencia_dias}d
                            </span>
                          </span>
                        )
                      })()}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: dark ? D.text : '#374151' }}>
                      {item.dosis} {item.unidad_codigo || item.unidad}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: dark ? '#a78bfa' : '#7c3aed' }}>
                      {totalCampo ? `${totalCampo} ${item.unidad_codigo || item.unidad}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                      {totalCampo && item.producto_precio
                        ? fmt(parseFloat(totalCampo) * parseFloat(item.producto_precio) * fitoCostFactor(item.unidad_codigo || item.unidad))
                        : <span style={{ color: dark ? 'rgba(255,255,255,0.18)' : '#d1d5db' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {item.numero_aplicaciones ? (() => {
                        const cnt = item.aplicaciones_count || 0
                        const tot = item.numero_aplicaciones
                        const done = cnt >= tot
                        return (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={done
                              ? { backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }
                              : cnt > 0
                                ? { backgroundColor: dark ? 'rgba(251,191,36,0.15)' : '#fef9c3', color: dark ? '#fbbf24' : '#d97706' }
                                : { backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>
                            {cnt}/{tot} aplic.{done ? ' ✓' : ''}
                          </span>
                        )
                      })() : (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={aplicado
                            ? { backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }
                            : { backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>
                          {aplicado ? `Aplicado${item.fecha_aplicada ? ' · ' + item.fecha_aplicada : ''}` : 'Pendiente'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleSostenible(item)}
                        title={item.es_sostenible ? 'Quitar sostenible' : 'Marcar como sostenible'}
                        className="p-1.5 rounded-lg transition-all"
                        style={{
                          backgroundColor: item.es_sostenible ? (dark ? 'rgba(22,163,74,0.15)' : '#dcfce7') : 'transparent',
                          color: item.es_sostenible ? (dark ? '#4ade80' : '#16a34a') : (dark ? D.sub : '#d1d5db'),
                        }}
                        onMouseEnter={e => { if (!item.es_sostenible) e.currentTarget.style.backgroundColor = dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4' }}
                        onMouseLeave={e => { if (!item.es_sostenible) e.currentTarget.style.backgroundColor = 'transparent' }}>
                        <Leaf size={14} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setViewItem(item)} className="p-1.5 rounded-lg" style={{ color: dark ? D.sub : '#9ca3af' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Eye size={12} /></button>
                        {campana?.estado !== 'cerrada' && <>
                          <button onClick={() => { setForm({ ...item }); setModal('edit') }} className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={12} /></button>
                          <button onClick={() => delPlan(item)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={12} /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                )
              })
            })()}
          </tbody>
        </table>
      </div>

      {apModal && (
        <MiniModal dark={dark}
          title={apModal.numero_aplicaciones
            ? `Registrar aplicación ${(apModal.aplicaciones_count || 0) + 1}/${apModal.numero_aplicaciones} — ${apModal.producto_nombre}`
            : `Aplicar: ${apModal.producto_nombre}`}
          onClose={() => setApModal(null)} onSubmit={confirmAplicacion} loading={loading}>
          <p className="text-[11px] font-semibold px-3 py-2 rounded-lg" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', color: dark ? D.sub : '#6b7280' }}>
            Plan: {apModal.dosis} {apModal.unidad_codigo || apModal.unidad}
            {campana?.area ? ` · Total campo: ${(parseFloat(apModal.dosis) * parseFloat(campana.area)).toFixed(2)} ${apModal.unidad_codigo || apModal.unidad}` : ''}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={lst_(dark)}>Fecha de aplicación *</label>
              <input type="date" name="fecha_aplicada" value={apForm.fecha_aplicada} onChange={ha} style={ist_(dark)} required />
            </div>
            <div>
              <label style={lst_(dark)}>Área aplicada (m²)</label>
              <input type="number" step="0.01" name="area_aplicada" value={apForm.area_aplicada} onChange={ha} style={ist_(dark)} placeholder={campana?.area ?? ''} />
            </div>
          </div>
          <div>
            <label style={lst_(dark)}>Operario</label>
            <OperarioSelect dark={dark} value={apForm.operario} ist={ist_(dark)} onChange={v => setApForm(f => ({ ...f, operario: v }))} miembros={miembros} />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
            style={{ backgroundColor: apForm.es_sostenible ? (dark ? 'rgba(22,163,74,0.12)' : '#f0fdf4') : (dark ? 'rgba(255,255,255,0.04)' : '#f9fafb'), border: `1px solid ${apForm.es_sostenible ? (dark ? 'rgba(22,163,74,0.3)' : '#bbf7d0') : (dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb')}` }}>
            <input type="checkbox" id="ap-sos" name="es_sostenible" checked={apForm.es_sostenible} onChange={ha} />
            <label htmlFor="ap-sos" className="text-xs font-bold cursor-pointer" style={{ color: apForm.es_sostenible ? (dark ? '#4ade80' : '#15803d') : (dark ? D.sub : '#6b7280') }}>
              {apForm.es_sostenible ? '✓ Producto orgánico / biológico' : 'Marcar como práctica sostenible'}
            </label>
          </div>
          <div>
            <label style={lst_(dark)}>Observaciones</label>
            <textarea name="observaciones" value={apForm.observaciones} onChange={ha} rows={2} style={{ ...ist_(dark), resize: 'none' }} />
          </div>
        </MiniModal>
      )}

      {modal && (
        <MiniModal dark={dark} title={modal === 'edit' ? 'Editar producto' : 'Agregar al plan'} onClose={() => setModal(null)} onSubmit={submitPlan} loading={loading}>
          <div><label style={lst}>Producto *</label>
            <select name="producto" value={form.producto} onChange={h} style={ist} required>
              <option value="">Selecciona</option>
              {[
                ['enmienda',       'Enmiendas orgánicas'],
                ['biologico',      'Control biológico'],
                ['bioestimulante', 'Bioestimulantes'],
                ['fertilizante',   'Fertilizantes'],
                ['fitosanitario',  'Fitosanitarios'],
              ].map(([tipo, label]) => {
                const grupo = prods.filter(p => p.tipo === tipo)
                if (!grupo.length) return null
                return (
                  <optgroup key={tipo} label={`— ${label} —`}>
                    {grupo.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>)}
                  </optgroup>
                )
              })}
            </select>
          </div>
          <div><label style={lst}>Etapa fenológica</label>
            <select name="etapa" value={form.etapa} onChange={h} style={ist}>
              <option value="">Sin etapa</option>
              {(etapasValidas ?? ETAPAS).map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Dosis *</label><input name="dosis" type="number" step="0.001" value={form.dosis} onChange={h} style={ist} required /></div>
            <div><label style={lst}>Unidad</label>
              <select name="unidad" value={form.unidad} onChange={h} style={ist}>
                <option value="">Sin unidad</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.codigo}{u.nombre ? ` — ${u.nombre}` : ''}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Intervalo seguridad (días)</label><input name="dias_antes_cosecha" type="number" value={form.dias_antes_cosecha} onChange={h} style={ist} placeholder="15" /></div>
            <div><label style={lst}>Frecuencia (días)</label><input name="frecuencia_dias" type="number" value={form.frecuencia_dias} onChange={h} style={ist} placeholder="7" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>N° de aplicaciones</label><input name="numero_aplicaciones" type="number" min="1" value={form.numero_aplicaciones || ''} onChange={h} style={ist} placeholder="3" /></div>
            <div><label style={lst}>Fecha de inicio</label><input name="fecha_inicio" type="date" value={form.fecha_inicio || ''} onChange={h} style={ist} /></div>
          </div>
        </MiniModal>
      )}

      {viewItem && (
        <InfoModal dark={dark} title="Detalle fitosanitario" onClose={() => setViewItem(null)}>
          <IR dark={dark} label="Producto"       value={viewItem.producto_nombre} />
          <IR dark={dark} label="Tipo"           value={viewItem.producto_tipo} />
          <IR dark={dark} label="Etapa"          value={etapaOf(viewItem.etapa)?.label} />
          <IR dark={dark} label="Dosis/m²"       value={`${viewItem.dosis} ${viewItem.unidad_codigo || viewItem.unidad}`} />
          {campana?.area && viewItem.producto_precio && <IR dark={dark} label="Costo est." value={fmt(parseFloat(viewItem.dosis) * parseFloat(campana.area) * parseFloat(viewItem.producto_precio) * fitoCostFactor(viewItem.unidad_codigo || viewItem.unidad))} color={dark ? '#4ade80' : '#15803d'} />}
          <IR dark={dark} label="Objetivo"       value={viewItem.objetivo_nombre} />
          <IR dark={dark} label="Plaga"          value={viewItem.plaga_nombre} />
          <IR dark={dark} label="Condición"      value={viewItem.condicion_nombre} />
          <IR dark={dark} label="Fecha inicio"    value={viewItem.fecha_inicio} />
          <IR dark={dark} label="Frecuencia"     value={viewItem.frecuencia_dias ? `c/ ${viewItem.frecuencia_dias} días` : null} />
          <IR dark={dark} label="Seg. cosecha"   value={viewItem.dias_antes_cosecha ? `${viewItem.dias_antes_cosecha} días` : null} color={dark ? '#fbbf24' : '#d97706'} />
          {viewItem.estado === 'aplicado' && <>
            <IR dark={dark} label="Fecha aplic." value={viewItem.fecha_aplicada} />
            <IR dark={dark} label="Área aplic."  value={viewItem.area_aplicada ? `${viewItem.area_aplicada} m²` : null} />
            <IR dark={dark} label="Operario"     value={viewItem.operario} />
            <IR dark={dark} label="Sostenible"   value={viewItem.es_sostenible ? 'Sí' : null} color={dark ? '#4ade80' : '#15803d'} />
            <IR dark={dark} label="Observaciones" value={viewItem.observaciones} />
          </>}
        </InfoModal>
      )}
      {delConfirm && <ConfirmModal dark={dark} message={delConfirm.msg} onConfirm={() => { delConfirm.fn(); setDelConfirm(null) }} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: RIEGO & FERTIRRIGACIÓN
══════════════════════════════════════════════════════ */
function RiegoTab({ dark, campanaId, campana, onRefreshCampana }) {
  const [planes, setPlanes]         = useState([])
  const [prods, setProds]           = useState([])
  const [viewPlan, setViewPlan]     = useState(null)
  const [modal, setModal]           = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)
  const [form, setForm]             = useState({ nombre: '', metodo: 'goteo', litros_por_m2: '', frecuencia_dias: '', duracion_minutos: '', fertilizante: '', dosis_fertilizante: '', fecha_inicio: '', fecha_fin: '', operario: '', costo_agua_total: '' })
  const [loading, setLoading]       = useState(false)
  const [miembros, setMiembros]     = useState([])
  const [completarModal, setCompletarModal] = useState(null)
  const [completarForm, setCompletarForm]   = useState({ operario: '' })
  const METODOS = [['goteo','Goteo'],['aspersion','Aspersión'],['gravedad','Gravedad'],['manual','Manual']]

  const fetch = useCallback(async () => {
    const [p, pr] = await Promise.all([
      api.get(`/campanas/${campanaId}/plan-riego/`),
      api.get('/campanas/productos/'),
    ])
    setPlanes(p.data); setProds(pr.data)
  }, [campanaId])
  const refresh = useCallback(() => { fetch(); onRefreshCampana?.() }, [fetch, onRefreshCampana])
  useEffect(() => { fetch() }, [fetch])

  useEffect(() => {
    if (campana?.biohuerto) {
      api.get(`/biohuertos/${campana.biohuerto}/miembros/`).then(r => setMiembros(r.data)).catch(() => {})
    }
  }, [campana?.biohuerto])

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitPlan = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...form, duracion_minutos: form.duracion_minutos || null, fertilizante: form.fertilizante || null, dosis_fertilizante: form.dosis_fertilizante || null, fecha_inicio: form.fecha_inicio || null, fecha_fin: form.fecha_fin || null, costo_agua_total: form.costo_agua_total || null }
      if (modal === 'edit') { await api.patch(`/campanas/plan-riego/${form.id}/`, payload); toast.success('Plan actualizado.') }
      else { await api.post(`/campanas/${campanaId}/plan-riego/`, payload); toast.success('Plan agregado.') }
      setModal(null); refresh()
    } catch { toast.error('Error.') } finally { setLoading(false) }
  }

  const delPlan    = (id) => setDelConfirm({ fn: async () => { await api.delete(`/campanas/plan-riego/${id}/`); refresh() }, msg: '¿Eliminar este plan de riego?' })

  const toggleSostenibleRiego = async plan => {
    try {
      const res = await api.patch(`/campanas/plan-riego/${plan.id}/`, { es_sostenible: !plan.es_sostenible })
      setPlanes(prev => prev.map(x => x.id === plan.id ? { ...x, es_sostenible: res.data.es_sostenible } : x))
    } catch { toast.error('Error al actualizar.') }
  }
  const togglePlan = async (p) => {
    if (p.completado) {
      try {
        await api.patch(`/campanas/plan-riego/${p.id}/`, { completado: false })
        refresh()
      } catch { toast.error('Error al actualizar.') }
      return
    }
    if (p.fecha_inicio) {
      const hayAnterior = planes.some(x => !x.completado && x.id !== p.id && x.fecha_inicio && x.fecha_inicio < p.fecha_inicio)
      if (hayAnterior) { toast.error('Hay planes de riego anteriores sin completar. Complétalos primero.'); return }
    }
    setCompletarForm({ operario: p.operario || '' })
    setCompletarModal(p)
  }

  const confirmCompletar = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.patch(`/campanas/plan-riego/${completarModal.id}/`, { completado: true, operario: completarForm.operario })
      toast.success('Plan marcado como completado.'); setCompletarModal(null); refresh()
    } catch { toast.error('Error al actualizar.') } finally { setLoading(false) }
  }
  const ist = ist_(dark); const lst = lst_(dark)

  const METODO_BADGE = {
    goteo:     { dbg: 'rgba(59,130,246,0.15)',  lbg: '#dbeafe', dc: '#60a5fa', lc: '#2563eb' },
    aspersion: { dbg: 'rgba(14,165,233,0.15)',  lbg: '#e0f2fe', dc: '#38bdf8', lc: '#0284c7' },
    gravedad:  { dbg: 'rgba(22,163,74,0.15)',   lbg: '#dcfce7', dc: '#4ade80', lc: '#15803d' },
    manual:    { dbg: 'rgba(255,255,255,0.08)', lbg: '#f3f4f6', dc: '#94a3b8', lc: '#6b7280' },
  }

  return (
    <div className="space-y-5">

      {/* ── Planes de riego ─────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wide" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {planes.length} plan{planes.length !== 1 ? 'es' : ''} de riego
            </p>
            {planes.length > 0 && campana?.area && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: dark ? 'rgba(74,222,128,0.12)' : '#f0fdf4', color: dark ? '#4ade80' : '#15803d' }}>
                fert. {fmt(planes.reduce((s, p) => s + (p.fertilizante_precio && p.dosis_fertilizante && p.litros_por_m2 ? parseFloat(p.dosis_fertilizante) * parseFloat(p.litros_por_m2) * parseFloat(campana.area) * parseFloat(p.fertilizante_precio) / 1000 : 0), 0))} est.
              </span>
            )}
          </div>
          {campana?.estado !== 'cerrada' && (
            <button onClick={() => { setForm({ nombre: '', metodo: 'goteo', litros_por_m2: '', frecuencia_dias: '', duracion_minutos: '', fertilizante: '', dosis_fertilizante: '', fecha_inicio: '', fecha_fin: '', operario: '', costo_agua_total: '' }); setModal('new') }}
              className="flex items-center gap-1.5 btn-primary text-sm">
              <Plus size={13} /> Agregar
            </button>
          )}
        </div>
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                {['', 'Nombre', 'Método', 'L/m²', 'Frecuencia', 'Duración', 'Fertirrigación', 'Costo fert. est.', ''].map((col, i) => (
                  <th key={i} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide${i === 8 ? ' text-right' : ''}`}
                    style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {planes.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin planes — usa "Agregar" para crear uno</td></tr>
              ) : planes.map(p => {
                const mb = METODO_BADGE[p.metodo] || METODO_BADGE.manual
                return (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => campana?.estado !== 'cerrada' && togglePlan(p)}
                        title={campana?.estado === 'cerrada' ? 'Campaña cerrada' : p.completado ? 'Revertir a pendiente' : 'Marcar como hecho'}
                        style={{ opacity: campana?.estado === 'cerrada' ? 0.3 : 1, cursor: campana?.estado === 'cerrada' ? 'not-allowed' : 'pointer' }}>
                        {p.completado
                          ? <CheckCircle2 size={18} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
                          : <Circle size={18} style={{ color: dark ? D.sub : '#d1d5db' }} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-semibold text-sm"
                      style={{ color: dark ? D.text : '#111827', textDecoration: p.completado ? 'line-through' : 'none', opacity: p.completado ? 0.6 : 1 }}>
                      {p.nombre}
                      {p.es_sostenible && (
                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>
                          sostenible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ opacity: p.completado ? 0.6 : 1 }}>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: dark ? mb.dbg : mb.lbg, color: dark ? mb.dc : mb.lc }}>
                        {p.metodo_display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: dark ? D.text : '#374151', opacity: p.completado ? 0.6 : 1 }}>{p.litros_por_m2} L</td>
                    <td className="px-4 py-3 text-sm" style={{ color: dark ? D.sub : '#6b7280', opacity: p.completado ? 0.6 : 1 }}>c/ {p.frecuencia_dias}d</td>
                    <td className="px-4 py-3 text-sm" style={{ color: dark ? D.sub : '#6b7280', opacity: p.completado ? 0.6 : 1 }}>
                      {p.duracion_minutos ? `${p.duracion_minutos} min` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ opacity: p.completado ? 0.6 : 1 }}>
                      {p.fertilizante_nombre
                        ? <span style={{ color: dark ? '#4ade80' : '#15803d' }}>
                            {p.fertilizante_nombre}
                            {p.dosis_fertilizante && <span className="ml-1 font-bold opacity-75">{p.dosis_fertilizante} {p.fertilizante_unidad || 'u.'}</span>}
                          </span>
                        : <span style={{ color: dark ? 'rgba(255,255,255,0.18)' : '#d1d5db' }}>—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold" style={{ color: dark ? '#4ade80' : '#15803d', opacity: p.completado ? 0.6 : 1 }}>
                      {p.fertilizante_precio && p.dosis_fertilizante && p.litros_por_m2 && campana?.area
                        ? fmt(parseFloat(p.dosis_fertilizante) * parseFloat(p.litros_por_m2) * parseFloat(campana.area) * parseFloat(p.fertilizante_precio) / 1000)
                        : <span style={{ color: dark ? 'rgba(255,255,255,0.18)' : '#d1d5db' }}>—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => toggleSostenibleRiego(p)}
                          title={p.es_sostenible ? 'Quitar sostenible' : 'Marcar como sostenible'}
                          className="p-1.5 rounded-lg transition-all"
                          style={{
                            backgroundColor: p.es_sostenible ? (dark ? 'rgba(22,163,74,0.15)' : '#dcfce7') : 'transparent',
                            color: p.es_sostenible ? (dark ? '#4ade80' : '#16a34a') : (dark ? D.sub : '#d1d5db'),
                          }}
                          onMouseEnter={e => { if (!p.es_sostenible) e.currentTarget.style.backgroundColor = dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4' }}
                          onMouseLeave={e => { if (!p.es_sostenible) e.currentTarget.style.backgroundColor = 'transparent' }}>
                          <Leaf size={14} />
                        </button>
                        <button onClick={() => setViewPlan(p)} className="p-1.5 rounded-lg" style={{ color: dark ? D.sub : '#9ca3af' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Eye size={13} /></button>
                        {campana?.estado !== 'cerrada' && <>
                          <button onClick={() => { setForm({ ...p, fertilizante: p.fertilizante || '', operario: p.operario || '', costo_agua_total: p.costo_agua_total || '' }); setModal('edit') }}
                            className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={13} /></button>
                          <button onClick={() => delPlan(p.id)}
                            className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={13} /></button>
                        </>}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal: plan ──────────────────────────────────── */}
      {modal && (
        <MiniModal dark={dark} title={modal === 'edit' ? 'Editar plan de riego' : 'Nuevo plan de riego'} onClose={() => setModal(null)} onSubmit={submitPlan} loading={loading}>
          <div><label style={lst}>Nombre *</label>
            <input name="nombre" value={form.nombre} onChange={h} style={ist} placeholder="Ej: Riego diario — germinación" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Método</label>
              <select name="metodo" value={form.metodo} onChange={h} style={ist}>
                {METODOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label style={lst}>Frecuencia (días) *</label>
              <input name="frecuencia_dias" type="number" value={form.frecuencia_dias} onChange={h} style={ist} required placeholder="1" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Litros por m² *</label>
              <input name="litros_por_m2" type="number" step="0.01" value={form.litros_por_m2} onChange={h} style={ist} required placeholder="2.5" />
            </div>
            <div><label style={lst}>Duración (min)</label>
              <input name="duracion_minutos" type="number" value={form.duracion_minutos} onChange={h} style={ist} placeholder="30" />
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}`, paddingTop: '10px' }}>
            <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: dark ? 'rgba(255,255,255,0.28)' : '#9ca3af' }}>Fertirrigación (opcional)</p>
            <div><label style={lst}>Fertilizante</label>
              <select name="fertilizante" value={form.fertilizante} onChange={h} style={ist}>
                <option value="">Sin fertilizante</option>
                {prods.filter(p => p.tipo === 'fertilizante').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            {form.fertilizante && (
              <div className="mt-2"><label style={lst}>Dosis (kg/m²)</label>
                <input name="dosis_fertilizante" type="number" step="0.001" value={form.dosis_fertilizante} onChange={h} style={ist} placeholder="0.005" />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Fecha inicio</label><input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={h} style={ist} /></div>
            <div><label style={lst}>Fecha fin</label><input name="fecha_fin" type="date" value={form.fecha_fin} onChange={h} style={ist} /></div>
          </div>
          <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}`, paddingTop: '10px' }}>
            <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2" style={{ color: dark ? 'rgba(255,255,255,0.28)' : '#9ca3af' }}>Ejecución</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label style={lst}>Operario</label><input name="operario" value={form.operario} onChange={h} style={ist} /></div>
              <div><label style={lst}>Costo agua total (S/.)</label><input name="costo_agua_total" type="number" step="0.01" value={form.costo_agua_total} onChange={h} style={ist} placeholder="0.00" /></div>
            </div>
          </div>
        </MiniModal>
      )}

      {viewPlan && (
        <InfoModal dark={dark} title="Detalle del plan de riego" onClose={() => setViewPlan(null)}>
          <IR dark={dark} label="Nombre"         value={viewPlan.nombre} />
          <IR dark={dark} label="Método"         value={viewPlan.metodo_display} />
          <IR dark={dark} label="Litros/m²"      value={`${viewPlan.litros_por_m2} L`} />
          <IR dark={dark} label="Frecuencia"     value={`c/ ${viewPlan.frecuencia_dias} días`} />
          <IR dark={dark} label="Duración"       value={viewPlan.duracion_minutos ? `${viewPlan.duracion_minutos} min` : null} />
          <IR dark={dark} label="Fertirrigación" value={viewPlan.fertilizante_nombre} color={dark ? '#4ade80' : '#15803d'} />
          <IR dark={dark} label="Dosis fert."    value={viewPlan.dosis_fertilizante ? `${viewPlan.dosis_fertilizante} ${viewPlan.fertilizante_unidad || 'u.'}/m²` : null} />
          <IR dark={dark} label="Fecha inicio"   value={viewPlan.fecha_inicio} />
          <IR dark={dark} label="Fecha fin"      value={viewPlan.fecha_fin} />
          {viewPlan.completado && <>
            <IR dark={dark} label="Operario"         value={viewPlan.operario || null} />
            <IR dark={dark} label="Costo agua total" value={viewPlan.costo_agua_total ? fmt(viewPlan.costo_agua_total) : null} color={dark ? '#60a5fa' : '#2563eb'} />
          </>}
        </InfoModal>
      )}
      {completarModal && (
        <MiniModal dark={dark} title={`Completar: ${completarModal.nombre}`} onClose={() => setCompletarModal(null)} onSubmit={confirmCompletar} loading={loading}>
          <p className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
            Asigna el operario que realizó este plan de riego (opcional).
          </p>
          <div>
            <label style={lst}>Operario</label>
            <OperarioSelect dark={dark} value={completarForm.operario} ist={ist} onChange={v => setCompletarForm(f => ({ ...f, operario: v }))} miembros={miembros} />
          </div>
        </MiniModal>
      )}
      {delConfirm && <ConfirmModal dark={dark} message={delConfirm.msg} onConfirm={() => { delConfirm.fn(); setDelConfirm(null) }} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: PRESUPUESTO
══════════════════════════════════════════════════════ */
function PresupuestoTab({ dark, campanaId, campana }) {
  const [items, setItems]           = useState([])
  const [laboresPlan, setLaboresPlan] = useState(0)
  const [laboresEj, setLaboresEj]   = useState(0)
  const [laboresCount, setLaboresCount] = useState(0)
  const [fitoPlan, setFitoPlan]     = useState(0)
  const [fitoEj, setFitoEj]         = useState(0)
  const [fitoCount, setFitoCount]   = useState(0)
  const [riegoPlan, setRiegoPlan]   = useState(0)
  const [riegoEj, setRiegoEj]       = useState(0)
  const [riegoCount, setRiegoCount] = useState(0)
  const [modal, setModal]           = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)
  const [form, setForm]             = useState({ categoria: 'insumo', descripcion: '', cantidad: '', unidad: '', precio_unitario: '', monto_ejecutado: '0' })
  const [porM2, setPorM2]           = useState('')
  const [loading, setLoading]       = useState(false)
  // Solo categorías para el formulario (agua y mano de obra tienen módulo propio)
  const CATS_FORM = [['insumo','Semillas / Insumos'],['otro','Otro']]
  // Para display de registros existentes (compatibilidad hacia atrás)
  const CATS_ALL = [['insumo','Insumo'],['agua','Agua'],['mano_obra','Mano de obra'],['otro','Otro']]

  const fetchData = useCallback(async () => {
    const [r, l, f, pr] = await Promise.all([
      api.get(`/campanas/${campanaId}/presupuesto/`),
      api.get(`/campanas/${campanaId}/labores/`),
      api.get(`/campanas/${campanaId}/fitosanitario/`),
      api.get(`/campanas/${campanaId}/plan-riego/`),
    ])
    setItems(r.data)
    const area = parseFloat(campana?.area || 0)

    // Labores
    const laboresActivas = l.data.filter(lb => lb.estado !== 'cancelada')
    const laboresEjec    = l.data.filter(lb => lb.estado === 'ejecutada')
    setLaboresCount(laboresActivas.length)
    setLaboresPlan(laboresActivas.reduce((s, lb) => s + (lb.costo_programado || 0), 0))
    setLaboresEj(laboresEjec.reduce((s, lb) => s + (lb.costo_ejecutado || 0), 0))

    // Fitosanitario
    const fitoActivos  = f.data.filter(it => it.activo)
    const fitoAplicado = f.data.filter(it => it.estado === 'aplicado')
    const calcFito = list => list.reduce((s, it) => {
      return s + parseFloat(it.dosis || 0) * area * parseFloat(it.producto_precio || 0) * fitoCostFactor(it.unidad_codigo)
    }, 0)
    setFitoCount(fitoActivos.length)
    setFitoPlan(calcFito(fitoActivos))
    setFitoEj(calcFito(fitoAplicado))

    // Riego
    const riegoActivos   = pr.data.filter(pl => pl.activo)
    const riegoCompletos = pr.data.filter(pl => pl.completado)
    const calcRiego = list => list.reduce((s, pl) => {
      const fertCost = (pl.fertilizante_precio && pl.dosis_fertilizante && pl.litros_por_m2)
        ? parseFloat(pl.dosis_fertilizante) * parseFloat(pl.litros_por_m2) * area * parseFloat(pl.fertilizante_precio) / 1000
        : 0
      return s + fertCost + parseFloat(pl.costo_agua_total || 0)
    }, 0)
    setRiegoCount(riegoActivos.length)
    setRiegoPlan(calcRiego(riegoActivos))
    setRiegoEj(calcRiego(riegoCompletos))
  }, [campanaId, campana?.area])
  useEffect(() => { fetchData() }, [fetchData])

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal === 'edit') { await api.patch(`/campanas/presupuesto/${form.id}/`, form); toast.success('Actualizado.') }
      else { await api.post(`/campanas/${campanaId}/presupuesto/`, form); toast.success('Ítem agregado.') }
      setModal(null); fetchData()
    } catch (err) {
      console.error('Presupuesto save error:', err?.response?.data ?? err)
      const detail = err?.response?.data
      if (detail && typeof detail === 'object') {
        const msgs = Object.entries(detail).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join(' | ')
        toast.error(msgs, { duration: 6000 })
      } else {
        toast.error(err?.message ?? 'Error al guardar.')
      }
    } finally { setLoading(false) }
  }
  const del = (id) => setDelConfirm({ fn: async () => { await api.delete(`/campanas/presupuesto/${id}/`); fetchData() }, msg: '¿Eliminar este ítem del presupuesto?' })

  const total_pres_man = items.reduce((s, i) => s + i.monto_presupuestado, 0)
  const total_pres     = total_pres_man + laboresPlan + fitoPlan + riegoPlan
  const total_ej_man   = items.reduce((s, i) => s + parseFloat(i.monto_ejecutado || 0), 0)
  const total_ej       = total_ej_man + laboresEj + fitoEj + riegoEj
  const varianza     = total_pres - total_ej
  const ingreso_est = campana?.objetivo_cosecha && campana?.precio_venta_estimado
    ? parseFloat(campana.objetivo_cosecha) * parseFloat(campana.precio_venta_estimado) : null
  const rentabilidad = ingreso_est !== null ? ingreso_est - total_ej : null

  const ist = ist_(dark); const lst = lst_(dark)

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Presupuestado', value: fmt(total_pres),
            sub: (laboresPlan > 0 || fitoPlan > 0 || riegoPlan > 0)
              ? [laboresPlan > 0 && `${fmt(laboresPlan)} labores`, fitoPlan > 0 && `${fmt(fitoPlan)} fitosanit.`, riegoPlan > 0 && `${fmt(riegoPlan)} riego`].filter(Boolean).join(' + ')
              : null,
            color: dark ? '#60a5fa' : '#2563eb' },
          { label: 'Ejecutado', value: fmt(total_ej),
            sub: (laboresEj > 0 || fitoEj > 0 || riegoEj > 0)
              ? [laboresEj > 0 && `${fmt(laboresEj)} labores`, fitoEj > 0 && `${fmt(fitoEj)} fitosanit.`, riegoEj > 0 && `${fmt(riegoEj)} riego`].filter(Boolean).join(' + ')
              : null,
            color: dark ? '#4ade80' : '#15803d' },
          { label: varianza >= 0 ? 'Ahorro' : 'Exceso', value: fmt(Math.abs(varianza)),
            color: varianza >= 0 ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#dc2626'),
            icon: varianza >= 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} /> },
          { label: 'Rentabilidad est.', value: rentabilidad !== null ? fmt(rentabilidad) : '—',
            color: rentabilidad === null ? (dark ? D.sub : '#9ca3af') : rentabilidad >= 0 ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#dc2626') },
        ].map((k, i) => (
          <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: dark ? D.cardBg : '#f9fafb', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}` }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: dark ? D.sub : '#9ca3af' }}>{k.label}</p>
            <div className="flex items-center gap-1.5">
              {k.icon && <span style={{ color: k.color }}>{k.icon}</span>}
              <p className="text-lg font-extrabold" style={{ color: k.color }}>{k.value}</p>
            </div>
            {k.sub && <p className="text-[10px] mt-0.5 font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}>{k.sub}</p>}
          </div>
        ))}
      </div>

      {/* Encabezado tabla + botón agregar */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: dark ? D.sub : '#9ca3af' }}>
          {items.length} ítem{items.length !== 1 ? 's' : ''}
        </p>
        {campana?.estado !== 'cerrada' && (
          <button onClick={() => { setForm({ categoria: 'insumo', descripcion: '', cantidad: '', unidad: '', precio_unitario: '', monto_ejecutado: '0' }); setPorM2(''); setModal('new') }}
            className="flex items-center gap-1.5 btn-primary text-sm">
            <Plus size={13} /> Agregar ítem
          </button>
        )}
      </div>

      {/* Tabla única */}
      <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              {['Categoría', 'Descripción', 'Cantidad', 'Precio/u.', 'Presupuestado', 'Ejecutado', 'Varianza', ''].map((col, i) => (
                <th key={i} className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide${i === 7 ? ' text-right' : ''}`}
                  style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Filas automáticas de módulos */}
            {(laboresCount > 0 || fitoCount > 0 || riegoCount > 0) && (
              <>
                <tr><td colSpan={8} className="px-5 pt-3 pb-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.22)' : '#d1d5db' }}>Calculado desde módulos</p>
                </td></tr>
                {laboresCount > 0 && (() => { const v = laboresPlan - laboresEj; return (
                  <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}>
                    <td className="px-5 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>Mano de obra</span></td>
                    <td className="px-5 py-3 text-xs font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}>{laboresCount} labor{laboresCount !== 1 ? 'es' : ''} programada{laboresCount !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-3" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</td>
                    <td className="px-5 py-3" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(laboresPlan)}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(laboresEj)}</td>
                    <td className="px-5 py-3"><span className="flex items-center gap-1 text-xs font-bold" style={{ color: v >= 0 ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#dc2626') }}>{v > 0 ? <TrendingDown size={11}/> : v < 0 ? <TrendingUp size={11}/> : <Minus size={11}/>}{fmt(Math.abs(v))}</span></td>
                    <td className="px-5 py-3"/>
                  </tr>
                )})()}
                {fitoCount > 0 && (() => { const v = fitoPlan - fitoEj; return (
                  <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}>
                    <td className="px-5 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>Fitosanitario</span></td>
                    <td className="px-5 py-3 text-xs font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}>{fitoCount} producto{fitoCount !== 1 ? 's' : ''} activo{fitoCount !== 1 ? 's' : ''}</td>
                    <td className="px-5 py-3" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</td>
                    <td className="px-5 py-3" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(fitoPlan)}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(fitoEj)}</td>
                    <td className="px-5 py-3"><span className="flex items-center gap-1 text-xs font-bold" style={{ color: v >= 0 ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#dc2626') }}>{v > 0 ? <TrendingDown size={11}/> : v < 0 ? <TrendingUp size={11}/> : <Minus size={11}/>}{fmt(Math.abs(v))}</span></td>
                    <td className="px-5 py-3"/>
                  </tr>
                )})()}
                {riegoCount > 0 && (() => { const v = riegoPlan - riegoEj; return (
                  <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}>
                    <td className="px-5 py-3"><span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>Agua / Riego</span></td>
                    <td className="px-5 py-3 text-xs font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}>{riegoCount} plan{riegoCount !== 1 ? 'es' : ''} de riego</td>
                    <td className="px-5 py-3" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</td>
                    <td className="px-5 py-3" style={{ color: dark ? 'rgba(255,255,255,0.2)' : '#d1d5db' }}>—</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(riegoPlan)}</td>
                    <td className="px-5 py-3 font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(riegoEj)}</td>
                    <td className="px-5 py-3"><span className="flex items-center gap-1 text-xs font-bold" style={{ color: v >= 0 ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#dc2626') }}>{v > 0 ? <TrendingDown size={11}/> : v < 0 ? <TrendingUp size={11}/> : <Minus size={11}/>}{fmt(Math.abs(v))}</span></td>
                    <td className="px-5 py-3"/>
                  </tr>
                )})()}
                {items.length > 0 && (
                  <tr><td colSpan={8} className="px-5 pt-3 pb-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.22)' : '#d1d5db' }}>Otros costos</p>
                  </td></tr>
                )}
              </>
            )}
            {items.length === 0 && laboresCount === 0 && fitoCount === 0 && riegoCount === 0 ? (
              <tr><td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin ítems presupuestados</td></tr>
            ) : items.map(item => {
              const v = item.varianza
              const catLabel = CATS_ALL.find(([k]) => k === item.categoria)?.[1] || item.categoria
              return (
                <tr key={item.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>
                      {catLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: dark ? D.text : '#111827' }}>{item.descripcion}</td>
                  <td className="px-5 py-3.5" style={{ color: dark ? D.sub : '#6b7280' }}>{item.cantidad} {item.unidad}</td>
                  <td className="px-5 py-3.5" style={{ color: dark ? D.sub : '#6b7280' }}>S/. {parseFloat(item.precio_unitario).toFixed(2)}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(item.monto_presupuestado)}</td>
                  <td className="px-5 py-3.5 font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(item.monto_ejecutado)}</td>
                  <td className="px-5 py-3.5">
                    <span className="flex items-center gap-1 text-xs font-bold"
                      style={{ color: v >= 0 ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#dc2626') }}>
                      {v > 0 ? <TrendingDown size={11} /> : v < 0 ? <TrendingUp size={11} /> : <Minus size={11} />}
                      {fmt(Math.abs(v))}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
                      {campana?.estado !== 'cerrada' && <>
                        <button onClick={() => { setForm({ ...item }); setPorM2(''); setModal('edit') }}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={16} /></button>
                        <button onClick={() => del(item.id)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={16} /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <MiniModal dark={dark} title={modal === 'edit' ? 'Editar ítem' : 'Nuevo ítem'} onClose={() => setModal(null)} onSubmit={submit} loading={loading}>
          <div><label style={lst}>Categoría</label>
            <select name="categoria" value={form.categoria} onChange={h} style={ist}>
              {CATS_FORM.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label style={lst}>Descripción *</label><input name="descripcion" value={form.descripcion} onChange={h} style={ist} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label style={lst}>Cantidad *</label>
                {campana?.area && (
                  <span className="text-[11px] font-bold" style={{ color: dark ? '#a78bfa' : '#7c3aed' }}>
                    Área: {campana.area} {campana.unidad_area}
                  </span>
                )}
              </div>
              <input name="cantidad" type="number" step="0.01" value={form.cantidad} onChange={h} style={ist} required />
            </div>
            <div><label style={lst}>Unidad</label>
              <input name="unidad" value={form.unidad} onChange={h} style={ist} list="unidades-pres" placeholder="kg, m, hora…" />
              <datalist id="unidades-pres">
                {['hora','jornal','m','m²','m³','ml','kg','g','t','L','mL','unid.','saco','rollo','caja','bolsa'].map(u => <option key={u} value={u} />)}
              </datalist>
            </div>
          </div>
          {campana?.area && (
            <div className="rounded-xl px-3 py-2.5 space-y-2"
              style={{ backgroundColor: dark ? 'rgba(139,92,246,0.08)' : '#f5f3ff', border: `1px solid ${dark ? 'rgba(139,92,246,0.25)' : '#e9d5ff'}` }}>
              <p className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: dark ? '#a78bfa' : '#7c3aed' }}>
                Calcular por área de terreno
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number" step="0.001" value={porM2} placeholder={`cantidad por ${campana.unidad_area}`}
                  onChange={e => {
                    const v = e.target.value
                    setPorM2(v)
                    if (v && campana?.area) {
                      const total = parseFloat((parseFloat(v) * parseFloat(campana.area)).toFixed(2))
                      setForm(f => ({ ...f, cantidad: String(total) }))
                    }
                  }}
                  style={{ ...ist, flex: 1 }}
                />
                <span className="text-xs font-bold shrink-0" style={{ color: dark ? D.sub : '#6b7280' }}>
                  × {campana.area} {campana.unidad_area}
                </span>
                {porM2 && campana?.area && (
                  <span className="text-xs font-extrabold shrink-0" style={{ color: dark ? '#a78bfa' : '#7c3aed' }}>
                    = {(parseFloat(porM2) * parseFloat(campana.area)).toFixed(2)} {form.unidad}
                  </span>
                )}
              </div>
              <p className="text-[11px]" style={{ color: dark ? 'rgba(167,139,250,0.6)' : '#a78bfa' }}>
                Ingresa cuánto necesitas por {campana.unidad_area} y se calcula la cantidad total automáticamente.
              </p>
            </div>
          )}
          <div>
            <label style={lst}>Precio unitario (S/.) *</label>
            <input name="precio_unitario" type="number" step="0.01" value={form.precio_unitario} onChange={h} style={ist} required />
          </div>
          {modal === 'edit' && (
            <div>
              <label style={lst}>Monto ejecutado (S/.)</label>
              <input name="monto_ejecutado" type="number" step="0.01" value={form.monto_ejecutado} onChange={h} style={ist} placeholder="Lo que realmente gastaste" />
              <p className="text-[11px] mt-1" style={{ color: dark ? D.sub : '#9ca3af' }}>
                Presupuestado: S/. {form.cantidad && form.precio_unitario ? (parseFloat(form.cantidad) * parseFloat(form.precio_unitario)).toFixed(2) : '0.00'}
              </p>
            </div>
          )}
        </MiniModal>
      )}
      {delConfirm && <ConfirmModal dark={dark} message={delConfirm.msg} onConfirm={() => { delConfirm.fn(); setDelConfirm(null) }} onCancel={() => setDelConfirm(null)} />}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: TRAZABILIDAD
══════════════════════════════════════════════════════ */
function TrazabilidadTab({ dark, campanaId, campana }) {
  const [fito, setFito]             = useState([])
  const [riegoPlanes, setRiegoPlanes] = useState([])
  const [labores, setLabores]       = useState([])

  // Indicadores derivados automáticamente de los módulos
  const fitoAplicado       = fito.filter(a => a.estado === 'aplicado')
  const fitoSostenible     = fitoAplicado.filter(a => a.es_sostenible || ['biologico','enmienda','bioestimulante'].includes(a.producto_tipo))
  const pctSostenible      = fitoAplicado.length > 0 ? Math.round((fitoSostenible.length / fitoAplicado.length) * 100) : null
  const tieneRiegoEfic     = riegoPlanes.some(r => r.metodo === 'goteo' || r.metodo === 'aspersion')
  const tieneCtrlBio       = fitoSostenible.some(a => a.producto_tipo === 'biologico')
  const laboresSostenibles = labores.filter(l => l.estado === 'ejecutada' && l.es_sostenible)
  const riegoSostenible    = riegoPlanes.filter(r => r.es_sostenible)
  const indicadoresAuto  = [
    {
      key: 'sin_agroquimicos', activo: pctSostenible !== null,
      label: 'Sin agroquímicos sintéticos',
      valor: pctSostenible !== null ? `${pctSostenible}% de aplicaciones sostenibles (${fitoSostenible.length}/${fitoAplicado.length})` : 'Sin aplicaciones registradas',
      color: pctSostenible === 100 ? 'green' : pctSostenible > 0 ? 'yellow' : 'gray',
      modulo: 'Fitosanitario',
    },
    {
      key: 'riego_eficiente', activo: tieneRiegoEfic,
      label: 'Riego eficiente',
      valor: tieneRiegoEfic ? `Usa goteo o aspersión (${riegoPlanes.filter(r => r.metodo === 'goteo' || r.metodo === 'aspersion').length} plan(es))` : 'Sin riego eficiente registrado',
      color: tieneRiegoEfic ? 'green' : 'gray',
      modulo: 'Riego',
    },
    {
      key: 'control_biologico', activo: tieneCtrlBio,
      label: 'Control biológico',
      valor: tieneCtrlBio ? `${fitoSostenible.filter(a => a.producto_tipo === 'biologico').length} aplicación(es) de productos biológicos` : 'Sin control biológico registrado',
      color: tieneCtrlBio ? 'green' : 'gray',
      modulo: 'Fitosanitario',
    },
    {
      key: 'labores_sostenibles', activo: laboresSostenibles.length > 0,
      label: 'Labores sostenibles',
      valor: laboresSostenibles.length > 0 ? `${laboresSostenibles.length} labor(es) ejecutadas marcadas como sostenibles` : 'Sin labores sostenibles registradas',
      color: laboresSostenibles.length > 0 ? 'green' : 'gray',
      modulo: 'Labores',
    },
    {
      key: 'riego_sostenible', activo: riegoSostenible.length > 0,
      label: 'Prácticas de riego sostenible',
      valor: riegoSostenible.length > 0 ? `${riegoSostenible.length} plan(es) de riego marcados como sostenibles` : 'Sin planes de riego sostenibles',
      color: riegoSostenible.length > 0 ? 'green' : 'gray',
      modulo: 'Riego',
    },
  ]

  const fetchData = useCallback(async () => {
    const [f, r, l] = await Promise.all([
      api.get(`/campanas/${campanaId}/fitosanitario/`),
      api.get(`/campanas/${campanaId}/plan-riego/`),
      api.get(`/campanas/${campanaId}/labores/`),
    ])
    setFito(f.data); setRiegoPlanes(r.data); setLabores(l.data)
  }, [campanaId])
  useEffect(() => { fetchData() }, [fetchData])

  const ist = ist_(dark); const lst = lst_(dark)

  // Build unified timeline from module records only
  const timeline = [
    ...labores.filter(l => l.fecha_ejecutada).map(l => ({ fecha: l.fecha_ejecutada, tipo: 'labor', label: l.tipo_labor_nombre, detalle: `${l.cantidad_ejecutada ?? l.cantidad_programada} ${l.tipo_labor_unidad}`, sostenible: l.es_sostenible })),
    ...fito.filter(a => a.estado === 'aplicado' && a.fecha_aplicada).map(a => ({ fecha: a.fecha_aplicada, tipo: 'aplicacion', label: `Aplicación: ${a.producto_nombre}`, detalle: `${a.dosis} ${a.unidad_codigo || ''}${a.area_aplicada ? ` · ${a.area_aplicada} m²` : ''}`, sostenible: a.es_sostenible || ['biologico','enmienda','bioestimulante'].includes(a.producto_tipo) })),
    ...riegoPlanes
      .filter(r => (r.completado || r.es_sostenible) && (r.fecha_fin || r.fecha_inicio))
      .map(r => ({
        fecha: r.fecha_fin || r.fecha_inicio,
        tipo: 'riego',
        label: `Riego: ${r.nombre}${!r.completado ? ' · en curso' : ''}`,
        detalle: `${r.litros_por_m2} L/m² · ${r.metodo_display}${r.operario ? ' · ' + r.operario : ''}`,
        sostenible: r.es_sostenible,
      })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const TIPO_ICON_COLOR = {
    labor:     { color: dark ? '#60a5fa' : '#2563eb', label: 'Labor'      },
    aplicacion:{ color: dark ? '#f87171' : '#dc2626', label: 'Aplicación' },
    riego:     { color: dark ? '#38bdf8' : '#0284c7', label: 'Riego'      },
  }

  const exportPDF = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Trazabilidad — ${campana?.codigo}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
      h1 { font-size: 20px; margin-bottom: 4px; } h2 { font-size: 14px; margin: 24px 0 8px; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
      .meta { color: #6b7280; font-size: 11px; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; }
      td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
      .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
      .verde { background: #dcfce7; color: #15803d; } .azul { background: #dbeafe; color: #1d4ed8; }
      .rojo { background: #fee2e2; color: #dc2626; } .gris { background: #f3f4f6; color: #6b7280; }
      @media print { body { padding: 16px; } }
    </style></head><body>
    <h1>Trazabilidad Agroecológica</h1>
    <div class="meta">
      <strong>Campaña:</strong> ${campana?.codigo} &nbsp;|&nbsp;
      <strong>Variedad:</strong> ${campana?.variedad_str} &nbsp;|&nbsp;
      <strong>Biohuerto:</strong> ${campana?.biohuerto_nombre} &nbsp;|&nbsp;
      <strong>Período:</strong> ${campana?.fecha_inicio} ${campana?.fecha_fin ? '→ ' + campana.fecha_fin : ''}<br>
      <strong>Generado:</strong> ${new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>

    <h2>Indicadores de Sostenibilidad</h2>
    <table><thead><tr><th>Indicador</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>
    <tr><td>Sin agroquímicos sintéticos</td><td><span class="badge ${pctSostenible === 100 ? 'verde' : pctSostenible > 0 ? 'azul' : 'gris'}">${pctSostenible !== null ? pctSostenible + '%' : '—'}</span></td><td>${pctSostenible !== null ? fitoSostenible.length + '/' + fitoAplicado.length + ' aplicaciones sostenibles' : 'Sin aplicaciones'}</td></tr>
    <tr><td>Riego eficiente</td><td><span class="badge ${tieneRiegoEfic ? 'verde' : 'gris'}">${tieneRiegoEfic ? 'Sí' : 'No'}</span></td><td>${tieneRiegoEfic ? 'Usa goteo o aspersión' : 'Sin riego eficiente'}</td></tr>
    <tr><td>Control biológico</td><td><span class="badge ${tieneCtrlBio ? 'verde' : 'gris'}">${tieneCtrlBio ? 'Sí' : 'No'}</span></td><td>${tieneCtrlBio ? fitoSostenible.filter(a => a.producto_tipo === 'biologico').length + ' aplicación(es) biológicas' : 'Sin control biológico'}</td></tr>
    <tr><td>Labores sostenibles</td><td><span class="badge ${laboresSostenibles.length > 0 ? 'verde' : 'gris'}">${laboresSostenibles.length > 0 ? 'Sí' : 'No'}</span></td><td>${laboresSostenibles.length > 0 ? laboresSostenibles.length + ' labor(es) ejecutadas sostenibles' : 'Sin labores sostenibles'}</td></tr>
    <tr><td>Prácticas de riego sostenible</td><td><span class="badge ${riegoSostenible.length > 0 ? 'verde' : 'gris'}">${riegoSostenible.length > 0 ? 'Sí' : 'No'}</span></td><td>${riegoSostenible.length > 0 ? riegoSostenible.length + ' plan(es) de riego sostenibles' : 'Sin riego sostenible'}</td></tr>
    </tbody></table>

    <h2>Aplicaciones Fitosanitarias</h2>
    <table><thead><tr><th>Fecha</th><th>Producto</th><th>Dosis</th><th>Área</th><th>Operario</th><th>Sostenible</th></tr></thead><tbody>
    ${fito.filter(a => a.estado === 'aplicado').length ? fito.filter(a => a.estado === 'aplicado').map(a => `<tr><td>${a.fecha_aplicada ?? '—'}</td><td>${a.producto_nombre}</td><td>${a.dosis} ${a.unidad_codigo ?? ''}</td><td>${a.area_aplicada ? a.area_aplicada + ' m²' : '—'}</td><td>${a.operario || '—'}</td><td>${a.es_sostenible ? '<span class="badge verde">Sí</span>' : '—'}</td></tr>`).join('') : '<tr><td colspan="6" style="color:#9ca3af;text-align:center">Sin aplicaciones</td></tr>'}
    </tbody></table>

    <h2>Planes de Riego Completados</h2>
    <table><thead><tr><th>Nombre</th><th>Método</th><th>L/m²</th><th>Fertirrigación</th><th>Operario</th><th>Costo agua</th><th>Sostenible</th></tr></thead><tbody>
    ${riegoPlanes.filter(r => r.completado).length ? riegoPlanes.filter(r => r.completado).map(r => `<tr><td>${r.nombre}</td><td>${r.metodo_display}</td><td>${r.litros_por_m2} L</td><td>${r.fertilizante_nombre ?? '—'}</td><td>${r.operario || '—'}</td><td>${r.costo_agua_total ? 'S/. ' + parseFloat(r.costo_agua_total).toFixed(2) : '—'}</td><td>${r.es_sostenible ? '<span class="badge verde">Sí</span>' : '—'}</td></tr>`).join('') : '<tr><td colspan="7" style="color:#9ca3af;text-align:center">Sin planes completados</td></tr>'}
    </tbody></table>

    <h2>Labores Ejecutadas</h2>
    <table><thead><tr><th>Fecha</th><th>Labor</th><th>Cantidad</th><th>Operario</th><th>Sostenible</th></tr></thead><tbody>
    ${labores.filter(l => l.estado === 'ejecutada').length ? labores.filter(l => l.estado === 'ejecutada').map(l => `<tr><td>${l.fecha_ejecutada}</td><td>${l.tipo_labor_nombre}</td><td>${l.cantidad_ejecutada ?? l.cantidad_programada} ${l.tipo_labor_unidad}</td><td>${l.operario || '—'}</td><td>${l.es_sostenible ? '<span class="badge verde">Sí</span>' : '—'}</td></tr>`).join('') : '<tr><td colspan="5" style="color:#9ca3af;text-align:center">Sin labores ejecutadas</td></tr>'}
    </tbody></table>
    </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <button onClick={exportPDF}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-all"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.text : '#374151', border: `1px solid ${dark ? D.btnBorder : '#e5e7eb'}` }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6' }}>
          <Printer size={14} /> Exportar PDF
        </button>
      </div>

      {/* Sostenibilidad */}
      <div className="space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? D.sub : '#6b7280' }}>Indicadores de sostenibilidad</p>

        {/* Auto-derivados desde módulos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {indicadoresAuto.map(ind => {
            const isGreen  = ind.color === 'green'
            const isYellow = ind.color === 'yellow'
            const bg  = isGreen ? (dark ? 'rgba(22,163,74,0.12)' : '#f0fdf4') : isYellow ? (dark ? 'rgba(251,191,36,0.10)' : '#fffbeb') : (dark ? 'rgba(255,255,255,0.04)' : '#f9fafb')
            const brd = isGreen ? (dark ? 'rgba(22,163,74,0.30)' : '#bbf7d0') : isYellow ? (dark ? 'rgba(251,191,36,0.25)' : '#fde68a') : (dark ? 'rgba(255,255,255,0.07)' : '#e5e7eb')
            const clr = isGreen ? (dark ? '#4ade80' : '#15803d') : isYellow ? (dark ? '#fbbf24' : '#b45309') : (dark ? 'rgba(255,255,255,0.30)' : '#9ca3af')
            return (
              <div key={ind.key} className="px-3 py-2.5 rounded-xl" style={{ backgroundColor: bg, border: `1px solid ${brd}` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: clr }} />
                  <span className="text-[11px] font-black uppercase tracking-wide" style={{ color: clr }}>{ind.label}</span>
                </div>
                <p className="text-[12px]" style={{ color: dark ? 'rgba(255,255,255,0.50)' : '#6b7280' }}>{ind.valor}</p>
                <p className="text-[10px] mt-1 font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.22)' : '#9ca3af' }}>Módulo: {ind.modulo}</p>
              </div>
            )
          })}
        </div>

        {/* Planes de riego sostenibles sin fecha (no aparecen en timeline) */}
        {riegoSostenible.filter(r => !r.fecha_fin && !r.fecha_inicio).length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: dark ? D.sub : '#9ca3af' }}>Riego sostenible sin fecha asignada</p>
            {riegoSostenible.filter(r => !r.fecha_fin && !r.fecha_inicio).map(r => (
              <div key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                style={{ backgroundColor: dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.20)' : '#bbf7d0'}` }}>
                <Leaf size={13} style={{ color: dark ? '#4ade80' : '#16a34a', flexShrink: 0 }} />
                <span className="text-xs font-semibold flex-1" style={{ color: dark ? '#4ade80' : '#15803d' }}>{r.nombre}</span>
                <span className="text-[11px]" style={{ color: dark ? D.sub : '#6b7280' }}>{r.litros_por_m2} L/m² · {r.metodo_display}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>sostenible</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide mb-3" style={{ color: dark ? D.sub : '#6b7280' }}>Línea de tiempo</p>
        {timeline.length === 0
          ? <p className="text-sm text-center py-8" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin actividades registradas aún</p>
          : (
            <div className="space-y-2">
              {timeline.map((ev, i) => {
                const tc = TIPO_ICON_COLOR[ev.tipo]
                return (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: tc.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: tc.color }}>{tc.label}</span>
                        <span className="text-xs font-semibold" style={{ color: dark ? D.text : '#111827' }}>{ev.label}</span>
                        {ev.sostenible && <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>sostenible</span>}
                      </div>
                      <p className="text-[13px] mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>{ev.detalle}</p>
                    </div>
                    <span className="text-[13px] shrink-0" style={{ color: dark ? D.sub : '#9ca3af' }}>{ev.fecha}</span>
                  </div>
                )
              })}
            </div>
          )}
      </div>

    </div>
  )
}

/* ══════════════════════════════════════════════════════
   ALERTAS TAB
══════════════════════════════════════════════════════ */
const ALERTA_META = {
  riego:         { label: 'Riego',               icon: Droplet,     dc: '#38bdf8', lc: '#0284c7', dbg: 'rgba(56,189,248,0.15)',  lbg: '#e0f2fe' },
  fertilizacion: { label: 'Fertilización',       icon: Sprout,      dc: '#4ade80', lc: '#16a34a', dbg: 'rgba(74,222,128,0.15)',  lbg: '#dcfce7' },
  control:       { label: 'Control preventivo',  icon: ShieldAlert, dc: '#fb923c', lc: '#ea580c', dbg: 'rgba(251,146,60,0.15)',  lbg: '#ffedd5' },
  cosecha:       { label: 'Cosecha',             icon: Scissors,    dc: '#facc15', lc: '#ca8a04', dbg: 'rgba(250,204,21,0.15)',  lbg: '#fef9c3' },
  seguridad:     { label: 'Intervalo seguridad', icon: ShieldAlert, dc: '#f87171', lc: '#dc2626', dbg: 'rgba(248,113,113,0.15)', lbg: '#fee2e2' },
  labor:         { label: 'Labor',               icon: Wrench,      dc: '#a78bfa', lc: '#7c3aed', dbg: 'rgba(167,139,250,0.15)', lbg: '#ede9fe' },
  rotacion:      { label: 'Rotación',            icon: RotateCcw,   dc: '#34d399', lc: '#059669', dbg: 'rgba(52,211,153,0.15)',  lbg: '#d1fae5' },
  otro:          { label: 'Otro',                icon: Bell,        dc: '#94a3b8', lc: '#64748b', dbg: 'rgba(148,163,184,0.15)', lbg: '#f1f5f9' },
}

const PRIORIDAD_META = {
  alta:  { label: 'Alta',  dc: '#f87171', lc: '#dc2626', dbg: 'rgba(248,113,113,0.18)', lbg: '#fee2e2' },
  media: { label: 'Media', dc: '#fbbf24', lc: '#d97706', dbg: 'rgba(251,191,36,0.18)',  lbg: '#fef3c7' },
  baja:  { label: 'Baja',  dc: '#4ade80', lc: '#16a34a', dbg: 'rgba(74,222,128,0.18)',  lbg: '#dcfce7' },
}

function AlertasTab({ dark, campanaId }) {
  const [alertas, setAlertas]       = useState([])
  const [loading, setLoading]       = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sortBy, setSortBy]         = useState('fecha')   // 'fecha' | 'prioridad'
  const [filterTipo, setFilterTipo] = useState('')
  const [filterPrio, setFilterPrio] = useState('')
  const [showDone, setShowDone]     = useState(false)

  const load = useCallback(async () => {
    try {
      const r = await api.get(`/campanas/${campanaId}/alertas/`)
      setAlertas(r.data)
    } catch { toast.error('Error cargando alertas') }
    finally { setLoading(false) }
  }, [campanaId])

  useEffect(() => { load() }, [load])

  const generar = async () => {
    setGenerating(true)
    try {
      const r = await api.post(`/campanas/${campanaId}/alertas/generar/`)
      setAlertas(r.data.alertas)
      toast.success(`${r.data.generadas} alerta${r.data.generadas !== 1 ? 's' : ''} generada${r.data.generadas !== 1 ? 's' : ''}`)
    } catch { toast.error('Error generando alertas') }
    finally { setGenerating(false) }
  }

  const toggleCompletada = async (a) => {
    try {
      const r = await api.patch(`/campanas/alertas/${a.id}/`, { completada: !a.completada })
      setAlertas(prev => prev.map(x => x.id === a.id ? r.data : x))
    } catch { toast.error('Error actualizando alerta') }
  }

  const eliminar = async (id) => {
    try {
      await api.delete(`/campanas/alertas/${id}/`)
      setAlertas(prev => prev.filter(x => x.id !== id))
    } catch { toast.error('Error eliminando alerta') }
  }

  const PRIO_ORDER = { alta: 0, media: 1, baja: 2 }

  const visible = alertas
    .filter(a => showDone ? true : !a.completada)
    .filter(a => filterTipo ? a.tipo === filterTipo : true)
    .filter(a => filterPrio ? a.prioridad === filterPrio : true)
    .sort((a, b) => {
      if (sortBy === 'prioridad') return (PRIO_ORDER[a.prioridad] ?? 9) - (PRIO_ORDER[b.prioridad] ?? 9)
      return new Date(a.fecha_programada) - new Date(b.fecha_programada)
    })

  const pendientes = alertas.filter(a => !a.completada).length
  const ist = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    borderRadius: '10px', color: dark ? D.text : '#111827', fontSize: '13px',
    cursor: 'pointer', padding: '6px 10px',
  }

  if (loading) return <div className="py-10 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Cargando alertas…</div>

  return (
    <div className="space-y-4">
      {/* ── Encabezado + botón generar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BellRing size={18} style={{ color: dark ? '#fbbf24' : '#d97706' }} />
          <span className="font-bold text-sm" style={{ color: dark ? D.text : '#111827' }}>
            Alertas y recordatorios
          </span>
          {pendientes > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: dark ? 'rgba(248,113,113,0.20)' : '#fee2e2', color: dark ? '#f87171' : '#dc2626' }}>
              {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button onClick={generar} disabled={generating}
          className="flex items-center gap-2 btn-primary text-xs px-3 py-2 rounded-xl disabled:opacity-50">
          <RefreshCw size={13} className={generating ? 'animate-spin' : ''} />
          {generating ? 'Generando…' : 'Generar alertas'}
        </button>
      </div>

      {/* ── Filtros y ordenamiento ── */}
      <div className="flex flex-wrap gap-2">
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={ist}>
          <option value="fecha">Ordenar: por fecha</option>
          <option value="prioridad">Ordenar: por prioridad</option>
        </select>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)} style={ist}>
          <option value="">Todos los tipos</option>
          {Object.entries(ALERTA_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select value={filterPrio} onChange={e => setFilterPrio(e.target.value)} style={ist}>
          <option value="">Todas las prioridades</option>
          {Object.entries(PRIORIDAD_META).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button onClick={() => setShowDone(s => !s)} style={{
          ...ist,
          backgroundColor: showDone ? (dark ? 'rgba(99,102,241,0.20)' : '#ede9fe') : (dark ? D.inputBg : '#f9fafb'),
          color: showDone ? (dark ? '#818cf8' : '#4f46e5') : (dark ? D.sub : '#6b7280'),
        }}>
          {showDone ? 'Ocultar completadas' : 'Ver completadas'}
        </button>
      </div>

      {/* ── Lista de alertas ── */}
      {visible.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <Bell size={32} className="mx-auto mb-2" style={{ color: dark ? D.sub : '#d1d5db' }} />
          <p className="text-sm font-semibold" style={{ color: dark ? D.sub : '#9ca3af' }}>
            {alertas.length === 0 ? 'No hay alertas aún. Usa "Generar alertas" para crearlas automáticamente.' : 'Sin alertas para los filtros seleccionados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map(a => {
            const meta  = ALERTA_META[a.tipo]  || ALERTA_META.otro
            const pMeta = PRIORIDAD_META[a.prioridad] || PRIORIDAD_META.media
            const Icon  = meta.icon
            const vencida = !a.completada && a.dias_restantes < 0
            const hoy     = !a.completada && a.dias_restantes === 0
            const pronto  = !a.completada && a.dias_restantes > 0 && a.dias_restantes <= 3
            return (
              <div key={a.id} style={{
                backgroundColor: a.completada
                  ? (dark ? 'rgba(255,255,255,0.02)' : '#f9fafb')
                  : (dark ? meta.dbg : meta.lbg),
                border: `1.5px solid ${a.completada
                  ? (dark ? 'rgba(255,255,255,0.06)' : '#e5e7eb')
                  : (dark ? meta.dc + '55' : meta.lc + '44')}`,
                borderRadius: '14px', padding: '12px 14px',
                opacity: a.completada ? 0.55 : 1,
                transition: 'opacity 0.2s',
              }}>
                <div className="flex items-start gap-3">
                  {/* Icono tipo */}
                  <div className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: dark ? meta.dbg : meta.lbg, border: `1px solid ${dark ? meta.dc + '44' : meta.lc + '33'}` }}>
                    <Icon size={15} style={{ color: dark ? meta.dc : meta.lc }} />
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold" style={{
                        color: a.completada ? (dark ? D.sub : '#9ca3af') : (dark ? D.text : '#111827'),
                        textDecoration: a.completada ? 'line-through' : 'none',
                      }}>{a.titulo}</span>
                      {/* Badge prioridad */}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: dark ? pMeta.dbg : pMeta.lbg, color: dark ? pMeta.dc : pMeta.lc }}>
                        {pMeta.label}
                      </span>
                      {/* Badge urgencia */}
                      {vencida && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Vencida</span>}
                      {hoy     && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-600">Hoy</span>}
                      {pronto  && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">En {a.dias_restantes}d</span>}
                    </div>
                    {a.descripcion && (
                      <p className="text-xs leading-relaxed" style={{ color: dark ? D.sub : '#6b7280' }}>{a.descripcion}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[11px] font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}>
                        <Calendar size={11} className="inline mr-1" />{a.fecha_programada}
                        {!a.completada && a.dias_restantes !== undefined && (
                          <span style={{ color: vencida ? (dark ? '#f87171' : '#dc2626') : hoy ? (dark ? '#fb923c' : '#ea580c') : (dark ? D.sub : '#9ca3af') }}>
                            {' '}({a.dias_restantes === 0 ? 'hoy' : a.dias_restantes > 0 ? `en ${a.dias_restantes}d` : `hace ${Math.abs(a.dias_restantes)}d`})
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => toggleCompletada(a)} title={a.completada ? 'Reabrir' : 'Marcar completada'}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}` }}>
                      {a.completada
                        ? <Circle size={13} style={{ color: dark ? D.sub : '#9ca3af' }} />
                        : <CheckCircle2 size={13} style={{ color: dark ? '#4ade80' : '#16a34a' }} />}
                    </button>
                    <button onClick={() => eliminar(a.id)} title="Eliminar"
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}` }}>
                      <X size={13} style={{ color: dark ? '#f87171' : '#dc2626' }} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════
   TAB: DIAGNÓSTICOS
══════════════════════════════════════════════════════ */
function DiagnosticosTab({ dark, campanaId }) {
  const [diagnosticos, setDiagnosticos] = useState([])
  const [loading, setLoading]           = useState(true)
  const [selected, setSelected]         = useState(null)

  const fetchDiagnosticos = useCallback(async () => {
    setLoading(true)
    try {
      const r = await api.get(`/diagnosticos/?campana=${campanaId}`)
      setDiagnosticos(r.data)
    } catch { toast.error('Error al cargar diagnósticos.') }
    finally { setLoading(false) }
  }, [campanaId])

  useEffect(() => { fetchDiagnosticos() }, [fetchDiagnosticos])

  const SEV_CFG = {
    leve:     { bg: dark ? 'rgba(74,222,128,0.15)'  : '#dcfce7', c: dark ? '#4ade80' : '#15803d', label: 'Leve'     },
    moderado: { bg: dark ? 'rgba(251,191,36,0.15)'  : '#fef9c3', c: dark ? '#fbbf24' : '#d97706', label: 'Moderado' },
    grave:    { bg: dark ? 'rgba(239,68,68,0.15)'   : '#fee2e2', c: dark ? '#f87171' : '#dc2626', label: 'Grave'    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? D.sub : '#6b7280' }}>
          {diagnosticos.length} diagnóstico{diagnosticos.length !== 1 ? 's' : ''} en esta campaña
        </p>
        <Link to="/diagnostico"
          className="flex items-center gap-1.5 btn-primary text-sm">
          <Plus size={13} /> Nuevo diagnóstico
        </Link>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Cargando...</div>
      ) : diagnosticos.length === 0 ? (
        <div className="py-12 flex flex-col items-center gap-3" style={{ color: dark ? D.sub : '#9ca3af' }}>
          <ShieldAlert size={36} />
          <p className="text-sm font-semibold">Sin diagnósticos registrados para esta campaña.</p>
          <Link to="/diagnostico" className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={13} /> Realizar diagnóstico
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {diagnosticos.map(d => {
            const sev = SEV_CFG[d.severidad] || SEV_CFG.moderado
            return (
              <div key={d.id} onClick={() => setSelected(d)}
                className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all"
                style={{ backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}` }}
                onMouseEnter={e => e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.18)' : '#d1d5db'}
                onMouseLeave={e => e.currentTarget.style.borderColor = dark ? D.cardBorder : '#e5e7eb'}>
                {d.imagen_url ? (
                  <img src={d.imagen_url} alt="dx"
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                    style={{ border: `1px solid ${dark ? D.divider : '#e5e7eb'}` }} />
                ) : (
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}>
                    <ShieldAlert size={20} style={{ color: dark ? D.sub : '#9ca3af' }} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                      {d.diagnostico_probable}
                    </p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: sev.bg, color: sev.c }}>{sev.label}</span>
                    {d.metodo === 'imagen' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: dark ? 'rgba(96,165,250,0.15)' : '#dbeafe', color: dark ? '#60a5fa' : '#2563eb' }}>
                        Por imagen
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate" style={{ color: dark ? D.sub : '#6b7280' }}>
                    {d.parte_afectada && <span className="font-semibold">{d.parte_afectada} · </span>}
                    {d.causa_probable}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: dark ? 'rgba(255,255,255,0.25)' : '#9ca3af' }}>{d.fecha_hora}</p>
                </div>
                <Eye size={14} style={{ color: dark ? D.sub : '#9ca3af', flexShrink: 0, marginTop: 3 }} />
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md rounded-2xl shadow-2xl z-10 flex flex-col"
            style={{ backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb', maxHeight: '90vh' }}>
            {selected.imagen_url && (
              <img src={selected.imagen_url} alt="dx" className="w-full h-44 object-cover rounded-t-2xl" />
            )}
            <div className="overflow-y-auto thin-scroll p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Detalle del diagnóstico</h3>
                <button onClick={() => setSelected(null)} style={{ color: D.sub }}><X size={16} /></button>
              </div>
              {(() => {
                const sev = SEV_CFG[selected.severidad] || SEV_CFG.moderado
                return (
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2 py-1 rounded-full"
                      style={{ backgroundColor: sev.bg, color: sev.c }}>{sev.label}</span>
                    {selected.metodo === 'imagen' && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{ backgroundColor: dark ? 'rgba(96,165,250,0.15)' : '#dbeafe', color: dark ? '#60a5fa' : '#2563eb' }}>
                        Por imagen
                      </span>
                    )}
                  </div>
                )
              })()}
              <IR dark={dark} label="Campaña"        value={selected.campana_codigo} />
              <IR dark={dark} label="Variedad"       value={selected.variedad_str} />
              <IR dark={dark} label="Parte afectada" value={selected.parte_afectada} />
              <IR dark={dark} label="Fecha y hora"   value={selected.fecha_hora} />
              <div className="space-y-3 pt-1">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide mb-1" style={{ color: dark ? '#fbbf24' : '#d97706' }}>
                    Diagnóstico probable
                  </p>
                  <p className="text-sm font-bold" style={{ color: dark ? D.text : '#111827' }}>{selected.diagnostico_probable}</p>
                </div>
                {selected.causa_probable && (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide mb-1" style={{ color: dark ? D.sub : '#9ca3af' }}>Causa probable</p>
                    <p className="text-xs" style={{ color: dark ? D.text : '#374151' }}>{selected.causa_probable}</p>
                  </div>
                )}
                {selected.recomendacion && (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide mb-1" style={{ color: dark ? '#4ade80' : '#15803d' }}>Recomendación</p>
                    <p className="text-xs" style={{ color: dark ? D.text : '#374151' }}>{selected.recomendacion}</p>
                  </div>
                )}
                {selected.acciones_preventivas?.length > 0 && (
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide mb-1" style={{ color: dark ? D.sub : '#9ca3af' }}>Acciones preventivas</p>
                    <ul className="space-y-1">
                      {selected.acciones_preventivas.map((a, i) => (
                        <li key={i} className="flex gap-2 text-xs" style={{ color: dark ? D.text : '#374151' }}>
                          <span style={{ color: dark ? '#4ade80' : '#15803d', flexShrink: 0 }}>·</span>{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CampanaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [campana, setCampana]         = useState(null)
  const [loading, setLoading]         = useState(true)
  const [tab, setTab]                 = useState('labores')
  const [etapaFilter, setEtapaFilter] = useState('')
  const [showEtapaBar, setShowEtapaBar] = useState(false)
  const [cicloConfirm, setCicloConfirm] = useState(null)
  const [estadoModal, setEstadoModal]   = useState(null)

  const fetch = useCallback(async () => {
    try { const r = await api.get(`/campanas/${id}/`); setCampana(r.data) }
    catch { toast.error('No se encontró la campaña.'); navigate('/campanas') }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { fetch() }, [fetch])

  const applyCiclo = async (ciclo, clearIncompat = false, labIncompat = [], fitoIncompat = []) => {
    try {
      if (clearIncompat) {
        await Promise.all([
          ...labIncompat.map(l  => api.patch(`/campanas/labores/${l.id}/`,       { etapa: '' })),
          ...fitoIncompat.map(f => api.patch(`/campanas/fitosanitario/${f.id}/`, { etapa: '' })),
        ])
      }
      await api.patch(`/campanas/${id}/`, { tipo_ciclo: ciclo })
      setCampana(c => {
        const tc = ciclo || c.variedad_tipo_ciclo
        const fase = tc === 'perenne' ? (c.numero_ciclo === 1 ? 'establecimiento' : 'produccion') : 'anual'
        return { ...c, tipo_ciclo: ciclo, tipo_ciclo_efectivo: tc, fase_ciclo: fase }
      })
      setEtapaFilter('')
      setCicloConfirm(null)
      toast.success(ciclo ? `Ciclo cambiado a ${ciclo}` : 'Ciclo heredado de la variedad')
    } catch { toast.error('Error al cambiar ciclo.') }
  }

  const changeCiclo = async ciclo => {
    const efectivo = ciclo || campana.variedad_tipo_ciclo
    const validas  = new Set(ETAPAS_POR_CICLO[efectivo] ?? [])
    try {
      const [labRes, fitoRes] = await Promise.all([
        api.get(`/campanas/${id}/labores/`),
        api.get(`/campanas/${id}/fitosanitario/`),
      ])
      const labIncompat  = labRes.data.filter(l  => l.etapa  && !validas.has(l.etapa))
      const fitoIncompat = fitoRes.data.filter(f => f.etapa  && !validas.has(f.etapa))
      if (labIncompat.length > 0 || fitoIncompat.length > 0) {
        setCicloConfirm({ ciclo, labIncompat, fitoIncompat })
        return
      }
      await applyCiclo(ciclo)
    } catch { toast.error('Error al cambiar ciclo.') }
  }

  const changeEstado = async nuevoEstado => {
    try {
      await api.patch(`/campanas/${id}/`, { estado: nuevoEstado })
      const labels = { planificada: 'Planificada', activa: 'Activa', cerrada: 'Cerrada', cancelada: 'Cancelada' }
      setCampana(c => ({ ...c, estado: nuevoEstado, estado_display: labels[nuevoEstado] }))
      setEstadoModal(null)
      toast.success({ activa: 'Campaña iniciada.', cerrada: 'Campaña cerrada.', cancelada: 'Campaña cancelada.' }[nuevoEstado])
    } catch { toast.error('Error al cambiar el estado.') }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!campana) return null

  const etapasValidas = etapasPorCiclo(campana.fase_ciclo || campana.tipo_ciclo_efectivo)
  const ec = dark ? ESTADO_COLOR[campana.estado]?.dark : ESTADO_COLOR[campana.estado]?.light
  const cardStyle = { backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px' }
  const handleTabChange = key => {
    setTab(key); setEtapaFilter('')
    if (key !== 'labores' && key !== 'fitosanitario') setShowEtapaBar(false)
  }

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Campañas', to: '/campanas' }, { label: campana.variedad_str }]} />

      {/* ── Encabezado ── */}
      <div style={{ ...cardStyle, padding: '20px 24px 18px' }}>

        {/* Fila 1: código + estado + botones de acción */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg"
              style={{ backgroundColor: dark ? 'rgba(96,165,250,0.12)' : '#eff6ff', color: dark ? '#60a5fa' : '#2563eb' }}>
              {campana.codigo}
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
              style={{ backgroundColor: ec?.bg, color: ec?.c }}>
              {campana.estado_display}
            </span>
            {campana.variedad_tipo_ciclo === 'perenne' && (() => {
              const fase = campana.fase_ciclo
              const isEst = fase === 'establecimiento'
              return (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isEst
                      ? dark ? 'rgba(251,191,36,0.15)' : '#fef9c3'
                      : dark ? 'rgba(52,211,153,0.15)' : '#d1fae5',
                    color: isEst
                      ? dark ? '#fbbf24' : '#b45309'
                      : dark ? '#34d399' : '#065f46',
                  }}>
                  {isEst ? `Establecimiento · Ciclo ${campana.numero_ciclo}` : `Producción · Ciclo ${campana.numero_ciclo}`}
                </span>
              )
            })()}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {campana.estado === 'planificada' && (
              <button onClick={() => setEstadoModal('activa')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: '#16a34a', color: '#fff', border: '1px solid #16a34a' }}>
                <Play size={12} fill="currentColor" /> Iniciar campaña
              </button>
            )}
            {campana.estado === 'activa' && (
              <>
                <button onClick={() => setEstadoModal('cancelada')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: dark ? 'rgba(239,68,68,0.10)' : '#fef2f2', color: dark ? '#f87171' : '#dc2626', border: `1px solid ${dark ? 'rgba(239,68,68,0.25)' : '#fecaca'}` }}>
                  <X size={12} /> Cancelar
                </button>
                <button onClick={() => setEstadoModal('cerrada')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                  style={{ backgroundColor: dark ? D.btnIdle : '#f3f4f6', color: dark ? D.sub : '#374151', border: `1px solid ${dark ? D.btnBorder : '#e5e7eb'}` }}>
                  <CheckCircle2 size={12} /> Cerrar campaña
                </button>
              </>
            )}
            {campana.tiene_cosecha ? (
              <Link to={`/cosechas`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ backgroundColor: dark ? 'rgba(96,165,250,0.15)' : '#dbeafe', color: dark ? '#60a5fa' : '#1d4ed8', border: `1px solid ${dark ? 'rgba(96,165,250,0.35)' : '#93c5fd'}` }}>
                <Scissors size={13} /> Ver cosecha registrada
              </Link>
            ) : campana.lista_para_cosechar ? (
              <Link to={`/cosechas/nueva?campana=${id}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                style={{ backgroundColor: dark ? 'rgba(22,163,74,0.20)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d', border: `1px solid ${dark ? 'rgba(22,163,74,0.4)' : '#86efac'}` }}>
                <Scissors size={13} /> Registrar cosecha
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                title={`Pendiente: ${[campana.labores_pendientes > 0 && `${campana.labores_pendientes} labor(es)`, campana.fito_pendientes > 0 && `${campana.fito_pendientes} fitosanitario(s)`, campana.riego_pendientes > 0 && `${campana.riego_pendientes} plan(es) de riego`].filter(Boolean).join(', ')}`}
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6', color: dark ? 'rgba(255,255,255,0.25)' : '#d1d5db', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#e5e7eb'}`, cursor: 'not-allowed' }}>
                <Scissors size={13} /> Registrar cosecha
              </div>
            )}
          </div>
        </div>

        {/* Fila 2: nombre + biohuerto */}
        <div className="mt-3 mb-4">
          <h1 className="text-xl font-extrabold leading-tight" style={{ color: dark ? D.text : '#111827' }}>
            {campana.variedad_str}
          </h1>
          <div className="flex items-center gap-1.5 mt-1.5">
            <Leaf size={13} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
            <span className="text-sm font-semibold" style={{ color: dark ? '#4ade80' : '#16a34a' }}>
              {campana.biohuerto_nombre}
            </span>
          </div>
        </div>

        {/* Divisor */}
        <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}`, marginBottom: '16px' }} />

        {/* Fila 3: datos en chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {[
            { label: 'Inicio',  value: campana.fecha_inicio,           ico: Calendar, dim: false },
            { label: 'Fin',     value: campana.fecha_fin || '—',        ico: Calendar, dim: !campana.fecha_fin },
            { label: 'Área',    value: `${campana.area} ${campana.unidad_area}`, ico: null,     dim: false },
          ].map(({ label, value, ico: Ico, dim }) => (
            <div key={label} style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', borderRadius: '12px', padding: '10px 14px', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}` }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: dark ? D.sub : '#9ca3af' }}>{label}</p>
              <div className="flex items-center gap-1.5">
                {Ico && <Ico size={13} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />}
                <span className="text-sm font-bold" style={{ color: dim ? (dark ? 'rgba(255,255,255,0.20)' : '#d1d5db') : (dark ? D.text : '#111827') }}>{value}</span>
              </div>
            </div>
          ))}
          {campana.objetivo_cosecha && (
            <div style={{ backgroundColor: dark ? 'rgba(22,163,74,0.06)' : '#f0fdf4', borderRadius: '12px', padding: '10px 14px', border: `1px solid ${dark ? 'rgba(22,163,74,0.15)' : '#bbf7d0'}` }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: dark ? '#4ade80' : '#16a34a' }}>Meta cosecha</p>
              <span className="text-sm font-bold" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                {campana.objetivo_cosecha} {campana.unidad_cosecha}
              </span>
            </div>
          )}
          {campana.precio_venta_estimado && (
            <div style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', borderRadius: '12px', padding: '10px 14px', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}` }}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: dark ? D.sub : '#9ca3af' }}>Precio est.</p>
              <span className="text-sm font-bold" style={{ color: dark ? D.text : '#111827' }}>
                S/. {parseFloat(campana.precio_venta_estimado).toFixed(2)}/{campana.unidad_cosecha}
              </span>
            </div>
          )}
        </div>

        {/* Divisor */}
        <div style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}`, margin: '16px 0 14px' }} />

        {/* Fila 4: contadores de pendientes */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { icon: ClipboardList, label: 'Labores',       count: campana.labores_count, pending: campana.labores_pendientes, unit: 'labor' },
            { icon: FlaskConical,  label: 'Fitosanitario', count: null,                  pending: campana.fito_pendientes,    unit: 'item'  },
            { icon: Droplets,      label: 'Riego',         count: null,                  pending: campana.riego_pendientes,   unit: 'plan'  },
          ].map(({ icon: Icon, label, count, pending, unit }) => {
            const ok = pending === 0
            return (
              <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{
                  backgroundColor: ok ? (dark ? 'rgba(22,163,74,0.07)' : '#f0fdf4') : (dark ? 'rgba(251,191,36,0.07)' : '#fffbeb'),
                  border: `1px solid ${ok ? (dark ? 'rgba(22,163,74,0.15)' : '#bbf7d0') : (dark ? 'rgba(251,191,36,0.18)' : '#fde68a')}`,
                }}>
                <Icon size={13} style={{ color: ok ? (dark ? '#4ade80' : '#16a34a') : (dark ? '#fbbf24' : '#d97706') }} />
                <span className="text-xs font-bold" style={{ color: dark ? D.text : '#374151' }}>{label}</span>
                {count !== null && <span className="text-xs font-semibold" style={{ color: dark ? D.sub : '#9ca3af' }}>· {count}</span>}
                <span className="text-xs font-semibold" style={{ color: ok ? (dark ? '#4ade80' : '#16a34a') : (dark ? '#fbbf24' : '#d97706') }}>
                  {ok ? '✓ Al día' : `${pending} pend.`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Barra de filtros — una sola fila, doble vista ── */}
      <div className="flex gap-2 items-center flex-wrap" style={{ ...cardStyle, padding: '12px 16px' }}>
        {!showEtapaBar ? (
          <>
            {TABS.map(t => (
              <button key={t.key} onClick={() => handleTabChange(t.key)}
                className="flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all"
                style={{
                  height: '36px',
                  backgroundColor: tab === t.key ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                  border: `1px solid ${tab === t.key ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                  color: tab === t.key ? '#fff' : dark ? D.sub : '#6b7280',
                }}>
                <t.icon size={12} /> {t.label}
              </button>
            ))}
            {(tab === 'labores' || tab === 'fitosanitario') && (
              <button onClick={() => setShowEtapaBar(true)}
                className="flex items-center gap-1.5 px-3 rounded-lg text-xs font-bold transition-all ml-auto"
                style={{
                  height: '36px',
                  backgroundColor: etapaFilter ? (dark ? 'rgba(255,255,255,0.10)' : '#f3f4f6') : dark ? D.btnIdle : '#f3f4f6',
                  border: `1px solid ${etapaFilter ? (dark ? 'rgba(255,255,255,0.18)' : '#d1d5db') : dark ? D.btnBorder : '#e5e7eb'}`,
                  color: etapaFilter ? (dark ? D.text : '#374151') : dark ? D.sub : '#6b7280',
                }}>
                {etapaFilter ? etapaOf(etapaFilter).label : 'Etapa'} ›
              </button>
            )}
          </>
        ) : (
          <>
            <button onClick={() => setShowEtapaBar(false)}
              className="flex items-center justify-center rounded-lg shrink-0 transition-all"
              style={{
                height: '36px', width: '36px',
                color: dark ? D.sub : '#6b7280',
                backgroundColor: dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${dark ? D.btnBorder : '#e5e7eb'}`,
              }}>
              <ArrowLeft size={14} />
            </button>
            <button onClick={() => setEtapaFilter('')}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: etapaFilter === '' ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${etapaFilter === '' ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: etapaFilter === '' ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              Todas
            </button>
            {etapasValidas.map(et => (
              <button key={et.key} onClick={() => setEtapaFilter(et.key === etapaFilter ? '' : et.key)}
                className="px-3 rounded-lg text-xs font-bold transition-all"
                style={{
                  height: '36px',
                  backgroundColor: etapaFilter === et.key ? (dark ? et.dbg : et.lbg) : dark ? D.btnIdle : '#f3f4f6',
                  border: `1px solid ${etapaFilter === et.key ? (dark ? et.dc : et.lc) : dark ? D.btnBorder : '#e5e7eb'}`,
                  color: etapaFilter === et.key ? (dark ? et.dc : et.lc) : dark ? D.sub : '#6b7280',
                }}>
                {et.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* ── Contenido de sección ── */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div className="p-5">
          {tab === 'labores'       && <LaboresTab dark={dark} campanaId={id} etapaFilter={etapaFilter} etapasValidas={etapasValidas} campana={campana} onRefreshCampana={fetch} />}
          {tab === 'fitosanitario' && <FitosanitarioTab dark={dark} campanaId={id} etapaFilter={etapaFilter} etapasValidas={etapasValidas} campana={campana} onRefreshCampana={fetch} />}
          {tab === 'riego'         && <RiegoTab dark={dark} campanaId={id} campana={campana} onRefreshCampana={fetch} />}
          {tab === 'presupuesto'   && <PresupuestoTab dark={dark} campanaId={id} campana={campana} />}
          {tab === 'trazabilidad'  && <TrazabilidadTab dark={dark} campanaId={id} campana={campana} />}
          {tab === 'alertas'       && <AlertasTab dark={dark} campanaId={id} />}
          {tab === 'diagnosticos'  && <DiagnosticosTab dark={dark} campanaId={id} />}
        </div>
      </div>

      {/* ── Modal: confirmar cambio de estado ── */}
      {estadoModal && (() => {
        const MSGS = {
          activa:    { title: 'Iniciar campaña',  body: 'Marcarás esta campaña como activa. Podrás registrar ejecuciones de labores, aplicaciones y riegos.', btn: 'Iniciar campaña',  Ico: Play,         iconBg: '#dcfce7', iconC: '#16a34a', btnCls: 'btn-primary' },
          cerrada:   { title: 'Cerrar campaña',   body: 'La campaña quedará cerrada. Se conservará todo el historial registrado.',                             btn: 'Cerrar campaña',   Ico: CheckCircle2, iconBg: '#f3f4f6', iconC: '#6b7280', btnCls: 'btn-secondary' },
          cancelada: { title: 'Cancelar campaña', body: 'La campaña se marcará como cancelada. Úsalo solo si no se llevará a cabo.',                           btn: 'Sí, cancelar',     Ico: X,            iconBg: '#fee2e2', iconC: '#dc2626', btnCls: 'btn-danger' },
        }
        const m  = MSGS[estadoModal]
        const ps = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEstadoModal(null)} />
            <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10" style={ps}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: m.iconBg }}>
                  <m.Ico size={20} style={{ color: m.iconC }} fill={estadoModal === 'activa' ? m.iconC : 'none'} />
                </div>
                <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>{m.title}</h3>
                <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{m.body}</p>
                <div className="flex gap-3 w-full pt-1">
                  <button onClick={() => setEstadoModal(null)} className="flex-1 btn-secondary text-sm">Cancelar</button>
                  <button onClick={() => changeEstado(estadoModal)} className={`flex-1 ${m.btnCls} text-sm`}>{m.btn}</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Modal: confirmar cambio de ciclo ── */}
      {cicloConfirm && (() => {
        const total      = cicloConfirm.labIncompat.length + cicloConfirm.fitoIncompat.length
        const cicloLabel = cicloConfirm.ciclo || campana.variedad_tipo_ciclo
        const ps         = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setCicloConfirm(null)} />
            <div className="relative w-full max-w-md rounded-2xl shadow-2xl z-10 flex flex-col" style={ps}>
              <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
                <h3 className="text-sm font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                  Etapas incompatibles
                </h3>
                <button onClick={() => setCicloConfirm(null)} style={{ color: D.sub }}><X size={16} /></button>
              </div>
              <div className="px-5 pb-4 space-y-3">
                <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>
                  <strong style={{ color: dark ? D.text : '#374151' }}>{total} registro{total !== 1 ? 's' : ''}</strong> tiene{total !== 1 ? 'n' : ''} etapas que no existen en el ciclo <strong style={{ color: dark ? D.text : '#374151' }}>{cicloLabel}</strong>:
                </p>
                <div className="space-y-2">
                  {cicloConfirm.labIncompat.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                      style={{ backgroundColor: dark ? 'rgba(251,191,36,0.08)' : '#fffbeb', border: `1px solid ${dark ? 'rgba(251,191,36,0.18)' : '#fde68a'}` }}>
                      <span className="font-bold" style={{ color: dark ? '#fbbf24' : '#d97706' }}>{cicloConfirm.labIncompat.length} labor{cicloConfirm.labIncompat.length !== 1 ? 'es' : ''}</span>
                      <span style={{ color: dark ? D.sub : '#6b7280' }}>— {[...new Set(cicloConfirm.labIncompat.map(l => etapaOf(l.etapa).label))].join(', ')}</span>
                    </div>
                  )}
                  {cicloConfirm.fitoIncompat.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                      style={{ backgroundColor: dark ? 'rgba(239,68,68,0.08)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(239,68,68,0.18)' : '#fecaca'}` }}>
                      <span className="font-bold" style={{ color: dark ? '#f87171' : '#dc2626' }}>{cicloConfirm.fitoIncompat.length} fitosanitario{cicloConfirm.fitoIncompat.length !== 1 ? 's' : ''}</span>
                      <span style={{ color: dark ? D.sub : '#6b7280' }}>— {[...new Set(cicloConfirm.fitoIncompat.map(f => etapaOf(f.etapa).label))].join(', ')}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
                  "Limpiar" los deja sin etapa asignada para que puedas reasignarlos. "Solo cambiar" mantiene los valores aunque no sean válidos para el ciclo.
                </p>
              </div>
              <div className="flex gap-2 px-5 py-3 shrink-0" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}` }}>
                <button onClick={() => applyCiclo(cicloConfirm.ciclo, false)}
                  className="flex-1 btn-secondary text-sm">Solo cambiar ciclo</button>
                <button onClick={() => applyCiclo(cicloConfirm.ciclo, true, cicloConfirm.labIncompat, cicloConfirm.fitoIncompat)}
                  className="flex-1 btn-primary text-sm">Limpiar etapas y cambiar</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
