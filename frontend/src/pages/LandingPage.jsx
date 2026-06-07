import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, MapPin, ChevronLeft, ChevronRight,
  Leaf, Droplets, Zap, ShoppingBag, TrendingUp, FileText,
  Star, CheckCircle,
} from 'lucide-react'
import { useCart } from '../context/CartContext'

/* ────────────────────────────────────────────
   DATOS
──────────────────────────────────────────── */
const CATEGORIAS = [
  { label: 'Verduras', emoji: '🥬', q: 'verdura' },
  { label: 'Tomates',  emoji: '🍅', q: 'tomate'  },
  { label: 'Hierbas',  emoji: '🌿', q: 'hierba'  },
  { label: 'Raíces',   emoji: '🥕', q: 'raiz'    },
  { label: 'Granos',   emoji: '🌽', q: 'grano'   },
  { label: 'Frutas',   emoji: '🍓', q: 'fruta'   },
]

const FEATURES = [
  { Icon: Leaf,        color: '#52B788', titulo: 'Cultivos',     desc: 'Registra siembras, etapas y cosechas con historial completo.'       },
  { Icon: Droplets,    color: '#3B82F6', titulo: 'Monitoreo',    desc: 'Alertas de riego, fertilización y control preventivo.'              },
  { Icon: Zap,         color: '#F59E0B', titulo: 'Diagnóstico',  desc: 'Identifica plagas y enfermedades paso a paso.'                      },
  { Icon: ShoppingBag, color: '#10B981', titulo: 'Marketplace',  desc: 'Publica tus cosechas y conecta con consumidores locales.'           },
  { Icon: TrendingUp,  color: '#F97316', titulo: 'Trazabilidad', desc: 'Prácticas sostenibles y costeo de producción.'                      },
  { Icon: FileText,    color: '#8B5CF6', titulo: 'Reportes PDF', desc: 'Exporta resúmenes visuales de tu campaña productiva.'               },
]

const COSECHAS_DEMO = [
  {
    id: 'd1', nombre_producto: 'Lechuga Crespa', biohuerto: 'Biohuerto USAT Norte',
    precio: '3.50', unidad: 'atado',
    foto_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    contact: '979123456', rating: 4.9, ventas: 128,
  },
  {
    id: 'd2', nombre_producto: 'Tomate Cherry', biohuerto: 'Biohuerto Las Gardenias',
    precio: '8.00', unidad: 'kg',
    foto_url: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600&auto=format&fit=crop&q=80',
    contact: '979654321', rating: 4.8, ventas: 95,
  },
  {
    id: 'd3', nombre_producto: 'Culantro Fresco', biohuerto: 'Biohuerto San Miguel',
    precio: '1.00', unidad: 'atado',
    foto_url: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=600&auto=format&fit=crop&q=80',
    contact: '979789012', rating: 4.7, ventas: 210,
  },
  {
    id: 'd4', nombre_producto: 'Espinaca Baby', biohuerto: 'Biohuerto USAT Centro',
    precio: '2.50', unidad: 'atado',
    foto_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    contact: '979111222', rating: 4.8, ventas: 72,
  },
  {
    id: 'd5', nombre_producto: 'Pepino Fresco', biohuerto: 'Biohuerto El Verde',
    precio: '4.00', unidad: 'kg',
    foto_url: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&auto=format&fit=crop&q=80',
    contact: '979333444', rating: 4.7, ventas: 56,
  },
  {
    id: 'd6', nombre_producto: 'Albahaca Fresca', biohuerto: 'Biohuerto San Pedro',
    precio: '1.50', unidad: 'atado',
    foto_url: 'https://images.unsplash.com/photo-1618090584126-129cd1dde8f4?w=600&auto=format&fit=crop&q=80',
    contact: '979555666', rating: 4.9, ventas: 143,
  },
  {
    id: 'd7', nombre_producto: 'Zanahoria Orgánica', biohuerto: 'Biohuerto USAT Sur',
    precio: '3.00', unidad: 'kg',
    foto_url: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600&auto=format&fit=crop&q=80',
    contact: '979777888', rating: 4.6, ventas: 89,
  },
  {
    id: 'd8', nombre_producto: 'Rabanito Fresco', biohuerto: 'Biohuerto Las Flores',
    precio: '1.50', unidad: 'atado',
    foto_url: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=80',
    contact: '979999000', rating: 4.7, ventas: 61,
  },
]

