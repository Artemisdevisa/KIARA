import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import Loading from '../../components/ui/Loading'
import toast from 'react-hot-toast'
import { ArrowLeft, MapPin, Ruler, Edit, Sprout, Activity } from 'lucide-react'

export default function BiohuertosDetail() {
  const { id } = useParams()
  const [bio, setBio] = useState(null)
  const [cultivos, setCultivos] = useState([])
  const [monitoreos, setMonitoreos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/biohuertos/${id}/`),
      api.get(`/cultivos/?biohuerto=${id}`),
      api.get(`/monitoreo/?biohuerto=${id}`),
    ]).then(([b, c, m]) => {
      setBio(b.data)
      setCultivos(c.data)
      setMonitoreos(m.data.slice(0, 5))
    }).catch(() => toast.error('Error al cargar.')).finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading />
  if (!bio) return <p className="text-gray-500">Biohuerto no encontrado.</p>

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/biohuertos" className="text-gray-400 hover:text-gray-600"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-gray-800">{bio.nombre}</h1>
        {bio.codigo && <span className="badge-gray">{bio.codigo}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-gray-700 mb-3">Información del biohuerto</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2"><MapPin size={14} className="text-gray-400 mt-0.5" /><span>{bio.ubicacion}</span></div>
            <div className="flex items-center gap-2"><Ruler size={14} className="text-gray-400" /><span>{bio.area} m²</span></div>
            {bio.descripcion && <p className="text-gray-500 pt-2 border-t border-gray-100">{bio.descripcion}</p>}
          </div>
          <Link to={`/biohuertos/${id}/editar`} className="btn-secondary text-xs flex items-center gap-1 mt-4 w-fit">
            <Edit size={13} /> Editar
          </Link>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-700 flex items-center gap-2"><Sprout size={16} className="text-primary-600" /> Cultivos</h2>
            <Link to={`/cultivos/nuevo`} className="text-xs text-primary-600 hover:underline">+ Añadir</Link>
          </div>
          {cultivos.length === 0 ? (
            <p className="text-sm text-gray-400">Sin cultivos registrados.</p>
          ) : (
            <div className="space-y-2">
              {cultivos.map(c => (
                <Link key={c.id} to={`/cultivos/${c.id}`} className="flex items-center justify-between py-1.5 hover:bg-gray-50 rounded px-1">
                  <span className="text-sm text-gray-700">{c.nombre}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.estado === 'activo' ? 'bg-green-100 text-green-700' :
                    c.estado === 'cosechado' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                  }`}>{c.etapa_display}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Último monitoreo */}
      {monitoreos.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Activity size={16} className="text-blue-500" /> Últimos registros de monitoreo
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                  <th className="pb-2">Fecha</th>
                  <th className="pb-2">Humedad</th>
                  <th className="pb-2">Temp.</th>
                  <th className="pb-2">Luz</th>
                  <th className="pb-2">Incidencias</th>
                </tr>
              </thead>
              <tbody>
                {monitoreos.map(m => (
                  <tr key={m.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 text-gray-600">{m.fecha}</td>
                    <td className="py-2">{m.humedad ? `${m.humedad}%` : '-'}</td>
                    <td className="py-2">{m.temperatura ? `${m.temperatura}°C` : '-'}</td>
                    <td className="py-2">{m.luminosidad_display || '-'}</td>
                    <td className="py-2 text-gray-400 max-w-xs truncate">{m.incidencias || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link to="/monitoreo" className="text-xs text-primary-600 hover:underline mt-2 block">Ver historial completo →</Link>
        </div>
      )}
    </div>
  )
}
