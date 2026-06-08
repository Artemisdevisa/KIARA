import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Pencil, Trash2, X, Search, RefreshCw, TreeDeciduous, Leaf, ClipboardList, ChevronDown } from 'lucide-react'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.07)', hoverRow: 'rgba(255,255,255,0.04)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

const CICLO_OPTS = [{ value: 'anual', label: 'Anual' }, { value: 'perenne', label: 'Perenne' }]

const ETAPAS_ANUAL    = ['preparacion','germinacion','crecimiento','floracion','cosecha']
const ETAPAS_PERENNE  = ['preparacion','poda','brotacion','floracion','cosecha']
const ETAPAS_ALL = [
  { key: 'preparacion', label: 'Preparación', dc: '#94a3b8', lc: '#64748b', dbg: 'rgba(148,163,184,0.15)', lbg: '#f8fafc' },
  { key: 'germinacion', label: 'Germinación', dc: '#fbbf24', lc: '#d97706', dbg: 'rgba(251,191,36,0.15)',  lbg: '#fffbeb' },
  { key: 'crecimiento', label: 'Crecimiento', dc: '#4ade80', lc: '#15803d', dbg: 'rgba(74,222,128,0.15)', lbg: '#f0fdf4' },
  { key: 'establecido', label: 'Establecido', dc: '#60a5fa', lc: '#2563eb', dbg: 'rgba(96,165,250,0.15)', lbg: '#eff6ff' },
  { key: 'poda',        label: 'Poda',        dc: '#c084fc', lc: '#7c3aed', dbg: 'rgba(192,132,252,0.15)',lbg: '#f5f3ff' },
  { key: 'brotacion',   label: 'Brotación',   dc: '#34d399', lc: '#059669', dbg: 'rgba(52,211,153,0.15)', lbg: '#ecfdf5' },
  { key: 'floracion',   label: 'Floración',   dc: '#f9a8d4', lc: '#db2777', dbg: 'rgba(249,168,212,0.15)',lbg: '#fdf2f8' },
  { key: 'cosecha',     label: 'Cosecha',     dc: '#fb923c', lc: '#ea580c', dbg: 'rgba(251,146,60,0.15)', lbg: '#fff7ed' },
]
const etapaInfo = key => ETAPAS_ALL.find(e => e.key === key) || { label: 'General', dc: '#94a3b8', lc: '#6b7280', dbg: 'rgba(148,163,184,0.10)', lbg: '#f9fafb' }
const etapasFor = ciclo => ciclo === 'perenne' ? ETAPAS_PERENNE : ETAPAS_ANUAL
const groupByEtapa = items => {
  const order = ETAPAS_ALL.map(e => e.key)
  const groups = {}
  items.forEach(i => { const k = i.etapa || ''; if (!groups[k]) groups[k] = []; groups[k].push(i) })
  return Object.entries(groups).sort(([a],[b]) => {
    const ia = order.indexOf(a), ib = order.indexOf(b)
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
  })
}

