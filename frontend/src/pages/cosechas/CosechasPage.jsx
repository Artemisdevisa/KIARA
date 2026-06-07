import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'
import { ShoppingBasket, Plus, Trash2, Edit } from 'lucide-react'

export default function CosechasPage() {
  const [cosechas, setCosechas] = useState([])
  const [loading, setLoading] = useState(true)

  const cargar = () => {
    api.get('/cosechas/')
      .then(res => setCosechas(res.data))
      .catch(() => toast.error('Error al cargar.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const agotar = async (id) => {
    await api.post(`/cosechas/${id}/agotar/`)
    toast.success('Cosecha marcada como agotada.')
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta publicación?')) return
    await api.delete(`/cosechas/${id}/`)
    toast.success('Publicación eliminada.')
    cargar()
  }

  if (loading) return <Loading />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Mis Cosechas Publicadas</h1>
        <Link to="/cosechas/nueva" className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Publicar cosecha
        </Link>
      </div>

      {cosechas.length === 0 ? (
        <EmptyState
          icon={ShoppingBasket}
          title="Sin cosechas publicadas"
          description="Publica tus cosechas disponibles para que consumidores te contacten."
          action={<Link to="/cosechas/nueva" className="btn-primary text-sm">Publicar cosecha</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cosechas.map(c => (
            <div key={c.id} className="card hover:shadow-md transition-shadow">
              {/* Foto */}
              {c.foto_url ? (
                <img src={c.foto_url} alt={c.nombre_producto} className="w-full h-36 object-cover rounded-lg mb-3" />
              ) : (
                <div className="w-full h-36 bg-primary-50 rounded-lg mb-3 flex items-center justify-center">
                  <ShoppingBasket size={36} className="text-primary-200" />
                </div>
              )}

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800">{c.nombre_producto}</h3>
                <span className={c.estado === 'disponible' ? 'badge-green' : 'badge-red'}>
                  {c.estado === 'disponible' ? 'Disponible' : 'Agotado'}
                </span>
              </div>

              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p>🌾 {c.cantidad} {c.unidad_display}</p>
                <p>💰 S/ {c.precio}</p>
                <p>📅 Cosecha: {c.fecha_cosecha}</p>
                <p>📱 {c.contacto}</p>
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                {c.estado === 'disponible' && (
                  <button onClick={() => agotar(c.id)} className="btn-secondary text-xs flex-1">Marcar agotado</button>
                )}
                <button onClick={() => eliminar(c.id)} className="btn-danger text-xs px-3">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
