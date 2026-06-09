import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { ArrowLeft, Upload, Leaf, TrendingUp, Info } from 'lucide-react'

const INIT = {
  campana: '', nombre_producto: '', cantidad: '',
  unidad: 'kg', precio: '', fecha_cosecha: '', contacto: '',
}

const D = {
  cardBg: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.09)',
  inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)',
  text: 'rgba(255,255,255,0.90)', sub: 'rgba(255,255,255,0.45)',
}

const fmt = n => `S/. ${parseFloat(n || 0).toFixed(2)}`

export default function CosechasForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { dark } = useTheme()
  const { user } = useAuth()

  const campanaIdParam = searchParams.get('campana') || ''

  const [form, setForm]         = useState({ ...INIT, campana: campanaIdParam, contacto: '' })
  const [foto, setFoto]         = useState(null)
  const [preview, setPreview]   = useState(null)
  const [campanas, setCampanas] = useState([])
  const [loading, setLoading]   = useState(false)

  const campanaFija = campanaIdParam
    ? campanas.find(c => String(c.id) === campanaIdParam)
    : null

  useEffect(() => {
    api.get('/campanas/').then(res => setCampanas(res.data)).catch(() => {})
  }, [])

  // Pre-rellenar desde la campaña: nombre, cantidad objetivo, precio estimado
  useEffect(() => {
    if (!campanaFija) return
    setForm(f => ({
      ...f,
      nombre_producto: f.nombre_producto || campanaFija.variedad_str || '',
      cantidad:        f.cantidad        || (campanaFija.objetivo_cosecha ? String(campanaFija.objetivo_cosecha) : ''),
      unidad:          campanaFija.unidad_cosecha || f.unidad,
      precio:          f.precio          || (campanaFija.precio_venta_estimado ? String(campanaFija.precio_venta_estimado) : ''),
    }))
  }, [campanaFija])

  // Pre-rellenar nombre desde campaña seleccionada en el selector libre
  useEffect(() => {
    if (campanaIdParam) return
    if (form.campana) {
      const c = campanas.find(c => String(c.id) === String(form.campana))
      if (c && !form.nombre_producto) {
        setForm(f => ({ ...f, nombre_producto: c.variedad_str || '' }))
      }
    }
  }, [form.campana, campanas])

  // Pre-rellenar contacto con el teléfono del usuario
  useEffect(() => {
    if (user?.telefono) {
      setForm(f => ({ ...f, contacto: f.contacto || user.telefono }))
    }
  }, [user])

  // Cálculo en vivo
  const qty    = parseFloat(form.cantidad) || 0
  const precio = parseFloat(form.precio)   || 0
  const ingreso = qty * precio

  // Sugerencia de precio mínimo para cubrir objetivos
  const objCantidad = parseFloat(campanaFija?.objetivo_cosecha) || 0
  const objPrecio   = parseFloat(campanaFija?.precio_venta_estimado) || 0
  const objIngreso  = objCantidad * objPrecio

  const handleFoto = e => {
    const file = e.target.files[0]
    if (file) { setFoto(file); setPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const campanaObj = campanas.find(c => String(c.id) === String(form.campana))
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => { if (v) data.append(k, v) })
      if (campanaObj?.biohuerto) data.append('biohuerto', campanaObj.biohuerto)
      if (foto) data.append('foto', foto)
      await api.post('/cosechas/', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Cosecha publicada.')
      navigate(campanaIdParam ? `/campanas/${campanaIdParam}` : '/cosechas')
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
        <Link to={campanaIdParam ? `/campanas/${campanaIdParam}` : '/cosechas'}
          style={{ color: dark ? D.sub : '#9ca3af' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Publicar cosecha</h1>
          <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>Registra y publica tu producción</p>
        </div>
      </div>

      {/* Panel de sugerencia — solo si viene de campaña con datos */}
      {campanaFija && (objCantidad > 0 || objPrecio > 0) && (
        <div className="rounded-xl p-4 space-y-3"
          style={{ backgroundColor: dark ? 'rgba(59,130,246,0.08)' : '#eff6ff', border: `1px solid ${dark ? 'rgba(59,130,246,0.2)' : '#bfdbfe'}` }}>
          <div className="flex items-center gap-2">
            <TrendingUp size={15} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>
              Sugerencia basada en la campaña
            </span>
          </div>

          {/* Fila de valores objetivo */}
          <div className="grid grid-cols-3 gap-3">
            {objCantidad > 0 && (
              <div className="rounded-lg px-3 py-2 text-center"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#fff' }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>Cantidad obj.</p>
                <p className="text-sm font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                  {objCantidad} {campanaFija.unidad_cosecha}
                </p>
              </div>
            )}
            {objPrecio > 0 && (
              <div className="rounded-lg px-3 py-2 text-center"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#fff' }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>Precio est.</p>
                <p className="text-sm font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
                  {fmt(objPrecio)}/{campanaFija.unidad_cosecha}
                </p>
              </div>
            )}
            {objCantidad > 0 && objPrecio > 0 && (
              <div className="rounded-lg px-3 py-2 text-center"
                style={{ backgroundColor: dark ? 'rgba(22,163,74,0.10)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: dark ? '#4ade80' : '#16a34a' }}>Ingreso est.</p>
                <p className="text-sm font-extrabold" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                  {fmt(objIngreso)}
                </p>
              </div>
            )}
          </div>

          <p className="text-[11px] flex items-start gap-1.5" style={{ color: dark ? D.sub : '#6b7280' }}>
            <Info size={11} style={{ marginTop: 1, flexShrink: 0 }} />
            Los valores se pre-llenaron desde tu campaña. Puedes ajustarlos.
          </p>
        </div>
      )}

      <div style={panelStyle}>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Campaña */}
          {campanaFija ? (
            <div>
              <label style={lst}>Campaña</label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ backgroundColor: dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}` }}>
                <Leaf size={14} style={{ color: dark ? '#4ade80' : '#16a34a', flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                    {campanaFija.variedad_str}
                  </p>
                  <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
                    {campanaFija.biohuerto_nombre} · {campanaFija.codigo} · {campanaFija.anio}
                  </p>
                </div>
              </div>
              <input type="hidden" name="campana" value={campanaFija.id} />
            </div>
          ) : (
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
          )}

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

          {/* Ingreso en vivo */}
          {qty > 0 && precio > 0 && (
            <div className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(22,163,74,0.08)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.2)' : '#bbf7d0'}` }}>
              <span className="text-xs font-bold" style={{ color: dark ? D.sub : '#6b7280' }}>
                Ingreso si vendes todo ({qty} {form.unidad} × {fmt(precio)})
              </span>
              <span className="text-base font-extrabold" style={{ color: dark ? '#4ade80' : '#15803d' }}>
                {fmt(ingreso)}
              </span>
            </div>
          )}

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
            <Link to={campanaIdParam ? `/campanas/${campanaIdParam}` : '/cosechas'}
              className="btn-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
