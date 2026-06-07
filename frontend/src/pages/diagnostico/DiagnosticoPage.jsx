import { useState, useEffect } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Stethoscope, ChevronRight, ChevronLeft, Save, RotateCcw } from 'lucide-react'

const PARTES = [
  { value: 'hoja', label: 'Hoja', emoji: '🍃' },
  { value: 'tallo', label: 'Tallo', emoji: '🌿' },
  { value: 'raiz', label: 'Raíz', emoji: '🌱' },
  { value: 'fruto', label: 'Fruto', emoji: '🍅' },
  { value: 'toda_la_planta', label: 'Toda la planta', emoji: '🌾' },
]

const SINTOMAS = [
  { key: 'manchas_amarillas', label: 'Manchas amarillas' },
  { key: 'manchas_marrones', label: 'Manchas marrones' },
  { key: 'manchas_blancas_polvo', label: 'Polvo blanco sobre hojas' },
  { key: 'hojas_enrolladas', label: 'Hojas enrolladas o deformadas' },
  { key: 'tallos_blandos', label: 'Tallos blandos o acostados' },
  { key: 'presencia_insectos', label: 'Presencia de insectos' },
  { key: 'raices_podridas', label: 'Raíces podridas o negras' },
  { key: 'frutos_deformes', label: 'Frutos deformes o manchados' },
]

export default function DiagnosticoPage() {
  const [paso, setPaso] = useState(1)
  const [cultivos, setCultivos] = useState([])
  const [cultivoId, setCultivoId] = useState('')
  const [parte, setParte] = useState('')
  const [sintomas, setSintomas] = useState([])
  const [resultado, setResultado] = useState(null)
  const [guardado, setGuardado] = useState(false)
  const [loading, setLoading] = useState(false)

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
      await api.post('/diagnosticos/', {
        cultivo: cultivoId,
        parte_afectada: parte,
        sintomas,
        ...resultado,
      })
      toast.success('Diagnóstico guardado en el historial.')
      setGuardado(true)
    } catch { toast.error('Error al guardar.') }
  }

  const reiniciar = () => {
    setPaso(1); setCultivoId(''); setParte(''); setSintomas([])
    setResultado(null); setGuardado(false)
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <Stethoscope size={24} className="text-primary-600" />
        <h1 className="text-2xl font-bold text-gray-800">Diagnóstico Fitosanitario</h1>
      </div>

      {/* Barra de pasos */}
      <div className="flex items-center gap-1">
        {[1,2,3,4].map(n => (
          <div key={n} className="flex items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
              paso >= n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{n}</div>
            {n < 4 && <div className={`flex-1 h-1 w-12 rounded ${paso > n ? 'bg-primary-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <div className="ml-2 text-xs text-gray-500">
          {paso === 1 && 'Seleccionar cultivo'}
          {paso === 2 && 'Parte afectada'}
          {paso === 3 && 'Síntomas'}
          {paso === 4 && 'Resultado'}
        </div>
      </div>

      <div className="card">
        {/* Paso 1: Cultivo */}
        {paso === 1 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">Paso 1 — Selecciona el cultivo afectado</h2>
            <select
              className="input-field"
              value={cultivoId}
              onChange={e => setCultivoId(e.target.value)}
            >
              <option value="">Seleccionar cultivo...</option>
              {cultivos.map(c => <option key={c.id} value={c.id}>{c.nombre} ({c.biohuerto_nombre})</option>)}
            </select>
            <div className="flex justify-end">
              <button onClick={() => setPaso(2)} disabled={!cultivoId} className="btn-primary flex items-center gap-2">
                Siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Paso 2: Parte afectada */}
        {paso === 2 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">Paso 2 — ¿Qué parte está afectada?</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PARTES.map(p => (
                <button
                  key={p.value}
                  onClick={() => setParte(p.value)}
                  className={`p-4 rounded-xl border-2 text-center transition-all ${
                    parte === p.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="text-3xl mb-1">{p.emoji}</div>
                  <div className="text-sm font-medium text-gray-700">{p.label}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setPaso(1)} className="btn-secondary flex items-center gap-2"><ChevronLeft size={16} /> Atrás</button>
              <button onClick={() => setPaso(3)} disabled={!parte} className="btn-primary flex items-center gap-2">Siguiente <ChevronRight size={16} /></button>
            </div>
          </div>
        )}

        {/* Paso 3: Síntomas */}
        {paso === 3 && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">Paso 3 — Selecciona los síntomas visibles</h2>
            <div className="space-y-2">
              {SINTOMAS.map(s => (
                <label key={s.key} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={sintomas.includes(s.key)}
                    onChange={() => toggleSintoma(s.key)}
                    className="w-4 h-4 text-primary-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{s.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-between">
              <button onClick={() => setPaso(2)} className="btn-secondary flex items-center gap-2"><ChevronLeft size={16} /> Atrás</button>
              <button onClick={analizar} disabled={sintomas.length === 0 || loading} className="btn-primary flex items-center gap-2">
                {loading ? 'Analizando...' : <><Stethoscope size={16} /> Diagnosticar</>}
              </button>
            </div>
          </div>
        )}

        {/* Paso 4: Resultado */}
        {paso === 4 && resultado && (
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-700">Paso 4 — Resultado del diagnóstico</h2>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <p className="text-xs uppercase font-semibold text-orange-600 mb-1">Diagnóstico probable</p>
              <p className="font-bold text-gray-800 text-lg">{resultado.diagnostico_probable}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-xs uppercase font-semibold text-gray-500 mb-1">Causa probable</p>
              <p className="text-sm text-gray-700">{resultado.causa_probable}</p>
            </div>

            <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
              <p className="text-xs uppercase font-semibold text-primary-600 mb-1">✅ Recomendación de manejo orgánico</p>
              <p className="text-sm text-gray-700">{resultado.recomendacion}</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {!guardado ? (
                <button onClick={guardar} className="btn-primary flex items-center gap-2 text-sm">
                  <Save size={15} /> Guardar diagnóstico
                </button>
              ) : (
                <span className="text-sm text-primary-600 font-medium">✓ Guardado en el historial</span>
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
