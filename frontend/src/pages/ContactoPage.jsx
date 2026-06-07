import { useState } from 'react'

function LeafPattern() {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="ct-leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M15 40 C15 25 30 14 38 22 C46 30 36 48 15 40Z" fill="white" opacity="0.06" transform="rotate(10 26 31)"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#ct-leaves)"/>
    </svg>
  )
}

/* Ícono de sobre/email SVG */
function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="5" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M2 7L11 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

/* Ícono de institución */
function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="8" width="16" height="12" rx="1" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 20V14H14V20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 8V5L11 2L15 5V8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

/* Ícono de reloj */
function ClockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M11 6V11L14.5 14.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
}

const TIPOS_CONSULTA = [
  { value: '', label: 'Selecciona el tipo de consulta...' },
  { value: 'productor', label: 'Soy productor' },
  { value: 'consumidor', label: 'Soy consumidor' },
  { value: 'tecnica', label: 'Consulta técnica' },
  { value: 'otro', label: 'Otro' },
]

export default function ContactoPage() {
  const [form, setForm] = useState({ nombre: '', email: '', tipo: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)
  const [errors, setErrors] = useState({})

  const validar = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre es requerido'
    if (!form.email.trim()) errs.email = 'El correo es requerido'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Correo inválido'
    if (!form.tipo) errs.tipo = 'Selecciona el tipo de consulta'
    if (!form.mensaje.trim()) errs.mensaje = 'El mensaje es requerido'
    return errs
  }

  const handleSubmit = e => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setEnviado(true)
  }

  const f = key => ({
    value: form[key],
    onChange: e => {
      setForm(prev => ({ ...prev, [key]: e.target.value }))
      setErrors(prev => ({ ...prev, [key]: undefined }))
    },
  })

  return (
    <div className="bg-bio-cream">

      {/* ── HERO INTERNO ── */}
      <section
        className="relative h-[280px] flex items-center justify-center overflow-hidden px-4"
        style={{ background: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)' }}
      >
        <LeafPattern />
        <div className="relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Contáctanos</h1>
          <p className="text-white/70 text-lg font-semibold">
            Estamos aquí para ayudarte
          </p>
        </div>
      </section>

      {/* ── LAYOUT 2 COLUMNAS ── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

            {/* ── Columna izquierda: info ── */}
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-bio-dark mb-4">
                ¿Tienes alguna consulta?
              </h2>
              <p className="text-bio-muted leading-relaxed mb-8">
                Si eres productor urbano de Chiclayo y quieres unirte a la plataforma,
                si eres consumidor y tienes dudas sobre las cosechas, o si tienes algún
                comentario técnico sobre BioHuerto USAT, estamos disponibles para ayudarte.
              </p>

              {/* Cards de contacto */}
              <div className="space-y-4">
                {[
                  {
                    Icon: MailIcon,
                    label: 'Correo electrónico',
                    value: 'kreyes@usat.edu.pe',
                    href: 'mailto:kreyes@usat.edu.pe',
                  },
                  {
                    Icon: BuildingIcon,
                    label: 'Institución',
                    value: 'Escuela de Ingeniería de Sistemas y Computación — USAT, Chiclayo',
                    href: null,
                  },
                  {
                    Icon: ClockIcon,
                    label: 'Horario de atención',
                    value: 'Lunes a Viernes, 8:00 am — 5:00 pm',
                    href: null,
                  },
                ].map(({ Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-4 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-bio-pale rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon className="text-bio-main" />
                    </div>
                    <div>
                      <p className="text-bio-muted text-xs font-black uppercase tracking-wide mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-bio-main font-bold text-sm hover:text-bio-dark transition-colors">
                          {value}
                        </a>
                      ) : (
                        <p className="text-bio-dark font-semibold text-sm leading-snug">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Columna derecha: formulario ── */}
            <div>
              {enviado ? (
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
                  <div className="w-16 h-16 bg-bio-pale rounded-full flex items-center justify-center mx-auto mb-5">
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <circle cx="14" cy="14" r="12" fill="#2D6A4F"/>
                      <path d="M8 14L12 18L20 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-black text-bio-dark text-xl mb-2">¡Mensaje enviado!</h3>
                  <p className="text-bio-muted text-sm mb-6">
                    Gracias por contactarnos. Te responderemos pronto a tu correo.
                  </p>
                  <button
                    onClick={() => { setEnviado(false); setForm({ nombre: '', email: '', tipo: '', mensaje: '' }) }}
                    className="text-bio-main font-black text-sm hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
                  <h3 className="font-black text-bio-dark text-xl mb-6">Envíanos un mensaje</h3>
                  <form onSubmit={handleSubmit} noValidate className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-bio-dark mb-1.5">
                        Nombre completo <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Tu nombre completo"
                        className={`input-field ${errors.nombre ? 'border-red-300 focus:ring-red-300' : ''}`}
                        {...f('nombre')}
                      />
                      {errors.nombre && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.nombre}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-black text-bio-dark mb-1.5">
                        Correo electrónico <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="tu@correo.com"
                        className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-300' : ''}`}
                        {...f('email')}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-black text-bio-dark mb-1.5">
                        Tipo de consulta <span className="text-red-400">*</span>
                      </label>
                      <select
                        className={`input-field ${errors.tipo ? 'border-red-300 focus:ring-red-300' : ''}`}
                        {...f('tipo')}
                      >
                        {TIPOS_CONSULTA.map(t => (
                          <option key={t.value} value={t.value} disabled={t.value === ''}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                      {errors.tipo && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.tipo}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-black text-bio-dark mb-1.5">
                        Mensaje <span className="text-red-400">*</span>
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Cuéntanos en qué podemos ayudarte..."
                        className={`input-field resize-none ${errors.mensaje ? 'border-red-300 focus:ring-red-300' : ''}`}
                        {...f('mensaje')}
                      />
                      {errors.mensaje && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.mensaje}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-bio-main text-white font-black py-3.5 rounded-2xl hover:bg-bio-dark transition-all duration-200 text-base shadow-sm"
                    >
                      Enviar mensaje
                    </button>
                    <p className="text-bio-muted text-xs text-center">
                      También puedes escribir directamente a{' '}
                      <a href="mailto:kreyes@usat.edu.pe" className="text-bio-main font-bold hover:underline">
                        kreyes@usat.edu.pe
                      </a>
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
