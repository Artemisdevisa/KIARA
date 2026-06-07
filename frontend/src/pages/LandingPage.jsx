import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PlantIcon   from '../components/icons/PlantIcon'
import DropIcon    from '../components/icons/DropIcon'
import SunIcon     from '../components/icons/SunIcon'
import HarvestIcon from '../components/icons/HarvestIcon'
import AlertIcon   from '../components/icons/AlertIcon'
import UserIcon    from '../components/icons/UserIcon'

/* ────────────────────────────────────────────
   DATOS
──────────────────────────────────────────── */
const FEATURES = [
  { Icon: PlantIcon,   color: '#52B788', titulo: 'Cultivos',        desc: 'Registra siembras, etapas y cosechas con historial completo.' },
  { Icon: DropIcon,    color: '#3B82F6', titulo: 'Riego',           desc: 'Alertas automáticas de riego, fertilización y control preventivo.' },
  { Icon: SunIcon,     color: '#F59E0B', titulo: 'Diagnóstico',     desc: 'Identifica plagas y enfermedades paso a paso.' },
  { Icon: HarvestIcon, color: '#10B981', titulo: 'Marketplace',     desc: 'Publica tus cosechas y conecta con consumidores locales.' },
  { Icon: AlertIcon,   color: '#F97316', titulo: 'Trazabilidad',    desc: 'Prácticas sostenibles y costeo de tu producción.' },
  { Icon: UserIcon,    color: '#8B5CF6', titulo: 'Reportes PDF',    desc: 'Exporta resúmenes visuales de tu campaña productiva.' },
]

const COSECHAS_DEMO = [
  { nombre: 'Lechuga Crespa',  biohuerto: 'Biohuerto USAT Norte',    precio: 'S/ 3.50', unidad: '10 atados', img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=75', contact: '979123456' },
  { nombre: 'Tomate Cherry',   biohuerto: 'Biohuerto Las Gardenias', precio: 'S/ 8.00', unidad: '5 kg',      img: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&auto=format&fit=crop&q=75', contact: '979654321' },
  { nombre: 'Culantro Fresco', biohuerto: 'Biohuerto San Miguel',    precio: 'S/ 1.00', unidad: '20 atados', img: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=500&auto=format&fit=crop&q=75', contact: '979789012' },
]

/* ────────────────────────────────────────────
   HOOK: intersection observer (count-up etc.)
──────────────────────────────────────────── */
function useInView(ref, threshold = 0.4) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [ref, threshold])
  return inView
}

/* ────────────────────────────────────────────
   COUNT-UP ANIMADO
──────────────────────────────────────────── */
function CountUp({ target, suffix = '', duration = 1800 }) {
  const [val, setVal]  = useState(0)
  const ref            = useRef(null)
  const inView         = useInView(ref, 0.5)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const raf = ts => {
      const p  = Math.min((ts - start) / duration, 1)
      const e  = 1 - Math.pow(1 - p, 3)
      setVal(Math.round(e * target))
      if (p < 1) requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)
  }, [inView, target, duration])

  return <span ref={ref}>{val}{suffix}</span>
}

/* ────────────────────────────────────────────
   BLOBS DE LUZ AMBIENTAL (reutilizable)
──────────────────────────────────────────── */
function AmbientBlobs({ mouse }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute w-[540px] h-[540px] rounded-full opacity-[0.20] blur-[140px]"
           style={{ background:'#52B788', top:'-5%', left:'3%',
                    transform:`translate(${mouse.x*45}px,${mouse.y*32}px)` }} />
      <div className="absolute w-[440px] h-[440px] rounded-full opacity-[0.16] blur-[110px]"
           style={{ background:'#B7791F', bottom:'0%', right:'5%',
                    transform:`translate(${mouse.x*-34}px,${mouse.y*-24}px)` }} />
      <div className="absolute w-[300px] h-[300px] rounded-full opacity-[0.12] blur-[90px]"
           style={{ background:'#52B788', top:'42%', right:'20%',
                    transform:`translate(${mouse.x*24}px,${mouse.y*30}px)` }} />
    </div>
  )
}

