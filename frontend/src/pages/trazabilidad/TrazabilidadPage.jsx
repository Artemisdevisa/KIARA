import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  LineChart, Plus, Search, Leaf, DollarSign, X,
  Recycle, Droplets, ShieldCheck, Sprout, Layers, Bug, Bookmark,
  Package, Users, Wrench, CalendarDays, TrendingDown, TrendingUp, BadgeDollarSign
} from 'lucide-react'

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  divider:     'rgba(255,255,255,0.07)',
  btnIdle:     'rgba(255,255,255,0.07)',
  btnBorder:   'rgba(255,255,255,0.10)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

const PRACTICAS_CONFIG = {
  compost:          { Icon: Recycle,     color: '#16a34a', darkColor: '#4ade80', bg: '#f0fdf4',  darkBg: 'rgba(22,163,74,0.15)'    },
  biol:             { Icon: Droplets,    color: '#0284c7', darkColor: '#38bdf8', bg: '#f0f9ff',  darkBg: 'rgba(2,132,199,0.15)'    },
  sin_agroquimicos: { Icon: ShieldCheck, color: '#7c3aed', darkColor: '#a78bfa', bg: '#f5f3ff',  darkBg: 'rgba(124,58,237,0.15)'   },
  riego_eficiente:  { Icon: Droplets,    color: '#0891b2', darkColor: '#22d3ee', bg: '#ecfeff',  darkBg: 'rgba(8,145,178,0.15)'    },
  mulching:         { Icon: Layers,      color: '#78716c', darkColor: '#a8a29e', bg: '#f5f5f4',  darkBg: 'rgba(120,113,108,0.15)'  },
  control_biologico:{ Icon: Bug,         color: '#ca8a04', darkColor: '#fbbf24', bg: '#fffbeb',  darkBg: 'rgba(202,138,4,0.15)'    },
  otro:             { Icon: Bookmark,    color: '#6b7280', darkColor: '#9ca3af', bg: '#f9fafb',  darkBg: 'rgba(107,114,128,0.15)'  },
}

const COSTOS_CONFIG = {
  insumos:     { Icon: Package,   color: '#0284c7', darkColor: '#38bdf8' },
  agua:        { Icon: Droplets,  color: '#0891b2', darkColor: '#22d3ee' },
  semillas:    { Icon: Sprout,    color: '#16a34a', darkColor: '#4ade80' },
  mano_obra:   { Icon: Users,     color: '#7c3aed', darkColor: '#a78bfa' },
  herramientas:{ Icon: Wrench,    color: '#d97706', darkColor: '#fbbf24' },
  otro:        { Icon: Bookmark,  color: '#6b7280', darkColor: '#9ca3af' },
}

const PRACTICAS_LABELS = {
  compost: 'Uso de compost', biol: 'Uso de biol', sin_agroquimicos: 'Sin agroquímicos',
  riego_eficiente: 'Riego eficiente', mulching: 'Mulching', control_biologico: 'Control biológico', otro: 'Otro',
}

const COSTOS_LABELS = {
  insumos: 'Insumos', agua: 'Agua', semillas: 'Semillas',
  mano_obra: 'Mano de obra', herramientas: 'Herramientas', otro: 'Otro',
}

