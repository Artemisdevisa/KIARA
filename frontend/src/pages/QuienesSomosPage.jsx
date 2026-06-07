import { Link } from 'react-router-dom'
import PlantIcon from '../components/icons/PlantIcon'
import DropIcon from '../components/icons/DropIcon'
import SunIcon from '../components/icons/SunIcon'

function LeafPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="qs-leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M15 40 C15 25 30 14 38 22 C46 30 36 48 15 40Z" fill="white" opacity="0.06" transform="rotate(10 26 31)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#qs-leaves)"/>
    </svg>
  )
}

/* Ilustración SVG custom del campo/biohuerto */
function FieldIllustration() {
  return (
    <svg viewBox="0 0 420 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-md mx-auto">
      {/* Cielo */}
      <rect width="420" height="200" fill="#D8F3DC" rx="16"/>
      {/* Sol */}
      <circle cx="340" cy="60" r="36" fill="#52B788" opacity="0.3"/>
      <circle cx="340" cy="60" r="24" fill="#52B788" opacity="0.5"/>
      {/* Suelo */}
      <rect y="190" width="420" height="130" fill="#2D6A4F" rx="0"/>
      <rect y="185" width="420" height="20" fill="#1B4332" rx="0"/>
      {/* Planta grande centro */}
      <path d="M210 185V120" stroke="#D8F3DC" strokeWidth="5" strokeLinecap="round"/>
      <path d="M210 155 C225 145 235 130 228 115 C220 113 210 123 210 155Z" fill="#52B788"/>
      <path d="M210 140 C195 130 185 115 192 100 C200 98 210 110 210 140Z" fill="#52B788" opacity="0.7"/>
      <ellipse cx="210" cy="108" rx="10" ry="15" fill="#1B4332" opacity="0.3"/>
      {/* Planta izquierda */}
      <path d="M110 185V145" stroke="#D8F3DC" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M110 165 C122 157 128 145 122 134 C116 133 110 143 110 165Z" fill="#52B788" opacity="0.8"/>
      <path d="M110 155 C98 148 92 136 98 126 C104 125 110 134 110 155Z" fill="#52B788" opacity="0.55"/>
      {/* Planta derecha */}
      <path d="M310 185V148" stroke="#D8F3DC" strokeWidth="3.5" strokeLinecap="round"/>
      <path d="M310 168 C322 160 328 148 322 137 C316 136 310 146 310 168Z" fill="#52B788" opacity="0.8"/>
      <path d="M310 158 C298 151 292 139 298 129 C304 128 310 137 310 158Z" fill="#52B788" opacity="0.55"/>
      {/* Suelo líneas decorativas */}
      <path d="M40 215 C80 210 140 218 200 212 C260 206 320 215 380 210" stroke="#52B788" strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
      <path d="M20 240 C70 234 140 242 210 236 C280 230 350 240 410 234" stroke="#52B788" strokeWidth="1.5" opacity="0.2" strokeLinecap="round"/>
      {/* Gotitas de agua */}
      <circle cx="170" cy="100" r="5" fill="#52B788" opacity="0.6"/>
      <circle cx="252" cy="85" r="4" fill="#52B788" opacity="0.5"/>
      <circle cx="140" cy="130" r="3" fill="#52B788" opacity="0.4"/>
    </svg>
  )
}

const VALORES = [
  {
    Icon: PlantIcon,
    titulo: 'Sostenibilidad',
    descripcion: 'Promovemos prácticas agroecológicas que cuidan la tierra y aseguran la producción para generaciones futuras.',
  },
  {
    Icon: DropIcon,
    titulo: 'Comunidad',
    descripcion: 'Conectamos productores y consumidores locales, fortaleciendo el tejido social y la economía familiar de Chiclayo.',
  },
  {
    Icon: SunIcon,
    titulo: 'Innovación',
    descripcion: 'Aplicamos tecnología accesible para transformar la gestión de biohuertos urbanos y democratizar la agricultura digital.',
  },
]

