import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import Breadcrumb from '../../components/ui/Breadcrumb'
import {
  ArrowLeft, MapPin, Ruler, Edit, Activity, TreePine,
  CheckCircle, XCircle, Calendar, User, FileText, Leaf,
  Thermometer, Droplets, Sprout, Globe,
} from 'lucide-react'

const D = {
  light: { bg: '#f8faf7', card: '#ffffff', border: '#e5e7eb', text: '#111827', sub: '#6b7280', muted: '#9ca3af' },
  dark:  { bg: '#0f1520', card: '#1a2332', border: 'rgba(255,255,255,0.08)', text: '#f1f5f9', sub: '#94a3b8', muted: '#64748b' },
}

function InfoRow({ icon: Icon, label, value, dark }) {
  const d = dark ? D.dark : D.light
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: `1px solid ${d.border}` }}>
      <Icon size={14} style={{ color: dark ? '#60a5fa' : '#2563eb', marginTop: 2, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: d.muted }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: d.text }}>{value}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, dark }) {
  const d = dark ? D.dark : D.light
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 px-4 rounded-2xl"
      style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${d.border}` }}>
      <p className="text-3xl font-black" style={{ color }}>{value}</p>
      <p className="text-xs font-semibold text-center" style={{ color: d.muted }}>{label}</p>
    </div>
  )
}

export default function BiohuertosDetail() {
  const { id } = useParams()
  const { dark } = useTheme()
  const [bio, setBio] = useState(null)
  const [campanas, setCampanas] = useState([])
  const [monitoreos, setMonitoreos] = useState([])
  const [loading, setLoading] = useState(true)
  const d = dark ? D.dark : D.light

  useEffect(() => {
    Promise.all([
      api.get(`/biohuertos/${id}/`),
      api.get(`/campanas/?biohuerto=${id}`),
      api.get(`/monitoreo/?biohuerto=${id}`),
    ]).then(([b, c, m]) => {
      setBio(b.data)
      setCampanas(Array.isArray(c.data) ? c.data : (c.data.results || []))
      setMonitoreos((Array.isArray(m.data) ? m.data : (m.data.results || [])).slice(0, 5))
    }).catch(() => toast.error('Error al cargar.')).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  )
  if (!bio) return <p style={{ color: d.sub }}>Biohuerto no encontrado.</p>

  const campanas_activas = campanas.filter(c => c.estado === 'activa').length
  const campanas_total   = campanas.length
  const ubicacion_full   = [bio.distrito, bio.provincia, bio.departamento].filter(Boolean).join(', ')

  const ESTADO_CAMP = {
    activa:      { label: 'Activa',      bg: dark ? 'rgba(22,163,74,0.18)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' },
    planificada: { label: 'Planificada', bg: dark ? 'rgba(234,179,8,0.18)' : '#fef9c3', color: dark ? '#facc15' : '#a16207' },
    cerrada:     { label: 'Cerrada',     bg: dark ? 'rgba(99,102,241,0.18)' : '#ede9fe', color: dark ? '#a78bfa' : '#6d28d9' },
    cancelada:   { label: 'Cancelada',   bg: dark ? 'rgba(239,68,68,0.18)' : '#fee2e2', color: dark ? '#f87171' : '#b91c1c' },
  }

  return (
    <div className="space-y-5 w-full">

      <Breadcrumb items={[{ label: 'Biohuertos', to: '/biohuertos' }, { label: bio.nombre }]} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link to="/biohuertos"
            className="p-2 rounded-xl transition-colors shrink-0"
            style={{ color: d.sub, backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#f3f4f6' }}>
            <ArrowLeft size={16} />
          </Link>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black" style={{ color: d.text }}>{bio.nombre}</h1>
              {bio.codigo && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: dark ? 'rgba(59,130,246,0.18)' : '#eff6ff', color: dark ? '#60a5fa' : '#2563eb' }}>
                  {bio.codigo}
                </span>
              )}
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                style={bio.activo
                  ? { backgroundColor: dark ? 'rgba(22,163,74,0.18)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }
                  : { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: d.muted }}>
                {bio.activo ? <CheckCircle size={10} /> : <XCircle size={10} />}
                {bio.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            {bio.productor_nombre && (
              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: d.muted }}>
                <User size={10} /> {bio.productor_nombre}
              </p>
            )}
          </div>
        </div>
        <Link to={`/biohuertos/${id}/editar`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors shrink-0"
          style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6', color: d.sub }}>
          <Edit size={13} /> Editar
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Campañas totales" value={campanas_total} color={dark ? '#60a5fa' : '#2563eb'} dark={dark} />
        <StatCard label="Campañas activas" value={campanas_activas} color={dark ? '#4ade80' : '#16a34a'} dark={dark} />
        <StatCard label="Área (m²)" value={bio.area ? parseFloat(bio.area).toLocaleString() : '—'} color={dark ? '#f59e0b' : '#d97706'} dark={dark} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

        {/* Datos del biohuerto */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: d.card, border: `1px solid ${d.border}` }}>
          <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2"
            style={{ color: d.sub }}>
            <TreePine size={14} /> Datos del biohuerto
          </h2>
          <div className="space-y-0">
            <InfoRow icon={MapPin} label="Ubicación de referencia" value={bio.ubicacion} dark={dark} />
            {ubicacion_full && <InfoRow icon={Globe} label="Localidad" value={ubicacion_full} dark={dark} />}
            {bio.latitud && bio.longitud && (
              <InfoRow icon={MapPin} label="Coordenadas GPS"
                value={`${parseFloat(bio.latitud).toFixed(6)}, ${parseFloat(bio.longitud).toFixed(6)}`}
                dark={dark} />
            )}
            <InfoRow icon={Ruler} label="Área" value={bio.area ? `${parseFloat(bio.area).toLocaleString()} m²` : null} dark={dark} />
            <InfoRow icon={Calendar} label="Registrado"
              value={bio.created_at ? new Date(bio.created_at).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : null}
              dark={dark} />
            {bio.descripcion && (
              <div className="pt-3">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: d.muted }}>Descripción</p>
                <p className="text-sm leading-relaxed" style={{ color: d.sub }}>{bio.descripcion}</p>
              </div>
            )}
          </div>
        </div>

        {/* Documentos */}
        <div className="rounded-2xl p-5" style={{ backgroundColor: d.card, border: `1px solid ${d.border}` }}>
          <h2 className="text-sm font-black uppercase tracking-wider mb-4 flex items-center gap-2"
            style={{ color: d.sub }}>
            <FileText size={14} /> Documentos
          </h2>
          {(!bio.documentos || bio.documentos.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <FileText size={28} style={{ color: d.muted, opacity: 0.4 }} />
              <p className="text-xs" style={{ color: d.muted }}>Sin documentos registrados</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bio.documentos.map(doc => (
                <a key={doc.id} href={doc.archivo_url} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9fafb', border: `1px solid ${d.border}` }}>
                  <FileText size={14} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate" style={{ color: d.text }}>{doc.nombre}</p>
                    <p className="text-[10px]" style={{ color: d.muted }}>{doc.tipo}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campañas */}
      <div className="rounded-2xl p-5" style={{ backgroundColor: d.card, border: `1px solid ${d.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: d.sub }}>
            <Leaf size={14} /> Campañas
          </h2>
          <Link to="/campanas" className="text-xs font-bold" style={{ color: dark ? '#4ade80' : '#16a34a' }}>
            Ver todas →
          </Link>
        </div>
        {campanas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Sprout size={28} style={{ color: d.muted, opacity: 0.4 }} />
            <p className="text-xs" style={{ color: d.muted }}>Sin campañas registradas en este biohuerto</p>
          </div>
        ) : (
          <div className="space-y-2">
            {campanas.slice(0, 6).map(c => {
              const est = ESTADO_CAMP[c.estado] || ESTADO_CAMP.planificada
              return (
                <Link key={c.id} to={`/campanas/${c.id}`}
                  className="flex items-center justify-between p-3 rounded-xl transition-colors"
                  style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: `1px solid ${d.border}` }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.03)' : '#f9fafb'}>
                  <div className="flex items-center gap-3">
                    <Sprout size={14} style={{ color: dark ? '#4ade80' : '#16a34a' }} />
                    <div>
                      <p className="text-sm font-bold" style={{ color: d.text }}>
                        {c.variedad_str || c.variedad_nombre || '—'}
                      </p>
                      <p className="text-[10px] font-mono" style={{ color: d.muted }}>{c.codigo}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {c.fecha_fin && (
                      <p className="text-[11px]" style={{ color: d.muted }}>
                        {new Date(c.fecha_fin).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })}
                      </p>
                    )}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: est.bg, color: est.color }}>
                      {est.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Últimos monitoreos */}
      {monitoreos.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: d.card, border: `1px solid ${d.border}` }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2" style={{ color: d.sub }}>
              <Activity size={14} /> Últimos monitoreos
            </h2>
            <Link to="/monitoreo" className="text-xs font-bold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>
              Ver historial →
            </Link>
          </div>
          <div className="space-y-2">
            {monitoreos.map(m => (
              <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : '#f9fafb', border: `1px solid ${d.border}` }}>
                <div className="text-[11px] font-mono w-24 shrink-0" style={{ color: d.muted }}>
                  {m.fecha}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {m.temperatura != null && (
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: dark ? '#f87171' : '#dc2626' }}>
                      <Thermometer size={12} /> {m.temperatura}°C
                    </span>
                  )}
                  {m.humedad != null && (
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>
                      <Droplets size={12} /> {m.humedad}%
                    </span>
                  )}
                  {m.incidencias && (
                    <span className="text-xs truncate max-w-xs" style={{ color: d.muted }}>{m.incidencias}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
