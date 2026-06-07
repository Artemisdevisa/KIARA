import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Sprout, Plus, Search, Pencil, Trash2, X, Calendar, Power } from 'lucide-react'

const ESTADO_FILTERS = [
  { value: '',          label: 'Todos'      },
  { value: 'activo',    label: 'Activo'     },
  { value: 'cosechado', label: 'Cosechado'  },
  { value: 'perdido',   label: 'Perdido'    },
]

const ETAPA_OPTS = [
  { value: 'germinacion', label: 'Germinación' },
  { value: 'crecimiento', label: 'Crecimiento' },
  { value: 'floracion',   label: 'Floración'   },
  { value: 'cosecha',     label: 'Cosecha'     },
]

const ETAPA_BADGE = {
  germinacion: { bg: '#fef9c3', color: '#a16207' },
  crecimiento: { bg: '#dbeafe', color: '#1d4ed8' },
  floracion:   { bg: '#f3e8ff', color: '#7e22ce' },
  cosecha:     { bg: '#dcfce7', color: '#15803d' },
}
const ETAPA_BADGE_DARK = {
  germinacion: { bg: 'rgba(234,179,8,0.18)',   color: '#fde047' },
  crecimiento: { bg: 'rgba(59,130,246,0.18)',  color: '#60a5fa' },
  floracion:   { bg: 'rgba(168,85,247,0.18)',  color: '#c084fc' },
  cosecha:     { bg: 'rgba(22,163,74,0.18)',   color: '#4ade80' },
}

const EMPTY_FORM = {
  biohuerto: '', nombre: '', fecha_siembra: '', etapa: 'germinacion',
  cantidad: '', unidad: 'm²', fecha_estimada_cosecha: '', notas: '', estado: 'activo',
}

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  divider:     'rgba(255,255,255,0.07)',
  hoverRow:    'rgba(255,255,255,0.04)',
  btnIdle:     'rgba(255,255,255,0.07)',
  btnBorder:   'rgba(255,255,255,0.10)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

