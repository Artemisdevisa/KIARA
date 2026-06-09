import { useState, useEffect, useRef } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  Stethoscope, ChevronRight, ChevronLeft, Save, RotateCcw,
  Leaf, Sprout, Network, Apple, TreePine, CheckCircle,
  Upload, ImageIcon, ClipboardList, AlertTriangle, History,
  X, Zap, ShieldAlert, Info,
} from 'lucide-react'

/* ── paleta dark/light ─────────────────────────────────────── */
const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

/* ── constantes ────────────────────────────────────────────── */
const PARTES = [
  { value:'hoja',           label:'Hoja',           Icon:Leaf,     color:'#16a34a', darkColor:'#4ade80', bg:'#f0fdf4', darkBg:'rgba(22,163,74,0.15)'   },
  { value:'tallo',          label:'Tallo',           Icon:Sprout,   color:'#65a30d', darkColor:'#a3e635', bg:'#f7fee7', darkBg:'rgba(101,163,13,0.15)'  },
  { value:'raiz',           label:'Raíz',            Icon:Network,  color:'#92400e', darkColor:'#d97706', bg:'#fffbeb', darkBg:'rgba(146,64,14,0.15)'   },
  { value:'fruto',          label:'Fruto',           Icon:Apple,    color:'#dc2626', darkColor:'#f87171', bg:'#fef2f2', darkBg:'rgba(220,38,38,0.15)'   },
  { value:'toda_la_planta', label:'Toda la planta',  Icon:TreePine, color:'#0f766e', darkColor:'#2dd4bf', bg:'#f0fdfa', darkBg:'rgba(15,118,110,0.15)'  },
]

const SINTOMAS = [
  { key:'manchas_amarillas',     label:'Manchas amarillas'             },
  { key:'manchas_marrones',      label:'Manchas marrones'              },
  { key:'manchas_blancas_polvo', label:'Polvo blanco sobre hojas'      },
  { key:'hojas_enrolladas',      label:'Hojas enrolladas o deformadas' },
  { key:'tallos_blandos',        label:'Tallos blandos o acostados'    },
  { key:'presencia_insectos',    label:'Presencia de insectos'         },
  { key:'raices_podridas',       label:'Raíces podridas o negras'      },
  { key:'frutos_deformes',       label:'Frutos deformes o manchados'   },
]

const STEP_LABELS = ['Cultivo', 'Parte afectada', 'Síntomas', 'Resultado']

const SEVERIDAD = {
  leve:     { label:'Leve',     color:'#16a34a', darkColor:'#4ade80', bg:'#f0fdf4', darkBg:'rgba(22,163,74,0.12)',   icon:Info        },
  moderado: { label:'Moderado', color:'#d97706', darkColor:'#fbbf24', bg:'#fffbeb', darkBg:'rgba(202,138,4,0.12)',   icon:AlertTriangle },
  grave:    { label:'Grave',    color:'#dc2626', darkColor:'#f87171', bg:'#fef2f2', darkBg:'rgba(220,38,38,0.12)',  icon:ShieldAlert  },
}

/* ── helpers ─────────────────────────────────────────────── */
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload  = () => res(reader.result.split(',')[1])
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

/* ── componentes pequeños ────────────────────────────────── */
function SeveridadBadge({ severidad, dark }) {
  const s = SEVERIDAD[severidad] || SEVERIDAD.moderado
  const Icon = s.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: dark ? s.darkBg : s.bg,
        color: dark ? s.darkColor : s.color,
        border: `1px solid ${dark ? s.darkColor + '44' : s.color + '44'}`,
      }}>
      <Icon size={12} />
      {s.label}
    </span>
  )
}

