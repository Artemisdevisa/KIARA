import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import {
  Leaf, Search, Droplets, FlaskConical, Wrench, X,
  Clock, ChevronRight, Loader2, Calendar, Repeat2, Beaker
} from 'lucide-react'

const ETAPA_LABEL = {
  preparacion: 'Preparación', germinacion: 'Germinación', crecimiento: 'Crecimiento',
  establecido: 'Establecido', poda: 'Poda', brotacion: 'Brotación',
  floracion: 'Floración', cosecha: 'Cosecha',
}

function Badge({ children, color = 'gray' }) {
  const colors = {
    gray:  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300',
    blue:  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    green: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
    red:   'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
    cyan:  'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300',
  }
  return (
    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${colors[color]}`}>{children}</span>
  )
}

function SeccionVacia({ texto }) {
  return <p className="text-xs text-gray-400 dark:text-gray-600 text-center py-4">{texto}</p>
}

const ETAPAS_ORDEN = ['preparacion','germinacion','crecimiento','establecido','poda','brotacion','floracion','cosecha']

function agruparPorEtapa(items, campoEtapa = 'etapa') {
  const grupos = {}
  items.forEach(i => {
    const e = i[campoEtapa] || 'sin_etapa'
    if (!grupos[e]) grupos[e] = []
    grupos[e].push(i)
  })
  return Object.entries(grupos).sort(([a], [b]) => {
    const ia = ETAPAS_ORDEN.indexOf(a), ib = ETAPAS_ORDEN.indexOf(b)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })
}

function EtapaHeader({ etapa }) {
  const label = etapa === 'sin_etapa' ? 'General (todo el ciclo)' : (ETAPA_LABEL[etapa] ?? etapa)
  return (
    <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 dark:text-gray-500 mt-4 mb-2 px-1">
      {label}
    </p>
  )
}

function DetalleModal({ variedad, esMia, onClose }) {
  const [tab, setTab] = useState('labores')
  const [labores, setLabores] = useState([])
  const [fito, setFito]       = useState([])
  const [riego, setRiego]     = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const [l, f, r] = await Promise.all([
      api.get(`/campanas/variedades/${variedad.id}/plantilla-labores/`),
      api.get(`/campanas/variedades/${variedad.id}/plantilla-productos/`),
      api.get(`/campanas/variedades/${variedad.id}/plantilla-riego/`),
    ])
    setLabores(l.data)
    setFito(f.data)
    setRiego(r.data)
    setLoading(false)
  }, [variedad.id])

  useEffect(() => { load() }, [load])

  const TABS = [
    { key: 'labores', label: 'Labores',       icon: Wrench,       count: labores.length },
    { key: 'fito',    label: 'Fitosanitario', icon: FlaskConical, count: fito.length    },
    { key: 'riego',   label: 'Riego',         icon: Droplets,     count: riego.length   },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 dark:border-gray-800"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-2.5">
                <Leaf size={20} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-gray-800 dark:text-gray-100">
                    {variedad.cultivo} — {variedad.nombre}
                  </h2>
                  {esMia && <Badge color="green">En mi biohuerto</Badge>}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Plan completo para llegar a cosecha
                  {variedad.dias_ciclo ? ` en ~${variedad.dias_ciclo} días` : ''}
                  {variedad.tipo_ciclo ? ` · ciclo ${variedad.tipo_ciclo}` : ''}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors shrink-0">
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === t.key
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                <t.icon size={12} />
                {t.label}
                {!loading && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${tab === t.key ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" /> Cargando plan...
            </div>
          ) : (
            <>
              {/* ── LABORES ── */}
              {tab === 'labores' && (
                labores.length === 0 ? <SeccionVacia texto="Sin labores definidas para esta variedad" /> :
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Estas son las labores que debes realizar a lo largo del ciclo, ordenadas por etapa.
                    {labores.some(l => l.semana_relativa != null) && ' La semana indica cuándo ejecutarla desde el inicio.'}
                  </p>
                  {agruparPorEtapa(labores).map(([etapa, items]) => (
                    <div key={etapa}>
                      <EtapaHeader etapa={etapa} />
                      <div className="space-y-2">
                        {items.map(l => (
                          <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                            <Wrench size={14} className="text-blue-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{l.tipo_labor_nombre}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Realizar <strong>{l.cantidad} {l.tipo_labor_unidad}</strong>
                                {l.semana_relativa != null && <> en la <strong>semana {l.semana_relativa}</strong></>}
                                {l.costo_unitario > 0 && <> · costo ref. S/. {parseFloat(l.costo_unitario).toFixed(2)}/{l.tipo_labor_unidad}</>}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ── FITOSANITARIO ── */}
              {tab === 'fito' && (
                fito.length === 0 ? <SeccionVacia texto="Sin productos fitosanitarios definidos" /> :
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Productos recomendados para proteger y nutrir el cultivo. Aplica según la etapa y las condiciones del campo.
                  </p>
                  {agruparPorEtapa(fito).map(([etapa, items]) => (
                    <div key={etapa}>
                      <EtapaHeader etapa={etapa} />
                      <div className="space-y-2">
                        {items.map(f => (
                          <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                            <FlaskConical size={14} className="text-red-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{f.producto_nombre}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Aplicar <strong>{f.dosis} {f.unidad_codigo ?? f.producto_unidad}/m²</strong>
                                {f.objetivo_nombre && <> para <strong>{f.objetivo_nombre}</strong></>}
                                {f.plaga_nombre && <> contra <strong>{f.plaga_nombre}</strong></>}
                                {f.frecuencia_dias && <> · repetir cada <strong>{f.frecuencia_dias} días</strong></>}
                                {f.dias_antes_cosecha && <> · suspender <strong>{f.dias_antes_cosecha} días antes</strong> de cosechar</>}
                                {f.condicion_nombre && <> · solo si: {f.condicion_nombre}</>}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ── RIEGO ── */}
              {tab === 'riego' && (
                riego.length === 0 ? <SeccionVacia texto="Sin planes de riego definidos" /> :
                <>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Planes de riego recomendados según la etapa del cultivo.
                  </p>
                  {agruparPorEtapa(riego, 'etapa').map(([etapa, items]) => (
                    <div key={etapa}>
                      <EtapaHeader etapa={etapa} />
                      <div className="space-y-2">
                        {items.map(r => (
                          <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-900/30">
                            <Droplets size={14} className="text-cyan-500 mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{r.nombre}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                <strong>{r.metodo_display}</strong> · aplicar <strong>{r.litros_por_m2} L/m²</strong> cada <strong>{r.frecuencia_dias} días</strong>
                                {r.duracion_minutos && <> durante {r.duracion_minutos} min</>}
                                {r.semana_relativa != null && <> · desde la semana <strong>{r.semana_relativa}</strong></>}
                                {r.fertilizante_nombre && <> · fertirrigar con <strong>{r.fertilizante_nombre}</strong> {r.dosis_fertilizante} {r.fertilizante_unidad}</>}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecomendacionesPage() {
  const [variedades, setVariedades]   = useState([])
  const [misVariedades, setMisVariedades] = useState(new Set())
  const [loading, setLoading]         = useState(true)
  const [busqueda, setBusqueda]       = useState('')
  const [filtro, setFiltro]           = useState('todos')
  const [seleccionada, setSeleccionada] = useState(null)

  useEffect(() => {
    Promise.all([
      api.get('/campanas/variedades/'),
      api.get('/campanas/'),
    ]).then(([vRes, cRes]) => {
      setVariedades(vRes.data)
      setMisVariedades(new Set(cRes.data.map(c => c.variedad)))
    }).finally(() => setLoading(false))
  }, [])

  const lista = variedades.filter(v => {
    const texto = `${v.cultivo} ${v.nombre} ${v.subtipo ?? ''}`.toLowerCase()
    const coincide = texto.includes(busqueda.toLowerCase())
    const esMia = misVariedades.has(v.id)
    return coincide && (filtro === 'todos' || esMia)
  })

  if (loading) return <Loading />

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          <Leaf size={24} className="text-emerald-600" />
          Recomendaciones por variedad
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Planes de labores, fitosanitario y riego para llegar a cosecha
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar variedad o cultivo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>
        <div className="flex gap-2">
          {[
            { key: 'todos', label: `Todos (${variedades.length})` },
            { key: 'mios',  label: `Mis variedades (${misVariedades.size})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
                filtro === key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla */}
      {lista.length === 0 ? (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <Leaf size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No se encontraron variedades</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map(v => {
            const esMia = misVariedades.has(v.id)
            return (
              <button key={v.id} onClick={() => setSeleccionada(v)}
                className="text-left bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 transition-all duration-200 group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-2 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                      <Leaf size={16} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wide">{v.cultivo}</p>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100">{v.nombre}{v.subtipo ? ` · ${v.subtipo}` : ''}</h3>
                    </div>
                  </div>
                  {esMia && <Badge color="green">Mi variedad</Badge>}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {v.dias_ciclo && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={11} className="text-purple-400" /> {v.dias_ciclo} días
                    </span>
                  )}
                  {v.tipo_ciclo && (
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <Repeat2 size={11} className="text-teal-400" /> {v.tipo_ciclo}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  Ver planes de cultivo
                </div>
              </button>
            )
          })}
        </div>
      )}

      {seleccionada && (
        <DetalleModal
          variedad={seleccionada}
          esMia={misVariedades.has(seleccionada.id)}
          onClose={() => setSeleccionada(null)}
        />
      )}
    </div>
  )
}