const STATS = [
  { target: 50,  suffix: '+', label: 'Productores activos'  },
  { target: 15,  suffix: '+', label: 'Tipos de cultivo'     },
  { target: 200, suffix: '+', label: 'Cosechas publicadas'  },
  { target: 8,   suffix: '',  label: 'Comunidades'          },
]

const HERO_SLIDES = [
  {
    tag: 'Red de Biohuertos',
    tagBg: 'rgba(82,183,136,0.28)', tagColor: '#B2F5D4',
    title: 'Cultiva. Conecta.\nTransforma.',
    subtitle: 'El ecosistema digital para productores de biohuertos urbanos de Lambayeque. Gestiona, monitorea y vende tu producción orgánica.',
    cta:    { label: 'Explorar Marketplace', to: '/marketplace' },
    ctaAlt: { label: 'Soy Productor →',      to: '/register'    },
    img:  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=900&auto=format&fit=crop&q=80',
    img2: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=80',
    bg: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)',
  },
  {
    tag: 'Cosechas del día',
    tagBg: 'rgba(252,165,165,0.28)', tagColor: '#FED7D7',
    title: 'Del campo a\ntu mesa hoy.',
    subtitle: 'Tomates cherry, lechugas y hierbas aromáticas de productores verificados de Chiclayo y Lambayeque. Sin intermediarios.',
    cta:    { label: 'Ver Cosechas',    to: '/marketplace' },
    ctaAlt: { label: 'Comprar ahora →', to: '/marketplace' },
    img:  'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=900&auto=format&fit=crop&q=80',
    img2: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&auto=format&fit=crop&q=80',
    bg: 'linear-gradient(135deg,#7C2D12 0%,#B91C1C 60%,#991B1B 100%)',
  },
  {
    tag: 'Productores USAT',
    tagBg: 'rgba(110,231,183,0.25)', tagColor: '#6EE7B7',
    title: 'Registra y vende\ntu producción.',
    subtitle: 'Únete a la red de biohuertos urbanos. Publica tus cosechas y llega a cientos de consumidores locales.',
    cta:    { label: 'Registrarme gratis', to: '/register'      },
    ctaAlt: { label: 'Conocer más →',     to: '/quienes-somos' },
    img:  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&auto=format&fit=crop&q=80',
    img2: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=500&auto=format&fit=crop&q=80',
    bg: 'linear-gradient(135deg,#064E3B 0%,#065F46 50%,#1B4332 100%)',
  },
]

const BEIGE = '#F5EFE4'

