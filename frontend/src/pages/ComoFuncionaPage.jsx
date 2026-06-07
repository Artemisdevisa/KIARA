import { useState } from 'react'
import { Link } from 'react-router-dom'

function LeafPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="cf-leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M15 40 C15 25 30 14 38 22 C46 30 36 48 15 40Z" fill="white" opacity="0.06" transform="rotate(10 26 31)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#cf-leaves)"/>
    </svg>
  )
}

const PASOS_PRODUCTOR = [
  {
    numero: '01',
    titulo: 'Regístrate como productor',
    descripcion: 'Crea tu cuenta en menos de 2 minutos con tus datos básicos. Completamente gratis.',
  },
  {
    numero: '02',
    titulo: 'Crea tu biohuerto',
    descripcion: 'Registra tu espacio, ubicación y área disponible. Puedes tener varios biohuertos.',
  },
  {
    numero: '03',
    titulo: 'Gestiona tus cultivos',
    descripcion: 'Registra siembras, monitorea etapas (germinación, crecimiento, floración, cosecha) y recibe alertas automáticas.',
  },
  {
    numero: '04',
    titulo: 'Diagnostica problemas',
    descripcion: 'Usa nuestro formulario guiado paso a paso para identificar plagas o enfermedades y recibe recomendaciones orgánicas.',
  },
  {
    numero: '05',
    titulo: 'Publica tu cosecha',
    descripcion: 'Comparte lo que produces con foto, precio y contacto. Los consumidores te contactarán directo por WhatsApp.',
  },
  {
    numero: '06',
    titulo: 'Descarga tu reporte',
    descripcion: 'Revisa indicadores del semáforo ambiental y exporta el resumen PDF de tu campaña productiva.',
  },
]

const PASOS_CONSUMIDOR = [
  {
    numero: '01',
    titulo: 'Explora el Marketplace',
    descripcion: 'Sin registro ni contraseña. Navega libremente por las cosechas disponibles de Chiclayo y Lambayeque.',
  },
  {
    numero: '02',
    titulo: 'Encuentra tu producto',
    descripcion: 'Filtra por nombre de producto y ordena por precio. Encuentra exactamente lo que necesitas.',
  },
  {
    numero: '03',
    titulo: 'Contacta al productor',
    descripcion: 'Escríbele directamente por WhatsApp y coordina la entrega. Simple, directo y sin intermediarios.',
  },
]

const FAQS = [
  {
    pregunta: '¿Es gratis usar BioHuerto USAT?',
    respuesta: 'Sí, completamente gratuito. La plataforma es un proyecto de responsabilidad social universitaria de la USAT. No hay costos de registro, membresía ni comisiones por publicar cosechas.',
  },
  {
    pregunta: '¿Necesito tener experiencia en tecnología?',
    respuesta: 'No. La plataforma fue diseñada para ser simple e intuitiva, pensando en productores sin conocimientos técnicos previos. Si puedes usar WhatsApp, puedes usar BioHuerto USAT.',
  },
  {
    pregunta: '¿Puedo registrar más de un biohuerto?',
    respuesta: 'Sí. Un mismo productor puede gestionar varios biohuertos desde su cuenta. Cada biohuerto tiene sus propios cultivos, alertas y registros de monitoreo independientes.',
  },
  {
    pregunta: '¿Cómo se hace el pago de las cosechas?',
    respuesta: 'El pago es coordinado directamente entre productor y consumidor. BioHuerto USAT solo facilita la conexión. Los productores pueden aceptar efectivo, Yape, Plin u otros métodos que acuerden.',
  },
  {
    pregunta: '¿Quién puede participar como productor?',
    respuesta: 'Cualquier persona de Chiclayo o Lambayeque que tenga un biohuerto urbano activo, ya sea en casa, jardín, azotea o huerto comunitario. El proyecto prioriza productores de comunidades vinculadas a la USAT.',
  },
]