export default function QuienesSomosPage() {
  return (
    <div className="bg-bio-cream">

      {/* ── HERO INTERNO ── */}
      <section
        className="relative h-[300px] flex items-center justify-center overflow-hidden px-4"
        style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)' }}
      >
        <LeafPattern />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Quiénes Somos</h1>
          <p className="text-white/70 text-lg font-semibold">
            Conoce el proyecto detrás de BioHuerto USAT
          </p>
        </div>
      </section>

      {/* ── EL PROYECTO ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="inline-block bg-bio-pale text-bio-main font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full mb-5">
                Proyecto RSU · USAT 2026
              </span>
              <h2 className="text-3xl md:text-4xl font-black text-bio-dark mb-6 leading-tight">
                Biohuertos Urbanos:<br />Cultivando Salud en Casa
              </h2>
              <p className="text-bio-muted text-base leading-relaxed mb-4">
                El proyecto nace de la Responsabilidad Social Universitaria de la USAT, trabajando de la mano
                con comunidades colindantes de Chiclayo para promover la agricultura ecológica urbana, la
                seguridad alimentaria y el bienestar familiar.
              </p>
              <p className="text-bio-muted text-base leading-relaxed mb-6">
                BioHuerto USAT es la plataforma digital que resuelve el problema de gestión artesanal de estos
                biohuertos: datos dispersos, falta de registro técnico y ausencia de canales de venta directa
                para los productores.
              </p>
              <Link
                to="/como-funciona"
                className="inline-flex items-center gap-2 bg-bio-main text-white font-black px-6 py-3 rounded-full hover:bg-bio-dark transition-all duration-200 text-sm"
              >
                Ver cómo funciona
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <FieldIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── MISIÓN Y VISIÓN ── */}
      <section className="py-16 px-4 bg-bio-pale">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-bio-main rounded-2xl flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L21 9L16.5 13.5L18 20L12 17L6 20L7.5 13.5L3 9L9 8L12 2Z" fill="white"/>
                </svg>
              </div>
              <h3 className="font-black text-bio-dark text-xl mb-3">Nuestra Misión</h3>
              <p className="text-bio-muted leading-relaxed">
                Digitalizar y fortalecer los biohuertos urbanos comunitarios mediante
                tecnología accesible e intuitiva, impulsando la agricultura ecológica
                en la región Lambayeque.
              </p>
            </div>
            <div className="bg-bio-dark rounded-2xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-bio-light/20 rounded-2xl flex items-center justify-center mb-5">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                  <path d="M12 3V7M12 17V21M3 12H7M17 12H21" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
                </svg>
              </div>
              <h3 className="font-black text-white text-xl mb-3">Nuestra Visión</h3>
              <p className="text-white/65 leading-relaxed">
                Ser el ecosistema digital de referencia para la agricultura urbana
                sostenible en la región Lambayeque al 2028.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALORES ── */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-bio-dark mb-3">
              Nuestros Valores
            </h2>
            <p className="text-bio-muted">Los principios que guían cada decisión del proyecto</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {VALORES.map(({ Icon, titulo, descripcion }) => (
              <div key={titulo} className="text-center p-8 rounded-2xl bg-bio-cream hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 bg-bio-pale rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Icon size={30} className="text-bio-main" />
                </div>
                <h3 className="font-black text-bio-dark text-xl mb-3">{titulo}</h3>
                <p className="text-bio-muted text-sm leading-relaxed">{descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LA ESCUELA ── */}
      <section
        className="py-20 px-4 text-white"
        style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-bio-light font-black text-xs uppercase tracking-widest mb-4">
            25 Años de excelencia
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-6">
            Escuela de Ingeniería de<br />Sistemas y Computación
          </h2>
          <p className="text-white/65 text-lg leading-relaxed mb-3">
            BioHuerto USAT fue desarrollado en el marco de la celebración de los
            <strong className="text-bio-light"> 25 años de la Escuela de Ingeniería de Sistemas y Computación</strong> de
            la Universidad Católica Santo Toribio de Mogrovejo.
          </p>
          <p className="text-white/50 text-base mb-10">
            Un proyecto que combina innovación tecnológica con responsabilidad social
            para transformar la realidad de las comunidades lambayecanas.
          </p>
          <a
            href="https://www.usat.edu.pe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-white/60 text-white font-black px-8 py-3 rounded-full hover:bg-white/10 hover:border-white transition-all duration-200"
          >
            Visitar sitio USAT
          </a>
        </div>
      </section>
    </div>
  )
}
