import { useState, useEffect, useRef, useMemo } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  Stethoscope, ChevronRight, ChevronLeft, Save, RotateCcw,
  Leaf, Sprout, Network, Apple, TreePine, CheckCircle,
  Upload, ImageIcon, ClipboardList, AlertTriangle, History,
  X, Zap, ShieldAlert, Info, CalendarRange, FlaskConical,
  Trash2, Eye, Camera, FileText, Tag, Plus, SlidersHorizontal,
  Clock, Search,
} from 'lucide-react'

/* ── Paleta ── */
const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

const PARTES_DEFAULT = [
  { value:'hoja',           label:'Hoja',          Icon:Leaf,     color:'#16a34a', darkColor:'#4ade80', bg:'#f0fdf4', darkBg:'rgba(22,163,74,0.15)'  },
  { value:'tallo',          label:'Tallo',          Icon:Sprout,   color:'#65a30d', darkColor:'#a3e635', bg:'#f7fee7', darkBg:'rgba(101,163,13,0.15)' },
  { value:'raiz',           label:'Raíz',           Icon:Network,  color:'#92400e', darkColor:'#d97706', bg:'#fffbeb', darkBg:'rgba(146,64,14,0.15)'  },
  { value:'fruto',          label:'Fruto',          Icon:Apple,    color:'#dc2626', darkColor:'#f87171', bg:'#fef2f2', darkBg:'rgba(220,38,38,0.15)'  },
  { value:'toda_la_planta', label:'Toda la planta', Icon:TreePine, color:'#0f766e', darkColor:'#2dd4bf', bg:'#f0fdfa', darkBg:'rgba(15,118,110,0.15)' },
]

const SINTOMAS_DEFAULT = [
  { key:'manchas_amarillas',     label:'Manchas amarillas'             },
  { key:'manchas_marrones',      label:'Manchas marrones'              },
  { key:'manchas_blancas_polvo', label:'Polvo blanco sobre hojas'      },
  { key:'hojas_enrolladas',      label:'Hojas enrolladas o deformadas' },
  { key:'tallos_blandos',        label:'Tallos blandos o acostados'    },
  { key:'presencia_insectos',    label:'Presencia de insectos'         },
  { key:'raices_podridas',       label:'Raíces podridas o negras'      },
  { key:'frutos_deformes',       label:'Frutos deformes o manchados'   },
  { key:'color_palido',          label:'Color pálido o amarillento general' },
  { key:'caida_hojas',           label:'Caída prematura de hojas'      },
  { key:'crecimiento_lento',     label:'Crecimiento lento o detenido'  },
  { key:'hongos_visibles',       label:'Hongos o moho visibles'        },
]

const STEP_LABELS = ['Campaña', 'Parte afectada', 'Síntomas', 'Resultado']

const SEV_CFG = {
  leve:     { label:'Leve',     color:'#16a34a', darkColor:'#4ade80', bg:'#f0fdf4', darkBg:'rgba(22,163,74,0.12)',  icon:Info          },
  moderado: { label:'Moderado', color:'#d97706', darkColor:'#fbbf24', bg:'#fffbeb', darkBg:'rgba(202,138,4,0.12)',  icon:AlertTriangle },
  grave:    { label:'Grave',    color:'#dc2626', darkColor:'#f87171', bg:'#fef2f2', darkBg:'rgba(220,38,38,0.12)', icon:ShieldAlert   },
}

function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload  = () => res(reader.result.split(',')[1])
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

/* ── SeveridadBadge ── */
function SeveridadBadge({ severidad, dark }) {
  const s = SEV_CFG[severidad] || SEV_CFG.moderado
  const Icon = s.icon
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: dark?s.darkBg:s.bg, color: dark?s.darkColor:s.color,
        border:`1px solid ${dark?s.darkColor+'44':s.color+'44'}` }}>
      <Icon size={11}/> {s.label}
    </span>
  )
}

/* ── VariedadBadge ── */
function VariedadBadge({ campana, dark }) {
  if (!campana) return null
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
      style={{ backgroundColor:dark?'rgba(22,163,74,0.12)':'#f0fdf4', border:`1px solid ${dark?'rgba(74,222,128,0.25)':'#bbf7d0'}` }}>
      <Tag size={12} style={{ color:dark?'#4ade80':'#16a34a' }}/>
      <span className="text-xs font-semibold" style={{ color:dark?'#4ade80':'#15803d' }}>
        Variedad: {campana.variedad_str}
      </span>
    </div>
  )
}

