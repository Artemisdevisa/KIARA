import { useState, useEffect, useMemo } from 'react'
import axios from 'axios'
import PlantIcon from '../components/icons/PlantIcon'
import HarvestIcon from '../components/icons/HarvestIcon'

/* Patrón de hojas reutilizable */
function LeafPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mp-leaves" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
          <path d="M18 45 C18 28 35 18 42 26 C50 34 40 52 18 45Z" fill="white" opacity="0.05" transform="rotate(15 30 35)"/>
          <path d="M65 80 C65 63 82 53 89 61 C97 69 87 87 65 80Z" fill="white" opacity="0.03" transform="rotate(-20 77 67)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mp-leaves)"/>
    </svg>
  )
}

/* Icono de búsqueda */
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="2"/>
      <path d="M13 13L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

/* Icono de filtro */
function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 4H16M4 9H14M7 14H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

/* Estado vacío */
function EmptyMarketplace() {
  return (
    <div className="flex flex-col items-center justify-center py-20 col-span-3">
      <div className="w-24 h-24 bg-bio-pale rounded-full flex items-center justify-center mb-5">
        <HarvestIcon size={44} className="text-bio-light" />
      </div>
      <h3 className="font-black text-bio-dark text-xl mb-2">Sin cosechas disponibles</h3>
      <p className="text-bio-muted text-sm text-center max-w-xs">
        No hay productos disponibles con ese filtro ahora mismo. Vuelve pronto, los
        productores actualizan su oferta regularmente.
      </p>
    </div>
  )
}

