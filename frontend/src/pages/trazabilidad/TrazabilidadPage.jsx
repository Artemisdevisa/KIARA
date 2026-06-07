import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import toast from 'react-hot-toast'
import { LineChart, Plus, DollarSign, Leaf } from 'lucide-react'

const PRACTICAS_TIPOS = [
  { value: 'compost', label: '🌱 Uso de compost' },
  { value: 'biol', label: '💧 Uso de biol' },
  { value: 'sin_agroquimicos', label: '🚫 Sin agroquímicos' },
  { value: 'riego_eficiente', label: '💧 Riego eficiente' },
  { value: 'mulching', label: '🌿 Mulching' },
  { value: 'control_biologico', label: '🐞 Control biológico' },
  { value: 'otro', label: '📌 Otro' },
]

const COSTOS_CONCEPTOS = [
  { value: 'insumos', label: 'Insumos' },
  { value: 'agua', label: 'Agua' },
  { value: 'semillas', label: 'Semillas' },
  { value: 'mano_obra', label: 'Mano de obra' },
  { value: 'herramientas', label: 'Herramientas' },
  { value: 'otro', label: 'Otro' },
]

export default function TrazabilidadPage() {
  const [cultivos, setCultivos] = useState([])
  const [cultivoSel, setCultivoSel] = useState('')
  const [practicas, setPracticas] = useState([])
  const [costos, setCostos] = useState([])
  const [resumen, setResumen] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showFormPractica, setShowFormPractica] = useState(false)
  const [showFormCosto, setShowFormCosto] = useState(false)
  const [formP, setFormP] = useState({ cultivo: '', tipo: 'compost', fecha: new Date().toISOString().split('T')[0], descripcion: '' })
  const [formC, setFormC] = useState({ cultivo: '', concepto: 'insumos', monto: '', fecha: new Date().toISOString().split('T')[0], descripcion: '' })

  useEffect(() => {
    api.get('/cultivos/').then(res => setCultivos(res.data))
    cargarDatos()
  }, [])

  useEffect(() => {
    cargarDatos()
    if (cultivoSel) cargarResumen()
    else setResumen(null)
  }, [cultivoSel])

  const cargarDatos = () => {
    const params = cultivoSel ? `?cultivo=${cultivoSel}` : ''
    setLoading(true)
    Promise.all([
      api.get(`/trazabilidad/practicas/${params}`),
      api.get(`/trazabilidad/costos/${params}`),
    ]).then(([p, c]) => {
      setPracticas(p.data)
      setCostos(c.data)
    }).catch(() => toast.error('Error al cargar.')).finally(() => setLoading(false))
  }

  const cargarResumen = () => {
    api.get(`/trazabilidad/resumen/${cultivoSel}/`).then(res => setResumen(res.data))
  }

  const guardarPractica = async e => {
    e.preventDefault()
    await api.post('/trazabilidad/practicas/', { ...formP, cultivo: formP.cultivo || cultivoSel })
    toast.success('Práctica registrada.')
    setShowFormPractica(false)
    cargarDatos()
  }

  const guardarCosto = async e => {
    e.preventDefault()
    await api.post('/trazabilidad/costos/', { ...formC, cultivo: formC.cultivo || cultivoSel })
    toast.success('Costo registrado.')
    setShowFormCosto(false)
    cargarDatos()
    if (cultivoSel) cargarResumen()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <LineChart size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-800">Trazabilidad y Costos</h1>
      </div>

      {/* Filtro por cultivo */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600 shrink-0">Filtrar por cultivo:</label>
        <select className="input-field max-w-xs text-sm" value={cultivoSel} onChange={e => setCultivoSel(e.target.value)}>
          <option value="">Todos mis cultivos</option>
          {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {/* Resumen financiero */}
      {resumen && (
        <div className="card border-l-4 border-primary-500">
          <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <DollarSign size={16} className="text-primary-600" /> Resumen — {resumen.cultivo_nombre}
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-bold text-red-600">S/ {resumen.total_costos.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Costos totales</p>
            </div>
            <div>
              <p className="text-xl font-bold text-blue-600">S/ {resumen.total_ingresos.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Ingresos estimados</p>
            </div>
            <div>
              <p className={`text-xl font-bold ${resumen.ganancia_estimada >= 0 ? 'text-primary-600' : 'text-red-600'}`}>
                S/ {resumen.ganancia_estimada.toFixed(2)}
              </p>
              <p className="text-xs text-gray-400">Ganancia estimada</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Prácticas sostenibles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2"><Leaf size={16} className="text-primary-600" /> Prácticas sostenibles</h2>
            <button onClick={() => setShowFormPractica(!showFormPractica)} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={13} /> Registrar
            </button>
          </div>

          {showFormPractica && (
            <form onSubmit={guardarPractica} className="card border border-primary-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cultivo *</label>
                <select className="input-field text-sm" value={formP.cultivo} onChange={e => setFormP({ ...formP, cultivo: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Tipo *</label>
                  <select className="input-field text-sm" value={formP.tipo} onChange={e => setFormP({ ...formP, tipo: e.target.value })}>
                    {PRACTICAS_TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
                  <input type="date" className="input-field text-sm" value={formP.fecha} onChange={e => setFormP({ ...formP, fecha: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
                <textarea className="input-field text-sm resize-none" rows={2} value={formP.descripcion} onChange={e => setFormP({ ...formP, descripcion: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-xs">Guardar</button>
                <button type="button" onClick={() => setShowFormPractica(false)} className="btn-secondary text-xs">Cancelar</button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {practicas.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Sin prácticas registradas.</p> :
              practicas.map(p => (
                <div key={p.id} className="card py-3 px-4 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{p.tipo_display}</p>
                    <p className="text-xs text-gray-400">{p.cultivo_nombre} · {p.fecha}</p>
                    {p.descripcion && <p className="text-xs text-gray-500 mt-0.5">{p.descripcion}</p>}
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Costos de producción */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2"><DollarSign size={16} className="text-primary-600" /> Costos de producción</h2>
            <button onClick={() => setShowFormCosto(!showFormCosto)} className="btn-primary text-xs flex items-center gap-1">
              <Plus size={13} /> Registrar
            </button>
          </div>

          {showFormCosto && (
            <form onSubmit={guardarCosto} className="card border border-primary-200 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cultivo *</label>
                <select className="input-field text-sm" value={formC.cultivo} onChange={e => setFormC({ ...formC, cultivo: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Concepto *</label>
                  <select className="input-field text-sm" value={formC.concepto} onChange={e => setFormC({ ...formC, concepto: e.target.value })}>
                    {COSTOS_CONCEPTOS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Monto (S/) *</label>
                  <input type="number" step="0.01" min="0" className="input-field text-sm" placeholder="25.00" value={formC.monto} onChange={e => setFormC({ ...formC, monto: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" className="input-field text-sm" value={formC.fecha} onChange={e => setFormC({ ...formC, fecha: e.target.value })} required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-xs">Guardar</button>
                <button type="button" onClick={() => setShowFormCosto(false)} className="btn-secondary text-xs">Cancelar</button>
              </div>
            </form>
          )}

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {costos.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Sin costos registrados.</p> :
              costos.map(c => (
                <div key={c.id} className="card py-3 px-4 flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{c.concepto_display}</p>
                    <p className="text-xs text-gray-400">{c.cultivo_nombre} · {c.fecha}</p>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm">S/ {c.monto}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
