import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload } from 'lucide-react'

const INIT = {
  biohuerto: '', cultivo: '', nombre_producto: '', cantidad: '',
  unidad: 'kg', precio: '', fecha_cosecha: '', contacto: '', estado: 'disponible'
}

export default function CosechasForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INIT)
  const [foto, setFoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [biohuertos, setBiohuertos] = useState([])
  const [cultivos, setCultivos] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/biohuertos/').then(res => setBiohuertos(res.data))
  }, [])

  useEffect(() => {
    if (form.biohuerto) {
      api.get(`/cultivos/?biohuerto=${form.biohuerto}`).then(res => setCultivos(res.data))
    }
  }, [form.biohuerto])

  const handleFoto = e => {
    const file = e.target.files[0]
    if (file) {
      setFoto(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v) })
      if (foto) data.append('foto', foto)
      await api.post('/cosechas/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Cosecha publicada.')
      navigate('/cosechas')
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(m => toast.error(m))
      else toast.error('Error al publicar.')
    } finally {
      setLoading(false)
    }
  }

  const f = key => ({ value: form[key] || '', onChange: e => setForm({ ...form, [key]: e.target.value }) })

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/cosechas" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">Publicar cosecha</h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Foto del producto</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-primary-400 transition-colors">
              {preview ? (
                <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-cover" />
              ) : (
                <div className="text-gray-400">
                  <Upload size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Clic para seleccionar imagen</p>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" id="foto-input" />
              <label htmlFor="foto-input" className="mt-2 btn-secondary text-xs cursor-pointer inline-block">
                {preview ? 'Cambiar foto' : 'Seleccionar foto'}
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto *</label>
            <input className="input-field" placeholder="Ej: Tomate cherry orgánico" {...f('nombre_producto')} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Biohuerto *</label>
              <select className="input-field" {...f('biohuerto')} required>
                <option value="">Seleccionar...</option>
                {biohuertos.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cultivo (opcional)</label>
              <select className="input-field" {...f('cultivo')}>
                <option value="">Sin asociar</option>
                {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
              <input type="number" step="0.1" min="0" className="input-field" placeholder="5" {...f('cantidad')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unidad</label>
              <select className="input-field" {...f('unidad')}>
                <option value="kg">kg</option>
                <option value="unidades">Unidades</option>
                <option value="atados">Atados</option>
                <option value="cajas">Cajas</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Precio (S/) *</label>
              <input type="number" step="0.01" min="0" className="input-field" placeholder="8.00" {...f('precio')} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cosecha *</label>
              <input type="date" className="input-field" {...f('fecha_cosecha')} required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contacto (teléfono / WhatsApp) *</label>
            <input className="input-field" placeholder="WhatsApp: 979123456" {...f('contacto')} required />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Publicando...' : 'Publicar cosecha'}
            </button>
            <Link to="/cosechas" className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
