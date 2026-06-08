import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  ArrowLeft, CalendarRange, Calendar, ClipboardList, FlaskConical, Droplets,
  Wallet, Leaf, Plus, Pencil, Trash2, X, CheckCircle2, Circle,
  AlertTriangle, Printer, TrendingUp, TrendingDown, Minus,
} from 'lucide-react'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.07)', hoverRow: 'rgba(255,255,255,0.04)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
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
const etapaOf = key => ETAPAS.find(e => e.key === key) || { label: 'General', dc: '#94a3b8', lc: '#6b7280', dbg: 'rgba(148,163,184,0.10)', lbg: '#f9fafb' }
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

/* ── helpers ── */
const fmt = n => `S/. ${parseFloat(n || 0).toFixed(2)}`
const ist_ = dark => ({
  backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
  color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none',
})
const lst_ = dark => ({ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' })

/* ── Generic mini modal ── */
function MiniModal({ dark, title, onClose, onSubmit, loading, children }) {
  const ps = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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

/* ── TABS ── */
const TABS = [
  { key: 'labores',       icon: ClipboardList, label: 'Labores'      },
  { key: 'fitosanitario', icon: FlaskConical,  label: 'Fitosanitario' },
  { key: 'riego',         icon: Droplets,      label: 'Riego & Fertirrigación' },
  { key: 'presupuesto',   icon: Wallet,        label: 'Presupuesto'  },
  { key: 'trazabilidad',  icon: Leaf,          label: 'Trazabilidad' },
]

/* ══════════════════════════════════════════════════════
   TAB: LABORES
══════════════════════════════════════════════════════ */
function LaboresTab({ dark, campanaId, etapaFilter }) {
  const [data, setData]       = useState([])
  const [tipos, setTipos]     = useState([])
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ tipo_labor: '', descripcion: '', fecha_programada: '', cantidad_programada: '', costo_unitario: '', operario: '', notas: '' })
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    const [r, t] = await Promise.all([api.get(`/campanas/${campanaId}/labores/`), api.get('/campanas/tipos-labor/')])
    setData(r.data); setTipos(t.data)
  }, [campanaId])
  useEffect(() => { fetch() }, [fetch])

  const openNew = () => { setForm({ tipo_labor: '', descripcion: '', fecha_programada: '', cantidad_programada: '', costo_unitario: '', etapa: '', operario: '', notas: '' }); setModal('new') }
  const openEdit = item => { setForm({ ...item, tipo_labor: item.tipo_labor }); setModal('edit') }
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleTipoChange = e => {
    const t = tipos.find(t => String(t.id) === e.target.value)
    setForm(f => ({ ...f, tipo_labor: e.target.value, costo_unitario: t ? t.costo_unitario_default : f.costo_unitario }))
  }

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal === 'edit') { await api.patch(`/campanas/labores/${form.id}/`, form); toast.success('Labor actualizada.') }
      else { await api.post(`/campanas/${campanaId}/labores/`, form); toast.success('Labor registrada.') }
      setModal(null); fetch()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const toggleEjecutada = async item => {
    const isEj = item.estado === 'ejecutada'
    try {
      await api.patch(`/campanas/labores/${item.id}/`, {
        estado: isEj ? 'programada' : 'ejecutada',
        fecha_ejecutada: isEj ? null : new Date().toISOString().slice(0, 10),
        cantidad_ejecutada: isEj ? null : item.cantidad_programada,
      })
      fetch()
    } catch { toast.error('Error.') }
  }

  const del = async item => {
    if (!confirm('¿Eliminar labor?')) return
    try { await api.delete(`/campanas/labores/${item.id}/`); fetch() } catch { toast.error('Error.') }
  }

  const ist = ist_(dark); const lst = lst_(dark)
  const total_prog = data.reduce((s, l) => s + (l.costo_programado || 0), 0)
  const total_ej   = data.filter(l => l.estado === 'ejecutada').reduce((s, l) => s + (l.costo_ejecutado || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-xs">
          <span style={{ color: dark ? D.sub : '#6b7280' }}>Presupuestado: <strong style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(total_prog)}</strong></span>
          <span style={{ color: dark ? D.sub : '#6b7280' }}>Ejecutado: <strong style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(total_ej)}</strong></span>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 btn-primary text-sm"><Plus size={13} /> Agregar</button>
      </div>

      <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              {['', 'Labor', 'Fecha prog.', 'Cantidad', 'Costo prog.', 'Estado', ''].map((h, i) => (
                <th key={i} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide ${i === 6 ? 'text-right' : ''}`}
                  style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(() => {
              const visible = etapaFilter ? data.filter(l => l.etapa === etapaFilter) : data
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
                      <button onClick={() => toggleEjecutada(l)} title={l.estado === 'ejecutada' ? 'Marcar pendiente' : 'Marcar ejecutada'}>
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
                      </div>
                      {l.descripcion && <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>{l.descripcion}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{l.fecha_programada}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: dark ? D.text : '#374151' }}>{l.cantidad_programada} {l.tipo_labor_unidad}</td>
                    <td className="px-4 py-3 text-sm font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(l.costo_programado)}</td>
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
                        <button onClick={() => openEdit(l)} className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={13} /></button>
                        <button onClick={() => del(l)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={13} /></button>
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
            </select>
          </div>
          <div><label style={lst}>Etapa fenológica</label>
            <select name="etapa" value={form.etapa} onChange={h} style={ist}>
              <option value="">Sin etapa</option>
              {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </div>
          <div><label style={lst}>Descripción adicional</label><input name="descripcion" value={form.descripcion} onChange={h} style={ist} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Fecha programada *</label><input name="fecha_programada" type="date" value={form.fecha_programada} onChange={h} style={ist} required /></div>
            <div><label style={lst}>Cantidad *</label><input name="cantidad_programada" type="number" step="0.01" value={form.cantidad_programada} onChange={h} style={ist} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Costo por unidad (S/.)</label><input name="costo_unitario" type="number" step="0.01" value={form.costo_unitario} onChange={h} style={ist} /></div>
            <div><label style={lst}>Operario</label><input name="operario" value={form.operario} onChange={h} style={ist} /></div>
          </div>
          <div><label style={lst}>Notas</label><textarea name="notas" value={form.notas} onChange={h} rows={2} style={{ ...ist, resize: 'none' }} /></div>
        </MiniModal>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: FITOSANITARIO
══════════════════════════════════════════════════════ */
function FitosanitarioTab({ dark, campanaId, etapaFilter }) {
  const [plan, setPlan]       = useState([])
  const [regs, setRegs]       = useState([])
  const [prods, setProds]     = useState([])
  const [modal, setModal]     = useState(null)
  const [regModal, setRegModal] = useState(false)
  const [form, setForm]       = useState({ producto: '', objetivo: '', dosis: '', unidad: 'L/ha', dias_antes_cosecha: '', condicion: '', frecuencia_dias: '', etapa: '' })
  const [regForm, setRegForm] = useState({ producto: '', fecha: '', dosis_aplicada: '', area_aplicada: '', operario: '', es_sostenible: false, observaciones: '' })
  const [loading, setLoading] = useState(false)

  const fetch = useCallback(async () => {
    const [p, r, pr] = await Promise.all([
      api.get(`/campanas/${campanaId}/fitosanitario/`),
      api.get(`/campanas/${campanaId}/aplicaciones/`),
      api.get('/campanas/productos/'),
    ])
    setPlan(p.data); setRegs(r.data); setProds(pr.data)
  }, [campanaId])
  useEffect(() => { fetch() }, [fetch])

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const hr = e => setRegForm(f => ({ ...f, [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const submitPlan = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...form, dias_antes_cosecha: form.dias_antes_cosecha || null, frecuencia_dias: form.frecuencia_dias || null }
      if (modal === 'edit') { await api.patch(`/campanas/fitosanitario/${form.id}/`, payload); toast.success('Actualizado.') }
      else { await api.post(`/campanas/${campanaId}/fitosanitario/`, payload); toast.success('Agregado al plan.') }
      setModal(null); fetch()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const submitReg = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post(`/campanas/${campanaId}/aplicaciones/`, regForm)
      toast.success('Aplicación registrada.'); setRegModal(false); fetch()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const delPlan = async id => { if (!confirm('¿Eliminar?')) return; await api.delete(`/campanas/fitosanitario/${id}/`); fetch() }
  const delReg  = async id => { if (!confirm('¿Eliminar?')) return; await api.delete(`/campanas/aplicaciones/${id}/`); fetch() }

  const ist = ist_(dark); const lst = lst_(dark)

  const alertas = plan.filter(item => {
    if (!item.dias_antes_cosecha || !item.fecha_inicio) return false
    return true
  })

  return (
    <div className="space-y-5">
      {/* Alertas */}
      {plan.some(i => i.dias_antes_cosecha) && (
        <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: dark ? 'rgba(234,179,8,0.12)' : '#fefce8', border: `1px solid ${dark ? 'rgba(234,179,8,0.3)' : '#fde68a'}` }}>
          <AlertTriangle size={14} style={{ color: dark ? '#fbbf24' : '#d97706', marginTop: 1, flexShrink: 0 }} />
          <p className="text-xs" style={{ color: dark ? '#fbbf24' : '#d97706' }}>
            Algunos productos tienen intervalo de seguridad. No aplicar dentro de los días indicados antes de la cosecha.
          </p>
        </div>
      )}

      {/* Plan fitosanitario */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? D.sub : '#6b7280' }}>Plan fitosanitario</p>
          <button onClick={() => { setForm({ producto: '', objetivo: '', dosis: '', unidad: 'L/ha', dias_antes_cosecha: '', condicion: '', frecuencia_dias: '', etapa: '' }); setModal('new') }}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.text : '#374151' }}>
            <Plus size={12} /> Agregar producto
          </button>
        </div>
        <div className="space-y-2">
          {(() => {
            const visible = etapaFilter ? plan.filter(i => i.etapa === etapaFilter) : plan
            if (visible.length === 0)
              return <p className="text-sm text-center py-6" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin productos{etapaFilter ? ' en esta etapa' : ' en el plan'}</p>
            return visible.map(item => {
              const et = etapaOf(item.etapa)
              const ec = dark ? et.dc : et.lc
              const ebg = dark ? et.dbg : et.lbg
              return (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-xs font-bold" style={{ color: dark ? D.text : '#111827' }}>{item.producto_nombre}</p>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>
                        {item.dosis} {item.unidad_codigo || item.unidad}
                      </span>
                      {item.etapa && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md"
                          style={{ backgroundColor: ebg, color: ec }}>{et.label}</span>
                      )}
                      {item.dias_antes_cosecha && (
                        <span className="text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1"
                          style={{ backgroundColor: dark ? 'rgba(234,179,8,0.15)' : '#fef9c3', color: dark ? '#fbbf24' : '#d97706' }}>
                          <AlertTriangle size={9} /> {item.dias_antes_cosecha}d antes cosecha
                        </span>
                      )}
                    </div>
                    {item.objetivo_nombre && <p className="text-[13px] mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>{item.objetivo_nombre}</p>}
                    {item.plaga_nombre && <p className="text-[13px]" style={{ color: dark ? '#f87171' : '#dc2626' }}>Plaga: {item.plaga_nombre}</p>}
                    {item.condicion_nombre && <p className="text-[13px]" style={{ color: dark ? 'rgba(96,165,250,0.8)' : '#2563eb' }}>Si: {item.condicion_nombre}</p>}
                    {item.frecuencia_dias && <p className="text-[13px]" style={{ color: dark ? D.sub : '#9ca3af' }}>Cada {item.frecuencia_dias} días</p>}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setForm({ ...item }); setModal('edit') }} className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={12} /></button>
                    <button onClick={() => delPlan(item.id)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={12} /></button>
                  </div>
                </div>
              )
            })
          })()}
        </div>
      </div>

      {/* Registros de aplicación */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? D.sub : '#6b7280' }}>Aplicaciones ejecutadas</p>
          <button onClick={() => { setRegForm({ producto: '', fecha: '', dosis_aplicada: '', area_aplicada: '', operario: '', es_sostenible: false, observaciones: '' }); setRegModal(true) }}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4', color: dark ? '#4ade80' : '#15803d' }}>
            <Plus size={12} /> Registrar aplicación
          </button>
        </div>
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                {['Fecha', 'Producto', 'Dosis', 'Área', 'Costo', ''].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regs.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{r.fecha}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: dark ? D.text : '#111827' }}>
                    {r.producto_nombre}
                    {r.es_sostenible && <span className="ml-1.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>sostenible</span>}
                  </td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{r.dosis_aplicada} {r.producto_unidad}</td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{r.area_aplicada} m²</td>
                  <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(r.costo_total)}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => delReg(r.id)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
              {regs.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin aplicaciones registradas</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <MiniModal dark={dark} title={modal === 'edit' ? 'Editar producto' : 'Agregar al plan'} onClose={() => setModal(null)} onSubmit={submitPlan} loading={loading}>
          <div><label style={lst}>Producto *</label>
            <select name="producto" value={form.producto} onChange={h} style={ist} required>
              <option value="">Selecciona</option>
              {prods.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.unidad})</option>)}
            </select>
          </div>
          <div><label style={lst}>Etapa fenológica</label>
            <select name="etapa" value={form.etapa} onChange={h} style={ist}>
              <option value="">Sin etapa</option>
              {ETAPAS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Dosis *</label><input name="dosis" type="number" step="0.001" value={form.dosis} onChange={h} style={ist} required /></div>
            <div><label style={lst}>Unidad</label><input name="unidad" value={form.unidad} onChange={h} style={ist} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Intervalo seguridad (días)</label><input name="dias_antes_cosecha" type="number" value={form.dias_antes_cosecha} onChange={h} style={ist} placeholder="15" /></div>
            <div><label style={lst}>Frecuencia (días)</label><input name="frecuencia_dias" type="number" value={form.frecuencia_dias} onChange={h} style={ist} placeholder="7" /></div>
          </div>
        </MiniModal>
      )}

      {regModal && (
        <MiniModal dark={dark} title="Registrar aplicación" onClose={() => setRegModal(false)} onSubmit={submitReg} loading={loading}>
          <div><label style={lst}>Producto *</label>
            <select name="producto" value={regForm.producto} onChange={hr} style={ist} required>
              <option value="">Selecciona</option>
              {prods.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Fecha *</label><input name="fecha" type="date" value={regForm.fecha} onChange={hr} style={ist} required /></div>
            <div><label style={lst}>Área aplicada (m²) *</label><input name="area_aplicada" type="number" step="0.01" value={regForm.area_aplicada} onChange={hr} style={ist} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Dosis aplicada *</label><input name="dosis_aplicada" type="number" step="0.001" value={regForm.dosis_aplicada} onChange={hr} style={ist} required /></div>
            <div><label style={lst}>Operario</label><input name="operario" value={regForm.operario} onChange={hr} style={ist} /></div>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="sos" name="es_sostenible" checked={regForm.es_sostenible} onChange={hr} />
            <label htmlFor="sos" className="text-xs font-bold" style={{ color: dark ? '#4ade80' : '#15803d' }}>Práctica sostenible (bioestimulante, orgánico)</label>
          </div>
          <div><label style={lst}>Observaciones</label><textarea name="observaciones" value={regForm.observaciones} onChange={hr} rows={2} style={{ ...ist, resize: 'none' }} /></div>
        </MiniModal>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: RIEGO & FERTIRRIGACIÓN
══════════════════════════════════════════════════════ */
function RiegoTab({ dark, campanaId }) {
  const [planes, setPlanes]   = useState([])
  const [regs, setRegs]       = useState([])
  const [prods, setProds]     = useState([])
  const [modal, setModal]     = useState(null)
  const [regModal, setRegModal] = useState(false)
  const [form, setForm]       = useState({ nombre: '', metodo: 'goteo', litros_por_m2: '', frecuencia_dias: '', duracion_minutos: '', fertilizante: '', dosis_fertilizante: '', fecha_inicio: '', fecha_fin: '' })
  const [regForm, setRegForm] = useState({ plan: '', fecha: '', litros_aplicados: '', area_regada: '', costo_agua: '', fertilizante: '', dosis_fertilizante: '', operario: '', observaciones: '' })
  const [loading, setLoading] = useState(false)
  const METODOS = [['goteo','Goteo'],['aspersion','Aspersión'],['gravedad','Gravedad'],['manual','Manual']]

  const fetch = useCallback(async () => {
    const [p, r, pr] = await Promise.all([
      api.get(`/campanas/${campanaId}/plan-riego/`),
      api.get(`/campanas/${campanaId}/registros-riego/`),
      api.get('/campanas/productos/'),
    ])
    setPlanes(p.data); setRegs(r.data); setProds(pr.data)
  }, [campanaId])
  useEffect(() => { fetch() }, [fetch])

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const hr = e => setRegForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submitPlan = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...form, duracion_minutos: form.duracion_minutos || null, fertilizante: form.fertilizante || null, dosis_fertilizante: form.dosis_fertilizante || null, fecha_inicio: form.fecha_inicio || null, fecha_fin: form.fecha_fin || null }
      if (modal === 'edit') { await api.patch(`/campanas/plan-riego/${form.id}/`, payload); toast.success('Plan actualizado.') }
      else { await api.post(`/campanas/${campanaId}/plan-riego/`, payload); toast.success('Plan agregado.') }
      setModal(null); fetch()
    } catch { toast.error('Error.') } finally { setLoading(false) }
  }

  const submitReg = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...regForm, plan: regForm.plan || null, fertilizante: regForm.fertilizante || null, dosis_fertilizante: regForm.dosis_fertilizante || null }
      await api.post(`/campanas/${campanaId}/registros-riego/`, payload)
      toast.success('Riego registrado.'); setRegModal(false); fetch()
    } catch { toast.error('Error.') } finally { setLoading(false) }
  }

  const delPlan = async id => { if (!confirm('¿Eliminar?')) return; await api.delete(`/campanas/plan-riego/${id}/`); fetch() }
  const delReg  = async id => { if (!confirm('¿Eliminar?')) return; await api.delete(`/campanas/registros-riego/${id}/`); fetch() }

  const ist = ist_(dark); const lst = lst_(dark)
  const total_agua = regs.reduce((s, r) => s + parseFloat(r.costo_agua || 0), 0)

  return (
    <div className="space-y-5">
      {/* Planes */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? D.sub : '#6b7280' }}>Planes de riego</p>
          <button onClick={() => { setForm({ nombre: '', metodo: 'goteo', litros_por_m2: '', frecuencia_dias: '', duracion_minutos: '', fertilizante: '', dosis_fertilizante: '', fecha_inicio: '', fecha_fin: '' }); setModal('new') }}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.text : '#374151' }}>
            <Plus size={12} /> Nuevo plan
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {planes.map(p => (
            <div key={p.id} className="p-3 rounded-xl" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold" style={{ color: dark ? D.text : '#111827' }}>{p.nombre}</p>
                  <p className="text-[13px] mt-0.5" style={{ color: dark ? D.sub : '#6b7280' }}>
                    {p.litros_por_m2} L/m² · cada {p.frecuencia_dias} días · {p.metodo_display}
                  </p>
                  {p.fertilizante_nombre && (
                    <p className="text-[13px] mt-0.5" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                      + {p.fertilizante_nombre} {p.dosis_fertilizante} L/ha
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setForm({ ...p, fertilizante: p.fertilizante || '' }); setModal('edit') }} className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={12} /></button>
                  <button onClick={() => delPlan(p.id)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
          {planes.length === 0 && <p className="text-sm py-4" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin planes de riego</p>}
        </div>
      </div>

      {/* Registros */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <p className="text-xs font-extrabold uppercase tracking-wide" style={{ color: dark ? D.sub : '#6b7280' }}>Riegos ejecutados</p>
            <span className="text-xs font-bold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>Costo agua: {fmt(total_agua)}</span>
          </div>
          <button onClick={() => { setRegForm({ plan: '', fecha: '', litros_aplicados: '', area_regada: '', costo_agua: '', fertilizante: '', dosis_fertilizante: '', operario: '', observaciones: '' }); setRegModal(true) }}
            className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ backgroundColor: dark ? 'rgba(59,130,246,0.15)' : '#eff6ff', color: dark ? '#60a5fa' : '#2563eb' }}>
            <Plus size={12} /> Registrar riego
          </button>
        </div>
        <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                {['Fecha', 'Litros', 'Área', 'Fertirrigación', 'Costo agua', ''].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {regs.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{r.fecha}</td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.text : '#374151' }}>{r.litros_aplicados} L</td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{r.area_regada} m²</td>
                  <td className="px-4 py-2.5 text-sm" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                    {r.fertilizante_nombre ? `${r.fertilizante_nombre} ${r.dosis_fertilizante}` : '—'}
                  </td>
                  <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(r.costo_agua)}</td>
                  <td className="px-4 py-2.5">
                    <button onClick={() => delReg(r.id)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={12} /></button>
                  </td>
                </tr>
              ))}
              {regs.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin registros de riego</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <MiniModal dark={dark} title={modal === 'edit' ? 'Editar plan' : 'Nuevo plan de riego'} onClose={() => setModal(null)} onSubmit={submitPlan} loading={loading}>
          <div><label style={lst}>Nombre *</label><input name="nombre" value={form.nombre} onChange={h} style={ist} placeholder="Riego fase vegetativa" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Método</label>
              <select name="metodo" value={form.metodo} onChange={h} style={ist}>
                {METODOS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div><label style={lst}>Frecuencia (días) *</label><input name="frecuencia_dias" type="number" value={form.frecuencia_dias} onChange={h} style={ist} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Litros por m² *</label><input name="litros_por_m2" type="number" step="0.01" value={form.litros_por_m2} onChange={h} style={ist} required /></div>
            <div><label style={lst}>Duración (min)</label><input name="duracion_minutos" type="number" value={form.duracion_minutos} onChange={h} style={ist} /></div>
          </div>
          <div><label style={lst}>Fertilizante (fertirrigación)</label>
            <select name="fertilizante" value={form.fertilizante} onChange={h} style={ist}>
              <option value="">Sin fertilizante</option>
              {prods.filter(p => p.tipo === 'fertilizante').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          {form.fertilizante && <div><label style={lst}>Dosis fertilizante (L/ha)</label><input name="dosis_fertilizante" type="number" step="0.001" value={form.dosis_fertilizante} onChange={h} style={ist} /></div>}
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Fecha inicio</label><input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={h} style={ist} /></div>
            <div><label style={lst}>Fecha fin</label><input name="fecha_fin" type="date" value={form.fecha_fin} onChange={h} style={ist} /></div>
          </div>
        </MiniModal>
      )}

      {regModal && (
        <MiniModal dark={dark} title="Registrar riego" onClose={() => setRegModal(false)} onSubmit={submitReg} loading={loading}>
          <div><label style={lst}>Plan (opcional)</label>
            <select name="plan" value={regForm.plan} onChange={hr} style={ist}>
              <option value="">Sin plan asociado</option>
              {planes.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Fecha *</label><input name="fecha" type="date" value={regForm.fecha} onChange={hr} style={ist} required /></div>
            <div><label style={lst}>Área regada (m²) *</label><input name="area_regada" type="number" step="0.01" value={regForm.area_regada} onChange={hr} style={ist} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Litros aplicados *</label><input name="litros_aplicados" type="number" step="0.01" value={regForm.litros_aplicados} onChange={hr} style={ist} required /></div>
            <div><label style={lst}>Costo agua (S/.)</label><input name="costo_agua" type="number" step="0.01" value={regForm.costo_agua} onChange={hr} style={ist} /></div>
          </div>
          <div><label style={lst}>Fertilizante aplicado</label>
            <select name="fertilizante" value={regForm.fertilizante} onChange={hr} style={ist}>
              <option value="">Sin fertilizante</option>
              {prods.filter(p => p.tipo === 'fertilizante').map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          {regForm.fertilizante && <div><label style={lst}>Dosis</label><input name="dosis_fertilizante" type="number" step="0.001" value={regForm.dosis_fertilizante} onChange={hr} style={ist} /></div>}
          <div><label style={lst}>Operario</label><input name="operario" value={regForm.operario} onChange={hr} style={ist} /></div>
        </MiniModal>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: PRESUPUESTO
══════════════════════════════════════════════════════ */
function PresupuestoTab({ dark, campanaId, campana }) {
  const [items, setItems]     = useState([])
  const [modal, setModal]     = useState(null)
  const [form, setForm]       = useState({ categoria: 'insumo', descripcion: '', cantidad: '', unidad: '', precio_unitario: '', monto_ejecutado: '0' })
  const [loading, setLoading] = useState(false)
  const CATS = [['insumo','Insumo'],['agua','Agua'],['mano_obra','Mano de obra'],['otro','Otro']]

  const fetch = useCallback(async () => { const r = await api.get(`/campanas/${campanaId}/presupuesto/`); setItems(r.data) }, [campanaId])
  useEffect(() => { fetch() }, [fetch])

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      if (modal === 'edit') { await api.patch(`/campanas/presupuesto/${form.id}/`, form); toast.success('Actualizado.') }
      else { await api.post(`/campanas/${campanaId}/presupuesto/`, form); toast.success('Ítem agregado.') }
      setModal(null); fetch()
    } catch { toast.error('Error.') } finally { setLoading(false) }
  }
  const del = async id => { if (!confirm('¿Eliminar?')) return; await api.delete(`/campanas/presupuesto/${id}/`); fetch() }

  const total_pres = items.reduce((s, i) => s + i.monto_presupuestado, 0)
  const total_ej   = items.reduce((s, i) => s + parseFloat(i.monto_ejecutado || 0), 0)
  const varianza   = total_pres - total_ej
  const ingreso_est = campana?.objetivo_cosecha && campana?.precio_venta_estimado
    ? parseFloat(campana.objetivo_cosecha) * parseFloat(campana.precio_venta_estimado) : null
  const rentabilidad = ingreso_est !== null ? ingreso_est - total_ej : null

  const ist = ist_(dark); const lst = lst_(dark)

  const grouped = CATS.reduce((acc, [k]) => {
    acc[k] = items.filter(i => i.categoria === k)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Presupuestado', value: fmt(total_pres), color: dark ? '#60a5fa' : '#2563eb' },
          { label: 'Ejecutado', value: fmt(total_ej), color: dark ? '#4ade80' : '#15803d' },
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
          </div>
        ))}
      </div>

      {/* Tabla por categoría */}
      <div className="flex justify-end">
        <button onClick={() => { setForm({ categoria: 'insumo', descripcion: '', cantidad: '', unidad: '', precio_unitario: '', monto_ejecutado: '0' }); setModal('new') }}
          className="flex items-center gap-1.5 btn-primary text-sm"><Plus size={13} /> Agregar ítem</button>
      </div>

      {CATS.map(([cat, catLabel]) => grouped[cat]?.length > 0 && (
        <div key={cat}>
          <p className="text-[13px] font-bold uppercase tracking-widest mb-2" style={{ color: dark ? D.sub : '#9ca3af' }}>{catLabel}</p>
          <div style={{ borderRadius: '14px', overflow: 'hidden', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, backgroundColor: dark ? D.cardBg : '#fff' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Descripción', 'Cantidad', 'Precio/u.', 'Presupuestado', 'Ejecutado', 'Varianza', ''].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wide" style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grouped[cat].map(item => {
                  const v = item.varianza
                  return (
                    <tr key={item.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: dark ? D.text : '#111827' }}>{item.descripcion}</td>
                      <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{item.cantidad} {item.unidad}</td>
                      <td className="px-4 py-2.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>S/. {parseFloat(item.precio_unitario).toFixed(2)}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{fmt(item.monto_presupuestado)}</td>
                      <td className="px-4 py-2.5 text-sm font-semibold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{fmt(item.monto_ejecutado)}</td>
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-1 text-xs font-bold"
                          style={{ color: v >= 0 ? (dark ? '#4ade80' : '#15803d') : (dark ? '#f87171' : '#dc2626') }}>
                          {v > 0 ? <TrendingDown size={11} /> : v < 0 ? <TrendingUp size={11} /> : <Minus size={11} />}
                          {fmt(Math.abs(v))}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex gap-1">
                          <button onClick={() => { setForm({ ...item }); setModal('edit') }} className="p-1.5 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={12} /></button>
                          <button onClick={() => del(item.id)} className="p-1.5 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-sm text-center py-8" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin ítems presupuestados</p>}

      {modal && (
        <MiniModal dark={dark} title={modal === 'edit' ? 'Editar ítem' : 'Nuevo ítem'} onClose={() => setModal(null)} onSubmit={submit} loading={loading}>
          <div><label style={lst}>Categoría</label>
            <select name="categoria" value={form.categoria} onChange={h} style={ist}>
              {CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label style={lst}>Descripción *</label><input name="descripcion" value={form.descripcion} onChange={h} style={ist} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Cantidad *</label><input name="cantidad" type="number" step="0.01" value={form.cantidad} onChange={h} style={ist} required /></div>
            <div><label style={lst}>Unidad</label><input name="unidad" value={form.unidad} onChange={h} style={ist} placeholder="kg, L, hora..." /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Precio unitario (S/.) *</label><input name="precio_unitario" type="number" step="0.01" value={form.precio_unitario} onChange={h} style={ist} required /></div>
            <div><label style={lst}>Monto ejecutado (S/.)</label><input name="monto_ejecutado" type="number" step="0.01" value={form.monto_ejecutado} onChange={h} style={ist} /></div>
          </div>
        </MiniModal>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   TAB: TRAZABILIDAD
══════════════════════════════════════════════════════ */
function TrazabilidadTab({ dark, campanaId, campana }) {
  const [practicas, setPracticas] = useState([])
  const [aplicaciones, setApls]   = useState([])
  const [riegos, setRiegos]       = useState([])
  const [labores, setLabores]     = useState([])
  const [modal, setModal]         = useState(false)
  const [form, setForm]           = useState({ tipo: 'compost', descripcion: '', fecha: '', cantidad: '', unidad: '' })
  const [loading, setLoading]     = useState(false)

  const TIPOS_PRAC = [
    ['compost','Uso de compost'],['sin_agroquimicos','Sin agroquímicos sintéticos'],
    ['riego_eficiente','Riego eficiente'],['control_biologico','Control biológico'],
    ['abono_verde','Abono verde'],['otro','Otra práctica'],
  ]

  const fetch = useCallback(async () => {
    const [p, a, r, l] = await Promise.all([
      api.get(`/campanas/${campanaId}/practicas/`),
      api.get(`/campanas/${campanaId}/aplicaciones/`),
      api.get(`/campanas/${campanaId}/registros-riego/`),
      api.get(`/campanas/${campanaId}/labores/`),
    ])
    setPracticas(p.data); setApls(a.data); setRiegos(r.data); setLabores(l.data)
  }, [campanaId])
  useEffect(() => { fetch() }, [fetch])

  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post(`/campanas/${campanaId}/practicas/`, { ...form, cantidad: form.cantidad || null })
      toast.success('Práctica registrada.'); setModal(false); fetch()
    } catch { toast.error('Error.') } finally { setLoading(false) }
  }
  const delPrac = async id => { if (!confirm('¿Eliminar?')) return; await api.delete(`/campanas/practicas/${id}/`); fetch() }

  const ist = ist_(dark); const lst = lst_(dark)

  // Build unified timeline
  const timeline = [
    ...labores.filter(l => l.fecha_ejecutada).map(l => ({ fecha: l.fecha_ejecutada, tipo: 'labor', label: l.tipo_labor_nombre, detalle: `${l.cantidad_ejecutada ?? l.cantidad_programada} ${l.tipo_labor_unidad}` })),
    ...aplicaciones.map(a => ({ fecha: a.fecha, tipo: 'aplicacion', label: `Aplicación: ${a.producto_nombre}`, detalle: `${a.dosis_aplicada} · ${a.area_aplicada} m²`, sostenible: a.es_sostenible })),
    ...riegos.map(r => ({ fecha: r.fecha, tipo: 'riego', label: 'Riego', detalle: `${r.litros_aplicados} L · ${r.area_regada} m²` })),
    ...practicas.map(p => ({ fecha: p.fecha, tipo: 'practica', label: p.tipo_display, detalle: p.descripcion })),
  ].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const TIPO_ICON_COLOR = {
    labor:     { color: dark ? '#60a5fa' : '#2563eb',  label: 'Labor'       },
    aplicacion:{ color: dark ? '#f87171' : '#dc2626',  label: 'Aplicación'  },
    riego:     { color: dark ? '#38bdf8' : '#0284c7',  label: 'Riego'       },
    practica:  { color: dark ? '#4ade80' : '#16a34a',  label: 'Práctica'    },
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

    <h2>Prácticas Sostenibles</h2>
    <table><thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Cantidad</th></tr></thead><tbody>
    ${practicas.length ? practicas.map(p => `<tr><td>${p.fecha}</td><td><span class="badge verde">${p.tipo_display}</span></td><td>${p.descripcion}</td><td>${p.cantidad ? p.cantidad + ' ' + p.unidad : '—'}</td></tr>`).join('') : '<tr><td colspan="4" style="color:#9ca3af;text-align:center">Sin prácticas registradas</td></tr>'}
    </tbody></table>

    <h2>Aplicaciones Fitosanitarias</h2>
    <table><thead><tr><th>Fecha</th><th>Producto</th><th>Dosis</th><th>Área</th><th>Costo</th><th>Sostenible</th></tr></thead><tbody>
    ${aplicaciones.length ? aplicaciones.map(a => `<tr><td>${a.fecha}</td><td>${a.producto_nombre}</td><td>${a.dosis_aplicada} ${a.producto_unidad}</td><td>${a.area_aplicada} m²</td><td>S/. ${parseFloat(a.costo_total).toFixed(2)}</td><td>${a.es_sostenible ? '<span class="badge verde">Sí</span>' : '—'}</td></tr>`).join('') : '<tr><td colspan="6" style="color:#9ca3af;text-align:center">Sin aplicaciones</td></tr>'}
    </tbody></table>

    <h2>Registros de Riego</h2>
    <table><thead><tr><th>Fecha</th><th>Litros</th><th>Área</th><th>Fertirrigación</th><th>Costo agua</th></tr></thead><tbody>
    ${riegos.length ? riegos.map(r => `<tr><td>${r.fecha}</td><td>${r.litros_aplicados} L</td><td>${r.area_regada} m²</td><td>${r.fertilizante_nombre ?? '—'}</td><td>S/. ${parseFloat(r.costo_agua).toFixed(2)}</td></tr>`).join('') : '<tr><td colspan="5" style="color:#9ca3af;text-align:center">Sin registros</td></tr>'}
    </tbody></table>

    <h2>Labores Ejecutadas</h2>
    <table><thead><tr><th>Fecha</th><th>Labor</th><th>Cantidad</th><th>Operario</th></tr></thead><tbody>
    ${labores.filter(l => l.estado === 'ejecutada').length ? labores.filter(l => l.estado === 'ejecutada').map(l => `<tr><td>${l.fecha_ejecutada}</td><td>${l.tipo_labor_nombre}</td><td>${l.cantidad_ejecutada ?? l.cantidad_programada} ${l.tipo_labor_unidad}</td><td>${l.operario || '—'}</td></tr>`).join('') : '<tr><td colspan="4" style="color:#9ca3af;text-align:center">Sin labores ejecutadas</td></tr>'}
    </tbody></table>
    </body></html>`
    const w = window.open('', '_blank')
    w.document.write(html)
    w.document.close()
    setTimeout(() => w.print(), 500)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button onClick={() => { setForm({ tipo: 'compost', descripcion: '', fecha: '', cantidad: '', unidad: '' }); setModal(true) }}
            className="flex items-center gap-1.5 btn-primary text-sm"><Plus size={13} /> Registrar práctica</button>
        </div>
        <button onClick={exportPDF}
          className="flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-lg transition-all"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? D.text : '#374151', border: `1px solid ${dark ? D.btnBorder : '#e5e7eb'}` }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6' }}>
          <Printer size={14} /> Exportar PDF
        </button>
      </div>

      {/* Prácticas sostenibles */}
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wide mb-3" style={{ color: dark ? D.sub : '#6b7280' }}>Prácticas sostenibles</p>
        <div className="flex flex-wrap gap-2">
          {practicas.map(p => (
            <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(22,163,74,0.12)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.3)' : '#bbf7d0'}` }}>
              <span className="text-[13px] font-bold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{p.tipo_display}</span>
              <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{p.fecha}</span>
              <button onClick={() => delPrac(p.id)} style={{ color: dark ? '#f87171' : '#dc2626' }}><X size={11} /></button>
            </div>
          ))}
          {practicas.length === 0 && <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin prácticas sostenibles registradas</p>}
        </div>
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

      {modal && (
        <MiniModal dark={dark} title="Registrar práctica sostenible" onClose={() => setModal(false)} onSubmit={submit} loading={loading}>
          <div><label style={lst}>Tipo *</label>
            <select name="tipo" value={form.tipo} onChange={h} style={ist}>
              {TIPOS_PRAC.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div><label style={lst}>Fecha *</label><input name="fecha" type="date" value={form.fecha} onChange={h} style={ist} required /></div>
          <div><label style={lst}>Descripción *</label><textarea name="descripcion" value={form.descripcion} onChange={h} rows={2} style={{ ...ist, resize: 'none' }} required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label style={lst}>Cantidad</label><input name="cantidad" type="number" step="0.01" value={form.cantidad} onChange={h} style={ist} /></div>
            <div><label style={lst}>Unidad</label><input name="unidad" value={form.unidad} onChange={h} style={ist} placeholder="kg, L, m²…" /></div>
          </div>
        </MiniModal>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════ */
export default function CampanaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { dark } = useTheme()
  const [campana, setCampana] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState('labores')
  const [etapaFilter, setEtapaFilter] = useState('')

  const fetch = useCallback(async () => {
    try { const r = await api.get(`/campanas/${id}/`); setCampana(r.data) }
    catch { toast.error('No se encontró la campaña.'); navigate('/campanas') }
    finally { setLoading(false) }
  }, [id])
  useEffect(() => { fetch() }, [fetch])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!campana) return null

  const ec = dark ? ESTADO_COLOR[campana.estado]?.dark : ESTADO_COLOR[campana.estado]?.light
  const cardStyle = { backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px' }

  return (
    <div className="space-y-4">
      {/* Header card */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}` }}>
        <div className="flex items-start gap-4">
          <button onClick={() => navigate('/campanas')} className="p-2 rounded-xl shrink-0 mt-0.5 transition-all"
            style={{ color: dark ? D.sub : '#6b7280', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}>
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-mono text-xs font-bold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{campana.codigo}</span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: ec?.bg, color: ec?.c }}>{campana.estado_display}</span>
            </div>
            <h1 className="text-xl font-extrabold leading-tight" style={{ color: dark ? D.text : '#111827' }}>{campana.variedad_str}</h1>
          </div>
          {campana.objetivo_cosecha && (
            <div className="shrink-0 text-right px-4 py-2.5 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}` }}>
              <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: dark ? '#4ade80' : '#16a34a' }}>Meta cosecha</p>
              <p className="text-base font-extrabold" style={{ color: dark ? '#4ade80' : '#15803d' }}>{campana.objetivo_cosecha} {campana.unidad_cosecha}</p>
              {campana.precio_venta_estimado && (
                <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>S/. {parseFloat(campana.precio_venta_estimado).toFixed(2)}/{campana.unidad_cosecha}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 pt-3" style={{ borderTop: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
            <Leaf size={12} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
            <span className="font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#374151' }}>{campana.biohuerto_nombre}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
            <Calendar size={12} />
            {campana.fecha_inicio}{campana.fecha_fin ? ` → ${campana.fecha_fin}` : ''}
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="font-semibold px-2 py-0.5 rounded-lg" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: dark ? 'rgba(255,255,255,0.65)' : '#374151' }}>
              {campana.area} {campana.unidad_area}
            </span>
          </div>
        </div>
      </div>

      {/* Filtros unificados — sección + etapa */}
      <div className="flex flex-col gap-3" style={{ backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px', padding: '14px 16px' }}>
        {/* Fila 1: secciones */}
        <div className="flex gap-1.5 flex-wrap">
          {TABS.map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setEtapaFilter('') }}
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
        </div>
        {/* Fila 2: etapas (solo labores y fitosanitario) */}
        {(tab === 'labores' || tab === 'fitosanitario') && (
          <div className="flex gap-1.5 flex-wrap" style={{ paddingTop: '10px', borderTop: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
            <button onClick={() => setEtapaFilter('')}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '32px',
                backgroundColor: etapaFilter === '' ? (dark ? 'rgba(255,255,255,0.12)' : '#111827') : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${etapaFilter === '' ? (dark ? 'rgba(255,255,255,0.2)' : '#111827') : dark ? D.btnBorder : '#e5e7eb'}`,
                color: etapaFilter === '' ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              Todas
            </button>
            {ETAPAS.map(et => (
              <button key={et.key} onClick={() => setEtapaFilter(et.key === etapaFilter ? '' : et.key)}
                className="px-3 rounded-lg text-xs font-bold transition-all"
                style={{
                  height: '32px',
                  backgroundColor: etapaFilter === et.key ? (dark ? et.dbg : et.lbg) : dark ? D.btnIdle : '#f3f4f6',
                  border: `1px solid ${etapaFilter === et.key ? (dark ? et.dc : et.lc) : dark ? D.btnBorder : '#e5e7eb'}`,
                  color: etapaFilter === et.key ? (dark ? et.dc : et.lc) : dark ? D.sub : '#6b7280',
                }}>
                {et.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contenido de sección */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}` }}>
        {tab === 'labores'       && <LaboresTab dark={dark} campanaId={id} etapaFilter={etapaFilter} />}
        {tab === 'fitosanitario' && <FitosanitarioTab dark={dark} campanaId={id} etapaFilter={etapaFilter} />}
        {tab === 'riego'         && <RiegoTab dark={dark} campanaId={id} />}
        {tab === 'presupuesto'   && <PresupuestoTab dark={dark} campanaId={id} campana={campana} />}
        {tab === 'trazabilidad'  && <TrazabilidadTab dark={dark} campanaId={id} campana={campana} />}
      </div>
    </div>
  )
}