const CAT_GRID = [
  { tag: 'DESTACADO',     tagColor: '#2D6A4F', titulo: 'Lechugas Orgánicas', desc: 'Variedad crespa y romana, sin pesticidas ni agroquímicos.',   img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80' },
  { tag: 'FRESCAS',       tagColor: '#0891b2', titulo: 'Hierbas Aromáticas', desc: 'Culantro, albahaca y menta recién cortadas del campo.',        img: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&auto=format&fit=crop&q=80' },
  { tag: '100% ORGÁNICO', tagColor: '#dc2626', titulo: 'Tomates Frescos',    desc: 'Cherry y romano maduros, directamente del biohuerto.',         img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&auto=format&fit=crop&q=80' },
  { tag: 'TEMPORADA',     tagColor: '#d97706', titulo: 'Raíces y Bulbos',    desc: 'Zanahoria, rábano y cebolla recién cosechados.',               img: 'https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&auto=format&fit=crop&q=80' },
  { tag: 'MUY BUSCADO',   tagColor: '#7c3aed', titulo: 'Kits de Siembra',   desc: 'Todo lo que necesitas para iniciar tu propio huerto en casa.', img: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=80' },
  { tag: 'LOCAL',         tagColor: '#059669', titulo: 'Legumbres Frescas',  desc: 'Frijol canario, lenteja y garbanzo de productores locales.',   img: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=400&auto=format&fit=crop&q=80' },
  { tag: 'NATURAL',       tagColor: '#92400e', titulo: 'Abono Orgánico',     desc: 'Humus de lombriz y compost 100% natural para tus cultivos.',   img: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=400&auto=format&fit=crop&q=80' },
  { tag: 'DE TEMPORADA',  tagColor: '#db2777', titulo: 'Frutas del Huerto',  desc: 'Fresa, pepino dulce y zapallito de biohuertos urbanos.',       img: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&auto=format&fit=crop&q=80' },
]

/* ────────────────────────────────────────────
   HOOKS / UTILIDADES
──────────────────────────────────────────── */
function useInView(ref, threshold = 0.35) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref, threshold])
  return inView
}

function CountUp({ target, suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const ref    = useRef(null)
  const inView = useInView(ref, 0.5)
  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const raf = ts => {
      const p = Math.min((ts - start) / duration, 1)
      const e = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(e * target))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [inView, target, duration])
  return <span ref={ref}>{val}{suffix}</span>
}

/* ────────────────────────────────────────────
   HERO CAROUSEL
──────────────────────────────────────────── */
function HeroCarousel() {
  const [current, setCurrent] = useState(0)
  const [paused,  setPaused]  = useState(false)
  const total = HERO_SLIDES.length

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setCurrent(c => (c + 1) % total), 5000)
    return () => clearInterval(id)
  }, [paused, total])

  const prev = () => setCurrent(c => (c - 1 + total) % total)
  const next = () => setCurrent(c => (c + 1) % total)

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'clamp(400px, 48vw, 560px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>

      {HERO_SLIDES.map((slide, i) => (
        <div key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}>

          {/* Background gradient */}
          <div className="absolute inset-0" style={{ background: slide.bg }} />

          {/* Subtle dot pattern */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          {/* Content */}
          <div className="relative z-10 h-full max-w-[1600px] mx-auto px-6 sm:px-10 xl:px-16 flex items-center gap-10">

            {/* Left: text */}
            <div className="flex-1 max-w-xl">
              <span className="inline-block text-[11px] font-black px-3.5 py-1.5 rounded-full mb-5 tracking-[0.14em] uppercase"
                style={{ background: slide.tagBg, color: slide.tagColor }}>
                {slide.tag}
              </span>
              <h1 className="font-black text-white leading-tight mb-5"
                style={{ fontSize: 'clamp(2rem, 3.8vw, 3.4rem)', whiteSpace: 'pre-line', textShadow: '0 4px 24px rgba(0,0,0,0.28)' }}>
                {slide.title}
              </h1>
              <p className="text-base mb-7 max-w-md leading-relaxed" style={{ color: 'rgba(255,255,255,0.72)' }}>
                {slide.subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to={slide.cta.to}
                  className="font-black px-7 py-3.5 rounded-full text-sm transition-all hover:shadow-[0_8px_32px_rgba(255,255,255,0.22)] hover:-translate-y-0.5"
                  style={{ background: '#fff', color: '#1B4332' }}>
                  {slide.cta.label}
                </Link>
                <Link to={slide.ctaAlt.to}
                  className="font-bold px-7 py-3.5 rounded-full text-sm text-white transition-all hover:bg-white/15"
                  style={{ border: '2px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}>
                  {slide.ctaAlt.label}
                </Link>
              </div>
            </div>

            {/* Right: dual images */}
            <div className="hidden lg:block shrink-0 relative"
              style={{ width: 'min(42%, 500px)', height: '82%' }}>
              {/* Main image */}
              <div className="absolute top-0 left-0 right-[72px] bottom-[44px] rounded-3xl overflow-hidden shadow-2xl"
                style={{ transform: 'rotate(-2deg)', border: '2px solid rgba(255,255,255,0.16)' }}>
                <img src={slide.img} alt="" className="w-full h-full object-cover" />
              </div>
              {/* Second image — floating bottom-right */}
              <div className="absolute bottom-0 right-0 w-[175px] h-[132px] rounded-2xl overflow-hidden shadow-xl"
                style={{ transform: 'rotate(2.5deg)', border: '3px solid rgba(255,255,255,0.22)' }}>
                <img src={slide.img2} alt="" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button onClick={prev}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>
        <ChevronLeft size={20} />
      </button>
      <button onClick={next}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', color: '#fff' }}>
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '28px' : '8px',
              height: '8px',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
            }} />
        ))}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] z-20" style={{ background: 'rgba(255,255,255,0.12)' }}>
        <div className="h-full transition-all duration-500"
          style={{ width: `${((current + 1) / total) * 100}%`, background: '#74C69D' }} />
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   CATEGORY PILLS STRIP
──────────────────────────────────────────── */
function CategoryPills() {
  return (
    <div className="py-3.5 px-4 sm:px-6 xl:px-10 border-b" style={{ backgroundColor: '#fff', borderColor: '#ECECEC' }}>
      <div className="max-w-[1600px] mx-auto flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
        <span className="text-[10px] font-black uppercase tracking-widest shrink-0 mr-1" style={{ color: '#9CA3AF' }}>
          Explorar:
        </span>
        {CATEGORIAS.map(c => (
          <Link key={c.label} to={`/marketplace?q=${c.q}`}
            className="text-xs font-bold px-4 py-1.5 rounded-full transition-all hover:scale-105"
            style={{ background: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#DCFCE7'; e.currentTarget.style.color = '#166534'; e.currentTarget.style.borderColor = '#86EFAC' }}
            onMouseLeave={e => { e.currentTarget.style.background = '#F3F4F6'; e.currentTarget.style.color = '#374151'; e.currentTarget.style.borderColor = '#E5E7EB' }}>
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   PRODUCT CARD
──────────────────────────────────────────── */
function ProductCard({ item }) {
  const { addItem, items: cartItems } = useCart()
  const [liked, setLiked] = useState(false)
  const inCart = cartItems.some(i => i.id === item.id)

  return (
    <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-400"
      style={{ border: '1px solid #e5e7eb' }}>

      {/* Imagen */}
      <div className="relative h-56 overflow-hidden">
        <img src={item.foto_url} alt={item.nombre_producto}
          className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />

        <button onClick={() => setLiked(v => !v)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm hover:scale-110"
          style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}>
          <Heart size={16} style={{ color: liked ? '#dc2626' : '#9CA3AF', fill: liked ? '#dc2626' : 'none' }} />
        </button>

        <span className="absolute top-3 left-3 text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide"
          style={{ background: 'rgba(45,106,79,0.92)', backdropFilter: 'blur(8px)' }}>
          ✓ Disponible
        </span>

        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}>
          <Star size={11} fill="#F59E0B" style={{ color: '#F59E0B' }} />
          <span className="text-white text-[10px] font-black">{item.rating}</span>
          <span className="text-white/60 text-[10px]">({item.ventas})</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-black text-lg leading-tight mb-1" style={{ color: '#1B4332' }}>
          {item.nombre_producto}
        </h3>
        <div className="flex items-center gap-1 mb-3">
          <MapPin size={11} style={{ color: '#9CA3AF' }} />
          <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{item.biohuerto}</span>
        </div>

        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-2xl font-black" style={{ color: '#2D6A4F' }}>S/ {item.precio}</span>
          <span className="text-xs font-semibold" style={{ color: '#9CA3AF' }}>/ {item.unidad}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => !inCart && addItem(item)}
            className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
            style={inCart
              ? { backgroundColor: '#f0fdf4', color: '#16a34a', border: '2px solid #bbf7d0' }
              : { background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', color: '#fff', boxShadow: '0 4px 14px rgba(45,106,79,0.30)' }}>
            {inCart ? '✓ En carrito' : 'Agregar al carrito'}
          </button>
          <a href={`https://wa.me/51${item.contact}`} target="_blank" rel="noopener noreferrer"
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{ backgroundColor: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────
   COSECHAS CAROUSEL  (fondo beige)
──────────────────────────────────────────── */
function CosechasCarousel() {
  const [page,   setPage]   = useState(0)
  const [paused, setPaused] = useState(false)

  const pageSize  = 4
  const pageCount = Math.ceil(COSECHAS_DEMO.length / pageSize)
  const pages     = Array.from({ length: pageCount }, (_, pi) =>
    COSECHAS_DEMO.slice(pi * pageSize, pi * pageSize + pageSize)
  )

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setPage(p => (p + 1) % pageCount), 5000)
    return () => clearInterval(id)
  }, [paused, pageCount])

  const prev = () => setPage(p => Math.max(0, p - 1))
  const next = () => setPage(p => Math.min(pageCount - 1, p + 1))

  return (
    <section className="py-16 px-4 sm:px-6 xl:px-10" style={{ backgroundColor: BEIGE }}>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}>

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#2D6A4F' }}>
              EN TEMPORADA
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-1" style={{ color: '#1B4332' }}>
              Cosechas disponibles
            </h2>
            <p className="text-sm mt-1" style={{ color: '#6B7280' }}>
              Directamente de productores locales de Lambayeque
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <button onClick={prev} disabled={page === 0}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105"
                style={{ background: '#fff', border: '1.5px solid #2D6A4F', color: '#2D6A4F' }}>
                <ChevronLeft size={18} />
              </button>
              <button onClick={next} disabled={page === pageCount - 1}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30 hover:scale-105"
                style={{ background: '#2D6A4F', color: '#fff' }}>
                <ChevronRight size={18} />
              </button>
            </div>
            <Link to="/marketplace"
              className="hidden sm:flex items-center gap-1.5 font-black text-sm hover:opacity-70 transition-opacity"
              style={{ color: '#2D6A4F' }}>
              Ver todo <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Carousel track */}
        <div className="overflow-hidden">
          <div className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${page * 100}%)` }}>
            {pages.map((group, pi) => (
              <div key={pi} className="w-full shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-6">
                {group.map(item => <ProductCard key={item.id} item={item} />)}
              </div>
            ))}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {pages.map((_, i) => (
            <button key={i} onClick={() => setPage(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width:      i === page ? '24px' : '8px',
                height:     '8px',
                background: i === page ? '#2D6A4F' : 'rgba(45,106,79,0.25)',
              }} />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link to="/marketplace"
            className="inline-flex items-center gap-2 font-black px-8 py-3.5 rounded-full border-2 text-sm transition-all duration-200"
            style={{ borderColor: '#2D6A4F', color: '#2D6A4F' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2D6A4F'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2D6A4F' }}>
            <ShoppingBag size={16} /> Explorar Marketplace completo
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   CATEGORÍAS GRID — estilo catálogo
──────────────────────────────────────────── */
function CategoriasGrid() {
  return (
    <section className="py-20 px-4 sm:px-6 xl:px-10" style={{ backgroundColor: '#fff' }}>
      <div>

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: '#52B788' }}>
              EXPLORA POR CATEGORÍA
            </span>
            <h2 className="text-3xl md:text-4xl font-black mt-1" style={{ color: '#1B4332' }}>
              Lo que encontrarás
            </h2>
          </div>
          <Link to="/marketplace"
            className="hidden sm:flex items-center gap-1.5 font-black text-sm hover:opacity-70 transition-opacity"
            style={{ color: '#2D6A4F' }}>
            Ver todo <ChevronRight size={16} />
          </Link>
        </div>

        {/* Grid 4×2 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CAT_GRID.map((cat, i) => (
            <Link
              key={i}
              to={`/marketplace?q=${encodeURIComponent(cat.titulo.split(' ')[0].toLowerCase())}`}
              className="group relative flex items-center justify-between rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5"
              style={{
                backgroundColor: BEIGE,
                minHeight: '185px',
                padding: '26px 18px 26px 26px',
                border: '1px solid rgba(0,0,0,0.06)',
              }}>
              <div className="flex-1 min-w-0 pr-3 z-10">
                <span className="text-[10px] font-black uppercase tracking-widest block mb-2"
                  style={{ color: cat.tagColor }}>
                  {cat.tag}
                </span>
                <h3 className="font-black text-[17px] leading-tight mb-2" style={{ color: '#1B4332' }}>
                  {cat.titulo}
                </h3>
                <p className="text-[13px] leading-snug line-clamp-2" style={{ color: '#7A6F62' }}>
                  {cat.desc}
                </p>
                <span className="inline-flex items-center gap-1 mt-3.5 text-[12px] font-black"
                  style={{ color: cat.tagColor }}>
                  + info
                  <svg width="11" height="11" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M6 3l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>

              <div className="shrink-0 w-[108px] h-[108px] rounded-2xl overflow-hidden shadow-md transition-transform duration-400 group-hover:scale-105">
                <img src={cat.img} alt={cat.titulo} className="w-full h-full object-cover" />
              </div>

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
                style={{ boxShadow: `inset 0 0 0 2px ${cat.tagColor}50` }} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   STATS
──────────────────────────────────────────── */
function StatsSection() {
  return (
    <section className="py-16 px-4 sm:px-6 xl:px-10 bg-white">
      <div>
        <p className="text-center font-black text-[10px] uppercase tracking-[0.22em] mb-10" style={{ color: '#9CA3AF' }}>
          El impacto hasta hoy
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {STATS.map(({ target, suffix, label }) => (
            <div key={label} className="text-center py-8 px-4">
              <p className="text-4xl md:text-5xl font-black leading-none mb-2" style={{ color: '#1B4332' }}>
                <CountUp target={target} suffix={suffix} />
              </p>
              <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   FEATURES — fondo oscuro
──────────────────────────────────────────── */
function FeaturesSection() {
  const ref    = useRef(null)
  const inView = useInView(ref, 0.15)

  return (
    <section className="py-24 px-4 sm:px-6 xl:px-10" style={{ background: 'linear-gradient(160deg,#1B4332 0%,#2D6A4F 100%)' }}>
      <div>

        <div className="text-center mb-14">
          <span className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: '#52B788' }}>
            PLATAFORMA COMPLETA
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-white mt-2">
            Todo lo que necesitas
          </h2>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Una sola plataforma para gestionar y monetizar tu producción orgánica
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ Icon, color, titulo, desc }, i) => (
            <div key={titulo}
              className="flex items-start gap-4 p-5 rounded-2xl transition-all duration-500 hover:bg-white/10 cursor-default"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 80}ms`,
              }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110"
                style={{ background: `${color}20`, border: `1px solid ${color}35` }}>
                <Icon size={22} style={{ color }} />
              </div>
              <div>
                <h3 className="font-black text-white text-[15px] mb-1">{titulo}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.58)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {['100% gratuito para productores', 'Sin comisiones ocultas', 'Soporte USAT', 'Datos seguros'].map(b => (
            <div key={b} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.72)' }}>
              <CheckCircle size={15} style={{ color: '#52B788' }} />
              <span className="font-semibold">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   CTA FINAL
──────────────────────────────────────────── */
function CTAFinal() {
  return (
    <section className="py-28 px-6 sm:px-10 xl:px-16 relative overflow-hidden" style={{ background: '#fff' }}>

      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[80px]"
        style={{ background: '#2D6A4F' }} />
      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-[0.05] blur-[80px]"
        style={{ background: '#52B788' }} />

      <div className="relative z-10 max-w-3xl mx-auto text-center">

        <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-xl"
          style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
          <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
            <path d="M18 28 C18 28 8 22 9 14 C12 12 16 15 18 28Z" fill="white" opacity="0.9" />
            <path d="M18 24 C18 24 28 18 27 10 C24 8 20 11 18 24Z" fill="white" />
            <path d="M18 28 L18 31" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>

        <span className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: '#52B788' }}>
          ÚNETE HOY · ES GRATIS
        </span>
        <h2 className="text-4xl md:text-5xl font-black mt-3 mb-5 leading-tight" style={{ color: '#1B4332' }}>
          ¿Tienes un biohuerto<br />en Chiclayo?
        </h2>
        <p className="text-base max-w-lg mx-auto mb-10 leading-relaxed" style={{ color: '#6B7280' }}>
          Únete a la red de productores urbanos de la USAT y digitaliza tu producción hoy mismo.
          Completamente gratuito, siempre.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
            className="font-black px-10 py-4 rounded-full text-base text-white transition-all duration-300 hover:shadow-[0_12px_40px_rgba(45,106,79,0.35)]"
            style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
            Registrarme gratis →
          </Link>
          <Link to="/marketplace"
            className="border-2 font-black px-10 py-4 rounded-full text-base transition-all duration-300 hover:bg-gray-50"
            style={{ borderColor: '#E5E7EB', color: '#374151' }}>
            Explorar Marketplace
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   PAGE
──────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">
      <HeroCarousel />
      <CategoryPills />
      <CosechasCarousel />
      <CategoriasGrid />
      <StatsSection />
      <FeaturesSection />
      <CTAFinal />
    </main>
  )
}
