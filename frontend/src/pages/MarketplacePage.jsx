import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import {
  Search, SlidersHorizontal, ShoppingBasket, MapPin, CalendarDays,
  Scale, Phone, CheckCircle, Sprout, X, ChevronDown,
  Salad, Apple, Wheat, Leaf, Bean, Package,
} from 'lucide-react'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

/* ── Categorías de filtro sidebar ── */
const CATEGORIAS = [
  { key: '',          label: 'Todas',              Icon: ShoppingBasket },
  { key: 'hortaliza', label: 'Hortalizas',         Icon: Salad          },
  { key: 'fruta',     label: 'Frutas',             Icon: Apple          },
  { key: 'grano',     label: 'Granos y cereales',  Icon: Wheat          },
  { key: 'hierba',    label: 'Hierbas aromáticas', Icon: Leaf           },
  { key: 'legumbre',  label: 'Legumbres',          Icon: Bean           },
  { key: 'otro',      label: 'Otros',              Icon: Package        },
]

const ORDENAR = [
  { value: 'reciente',    label: 'Más reciente'  },
  { value: 'precio_asc',  label: 'Menor precio'  },
  { value: 'precio_desc', label: 'Mayor precio'  },
]

const UNIDAD_STYLE = {
  kg:     { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  unid:   { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe' },
  manojo: { bg: '#fdf4ff', color: '#9333ea', border: '#e9d5ff' },
  caja:   { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  bolsa:  { bg: '#fefce8', color: '#ca8a04', border: '#fef08a' },
}
function unidStyle(unidad = '') {
  const k = Object.keys(UNIDAD_STYLE).find(k => unidad.toLowerCase().includes(k))
  return UNIDAD_STYLE[k] || { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' }
}

/* ── Tarjeta producto ── */
function ProductCard({ c }) {
  const { addItem, items } = useCart()
  const enCarrito = items.some(i => i.id === c.id)
  const us = unidStyle(c.unidad_display)

  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
      style={{ border: '1px solid #f0fdf4' }}>

      {/* Imagen */}
      <div className="relative h-48 bg-gradient-to-br from-emerald-50 to-green-100 overflow-hidden">
        {c.foto_url
          ? <img src={c.foto_url} alt={c.nombre_producto} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Sprout size={44} className="text-emerald-200" />
            </div>
        }
        {/* Badge estado */}
        <span className="absolute top-3 left-3 text-[10px] font-black px-2.5 py-1 rounded-full"
          style={c.estado === 'disponible'
            ? { backgroundColor: '#1B4332', color: '#fff' }
            : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
          {c.estado === 'disponible' ? 'Disponible' : 'Agotado'}
        </span>
        {/* Badge precio */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1 shadow-sm">
          <span className="font-extrabold text-sm" style={{ color: '#1B4332' }}>S/ {c.precio}</span>
          <span className="text-gray-400 text-[10px] ml-1">/ {c.unidad_display}</span>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-black text-[#1B4332] text-base leading-tight">{c.nombre_producto}</h3>
          <p className="flex items-center gap-1 text-xs mt-1" style={{ color: '#9ca3af' }}>
            <MapPin size={10} /> {c.biohuerto_nombre}
          </p>
        </div>

        {/* Atributos */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
            style={{ backgroundColor: us.bg, color: us.color, border: `1px solid ${us.border}` }}>
            <Scale size={10} /> {c.cantidad} {c.unidad_display}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
            <CalendarDays size={10} /> {c.fecha_cosecha}
          </span>
        </div>

        {/* Acciones */}
        {c.estado === 'disponible' ? (
          <div className="mt-auto space-y-2">
            <button
              onClick={() => { addItem(c); toast.success(`${c.nombre_producto} agregado`) }}
              disabled={enCarrito}
              className="w-full font-black text-sm py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              style={enCarrito
                ? { backgroundColor: '#f0fdf4', color: '#16a34a', border: '2px solid #bbf7d0' }
                : { background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', color: '#fff' }}>
              {enCarrito ? <><CheckCircle size={14} /> En el carrito</> : 'Agregar al carrito'}
            </button>
            <a
              href={`https://wa.me/51${c.contacto?.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer"
              className="w-full font-bold text-sm py-2 rounded-xl text-center flex items-center justify-center gap-2 transition-all duration-200"
              style={{ color: '#2D6A4F', border: '1.5px solid #2D6A4F' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f0fdf4'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <Phone size={13} /> Contactar por WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-auto w-full bg-gray-100 text-gray-400 font-black text-sm py-2.5 rounded-xl text-center">
            Producto agotado
          </div>
        )}
      </div>
    </article>
  )
}

/* ── Sidebar de filtros ── */
function Sidebar({ categoria, setCategoria, busqueda, setBusqueda, total, dark }) {
  return (
    <aside className="w-60 flex-shrink-0 hidden sm:block">
      <div className="bg-white rounded-2xl p-5 shadow-sm sticky top-20" style={{ border: '1px solid #f0fdf4' }}>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-sm" style={{ color: '#1B4332' }}>Filtrar</h3>
          {(busqueda || categoria) && (
            <button onClick={() => { setBusqueda(''); setCategoria('') }}
              className="text-xs font-bold transition-colors"
              style={{ color: '#ef4444' }}>
              Limpiar
            </button>
          )}
        </div>

        {/* Búsqueda */}
        <div className="mb-5">
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Producto</p>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Nombre..." value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-xl focus:outline-none focus:ring-2"
              style={{ border: '1.5px solid #e5e7eb', color: '#1B4332', fontSize:'13px' }} />
          </div>
        </div>

        {/* Categorías */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Categoría</p>
          <div className="space-y-0.5">
            {CATEGORIAS.map(({ key, label, Icon }) => {
              const active = categoria === key
              return (
                <button key={key} onClick={() => setCategoria(key)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-[13px] font-semibold transition-all"
                  style={{
                    backgroundColor: active ? '#D8F3DC' : 'transparent',
                    color: active ? '#1B4332' : '#6b7280',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = '#f9fafb' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = 'transparent' }}>
                  <Icon size={13} className="shrink-0" style={{ color: active ? '#2D6A4F' : '#9ca3af' }} />
                  <span className="flex-1">{label}</span>
                  {active && <CheckCircle size={12} style={{ color: '#2D6A4F' }} />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}

/* ══ MARKETPLACE PÚBLICO ══ */
export default function MarketplacePage() {
  const [cosechas, setCosechas]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [busqueda, setBusqueda]   = useState('')
  const [categoria, setCategoria] = useState('')
  const [orden, setOrden]         = useState('reciente')
  const [filtroMovil, setFiltroMovil] = useState(false)

  useEffect(() => {
    axios.get('/api/cosechas/publicas/')
      .then(res => setCosechas(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const productosFiltrados = useMemo(() => {
    let lista = cosechas.filter(c => {
      const matchBusqueda = c.nombre_producto.toLowerCase().includes(busqueda.toLowerCase())
      const matchCat = !categoria || (c.categoria?.toLowerCase().includes(categoria))
      return matchBusqueda && matchCat
    })
    if (orden === 'precio_asc')  lista = [...lista].sort((a, b) => a.precio - b.precio)
    if (orden === 'precio_desc') lista = [...lista].sort((a, b) => b.precio - a.precio)
    return lista
  }, [cosechas, busqueda, categoria, orden])

  return (
    <div style={{ backgroundColor: '#f8faf7', minHeight: '100vh' }}>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-4 py-16"
        style={{ background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)' }}>
        <div className="relative z-10 text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)' }}>
            <Leaf size={13} color="white" />
            <span className="text-white text-xs font-bold tracking-wide">BioHuerto USAT · Lambayeque</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Marketplace de Cosechas</h1>
          <p className="text-white/65 text-base font-semibold max-w-md mx-auto">
            Productos frescos y orgánicos de productores locales
          </p>
        </div>

        {/* Buscador hero */}
        <div className="relative z-10 w-full max-w-xl">
          <div className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden">
            <Search size={16} className="ml-4 shrink-0 text-gray-400" />
            <input type="text" placeholder="Buscar producto... ej: lechuga, tomate"
              value={busqueda} onChange={e => setBusqueda(e.target.value)}
              className="flex-1 px-3 py-4 text-sm font-semibold focus:outline-none bg-transparent"
              style={{ color: '#1B4332' }} />
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="pr-3 text-gray-400 hover:text-gray-600">
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Contenido ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Barra controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-7">
          <p className="text-sm font-semibold" style={{ color: '#6b7280' }}>
            {loading ? 'Cargando...' : (
              <><span className="font-black" style={{ color: '#1B4332' }}>{productosFiltrados.length}</span> cosecha(s) disponible(s)</>
            )}
          </p>
          <div className="flex items-center gap-2">
            {/* Filtro móvil */}
            <button onClick={() => setFiltroMovil(v => !v)}
              className="sm:hidden flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-xl bg-white border border-gray-200"
              style={{ color: '#2D6A4F' }}>
              <SlidersHorizontal size={14} /> Filtros
            </button>
            {/* Orden */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold whitespace-nowrap" style={{ color: '#6b7280' }}>Ordenar:</label>
              <div className="relative">
                <select value={orden} onChange={e => setOrden(e.target.value)}
                  className="appearance-none border border-gray-200 text-sm font-semibold rounded-xl pl-3 pr-8 py-2 bg-white focus:outline-none"
                  style={{ color: '#1B4332' }}>
                  {ORDENAR.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtro móvil expandible */}
        {filtroMovil && (
          <div className="sm:hidden mb-5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex flex-wrap gap-2">
              {CATEGORIAS.map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setCategoria(key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: categoria===key ? '#1B4332' : '#f3f4f6',
                    color: categoria===key ? '#fff' : '#4b5563',
                  }}>
                  <Icon size={11} /> {label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-7">
          {/* Sidebar desktop */}
          <Sidebar categoria={categoria} setCategoria={setCategoria} busqueda={busqueda} setBusqueda={setBusqueda} />

          {/* Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3].map(i => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-emerald-50" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                      <div className="h-3 bg-gray-100 rounded-full w-1/2" />
                      <div className="h-10 bg-gray-100 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: '#f0fdf4' }}>
                  <ShoppingBasket size={36} style={{ color: '#86efac' }} />
                </div>
                <h3 className="font-black text-lg mb-1" style={{ color: '#1B4332' }}>Sin cosechas disponibles</h3>
                <p className="text-sm text-center max-w-xs" style={{ color: '#9ca3af' }}>
                  {busqueda || categoria
                    ? 'No hay productos con esos filtros. Intenta con otra búsqueda.'
                    : 'Los productores actualizarán sus cosechas pronto.'}
                </p>
                {(busqueda || categoria) && (
                  <button onClick={() => { setBusqueda(''); setCategoria('') }}
                    className="mt-3 text-sm font-bold" style={{ color: '#2D6A4F' }}>
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {productosFiltrados.map(c => <ProductCard key={c.id} c={c} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
