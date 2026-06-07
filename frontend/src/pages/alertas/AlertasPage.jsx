import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import toast from 'react-hot-toast'
import { Bell, Plus, CheckCircle, AlertTriangle, Clock } from 'lucide-react'

const TIPO_EMOJI = { riego: '💧', fertilizacion: '🌿', control: '🛡️', cosecha: '🌾', rotacion: '🔄', otro: '📌' }
const PRIORIDAD_COLOR = { alta: 'bg-red-100 text-red-700', media: 'bg-yellow-100 text-yellow-700', baja: 'bg-gray-100 text-gray-600' }

export default function AlertasPage() {
  const [alertas, setAlertas] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filtroPendientes, setFiltroPendientes] = useState(true)
  const [form, setForm] = useState({
    cultivo: '', tipo: 'riego', fecha_programada: '', descripcion: '', prioridad: 'media'
  })

  const cargar = () => {
    const params = filtroPendientes ? '?completada=false' : ''
    Promise.all([
      api.get(`/alertas/${params}`),
      api.get('/cultivos/?estado=activo'),
    ]).then(([a, c]) => {
      setAlertas(a.data)
      setCultivos(c.data)
    }).catch(() => toast.error('Error al cargar.')).finally(() => setLoading(false))
  }

  useEffect(() => { setLoading(true); cargar() }, [filtroPendientes])

  const completar = async (id) => {
    await api.post(`/alertas/${id}/completar/`)
    toast.success('Alerta marcada como completada.')
    cargar()
  }

  const guardar = async e => {
    e.preventDefault()
    try {
      await api.post('/alertas/', form)
      toast.success('Alerta creada.')
      setShowForm(false)
      cargar()
    } catch { toast.error('Error al guardar.') }
  }

  if (loading) return <Loading />

  const vencidas = alertas.filter(a => a.vencida).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Alertas y Recordatorios</h1>
          {vencidas > 0 && (
            <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
              <AlertTriangle size={14} /> {vencidas} alerta(s) vencida(s)
            </p>
          )}
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nueva alerta
        </button>
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        <button onClick={() => setFiltroPendientes(true)} className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${filtroPendientes ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>Pendientes</button>
        <button onClick={() => setFiltroPendientes(false)} className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${!filtroPendientes ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}>Todas</button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card border border-primary-200">
          <h2 className="font-semibold text-gray-700 mb-4">Nueva alerta</h2>
          <form onSubmit={guardar} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cultivo *</label>
                <select className="input-field" value={form.cultivo} onChange={e => setForm({ ...form, cultivo: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                <select className="input-field" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                  <option value="riego">💧 Riego</option>
                  <option value="fertilizacion">🌿 Fertilización orgánica</option>
                  <option value="control">🛡️ Control preventivo</option>
                  <option value="cosecha">🌾 Cosecha</option>
                  <option value="rotacion">🔄 Rotación de cultivos</option>
                  <option value="otro">📌 Otro</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y hora *</label>
                <input type="datetime-local" className="input-field" value={form.fecha_programada} onChange={e => setForm({ ...form, fecha_programada: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select className="input-field" value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })}>
                  <option value="alta">🔴 Alta</option>
                  <option value="media">🟡 Media</option>
                  <option value="baja">🟢 Baja</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción o nota</label>
              <textarea className="input-field resize-none" rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">Crear alerta</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de alertas */}
      {alertas.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Bell size={40} className="mx-auto mb-3 text-gray-200" />
          <p>Sin alertas {filtroPendientes ? 'pendientes' : ''}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertas.map(a => (
            <div key={a.id} className={`card flex items-start gap-4 ${a.vencida ? 'border-l-4 border-red-400' : 'border-l-4 border-transparent'} ${a.completada ? 'opacity-60' : ''}`}>
              <div className="text-2xl">{TIPO_EMOJI[a.tipo]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-gray-800">{a.tipo_display}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORIDAD_COLOR[a.prioridad]}`}>{a.prioridad_display}</span>
                  {a.vencida && <span className="badge-red flex items-center gap-1"><AlertTriangle size={10} /> Vencida</span>}
                  {a.completada && <span className="badge-green">✓ Completada</span>}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{a.cultivo_nombre}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <Clock size={11} /> {new Date(a.fecha_programada).toLocaleString('es-PE')}
                </p>
                {a.descripcion && <p className="text-xs text-gray-500 mt-1">{a.descripcion}</p>}
              </div>
              {!a.completada && (
                <button
                  onClick={() => completar(a.id)}
                  className="text-primary-600 hover:text-primary-800 shrink-0"
                  title="Marcar como completada"
                >
                  <CheckCircle size={22} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
