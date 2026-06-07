import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import { TreePine, Plus, Search, Pencil, Trash2, X, MapPin, Ruler, Leaf, Power, Navigation } from 'lucide-react'

const ESTADO_FILTERS = [
  { value: '',        label: 'Todos'   },
  { value: 'activo',  label: 'Activo'  },
  { value: 'inactivo',label: 'Inactivo'},
]

const EMPTY_FORM = {
  nombre: '', codigo: '', ubicacion: '', area: '', descripcion: '',
  departamento: '', provincia: '', distrito: '', latitud: '', longitud: '',
}

const D = {
  cardBg:      'rgba(255,255,255,0.05)',
  cardBorder:  'rgba(255,255,255,0.09)',
  inputBg:     'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.12)',
  divider:     'rgba(255,255,255,0.07)',
  hoverRow:    'rgba(255,255,255,0.04)',
  btnIdle:     'rgba(255,255,255,0.07)',
  btnBorder:   'rgba(255,255,255,0.10)',
  text:        'rgba(255,255,255,0.90)',
  sub:         'rgba(255,255,255,0.45)',
}

/* ── Carga el script de Google Maps una sola vez ── */
let gmapReady = false
let gmapCallbacks = []

function loadGoogleMaps() {
  if (gmapReady) return Promise.resolve()
  if (window.google?.maps) { gmapReady = true; return Promise.resolve() }
  return new Promise(resolve => {
    gmapCallbacks.push(resolve)
    if (gmapCallbacks.length > 1) return
    const s = document.createElement('script')
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&language=es`
    s.async = true
    s.onload = () => {
      gmapReady = true
      gmapCallbacks.forEach(cb => cb())
      gmapCallbacks = []
    }
    document.head.appendChild(s)
  })
}

/* ── Componente mapa satelital ── */
function MapPicker({ dark, latitud, longitud, onLocationSelect }) {
  const mapDivRef   = useRef(null)
  const searchRef   = useRef(null)
  const mapRef      = useRef(null)
  const markerRef   = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadGoogleMaps().then(() => setReady(true))
  }, [])

  useEffect(() => {
    if (!ready || !mapDivRef.current) return

    const DEFAULT_CENTER = { lat: -6.7714, lng: -79.8409 } // Chiclayo
    const center = latitud && longitud
      ? { lat: parseFloat(latitud), lng: parseFloat(longitud) }
      : DEFAULT_CENTER

    const map = new window.google.maps.Map(mapDivRef.current, {
      center,
      zoom: latitud && longitud ? 16 : 13,
      mapTypeId: 'satellite',
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
    })
    mapRef.current = map

    if (latitud && longitud) {
      markerRef.current = new window.google.maps.Marker({
        position: center, map, draggable: true,
      })
      markerRef.current.addListener('dragend', e => reverseGeocode(e.latLng))
    }

    map.addListener('click', e => placeMarker(e.latLng))

    if (searchRef.current) {
      const ac = new window.google.maps.places.Autocomplete(searchRef.current, {
        componentRestrictions: { country: 'pe' },
        fields: ['geometry', 'formatted_address'],
      })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        if (!place.geometry?.location) return
        map.setCenter(place.geometry.location)
        map.setZoom(17)
        placeMarker(place.geometry.location)
      })
    }
  }, [ready])

  const placeMarker = latLng => {
    if (markerRef.current) {
      markerRef.current.setPosition(latLng)
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: latLng, map: mapRef.current, draggable: true,
        animation: window.google.maps.Animation.DROP,
      })
      markerRef.current.addListener('dragend', e => reverseGeocode(e.latLng))
    }
    reverseGeocode(latLng)
  }

  const reverseGeocode = latLng => {
    const geocoder = new window.google.maps.Geocoder()
    geocoder.geocode({ location: latLng, language: 'es' }, (results, status) => {
      if (status !== 'OK' || !results[0]) return
      const comps = results[0].address_components
      let departamento = '', provincia = '', distrito = ''
      for (const c of comps) {
        if (c.types.includes('administrative_area_level_1')) departamento = c.long_name
        if (c.types.includes('administrative_area_level_2')) provincia    = c.long_name
        if (c.types.includes('locality') || c.types.includes('administrative_area_level_3')) distrito = c.long_name
      }
      onLocationSelect({
        latitud:  latLng.lat(),
        longitud: latLng.lng(),
        departamento, provincia, distrito,
        direccion: results[0].formatted_address,
      })
    })
  }

  const inputStyle = {
    width: '100%', padding: '7px 12px 7px 32px',
    fontSize: '12px', borderRadius: '8px', outline: 'none',
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
  }

  return (
    <div className="space-y-2">
      {/* Buscador */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: dark ? D.sub : '#9ca3af' }} />
        <input ref={searchRef} type="text" placeholder="Buscar dirección en Perú..."
          style={inputStyle} />
      </div>

      {/* Mapa */}
      <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden',
        border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}` }}>
        {!ready && (
          <div className="flex items-center justify-center"
            style={{ height: '220px', backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6' }}>
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={mapDivRef} style={{ width: '100%', height: '220px', display: ready ? 'block' : 'none' }} />
        {!latitud && ready && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none">
            <span className="text-xs px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}>
              Haz clic en el mapa para marcar la ubicación
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Modal crear/editar ── */
function BiohuertModal({ dark, onClose, onSaved, editItem }) {
  const [form, setForm]       = useState(editItem ? { ...editItem } : EMPTY_FORM)
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleMapSelect = ({ latitud, longitud, departamento, provincia, distrito, direccion }) => {
    setForm(f => ({
      ...f,
      latitud:      latitud.toFixed(6),
      longitud:     longitud.toFixed(6),
      departamento: departamento || f.departamento,
      provincia:    provincia    || f.provincia,
      distrito:     distrito     || f.distrito,
      ubicacion:    direccion,
    }))
  }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form }
      if (editItem) {
        await api.patch(`/biohuertos/${editItem.id}/`, payload)
        toast.success('Biohuerto actualizado.')
      } else {
        await api.post('/biohuertos/', payload)
        toast.success('Biohuerto registrado.')
      }
      onSaved()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') Object.values(msg).flat().forEach(m => toast.error(String(m)))
      else toast.error('Error al guardar.')
    } finally { setLoading(false) }
  }

  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl shadow-2xl z-10 flex flex-col"
        style={{ ...panelStyle, maxHeight: '92vh' }}>

        {/* Header fijo */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-base font-extrabold" style={{ color: dark ? D.text : '#111827' }}>
            {editItem ? 'Editar biohuerto' : 'Registrar biohuerto'}
          </h2>
          <button onClick={onClose} style={{ color: D.sub, padding: '4px', borderRadius: '8px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto px-6 pb-6" style={{ flex: 1 }}>
          <form onSubmit={submit} className="space-y-4">

            {/* Nombre / Código */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Nombre</label>
                <input name="nombre" value={form.nombre} onChange={handle} style={inputStyle} placeholder="Huerto Central" required />
              </div>
              <div>
                <label style={labelStyle}>Código</label>
                <input name="codigo" value={form.codigo} onChange={handle} style={inputStyle} placeholder="HUE-001" />
              </div>
            </div>

            {/* Mapa satelital */}
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Navigation size={11} /> Ubicación en mapa
              </label>
              <MapPicker
                dark={dark}
                latitud={form.latitud}
                longitud={form.longitud}
                onLocationSelect={handleMapSelect}
              />
            </div>

            {/* Departamento / Provincia / Distrito */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label style={labelStyle}>Departamento</label>
                <input name="departamento" value={form.departamento} onChange={handle}
                  style={inputStyle} placeholder="La Libertad" />
              </div>
              <div>
                <label style={labelStyle}>Provincia</label>
                <input name="provincia" value={form.provincia} onChange={handle}
                  style={inputStyle} placeholder="Chiclayo" />
              </div>
              <div>
                <label style={labelStyle}>Distrito</label>
                <input name="distrito" value={form.distrito} onChange={handle}
                  style={inputStyle} placeholder="Chiclayo" />
              </div>
            </div>

            {/* Coordenadas (read-only) */}
            {form.latitud && form.longitud && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Latitud</label>
                  <input readOnly value={form.latitud} style={{ ...inputStyle, opacity: 0.7, cursor: 'default' }} />
                </div>
                <div>
                  <label style={labelStyle}>Longitud</label>
                  <input readOnly value={form.longitud} style={{ ...inputStyle, opacity: 0.7, cursor: 'default' }} />
                </div>
              </div>
            )}

            {/* Ubicación texto */}
            <div>
              <label style={labelStyle}>Dirección de referencia</label>
              <input name="ubicacion" value={form.ubicacion} onChange={handle} style={inputStyle}
                placeholder="Av. Chiclayo 123, Chiclayo" required />
            </div>

            {/* Área */}
            <div>
              <label style={labelStyle}>Área (m²)</label>
              <input name="area" type="number" step="0.01" min="0" value={form.area} onChange={handle}
                style={inputStyle} placeholder="120.00" required />
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handle} rows={3}
                style={{ ...inputStyle, resize: 'none' }} placeholder="Descripción del biohuerto..." />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
                {loading ? 'Guardando...' : editItem ? 'Guardar cambios' : 'Registrar'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Modal confirmar eliminar ── */
function ConfirmModal({ dark, item, onClose, onConfirm, loading }) {
  const panelStyle = {
    backgroundColor: dark ? '#1e2a3a' : '#ffffff',
    border: dark ? '1.5px solid rgba(255,255,255,0.10)' : '1.5px solid #e5e7eb',
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 z-10" style={panelStyle}>
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 size={20} className="text-red-600" />
          </div>
          <h3 className="font-extrabold text-base" style={{ color: dark ? D.text : '#111827' }}>¿Eliminar biohuerto?</h3>
          <p className="text-sm" style={{ color: dark ? D.sub : '#6b7280' }}>
            Se eliminará <strong>{item?.nombre}</strong> y todos sus datos permanentemente.
          </p>
          <div className="flex gap-3 w-full pt-1">
            <button onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button onClick={onConfirm} disabled={loading} className="flex-1 btn-danger text-sm">
              {loading ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Página principal ── */
export default function BiohuertosPage() {
  const { dark } = useTheme()
  const [biohuertos, setBiohuertos]     = useState([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [estadoFilter, setEstadoFilter] = useState('')
  const [modalOpen, setModalOpen]       = useState(false)
  const [editItem, setEditItem]         = useState(null)
  const [deleteItem, setDeleteItem]     = useState(null)
  const [delLoading, setDelLoading]     = useState(false)

  const fetchBiohuertos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/biohuertos/')
      setBiohuertos(res.data)
    } catch { toast.error('No se pudo cargar la lista de biohuertos.') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchBiohuertos() }, [fetchBiohuertos])

  const handleToggleActivo = async (b) => {
    try {
      await api.patch(`/biohuertos/${b.id}/`, { activo: !b.activo })
      toast.success(b.activo ? 'Biohuerto desactivado.' : 'Biohuerto activado.')
      fetchBiohuertos()
    } catch { toast.error('No se pudo cambiar el estado.') }
  }

  const handleDelete = async () => {
    setDelLoading(true)
    try {
      await api.delete(`/biohuertos/${deleteItem.id}/`)
      toast.success('Biohuerto eliminado.')
      setDeleteItem(null)
      fetchBiohuertos()
    } catch { toast.error('No se pudo eliminar.') }
    finally { setDelLoading(false) }
  }

  const filtered = biohuertos.filter(b => {
    const q = search.toLowerCase()
    const matchSearch = !search ||
      b.nombre.toLowerCase().includes(q) ||
      b.ubicacion?.toLowerCase().includes(q) ||
      b.codigo?.toLowerCase().includes(q)
    const matchEstado = !estadoFilter ||
      (estadoFilter === 'activo' ? b.activo : !b.activo)
    return matchSearch && matchEstado
  })

  const cardStyle = {
    backgroundColor: dark ? D.cardBg : '#ffffff',
    border: `1.5px solid ${dark ? D.cardBorder : '#e5e7eb'}`,
    borderRadius: '16px',
  }

  return (
    <div className="space-y-5">

      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : '#f0fdf4' }}>
            <TreePine size={19} style={{ color: dark ? 'rgba(255,255,255,0.75)' : '#16a34a' }} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: dark ? D.text : '#111827' }}>Biohuertos</h1>
            <p className="text-xs mt-0.5" style={{ color: dark ? D.sub : '#9ca3af' }}>
              {filtered.length} biohuerto{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setEditItem(null); setModalOpen(true) }}
          className="flex items-center gap-2 btn-primary text-sm"
        >
          <Plus size={15} />
          Nuevo biohuerto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar biohuerto..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px',
              fontSize: '13px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151',
              height: '36px',
            }}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {ESTADO_FILTERS.map(f => (
            <button key={f.value} onClick={() => setEstadoFilter(f.value)}
              className="px-3 rounded-lg text-xs font-bold transition-all"
              style={{
                height: '36px',
                backgroundColor: estadoFilter === f.value ? '#16a34a' : dark ? D.btnIdle : '#f3f4f6',
                border: `1px solid ${estadoFilter === f.value ? '#16a34a' : dark ? D.btnBorder : '#e5e7eb'}`,
                color: estadoFilter === f.value ? '#fff' : dark ? D.sub : '#6b7280',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <TreePine size={36} style={{ color: dark ? D.sub : '#d1d5db' }} />
            <p className="text-sm" style={{ color: dark ? D.sub : '#9ca3af' }}>No se encontraron biohuertos</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: `1px solid ${dark ? D.divider : '#f3f4f6'}` }}>
                  {['Nombre', 'Ubicación', 'Área', 'Cultivos', 'Coordenadas', 'Estado', ''].map((h, i) => (
                    <th key={i}
                      className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide
                        ${i === 1 ? 'hidden md:table-cell' : ''}
                        ${i === 3 ? 'hidden sm:table-cell' : ''}
                        ${i === 4 ? 'hidden xl:table-cell' : ''}
                        ${i === 6 ? 'text-right' : ''}`}
                      style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}
                    style={{ borderBottom: `1px solid ${dark ? D.divider : '#f9fafb'}` }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? D.hoverRow : '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>

                    <td className="px-5 py-3.5">
                      <p className="font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>
                        {b.nombre}
                      </p>
                      {b.codigo && <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>{b.codigo}</p>}
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                        <span className="text-xs line-clamp-1" style={{ color: dark ? D.sub : '#6b7280' }}>
                          {b.ubicacion}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Ruler size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                        <span className="text-xs font-medium" style={{ color: dark ? D.text : '#374151' }}>
                          {b.area} m²
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                        {b.cultivos_count} activo{b.cultivos_count !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 hidden xl:table-cell">
                      {b.latitud && b.longitud ? (
                        <span className="text-xs font-mono" style={{ color: dark ? '#60a5fa' : '#2563eb' }}>
                          {parseFloat(b.latitud).toFixed(4)}, {parseFloat(b.longitud).toFixed(4)}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: dark ? D.sub : '#d1d5db' }}>—</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={b.activo
                          ? { backgroundColor: dark ? 'rgba(22,163,74,0.18)' : '#dcfce7', color: dark ? '#4ade80' : '#15803d' }
                          : { backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#f3f4f6', color: dark ? D.sub : '#9ca3af' }
                        }>
                        {b.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditItem(b); setModalOpen(true) }}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Pencil size={16} /></button>
                        <button onClick={() => handleToggleActivo(b)}
                          className="p-2 rounded-lg transition-all duration-150"
                          title={b.activo ? 'Desactivar' : 'Activar'}
                          style={{ color: b.activo ? (dark ? '#4ade80' : '#16a34a') : (dark ? D.sub : '#9ca3af'), backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = b.activo ? (dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4') : (dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6') }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Power size={16} /></button>
                        <button onClick={() => setDeleteItem(b)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                          onMouseEnter={e => { e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2' }}
                          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                        ><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <BiohuertModal
          dark={dark}
          editItem={editItem}
          onClose={() => { setModalOpen(false); setEditItem(null) }}
          onSaved={() => { setModalOpen(false); setEditItem(null); fetchBiohuertos() }}
        />
      )}
      {deleteItem && (
        <ConfirmModal
          dark={dark}
          item={deleteItem}
          loading={delLoading}
          onClose={() => setDeleteItem(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  )
}