/* Componente de paso numerado */
function Paso({ numero, titulo, descripcion, isLast }) {
  return (
    <div className="flex gap-5 relative">
      {/* Línea conectora */}
      {!isLast && (
        <div className="absolute left-7 top-14 w-0.5 h-full bg-bio-pale -z-10" />
      )}
      {/* Número */}
      <div className="flex-shrink-0 w-14 h-14 bg-bio-dark rounded-2xl flex items-center justify-center shadow-sm">
        <span className="font-black text-bio-light text-sm">{numero}</span>
      </div>
      {/* Contenido */}
      <div className="pb-10">
        <h3 className="font-black text-bio-dark text-lg mb-1.5">{titulo}</h3>
        <p className="text-bio-muted text-sm leading-relaxed">{descripcion}</p>
      </div>
    </div>
  )
}

/* Componente FAQ accordion */
function FaqItem({ pregunta, respuesta }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-bold text-bio-dark text-base">{pregunta}</span>
        <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-bio-main text-white rotate-45' : 'bg-bio-pale text-bio-main'}`}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </span>
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-48 pb-5' : 'max-h-0'}`}>
        <p className="text-bio-muted text-sm leading-relaxed pr-10">{respuesta}</p>
      </div>
    </div>
  )
}

export default function ComoFuncionaPage() {
  const [tab, setTab] = useState('productor')

  return (
    <div className="bg-bio-cream">

      {/* ── HERO INTERNO ── */}
      <section
        className="relative h-[300px] flex items-center justify-center overflow-hidden px-4"
        style={{ background: 'linear-gradient(135deg, #2D6A4F 0%, #52B788 100%)' }}
      >
        <LeafPattern />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">¿Cómo Funciona?</h1>
          <p className="text-white/70 text-lg font-semibold">
            Simple, intuitivo y diseñado para productores reales
          </p>
        </div>
      </section>

      {/* ── PASOS CON TABS ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-3 mb-12 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 max-w-sm mx-auto">
            {[
              { key: 'productor', label: 'Soy Productor' },
              { key: 'consumidor', label: 'Soy Consumidor' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all duration-200 ${
                  tab === key
                    ? 'bg-bio-main text-white shadow-sm'
                    : 'text-bio-muted hover:text-bio-dark'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Pasos productor */}
          {tab === 'productor' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-bio-dark mb-8 text-center">
                Tu camino como productor
              </h2>
              {PASOS_PRODUCTOR.map((paso, i) => (
                <Paso
                  key={paso.numero}
                  {...paso}
                  isLast={i === PASOS_PRODUCTOR.length - 1}
                />
              ))}
              <div className="mt-4 text-center">
                <Link
                  to="/register"
                  className="inline-block bg-bio-main text-white font-black px-8 py-3.5 rounded-full hover:bg-bio-dark transition-all duration-200"
                >
                  Registrarme ahora — Es gratis
                </Link>
              </div>
            </div>
          )}

          {/* Pasos consumidor */}
          {tab === 'consumidor' && (
            <div className="max-w-2xl mx-auto">
              <h2 className="text-2xl font-black text-bio-dark mb-8 text-center">
                Tu camino como consumidor
              </h2>
              {PASOS_CONSUMIDOR.map((paso, i) => (
                <Paso
                  key={paso.numero}
                  {...paso}
                  isLast={i === PASOS_CONSUMIDOR.length - 1}
                />
              ))}
              <div className="mt-4 text-center">
                <Link
                  to="/marketplace"
                  className="inline-block bg-bio-main text-white font-black px-8 py-3.5 rounded-full hover:bg-bio-dark transition-all duration-200"
                >
                  Ir al Marketplace
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-bio-dark mb-3">
              Preguntas frecuentes
            </h2>
            <p className="text-bio-muted">Todo lo que necesitas saber antes de empezar</p>
          </div>
          <div className="bg-bio-cream rounded-2xl px-6 divide-y divide-transparent">
            {FAQS.map(faq => (
              <FaqItem key={faq.pregunta} {...faq} />
            ))}
          </div>
          <p className="text-center mt-8 text-bio-muted text-sm">
            ¿Tienes otra pregunta?{' '}
            <Link to="/contacto" className="text-bio-main font-black hover:underline">
              Escríbenos
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
