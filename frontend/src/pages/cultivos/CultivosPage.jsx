import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { Sprout, Plus, Calendar, Trash2, Edit } from 'lucide-react'

const ETAPA_COLOR = {
  germinacion: 'bg-yellow-100 text-yellow-700',
  crecimiento: 'bg-blue-100 text-blue-700',
  floracion: 'bg-purple-100 text-purple-700',
  cosecha: 'bg-green-100 text-green-700',
}
const ESTADO_COLOR = {
  activo: 'badge-green',
  cosechado: 'badge-gray',
  perdido: 'badge-red',
}

export default function CultivosPage() {
  const [cultivos, setCultivos] = useState([])
  const [filtro, setFiltro] = useState('activo')
  const [loading, setLoading] = useState(true)

  const cargar = () => {
    const params = filtro !== 'todos' ? `?estado=${filtro}` : ''
    api.get(`/cultivos/${params}`)
      .then(res => setCultivos(res.data))
      .catch(() => toast.error('Error al cargar.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { setLoading(true); cargar() }, [filtro])

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este cultivo?')) return
    await api.delete(`/cultivos/${id}/`)
    toast.success('Cultivo eliminado.')
    cargar()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-800">Cultivos</h1>
        <Link to="/cultivos/nuevo" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nuevo cultivo
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {[['todos','Todos'],['activo','Activos'],['cosechado','Cosechados'],['perdido','Perdidos']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFiltro(v)}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              filtro === v ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
            }`}
          >{l}</button>
        ))}
      </div>

      {cultivos.length === 0 ? (
        <EmptyState icon={Sprout} title="Sin cultivos" description="Registra tu primer cultivo para comenzar." action={<Link to="/cultivos/nuevo" className="btn-primary text-sm">Registrar cultivo</Link>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cultivos.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{c.nombre}</h3>
                <span className={ESTADO_COLOR[c.estado]}>{c.estado_display}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3">{c.biohuerto_nombre}</p>

              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ETAPA_COLOR[c.etapa]}`}>
                {c.etapa_display}
              </span>

              <div className="mt-3 space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} /> Siembra: {c.fecha_siembra}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} /> Cosecha est.: {c.fecha_estimada_cosecha}
                  {c.dias_para_cosecha !== null && (
                    <span className={`ml-1 ${c.dias_para_cosecha <= 7 ? 'text-orange-600 font-semibold' : 'text-gray-400'}`}>
                      ({c.dias_para_cosecha >= 0 ? `en ${c.dias_para_cosecha}d` : `hace ${Math.abs(c.dias_para_cosecha)}d`})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                <Link to={`/cultivos/${c.id}`} className="btn-secondary text-xs flex-1 text-center">Ver detalle</Link>
                <Link to={`/cultivos/${c.id}`} className="btn-secondary text-xs px-3"><Edit size={13} /></Link>
                <button onClick={() => eliminar(c.id)} className="btn-danger text-xs px-3"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
