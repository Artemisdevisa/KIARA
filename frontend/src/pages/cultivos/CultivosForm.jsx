import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

const INIT = {
  biohuerto: '', nombre: '', fecha_siembra: '', etapa: 'germinacion',
  cantidad: '', unidad: 'm²', fecha_estimada_cosecha: '', notas: '', estado: 'activo'
}

export default function CultivosForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INIT)
  const [biohuertos, setBiohuertos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/biohuertos/').then(res => setBiohuertos(res.data)).catch(() => toast.error('Error al cargar biohuertos.'))
  }, [])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/cultivos/', form)
      toast.success('Cultivo registrado.')
      navigate('/cultivos')
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Error al guardar.')
    } finally {
      setLoading(false)
    }
  }

  const f = key => ({ value: form[key] || '', onChange: e => setForm({ ...form, [key]: e.target.value }) })

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/cultivos" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">Registrar cultivo</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biohuerto *</label>
            <select className="input-field" {...f('biohuerto')} required>
              <option value="">Seleccionar biohuerto...</option>
              {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especie / nombre del cultivo *</label>
            <input className="input-field" placeholder="Ej: Lechuga, Tomate cherry..." {...f('nombre')} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de siembra *</label>
              <input type="date" className="input-field" {...f('fecha_siembra')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha estimada cosecha *</label>
              <input type="date" className="input-field" {...f('fecha_estimada_cosecha')} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Etapa actual</label>
            <select className="input-field" {...f('etapa')}>
              <option value="germinacion">Germinación</option>
              <option value="crecimiento">Crecimiento</option>
              <option value="floracion">Floración</option>
              <option value="cosecha">Cosecha</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad / Área *</label>
              <input type="number" step="0.01" min="0" className="input-field" placeholder="Ej: 12" {...f('cantidad')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select className="input-field" {...f('unidad')}>
                <option value="m²">m²</option>
                <option value="plantas">plantas</option>
                <option value="kg">kg</option>
                <option value="macetas">macetas</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select className="input-field" {...f('estado')}>
              <option value="activo">Activo</option>
              <option value="cosechado">Cosechado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
            <textarea className="input-field resize-none" rows={3} placeholder="Observaciones, variedad, etc." {...f('notas')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Guardando...' : 'Registrar cultivo'}
            </button>
            <Link to="/cultivos" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
