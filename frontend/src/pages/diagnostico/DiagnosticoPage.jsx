import { useState, useEffect } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { Stethoscope, ChevronRight, ChevronLeft, Save, RotateCcw, Leaf, Sprout, Network, Apple, TreePine, CheckCircle } from 'lucide-react'

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

const PARTES = [
  { value: 'hoja',          label: 'Hoja',            Icon: Leaf,       color: '#16a34a', darkColor: '#4ade80', bg: '#f0fdf4',  darkBg: 'rgba(22,163,74,0.15)'   },
  { value: 'tallo',         label: 'Tallo',            Icon: Sprout,     color: '#65a30d', darkColor: '#a3e635', bg: '#f7fee7',  darkBg: 'rgba(101,163,13,0.15)'  },
  { value: 'raiz',          label: 'Raíz',             Icon: Network,    color: '#92400e', darkColor: '#d97706', bg: '#fffbeb',  darkBg: 'rgba(146,64,14,0.15)'   },
  { value: 'fruto',         label: 'Fruto',            Icon: Apple,      color: '#dc2626', darkColor: '#f87171', bg: '#fef2f2',  darkBg: 'rgba(220,38,38,0.15)'   },
  { value: 'toda_la_planta',label: 'Toda la planta',   Icon: TreePine,   color: '#0f766e', darkColor: '#2dd4bf', bg: '#f0fdfa',  darkBg: 'rgba(15,118,110,0.15)'  },
]

const SINTOMAS = [
  { key: 'manchas_amarillas',       label: 'Manchas amarillas'             },
  { key: 'manchas_marrones',        label: 'Manchas marrones'              },
  { key: 'manchas_blancas_polvo',   label: 'Polvo blanco sobre hojas'      },
  { key: 'hojas_enrolladas',        label: 'Hojas enrolladas o deformadas' },
  { key: 'tallos_blandos',          label: 'Tallos blandos o acostados'    },
  { key: 'presencia_insectos',      label: 'Presencia de insectos'         },
  { key: 'raices_podridas',         label: 'Raíces podridas o negras'      },
  { key: 'frutos_deformes',         label: 'Frutos deformes o manchados'   },
]

const STEP_LABELS = ['Cultivo', 'Parte afectada', 'Síntomas', 'Resultado']

export default function DiagnosticoPage() {
  const { dark } = useTheme()
  const [paso, setPaso]         = useState(1)
  const [cultivos, setCultivos] = useState([])
  const [cultivoId, setCultivoId] = useState('')
  const [parte, setParte]       = useState('')
  const [sintomas, setSintomas] = useState([])
  const [resultado, setResultado] = useState(null)
  const [guardado, setGuardado] = useState(false)
  const [loading, setLoading]   = useState(false)

  useEffect(() => {
    api.get('/cultivos/?estado=activo').then(res => setCultivos(res.data))
  }, [])

  const toggleSintoma = key => {
    setSintomas(prev => prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key])
  }

  const analizar = async () => {
    setLoading(true)
    try {
      const res = await api.post('/diagnosticos/analizar/', { parte_afectada: parte, sintomas })
      setResultado(res.data)
      setPaso(4)
    } catch { toast.error('Error al analizar.') }
    finally { setLoading(false) }
  }

  const guardar = async () => {
    try {
      await api.post('/diagnosticos/', { cultivo: cultivoId, parte_afectada: parte, sintomas, ...resultado })
      toast.success('Diagnóstico guardado en el historial.')
      setGuardado(true)
    } catch { toast.error('Error al guardar.') }
  }

  const reiniciar = () => {
    setPaso(1); setCultivoId(''); setParte(''); setSintomas([])
    setResultado(null); setGuardado(false)
  }

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }
  const inputStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    width: '100%', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none',
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
            Diagnóstico Fitosanitario
          </h1>
          <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
            Identifica problemas en tus cultivos paso a paso
          </p>
        </div>
      </div>

      {/* Barra de pasos */}
      <div style={cardStyle} className="p-4">
        <div className="flex items-center">
          {[1, 2, 3, 4].map((n, idx) => (
            <div key={n} className="flex items-center" style={{ flex: n < 4 ? 1 : 'none' }}>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                  style={{
                    backgroundColor: paso > n ? '#16a34a' : paso === n ? '#16a34a' : dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6',
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

        {/* Paso 1: Cultivo */}
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

        {/* Paso 2: Parte afectada */}
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
                  <button
                    key={p.value}
                    onClick={() => setParte(p.value)}
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

        {/* Paso 3: Síntomas */}
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
                      {checked && <CheckCircle size={13} style={{ color: '#fff' }} />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={checked}
                      onChange={() => toggleSintoma(s.key)}
                    />
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
              <button onClick={analizar} disabled={sintomas.length === 0 || loading} className="btn-primary flex items-center gap-2 text-sm">
                {loading ? 'Analizando...' : <><Stethoscope size={15} /> Diagnosticar</>}
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Resultado */}
        {paso === 4 && resultado && (
          <div className="space-y-4">
            <h2 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>
              Resultado del diagnóstico
            </h2>

            <div className="p-4 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(202,138,4,0.10)' : '#fffbeb', border: `1px solid ${dark ? 'rgba(202,138,4,0.30)' : '#fde68a'}` }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: dark ? '#fbbf24' : '#d97706' }}>Diagnóstico probable</p>
              <p className="font-extrabold text-lg" style={{ color: dark ? D.text : '#111827' }}>
                {resultado.diagnostico_probable}
              </p>
            </div>

            <div className="p-4 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${dark ? D.cardBorder : '#e5e7eb'}` }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: dark ? D.sub : '#9ca3af' }}>Causa probable</p>
              <p className="text-sm" style={{ color: dark ? D.text : '#374151' }}>
                {resultado.causa_probable}
              </p>
            </div>

            <div className="p-4 rounded-xl"
              style={{ backgroundColor: dark ? 'rgba(22,163,74,0.10)' : '#f0fdf4', border: `1px solid ${dark ? 'rgba(22,163,74,0.30)' : '#bbf7d0'}` }}>
              <p className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: dark ? '#4ade80' : '#16a34a' }}>Recomendación de manejo orgánico</p>
              <p className="text-sm" style={{ color: dark ? D.text : '#374151' }}>
                {resultado.recomendacion}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {!guardado ? (
                <button onClick={guardar} className="btn-primary flex items-center gap-2 text-sm">
                  <Save size={15} /> Guardar diagnóstico
                </button>
              ) : (
                <span className="text-sm font-bold flex items-center gap-1.5"
                  style={{ color: dark ? '#4ade80' : '#16a34a' }}>
                  <CheckCircle size={16} /> Guardado en el historial
                </span>
              )}
              <button onClick={reiniciar} className="btn-secondary flex items-center gap-2 text-sm">
                <RotateCcw size={15} /> Nuevo diagnóstico
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
