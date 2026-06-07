import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import {
  Leaf, Search, Droplets, FlaskConical, Bug, Clock,
  RotateCcw, Lightbulb, X, AlertTriangle, ChevronDown
} from 'lucide-react'

const ICONOS = {
  riego:       { icon: Droplets,     color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',   label: 'Riego' },
  sustrato:    { icon: FlaskConical, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20', label: 'Sustrato / Abono' },
  plagas:      { icon: Bug,          color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',     label: 'Plagas comunes' },
  enfermedades:{ icon: AlertTriangle,color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20',label: 'Enfermedades comunes' },
  rotacion:    { icon: RotateCcw,    color: 'text-teal-500',   bg: 'bg-teal-50 dark:bg-teal-900/20',   label: 'Rotación sugerida' },
  tiempo:      { icon: Clock,        color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20',label: 'Tiempo de cosecha' },
}

function DetalleCard({ cultivo, mio, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-primary-100 dark:bg-primary-900/30 rounded-xl p-2.5">
              <Leaf size={20} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">{cultivo.nombre}</h2>
              {mio && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded-full mt-0.5">
                  <Leaf size={10} /> En mi biohuerto
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'riego',    value: cultivo.riego },
              { key: 'sustrato', value: cultivo.sustrato },
              { key: 'rotacion', value: cultivo.rotacion },
              { key: 'tiempo',   value: cultivo.tiempo_cosecha_dias },
            ].map(({ key, value }) => {
              const { icon: Icon, color, bg, label } = ICONOS[key]
              return (
                <div key={key} className={`${bg} rounded-xl p-4 flex items-start gap-3`}>
                  <Icon size={16} className={`${color} mt-0.5 shrink-0`} />
                  <div>
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{value}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Plagas */}
          <div className={`${ICONOS.plagas.bg} rounded-xl p-4 flex items-start gap-3`}>
            <Bug size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Plagas comunes</p>
              <div className="flex flex-wrap gap-1.5">
                {cultivo.plagas_comunes?.map(p => (
                  <span key={p} className="text-xs px-2.5 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">{p}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Enfermedades */}
          <div className={`${ICONOS.enfermedades.bg} rounded-xl p-4 flex items-start gap-3`}>
            <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-2">Enfermedades comunes</p>
              <div className="flex flex-wrap gap-1.5">
                {cultivo.enfermedades_comunes?.map(e => (
                  <span key={e} className="text-xs px-2.5 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium">{e}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Consejo extra */}
          {cultivo.consejo_extra && (
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl flex items-start gap-3 border border-primary-100 dark:border-primary-800">
              <Lightbulb size={16} className="text-primary-600 dark:text-primary-400 mt-0.5 shrink-0" />
              <p className="text-sm text-primary-800 dark:text-primary-300">{cultivo.consejo_extra}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecomendacionesPage() {
  const [recomendaciones, setRecomendaciones] = useState([])
  const [misCultivos, setMisCultivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/cultivos/data/recomendaciones/'),
      api.get('/cultivos/?estado=activo'),
    ]).then(([recRes, cultRes]) => {
      setRecomendaciones(recRes.data)
      setMisCultivos(cultRes.data.map(c => c.nombre.toLowerCase()))
    }).finally(() => setLoading(false))
  }, [])

  const lista = recomendaciones.filter(r => {
    const coincideBusqueda = r.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideFiltro = filtro === 'todos' || misCultivos.includes(r.nombre.toLowerCase())
    return coincideBusqueda && coincideFiltro
  })

  if (loading) return <Loading />

  const mioCultivo = seleccionado ? misCultivos.includes(seleccionado.nombre.toLowerCase()) : false

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Leaf size={24} className="text-primary-600" />
          Recomendaciones Agroecológicas
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Guía de manejo sostenible para cultivos de biohuertos urbanos en Lambayeque
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar cultivo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-400"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'todos', label: `Todos (${recomendaciones.length})` },
            { key: 'mios',  label: `Mis cultivos (${misCultivos.length})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                filtro === key
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla de cultivos */}
      {lista.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <Leaf size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No se encontraron cultivos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map(rec => {
            const esMio = misCultivos.includes(rec.nombre.toLowerCase())
            return (
              <button
                key={rec.nombre}
                onClick={() => setSeleccionado(rec)}
                className="text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl p-2 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 transition-colors">
                      <Leaf size={16} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{rec.nombre}</h3>
                  </div>
                  {esMio && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 shrink-0">
                      Mi cultivo
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={11} className="text-purple-400 shrink-0" />
                    <span className="line-clamp-1">{rec.tiempo_cosecha_dias}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Droplets size={11} className="text-blue-400 shrink-0" />
                    <span className="line-clamp-1">{rec.riego}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bug size={11} className="text-red-400 shrink-0" />
                    <span className="line-clamp-1">{rec.plagas_comunes?.slice(0, 2).join(', ')}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1 text-primary-600 dark:text-primary-400 text-xs font-semibold">
                  <ChevronDown size={13} className="group-hover:translate-y-0.5 transition-transform" />
                  Ver recomendaciones completas
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Modal detalle */}
      {seleccionado && (
        <DetalleCard
          cultivo={seleccionado}
          mio={mioCultivo}
          onClose={() => setSeleccionado(null)}
        />
      )}
    </div>
  )
}
