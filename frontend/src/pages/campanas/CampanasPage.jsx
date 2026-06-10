import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { CalendarRange, Plus, X, Search, Pencil, Trash2, Leaf, Calendar } from 'lucide-react'
import Breadcrumb from '../../components/ui/Breadcrumb'

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  divider: 'rgba(255,255,255,0.07)', hoverRow: 'rgba(255,255,255,0.04)',
  btnIdle: 'rgba(255,255,255,0.07)', btnBorder: 'rgba(255,255,255,0.10)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

const ESTADO_COLOR = {
  planificada: { dark: { bg: 'rgba(59,130,246,0.15)',  c: '#60a5fa' }, light: { bg: '#dbeafe', c: '#1d4ed8' } },
  activa:      { dark: { bg: 'rgba(22,163,74,0.15)',   c: '#4ade80' }, light: { bg: '#dcfce7', c: '#15803d' } },
  cerrada:     { dark: { bg: 'rgba(255,255,255,0.08)', c: '#94a3b8' }, light: { bg: '#f3f4f6', c: '#6b7280' } },
  cancelada:   { dark: { bg: 'rgba(239,68,68,0.15)',   c: '#f87171' }, light: { bg: '#fee2e2', c: '#dc2626' } },
}

const EMPTY_FORM = {
  biohuerto: '', variedad: '', anio: new Date().getFullYear(), fecha_inicio: '',
  fecha_fin: '', area: '', unidad_area: 'm²', estado: 'planificada',
  numero_ciclo: 1, campana_anterior: '',
  objetivo_cosecha: '', unidad_cosecha: 'kg', precio_venta_estimado: '', notas: '',
}