function PracticaModal({ dark, cultivos, onClose, onSaved }) {
  const [form, setForm] = useState({
    cultivo: '', tipo: 'compost', fecha: new Date().toISOString().split('T')[0], descripcion: ''
  })
  const [loading, setLoading] = useState(false)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/trazabilidad/practicas/', form)
      toast.success('Práctica registrada.'); onSaved()
    } catch { toast.error('Error al guardar.') }
    finally { setLoading(false) }
  }
  return <FormModalBase dark={dark} title="Registrar práctica sostenible" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      <ModalField dark={dark} label="Cultivo">
        <select name="cultivo" value={form.cultivo} onChange={handle} style={getInputStyle(dark)} required>
          <option value="">Seleccionar...</option>
          {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </ModalField>
      <div className="grid grid-cols-2 gap-3">
        <ModalField dark={dark} label="Tipo">
          <select name="tipo" value={form.tipo} onChange={handle} style={getInputStyle(dark)}>
            {Object.entries(PRACTICAS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </ModalField>
        <ModalField dark={dark} label="Fecha">
          <input name="fecha" type="date" value={form.fecha} onChange={handle} style={getInputStyle(dark)} required />
        </ModalField>
      </div>
      <ModalField dark={dark} label="Descripción">
        <textarea name="descripcion" value={form.descripcion} onChange={handle} rows={2}
          style={{ ...getInputStyle(dark), resize: 'none' }} />
      </ModalField>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
        <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  </FormModalBase>
}

function CostoModal({ dark, cultivos, onClose, onSaved }) {
  const [form, setForm] = useState({
    cultivo: '', concepto: 'insumos', monto: '', fecha: new Date().toISOString().split('T')[0], descripcion: ''
  })
  const [loading, setLoading] = useState(false)
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post('/trazabilidad/costos/', form)
      toast.success('Costo registrado.'); onSaved()
    } catch { toast.error('Error al guardar.') }
    finally { setLoading(false) }
  }
  return <FormModalBase dark={dark} title="Registrar costo de producción" onClose={onClose}>
    <form onSubmit={submit} className="space-y-4">
      <ModalField dark={dark} label="Cultivo">
        <select name="cultivo" value={form.cultivo} onChange={handle} style={getInputStyle(dark)} required>
          <option value="">Seleccionar...</option>
          {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </ModalField>
      <div className="grid grid-cols-2 gap-3">
        <ModalField dark={dark} label="Concepto">
          <select name="concepto" value={form.concepto} onChange={handle} style={getInputStyle(dark)}>
            {Object.entries(COSTOS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </ModalField>
        <ModalField dark={dark} label="Monto (S/)">
          <input name="monto" type="number" step="0.01" min="0" value={form.monto} onChange={handle}
            style={getInputStyle(dark)} placeholder="25.00" required />
        </ModalField>
      </div>
      <ModalField dark={dark} label="Fecha">
        <input name="fecha" type="date" value={form.fecha} onChange={handle} style={getInputStyle(dark)} required />
      </ModalField>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
        <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
          {loading ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  </FormModalBase>
}

function FormModalBase({ dark, title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl shadow-2xl z-10"
        style={{
          backgroundColor: dark ? '#1e2a3a' : '#ffffff',
          border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
        }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ color: D.sub, padding: '4px', borderRadius: '8px' }}><X size={18} /></button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  )
}

function ModalField({ dark, label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px', color: dark ? D.sub : '#6b7280' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function getInputStyle(dark) {
  return {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none',
  }
}

export default function TrazabilidadPage() {
  const { dark } = useTheme()
  const [cultivos, setCultivos]           = useState([])
  const [cultivoSel, setCultivoSel]       = useState('')
  const [practicas, setPracticas]         = useState([])
  const [costos, setCostos]               = useState([])
  const [resumen, setResumen]             = useState(null)
  const [loading, setLoading]             = useState(true)
  const [showFormP, setShowFormP]         = useState(false)
  const [showFormC, setShowFormC]         = useState(false)

  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      const params = cultivoSel ? `?cultivo=${cultivoSel}` : ''
      const [p, c] = await Promise.all([
        api.get(`/trazabilidad/practicas/${params}`),
        api.get(`/trazabilidad/costos/${params}`),
      ])
      setPracticas(p.data)
      setCostos(c.data)
    } catch { toast.error('Error al cargar.') }
    finally { setLoading(false) }
  }, [cultivoSel])

  useEffect(() => {
    api.get('/cultivos/').then(res => setCultivos(res.data))
  }, [])

  useEffect(() => {
    cargarDatos()
    if (cultivoSel) {
      api.get(`/trazabilidad/resumen/${cultivoSel}/`).then(res => setResumen(res.data))
    } else {
      setResumen(null)
    }
  }, [cargarDatos, cultivoSel])

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }
  const inputSelectStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#374151',
    borderRadius: '10px', padding: '7px 12px', fontSize: '13px', outline: 'none',
    height: '36px', cursor: 'pointer', minWidth: '200px',
  }

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
          <LineChart size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            Trazabilidad y Costos
          </h1>
          <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
            Prácticas sostenibles y costos de producción
          </p>
        </div>
      </div>

      {/* Filtro por cultivo */}
      <div className="flex items-center gap-3"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <Search size={13} style={{ color: dark ? D.sub : '#9ca3af' }} />
        <select
          value={cultivoSel}
          onChange={e => setCultivoSel(e.target.value)}
          style={inputSelectStyle}
        >
          <option value="">Todos mis cultivos</option>
          {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Resumen financiero */}
      {resumen && (
        <div style={cardStyle} className="p-5">
          <p className="text-xs font-bold uppercase tracking-wide mb-4"
            style={{ color: dark ? D.sub : '#9ca3af' }}>
            Resumen financiero — {resumen.cultivo_nombre}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(239,68,68,0.10)' : '#fef2f2' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(239,68,68,0.20)' : '#fecaca' }}>
                <TrendingDown size={20} style={{ color: dark ? '#f87171' : '#dc2626' }} />
              </div>
              <p className="text-xl font-extrabold" style={{ color: dark ? '#f87171' : '#dc2626' }}>
                S/ {resumen.total_costos?.toFixed(2)}
              </p>
              <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Costos totales</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(37,99,235,0.10)' : '#eff6ff' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(37,99,235,0.20)' : '#dbeafe' }}>
                <TrendingUp size={20} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />
              </div>
              <p className="text-xl font-extrabold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>
                S/ {resumen.total_ingresos?.toFixed(2)}
              </p>
              <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Ingresos estimados</p>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl"
              style={{
                backgroundColor: resumen.ganancia_estimada >= 0
                  ? (dark ? 'rgba(22,163,74,0.10)' : '#f0fdf4')
                  : (dark ? 'rgba(239,68,68,0.10)' : '#fef2f2')
              }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: resumen.ganancia_estimada >= 0
                    ? (dark ? 'rgba(22,163,74,0.20)' : '#dcfce7')
                    : (dark ? 'rgba(239,68,68,0.20)' : '#fecaca')
                }}>
                <BadgeDollarSign size={20} style={{
                  color: resumen.ganancia_estimada >= 0 ? (dark ? '#4ade80' : '#16a34a') : (dark ? '#f87171' : '#dc2626')
                }} />
              </div>
              <p className="text-xl font-extrabold"
                style={{ color: resumen.ganancia_estimada >= 0 ? (dark ? '#4ade80' : '#16a34a') : (dark ? '#f87171' : '#dc2626') }}>
                S/ {resumen.ganancia_estimada?.toFixed(2)}
              </p>
              <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Ganancia estimada</p>
            </div>
          </div>
        </div>
      )}

      {/* Dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Prácticas sostenibles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4' }}>
                <Leaf size={14} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
              </div>
              <h2 className="font-extrabold text-sm" style={{ color: dark ? D.text : '#111827' }}>
                Prácticas sostenibles
              </h2>
            </div>
            <button onClick={() => setShowFormP(true)} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={12} /> Registrar
            </button>
          </div>

          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : practicas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Leaf size={28} style={{ color: dark ? D.sub : '#d1d5db' }} />
                <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin prácticas registradas</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {practicas.map((p, idx) => {
                  const cfg = PRACTICAS_CONFIG[p.tipo] || PRACTICAS_CONFIG.otro
                  const PIcon = cfg.Icon
                  return (
                    <div key={p.id} className="flex items-start gap-3 px-4 py-3"
                      style={{ borderBottom: idx < practicas.length - 1 ? `1px solid ${dark ? D.divider : '#f9fafb'}` : 'none' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: dark ? cfg.darkBg : cfg.bg }}>
                        <PIcon size={14} style={{ color: dark ? cfg.darkColor : cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>
                          {p.tipo_display}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
                          {p.cultivo_nombre} · {p.fecha}
                        </p>
                        {p.descripcion && (
                          <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#6b7280' }}>{p.descripcion}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Costos de producción */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: dark ? 'rgba(37,99,235,0.15)' : '#eff6ff' }}>
                <DollarSign size={14} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />
              </div>
              <h2 className="font-extrabold text-sm" style={{ color: dark ? D.text : '#111827' }}>
                Costos de producción
              </h2>
            </div>
            <button onClick={() => setShowFormC(true)} className="btn-primary text-xs flex items-center gap-1.5">
              <Plus size={12} /> Registrar
            </button>
          </div>

          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : costos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <DollarSign size={28} style={{ color: dark ? D.sub : '#d1d5db' }} />
                <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin costos registrados</p>
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {costos.map((c, idx) => {
                  const cfg = COSTOS_CONFIG[c.concepto] || COSTOS_CONFIG.otro
                  const CIcon = cfg.Icon
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-4 py-3"
                      style={{ borderBottom: idx < costos.length - 1 ? `1px solid ${dark ? D.divider : '#f9fafb'}` : 'none' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}>
                        <CIcon size={14} style={{ color: dark ? cfg.darkColor : cfg.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>
                          {c.concepto_display}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
                          {c.cultivo_nombre} · {c.fecha}
                        </p>
                      </div>
                      <span className="font-extrabold text-sm shrink-0"
                        style={{ color: dark ? '#f87171' : '#dc2626' }}>
                        S/ {c.monto}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFormP && (
        <PracticaModal
          dark={dark}
          cultivos={cultivos}
          onClose={() => setShowFormP(false)}
          onSaved={() => { setShowFormP(false); cargarDatos(); if (cultivoSel) api.get(`/trazabilidad/resumen/${cultivoSel}/`).then(r => setResumen(r.data)) }}
        />
      )}
      {showFormC && (
        <CostoModal
          dark={dark}
          cultivos={cultivos}
          onClose={() => setShowFormC(false)}
          onSaved={() => { setShowFormC(false); cargarDatos(); if (cultivoSel) api.get(`/trazabilidad/resumen/${cultivoSel}/`).then(r => setResumen(r.data)) }}
        />
      )}
    </div>
  )
}