const ORDENAR = [
  { value: 'reciente', label: 'Más reciente' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
]

export default function MarketplacePage() {
  const [cosechas, setCosechas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState('reciente')
  const [filtroMostrado, setFiltroMostrado] = useState(false)

  /* Carga inicial — datos reales del backend */
  useEffect(() => {
    axios.get('/api/cosechas/publicas/')
      .then(res => setCosechas(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  /* Filtro + orden en cliente */
  const productosFiltrados = useMemo(() => {
    let lista = cosechas.filter(c =>
      c.nombre_producto.toLowerCase().includes(busqueda.toLowerCase())
    )
    if (orden === 'precio_asc') lista = [...lista].sort((a, b) => a.precio - b.precio)
    if (orden === 'precio_desc') lista = [...lista].sort((a, b) => b.precio - a.precio)
    return lista
  }, [cosechas, busqueda, orden])

  const handleBusqueda = e => {
    e.preventDefault()
  }

  return (
    <div className="bg-bio-cream min-h-screen">

      {/* ── HERO INTERNO ── */}
      <section
        className="relative h-[300px] md:h-[340px] flex flex-col items-center justify-center overflow-hidden px-4"
        style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <LeafPattern />
        <div className="relative z-10 text-center mb-7">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Marketplace de Cosechas
          </h1>
          <p className="text-white/65 text-base md:text-lg font-semibold">
            Productos frescos y orgánicos de productores locales de Lambayeque
          </p>
        </div>

        {/* Barra de búsqueda */}
        <form
          onSubmit={handleBusqueda}
          className="relative z-10 w-full max-w-xl"
        >
          <div className="flex items-center bg-white rounded-2xl shadow-lg overflow-hidden">
            <span className="pl-4 text-bio-muted flex-shrink-0">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Buscar producto... ej: lechuga, tomate"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="flex-1 px-4 py-4 text-sm font-semibold text-bio-ink placeholder-bio-muted/60 focus:outline-none bg-transparent"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="pr-4 text-bio-muted hover:text-bio-dark text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        </form>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Barra de controles */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            {loading ? (
              <p className="text-bio-muted text-sm font-semibold">Cargando...</p>
            ) : (
              <p className="text-bio-muted text-sm font-semibold">
                <span className="text-bio-dark font-black">{productosFiltrados.length}</span> cosecha(s) disponible(s)
                {busqueda && <span className="ml-1">para "<span className="text-bio-main">{busqueda}</span>"</span>}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFiltroMostrado(v => !v)}
              className="flex items-center gap-2 text-bio-muted hover:text-bio-dark text-sm font-bold border border-gray-200 px-3 py-2 rounded-xl bg-white transition-colors sm:hidden"
            >
              <FilterIcon /> Filtros
            </button>
            <div className="flex items-center gap-2">
              <label className="text-bio-muted text-sm font-semibold whitespace-nowrap">Ordenar:</label>
              <select
                value={orden}
                onChange={e => setOrden(e.target.value)}
                className="border border-gray-200 text-sm font-semibold text-bio-dark rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-bio-light"
              >
                {ORDENAR.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* ── Sidebar filtros (desktop) ── */}
          <aside className={`${filtroMostrado ? 'block' : 'hidden'} sm:block w-full sm:w-60 flex-shrink-0`}>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-bio-dark text-sm">Filtrar por</h3>
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="text-xs text-bio-muted hover:text-red-500 font-bold transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              {/* Búsqueda rápida sidebar */}
              <div className="mb-5">
                <p className="text-xs font-black text-bio-muted uppercase tracking-widest mb-2">Producto</p>
                <input
                  type="text"
                  placeholder="Nombre del producto..."
                  value={busqueda}
                  onChange={e => setBusqueda(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-bio-ink placeholder-bio-muted/50 focus:outline-none focus:ring-2 focus:ring-bio-light"
                />
              </div>
              {/* Categorías */}
              <div>
                <p className="text-xs font-black text-bio-muted uppercase tracking-widest mb-3">Categoría</p>
                {['Hortalizas', 'Hierbas aromáticas', 'Frutas', 'Otros'].map(cat => (
                  <label key={cat} className="flex items-center gap-2.5 mb-2 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded accent-bio-main" />
                    <span className="text-sm font-semibold text-bio-muted group-hover:text-bio-dark transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Grid de productos ── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                    <div className="h-48 bg-bio-pale" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-bio-pale rounded-full w-3/4" />
                      <div className="h-3 bg-bio-pale rounded-full w-1/2" />
                      <div className="h-6 bg-bio-pale rounded-full w-1/3" />
                      <div className="h-10 bg-bio-pale rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : productosFiltrados.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <EmptyMarketplace />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {productosFiltrados.map(c => (
                  <div
                    key={c.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Imagen */}
                    <div className="h-48 bg-gradient-to-br from-bio-main/10 to-bio-pale flex items-center justify-center relative overflow-hidden">
                      {c.foto_url ? (
                        <img
                          src={c.foto_url}
                          alt={c.nombre_producto}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <HarvestIcon size={52} className="text-bio-main/25" />
                      )}
                      <span className={`absolute top-3 right-3 text-xs font-black px-3 py-1 rounded-full ${
                        c.estado === 'disponible'
                          ? 'bg-bio-main text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {c.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-black text-bio-dark text-lg leading-tight mb-1">
                        {c.nombre_producto}
                      </h3>
                      <p className="text-bio-muted text-sm font-semibold flex items-center gap-1.5 mb-3">
                        <PlantIcon size={13} className="text-bio-light flex-shrink-0" />
                        <span className="truncate">{c.biohuerto_nombre}</span>
                      </p>
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="text-2xl font-black text-bio-main">S/ {c.precio}</span>
                      </div>
                      <p className="text-bio-muted text-xs font-semibold mb-1">
                        {c.cantidad} {c.unidad_display} disponible(s)
                      </p>
                      <p className="text-bio-muted text-xs mb-4">
                        Cosecha: {c.fecha_cosecha}
                      </p>

                      {c.estado === 'disponible' ? (
                        <a
                          href={`https://wa.me/51${c.contacto.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full bg-bio-main text-white font-black text-sm py-3 rounded-xl text-center hover:bg-bio-dark transition-all duration-200"
                        >
                          Contactar por WhatsApp
                        </a>
                      ) : (
                        <div className="w-full bg-gray-100 text-gray-400 font-black text-sm py-3 rounded-xl text-center cursor-not-allowed">
                          Producto agotado
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
