import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import toast from 'react-hot-toast'
import { ArrowLeft, Droplets, Leaf, AlertTriangle, RotateCcw, Clock, CheckCircle, XCircle } from 'lucide-react'

const ETAPAS = ['germinacion', 'crecimiento', 'floracion', 'cosecha']
const ETAPA_LABEL = { germinacion: 'Germinación', crecimiento: 'Crecimiento', floracion: 'Floración', cosecha: 'Cosecha' }

export default function CultivosDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cultivo, setCultivo] = useState(null)
  const [recomendacion, setRecomendacion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/cultivos/${id}/`).then(async res => {
      setCultivo(res.data)
      try {
        const rec = await api.get(`/cultivos/data/recomendaciones/?nombre=${encodeURIComponent(res.data.nombre)}`)
        setRecomendacion(rec.data)
      } catch { /* sin recomendación */ }
    }).catch(() => toast.error('Error al cargar.')).finally(() => setLoading(false))
  }, [id])

  const cambiarEtapa = async (nuevaEtapa) => {
    await api.patch(`/cultivos/${id}/`, { etapa: nuevaEtapa })
    setCultivo(c => ({ ...c, etapa: nuevaEtapa, etapa_display: ETAPA_LABEL[nuevaEtapa] }))
    toast.success(`Etapa actualizada: ${ETAPA_LABEL[nuevaEtapa]}`)
  }

  const cambiarEstado = async (estado) => {
    if (!confirm(`¿Marcar cultivo como "${estado}"?`)) return
    await api.patch(`/cultivos/${id}/`, { estado })
    toast.success(`Estado actualizado: ${estado}`)
    navigate('/cultivos')
  }

  if (loading) return <Loading />
  if (!cultivo) return <p>Cultivo no encontrado.</p>

  const etapaIdx = ETAPAS.indexOf(cultivo.etapa)

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/cultivos" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">{cultivo.nombre}</h1>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          cultivo.estado === 'activo' ? 'bg-green-100 text-green-700' :
          cultivo.estado === 'cosechado' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
        }`}>{cultivo.estado_display}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Info del cultivo */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-700">Información del cultivo</h2>
          <div className="text-sm text-gray-600 space-y-1.5">
            <p><span className="font-medium">Biohuerto:</span> {cultivo.biohuerto_nombre}</p>
            <p><span className="font-medium">Área/Cantidad:</span> {cultivo.cantidad} {cultivo.unidad}</p>
            <p><span className="font-medium">Siembra:</span> {cultivo.fecha_siembra}</p>
            <p><span className="font-medium">Cosecha estimada:</span> {cultivo.fecha_estimada_cosecha}
              {cultivo.dias_para_cosecha !== null && (
                <span className={`ml-2 text-xs font-semibold ${cultivo.dias_para_cosecha <= 7 && cultivo.dias_para_cosecha >= 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                  ({cultivo.dias_para_cosecha >= 0 ? `en ${cultivo.dias_para_cosecha} días` : `hace ${Math.abs(cultivo.dias_para_cosecha)} días`})
                </span>
              )}
            </p>
            {cultivo.notas && <p className="text-gray-400 pt-2 border-t border-gray-100">{cultivo.notas}</p>}
          </div>

          {/* Cambiar estado */}
          {cultivo.estado === 'activo' && (
            <div className="flex gap-2 pt-2">
              <button onClick={() => cambiarEstado('cosechado')} className="btn-secondary text-xs flex-1 flex items-center justify-center gap-1.5"><CheckCircle size={14} /> Marcar cosechado</button>
              <button onClick={() => cambiarEstado('perdido')} className="btn-danger text-xs flex-1 flex items-center justify-center gap-1.5"><XCircle size={14} /> Marcar perdido</button>
            </div>
          )}
        </div>

        {/* Etapa con barra de progreso */}
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-4">Etapa actual</h2>
          <div className="flex items-center justify-between mb-2">
            {ETAPAS.map((etapa, i) => (
              <button
                key={etapa}
                onClick={() => cambiarEtapa(etapa)}
                disabled={cultivo.estado !== 'activo'}
                className={`flex flex-col items-center gap-1 flex-1 py-2 rounded-lg transition-colors ${
                  i === etapaIdx ? 'bg-primary-100 text-primary-700' :
                  i < etapaIdx ? 'text-primary-400' : 'text-gray-300'
                } ${cultivo.estado === 'activo' ? 'hover:bg-primary-50 cursor-pointer' : 'cursor-default'}`}
              >
                <div className={`w-3 h-3 rounded-full ${i <= etapaIdx ? 'bg-primary-500' : 'bg-gray-200'}`} />
                <span className="text-xs font-medium">{ETAPA_LABEL[etapa]}</span>
              </button>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${((etapaIdx + 1) / ETAPAS.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2 text-center">Toca una etapa para actualizarla</p>
        </div>
      </div>

      {/* Recomendaciones */}
      {recomendacion && (
        <div className="card border-l-4 border-primary-400">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Leaf size={18} className="text-primary-600" /> Recomendaciones para {recomendacion.nombre}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Droplets size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <div><p className="font-medium text-gray-700">Riego</p><p className="text-gray-500">{recomendacion.riego}</p></div>
            </div>
            <div className="flex items-start gap-2">
              <Leaf size={16} className="text-green-500 mt-0.5 shrink-0" />
              <div><p className="font-medium text-gray-700">Sustrato / Abono</p><p className="text-gray-500">{recomendacion.sustrato}</p></div>
            </div>
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-orange-500 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-gray-700">Plagas comunes</p>
                <p className="text-gray-500">{recomendacion.plagas_comunes?.join(', ')}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock size={16} className="text-purple-500 mt-0.5 shrink-0" />
              <div><p className="font-medium text-gray-700">Tiempo de cosecha</p><p className="text-gray-500">{recomendacion.tiempo_cosecha_dias}</p></div>
            </div>
            <div className="flex items-start gap-2 sm:col-span-2">
              <RotateCcw size={16} className="text-teal-500 mt-0.5 shrink-0" />
              <div><p className="font-medium text-gray-700">Rotación sugerida</p><p className="text-gray-500">{recomendacion.rotacion}</p></div>
            </div>
          </div>
          {recomendacion.consejo_extra && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-xs text-primary-700">💡 {recomendacion.consejo_extra}</p>
            </div>
          )}
        </div>
      )}

      {/* Accesos rápidos */}
      <div className="flex flex-wrap gap-2">
        <Link to={`/alertas`} className="btn-secondary text-xs">🔔 Ver alertas del cultivo</Link>
        <Link to={`/diagnostico`} className="btn-secondary text-xs">🔬 Hacer diagnóstico</Link>
        <Link to={`/trazabilidad`} className="btn-secondary text-xs">📊 Ver costos</Link>
      </div>
    </div>
  )
}