/* ── CampanaSelector ── */
function CampanaSelector({ campanas, value, onChange, dark, ist, lst, opcional=false }) {
  const grupos = campanas.reduce((acc, c) => {
    const k = c.biohuerto_nombre || 'Mi biohuerto'
    if (!acc[k]) acc[k] = []
    acc[k].push(c)
    return acc
  }, {})
  return (
    <div>
      <label style={lst}>Campaña activa {opcional ? '(opcional)' : '*'}</label>
      <select value={value} onChange={e => onChange(e.target.value)} style={ist}>
        <option value="">{opcional ? '— Sin campaña —' : 'Seleccionar campaña...'}</option>
        {Object.entries(grupos).map(([bio, items]) => (
          <optgroup key={bio} label={bio}>
            {items.map(c => (
              <option key={c.id} value={c.id}>
                {c.codigo} — {c.variedad_str} ({c.estado_display})
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  )
}

/* ── ResultadoPanel ── */
function ResultadoPanel({ resultado, dark, guardado, onGuardar, onReiniciar }) {
  const cs = { backgroundColor:dark?D.cardBg:'#fff', border:`1.5px solid ${dark?D.cardBorder:'#e5e7eb'}`, borderRadius:'12px', padding:'16px' }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-extrabold text-base" style={{ color:dark?D.text:'#111827' }}>Resultado del diagnóstico</h2>
        {resultado.severidad && <SeveridadBadge severidad={resultado.severidad} dark={dark}/>}
      </div>
      <div style={{ ...cs, backgroundColor:dark?'rgba(202,138,4,0.10)':'#fffbeb', border:`1px solid ${dark?'rgba(202,138,4,0.30)':'#fde68a'}` }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color:dark?'#fbbf24':'#d97706' }}>Diagnóstico probable</p>
        <p className="font-extrabold text-lg" style={{ color:dark?D.text:'#111827' }}>{resultado.diagnostico_probable}</p>
      </div>
      <div style={cs}>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color:dark?D.sub:'#9ca3af' }}>Causa probable</p>
        <p className="text-sm" style={{ color:dark?D.text:'#374151' }}>{resultado.causa_probable}</p>
      </div>
      <div style={{ ...cs, backgroundColor:dark?'rgba(22,163,74,0.10)':'#f0fdf4', border:`1px solid ${dark?'rgba(22,163,74,0.30)':'#bbf7d0'}` }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color:dark?'#4ade80':'#16a34a' }}>Recomendación de manejo orgánico</p>
        <p className="text-sm" style={{ color:dark?D.text:'#374151' }}>{resultado.recomendacion}</p>
      </div>
      {resultado.acciones_preventivas?.length > 0 && (
        <div style={cs}>
          <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color:dark?D.sub:'#9ca3af' }}>Acciones preventivas</p>
          <ul className="space-y-1.5">
            {resultado.acciones_preventivas.map((ac,i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color:dark?D.text:'#374151' }}>
                <span className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ backgroundColor:dark?'rgba(22,163,74,0.20)':'#dcfce7', color:dark?'#4ade80':'#16a34a' }}>{i+1}</span>
                {ac}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {!guardado ? (
          <button onClick={onGuardar} className="btn-primary flex items-center gap-2 text-sm"><Save size={15}/> Guardar diagnóstico</button>
        ) : (
          <span className="text-sm font-bold flex items-center gap-1.5" style={{ color:dark?'#4ade80':'#16a34a' }}>
            <CheckCircle size={16}/> Guardado en el historial
          </span>
        )}
        <button onClick={onReiniciar} className="btn-secondary flex items-center gap-2 text-sm"><RotateCcw size={15}/> Nuevo diagnóstico</button>
      </div>
    </div>
  )
}

