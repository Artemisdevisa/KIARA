import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import {
  ArrowLeft, MapPin, CalendarDays, Scale, Phone, Leaf,
  Sprout, CheckCircle2, Wrench, ShieldCheck, Droplets,
} from 'lucide-react'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80'

function Badge({ children, green }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full"
      style={green
        ? { backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }
        : { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
      {children}
    </span>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 className="text-base font-black uppercase tracking-widest mb-4"
      style={{ color: '#1B4332', letterSpacing: '0.08em' }}>
      {children}
    </h2>
  )
}

export default function CosechaDetailPage() {
  const { id } = useParams()
  const [cosecha, setCosecha] = useState(null)
  const [loading, setLoading] = useState(true)
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

  const traz      = cosecha.trazabilidad || { practicas: [], labores: [], fito: [] }
  const telefono  = cosecha.contacto?.replace(/\D/g, '')
  const whatsapp  = `https://wa.me/51${telefono}`
  const hayTraz   = traz.practicas.length > 0 || traz.labores.length > 0 || traz.fito.length > 0
  const sosteCount = traz.fito.filter(f => f.es_sostenible).length

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8faf7' }}>

      {/* ── Hero imagen ── */}
      <div className="relative w-full" style={{ height: 'clamp(320px, 52vw, 520px)' }}>
        <img
          src={cosecha.foto_url || FALLBACK_IMG}
          alt={cosecha.nombre_producto}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.02) 40%, rgba(0,0,0,0.55) 100%)' }} />

        {/* Botón volver */}
        <Link to="/marketplace"
          className="absolute top-5 left-5 flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-bold transition-all hover:bg-white/25"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
          <ArrowLeft size={16} /> Marketplace
        </Link>

        {/* Título sobre la imagen */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-7">
          <div className="max-w-4xl mx-auto">
            {sosteCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(22,163,74,0.85)', color: '#fff', backdropFilter: 'blur(6px)' }}>
                <Leaf size={11} /> {sosteCount} práctica{sosteCount > 1 ? 's' : ''} sostenible{sosteCount > 1 ? 's' : ''}
              </span>
            )}
            <h1 className="text-white font-black leading-tight"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
              {cosecha.nombre_producto}
            </h1>
            <p className="flex items-center gap-1.5 text-white/75 text-sm mt-1 font-medium">
              <MapPin size={13} /> {cosecha.biohuerto_nombre}
              {cosecha.productor_nombre && <> · {cosecha.productor_nombre}</>}
            </p>
          </div>
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="max-w-4xl mx-auto px-5 py-8 space-y-8">

        {/* Precio + info + CTA */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">

            {/* Precio */}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-black" style={{ color: '#16a34a' }}>S/ {cosecha.precio}</span>
                <span className="text-gray-400 text-sm font-semibold">/ {cosecha.unidad_display}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge><Scale size={11} /> {cosecha.cantidad} {cosecha.unidad_display} disponibles</Badge>
                <Badge><CalendarDays size={11} /> Cosechado: {cosecha.fecha_cosecha}</Badge>
                {cosecha.campana_nombre && <Badge green><Leaf size={11} /> {cosecha.campana_nombre}</Badge>}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-white font-black text-sm transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', boxShadow: '0 6px 20px rgba(22,163,74,0.35)' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Contactar por WhatsApp
              </a>
              <p className="text-center text-[11px] text-gray-400">Directo con el productor · sin intermediarios</p>
            </div>
          </div>
        </div>

        {/* Trazabilidad */}
        {hayTraz && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ backgroundColor: '#e5e7eb' }} />
              <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Cómo se produjo</span>
              <div className="h-px flex-1" style={{ backgroundColor: '#e5e7eb' }} />
            </div>

            {/* Prácticas sostenibles */}
            {traz.practicas.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <SectionTitle>🌱 Prácticas Sostenibles</SectionTitle>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {traz.practicas.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl"
                      style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" style={{ color: '#16a34a' }} />
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#15803d' }}>{p.tipo_display}</p>
                        {p.descripcion && <p className="text-xs text-gray-500 mt-0.5">{p.descripcion}</p>}
                        {p.cantidad && <p className="text-[11px] text-gray-400 mt-0.5">{p.cantidad} {p.unidad}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Labores ejecutadas */}
            {traz.labores.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <SectionTitle>🔧 Labores Realizadas</SectionTitle>
                <div className="space-y-2">
                  {traz.labores.map((l, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                      style={{ backgroundColor: '#f9fafb', border: '1px solid #f3f4f6' }}>
                      <Wrench size={14} style={{ color: '#6b7280', flexShrink: 0 }} />
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

            {/* Fitosanitario */}
            {traz.fito.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <SectionTitle>🛡️ Control Fitosanitario</SectionTitle>
                <div className="space-y-2">
                  {traz.fito.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-xl"
                      style={{
                        backgroundColor: f.es_sostenible ? '#f0fdf4' : '#f9fafb',
                        border: `1px solid ${f.es_sostenible ? '#bbf7d0' : '#f3f4f6'}`,
                      }}>
                      <ShieldCheck size={14} style={{ color: f.es_sostenible ? '#16a34a' : '#9ca3af', flexShrink: 0 }} />
                      <p className="text-sm font-semibold flex-1"
                        style={{ color: f.es_sostenible ? '#15803d' : '#374151' }}>{f.producto}</p>
                      <div className="flex items-center gap-2">
                        {f.es_sostenible && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>sostenible</span>
                        )}
                        {f.fecha && <span className="text-[11px] text-gray-400">{f.fecha}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sello de confianza */}
            <div className="rounded-2xl p-5 flex items-center gap-4"
              style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: '#16a34a' }}>
                <Leaf size={22} color="white" />
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: '#15803d' }}>Producción verificada por BioHuerto USAT</p>
                <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                  Este producto cuenta con registro completo de labores, insumos y prácticas de manejo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer volver */}
        <div className="text-center pt-2 pb-8">
          <Link to="/marketplace"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:underline">
            <ArrowLeft size={14} /> Ver más cosechas disponibles
          </Link>
        </div>
      </div>
    </div>
  )
}
