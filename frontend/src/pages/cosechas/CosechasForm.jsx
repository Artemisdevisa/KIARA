import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload } from 'lucide-react'

const INIT = {
  campana: '', nombre_producto: '', cantidad: '',
  unidad: 'kg', precio: '', fecha_cosecha: '', contacto: '',
}

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

export default function CosechasForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { dark } = useTheme()
  const { user } = useAuth()
  const [form, setForm]         = useState({ ...INIT, campana: searchParams.get('campana') || '', contacto: '' })
  const [foto, setFoto]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    api.get('/campanas/').then(res => setCampanas(res.data)).catch(() => {})
  }, [])

  useEffect(() => {
    if (user?.telefono) {
      setForm(f => ({ ...f, contacto: f.contacto || user.telefono }))
    }
  }, [user])

  // Cuando se selecciona una campaña, pre-rellenar nombre del producto
  useEffect(() => {
    if (form.campana) {
      const c = campanas.find(c => String(c.id) === String(form.campana))
      if (c && !form.nombre_producto) {
        setForm(f => ({ ...f, nombre_producto: c.variedad_str || '' }))
      }
    }
  }, [form.campana, campanas])

  const handleFoto = e => {
    const file = e.target.files[0]
    if (file) { setFoto(file); setPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      // Obtener biohuerto de la campaña seleccionada
      const campana = campanas.find(c => String(c.id) === String(form.campana))
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v) })
      if (campana?.biohuerto) data.append('biohuerto', campana.biohuerto)
      if (foto) data.append('foto', foto)
      await api.post('/cosechas/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Cosecha publicada.')
      navigate('/cosechas')
    } catch (err) {
      const errors = err.response?.data
      if (errors) Object.values(errors).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al publicar.')
    } finally { setLoading(false) }
  }

  const h = key => ({ value: form[key] || '', onChange: e => setForm({ ...form, [key]: e.target.value }) })

  const ist = {
    width: '100%', padding: '9px 13px', fontSize: '13px', borderRadius: '10px',
    outline: 'none', backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#374151',
  }
  const lst = { display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px', color: dark ? D.sub : '#6b7280' }

  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '20px', padding: '24px',
  }

  return (
    <div className="max-w-xl mx-auto space-y-5">
      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <Link to="/cosechas" style={{ color: dark ? D.sub : '#9ca3af' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Publicar cosecha</h1>
          <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>Registra y publica tu producción</p>
        </div>
      </div>

      <div style={panelStyle}>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Campaña */}
          <div>
            <label style={lst}>Campaña *</label>
            <select style={ist} {...h('campana')} required>
              <option value="">Seleccionar campaña...</option>
              {campanas.map(c => (
                <option key={c.id} value={c.id}>
                  {c.variedad_str} — {c.biohuerto_nombre} ({c.estado_display})
                </option>
              ))}
            </select>
          </div>

          {/* Nombre producto */}
          <div>
            <label style={lst}>Nombre del producto *</label>
            <input style={ist} placeholder="Ej: Lechuga Crespa Verde orgánica" {...h('nombre_producto')} required />
          </div>

          {/* Cantidad + unidad */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label style={lst}>Cantidad *</label>
              <input type="number" step="0.1" min="0" style={ist} placeholder="5" {...h('cantidad')} required />
            </div>
            <div>
              <label style={lst}>Unidad</label>
              <select style={ist} {...h('unidad')}>
                <option value="kg">kg</option>
                <option value="unidades">Unidades</option>
                <option value="atados">Atados</option>
                <option value="cajas">Cajas</option>
              </select>
            </div>
          </div>

          {/* Precio + Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label style={lst}>Precio (S/.) *</label>
              <input type="number" step="0.01" min="0" style={ist} placeholder="8.00" {...h('precio')} required />
            </div>
            <div>
              <label style={lst}>Fecha de cosecha *</label>
              <input type="date" style={ist} {...h('fecha_cosecha')} required />
            </div>
          </div>

          {/* Contacto */}
          <div>
            <label style={lst}>Contacto (teléfono / WhatsApp) *</label>
            <input style={ist} placeholder="WhatsApp: 979123456" {...h('contacto')} required />
          </div>

          {/* Foto */}
          <div>
            <label style={lst}>Foto del producto</label>
            <div style={{
              border: `2px dashed ${dark ? D.inputBorder : '#d1d5db'}`,
              borderRadius: '12px', padding: '16px', textAlign: 'center',
            }}>
              {preview
                ? <img src={preview} alt="preview" className="max-h-40 mx-auto rounded-lg object-cover mb-2" />
                : <div className="mb-2">
                    <Upload size={28} className="mx-auto mb-1" style={{ color: dark ? D.sub : '#9ca3af' }} />
                    <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>Clic para seleccionar imagen</p>
                  </div>
              }
              <input type="file" accept="image/*" onChange={handleFoto} className="hidden" id="foto-input" />
              <label htmlFor="foto-input"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6', color: dark ? D.sub : '#6b7280' }}>
                {preview ? 'Cambiar foto' : 'Seleccionar foto'}
              </label>
            </div>
          </div>

          {/* Botones */}
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