function CampanaModal({ dark, onClose, onSaved, editItem }) {
  const [form, setForm]         = useState(editItem ? { ...editItem, variedad: editItem.variedad?.id ?? editItem.variedad, campana_anterior: editItem.campana_anterior ?? '' } : EMPTY_FORM)
  const [loading, setLoading]   = useState(false)
  const [biohuertos, setBio]    = useState([])
  const [variedades, setVar]    = useState([])
  const [prevCampanas, setPrev] = useState([])

  useEffect(() => {
    api.get('/biohuertos/').then(r => setBio(r.data)).catch(() => {})
    api.get('/campanas/variedades/').then(r => setVar(r.data)).catch(() => {})
    api.get('/campanas/').then(r => setPrev(r.data)).catch(() => {})
  }, [])

  const selectedVar = variedades.find(v => String(v.id) === String(form.variedad))
  const isPerenne   = selectedVar?.tipo_ciclo === 'perenne'
  const prevOptions = prevCampanas.filter(c =>
    String(c.variedad) === String(form.variedad) &&
    (!editItem || c.id !== editItem.id)
  )

  const h = e => {
    const { name, value } = e.target
    if (name === 'campana_anterior') {
      const prev = prevCampanas.find(c => String(c.id) === String(value))
      setForm(f => ({
        ...f,
        campana_anterior: value,
        numero_ciclo: prev ? (prev.numero_ciclo || 1) + 1 : 1,
      }))
    } else if (name === 'variedad') {
      setForm(f => ({ ...f, variedad: value, campana_anterior: '', numero_ciclo: 1 }))
    } else {
      setForm(f => ({ ...f, [name]: value }))
    }
  }

  const submit = async e => {
    e.preventDefault(); setLoading(true)
    try {
      const payload = {
        ...form,
        fecha_fin: form.fecha_fin || null,
        objetivo_cosecha: form.objetivo_cosecha || null,
        precio_venta_estimado: form.precio_venta_estimado || null,
        campana_anterior: form.campana_anterior || null,
        numero_ciclo: Number(form.numero_ciclo) || 1,
      }
      if (editItem) { await api.patch(`/campanas/${editItem.id}/`, payload); toast.success('Campaña actualizada.') }
      else { await api.post('/campanas/', payload); toast.success('Campaña registrada.') }
      onSaved()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') Object.values(msg).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al guardar.')
    } finally { setLoading(false) }
  }

  const panelStyle = { backgroundColor: dark ? '#1e2a3a' : '#fff', border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb' }
  const ist = { backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`, color: dark ? D.text : '#111827', width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none' }
  const lst = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col" style={{ ...panelStyle, maxHeight: '92vh' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>{editItem ? 'Editar campaña' : 'Nueva campaña'}</h2>
          <button onClick={onClose} style={{ color: D.sub }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="flex flex-col min-h-0" style={{ flex: 1 }}>
          <div className="overflow-y-auto thin-scroll px-6 pb-4 space-y-3" style={{ flex: 1 }}>
            <div><label style={lst}>Biohuerto *</label>
              <select name="biohuerto" value={form.biohuerto} onChange={h} style={ist} required>
                <option value="">Selecciona biohuerto</option>
                {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
            <div><label style={lst}>Variedad *</label>
              <select name="variedad" value={form.variedad} onChange={h} style={ist} required>
                <option value="">Selecciona variedad</option>
                {variedades.map(v => <option key={v.id} value={v.id}>{v.cultivo} — {v.nombre}{v.subtipo ? ` (${v.subtipo})` : ''}{v.tipo_ciclo === 'perenne' ? ' 🌿' : ''}</option>)}
              </select>
            </div>
            {isPerenne && (
              <div className="rounded-xl p-3 space-y-3" style={{ backgroundColor: dark ? 'rgba(52,211,153,0.07)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(52,211,153,0.20)' : '#bbf7d0'}` }}>
                <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: dark ? '#34d399' : '#065f46' }}>
                  Planta perenne — continuidad de la planta
                </p>
                <div>
                  <label style={lst}>¿Viene de una campaña anterior?</label>
                  <select name="campana_anterior" value={form.campana_anterior} onChange={h} style={ist}>
                    <option value="">— No, es planta nueva (ciclo 1) —</option>
                    {prevOptions.length === 0
                      ? <option disabled>Sin campañas anteriores de esta variedad</option>
                      : prevOptions.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.codigo} ({c.anio}) — Ciclo {c.numero_ciclo}
                          </option>
                        ))
                    }
                  </select>
                </div>
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ backgroundColor: dark ? 'rgba(0,0,0,0.20)' : '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#d1fae5'}` }}>
                  <div className="text-2xl font-black" style={{ color: dark ? '#34d399' : '#059669' }}>
                    {form.numero_ciclo}
                  </div>
                  <div>
                    <p className="text-[11px] font-black" style={{ color: dark ? '#34d399' : '#065f46' }}>
                      {Number(form.numero_ciclo) === 1 ? 'Establecimiento' : 'Producción'}
                    </p>
                    <p className="text-[11px]" style={{ color: dark ? 'rgba(255,255,255,0.40)' : '#6b7280' }}>
                      {Number(form.numero_ciclo) === 1
                        ? 'Planta nueva — etapas: preparación → crecimiento → cosecha'
                        : 'Planta establecida — etapas: poda → brotación → cosecha'}
                    </p>
                  </div>
                  <input name="numero_ciclo" type="number" min="1" value={form.numero_ciclo} onChange={h}
                    className="ml-auto w-16 text-center font-bold text-sm rounded-lg outline-none"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#bbf7d0'}`, color: dark ? D.text : '#111827', padding: '6px' }} />
                </div>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div><label style={lst}>Año *</label><input name="anio" type="number" value={form.anio} onChange={h} style={ist} required /></div>
              <div><label style={lst}>Inicio *</label><input name="fecha_inicio" type="date" value={form.fecha_inicio} onChange={h} style={ist} required /></div>
              <div><label style={lst}>Fin (est.)</label><input name="fecha_fin" type="date" value={form.fecha_fin} onChange={h} style={ist} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><label style={lst}>Área *</label><input name="area" type="number" step="0.01" value={form.area} onChange={h} style={ist} placeholder="100" required /></div>
              <div><label style={lst}>Unidad</label><input name="unidad_area" value={form.unidad_area} onChange={h} style={ist} /></div>
            </div>
            {editItem && (
              <div><label style={lst}>Estado</label>
                <select name="estado" value={form.estado} onChange={h} style={ist}>
                  {[['planificada','Planificada'],['activa','Activa'],['cerrada','Cerrada'],['cancelada','Cancelada']].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><label style={lst}>Objetivo de cosecha</label><input name="objetivo_cosecha" type="number" step="0.01" value={form.objetivo_cosecha} onChange={h} style={ist} placeholder="500" /></div>
              <div><label style={lst}>Unidad</label><input name="unidad_cosecha" value={form.unidad_cosecha} onChange={h} style={ist} placeholder="kg" /></div>
            </div>
            <div><label style={lst}>Precio venta estimado (S/. por unidad)</label><input name="precio_venta_estimado" type="number" step="0.01" value={form.precio_venta_estimado} onChange={h} style={ist} /></div>
            <div><label style={lst}>Notas</label><textarea name="notas" value={form.notas} onChange={h} rows={2} style={{ ...ist, resize: 'none' }} /></div>
          </div>
          <div className="flex gap-3 px-6 py-4 shrink-0" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}` }}>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">{loading ? 'Guardando...' : editItem ? 'Guardar cambios' : 'Registrar'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmModal({ dark, message, onConfirm, onCancel }) {
  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="font-extrabold text-base" style={{ color: dark ? 'rgba(255,255,255,0.90)' : '#111827' }}>Confirmar eliminación</h3>
          <p className="text-sm" style={{ color: dark ? 'rgba(255,255,255,0.45)' : '#6b7280' }}>{message}</p>
          <div className="flex gap-3 w-full pt-1">
            <button onClick={onCancel} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button onClick={onConfirm} className="flex-1 btn-danger text-sm">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CampanasPage() {
  const { dark } = useTheme()
  const navigate = useNavigate()
  const [campanas, setCampanas]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [estadoF, setEstadoF]       = useState('')
  const [anioF, setAnioF]           = useState('')
  const [modal, setModal]           = useState(false)
  const [editItem, setEditItem]     = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try { const r = await api.get('/campanas/'); setCampanas(r.data) }
    catch { toast.error('No se pudo cargar las campañas.') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetch() }, [fetch])

  const del = c => setDelConfirm({
    msg: `¿Eliminar la campaña "${c.codigo}"? Esta acción no se puede deshacer.`,
    fn:  async () => {
      try { await api.delete(`/campanas/${c.id}/`); toast.success('Campaña eliminada.'); fetch() }
      catch { toast.error('No se pudo eliminar.') }
    }
  })

  const anios = [...new Set(campanas.map(c => c.anio))].sort((a, b) => b - a)

  const filtered = campanas.filter(c => {
    const q = search.toLowerCase()
    const ms = !search || `${c.codigo} ${c.variedad_str} ${c.biohuerto_nombre}`.toLowerCase().includes(q)
    const me = !estadoF || c.estado === estadoF
    const ma = !anioF || String(c.anio) === String(anioF)
    return ms && me && ma
  })

  const cardStyle = { backgroundColor: dark ? D.cardBg : '#fff', border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`, borderRadius: '16px' }
  const ESTADOS = ['', 'planificada', 'activa', 'cerrada', 'cancelada']
  const ESTADO_LABELS = { '': 'Todos', planificada: 'Planificada', activa: 'Activa', cerrada: 'Cerrada', cancelada: 'Cancelada' }

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Mi Huerto', to: '/mi-huerto' }, { label: 'Campañas' }]} />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <CalendarRange size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Campañas</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>{filtered.length} campaña{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button onClick={() => { setEditItem(null); setModal(true) }} className="flex items-center gap-2 btn-primary text-sm"><Plus size={15} /> Nueva campaña</button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center" style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar campaña..."
            style={{ width: '100%', paddingLeft: '32px', paddingRight: '12px', paddingTop: '7px', paddingBottom: '7px', fontSize: '13px', borderRadius: '10px', outline: 'none', backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`, color: dark ? D.text : '#374151', height: '36px' }} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ESTADOS.map(e => (
            <button key={e} onClick={() => setEstadoF(e)} className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{ height: '36px', backgroundColor: estadoF === e ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6', border: `1px solid ${estadoF === e ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`, color: estadoF === e ? '#fff' : dark ? D.sub : '#6b7280' }}>
              {ESTADO_LABELS[e]}
            </button>
          ))}
        </div>
        {anios.length > 1 && (
          <div className="flex gap-1.5 flex-wrap">
            <button onClick={() => setAnioF('')} className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{ height: '36px', backgroundColor: anioF === '' ? '#2563eb' : dark ? D.btnIdle : '#f3f4f6', border: `1px solid ${anioF === '' ? '#2563eb' : dark ? D.btnBorder : '#e5e7eb'}`, color: anioF === '' ? '#fff' : dark ? D.sub : '#6b7280' }}>
              Todos los años
            </button>
            {anios.map(a => (
              <button key={a} onClick={() => setAnioF(String(a))} className="px-3 rounded-lg text-xs font-bold transition-all"
                style={{ height: '36px', backgroundColor: String(anioF) === String(a) ? '#2563eb' : dark ? D.btnIdle : '#f3f4f6', border: `1px solid ${String(anioF) === String(a) ? '#2563eb' : dark ? D.btnBorder : '#e5e7eb'}`, color: String(anioF) === String(a) ? '#fff' : dark ? D.sub : '#6b7280' }}>
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de campañas */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <CalendarRange size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Sin campañas registradas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Código', 'Cultivo / Variedad', 'Biohuerto', 'Período', 'Área', 'Estado', ''].map((h, i) => (
                    <th key={i} className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide${i === 6 ? ' text-right' : ''}`}
                      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const ec = dark ? ESTADO_COLOR[c.estado]?.dark : ESTADO_COLOR[c.estado]?.light
                  return (
                    <tr key={c.id} className="cursor-pointer transition-all"
                      style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                      onClick={() => navigate(`/campanas/${c.id}`)}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>{c.codigo}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>{c.variedad_str}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          {c.variedad_tipo_ciclo === 'perenne' && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                              style={{
                                backgroundColor: c.fase_ciclo === 'establecimiento'
                                  ? dark ? 'rgba(251,191,36,0.15)' : '#fef9c3'
                                  : dark ? 'rgba(52,211,153,0.15)' : '#d1fae5',
                                color: c.fase_ciclo === 'establecimiento'
                                  ? dark ? '#fbbf24' : '#b45309'
                                  : dark ? '#34d399' : '#065f46',
                              }}>
                              {c.fase_ciclo === 'establecimiento' ? `Est. C${c.numero_ciclo}` : `Prod. C${c.numero_ciclo}`}
                            </span>
                          )}
                          {c.labores_pendientes > 0 && (
                            <span className="text-[10px] font-bold" style={{ color: dark ? '#fbbf24' : '#d97706' }}>
                              {c.labores_pendientes} pendiente{c.labores_pendientes > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                        <div className="flex items-center gap-1.5"><Leaf size={11} /> {c.biohuerto_nombre}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: dark ? D.sub : '#6b7280' }}>
                        <div className="flex items-center gap-1.5"><Calendar size={11} /> {c.fecha_inicio}{c.fecha_fin ? ` → ${c.fecha_fin}` : ''}</div>
                      </td>
                      <td className="px-5 py-3.5 text-xs whitespace-nowrap" style={{ color: dark ? D.sub : '#6b7280' }}>{c.area} {c.unidad_area}</td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: ec?.bg, color: ec?.c }}>{c.estado_display}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={e => { e.stopPropagation(); setEditItem(c); setModal(true) }}
                            className="p-2 rounded-lg transition-all duration-150" style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                            onMouseEnter={ev => ev.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                            onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}><Pencil size={16} /></button>
                          <button onClick={e => { e.stopPropagation(); del(c) }}
                            className="p-2 rounded-lg transition-all duration-150" style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                            onMouseEnter={ev => ev.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                            onMouseLeave={ev => ev.currentTarget.style.backgroundColor = 'transparent'}><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <CampanaModal dark={dark} editItem={editItem}
          onClose={() => { setModal(false); setEditItem(null) }}
          onSaved={() => { setModal(false); setEditItem(null); fetch() }} />
      )}
      {delConfirm && (
        <ConfirmModal dark={dark} message={delConfirm.msg}
          onConfirm={() => { delConfirm.fn(); setDelConfirm(null) }}
          onCancel={() => setDelConfirm(null)} />
      )}
    </div>
  )
}