function ResultadoPanel({ resultado, dark, guardado, onGuardar, onReiniciar }) {
  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#fff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '12px',
    padding: '16px',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>
          Resultado del diagnóstico
        </h2>
        {resultado.severidad && <SeveridadBadge severidad={resultado.severidad} dark={dark} />}
      </div>

      {/* Diagnóstico */}
      <div style={{ ...cardStyle, backgroundColor: dark ? 'rgba(202,138,4,0.10)' : '#fffbeb',
        border:`1px solid ${dark ? 'rgba(202,138,4,0.30)' : '#fde68a'}` }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: dark ? '#fbbf24' : '#d97706' }}>
          Diagnóstico probable
        </p>
        <p className="font-extrabold text-lg" style={{ color: dark ? D.text : '#111827' }}>
          {resultado.diagnostico_probable}
        </p>
      </div>

      {/* Causa */}
      <div style={cardStyle}>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: dark ? D.sub : '#9ca3af' }}>
          Causa probable
        </p>
        <p className="text-sm" style={{ color: dark ? D.text : '#374151' }}>{resultado.causa_probable}</p>
      </div>

      {/* Recomendación */}
      <div style={{ ...cardStyle, backgroundColor: dark ? 'rgba(22,163,74,0.10)' : '#f0fdf4',
        border:`1px solid ${dark ? 'rgba(22,163,74,0.30)' : '#bbf7d0'}` }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: dark ? '#4ade80' : '#16a34a' }}>
          Recomendación de manejo orgánico
        </p>
        <p className="text-sm" style={{ color: dark ? D.text : '#374151' }}>{resultado.recomendacion}</p>
      </div>

      {/* Acciones preventivas */}
      {resultado.acciones_preventivas?.length > 0 && (
        <div style={cardStyle}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: dark ? D.sub : '#9ca3af' }}>
            Acciones preventivas
          </p>
          <ul className="space-y-1.5">
            {resultado.acciones_preventivas.map((ac, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: dark ? D.text : '#374151' }}>
                <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ backgroundColor: dark ? 'rgba(22,163,74,0.20)' : '#dcfce7', color: dark ? '#4ade80' : '#16a34a' }}>
                  {i + 1}
                </span>
                {ac}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {!guardado ? (
          <button onClick={onGuardar} className="btn-primary flex items-center gap-2 text-sm">
            <Save size={15} /> Guardar diagnóstico
          </button>
        ) : (
          <span className="text-sm font-bold flex items-center gap-1.5" style={{ color: dark ? '#4ade80' : '#16a34a' }}>
            <CheckCircle size={16} /> Guardado en el historial
          </span>
        )}
        <button onClick={onReiniciar} className="btn-secondary flex items-center gap-2 text-sm">
          <RotateCcw size={15} /> Nuevo diagnóstico
        </button>
      </div>
    </div>
  )
}

