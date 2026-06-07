import { useState, useEffect } from 'react'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import toast from 'react-hot-toast'
import { Activity, Plus, Thermometer, Droplets, Sun } from 'lucide-react'

const LUMINOSIDAD_ICON = { alta: '☀️', media: '⛅', baja: '🌥️' }

export default function MonitoreoPage() {
  const [registros, setRegistros] = useState([])
  const [biohuertos, setBiohuertos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filtroBio, setFiltroBio] = useState('')
  const [form, setForm] = useState({
    biohuerto: '', fecha: new Date().toISOString().split('T')[0],
    humedad: '', temperatura: '', luminosidad: 'media', incidencias: ''
  })

  const cargar = () => {
    const params = filtroBio ? `?biohuerto=${filtroBio}` : ''
    Promise.all([
      api.get(`/monitoreo/${params}`),
      api.get('/biohuertos/'),
    ]).then(([m, b]) => {
      setRegistros(m.data)
      setBiohuertos(b.data)
    }).catch(() => toast.error('Error al cargar.')).finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [filtroBio])

  const guardar = async e => {
    e.preventDefault()
    try {
      await api.post('/monitoreo/', form)
      toast.success('Registro guardado.')
      setShowForm(false)
      setForm({ ...form, humedad: '', temperatura: '', incidencias: '' })
      cargar()
    } catch { toast.error('Error al guardar.') }
  }

  if (loading) return <Loading />

  const ultimo = registros[0]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Monitoreo del Biohuerto</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nuevo registro
        </button>
      </div>

      {/* Último registro */}
      {ultimo && (
        <div className="card border-l-4 border-blue-400">
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Último registro — {ultimo.fecha}</p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <Droplets size={20} className="text-blue-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{ultimo.humedad ?? '-'}%</p>
              <p className="text-xs text-gray-400">Humedad</p>
            </div>
            <div>
              <Thermometer size={20} className="text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{ultimo.temperatura ?? '-'}°C</p>
              <p className="text-xs text-gray-400">Temperatura</p>
            </div>
            <div>
              <Sun size={20} className="text-yellow-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-gray-800">{LUMINOSIDAD_ICON[ultimo.luminosidad]}</p>
              <p className="text-xs text-gray-400">{ultimo.luminosidad_display}</p>
            </div>
          </div>
          {ultimo.incidencias && (
            <p className="mt-3 text-sm text-gray-600 bg-yellow-50 p-2 rounded">📋 {ultimo.incidencias}</p>
          )}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card border border-primary-200">
          <h2 className="font-semibold text-gray-700 mb-4">Registrar variables del día</h2>
          <form onSubmit={guardar} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biohuerto *</label>
                <select className="input-field" value={form.biohuerto} onChange={e => setForm({ ...form, biohuerto: e.target.value })} required>
                  <option value="">Seleccionar...</option>
                  {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input type="date" className="input-field" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Humedad (%)</label>
                <input type="number" min="0" max="100" step="0.1" className="input-field" placeholder="65" value={form.humedad} onChange={e => setForm({ ...form, humedad: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura (°C)</label>
                <input type="number" step="0.1" className="input-field" placeholder="24" value={form.temperatura} onChange={e => setForm({ ...form, temperatura: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Luminosidad</label>
                <select className="input-field" value={form.luminosidad} onChange={e => setForm({ ...form, luminosidad: e.target.value })}>
                  <option value="alta">Alta ☀️</option>
                  <option value="media">Media ⛅</option>
                  <option value="baja">Baja 🌥️</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Incidencias / Novedades</label>
              <textarea className="input-field resize-none" rows={2} placeholder="Novedades del día..." value={form.incidencias} onChange={e => setForm({ ...form, incidencias: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-sm">Guardar registro</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Filtro */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-gray-600">Filtrar por biohuerto:</label>
        <select className="input-field max-w-xs text-sm" value={filtroBio} onChange={e => setFiltroBio(e.target.value)}>
          <option value="">Todos</option>
          {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
      </div>

      {/* Historial */}
      <div className="card overflow-x-auto">
        <h2 className="font-semibold text-gray-700 mb-3">Historial de registros</h2>
        {registros.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Sin registros de monitoreo.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                <th className="pb-2">Fecha</th>
                <th className="pb-2">Biohuerto</th>
                <th className="pb-2">Humedad</th>
                <th className="pb-2">Temp.</th>
                <th className="pb-2">Luz</th>
                <th className="pb-2">Incidencias</th>
              </tr>
            </thead>
            <tbody>
              {registros.map(r => (
                <tr key={r.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-2.5 text-gray-600">{r.fecha}</td>
                  <td className="py-2.5 text-gray-600 max-w-xs truncate">{r.biohuerto_nombre}</td>
                  <td className="py-2.5">{r.humedad != null ? `${r.humedad}%` : '-'}</td>
                  <td className="py-2.5">{r.temperatura != null ? `${r.temperatura}°C` : '-'}</td>
                  <td className="py-2.5">{LUMINOSIDAD_ICON[r.luminosidad]} {r.luminosidad_display}</td>
                  <td className="py-2.5 text-gray-400 max-w-xs truncate">{r.incidencias || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