/* ── Modal detalle ── */
function DetalleModal({ dark, diag, onClose, onDelete }) {
  const cs = { backgroundColor:dark?D.cardBg:'#f9fafb', borderRadius:'10px', padding:'12px' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden"
        style={{ backgroundColor:dark?'#1e2a3a':'#fff', border:`1.5px solid ${dark?'rgba(255,255,255,0.10)':'#e5e7eb'}`, maxHeight:'90vh' }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} style={{ color:dark?'#f87171':'#dc2626' }}/>
            <h3 className="text-sm font-extrabold" style={{ color:dark?D.text:'#111827' }}>Detalle del diagnóstico</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { if(window.confirm('¿Eliminar este diagnóstico?')) onDelete(diag.id) }}
              className="p-1.5 rounded-lg transition-colors" style={{ color:dark?'#f87171':'#dc2626' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor=dark?'rgba(239,68,68,0.15)':'#fef2f2'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
              <Trash2 size={14}/>
            </button>
            <button onClick={onClose} style={{ color:D.sub }}><X size={18}/></button>
          </div>
        </div>
        <div className="overflow-y-auto thin-scroll px-5 pb-5 space-y-3" style={{ flex:1 }}>
          {diag.imagen_url && <img src={diag.imagen_url} alt="Diagnóstico" className="w-full rounded-xl object-cover max-h-56"/>}
          <div className="flex flex-wrap gap-2">
            {diag.severidad && <SeveridadBadge severidad={diag.severidad} dark={dark}/>}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor:diag.metodo==='imagen'?(dark?'rgba(96,165,250,0.15)':'#dbeafe'):(dark?'rgba(22,163,74,0.15)':'#dcfce7'), color:diag.metodo==='imagen'?(dark?'#60a5fa':'#1d4ed8'):(dark?'#4ade80':'#15803d') }}>
              {diag.metodo==='imagen'?'📷 Por imagen':'📋 Formulario guiado'}
            </span>
          </div>
          <div style={cs} className="space-y-1.5">
            {diag.campana_codigo && (
              <p className="text-xs" style={{ color:dark?D.sub:'#6b7280' }}>
                <strong style={{ color:dark?D.text:'#374151' }}>Campaña:</strong>{' '}
                <span className="font-mono font-bold" style={{ color:dark?'#60a5fa':'#2563eb' }}>{diag.campana_codigo}</span>
              </p>
            )}
            {diag.variedad_str && (
              <p className="text-xs" style={{ color:dark?D.sub:'#6b7280' }}>
                <strong style={{ color:dark?D.text:'#374151' }}>Variedad:</strong> {diag.variedad_str}
              </p>
            )}
            {diag.parte_afectada && (
              <p className="text-xs" style={{ color:dark?D.sub:'#6b7280' }}>
                <strong style={{ color:dark?D.text:'#374151' }}>Parte afectada:</strong> {diag.parte_afectada.replace(/_/g,' ')}
              </p>
            )}
            <p className="text-xs flex items-center gap-1" style={{ color:dark?D.sub:'#6b7280' }}>
              <Clock size={10}/>
              <strong style={{ color:dark?D.text:'#374151' }}>Fecha y hora:</strong> {diag.fecha_hora || diag.fecha}
            </p>
          </div>
          <div style={{ ...cs, backgroundColor:dark?'rgba(202,138,4,0.10)':'#fffbeb', border:`1px solid ${dark?'rgba(202,138,4,0.30)':'#fde68a'}` }}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:dark?'#fbbf24':'#d97706' }}>Diagnóstico probable</p>
            <p className="font-bold text-sm" style={{ color:dark?D.text:'#111827' }}>{diag.diagnostico_probable}</p>
          </div>
          <div style={cs}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:dark?D.sub:'#9ca3af' }}>Causa probable</p>
            <p className="text-xs" style={{ color:dark?D.text:'#374151' }}>{diag.causa_probable}</p>
          </div>
          <div style={{ ...cs, backgroundColor:dark?'rgba(22,163,74,0.10)':'#f0fdf4', border:`1px solid ${dark?'rgba(22,163,74,0.30)':'#bbf7d0'}` }}>
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color:dark?'#4ade80':'#16a34a' }}>Recomendación</p>
            <p className="text-xs" style={{ color:dark?D.text:'#374151' }}>{diag.recomendacion}</p>
          </div>
          {diag.acciones_preventivas?.length > 0 && (
            <div style={cs}>
              <p className="text-[10px] font-bold uppercase tracking-wide mb-2" style={{ color:dark?D.sub:'#9ca3af' }}>Acciones preventivas</p>
              <ol className="space-y-1">
                {diag.acciones_preventivas.map((a,i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color:dark?D.text:'#374151' }}>
                    <span className="font-bold shrink-0" style={{ color:dark?'#4ade80':'#16a34a' }}>{i+1}.</span> {a}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Tarjeta historial ── */
function DiagCard({ dark, diag, onVer, onDelete }) {
  return (
    <div className="flex gap-3 p-3 rounded-xl transition-all duration-150"
      style={{ backgroundColor:dark?D.cardBg:'#fff', border:`1.5px solid ${dark?D.cardBorder:'#e5e7eb'}`, borderRadius:'14px' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor=dark?'rgba(255,255,255,0.07)':'#f9fafb'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor=dark?D.cardBg:'#fff'}>
      <div className="shrink-0 w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center"
        style={{ backgroundColor:dark?'rgba(255,255,255,0.06)':'#f3f4f6' }}>
        {diag.imagen_url
          ? <img src={diag.imagen_url} alt="" className="w-full h-full object-cover"/>
          : <FileText size={20} style={{ color:dark?D.sub:'#d1d5db' }}/>
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight truncate" style={{ color:dark?D.text:'#111827' }}>
          {diag.diagnostico_probable}
        </p>
        {diag.variedad_str && (
          <p className="text-[10px] mt-0.5 truncate" style={{ color:dark?D.sub:'#6b7280' }}>{diag.variedad_str}</p>
        )}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {diag.severidad && <SeveridadBadge severidad={diag.severidad} dark={dark}/>}
          {diag.campana_codigo && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ backgroundColor:dark?'rgba(96,165,250,0.12)':'#dbeafe', color:dark?'#60a5fa':'#1d4ed8' }}>
              <CalendarRange size={9}/> {diag.campana_codigo}
            </span>
          )}
          <span className="text-[10px] flex items-center gap-0.5" style={{ color:dark?D.sub:'#9ca3af' }}>
            <Clock size={9}/> {diag.fecha_hora || diag.fecha}
          </span>
          {diag.metodo==='imagen'
            ? <span className="text-[10px] font-semibold" style={{ color:dark?'#60a5fa':'#3b82f6' }}><Camera size={9} className="inline mr-0.5"/>Imagen</span>
            : <span className="text-[10px] font-semibold" style={{ color:dark?'#4ade80':'#16a34a' }}><ClipboardList size={9} className="inline mr-0.5"/>Formulario</span>
          }
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        <button onClick={() => onVer(diag)} className="p-1.5 rounded-lg transition-colors"
          style={{ color:dark?D.sub:'#9ca3af' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor=dark?'rgba(255,255,255,0.08)':'#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
          <Eye size={14}/>
        </button>
        <button onClick={() => { if(window.confirm('¿Eliminar?')) onDelete(diag.id) }}
          className="p-1.5 rounded-lg transition-colors" style={{ color:dark?'#f87171':'#dc2626' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor=dark?'rgba(239,68,68,0.15)':'#fef2f2'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}>
          <Trash2 size={14}/>
        </button>
      </div>
    </div>
  )
}

/* ══ COMPONENTE PRINCIPAL ══ */
export default function DiagnosticoPage() {
  const { dark } = useTheme()
  const [modo, setModo] = useState('formulario')

  const [campanas, setCampanas] = useState([])

  /* Formulario */
  const [paso, setPaso]           = useState(1)
  const [campanaId, setCampanaId] = useState('')
  const [parte, setParte]         = useState('')
  const [partePersonalizada, setPartePersonalizada] = useState('')
  const [mostrarInputParte, setMostrarInputParte]   = useState(false)
  const [partesExtra, setPartesExtra]               = useState([])
  const [sintomas, setSintomas]     = useState([])
  const [sintomaExtra, setSintomaExtra]             = useState('')
  const [sintomasExtra, setSintomasExtra]           = useState([])
  const [resultado, setResultado]   = useState(null)
  const [guardado, setGuardado]     = useState(false)
  const [loading, setLoading]       = useState(false)

  /* Imagen */
  const [imgFile, setImgFile]           = useState(null)
  const [imgPreview, setImgPreview]     = useState(null)
  const [imgCampanaId, setImgCampanaId] = useState('')
  const [imgDesc, setImgDesc]           = useState('')
  const [imgResultado, setImgResultado] = useState(null)
  const [imgGuardado, setImgGuardado]   = useState(false)
  const [imgLoading, setImgLoading]     = useState(false)

  /* Historial */
  const [historial, setHistorial]     = useState([])
  const [histLoading, setHistLoading] = useState(false)
  const [detalleItem, setDetalleItem] = useState(null)

  /* Filtros historial */
  const [filtroSev, setFiltroSev]       = useState('')
  const [filtroMetodo, setFiltroMetodo] = useState('')
  const [filtroBusq, setFiltroBusq]     = useState('')
  const [showFiltros, setShowFiltros]   = useState(false)

  const fileInputRef = useRef()

  useEffect(() => {
    api.get('/campanas/').then(r => {
      const todas = r.data.results ?? r.data
      setCampanas(todas.filter(c => c.estado==='activa'||c.estado==='planificada'))
    }).catch(()=>{})
    cargarHistorial()
  }, [])

  const campanaObj = id => campanas.find(c => String(c.id)===String(id))
  const plantaDesc = id => campanaObj(id)?.variedad_str || 'cultivo'

  /* ── Historial ── */
  const cargarHistorial = async () => {
    setHistLoading(true)
    try {
      const r = await api.get('/diagnosticos/')
      setHistorial(r.data.results ?? r.data)
    } catch { toast.error('Error al cargar historial.') }
    finally { setHistLoading(false) }
  }

  const eliminarDiag = async id => {
    try {
      await api.delete(`/diagnosticos/${id}/`)
      toast.success('Diagnóstico eliminado.')
      setDetalleItem(null)
      setHistorial(h => h.filter(d => d.id!==id))
    } catch { toast.error('Error al eliminar.') }
  }

  /* Historial filtrado */
  const histFiltrado = useMemo(() => {
    return historial.filter(d => {
      if (filtroSev    && d.severidad !== filtroSev)  return false
      if (filtroMetodo && d.metodo    !== filtroMetodo) return false
      if (filtroBusq) {
        const q = filtroBusq.toLowerCase()
        const match = d.diagnostico_probable?.toLowerCase().includes(q)
          || d.variedad_str?.toLowerCase().includes(q)
          || d.campana_codigo?.toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [historial, filtroSev, filtroMetodo, filtroBusq])

  const limpiarFiltros = () => { setFiltroSev(''); setFiltroMetodo(''); setFiltroBusq('') }
  const hayFiltros = filtroSev || filtroMetodo || filtroBusq

  /* ── Partes y síntomas ── */
  const todasPartes = [
    ...PARTES_DEFAULT,
    ...partesExtra.map(p => ({
      value: p.toLowerCase().replace(/\s+/g,'_'),
      label: p,
      Icon: Leaf,
      color:'#7c3aed', darkColor:'#a78bfa', bg:'#f5f3ff', darkBg:'rgba(124,58,237,0.15)',
    })),
  ]

  const agregarParteExtra = () => {
    const v = partePersonalizada.trim()
    if (!v) return
    setPartesExtra(prev => [...prev, v])
    setParte(v.toLowerCase().replace(/\s+/g,'_'))
    setPartePersonalizada('')
    setMostrarInputParte(false)
  }

  const todosSintomas = [
    ...SINTOMAS_DEFAULT,
    ...sintomasExtra.map(s => ({ key: s.toLowerCase().replace(/\s+/g,'_'), label: s })),
  ]

  const toggleSintoma = key =>
    setSintomas(prev => prev.includes(key) ? prev.filter(s=>s!==key) : [...prev, key])

  const agregarSintomaExtra = () => {
    const v = sintomaExtra.trim()
    if (!v) return
    const key = v.toLowerCase().replace(/\s+/g,'_')
    setSintomasExtra(prev => [...prev, v])
    setSintomas(prev => [...prev, key])
    setSintomaExtra('')
  }

  /* ── Formulario ── */
  const parteReal = parte || partePersonalizada

  const analizar = async () => {
    setLoading(true)
    try {
      const res = await api.post('/diagnosticos/analizar-ia/', {
        metodo: 'formulario',
        variedad_desc: plantaDesc(campanaId),
        parte_afectada: parteReal,
        sintomas,
      })
      setResultado(res.data)
      setPaso(4)
    } catch { toast.error('Error al analizar.') }
    finally { setLoading(false) }
  }

  const guardar = async () => {
    try {
      await api.post('/diagnosticos/', {
        campana: campanaId || null,
        parte_afectada: parteReal,
        sintomas,
        metodo: 'formulario',
        ...resultado,
      })
      toast.success('Diagnóstico guardado.')
      setGuardado(true)
      cargarHistorial()
    } catch { toast.error('Error al guardar.') }
  }

  const reiniciar = () => {
    setPaso(1); setCampanaId(''); setParte(''); setPartePersonalizada('')
    setPartesExtra([]); setSintomas([]); setSintomasExtra([])
    setResultado(null); setGuardado(false); setMostrarInputParte(false)
  }

  /* ── Imagen ── */
  const handleImgChange = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgFile(file); setImgResultado(null); setImgGuardado(false)
    setImgPreview(URL.createObjectURL(file))
  }

  const analizarImagen = async () => {
    if (!imgFile) { toast.error('Selecciona una imagen.'); return }
    setImgLoading(true)
    try {
      const b64 = await fileToBase64(imgFile)
      const res = await api.post('/diagnosticos/analizar-ia/', {
        metodo: 'imagen',
        variedad_desc: plantaDesc(imgCampanaId),
        imagen: b64,
        media_type: imgFile.type||'image/jpeg',
        descripcion: imgDesc,
      })
      setImgResultado(res.data)
    } catch (err) {
      toast.error(err?.response?.data?.detail||'Error al analizar la imagen.', { duration:6000 })
    } finally { setImgLoading(false) }
  }

  const guardarImagen = async () => {
    try {
      const fd = new FormData()
      if (imgCampanaId) fd.append('campana', imgCampanaId)
      fd.append('parte_afectada',       'toda_la_planta')
      fd.append('sintomas',             JSON.stringify([]))
      fd.append('metodo',               'imagen')
      fd.append('diagnostico_probable', imgResultado.diagnostico_probable||'')
      fd.append('causa_probable',       imgResultado.causa_probable||'')
      fd.append('recomendacion',        imgResultado.recomendacion||'')
      fd.append('severidad',            imgResultado.severidad||'moderado')
      fd.append('acciones_preventivas', JSON.stringify(imgResultado.acciones_preventivas||[]))
      if (imgFile) fd.append('imagen', imgFile)
      await api.post('/diagnosticos/', fd, { headers:{'Content-Type':'multipart/form-data'} })
      toast.success('Diagnóstico con imagen guardado.')
      setImgGuardado(true)
      cargarHistorial()
    } catch { toast.error('Error al guardar.') }
  }

  const reiniciarImagen = () => {
    setImgFile(null); setImgPreview(null); setImgCampanaId('')
    setImgDesc(''); setImgResultado(null); setImgGuardado(false)
    if (fileInputRef.current) fileInputRef.current.value=''
  }

  /* ── Estilos base ── */
  const cardStyle = {
    backgroundColor:dark?D.cardBg:'#ffffff',
    border:`1.5px solid ${dark?D.cardBorder:'#e5e7eb'}`,
    borderRadius:'16px',
  }
  const ist = {
    backgroundColor:dark?D.inputBg:'#f9fafb',
    border:`1px solid ${dark?D.inputBorder:'#e5e7eb'}`,
    color:dark?D.text:'#111827',
    width:'100%', borderRadius:'10px', padding:'8px 12px',
    fontSize:'13px', outline:'none',
  }
  const lst = { display:'block', fontSize:'11px', fontWeight:700, marginBottom:'4px', color:dark?D.sub:'#6b7280' }

  /* ══════════════════════════════ */
  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor:dark?'rgba(255,255,255,0.07)':'#f0fdf4' }}>
          <Stethoscope size={19} style={{ color:dark?'rgba(255,255,255,0.75)':'#16a34a' }}/>
        </div>
        <div>
          <h1 className="text-xl font-extrabold" style={{ color:dark?D.text:'#111827' }}>
            Diagnóstico Fitosanitario IA
          </h1>
          <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color:dark?D.sub:'#9ca3af' }}>
            <Zap size={11}/> Asistido por Claude + Gemini
          </p>
        </div>
      </div>

      {/* Grid 2 columnas: formulario | historial */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

      {/* ── COLUMNA IZQUIERDA: Tabs + Form ── */}
      <div className="space-y-5">

      {/* Tabs */}
      <div style={cardStyle} className="p-1 flex gap-1">
        {[
          { id:'formulario', label:'Diagnóstico guiado',  Icon:ClipboardList },
          { id:'imagen',     label:'Análisis por imagen', Icon:ImageIcon     },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setModo(id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              backgroundColor:modo===id?(dark?'rgba(22,163,74,0.20)':'#f0fdf4'):'transparent',
              color:modo===id?(dark?'#4ade80':'#16a34a'):(dark?D.sub:'#6b7280'),
              border:modo===id?`1.5px solid ${dark?'rgba(74,222,128,0.35)':'#bbf7d0'}`:'1.5px solid transparent',
            }}>
            <Icon size={15}/> {label}
          </button>
        ))}
      </div>

      {/* ══ FORMULARIO GUIADO ══ */}
      {modo==='formulario' && (
        <>
          {/* Progreso */}
          <div style={cardStyle} className="p-4">
            <div className="flex items-center">
              {[1,2,3,4].map((n,idx) => (
                <div key={n} className="flex items-center" style={{ flex:n<4?1:'none' }}>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                      style={{ backgroundColor:paso>=n?'#16a34a':(dark?'rgba(255,255,255,0.08)':'#f3f4f6'), color:paso>=n?'#fff':(dark?D.sub:'#9ca3af') }}>
                      {paso>n?<CheckCircle size={16}/>:n}
                    </div>
                    <span className="text-xs font-medium hidden sm:block"
                      style={{ color:paso>=n?(dark?'#4ade80':'#16a34a'):(dark?D.sub:'#9ca3af') }}>
                      {STEP_LABELS[idx]}
                    </span>
                  </div>
                  {n<4 && <div className="flex-1 h-0.5 mx-2 mb-5 rounded"
                    style={{ backgroundColor:paso>n?'#16a34a':(dark?'rgba(255,255,255,0.08)':'#e5e7eb') }}/>}
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...cardStyle, padding:'24px' }}>

            {/* Paso 1 */}
            {paso===1 && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-base" style={{ color:dark?D.text:'#111827' }}>Selecciona tu campaña activa</h2>
                {campanas.length===0 ? (
                  <div className="text-center py-6" style={{ color:dark?D.sub:'#9ca3af' }}>
                    <CalendarRange size={28} className="mx-auto mb-2 opacity-40"/>
                    <p className="text-sm">No tienes campañas activas.</p>
                    <p className="text-xs mt-1">Crea una campaña en "Mi Huerto" primero.</p>
                  </div>
                ) : (
                  <>
                    <CampanaSelector campanas={campanas} value={campanaId} onChange={setCampanaId} dark={dark} ist={ist} lst={lst}/>
                    <VariedadBadge campana={campanaObj(campanaId)} dark={dark}/>
                  </>
                )}
                <div className="flex justify-end">
                  <button onClick={() => setPaso(2)} disabled={!campanaId} className="btn-primary flex items-center gap-2 text-sm">
                    Siguiente <ChevronRight size={15}/>
                  </button>
                </div>
              </div>
            )}

            {/* Paso 2: Parte afectada */}
            {paso===2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-base" style={{ color:dark?D.text:'#111827' }}>¿Qué parte está afectada?</h2>
                  <VariedadBadge campana={campanaObj(campanaId)} dark={dark}/>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {todasPartes.map(p => {
                    const PIcon=p.Icon; const sel=parte===p.value
                    return (
                      <button key={p.value} onClick={() => setParte(p.value)}
                        className="p-4 rounded-xl text-center transition-all"
                        style={{
                          backgroundColor:sel?(dark?p.darkBg:p.bg):(dark?'rgba(255,255,255,0.04)':'#f9fafb'),
                          border:sel?`2px solid ${dark?p.darkColor:p.color}`:`2px solid ${dark?'rgba(255,255,255,0.08)':'#e5e7eb'}`,
                        }}>
                        <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                          style={{ backgroundColor:sel?(dark?p.darkBg:p.bg):(dark?'rgba(255,255,255,0.06)':'#f3f4f6') }}>
                          <PIcon size={20} style={{ color:sel?(dark?p.darkColor:p.color):(dark?D.sub:'#9ca3af') }}/>
                        </div>
                        <p className="text-sm font-semibold" style={{ color:sel?(dark?p.darkColor:p.color):(dark?D.text:'#374151') }}>{p.label}</p>
                      </button>
                    )
                  })}

                  {/* Botón añadir parte */}
                  <button onClick={() => setMostrarInputParte(v=>!v)}
                    className="p-4 rounded-xl text-center transition-all border-2 border-dashed"
                    style={{
                      backgroundColor:'transparent',
                      borderColor:dark?'rgba(255,255,255,0.12)':'#d1d5db',
                    }}>
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor:dark?'rgba(255,255,255,0.06)':'#f3f4f6' }}>
                      <Plus size={20} style={{ color:dark?D.sub:'#9ca3af' }}/>
                    </div>
                    <p className="text-xs font-semibold" style={{ color:dark?D.sub:'#9ca3af' }}>Otra parte</p>
                  </button>
                </div>

                {/* Input parte personalizada */}
                {mostrarInputParte && (
                  <div className="flex gap-2">
                    <input
                      value={partePersonalizada}
                      onChange={e => setPartePersonalizada(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && agregarParteExtra()}
                      placeholder="Ej: flor, semilla, corteza..."
                      style={{ ...ist, flex:1 }}
                    />
                    <button onClick={agregarParteExtra}
                      className="btn-primary text-sm px-4" disabled={!partePersonalizada.trim()}>
                      Añadir
                    </button>
                  </div>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setPaso(1)} className="btn-secondary flex items-center gap-2 text-sm"><ChevronLeft size={15}/> Atrás</button>
                  <button onClick={() => setPaso(3)} disabled={!parte} className="btn-primary flex items-center gap-2 text-sm">Siguiente <ChevronRight size={15}/></button>
                </div>
              </div>
            )}

            {/* Paso 3: Síntomas */}
            {paso===3 && (
              <div className="space-y-4">
                <h2 className="font-extrabold text-base" style={{ color:dark?D.text:'#111827' }}>Selecciona los síntomas visibles</h2>
                <div className="space-y-2 max-h-72 overflow-y-auto thin-scroll pr-1">
                  {todosSintomas.map(s => {
                    const checked=sintomas.includes(s.key)
                    return (
                      <label key={s.key}
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                        style={{
                          backgroundColor:checked?(dark?'rgba(22,163,74,0.12)':'#f0fdf4'):(dark?'rgba(255,255,255,0.03)':'#f9fafb'),
                          border:`1.5px solid ${checked?(dark?'rgba(74,222,128,0.35)':'#bbf7d0'):(dark?'rgba(255,255,255,0.07)':'#e5e7eb')}`,
                        }}>
                        <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor:checked?'#16a34a':(dark?'rgba(255,255,255,0.08)':'#e5e7eb'), border:checked?'none':`1.5px solid ${dark?'rgba(255,255,255,0.15)':'#d1d5db'}` }}>
                          {checked && <CheckCircle size={13} style={{ color:'#fff' }}/>}
                        </div>
                        <input type="checkbox" className="hidden" checked={checked} onChange={() => toggleSintoma(s.key)}/>
                        <span className="text-sm font-medium" style={{ color:checked?(dark?'#4ade80':'#15803d'):(dark?D.text:'#374151') }}>{s.label}</span>
                      </label>
                    )
                  })}
                </div>

                {/* Añadir síntoma personalizado */}
                <div className="flex gap-2 pt-1">
                  <input
                    value={sintomaExtra}
                    onChange={e => setSintomaExtra(e.target.value)}
                    onKeyDown={e => e.key==='Enter' && agregarSintomaExtra()}
                    placeholder="Añadir síntoma personalizado..."
                    style={{ ...ist, flex:1 }}
                  />
                  <button onClick={agregarSintomaExtra} disabled={!sintomaExtra.trim()}
                    className="btn-secondary text-sm px-3 flex items-center gap-1">
                    <Plus size={14}/> Añadir
                  </button>
                </div>

                {sintomas.length > 0 && (
                  <p className="text-xs" style={{ color:dark?D.sub:'#9ca3af' }}>
                    {sintomas.length} síntoma(s) seleccionado(s)
                  </p>
                )}

                <div className="flex justify-between">
                  <button onClick={() => setPaso(2)} className="btn-secondary flex items-center gap-2 text-sm"><ChevronLeft size={15}/> Atrás</button>
                  <button onClick={analizar} disabled={sintomas.length===0||loading} className="btn-primary flex items-center gap-2 text-sm">
                    {loading
                      ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Analizando con IA...</>
                      : <><Zap size={15}/> Diagnosticar con IA</>}
                  </button>
                </div>
              </div>
            )}

            {paso===4 && resultado && (
              <ResultadoPanel resultado={resultado} dark={dark} guardado={guardado} onGuardar={guardar} onReiniciar={reiniciar}/>
            )}
          </div>
        </>
      )}

      {/* ══ MODO IMAGEN ══ */}
      {modo==='imagen' && (
        <div style={{ ...cardStyle, padding:'24px' }} className="space-y-5">
          <div>
            <h2 className="font-extrabold text-base" style={{ color:dark?D.text:'#111827' }}>Análisis por imagen</h2>
            <p className="text-xs mt-1" style={{ color:dark?D.sub:'#9ca3af' }}>
              Sube una foto de tu cultivo y la IA identificará plagas, enfermedades o deficiencias.
            </p>
          </div>
          <div className="space-y-2">
            <CampanaSelector campanas={campanas} value={imgCampanaId} onChange={setImgCampanaId} dark={dark} ist={ist} lst={lst} opcional/>
            <VariedadBadge campana={campanaObj(imgCampanaId)} dark={dark}/>
          </div>
          <div>
            <label style={lst}>Imagen del cultivo *</label>
            <div className="border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all"
              style={{ borderColor:imgPreview?'#16a34a':(dark?'rgba(255,255,255,0.15)':'#d1d5db'), backgroundColor:dark?'rgba(255,255,255,0.03)':'#f9fafb', minHeight:'160px' }}
              onClick={() => fileInputRef.current?.click()}>
              {imgPreview ? (
                <div className="relative">
                  <img src={imgPreview} alt="preview" className="w-full max-h-64 object-cover"/>
                  <button className="absolute top-2 right-2 rounded-full p-1" style={{ backgroundColor:'rgba(0,0,0,0.5)' }}
                    onClick={e => { e.stopPropagation(); reiniciarImagen() }}>
                    <X size={14} style={{ color:'#fff' }}/>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Upload size={32} style={{ color:dark?D.sub:'#9ca3af' }}/>
                  <p className="text-sm font-medium" style={{ color:dark?D.sub:'#6b7280' }}>Haz clic para subir una foto</p>
                  <p className="text-xs" style={{ color:dark?'rgba(255,255,255,0.3)':'#9ca3af' }}>JPG, PNG, WebP — máx. 20 MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImgChange}/>
          </div>
          <div>
            <label style={lst}>Descripción adicional (opcional)</label>
            <textarea value={imgDesc} onChange={e => setImgDesc(e.target.value)}
              placeholder="Ej: manchas desde hace 3 días, riego por goteo..."
              rows={2} style={{ ...ist, resize:'none' }}/>
          </div>
          {!imgResultado ? (
            <button onClick={analizarImagen} disabled={!imgFile||imgLoading}
              className="btn-primary w-full flex items-center justify-center gap-2">
              {imgLoading
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>Analizando con IA...</>
                : <><Zap size={16}/> Analizar imagen con IA</>}
            </button>
          ) : (
            <ResultadoPanel resultado={imgResultado} dark={dark} guardado={imgGuardado} onGuardar={guardarImagen} onReiniciar={reiniciarImagen}/>
          )}
        </div>
      )}

      </div>

      {/* ── COLUMNA DERECHA: Historial ── */}
      <div className="lg:sticky lg:top-4">
        {/* Cabecera historial */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History size={16} style={{ color:dark?'#4ade80':'#16a34a' }}/>
            <h2 className="text-sm font-extrabold" style={{ color:dark?D.text:'#111827' }}>Historial</h2>
            {historial.length > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor:dark?'rgba(22,163,74,0.15)':'#dcfce7', color:dark?'#4ade80':'#16a34a' }}>
                {histFiltrado.length}{histFiltrado.length!==historial.length && `/${historial.length}`}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowFiltros(v=>!v)}
              className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg transition-all"
              style={{
                backgroundColor:showFiltros||hayFiltros?(dark?'rgba(22,163,74,0.15)':'#f0fdf4'):'transparent',
                color:hayFiltros?(dark?'#4ade80':'#16a34a'):(dark?D.sub:'#9ca3af'),
                border:`1px solid ${hayFiltros?(dark?'rgba(74,222,128,0.3)':'#bbf7d0'):(dark?'rgba(255,255,255,0.08)':'#e5e7eb')}`,
              }}>
              <SlidersHorizontal size={12}/> Filtros {hayFiltros && '•'}
            </button>
            <button onClick={cargarHistorial} className="text-xs font-semibold" style={{ color:dark?D.sub:'#9ca3af' }}>
              Actualizar
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        {showFiltros && (
          <div style={{ ...cardStyle, padding:'14px', marginBottom:'12px' }} className="space-y-3">
            {/* Búsqueda */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
              <input value={filtroBusq} onChange={e => setFiltroBusq(e.target.value)}
                placeholder="Buscar diagnóstico, variedad, campaña..."
                style={{ ...ist, paddingLeft:'30px' }}/>
            </div>
            <div className="flex flex-wrap gap-2">
              {/* Severidad */}
              <div className="flex gap-1">
                {[{v:'',l:'Todas sev.'},{v:'leve',l:'Leve'},{v:'moderado',l:'Moderado'},{v:'grave',l:'Grave'}].map(({ v, l }) => (
                  <button key={v} onClick={() => setFiltroSev(v)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all"
                    style={{
                      backgroundColor:filtroSev===v?(dark?'rgba(22,163,74,0.20)':'#dcfce7'):(dark?'rgba(255,255,255,0.05)':'#f3f4f6'),
                      color:filtroSev===v?(dark?'#4ade80':'#15803d'):(dark?D.sub:'#6b7280'),
                      border:`1px solid ${filtroSev===v?(dark?'rgba(74,222,128,0.3)':'#bbf7d0'):'transparent'}`,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
              {/* Método */}
              <div className="flex gap-1">
                {[{v:'',l:'Todos'},{v:'formulario',l:'Formulario'},{v:'imagen',l:'Imagen'}].map(({ v, l }) => (
                  <button key={v} onClick={() => setFiltroMetodo(v)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-full transition-all"
                    style={{
                      backgroundColor:filtroMetodo===v?(dark?'rgba(96,165,250,0.15)':'#dbeafe'):(dark?'rgba(255,255,255,0.05)':'#f3f4f6'),
                      color:filtroMetodo===v?(dark?'#60a5fa':'#1d4ed8'):(dark?D.sub:'#6b7280'),
                      border:`1px solid ${filtroMetodo===v?(dark?'rgba(96,165,250,0.3)':'#bfdbfe'):'transparent'}`,
                    }}>
                    {l}
                  </button>
                ))}
              </div>
              {hayFiltros && (
                <button onClick={limpiarFiltros} className="text-xs font-bold flex items-center gap-1"
                  style={{ color:dark?'#f87171':'#dc2626' }}>
                  <X size={11}/> Limpiar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lista */}
        {histLoading ? (
          <div className="flex items-center justify-center py-10">
            <span className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : histFiltrado.length===0 ? (
          <div style={{ ...cardStyle, padding:'32px' }} className="text-center">
            <FlaskConical size={32} className="mx-auto mb-2" style={{ color:dark?D.sub:'#d1d5db' }}/>
            <p className="text-sm" style={{ color:dark?D.sub:'#9ca3af' }}>
              {hayFiltros ? 'Sin resultados con esos filtros.' : 'Sin diagnósticos registrados aún.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[70vh] overflow-y-auto thin-scroll pr-1">
            {histFiltrado.map(d => (
              <DiagCard key={d.id} dark={dark} diag={d} onVer={setDetalleItem} onDelete={eliminarDiag}/>
            ))}
          </div>
        )}
      </div>

      </div>

      {detalleItem && (
        <DetalleModal dark={dark} diag={detalleItem} onClose={() => setDetalleItem(null)} onDelete={eliminarDiag}/>
      )}
    </div>
  )
}