function Modal({ dark, title, onClose, onSubmit, loading, children }) {
  const ps = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col" style={{ ...ps, maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ color: D.sub }}><X size={18} /></button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col min-h-0" style={{ flex: 1 }}>
          <div className="overflow-y-auto thin-scroll px-6 pb-4 space-y-4" style={{ flex: 1 }}>{children}</div>
          <div className="flex gap-3 px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}` }}>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SearchSelect({ dark, options, value, onChange, placeholder }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const selected = options.find(o => String(o.value) === String(value))
  const filtered = q ? options.filter(o => o.label.toLowerCase().includes(q.toLowerCase())) : options

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const ist = { backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          value={open ? q : (selected?.label || '')}
          onChange={e => { setQ(e.target.value); onChange('') }}
          onFocus={() => { setOpen(true); setQ('') }}
          placeholder={placeholder || 'Buscar...'}
          style={ist}
        />
        <ChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af', pointerEvents: 'none' }} />
      </div>
      {open && filtered.length > 0 && (
        <div className="thin-scroll" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, maxHeight: 180, overflowY: 'auto', borderRadius: '10px', marginTop: 4, backgroundColor: dark ? '#1e2a3a' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.14)' : '#e5e7eb'}`, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
          {options.length > 0 && value && (
            <div onClick={() => { onChange(''); setQ(''); setOpen(false) }}
              style={{ padding: '7px 12px', fontSize: '13px', cursor: 'pointer', color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af', borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}` }}>
              — Sin seleccionar
            </div>
          )}
          {filtered.map(o => (
            <div key={o.value} onClick={() => { onChange(o.value); setQ(''); setOpen(false) }}
              style={{ padding: '7px 12px', fontSize: '13px', cursor: 'pointer', color: dark ? 'rgba(255,255,255,0.90)' : '#111827', backgroundColor: String(value) === String(o.value) ? (dark ? 'rgba(251,191,36,0.12)' : '#fffbeb') : 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.07)' : '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = String(value) === String(o.value) ? (dark ? 'rgba(251,191,36,0.12)' : '#fffbeb') : 'transparent'}>
              {o.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function PlantillaModal({ dark, variedad, onClose }) {
  const [productos, setProductos]   = useState([])
  const [labores, setLabores]       = useState([])
  const [allProds, setAllProds]     = useState([])
  const [allLabors, setAllLabors]   = useState([])
  const [allObjetivos, setAllObj]   = useState([])
  const [allUnidades, setAllUnid]   = useState([])
  const [allCondiciones, setAllCond]= useState([])
  const [allPlagas, setAllPlagas]   = useState([])
  const [tab, setTab]               = useState('productos')
  const [formP, setFormP]           = useState({ producto: '', objetivo: '', plaga: '', dosis: '', unidad: '', dias_antes_cosecha: '', frecuencia_dias: '', condicion: '', etapa: '' })
  const [formL, setFormL]           = useState({ tipo_labor: '', cantidad: '1', semana_relativa: '', etapa: '', notas: '' })
  const [showFormP, setShowFormP]   = useState(false)
  const [showFormL, setShowFormL]   = useState(false)
  const [loading, setLoading]       = useState(false)

  const fetchAll = useCallback(async () => {
    const [p, l, ap, al, ao, au, ac, apg] = await Promise.all([
      api.get(`/campanas/variedades/${variedad.id}/plantilla-productos/`),
      api.get(`/campanas/variedades/${variedad.id}/plantilla-labores/`),
      api.get('/campanas/productos/'),
      api.get('/campanas/tipos-labor/'),
      api.get('/campanas/objetivos/'),
      api.get('/campanas/unidades/'),
      api.get('/campanas/condiciones/'),
      api.get('/campanas/plagas/'),
    ])
    setProductos(p.data); setLabores(l.data)
    setAllProds(ap.data); setAllLabors(al.data)
    setAllObj(ao.data); setAllUnid(au.data)
    setAllCond(ac.data); setAllPlagas(apg.data)
  }, [variedad.id])
  useEffect(() => { fetchAll() }, [fetchAll])

  const lst = { display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: dark ? 'rgba(255,255,255,0.45)' : '#6b7280' }

  const addProducto = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post(`/campanas/variedades/${variedad.id}/plantilla-productos/`, {
        producto:           formP.producto || undefined,
        objetivo:           formP.objetivo  || null,
        plaga:              formP.plaga     || null,
        dosis:              formP.dosis     || null,
        unidad:             formP.unidad    || null,
        dias_antes_cosecha: formP.dias_antes_cosecha || null,
        frecuencia_dias:    formP.frecuencia_dias    || null,
        condicion:          formP.condicion || null,
        etapa:              formP.etapa     || '',
      })
      setFormP({ producto: '', objetivo: '', plaga: '', dosis: '', unidad: '', dias_antes_cosecha: '', frecuencia_dias: '', condicion: '', etapa: '' })
      setShowFormP(false); fetchAll(); toast.success('Producto agregado a la plantilla.')
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const addLabor = async e => {
    e.preventDefault(); setLoading(true)
    try {
      await api.post(`/campanas/variedades/${variedad.id}/plantilla-labores/`, {
        ...formL,
        semana_relativa: formL.semana_relativa || null,
        etapa: formL.etapa || '',
      })
      setFormL({ tipo_labor: '', cantidad: '1', semana_relativa: '', etapa: '', notas: '' })
      setShowFormL(false); fetchAll(); toast.success('Labor agregada a la plantilla.')
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const delP = async id => { await api.delete(`/campanas/plantilla-productos/${id}/`); fetchAll() }
  const delL = async id => { await api.delete(`/campanas/plantilla-labores/${id}/`);   fetchAll() }

  const ps = { backgroundColor: dark ? '#1a2535' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }

  const prodOpts   = allProds.map(p => ({ value: p.id, label: `${p.nombre} (${p.tipo_display})` }))
  const laborOpts  = allLabors.map(l => ({ value: l.id, label: `${l.codigo} — ${l.nombre}` }))
  const objOpts    = allObjetivos.map(o => ({ value: o.id, label: o.nombre }))
  const unidOpts   = allUnidades.map(u => ({ value: u.id, label: u.codigo }))
  const condOpts   = allCondiciones.map(c => ({ value: c.id, label: c.nombre }))
  const plagaOpts  = allPlagas.map(p => ({ value: p.id, label: `${p.nombre} (${p.tipo_display})` }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl z-10 flex flex-col" style={{ ...ps, maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0">
          <div>
            <h2 className="text-base font-extrabold" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#111827' }}>
              Plantilla — {variedad.cultivo} {variedad.nombre}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#9ca3af' }}>
              Se precarga automáticamente al crear una campaña con esta variedad
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'rgba(255,255,255,0.45)' }}><X size={18} /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-6 pb-2 shrink-0">
          {[['productos', 'Productos fitosanitarios'], ['labores', 'Labores']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="px-4 py-1.5 rounded-lg text-sm font-bold transition-all"
              style={{
                backgroundColor: tab === k ? (dark ? 'rgba(251,191,36,0.15)' : '#fffbeb') : 'transparent',
                color: tab === k ? (dark ? '#fbbf24' : '#d97706') : (dark ? 'rgba(255,255,255,0.45)' : '#6b7280'),
                border: tab === k ? `1px solid ${dark ? 'rgba(251,191,36,0.4)' : '#fde68a'}` : '1px solid transparent',
              }}>{l}</button>
          ))}
        </div>

        <div className="overflow-y-auto thin-scroll px-6 pb-5 space-y-3" style={{ flex: 1, borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}`, paddingTop: '12px' }}>

          {/* TAB PRODUCTOS */}
          {tab === 'productos' && (
            <>
              {productos.length === 0 && !showFormP && <p className="text-sm text-center py-4" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}>Sin productos en la plantilla</p>}
              {groupByEtapa(productos).map(([etapaKey, items]) => {
                const et = etapaInfo(etapaKey)
                const ec = dark ? et.dc : et.lc
                const ebg = dark ? et.dbg : et.lbg
                return (
                  <div key={etapaKey} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: ebg, color: ec }}>{et.label}</span>
                      <span className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{items.length} producto{items.length !== 1 ? 's' : ''}</span>
                    </div>
                    {items.map(p => (
                      <div key={p.id} className="flex items-start justify-between p-3 rounded-xl ml-1"
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}`, borderLeft: `3px solid ${ec}` }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#111827' }}>{p.producto_nombre}</p>
                          <p className="text-xs mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#6b7280' }}>
                            {p.dosis ? `${p.dosis} ${p.unidad_codigo || ''}` : 'Sin dosis'}{p.objetivo_nombre ? ` · ${p.objetivo_nombre}` : ''}{p.plaga_nombre ? ` → ${p.plaga_nombre}` : ''}{p.condicion_nombre ? ` · ${p.condicion_nombre}` : ''}{p.dias_antes_cosecha ? ` · ${p.dias_antes_cosecha}d antes cosecha` : ''}
                          </p>
                        </div>
                        <button onClick={() => delP(p.id)} className="p-1.5 rounded-lg shrink-0" style={{ color: dark ? '#f87171' : '#dc2626' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )
              })}

              {showFormP
                ? <form onSubmit={addProducto} className="p-3 rounded-xl space-y-3 mt-2" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}` }}>
                    <div><label style={lst}>Producto *</label>
                      <SearchSelect dark={dark} options={prodOpts} value={formP.producto} onChange={v => setFormP(f => ({ ...f, producto: v }))} placeholder="Buscar producto..." />
                    </div>
                    <div><label style={lst}>Etapa fenológica</label>
                      <select value={formP.etapa} onChange={e => setFormP(f => ({ ...f, etapa: e.target.value }))}
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }}>
                        <option value="">Sin etapa</option>
                        {etapasFor(variedad.tipo_ciclo).map(k => {
                          const e = etapaInfo(k); return <option key={k} value={k}>{e.label}</option>
                        })}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label style={lst}>Objetivo</label>
                        <SearchSelect dark={dark} options={objOpts} value={formP.objetivo} onChange={v => setFormP(f => ({ ...f, objetivo: v }))} placeholder="Buscar objetivo..." />
                      </div>
                      <div><label style={lst}>Plaga / enfermedad</label>
                        <SearchSelect dark={dark} options={plagaOpts} value={formP.plaga} onChange={v => setFormP(f => ({ ...f, plaga: v }))} placeholder="Buscar plaga..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div><label style={lst}>Dosis</label>
                        <input type="number" step="0.001" value={formP.dosis} onChange={e => setFormP(f => ({ ...f, dosis: e.target.value }))}
                          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }} />
                      </div>
                      <div><label style={lst}>Unidad</label>
                        <SearchSelect dark={dark} options={unidOpts} value={formP.unidad} onChange={v => setFormP(f => ({ ...f, unidad: v }))} placeholder="mL/L, g/L…" />
                      </div>
                      <div><label style={lst}>Días antes cosecha</label>
                        <input type="number" value={formP.dias_antes_cosecha} onChange={e => setFormP(f => ({ ...f, dias_antes_cosecha: e.target.value }))}
                          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label style={lst}>Frecuencia (días)</label>
                        <input type="number" value={formP.frecuencia_dias} onChange={e => setFormP(f => ({ ...f, frecuencia_dias: e.target.value }))}
                          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }} />
                      </div>
                      <div><label style={lst}>Condición</label>
                        <SearchSelect dark={dark} options={condOpts} value={formP.condicion} onChange={v => setFormP(f => ({ ...f, condicion: v }))} placeholder="Buscar condición..." />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowFormP(false)} className="flex-1 btn-secondary text-sm">Cancelar</button>
                      <button type="submit" disabled={loading || !formP.producto} className="flex-1 btn-primary text-sm">Agregar</button>
                    </div>
                  </form>
                : <button onClick={() => setShowFormP(true)} className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg w-full mt-2"
                    style={{ color: dark ? '#fbbf24' : '#d97706', backgroundColor: dark ? 'rgba(251,191,36,0.08)' : '#fffbeb', border: `1px dashed ${dark ? 'rgba(251,191,36,0.3)' : '#fde68a'}` }}>
                    <Plus size={14} /> Agregar producto a plantilla
                  </button>
              }
            </>
          )}

          {/* TAB LABORES */}
          {tab === 'labores' && (
            <>
              {labores.length === 0 && !showFormL && <p className="text-sm text-center py-4" style={{ color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af' }}>Sin labores en la plantilla</p>}
              {groupByEtapa(labores).map(([etapaKey, items]) => {
                const et = etapaInfo(etapaKey)
                const ec = dark ? et.dc : et.lc
                const ebg = dark ? et.dbg : et.lbg
                return (
                  <div key={etapaKey} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg"
                        style={{ backgroundColor: ebg, color: ec }}>{et.label}</span>
                      <span className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{items.length} labor{items.length !== 1 ? 'es' : ''}</span>
                    </div>
                    {items.map(l => (
                      <div key={l.id} className="flex items-start justify-between p-3 rounded-xl ml-1"
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}`, borderLeft: `3px solid ${ec}` }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#111827' }}>{l.tipo_labor_nombre}</p>
                          <p className="text-xs mt-0.5" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#6b7280' }}>
                            {l.cantidad} {l.tipo_labor_unidad}{l.semana_relativa != null ? ` · semana ${l.semana_relativa}` : ''}{l.notas ? ` · ${l.notas}` : ''}
                          </p>
                        </div>
                        <button onClick={() => delL(l.id)} className="p-1.5 rounded-lg shrink-0" style={{ color: dark ? '#f87171' : '#dc2626' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={13} /></button>
                      </div>
                    ))}
                  </div>
                )
              })}

              {showFormL
                ? <form onSubmit={addLabor} className="p-3 rounded-xl space-y-3 mt-2" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb'}` }}>
                    <div><label style={lst}>Tipo de labor *</label>
                      <SearchSelect dark={dark} options={laborOpts} value={formL.tipo_labor} onChange={v => setFormL(f => ({ ...f, tipo_labor: v }))} placeholder="Buscar labor..." />
                    </div>
                    <div><label style={lst}>Etapa fenológica</label>
                      <select value={formL.etapa} onChange={e => setFormL(f => ({ ...f, etapa: e.target.value }))}
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }}>
                        <option value="">Sin etapa</option>
                        {etapasFor(variedad.tipo_ciclo).map(k => {
                          const e = etapaInfo(k); return <option key={k} value={k}>{e.label}</option>
                        })}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><label style={lst}>Cantidad</label>
                        <input type="number" step="0.01" value={formL.cantidad} onChange={e => setFormL(f => ({ ...f, cantidad: e.target.value }))}
                          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }} />
                      </div>
                      <div><label style={lst}>Semana del ciclo</label>
                        <input type="number" value={formL.semana_relativa} onChange={e => setFormL(f => ({ ...f, semana_relativa: e.target.value }))}
                          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }} placeholder="1, 2, 3…" />
                      </div>
                    </div>
                    <div><label style={lst}>Notas</label>
                      <input value={formL.notas} onChange={e => setFormL(f => ({ ...f, notas: e.target.value }))}
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f9fafb', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}`, color: dark ? 'rgba(255,255,255,0.90)' : '#111827', width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '14px', outline: 'none' }} />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowFormL(false)} className="flex-1 btn-secondary text-sm">Cancelar</button>
                      <button type="submit" disabled={loading || !formL.tipo_labor} className="flex-1 btn-primary text-sm">Agregar</button>
                    </div>
                  </form>
                : <button onClick={() => setShowFormL(true)} className="flex items-center gap-2 text-sm font-bold px-3 py-2 rounded-lg w-full mt-2"
                    style={{ color: dark ? '#fbbf24' : '#d97706', backgroundColor: dark ? 'rgba(251,191,36,0.08)' : '#fffbeb', border: `1px dashed ${dark ? 'rgba(251,191,36,0.3)' : '#fde68a'}` }}>
                    <Plus size={14} /> Agregar labor a plantilla
                  </button>
              }
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function VariedadesPage() {
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [data, setData]               = useState([])
  const [search, setSearch]           = useState('')
  const [filtro, setFiltro]           = useState('')
  const [modal, setModal]             = useState(null)
  const [form, setForm]               = useState({ cultivo: '', nombre: '', subtipo: '', tipo_ciclo: 'anual', dias_ciclo: '', descripcion: '' })
  const [loading, setLoading]         = useState(false)
  const [plantillaVariedad, setPlantillaVariedad] = useState(null)

  const fetch = useCallback(async () => { const r = await api.get('/campanas/variedades/'); setData(r.data) }, [])
  useEffect(() => { fetch() }, [fetch])

  const openNew  = () => { setForm({ cultivo: '', nombre: '', subtipo: '', tipo_ciclo: 'anual', dias_ciclo: '', descripcion: '' }); setModal('new') }
  const openEdit = item => { setForm({ ...item, dias_ciclo: item.dias_ciclo ?? '' }); setModal('edit') }
  const h = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = { ...form, dias_ciclo: form.dias_ciclo || null }
      if (modal === 'edit') { await api.patch(`/campanas/variedades/${form.id}/`, payload); toast.success('Variedad actualizada.') }
      else { await api.post('/campanas/variedades/', payload); toast.success('Variedad registrada.') }
      setModal(null); fetch()
    } catch { toast.error('Error al guardar.') } finally { setLoading(false) }
  }

  const del = async item => {
    if (!confirm(`¿Eliminar "${item.nombre}"?`)) return
    try { await api.delete(`/campanas/variedades/${item.id}/`); toast.success('Eliminada.'); fetch() }
    catch { toast.error('No se pudo eliminar.') }
  }

  const filtered = data.filter(v => {
    const q = search.toLowerCase()
    const matchQ = !q || `${v.cultivo} ${v.nombre} ${v.subtipo}`.toLowerCase().includes(q)
    const matchC = !filtro || v.tipo_ciclo === filtro
    return matchQ && matchC
  })

  const ist = { backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`, color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none' }
  const lst = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }
  const cardStyle = { backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px' }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/catalogos')} className="p-2 rounded-xl transition-all"
          style={{ color: dark ? D.sub : '#6b7280', backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6'}>
          <ArrowLeft size={16} />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4' }}>
            <Leaf size={18} style={{ color: dark ? '#4ade80' : '#15803d' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Variedades</h1>
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>{data.length} variedades registradas</p>
          </div>
        </div>
      </div>

      {/* Barra de acciones */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cultivo o variedad..."
            style={{ ...ist, paddingLeft: '36px', width: '260px', height: '40px', paddingTop: 0, paddingBottom: 0 }} />
        </div>
        <select value={filtro} onChange={e => setFiltro(e.target.value)}
          style={{ ...ist, width: 'auto', height: '40px', paddingTop: 0, paddingBottom: 0 }}>
          <option value="">Todos los ciclos</option>
          <option value="anual">Anual</option>
          <option value="perenne">Perenne</option>
        </select>
        <div className="ml-auto">
          <button onClick={openNew} className="flex items-center gap-2 btn-primary"><Plus size={15} /> Nueva variedad</button>
        </div>
      </div>

      {/* Tabla */}
      <div style={cardStyle}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
              {['Cultivo', 'Variedad', 'Subtipo', 'Ciclo', 'Días del ciclo', 'Descripción', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide ${i === 6 ? 'text-right' : ''}`}
                  style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(v => (
              <tr key={v.id} style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td className="px-5 py-3.5 font-bold text-sm" style={{ color: dark ? D.text : '#111827' }}>{v.cultivo}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: dark ? D.text : '#374151' }}>{v.nombre}</td>
                <td className="px-5 py-3.5 text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>{v.subtipo || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit"
                    style={v.tipo_ciclo === 'perenne'
                      ? { backgroundColor: dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4', color: dark ? '#4ade80' : '#15803d' }
                      : { backgroundColor: dark ? 'rgba(217,119,6,0.15)' : '#fffbeb', color: dark ? '#fbbf24' : '#d97706' }}>
                    {v.tipo_ciclo === 'perenne' ? <TreeDeciduous size={11} /> : <RefreshCw size={11} />}
                    {v.tipo_ciclo === 'perenne' ? 'Perenne' : 'Anual'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>{v.dias_ciclo ?? '—'}</td>
                <td className="px-5 py-3.5 text-sm max-w-xs truncate" style={{ color: dark ? D.sub : '#6b7280' }}>{v.descripcion || '—'}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setPlantillaVariedad(v)} className="p-2 rounded-lg" title="Plantilla"
                      style={{ color: dark ? '#fbbf24' : '#d97706' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(251,191,36,0.15)' : '#fffbeb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><ClipboardList size={15} /></button>
                    <button onClick={() => openEdit(v)} className="p-2 rounded-lg" style={{ color: dark ? '#60a5fa' : '#2563eb' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={15} /></button>
                    <button onClick={() => del(v)} className="p-2 rounded-lg" style={{ color: dark ? '#f87171' : '#dc2626' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin variedades registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal dark={dark} title={modal === 'edit' ? 'Editar variedad' : 'Nueva variedad'} onClose={() => setModal(null)} onSubmit={submit} loading={loading}>
          <div className="grid grid-cols-2 gap-4">
            <div><label style={lst}>Cultivo *</label><input name="cultivo" value={form.cultivo} onChange={h} style={ist} placeholder="Papaya" required /></div>
            <div><label style={lst}>Variedad *</label><input name="nombre" value={form.nombre} onChange={h} style={ist} placeholder="Maradol" required /></div>
          </div>
          <div><label style={lst}>Subtipo</label><input name="subtipo" value={form.subtipo} onChange={h} style={ist} placeholder="Opcional (ej: Rojo, Baby…)" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label style={lst}>Tipo de ciclo</label>
              <select name="tipo_ciclo" value={form.tipo_ciclo} onChange={h} style={ist}>
                {CICLO_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div><label style={lst}>Días del ciclo</label><input name="dias_ciclo" type="number" value={form.dias_ciclo} onChange={h} style={ist} placeholder="90" /></div>
          </div>
          <div><label style={lst}>Descripción</label><textarea name="descripcion" value={form.descripcion} onChange={h} rows={3} style={{ ...ist, resize: 'none' }} /></div>
        </Modal>
      )}

      {plantillaVariedad && (
        <PlantillaModal dark={dark} variedad={plantillaVariedad} onClose={() => setPlantillaVariedad(null)} />
      )}
    </div>
  )
}