/* ────────────────────────────────────────────
   HERO 3D
──────────────────────────────────────────── */
function Hero3D() {
  const target = useRef({ x:0, y:0 })
  const [mouse,   setMouse]   = useState({ x:0, y:0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive:true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onMouse = e => {
      target.current = {
        x: (e.clientX / window.innerWidth  - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      }
    }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])

  useEffect(() => {
    let id
    const lerp = (a,b,t) => a + (b-a)*t
    const tick = () => {
      setMouse(prev => ({
        x: lerp(prev.x, target.current.x, 0.055),
        y: lerp(prev.y, target.current.y, 0.055),
      }))
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  const card3D = (mx, my, sf, rx=10, ry=16) => ({
    transform: `translateX(${mouse.x*mx}px) translateY(${mouse.y*my+scrollY*sf}px) rotateY(${mouse.x*ry}deg) rotateX(${mouse.y*-rx}deg)`,
    willChange: 'transform',
  })

  const IMG_CARDS = [
    { style:{ top:'7%',  left:'4%' },  w:'w-44 h-60', src:'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&auto=format&fit=crop&q=75', label:'🌿 Biohuerto USAT', cf: card3D(32,22,-0.10,11,17) },
    { style:{ top:'9%',  right:'4%' }, w:'w-52 h-44', src:'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&auto=format&fit=crop&q=75', label:'S/ 8.00 / kg',     badge:'Disponible', cf: card3D(-28,20,-0.15,13,19) },
    { style:{ bottom:'20%', left:'6%'  }, w:'w-48 h-36', src:'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=75', label:null, cf: card3D(22,-20,-0.07,8,13) },
    { style:{ bottom:'17%', right:'5%' }, w:'w-40 h-52', src:'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?w=400&auto=format&fit=crop&q=75', label:'Orgánico · USAT', cf: card3D(-24,-17,-0.13,10,15) },
  ]

  return (
    <section className="relative h-[calc(100vh-4rem)] min-h-[620px] overflow-hidden flex items-center justify-center"
             style={{ backgroundColor:'#1B4332' }}>

      {/* Video */}
      <div className="absolute inset-0 overflow-hidden"
           style={{ transform:`scale(1.12) translateY(${scrollY*0.22}px)`, willChange:'transform' }}>
        <video autoPlay muted loop playsInline className="w-full h-full object-cover"
               poster="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&auto=format&fit=crop&q=50">
          <source src="https://videos.pexels.com/video-files/3018243/3018243-hd_1280_720_30fps.mp4" type="video/mp4"/>
        </video>
      </div>

      {/* Overlay */}
      <div className="absolute inset-0"
           style={{ background:'linear-gradient(135deg,rgba(27,67,50,0.90) 0%,rgba(45,106,79,0.62) 50%,rgba(27,67,50,0.93) 100%)' }}/>

      <AmbientBlobs mouse={mouse}/>

      {/* 4 tarjetas flotantes */}
      {IMG_CARDS.map((c, i) => (
        <div key={i} className="absolute hidden lg:block" style={{ ...c.style, ...c.cf }}>
          <div className={`relative ${c.w} rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/20`}>
            <img src={c.src} alt="" className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"/>
            {c.badge && (
              <div className="absolute top-3 left-3">
                <span className="backdrop-blur-sm text-white text-xs font-black px-3 py-1 rounded-full" style={{ background:'rgba(45,106,79,0.90)' }}>
                  {c.badge}
                </span>
              </div>
            )}
            {c.label && (
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-xs font-black">{c.label}</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Glass stats (desktop) */}
      <div className="absolute hidden lg:flex bottom-[9%] left-1/2"
           style={{ transform:`translateX(-50%) translateY(${mouse.y*10+scrollY*-0.05}px)`, willChange:'transform' }}>
        <div className="flex items-center gap-8 border border-white/20 rounded-2xl px-8 py-4 shadow-2xl"
             style={{ background:'rgba(255,255,255,0.10)', backdropFilter:'blur(16px)' }}>
          {[{ n:'50+', l:'Productores' },{ n:'200+', l:'Cosechas' },{ n:'8', l:'Comunidades' }].map(({ n, l }, i) => (
            <div key={l} className={`text-center ${i > 0 ? 'border-l border-white/20 pl-8' : ''}`}>
              <p className="font-black text-white text-2xl leading-none">{n}</p>
              <p className="text-xs font-bold mt-1" style={{ color:'rgba(255,255,255,0.55)' }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido central */}
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto"
           style={{ transform:`translateY(${scrollY*0.11}px)`, willChange:'transform' }}>
        <h1 className="font-black leading-none mb-6"
            style={{ transform:`perspective(800px) rotateY(${mouse.x*4}deg) rotateX(${mouse.y*-2.5}deg)`, willChange:'transform' }}>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white"     style={{ textShadow:'0 4px 28px rgba(0,0,0,0.5)' }}>Cultiva.</span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-bio-light" style={{ textShadow:'0 4px 28px rgba(82,183,136,0.55)' }}>Conecta.</span>
          <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-bio-earth" style={{ textShadow:'0 4px 28px rgba(183,121,31,0.55)' }}>Transforma.</span>
        </h1>

        <p className="text-lg max-w-xl mx-auto leading-relaxed mb-10" style={{ color:'rgba(255,255,255,0.72)', textShadow:'0 2px 12px rgba(0,0,0,0.4)' }}>
          El ecosistema digital para productores de biohuertos urbanos de Lambayeque.
          Gestiona, monitorea y conecta tu producción orgánica.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/marketplace" className="bg-white font-black px-9 py-4 rounded-full text-base transition-all duration-300 hover:shadow-[0_12px_48px_rgba(255,255,255,0.30)]" style={{ color:'#1B4332' }}>
            Ver Marketplace
          </Link>
          <Link to="/register" className="border-2 text-white font-black px-9 py-4 rounded-full text-base transition-all duration-300 hover:bg-white/12" style={{ borderColor:'rgba(255,255,255,0.50)', backdropFilter:'blur(8px)' }}>
            Soy Productor
          </Link>
        </div>
      </div>

      {/* Scroll arrow */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce" style={{ color:'rgba(255,255,255,0.40)' }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M12 19L5 13M12 19L19 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   STATS CON COUNT-UP
──────────────────────────────────────────── */
const STATS = [
  { target:50,  suffix:'+', label:'Productores activos' },
  { target:15,  suffix:'+', label:'Tipos de cultivo' },
  { target:200, suffix:'+', label:'Cosechas publicadas' },
  { target:8,   suffix:'',  label:'Comunidades' },
]

function StatsSection() {
  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor:'#fff' }}>
      {/* Fondo decorativo */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-[0.07] blur-[80px]" style={{ background:'#52B788' }}/>
      <div className="max-w-5xl mx-auto relative">
        <p className="text-center font-black text-xs uppercase tracking-[0.2em] mb-14" style={{ color:'#6B7280' }}>
          El impacto hasta hoy
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-gray-100">
          {STATS.map(({ target, suffix, label }, i) => (
            <div key={label} className="text-center py-8 px-6">
              <p className="text-5xl md:text-6xl font-black leading-none mb-3" style={{ color:'#1B4332' }}>
                <CountUp target={target} suffix={suffix} />
              </p>
              <p className="text-xs font-black uppercase tracking-wider" style={{ color:'#6B7280' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   CÓMO FUNCIONA — HORIZONTAL 3 PASOS
──────────────────────────────────────────── */
const PASOS = [
  { n:'01', titulo:'Regístrate',       desc:'Crea tu cuenta gratis en menos de 2 minutos.',          color:'#2D6A4F' },
  { n:'02', titulo:'Registra cultivos', desc:'Añade tus biohuertos, cultivos y configura alertas.',   color:'#52B788' },
  { n:'03', titulo:'Publica y vende',   desc:'Comparte tus cosechas y conecta con consumidores.',     color:'#B7791F' },
]

function HowItWorks() {
  const ref    = useRef(null)
  const inView = useInView(ref, 0.2)
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <p className="font-black text-xs uppercase tracking-[0.2em] mb-3" style={{ color:'#6B7280' }}>Simple y rápido</p>
          <h2 className="text-3xl md:text-5xl font-black" style={{ color:'#1B4332' }}>¿Cómo funciona?</h2>
        </div>
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Línea conectora */}
          <div className="hidden md:block absolute top-10 left-[16.6%] right-[16.6%] h-0.5"
               style={{ background:'linear-gradient(90deg, #D8F3DC, #52B788, #D8F3DC)' }}/>
          {PASOS.map(({ n, titulo, desc, color }, i) => (
            <div
              key={n}
              className="relative text-center transition-all duration-700"
              style={{
                transform: inView ? 'translateY(0) opacity(1)' : 'translateY(30px)',
                opacity:   inView ? 1 : 0,
                transitionDelay: `${i * 150}ms`,
              }}
            >
              {/* Número */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg"
                style={{ background:`linear-gradient(135deg, ${color}20, ${color}10)`, border:`2px solid ${color}30` }}
              >
                <span className="font-black text-2xl" style={{ color }}>{n}</span>
              </div>
              <h3 className="font-black text-xl mb-2" style={{ color:'#1B4332' }}>{titulo}</h3>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color:'#6B7280' }}>{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/como-funciona"
            className="inline-flex items-center gap-2 font-black text-sm transition-colors hover:opacity-70"
            style={{ color:'#2D6A4F' }}
          >
            Ver guía completa
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   MARKETPLACE PREVIEW — CARDS CON HOVER 3D
──────────────────────────────────────────── */
function ProductCard({ nombre, biohuerto, precio, unidad, img, contact }) {
  const [tilt, setTilt] = useState({ x:0, y:0 })
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef(null)

  const onMouseMove = e => {
    const rect = cardRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 2
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * 2
    setTilt({ x, y })
  }

  return (
    <div
      ref={cardRef}
      className="rounded-2xl overflow-hidden bg-white shadow-sm cursor-default select-none"
      style={{
        transform: hovered
          ? `perspective(700px) rotateY(${tilt.x * 12}deg) rotateX(${tilt.y * -10}deg) scale(1.03)`
          : 'perspective(700px) rotateY(0) rotateX(0) scale(1)',
        boxShadow: hovered
          ? '0 30px 60px rgba(45,106,79,0.20), 0 8px 20px rgba(0,0,0,0.10)'
          : '0 2px 8px rgba(0,0,0,0.06)',
        transition: hovered ? 'transform 0.1s ease-out, box-shadow 0.3s' : 'transform 0.5s ease-out, box-shadow 0.3s',
        willChange:'transform',
      }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x:0, y:0 }) }}
    >
      {/* Imagen */}
      <div className="h-52 relative overflow-hidden">
        <img src={img} alt={nombre} className="w-full h-full object-cover transition-transform duration-700"
             style={{ transform: hovered ? 'scale(1.08)' : 'scale(1.0)' }}/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>
        <span className="absolute top-3 right-3 text-white text-xs font-black px-3 py-1 rounded-full"
              style={{ background:'rgba(45,106,79,0.90)', backdropFilter:'blur(8px)' }}>
          Disponible
        </span>
        {/* Luz de specular en hover */}
        {hovered && (
          <div className="absolute inset-0 pointer-events-none"
               style={{ background:`radial-gradient(circle at ${50+tilt.x*30}% ${50+tilt.y*30}%, rgba(255,255,255,0.12), transparent 70%)` }}/>
        )}
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-black text-lg mb-1" style={{ color:'#1B4332' }}>{nombre}</h3>
        <p className="text-sm mb-3 flex items-center gap-1.5" style={{ color:'#6B7280' }}>
          <PlantIcon size={13} className="text-bio-light"/>
          {biohuerto}
        </p>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-2xl font-black" style={{ color:'#2D6A4F' }}>{precio}</span>
          <span className="text-xs" style={{ color:'#6B7280' }}>/ {unidad}</span>
        </div>
        <a
          href={`https://wa.me/51${contact}`}
          target="_blank" rel="noopener noreferrer"
          className="mt-4 block w-full text-white font-black text-sm py-3 rounded-xl text-center transition-all duration-200 hover:opacity-90"
          style={{ background:'linear-gradient(135deg,#2D6A4F,#1B4332)' }}
          onClick={e => e.stopPropagation()}
        >
          Contactar por WhatsApp
        </a>
      </div>
    </div>
  )
}

function MarketplacePreview() {
  return (
    <section className="py-20 px-4" style={{ backgroundColor:'#D8F3DC' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="font-black text-xs uppercase tracking-[0.2em] mb-3" style={{ color:'#6B7280' }}>En temporada</p>
            <h2 className="text-3xl md:text-5xl font-black" style={{ color:'#1B4332' }}>
              Cosechas disponibles
            </h2>
          </div>
          <Link to="/marketplace" className="hidden sm:flex items-center gap-2 font-black text-sm hover:opacity-70 transition-opacity"
                style={{ color:'#2D6A4F' }}>
            Ver todo →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COSECHAS_DEMO.map((c, i) => <ProductCard key={i} {...c}/>)}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/marketplace"
            className="inline-block font-black px-8 py-3.5 rounded-full border-2 transition-all duration-200"
            style={{ borderColor:'#2D6A4F', color:'#2D6A4F' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor='#2D6A4F'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='#2D6A4F' }}
          >
            Explorar Marketplace completo
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   CTA FINAL
──────────────────────────────────────────── */
function CTAFinal() {
  const target = useRef({ x:0, y:0 })
  const [mouse, setMouse] = useState({ x:0, y:0 })

  useEffect(() => {
    const onMouse = e => { target.current = { x:(e.clientX/window.innerWidth-0.5)*2, y:(e.clientY/window.innerHeight-0.5)*2 } }
    window.addEventListener('mousemove', onMouse)
    return () => window.removeEventListener('mousemove', onMouse)
  }, [])
  useEffect(() => {
    let id
    const lerp=(a,b,t)=>a+(b-a)*t
    const tick=()=>{ setMouse(p=>({ x:lerp(p.x,target.current.x,0.06), y:lerp(p.y,target.current.y,0.06) })); id=requestAnimationFrame(tick) }
    id=requestAnimationFrame(tick)
    return ()=>cancelAnimationFrame(id)
  },[])

  return (
    <section className="py-24 px-4 relative overflow-hidden"
             style={{ background:'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}>
      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-96 h-96 rounded-full opacity-[0.18] blur-[100px]"
             style={{ background:'#52B788', top:'-10%', right:'10%', transform:`translate(${mouse.x*-30}px,${mouse.y*-20}px)` }}/>
        <div className="absolute w-80 h-80 rounded-full opacity-[0.14] blur-[80px]"
             style={{ background:'#B7791F', bottom:'-5%', left:'5%', transform:`translate(${mouse.x*20}px,${mouse.y*15}px)` }}/>
      </div>
      {/* Patrón */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
           style={{ backgroundImage:'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize:'36px 36px' }}/>

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <p className="font-black text-xs uppercase tracking-[0.22em] mb-5" style={{ color:'#52B788' }}>
          Únete hoy
        </p>
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          ¿Tienes un biohuerto<br />en Chiclayo?
        </h2>
        <p className="text-lg max-w-xl mx-auto mb-12 leading-relaxed" style={{ color:'rgba(255,255,255,0.70)' }}>
          Únete a la red de productores urbanos de la USAT y digitaliza
          tu producción hoy mismo. Completamente gratuito.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register"
                className="bg-white font-black px-10 py-4 rounded-full text-base transition-all duration-300 hover:shadow-[0_12px_48px_rgba(255,255,255,0.28)]"
                style={{ color:'#1B4332' }}>
            Registrarme gratis →
          </Link>
          <Link to="/como-funciona"
                className="border-2 text-white font-black px-10 py-4 rounded-full text-base transition-all duration-300 hover:bg-white/12"
                style={{ borderColor:'rgba(255,255,255,0.45)', backdropFilter:'blur(8px)' }}>
            Conocer más
          </Link>
        </div>
      </div>
    </section>
  )
}

/* ────────────────────────────────────────────
   PAGE ROOT
──────────────────────────────────────────── */
export default function LandingPage() {
  return (
    <div>
      <Hero3D />
      <StatsSection />
      <HowItWorks />
      <MarketplacePreview />
      <CTAFinal />
    </div>
  )
}
