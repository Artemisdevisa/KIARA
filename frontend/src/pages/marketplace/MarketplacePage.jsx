import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import {
  Search, Leaf, Phone, ShoppingBasket, Sprout,
  MapPin, CalendarDays, Scale, X,
  Wheat, Apple, Salad, Bean, ChevronRight,
} from 'lucide-react'

/* ── Categorías de filtro ── */
const CATEGORIAS = [
  { key: '',          label: 'Todos',      Icon: ShoppingBasket },
  { key: 'hortaliza', label: 'Hortalizas', Icon: Salad          },
  { key: 'fruta',     label: 'Frutas',     Icon: Apple          },
  { key: 'grano',     label: 'Granos',     Icon: Wheat          },
  { key: 'hierba',    label: 'Hierbas',    Icon: Leaf           },
  { key: 'legumbre',  label: 'Legumbres',  Icon: Bean           },
]

/* ── Colores por unidad ── */
const UNIDAD_COLOR = {
  kg:    { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
  unid:  { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  manojo:{ bg: '#fdf4ff', text: '#9333ea', border: '#e9d5ff' },
  caja:  { bg: '#fff7ed', text: '#ea580c', border: '#fed7aa' },
  bolsa: { bg: '#fefce8', text: '#ca8a04', border: '#fef08a' },
}

function unidadStyle(unidad) {
  const k = Object.keys(UNIDAD_COLOR).find(k => unidad?.toLowerCase().includes(k))
  return UNIDAD_COLOR[k] || { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' }
}

/* ── Tarjeta de producto ── */
function ProductCard({ c }) {
  const us = unidadStyle(c.unidad_display)
  return (
    <Link to={`/marketplace/${c.id}`}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col group hover:-translate-y-1">
      {/* Imagen */}
      <div className="relative overflow-hidden h-48 bg-gradient-to-br from-emerald-50 to-green-100">
        {c.foto_url ? (
          <img src={c.foto_url} alt={c.nombre_producto}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Sprout size={40} className="text-emerald-300" />
            <span className="text-xs text-emerald-400 font-medium">Sin imagen</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-2.5 py-1 shadow-sm">
          <span className="text-emerald-700 font-extrabold text-sm">S/ {c.precio}</span>
          <span className="text-gray-400 text-[10px] ml-1">/ {c.unidad_display}</span>
        </div>
        {c.campana_nombre && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ background: 'rgba(22,101,52,0.85)', backdropFilter: 'blur(6px)' }}>
            🌿 Trazable
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-extrabold text-gray-800 text-base leading-tight">{c.nombre_producto}</h3>
          <p className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin size={10} /> {c.biohuerto_nombre}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg"
            style={{ backgroundColor: us.bg, color: us.text, border: `1px solid ${us.border}` }}>
            <Scale size={10} /> {c.cantidad} {c.unidad_display}
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg bg-gray-50 text-gray-500 border border-gray-100">
            <CalendarDays size={10} /> {c.fecha_cosecha}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-50">
          <span className="text-xs text-emerald-600 font-bold">Ver detalle</span>
          <ChevronRight size={14} className="text-emerald-500" />
        </div>
      </div>
    </Link>
  )
}

/* ══ MARKETPLACE ══ */
export default function MarketplacePage() {
  const [cosechas, setCosechas]     = useState([])
  const [busqueda, setBusqueda]     = useState('')
  const [categoria, setCategoria]   = useState('')
  const [loading, setLoading]       = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const inputRef = useRef()

  const buscar = (texto = busqueda, cat = categoria) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (texto) params.set('producto', texto)
    if (cat)   params.set('categoria', cat)
    api.get(`/cosechas/publicas/?${params}`)
      .then(r => setCosechas(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { buscar('', '') }, [])

  const handleSubmit = e => { e.preventDefault(); buscar() }

  const handleCategoria = cat => {
    setCategoria(cat)
    buscar(busqueda, cat)
  }

  const limpiar = () => {
    setBusqueda(''); setCategoria('')
    buscar('', '')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8faf7' }}>

      {/* ── Hero header ── */}
      <header style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 60%, #15803d 100%)' }}>
        <div className="max-w-5xl mx-auto px-5 py-10">
          {/* Marca */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <Leaf size={22} color="white" />
            </div>
            <div>
              <h1 className="text-white font-extrabold text-2xl leading-tight tracking-tight">
                Marketplace
              </h1>
              <p className="text-emerald-300 text-xs font-medium">BioHuerto USAT · Lambayeque</p>
            </div>
          </div>
          <p className="text-white/65 text-sm mt-3 mb-6 max-w-lg">
            Cosechas frescas y orgánicas directamente de productores locales.
          </p>

          {/* Buscador */}
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-xl">
            <div className="flex-1 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar producto… ej: lechuga, tomate"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              {busqueda && (
                <button type="button" onClick={limpiar}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <button type="submit"
              className="bg-white text-emerald-700 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-emerald-50 transition-colors flex items-center gap-2 shrink-0">
              <Search size={15} /> Buscar
            </button>
          </form>
        </div>
      </header>

      {/* ── Filtros de categoría ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex items-center gap-1 overflow-x-auto py-3 no-scrollbar">
            {CATEGORIAS.map(({ key, label, Icon }) => {
              const active = categoria === key
              return (
                <button key={key} onClick={() => handleCategoria(key)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all duration-150"
                  style={{
                    backgroundColor: active ? '#16a34a' : '#f3f4f6',
                    color: active ? '#fff' : '#4b5563',
                    border: active ? '1.5px solid #16a34a' : '1.5px solid transparent',
                  }}>
                  <Icon size={12} />
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <main className="max-w-5xl mx-auto px-5 py-8">

        {/* Contador */}
        {!loading && cosechas.length > 0 && (
          <p className="text-xs text-gray-400 mb-5 font-medium">
            {cosechas.length} producto{cosechas.length !== 1 ? 's' : ''} disponible{cosechas.length !== 1 ? 's' : ''}
            {busqueda && <span> · búsqueda: <strong className="text-gray-600">"{busqueda}"</strong></span>}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-9 h-9 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-sm text-gray-400">Cargando cosechas disponibles…</p>
          </div>

        ) : cosechas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <ShoppingBasket size={32} className="text-emerald-300" />
            </div>
            <p className="font-bold text-gray-600 text-lg">Sin productos disponibles</p>
            <p className="text-sm text-gray-400 text-center max-w-xs">
              {busqueda || categoria
                ? 'No encontramos cosechas con esos filtros. Intenta con otra búsqueda.'
                : 'Los productores actualizarán sus cosechas pronto. ¡Vuelve en breve!'}
            </p>
            {(busqueda || categoria) && (
              <button onClick={limpiar}
                className="mt-1 text-sm text-emerald-600 font-semibold hover:underline">
                Limpiar filtros
              </button>
            )}
          </div>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cosechas.map(c => <ProductCard key={c.id} c={c} />)}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="py-8 text-center border-t border-gray-100 mt-8">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Leaf size={14} className="text-emerald-500" />
          <span className="text-sm font-bold text-gray-500">BioHuerto USAT</span>
        </div>
        <p className="text-xs text-gray-400">Gestión Agroecológica Urbana · Chiclayo, Lambayeque</p>
      </footer>
    </div>
  )
}
