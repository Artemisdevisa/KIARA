import { useState, useEffect, useCallback } from 'react'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import { useTheme } from '../../context/ThemeContext'
import {
  Leaf, Search, Droplets, FlaskConical, Wrench, X,
  Clock, ChevronRight, Loader2, Repeat2,
} from 'lucide-react'

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  divider:     'rgba(255,255,255,0.07)',
  hoverRow:    'rgba(255,255,255,0.04)',
  btnIdle:     'rgba(255,255,255,0.07)',
  btnBorder:   'rgba(255,255,255,0.10)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

const ETAPA_LABEL = {
  preparacion: 'Preparación', germinacion: 'Germinación', crecimiento: 'Crecimiento',
  establecido: 'Establecido', poda: 'Poda', brotacion: 'Brotación',
  floracion: 'Floración', cosecha: 'Cosecha',
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

function EtapaHeader({ dark, etapa }) {
  const label = etapa === 'sin_etapa' ? 'General (todo el ciclo)' : (ETAPA_LABEL[etapa] ?? etapa)
  return (
    <p className="text-[10px] font-extrabold uppercase tracking-widest mt-4 mb-2 px-1"
      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
      {label}
    </p>
  )
}

function SeccionVacia({ dark, texto }) {
  return <p className="text-xs text-center py-4" style={{ color: dark ? D.sub : '#9ca3af' }}>{texto}</p>
}

function DetalleModal({ dark, variedad, esMia, onClose }) {
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

  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:pl-72 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl"
        style={panelStyle} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 shrink-0" style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl p-2.5 shrink-0"
                style={{ backgroundColor: dark ? 'rgba(74,222,128,0.12)' : '#f0fdf4' }}>
                <Leaf size={20} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                    {variedad.cultivo} — {variedad.nombre}
                  </h2>
                  {esMia && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: dark ? 'rgba(74,222,128,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>
                      En mi biohuerto
                    </span>
                  )}
                </div>
                <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#6b7280' }}>
                  Plan completo para llegar a cosecha
                  {variedad.dias_ciclo ? ` en ~${variedad.dias_ciclo} días` : ''}
                  {variedad.tipo_ciclo ? ` · ciclo ${variedad.tipo_ciclo}` : ''}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg shrink-0"
              style={{ color: D.sub }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={tab === t.key
                  ? { backgroundColor: '#16a34a', color: '#fff' }
                  : { color: dark ? D.sub : '#6b7280', backgroundColor: 'transparent' }}
                onMouseEnter={e => { if (tab !== t.key) e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}
                onMouseLeave={e => { if (tab !== t.key) e.currentTarget.style.backgroundColor = 'transparent' }}>
                <t.icon size={12} />
                {t.label}
                {!loading && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold"
                    style={tab === t.key
                      ? { backgroundColor: 'rgba(255,255,255,0.20)', color: '#fff' }
                      : { backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 px-6 py-4 thin-scroll">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2" style={{ color: dark ? D.sub : '#9ca3af' }}>
              <Loader2 size={18} className="animate-spin" /> Cargando plan...
            </div>
          ) : (
            <>
              {/* LABORES */}
              {tab === 'labores' && (
                labores.length === 0
                  ? <SeccionVacia dark={dark} texto="Sin labores definidas para esta variedad" />
                  : <>
                    <p className="text-xs mb-3" style={{ color: dark ? D.sub : '#6b7280' }}>
                      Labores ordenadas por etapa.
                      {labores.some(l => l.semana_relativa != null) && ' La semana indica cuándo ejecutarla desde el inicio.'}
                    </p>
                    {agruparPorEtapa(labores).map(([etapa, items]) => (
                      <div key={etapa}>
                        <EtapaHeader dark={dark} etapa={etapa} />
                        <div className="space-y-2">
                          {items.map(l => (
                            <div key={l.id} className="flex items-start gap-3 p-3 rounded-xl"
                              style={{ backgroundColor: dark ? 'rgba(96,165,250,0.08)' : '#eff6ff', border: `1px solid ${dark ? 'rgba(96,165,250,0.15)' : '#bfdbfe'}` }}>
                              <Wrench size={14} style={{ color: dark ? '#60a5fa' : '#3b82f6', marginTop: 2, flexShrink: 0 }} />
                              <div>
                                <p className="text-sm font-bold" style={{ color: dark ? D.text : '#111827' }}>{l.tipo_labor_nombre}</p>
                                <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#6b7280' }}>
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

              {/* FITOSANITARIO */}
              {tab === 'fito' && (
                fito.length === 0
                  ? <SeccionVacia dark={dark} texto="Sin productos fitosanitarios definidos" />
                  : <>
                    <p className="text-xs mb-3" style={{ color: dark ? D.sub : '#6b7280' }}>
                      Productos recomendados para proteger y nutrir el cultivo.
                    </p>
                    {agruparPorEtapa(fito).map(([etapa, items]) => (
                      <div key={etapa}>
                        <EtapaHeader dark={dark} etapa={etapa} />
                        <div className="space-y-2">
                          {items.map(f => (
                            <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl"
                              style={{ backgroundColor: dark ? 'rgba(248,113,113,0.08)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(248,113,113,0.15)' : '#fecaca'}` }}>
                              <FlaskConical size={14} style={{ color: dark ? '#f87171' : '#dc2626', marginTop: 2, flexShrink: 0 }} />
                              <div>
                                <p className="text-sm font-bold" style={{ color: dark ? D.text : '#111827' }}>{f.producto_nombre}</p>
                                <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#6b7280' }}>
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

              {/* RIEGO */}
              {tab === 'riego' && (
                riego.length === 0
                  ? <SeccionVacia dark={dark} texto="Sin planes de riego definidos" />
                  : <>
                    <p className="text-xs mb-3" style={{ color: dark ? D.sub : '#6b7280' }}>
                      Planes de riego recomendados según la etapa del cultivo.
                    </p>
                    {agruparPorEtapa(riego, 'etapa').map(([etapa, items]) => (
                      <div key={etapa}>
                        <EtapaHeader dark={dark} etapa={etapa} />
                        <div className="space-y-2">
                          {items.map(r => (
                            <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl"
                              style={{ backgroundColor: dark ? 'rgba(34,211,238,0.08)' : '#ecfeff', border: `1px solid ${dark ? 'rgba(34,211,238,0.15)' : '#a5f3fc'}` }}>
                              <Droplets size={14} style={{ color: dark ? '#22d3ee' : '#0891b2', marginTop: 2, flexShrink: 0 }} />
                              <div>
                                <p className="text-sm font-bold" style={{ color: dark ? D.text : '#111827' }}>{r.nombre}</p>
                                <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#6b7280' }}>
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
  const { dark } = useTheme()
  const [variedades, setVariedades]       = useState([])
  const [misVariedades, setMisVariedades] = useState(new Set())
  const [loading, setLoading]             = useState(true)
  const [busqueda, setBusqueda]           = useState('')
  const [filtro, setFiltro]               = useState('todos')
  const [seleccionada, setSeleccionada]   = useState(null)

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

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  const ist = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    borderRadius: '10px', padding: '9px 13px', fontSize: '14px',
    outline: 'none', width: '100%', height: '40px',
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(74,222,128,0.12)' : '#f0fdf4' }}>
            <Leaf size={19} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
              Recomendaciones
            </h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {variedades.length} variedad{variedades.length !== 1 ? 'es' : ''} con planes de cultivo
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input
            type="text"
            placeholder="Buscar variedad o cultivo..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ ...ist, paddingLeft: '36px' }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { key: 'todos', label: `Todos (${variedades.length})` },
            { key: 'mios',  label: `Mis variedades (${misVariedades.size})` },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: filtro === key ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${filtro === key ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: filtro === key ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grilla */}
      {lista.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <Leaf size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
          <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron variedades</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lista.map(v => {
            const esMia = misVariedades.has(v.id)
            return (
              <button key={v.id} onClick={() => setSeleccionada(v)}
                className="text-left rounded-2xl p-5 transition-all duration-200 group"
                style={{
                  backgroundColor: dark ? D.cardBg : '#ffffff',
                  border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
                  borderRadius: '16px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = dark ? 'rgba(74,222,128,0.06)' : '#f0fdf4'
                  e.currentTarget.style.borderColor = dark ? 'rgba(74,222,128,0.25)' : '#86efac'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = dark ? D.cardBg : '#ffffff'
                  e.currentTarget.style.borderColor = dark ? D.cardBorder : '#e5e7eb'
                }}>

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="rounded-xl p-2 shrink-0"
                      style={{ backgroundColor: dark ? 'rgba(74,222,128,0.12)' : '#f0fdf4' }}>
                      <Leaf size={16} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide" style={{ color: dark ? D.sub : '#9ca3af' }}>{v.cultivo}</p>
                      <h3 className="font-bold text-sm" style={{ color: dark ? D.text : '#111827' }}>
                        {v.nombre}{v.subtipo ? ` · ${v.subtipo}` : ''}
                      </h3>
                    </div>
                  </div>
                  {esMia && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: dark ? 'rgba(74,222,128,0.15)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }}>
                      Mi variedad
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 mb-4">
                  {v.dias_ciclo && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                      <Clock size={11} style={{ color: dark ? '#a78bfa' : '#7c3aed' }} /> {v.dias_ciclo} días
                    </span>
                  )}
                  {v.tipo_ciclo && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                      <Repeat2 size={11} style={{ color: dark ? '#34d399' : '#059669' }} /> {v.tipo_ciclo}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold"
                  style={{ color: dark ? '#4ade80' : '#16a34a' }}>
                  <ChevronRight size={13} />
                  Ver planes de cultivo
                </div>
              </button>
            )
          })}
        </div>
      )}

      {seleccionada && (
        <DetalleModal
          dark={dark}
          variedad={seleccionada}
          esMia={misVariedades.has(seleccionada.id)}
          onClose={() => setSeleccionada(null)}
        />
      )}
    </div>
  )
}