/* ── Modal crear/editar ── */
function CultivoModal({ dark, onClose, onSaved, editItem }) {
  const [form, setForm]           = useState(editItem ? { ...editItem } : EMPTY_FORM)
  const [loading, setLoading]     = useState(false)
  const [biohuertos, setBiohuertos] = useState([])

  useEffect(() => {
    api.get('/biohuertos/').then(r => setBiohuertos(r.data)).catch(() => {})
  }, [])

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editItem) {
        await api.patch(`/cultivos/${editItem.id}/`, form)
        toast.success('Cultivo actualizado.')
      } else {
        await api.post('/cultivos/', form)
        toast.success('Cultivo registrado.')
      }
      onSaved()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') Object.values(msg).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al guardar.')
    } finally { setLoading(false) }
  }

  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  const inputStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px',
    color: dark ? D.sub : '#6b7280',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            {editItem ? 'Editar cultivo' : 'Registrar cultivo'}
          </h2>
          <button onClick={onClose} style={{ color: D.sub, padding: '4px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label style={labelStyle}>Biohuerto</label>
            <select name="biohuerto" value={form.biohuerto} onChange={handle} style={inputStyle} required>
              <option value="">Selecciona un biohuerto</option>
              {biohuertos.map(b => (
                <option key={b.id} value={b.id}>{b.nombre}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Nombre del cultivo</label>
              <input name="nombre" value={form.nombre} onChange={handle} style={inputStyle} placeholder="Tomate cherry" required />
            </div>
            <div>
              <label style={labelStyle}>Etapa</label>
              <select name="etapa" value={form.etapa} onChange={handle} style={inputStyle}>
                {ETAPA_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Cantidad</label>
              <input name="cantidad" type="number" step="0.01" min="0" value={form.cantidad} onChange={handle} style={inputStyle} placeholder="50.00" required />
            </div>
            <div>
              <label style={labelStyle}>Unidad</label>
              <input name="unidad" value={form.unidad} onChange={handle} style={inputStyle} placeholder="m²" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Fecha de siembra</label>
              <input name="fecha_siembra" type="date" value={form.fecha_siembra} onChange={handle} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Cosecha estimada</label>
              <input name="fecha_estimada_cosecha" type="date" value={form.fecha_estimada_cosecha} onChange={handle} style={inputStyle} required />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notas</label>
            <textarea name="notas" value={form.notas} onChange={handle} rows={2}
              style={{ ...inputStyle, resize: 'none' }} placeholder="Observaciones adicionales..." />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
              {loading ? 'Guardando...' : editItem ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Modal confirmar eliminar ── */
function ConfirmModal({ dark, item, onClose, onConfirm, loading }) {
  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>¿Eliminar cultivo?</h3>
          <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>
            Se eliminará <strong>{item?.nombre}</strong> permanentemente.
          </p>
          <div className="flex gap-3 w-full pt-1">
            <button onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 btn-danger text-sm">
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Página principal ── */
export default function CultivosPage() {
  const { dark } = useTheme()
  const [cultivos, setCultivos]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [modalOpen, setModalOpen]     = useState(false)
  const [editItem, setEditItem]       = useState(null)
  const [deleteItem, setDeleteItem]   = useState(null)
  const [delLoading, setDelLoading]   = useState(false)

  const fetchCultivos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/cultivos/')
      setCultivos(res.data)
    } catch { toast.error('No se pudo cargar los cultivos.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCultivos() }, [fetchCultivos])

  const ESTADO_CICLO = { activo: 'cosechado', cosechado: 'perdido', perdido: 'activo' }

  const handleToggleEstado = async (c) => {
    const siguiente = ESTADO_CICLO[c.estado]
    try {
      await api.patch(`/cultivos/${c.id}/`, { estado: siguiente })
      toast.success(`Estado cambiado a ${siguiente}.`)
      fetchCultivos()
    } catch { toast.error('No se pudo cambiar el estado.') }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await api.delete(`/cultivos/${deleteItem.id}/`)
      toast.success('Cultivo eliminado.')
      setDeleteItem(null)
      fetchCultivos()
    } catch { toast.error('No se pudo eliminar.') }
    finally { setDelLoading(false) }
  }

  const filtered = cultivos.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(q) ||
      c.biohuerto_nombre?.toLowerCase().includes(q)
    const matchEstado = !estadoFilter || c.estado === estadoFilter
    return matchSearch && matchEstado
  })

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  const etapaBadge = dark ? ETAPA_BADGE_DARK : ETAPA_BADGE

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <Sprout size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Cultivos</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {filtered.length} cultivo{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true) }}
          className="flex items-center gap-2 btn-primary text-sm"
        >
          <Plus size={15} />
          Nuevo cultivo
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cultivo..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px',
              fontSize: '13px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151',
              height: '36px',
            }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ESTADO_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setEstadoFilter(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: estadoFilter === f.value ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${estadoFilter === f.value ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: estadoFilter === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Sprout size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron cultivos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Cultivo', 'Biohuerto', 'Etapa', 'Cantidad', 'Siembra', 'Cosecha est.', 'Estado', ''].map((h, i) => (
                    <th key={i}
                      className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide
                        ${i === 1 ? 'hidden md:table-cell' : ''}
                        ${i === 3 ? 'hidden sm:table-cell' : ''}
                        ${i === 4 ? 'hidden lg:table-cell' : ''}
                        ${i === 5 ? 'hidden lg:table-cell' : ''}
                        ${i === 7 ? 'text-right' : ''}`}
                      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr
                    key={c.id}
                    style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>
                        {c.nombre}
                      </p>
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                      {c.biohuerto_nombre}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                        style={{ backgroundColor: etapaBadge[c.etapa]?.bg, color: etapaBadge[c.etapa]?.color }}>
                        {c.etapa_display}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 hidden sm:table-cell text-xs" style={{ color: dark ? D.text : '#374151' }}>
                      {c.cantidad} {c.unidad}
                    </td>

                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                        <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{c.fecha_siembra}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                        <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{c.fecha_estimada_cosecha}</span>
                        {c.dias_para_cosecha !== null && c.estado === 'activo' && (
                          <span className="text-xs font-semibold" style={{ color: c.dias_para_cosecha <= 7 ? '#f97316' : dark ? D.sub : '#9ca3af' }}>
                            ({c.dias_para_cosecha >= 0 ? `${c.dias_para_cosecha}d` : `-${Math.abs(c.dias_para_cosecha)}d`})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize"
                        style={
                          c.estado === 'activo'    ? { backgroundColor: dark ? 'rgba(22,163,74,0.18)'  : '#dcfce7', color: dark ? '#4ade80' : '#15803d' } :
                          c.estado === 'cosechado' ? { backgroundColor: dark ? 'rgba(59,130,246,0.18)' : '#dbeafe', color: dark ? '#60a5fa' : '#1d4ed8' } :
                                                     { backgroundColor: dark ? 'rgba(239,68,68,0.18)'  : '#fee2e2', color: dark ? '#f87171' : '#dc2626' }
                        }>
                        {c.estado_display}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditItem(c); setModalOpen(true) }}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Pencil size={16} /></button>
                        <button
                          onClick={() => handleToggleEstado(c)}
                          className="p-2 rounded-lg transition-all duration-150"
                          title={`Estado: ${c.estado} → ${ESTADO_CICLO[c.estado]}`}
                          style={{
                            color: c.estado === 'activo' ? (dark ? '#4ade80' : '#16a34a') : c.estado === 'cosechado' ? (dark ? '#60a5fa' : '#2563eb') : (dark ? '#f87171' : '#dc2626'),
                            backgroundColor: 'transparent',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Power size={16} /></button>
                        <button
                          onClick={() => setDeleteItem(c)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <CultivoModal
          dark={dark}
          editItem={editItem}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
          onSaved={() => { setModalOpen(false); setEditItem(null); fetchCultivos() }}
        />
      )}
      {deleteItem && (
        <ConfirmModal
          dark={dark}
          item={deleteItem}
          loading={delLoading}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
