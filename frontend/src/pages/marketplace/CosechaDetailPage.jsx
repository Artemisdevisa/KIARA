import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'
import {
  ArrowLeft, MapPin, CalendarDays, Scale, Leaf,
  Sprout, CheckCircle2, Wrench, ShieldCheck, ShoppingCart,
} from 'lucide-react'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80'

export default function CosechaDetailPage() {
  const { id }    = useParams()
  const { addItem, items } = useCart()
  const [cosecha,  setCosecha]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    api.get(`/cosechas/publicas/${id}/`)
      .then(r => setCosecha(r.data))
      .catch(err => { if (err?.response?.status === 404) setNotFound(true) })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8faf7' }}>
      <div className="w-9 h-9 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  )

  if (notFound || !cosecha) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: '#f8faf7' }}>
      <Sprout size={48} className="text-emerald-300" />
      <p className="font-bold text-gray-500">Esta cosecha no está disponible.</p>
      <Link to="/marketplace" className="text-sm font-bold text-emerald-600 hover:underline">← Volver al marketplace</Link>
    </div>
  )

  const traz       = cosecha.trazabilidad || { practicas: [], labores: [], fito: [] }
  const hayTraz    = traz.practicas.length > 0 || traz.labores.length > 0 || traz.fito.length > 0
  const sosteCount = traz.fito.filter(f => f.es_sostenible).length + traz.practicas.length
  const enCarrito  = items.some(i => i.id === cosecha.id)
  const telefono   = cosecha.contacto?.replace(/\D/g, '')
  const whatsapp   = `https://wa.me/51${telefono}`

  const handleAgregar = () => {
    addItem(cosecha)
    toast.success(`${cosecha.nombre_producto} agregado al carrito`)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8faf7' }}>
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

        {/* Volver */}
        <Link to="/marketplace"
          className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-emerald-700"
          style={{ color: '#6b7280' }}>
          <ArrowLeft size={15} /> Volver al marketplace
        </Link>

        {/* ── Producto principal ── */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row">

            {/* Imagen cuadrada */}
            <div className="md:w-96 md:h-96 w-full h-72 shrink-0 bg-gradient-to-br from-emerald-50 to-green-100 relative overflow-hidden">
              <img
                src={cosecha.foto_url || FALLBACK_IMG}
                alt={cosecha.nombre_producto}
                className="w-full h-full object-cover"
              />
              {sosteCount > 0 && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black text-white"
                  style={{ background: 'rgba(22,101,52,0.88)', backdropFilter: 'blur(6px)' }}>
                  <Leaf size={11} /> {sosteCount} práctica{sosteCount > 1 ? 's' : ''} sostenible{sosteCount > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 p-6 flex flex-col gap-5">

              {/* Nombre + biohuerto */}
              <div>
                <h1 className="text-2xl font-black leading-tight mb-1" style={{ color: '#1B4332' }}>
                  {cosecha.nombre_producto}
                </h1>
                <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#9ca3af' }}>
                  <MapPin size={13} /> {cosecha.biohuerto_nombre}
                  {cosecha.productor_nombre && <> · {cosecha.productor_nombre}</>}
                </p>
              </div>

              {/* Precio */}
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black" style={{ color: '#16a34a' }}>S/ {cosecha.precio}</span>
                <span className="text-gray-400 text-sm font-semibold">/ {cosecha.unidad_display}</span>
              </div>

              {/* Atributos */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <Scale size={12} /> {cosecha.cantidad} {cosecha.unidad_display} disponibles
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-50 text-gray-500 border border-gray-100">
                  <CalendarDays size={12} /> Cosechado el {cosecha.fecha_cosecha}
                </span>
                {cosecha.campana_nombre && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <Leaf size={12} /> {cosecha.campana_nombre}
                  </span>
                )}
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={handleAgregar}
                  disabled={enCarrito}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-black text-sm transition-all active:scale-95"
                  style={enCarrito
                    ? { backgroundColor: '#f0fdf4', color: '#16a34a', border: '2px solid #bbf7d0' }
                    : { background: 'linear-gradient(135deg,#16a34a,#15803d)', color: '#fff', boxShadow: '0 6px 20px rgba(22,163,74,0.30)' }}>
                  <ShoppingCart size={16} />
                  {enCarrito ? '✓ En el carrito' : 'Agregar al carrito'}
                </button>
                <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm transition-all hover:bg-emerald-50 border-2"
                  style={{ borderColor: '#16a34a', color: '#15803d' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#16a34a">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>

              <p className="text-[11px] text-gray-400 text-center">Directo con el productor · sin intermediarios</p>
            </div>
          </div>
        </div>

        {/* ── Trazabilidad ── */}
        {hayTraz && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Cómo se produjo</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {traz.practicas.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: '#1B4332' }}>🌱 Prácticas Sostenibles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {traz.practicas.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-emerald-600" />
                      <div>
                        <p className="text-sm font-bold text-emerald-700">{p.tipo_display}</p>
                        {p.descripcion && <p className="text-xs text-gray-500 mt-0.5">{p.descripcion}</p>}
                        {p.cantidad && <p className="text-[11px] text-gray-400 mt-0.5">{p.cantidad} {p.unidad}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {traz.labores.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: '#1B4332' }}>🔧 Labores Realizadas</h2>
                <div className="space-y-2">
                  {traz.labores.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-gray-50 border border-gray-100">
                      <Wrench size={13} className="text-gray-400 shrink-0" />
                      <p className="text-sm font-semibold text-gray-700 flex-1">{l.nombre}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {l.cantidad && <span>{l.cantidad} {l.unidad}</span>}
                        {l.fecha && <span>{l.fecha}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {traz.fito.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h2 className="text-sm font-black uppercase tracking-wide mb-4" style={{ color: '#1B4332' }}>🛡️ Control Fitosanitario</h2>
                <div className="space-y-2">
                  {traz.fito.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl border"
                      style={{ backgroundColor: f.es_sostenible ? '#f0fdf4' : '#f9fafb', borderColor: f.es_sostenible ? '#bbf7d0' : '#f3f4f6' }}>
                      <ShieldCheck size={13} style={{ color: f.es_sostenible ? '#16a34a' : '#9ca3af', flexShrink: 0 }} />
                      <p className="text-sm font-semibold flex-1" style={{ color: f.es_sostenible ? '#15803d' : '#374151' }}>{f.producto}</p>
                      <div className="flex items-center gap-2">
                        {f.es_sostenible && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">sostenible</span>
                        )}
                        {f.fecha && <span className="text-[11px] text-gray-400">{f.fecha}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl p-4 flex items-center gap-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shrink-0">
                <Leaf size={18} color="white" />
              </div>
              <div>
                <p className="text-sm font-black text-emerald-700">Producción verificada por BioHuerto USAT</p>
                <p className="text-xs text-gray-500 mt-0.5">Registro completo de labores, insumos y prácticas de manejo.</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-center pb-6">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline">
            <ArrowLeft size={14} /> Ver más cosechas disponibles
          </Link>
        </div>
      </div>
    </div>
  )
}
