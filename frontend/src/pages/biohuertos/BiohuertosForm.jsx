import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

const INIT = { nombre: '', codigo: '', ubicacion: '', area: '', descripcion: '' }

export default function BiohuertosForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(INIT)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      api.get(`/biohuertos/${id}/`).then(res => setForm(res.data)).catch(() => toast.error('Error al cargar.'))
    }
  }, [id])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      if (id) {
        await api.put(`/biohuertos/${id}/`, form)
        toast.success('Biohuerto actualizado.')
      } else {
        await api.post('/biohuertos/', form)
        toast.success('Biohuerto creado.')
      }
      navigate('/biohuertos')
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
        <Link to="/biohuertos" className="text-gray-400 hover:text-gray-600">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">{id ? 'Editar biohuerto' : 'Nuevo biohuerto'}</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del biohuerto *</label>
            <input className="input-field" placeholder="Ej: Biohuerto USAT Norte" {...f('nombre')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Código (opcional)</label>
            <input className="input-field" placeholder="Ej: BH-001" {...f('codigo')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación de referencia *</label>
            <textarea
              className="input-field resize-none"
              rows={2}
              placeholder="Ej: Urb. Latina, calle Los Pinos 234, Chiclayo"
              {...f('ubicacion')}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Área disponible (m²) *</label>
            <input type="number" step="0.01" min="0" className="input-field" placeholder="Ej: 45.5" {...f('area')} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción general</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Descripción breve del biohuerto..."
              {...f('descripcion')}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Guardando...' : id ? 'Actualizar' : 'Crear biohuerto'}
            </button>
            <Link to="/biohuertos" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