/* ── componente principal ─────────────────────────────────── */
export default function DiagnosticoPage() {
  const { dark } = useTheme()

  /* modo: 'formulario' | 'imagen' */
  const [modo, setModo] = useState('formulario')

  /* estado formulario */
  const [paso, setPaso]           = useState(1)
  const [cultivos, setCultivos]   = useState([])
  const [cultivoId, setCultivoId] = useState('')
  const [parte, setParte]         = useState('')
  const [sintomas, setSintomas]   = useState([])
  const [resultado, setResultado] = useState(null)
  const [guardado, setGuardado]   = useState(false)
  const [loading, setLoading]     = useState(false)

  /* estado imagen */
  const [imgFile, setImgFile]     = useState(null)
  const [imgPreview, setImgPreview] = useState(null)
  const [imgCultivoId, setImgCultivoId] = useState('')
  const [imgDesc, setImgDesc]     = useState('')
  const [imgResultado, setImgResultado] = useState(null)
  const [imgGuardado, setImgGuardado] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)

  /* historial */
  const [historial, setHistorial]       = useState([])
  const [showHistorial, setShowHistorial] = useState(false)
  const [loadingHistorial, setLoadingHistorial] = useState(false)

  const fileInputRef = useRef()

  useEffect(() => {
    api.get('/cultivos/?estado=activo').then(r => setCultivos(r.data))
  }, [])

  const cultivoNombre = (id) =>
    cultivos.find(c => String(c.id) === String(id))?.nombre || 'cultivo'

  /* ── formulario ──────────────────────────────────────────── */
  const toggleSintoma = key =>
    setSintomas(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])

  const analizar = async () => {
    setLoading(true)
    try {
      const res = await api.post('/diagnosticos/analizar-ia/', {
        metodo: 'formulario',
        cultivo_nombre: cultivoNombre(cultivoId),
        parte_afectada: parte,
        sintomas,
      })
      setResultado(res.data)
      setPaso(4)
    } catch { toast.error('Error al analizar. Intentando análisis básico...') }
    finally { setLoading(false) }
  }

  const guardar = async () => {
    try {
      await api.post('/diagnosticos/', {
        cultivo: cultivoId,
        parte_afectada: parte,
        sintomas,
        metodo: 'formulario',
        ...resultado,
      })
      toast.success('Diagnóstico guardado.')
      setGuardado(true)
    } catch { toast.error('Error al guardar.') }
  }

  const reiniciar = () => {
    setPaso(1); setCultivoId(''); setParte(''); setSintomas([])
    setResultado(null); setGuardado(false)
  }

  /* ── imagen ─────────────────────────────────────────────── */
  const handleImgChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file)
    setImgResultado(null)
    setImgGuardado(false)
    const url = URL.createObjectURL(file)
    setImgPreview(url)
  }

  const analizarImagen = async () => {
    if (!imgFile || !imgCultivoId) {
      toast.error('Selecciona una imagen y un cultivo.')
      return
    }
    setImgLoading(true)
    try {
      const b64 = await fileToBase64(imgFile)
      const mediaType = imgFile.type || 'image/jpeg'
      const res = await api.post('/diagnosticos/analizar-ia/', {
        metodo: 'imagen',
        cultivo_nombre: cultivoNombre(imgCultivoId),
        imagen: b64,
        media_type: mediaType,
        descripcion: imgDesc,
      })
      setImgResultado(res.data)
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Error al analizar la imagen.'
      toast.error(msg, { duration: 6000 })
    }
    finally { setImgLoading(false) }
  }

  const guardarImagen = async () => {
    try {
      await api.post('/diagnosticos/', {
        cultivo: imgCultivoId,
        parte_afectada: 'toda_la_planta',
        sintomas: [],
        metodo: 'imagen',
        ...imgResultado,
      })
      toast.success('Diagnóstico guardado.')
      setImgGuardado(true)
    } catch { toast.error('Error al guardar.') }
  }

  const reiniciarImagen = () => {
    setImgFile(null); setImgPreview(null); setImgCultivoId('')
    setImgDesc(''); setImgResultado(null); setImgGuardado(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ── historial ───────────────────────────────────────────── */
  const cargarHistorial = async () => {
    setLoadingHistorial(true)
    try {
      const res = await api.get('/diagnosticos/')
      setHistorial(res.data.results ?? res.data)
      setShowHistorial(true)
    } catch { toast.error('Error al cargar historial.') }
    finally { setLoadingHistorial(false) }
  }

  /* ── estilos compartidos ─────────────────────────────────── */
  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }
  const inputStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    width: '100%', borderRadius: '10px', padding: '8px 12px',
    fontSize: '13px', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '4px',
    color: dark ? D.sub : '#6b7280',
  }

  return (
    <div className="max-w-2xl space-y-5">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
          <Stethoscope size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            Diagnóstico Fitosanitario IA
          </h1>
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: dark ? D.sub : '#9ca3af' }}>
            <Zap size={11} /> Asistido por Inteligencia Artificial
          </p>
        </div>
      </div>

      {/* Tabs de modo */}
      <div style={cardStyle} className="p-1 flex gap-1">
        {[
          { id:'formulario', label:'Diagnóstico guiado', Icon:ClipboardList },
          { id:'imagen',     label:'Análisis por imagen', Icon:ImageIcon   },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setModo(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor: modo === id ? (dark ? 'rgba(22,163,74,0.20)' : '#f0fdf4') : 'transparent',
              color: modo === id ? (dark ? '#4ade80' : '#16a34a') : (dark ? D.sub : '#6b7280'),
              border: modo === id ? `1.5px solid ${dark ? 'rgba(74,222,128,0.35)' : '#bbf7d0'}` : '1.5px solid transparent',
            }}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {/* ══════════ MODO FORMULARIO ══════════ */}
      {modo === 'formulario' && (
        <>
          {/* Barra de pasos */}
          <div style={cardStyle} className="p-4">
            <div className="flex items-center">
              {[1, 2, 3, 4].map((n, idx) => (
                <div key={n} className="flex items-center" style={{ flex: n < 4 ? 1 : 'none' }}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={{
                        backgroundColor: paso >= n ? '#16a34a' : dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
                        color: paso >= n ? '#fff' : dark ? D.sub : '#9ca3af',
                      }}>
                      {paso > n ? <CheckCircle size={16} /> : n}
                    </div>
                    <span className="text-xs font-medium hidden sm:block"
                      style={{ color: paso >= n ? (dark ? '#4ade80' : '#16a34a') : dark ? D.sub : '#9ca3af' }}>
                      {STEP_LABELS[idx]}
                    </span>
                  </div>
                  {n < 4 && (
                    <div className="flex-1 h-0.5 mx-2 mb-5 rounded"
                      style={{ backgroundColor: paso > n ? '#16a34a' : dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Panel de pasos */}
          <div style={{ ...cardStyle, padding: '24px' }}>

            {/* Paso 1 */}
            {paso === 1 && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>
                  Selecciona el cultivo afectado
                </h2>
                <div>
                  <label style={labelStyle}>Cultivo activo</label>
                  <select value={cultivoId} onChange={e => setCultivoId(e.target.value)} style={inputStyle}>
                    <option value="">Seleccionar cultivo...</option>
                    {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.biohuerto_nombre})</option>)}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button onClick={() => setPaso(2)} disabled={!cultivoId} className="btn-primary flex items-center gap-2 text-sm">
                    Siguiente <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2 */}
            {paso === 2 && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>
                  ¿Qué parte está afectada?
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PARTES.map(p => {
                    const PIcon = p.Icon
                    const selected = parte === p.value
                    return (
                      <button key={p.value} onClick={() => setParte(p.value)}
                        className="p-4 rounded-xl text-center transition-all"
                        style={{
                          backgroundColor: selected ? (dark ? p.darkBg : p.bg) : dark ? 'rgba(255,255,255,0.04)' : '#f9fafb',
                          border: selected
                            ? `2px solid ${dark ? p.darkColor : p.color}`
                            : `2px solid ${dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}`,
                        }}>
                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor: selected ? (dark ? p.darkBg : p.bg) : dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6' }}>
                          <PIcon size={20} style={{ color: selected ? (dark ? p.darkColor : p.color) : dark ? D.sub : '#9ca3af' }} />
                        </div>
                        <p className="text-sm font-semibold"
                          style={{ color: selected ? (dark ? p.darkColor : p.color) : dark ? D.text : '#374151' }}>
                          {p.label}
                        </p>
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setPaso(1)} className="btn-secondary flex items-center gap-2 text-sm">
                    <ChevronLeft size={15} /> Atrás
                  </button>
                  <button onClick={() => setPaso(3)} disabled={!parte} className="btn-primary flex items-center gap-2 text-sm">
                    Siguiente <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Paso 3 */}
            {paso === 3 && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>
                  Selecciona los síntomas visibles
                </h2>
                <div className="space-y-2">
                  {SINTOMAS.map(s => {
                    const checked = sintomas.includes(s.key)
                    return (
                      <label key={s.key}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          backgroundColor: checked ? (dark ? 'rgba(22,163,74,0.12)' : '#f0fdf4') : dark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                          border: `1.5px solid ${checked ? (dark ? 'rgba(74,222,128,0.35)' : '#bbf7d0') : dark ? 'rgba(255,255,255,0.07)' : '#e5e7eb'}`,
                        }}>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: checked ? '#16a34a' : dark ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
                            border: checked ? 'none' : `1.5px solid ${dark ? 'rgba(255,255,255,0.15)' : '#d1d5db'}`,
                          }}>
                          {checked && <CheckCircle size={13} style={{ color:'#fff' }} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleSintoma(s.key)} />
                        <span className="text-sm font-medium"
                          style={{ color: checked ? (dark ? '#4ade80' : '#15803d') : dark ? D.text : '#374151' }}>
                          {s.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setPaso(2)} className="btn-secondary flex items-center gap-2 text-sm">
                    <ChevronLeft size={15} /> Atrás
                  </button>
                  <button onClick={analizar} disabled={sintomas.length === 0 || loading}
                    className="btn-primary flex items-center gap-2 text-sm">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analizando con IA...</>
                      : <><Zap size={15} /> Diagnosticar con IA</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Paso 4: Resultado */}
            {paso === 4 && resultado && (
              <ResultadoPanel
                resultado={resultado}
                dark={dark}
                guardado={guardado}
                onGuardar={guardar}
                onReiniciar={reiniciar}
              />
            )}
          </div>
        </>
      )}

      {/* ══════════ MODO IMAGEN ══════════ */}
      {modo === 'imagen' && (
        <div style={{ ...cardStyle, padding: '24px' }} className="space-y-5">
          <h2 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>
            Análisis por imagen
          </h2>
          <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
            Sube una foto de tu cultivo y la IA identificará plagas, enfermedades o deficiencias.
          </p>

          {/* Cultivo */}
          <div>
            <label style={labelStyle}>Cultivo afectado *</label>
            <select value={imgCultivoId} onChange={e => setImgCultivoId(e.target.value)} style={inputStyle}>
              <option value="">Seleccionar cultivo...</option>
              {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.biohuerto_nombre})</option>)}
            </select>
          </div>

          {/* Upload area */}
          <div>
            <label style={labelStyle}>Imagen del cultivo *</label>
            <div
              className="border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all"
              style={{
                borderColor: imgPreview ? '#16a34a' : dark ? 'rgba(255,255,255,0.15)' : '#d1d5db',
                backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb',
                minHeight: '160px',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {imgPreview ? (
                <div className="relative">
                  <img src={imgPreview} alt="preview" className="w-full max-h-64 object-cover" />
                  <button
                    className="absolute top-2 right-2 rounded-full p-1"
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={e => { e.stopPropagation(); reiniciarImagen() }}>
                    <X size={14} style={{ color: '#fff' }} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Upload size={32} style={{ color: dark ? D.sub : '#9ca3af' }} />
                  <p className="text-sm font-medium" style={{ color: dark ? D.sub : '#6b7280' }}>
                    Haz clic para subir una foto
                  </p>
                  <p className="text-xs" style={{ color: dark ? 'rgba(255,255,255,0.3)' : '#9ca3af' }}>
                    JPG, PNG, WebP — máx. 20 MB
                  </p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange} />
          </div>

          {/* Descripción adicional */}
          <div>
            <label style={labelStyle}>Descripción adicional (opcional)</label>
            <textarea
              value={imgDesc}
              onChange={e => setImgDesc(e.target.value)}
              placeholder="Ej: las hojas tienen manchas desde hace 3 días, riego por goteo..."
              rows={3}
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          {/* Botón analizar */}
          {!imgResultado ? (
            <button onClick={analizarImagen}
              disabled={!imgFile || !imgCultivoId || imgLoading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {imgLoading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Analizando imagen con IA...</>
                : <><Zap size={16} /> Analizar imagen</>
              }
            </button>
          ) : (
            <ResultadoPanel
              resultado={imgResultado}
              dark={dark}
              guardado={imgGuardado}
              onGuardar={guardarImagen}
              onReiniciar={reiniciarImagen}
            />
          )}
        </div>
      )}

      {/* ══════════ HISTORIAL ══════════ */}
      <div style={cardStyle} className="overflow-hidden">
        <button
          onClick={showHistorial ? () => setShowHistorial(false) : cargarHistorial}
          className="w-full flex items-center justify-between p-4 text-sm font-semibold transition-all"
          style={{ color: dark ? D.text : '#374151' }}>
          <span className="flex items-center gap-2">
            <History size={16} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
            Historial de diagnósticos
          </span>
          <span className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
            {showHistorial ? 'Ocultar' : 'Ver historial'}
          </span>
        </button>

        {showHistorial && (
          <div className="border-t" style={{ borderColor: dark ? D.cardBorder : '#f3f4f6' }}>
            {loadingHistorial ? (
              <div className="p-6 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>Cargando...</div>
            ) : historial.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>
                Sin diagnósticos registrados.
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: dark ? D.cardBorder : '#f3f4f6' }}>
                {historial.slice(0, 10).map(d => (
                  <div key={d.id} className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: dark ? D.text : '#111827' }}>
                        {d.diagnostico_probable}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#6b7280' }}>
                        {d.cultivo_nombre} · {d.fecha}
                        {d.metodo === 'imagen' && ' · 📷 Imagen'}
                      </p>
                    </div>
                    {d.severidad && <SeveridadBadge severidad={d.severidad} dark={dark} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
