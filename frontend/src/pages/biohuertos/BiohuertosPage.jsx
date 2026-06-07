import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { Leaf, Plus, MapPin, Ruler, Edit, Trash2 } from 'lucide-react'

export default function BiohuertosPage() {
  const [biohuertos, setBiohuertos] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = () => {
    api.get('/biohuertos/')
      .then(res => setBiohuertos(res.data))
      .catch(() => toast.error('Error al cargar biohuertos.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este biohuerto y todos sus datos?')) return
    try {
      await api.delete(`/biohuertos/${id}/`)
      toast.success('Biohuerto eliminado.')
      cargar()
    } catch {
      toast.error('No se pudo eliminar.')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mis Biohuertos</h1>
        <Link to="/biohuertos/nuevo" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Nuevo biohuerto
        </Link>
      </div>

      {biohuertos.length === 0 ? (
        <EmptyState
          icon={Leaf}
          title="Sin biohuertos registrados"
          description="Crea tu primer biohuerto para comenzar a gestionar tus cultivos."
          action={<Link to="/biohuertos/nuevo" className="btn-primary text-sm">Crear biohuerto</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {biohuertos.map(b => (
            <div key={b.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-gray-800">{b.nombre}</h2>
                  {b.codigo && <span className="badge-gray">{b.codigo}</span>}
                </div>
                <span className={b.activo ? 'badge-green' : 'badge-red'}>
                  {b.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                  <span>{b.ubicacion}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ruler size={14} className="text-gray-400" />
                  <span>{b.area} m²</span>
                </div>
                <div className="flex items-center gap-2">
                  <Leaf size={14} className="text-gray-400" />
                  <span>{b.cultivos_count} cultivo(s) activo(s)</span>
                </div>
              </div>

              {b.descripcion && (
                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{b.descripcion}</p>
              )}

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <Link to={`/biohuertos/${b.id}`} className="btn-secondary text-xs flex-1 text-center">
                  Ver detalle
                </Link>
                <Link to={`/biohuertos/${b.id}/editar`} className="btn-secondary text-xs px-3">
                  <Edit size={14} />
                </Link>
                <button onClick={() => eliminar(b.id)} className="btn-danger text-xs px-3">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
