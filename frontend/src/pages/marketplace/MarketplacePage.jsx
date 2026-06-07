import { useState, useEffect } from 'react'
import axios from 'axios'
import { ShoppingBasket, Search, Leaf, Phone } from 'lucide-react'

export default function MarketplacePage() {
  const [cosechas, setCosechas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  const buscar = (texto = busqueda) => {
    const params = texto ? `?producto=${encodeURIComponent(texto)}` : ''
    setLoading(true)
    axios.get(`/api/cosechas/publicas/${params}`)
      .then(res => setCosechas(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { buscar('') }, [])

  const handleBuscar = e => {
    e.preventDefault()
    buscar()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-emerald-50">
      {/* Header */}
      <header className="bg-primary-700 text-white py-6 px-4 shadow">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Leaf size={28} />
            <h1 className="text-2xl font-bold">BioHuerto USAT — Marketplace</h1>
          </div>
          <p className="text-primary-200 text-sm mb-4">Cosechas frescas y orgánicas de productores locales de Lambayeque</p>

          <form onSubmit={handleBuscar} className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar producto... (ej: tomate, lechuga)"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <button type="submit" className="bg-white text-primary-700 font-medium px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-primary-50 transition-colors">
              <Search size={16} /> Buscar
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3" />
            Cargando cosechas disponibles...
          </div>
        ) : cosechas.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <ShoppingBasket size={48} className="mx-auto mb-3 text-gray-200" />
            <p className="text-lg">Sin cosechas disponibles en este momento</p>
            <p className="text-sm mt-1">Vuelve pronto — los productores actualizan regularmente</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{cosechas.length} cosecha(s) disponible(s)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {cosechas.map(c => (
                <div key={c.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {c.foto_url ? (
                    <img src={c.foto_url} alt={c.nombre_producto} className="w-full h-44 object-cover" />
                  ) : (
                    <div className="w-full h-44 bg-primary-50 flex items-center justify-center">
                      <ShoppingBasket size={40} className="text-primary-200" />
                    </div>
                  )}

                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 text-lg mb-1">{c.nombre_producto}</h3>
                    <p className="text-xs text-gray-400 mb-3">{c.biohuerto_nombre}</p>

                    <div className="space-y-1 text-sm text-gray-600 mb-4">
                      <p>🌾 {c.cantidad} {c.unidad_display}</p>
                      <p className="text-primary-700 font-bold text-base">S/ {c.precio} / {c.unidad_display}</p>
                      <p>📅 Cosecha: {c.fecha_cosecha}</p>
                    </div>

                    <a
                      href={`https://wa.me/${c.contacto.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors w-full"
                    >
                      <Phone size={15} /> Contactar: {c.contacto}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <footer className="text-center py-6 text-xs text-gray-400">
        BioHuerto USAT — Gestión Agroecológica Urbana · Chiclayo, Lambayeque
      </footer>
    </div>
  )
}
