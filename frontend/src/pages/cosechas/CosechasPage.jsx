import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { ShoppingBasket, Plus, Search, Trash2, X, Package, CalendarDays, Phone, Coins, MessageCircle, Minus } from 'lucide-react'

const ESTADO_FILTERS = [
  { value: '',           label: 'Todos'     },
  { value: 'disponible', label: 'Disponible'},
  { value: 'agotado',    label: 'Agotado'   },
]

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
          <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>¿Eliminar publicación?</h3>
          <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>
            Se eliminará <strong>{item?.nombre_producto}</strong> permanentemente.
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

function VentaModal({ dark, item, onClose, onConfirm, loading }) {
  const [cantidad, setCantidad] = useState('')
  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  const ist = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    borderRadius: '10px', padding: '9px 13px', fontSize: '15px',
    outline: 'none', width: '100%',
  }
  const disponible = item ? parseFloat(item.cantidad_disponible ?? item.cantidad) : 0

  const handleSubmit = e => {
    e.preventDefault()
    const val = parseFloat(cantidad)
    if (!val || val <= 0) { toast.error('Ingresa una cantidad válida.'); return }
    if (val > disponible) { toast.error(`Solo quedan ${disponible} ${item.unidad_display} disponibles.`); return }
    onConfirm(val)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <button onClick={onClose} className="absolute top-4 right-4" style={{ color: D.sub }}>
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(52,211,153,0.12)' : '#d1fae5' }}>
            <MessageCircle size={18} style={{ color: dark ? '#34d399' : '#059669' }} />
          </div>
          <div>
            <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>Registrar venta</h3>
            <p className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>{item?.nombre_producto}</p>
          </div>
        </div>

        {/* Stock info */}
        <div className="rounded-xl p-3 mb-4 flex items-center justify-between"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? D.divider : '#e5e7eb'}` }}>
          <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>Stock disponible</span>
          <span className="text-sm font-bold" style={{ color: dark ? D.text : '#111827' }}>
            {disponible} {item?.unidad_display}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1.5" style={{ color: dark ? D.sub : '#6b7280' }}>
              Unidades vendidas ({item?.unidad_display})
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              max={disponible}
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder={`Máx. ${disponible}`}
              style={ist}
              autoFocus
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
              {loading ? 'Registrando...' : 'Registrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CosechasPage() {
  const { dark } = useTheme()
  const [cosechas, setCosechas]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [deleteItem, setDeleteItem]   = useState(null)
  const [delLoading, setDelLoading]   = useState(false)
  const [ventaItem, setVentaItem]     = useState(null)
  const [ventaLoading, setVentaLoading] = useState(false)

  const fetchCosechas = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/cosechas/')
      setCosechas(res.data)
    } catch { toast.error('Error al cargar cosechas.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchCosechas() }, [fetchCosechas])

  const handleAgotar = async (c) => {
    try {
      await api.post(`/cosechas/${c.id}/agotar/`)
      toast.success('Cosecha marcada como agotada.')
      fetchCosechas()
    } catch { toast.error('No se pudo cambiar el estado.') }
  }

  const handleVender = async (cantidad) => {
    setVentaLoading(true)
    try {
      await api.post(`/cosechas/${ventaItem.id}/vender/`, { cantidad })
      toast.success('Venta registrada correctamente.')
      setVentaItem(null)
      fetchCosechas()
    } catch (err) {
      const msg = err.response?.data?.detail || 'No se pudo registrar la venta.'
      toast.error(msg)
    } finally { setVentaLoading(false) }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await api.delete(`/cosechas/${deleteItem.id}/`)
      toast.success('Publicación eliminada.')
      setDeleteItem(null)
      fetchCosechas()
    } catch { toast.error('No se pudo eliminar.') }
    finally { setDelLoading(false) }
  }

  const filtered = cosechas.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      c.nombre_producto?.toLowerCase().includes(q) ||
      c.contacto?.toLowerCase().includes(q)
    const matchEstado = !estadoFilter || c.estado === estadoFilter
    return matchSearch && matchEstado
  })

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <ShoppingBasket size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Cosechas</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {filtered.length} publicación{filtered.length !== 1 ? 'es' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <Link
          to="/cosechas/nueva"
          className="flex items-center gap-2 btn-primary text-sm"
        >
          <Plus size={15} />
          Publicar cosecha
        </Link>
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
            placeholder="Buscar cosecha..."
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
            <button key={f.value} onClick={() => setEstadoFilter(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: estadoFilter === f.value ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${estadoFilter === f.value ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: estadoFilter === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
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
            <ShoppingBasket size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron cosechas publicadas</p>
            <Link to="/cosechas/nueva" className="btn-primary text-xs mt-1">Publicar cosecha</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Producto', 'Stock', 'Precio', 'Fecha cosecha', 'Contacto', 'Estado', ''].map((h, i) => (
                    <th key={i}
                      className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide
                        ${i === 2 ? 'hidden md:table-cell' : ''}
                        ${i === 3 ? 'hidden lg:table-cell' : ''}
                        ${i === 4 ? 'hidden xl:table-cell' : ''}
                        ${i === 6 ? 'text-right' : ''}`}
                      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => {
                  const disponible = parseFloat(c.cantidad_disponible ?? c.cantidad)
                  const vendido    = parseFloat(c.cantidad_vendida ?? 0)
                  const total      = parseFloat(c.cantidad)
                  const pct        = total > 0 ? Math.round((vendido / total) * 100) : 0

                  return (
                    <tr key={c.id}
                      style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                      {/* Producto */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {c.foto_url ? (
                            <img src={c.foto_url} alt={c.nombre_producto}
                              className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f0fdf4' }}>
                              <ShoppingBasket size={16} style={{ color: dark ? D.sub : '#16a34a' }} />
                            </div>
                          )}
                          <p className="font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>
                            {c.nombre_producto}
                          </p>
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1 min-w-[90px]">
                          <div className="flex items-center gap-1.5">
                            <Package size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                            <span className="text-xs font-bold" style={{ color: dark ? D.text : '#111827' }}>
                              {disponible} <span className="font-normal" style={{ color: dark ? D.sub : '#6b7280' }}>{c.unidad_display}</span>
                            </span>
                          </div>
                          {vendido > 0 && (
                            <div className="flex items-center gap-1.5">
                              <Minus size={10} style={{ color: dark ? 'rgba(251,191,36,0.7)' : '#d97706' }} />
                              <span className="text-xs" style={{ color: dark ? 'rgba(251,191,36,0.7)' : '#d97706' }}>
                                {vendido} vendido{vendido !== 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                          {vendido > 0 && (
                            <div className="w-full rounded-full overflow-hidden" style={{ height: '3px', backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }}>
                              <div style={{ width: `${pct}%`, height: '100%', backgroundColor: pct >= 100 ? '#f87171' : '#16a34a', borderRadius: '99px' }} />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Precio */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Coins size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                          <span className="text-xs font-medium" style={{ color: dark ? D.text : '#374151' }}>
                            S/ {c.precio}
                          </span>
                        </div>
                      </td>

                      {/* Fecha cosecha */}
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <CalendarDays size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                          <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                            {c.fecha_cosecha}
                          </span>
                        </div>
                      </td>

                      {/* Contacto */}
                      <td className="px-5 py-3.5 hidden xl:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                          <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                            {c.contacto}
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                          style={c.estado === 'disponible'
                            ? { backgroundColor: dark ? 'rgba(22,163,74,0.18)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }
                            : { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: dark ? D.sub : '#9ca3af' }
                          }>
                          {c.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          {c.estado === 'disponible' && (
                            <>
                              <button
                                onClick={() => setVentaItem(c)}
                                title="Registrar venta"
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                                style={{ color: dark ? '#34d399' : '#059669', backgroundColor: dark ? 'rgba(52,211,153,0.10)' : '#d1fae5', border: `1px solid ${dark ? 'rgba(52,211,153,0.20)' : '#a7f3d0'}` }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(52,211,153,0.18)' : '#a7f3d0' }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(52,211,153,0.10)' : '#d1fae5' }}
                              >
                                <MessageCircle size={12} />
                                Registrar venta
                              </button>
                              <button
                                onClick={() => handleAgotar(c)}
                                title="Marcar como agotado"
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150"
                                style={{ color: dark ? D.sub : '#6b7280', backgroundColor: dark ? D.btnIdle : '#f3f4f6', border: `1px solid ${dark ? D.btnBorder : '#e5e7eb'}` }}
                                onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.12)' : '#e5e7eb' }}
                                onMouseLeave={e => { e.currentTarget.style.backgroundColor = dark ? D.btnIdle : '#f3f4f6' }}
                              >
                                Agotar
                              </button>
                            </>
                          )}
                          <button onClick={() => setDeleteItem(c)}
                            className="p-2 rounded-lg transition-all duration-150"
                            style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2' }}
                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                          ><Trash2 size={16} /></button>
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

      {deleteItem && (
        <ConfirmModal
          dark={dark}
          item={deleteItem}
          loading={delLoading}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}

      {ventaItem && (
        <VentaModal
          dark={dark}
          item={ventaItem}
          loading={ventaLoading}
          onClose={() => setVentaItem(null)}
          onConfirm={handleVender}
        />
      )}
    </div>
  )
}
