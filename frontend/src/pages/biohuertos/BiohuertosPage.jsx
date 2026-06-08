import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../../api/axios'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  TreePine, Plus, Search, Pencil, Trash2, X, MapPin, Ruler,
  Power, Navigation, FileText, Eye, Upload, Paperclip, ChevronDown,
} from 'lucide-react'

const ESTADO_FILTERS = [
  { value: '',         label: 'Todos'   },
  { value: 'activo',   label: 'Activo'  },
  { value: 'inactivo', label: 'Inactivo'},
]

const TIPO_DOC = [
  { value: 'licencia',       label: 'Licencia'       },
  { value: 'certificacion',  label: 'Certificación'  },
  { value: 'permiso',        label: 'Permiso'        },
  { value: 'otro',           label: 'Otro'           },
]

const TIPO_COLOR = {
  licencia:      { bg: 'rgba(59,130,246,0.15)',  text: '#60a5fa'  },
  certificacion: { bg: 'rgba(168,85,247,0.15)',  text: '#c084fc'  },
  permiso:       { bg: 'rgba(234,179,8,0.15)',   text: '#facc15'  },
  otro:          { bg: 'rgba(255,255,255,0.08)', text: '#94a3b8'  },
}
const TIPO_COLOR_L = {
  licencia:      { bg: '#dbeafe', text: '#1d4ed8' },
  certificacion: { bg: '#f3e8ff', text: '#7e22ce' },
  permiso:       { bg: '#fef9c3', text: '#854d0e' },
  otro:          { bg: '#f3f4f6', text: '#6b7280' },
}

const EMPTY_FORM = {
  nombre: '', ubicacion: '', area: '', descripcion: '',
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

/* ── Google Maps loader ── */
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
    s.onload = () => { gmapReady = true; gmapCallbacks.forEach(cb => cb()); gmapCallbacks = [] }
    document.head.appendChild(s)
  })
}

/* ── Mapa satélite ── */
function MapPicker({ dark, latitud, longitud, onLocationSelect }) {
  const mapDivRef = useRef(null)
  const searchRef = useRef(null)
  const mapRef    = useRef(null)
  const markerRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => { loadGoogleMaps().then(() => setReady(true)) }, [])

  useEffect(() => {
    if (!ready || !mapDivRef.current) return
    const DEFAULT_CENTER = { lat: -6.7714, lng: -79.8409 }
    const center = latitud && longitud
      ? { lat: parseFloat(latitud), lng: parseFloat(longitud) }
      : DEFAULT_CENTER
    const map = new window.google.maps.Map(mapDivRef.current, {
      center, zoom: latitud && longitud ? 16 : 13, mapTypeId: 'satellite',
      mapTypeControl: false, streetViewControl: false, fullscreenControl: false,
      zoomControlOptions: { position: window.google.maps.ControlPosition.RIGHT_BOTTOM },
    })
    mapRef.current = map
    if (latitud && longitud) {
      markerRef.current = new window.google.maps.Marker({ position: center, map, draggable: true })
      markerRef.current.addListener('dragend', e => reverseGeocode(e.latLng))
    }
    map.addListener('click', e => placeMarker(e.latLng))
    if (searchRef.current) {
      const ac = new window.google.maps.places.Autocomplete(searchRef.current, {
        componentRestrictions: { country: 'pe' }, fields: ['geometry', 'formatted_address'],
      })
      ac.addListener('place_changed', () => {
        const place = ac.getPlace()
        if (!place.geometry?.location) return
        map.setCenter(place.geometry.location); map.setZoom(17)
        placeMarker(place.geometry.location)
      })
    }
  }, [ready])

  const placeMarker = latLng => {
    if (markerRef.current) { markerRef.current.setPosition(latLng) }
    else {
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
      onLocationSelect({ latitud: latLng.lat(), longitud: latLng.lng(), departamento, provincia, distrito, direccion: results[0].formatted_address })
    })
  }

  const inputStyle = {
    width: '100%', padding: '7px 12px 7px 32px', fontSize: '12px', borderRadius: '8px', outline: 'none',
    backgroundColor: dark ? D.inputBg : '#f9fafb', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
  }
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: dark ? D.sub : '#9ca3af' }} />
        <input ref={searchRef} type="text" placeholder="Buscar dirección en Perú..." style={inputStyle} />
      </div>
      <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}` }}>
        {!ready && (
          <div className="flex items-center justify-center" style={{ height: '220px', backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f3f4f6' }}>
            <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div ref={mapDivRef} style={{ width: '100%', height: '220px', display: ready ? 'block' : 'none' }} />
        {!latitud && ready && (
          <div className="absolute bottom-2 left-2 right-2 flex justify-center pointer-events-none">
            <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff' }}>
              Haz clic en el mapa para marcar la ubicación
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Preview PDF modal (full-screen overlay) ── */
function PdfPreviewModal({ dark, url, nombre, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ backgroundColor: dark ? '#1a2332' : '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
        <div className="flex items-center gap-2.5">
          <FileText size={16} style={{ color: '#60a5fa' }} />
          <span className="text-sm font-semibold text-white truncate max-w-xs">{nombre}</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.10)'}>
            <Eye size={13} /> Abrir en nueva pestaña
          </a>
          <button onClick={onClose} className="p-2 rounded-lg text-white"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.25)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}>
            <X size={16} />
          </button>
        </div>
      </div>
      {/* PDF iframe */}
      <div className="flex-1 relative">
        <iframe src={url} className="w-full h-full border-0" title={nombre} />
      </div>
    </div>
  )
}

/* ── Sección de documentos dentro del modal ── */
function DocSection({ dark, biohuerto, stagedDocs, setStagedDocs }) {
  const fileRef = useRef(null)
  const [docs,       setDocs]       = useState(biohuerto?.documentos ?? [])
  const [uploading,  setUploading]  = useState(false)
  const [preview,    setPreview]    = useState(null) // { url, nombre }
  const [collapsed,  setCollapsed]  = useState(false)

  const fetchDocs = async () => {
    if (!biohuerto) return
    try {
      const res = await api.get(`/biohuertos/${biohuerto.id}/documentos/`)
      setDocs(res.data)
    } catch { /* silent */ }
  }

  const inputStyle = {
    backgroundColor: dark ? D.inputBg : '#f9fafb',
    border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
    color: dark ? D.text : '#111827',
    borderRadius: '8px', padding: '6px 10px', fontSize: '12px', outline: 'none',
  }
  const labelSt = { fontSize: '13px', fontWeight: 700, color: dark ? D.sub : '#6b7280' }

  const handleFileChange = e => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const newStaged = files.map(f => ({
      file:              f,
      nombre:            f.name.replace(/\.[^/.]+$/, ''),
      tipo:              'otro',
      fecha_emision:     '',
      fecha_vencimiento: '',
      objectUrl:         URL.createObjectURL(f),
    }))
    if (biohuerto) {
      // upload immediately
      uploadFiles(newStaged)
    } else {
      setStagedDocs(prev => [...prev, ...newStaged])
    }
    e.target.value = ''
  }

  const uploadFiles = async (files) => {
    setUploading(true)
    for (const f of files) {
      try {
        const fd = new FormData()
        fd.append('archivo',           f.file)
        fd.append('nombre',            f.nombre)
        fd.append('tipo',              f.tipo)
        if (f.fecha_emision)     fd.append('fecha_emision',     f.fecha_emision)
        if (f.fecha_vencimiento) fd.append('fecha_vencimiento', f.fecha_vencimiento)
        await api.post(`/biohuertos/${biohuerto.id}/documentos/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success(`"${f.nombre}" subido.`)
      } catch { toast.error(`Error al subir "${f.nombre}".`) }
    }
    setUploading(false)
    fetchDocs()
  }

  const handleDeleteSaved = async (doc) => {
    try {
      await api.delete(`/biohuertos/documentos/${doc.id}/`)
      setDocs(prev => prev.filter(d => d.id !== doc.id))
      toast.success('Documento eliminado.')
    } catch { toast.error('No se pudo eliminar.') }
  }

  const handleDeleteStaged = idx => {
    setStagedDocs(prev => {
      URL.revokeObjectURL(prev[idx].objectUrl)
      return prev.filter((_, i) => i !== idx)
    })
  }

  const updateStaged = (idx, field, value) =>
    setStagedDocs(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))

  const tipoBadge = (tipo, dark) => {
    const c = dark ? TIPO_COLOR[tipo] ?? TIPO_COLOR.otro : TIPO_COLOR_L[tipo] ?? TIPO_COLOR_L.otro
    return (
      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
        style={{ backgroundColor: c.bg, color: c.text }}>
        {TIPO_DOC.find(t => t.value === tipo)?.label ?? tipo}
      </span>
    )
  }

  const divider = dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'
  const sectionBg = dark ? 'rgba(255,255,255,0.03)' : '#f9fafb'

  return (
    <>
      {/* Section header */}
      <div style={{ borderTop: `1px solid ${divider}`, paddingTop: '16px' }}>
        <button type="button"
          className="flex items-center justify-between w-full"
          onClick={() => setCollapsed(c => !c)}>
          <div className="flex items-center gap-2">
            <Paperclip size={14} style={{ color: dark ? '#60a5fa' : '#2563eb' }} />
            <span className="text-xs font-extrabold uppercase tracking-wide"
              style={{ color: dark ? D.text : '#374151' }}>
              Documentos PDF
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: dark ? 'rgba(96,165,250,0.15)' : '#dbeafe', color: dark ? '#60a5fa' : '#1d4ed8' }}>
              {docs.length + stagedDocs.length}
            </span>
          </div>
          <ChevronDown size={14} style={{
            color: dark ? D.sub : '#9ca3af',
            transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }} />
        </button>

        {!collapsed && (
          <div className="mt-3 space-y-2">
            {/* Docs ya guardados */}
            {docs.map(doc => (
              <div key={doc.id} className="flex items-center gap-2 p-2.5 rounded-xl"
                style={{ backgroundColor: sectionBg, border: `1px solid ${divider}` }}>
                <FileText size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: dark ? D.text : '#111827' }}>{doc.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {tipoBadge(doc.tipo, dark)}
                    {doc.fecha_vencimiento && (
                      <span className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>
                        Vence: {doc.fecha_vencimiento}
                      </span>
                    )}
                  </div>
                </div>
                <button type="button"
                  onClick={() => setPreview({ url: doc.archivo_url, nombre: doc.nombre })}
                  className="p-1.5 rounded-lg transition-colors shrink-0"
                  title="Ver PDF"
                  style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Eye size={15} />
                </button>
                <button type="button"
                  onClick={() => handleDeleteSaved(doc)}
                  className="p-1.5 rounded-lg transition-colors shrink-0"
                  title="Eliminar"
                  style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            {/* Docs en staging (solo en crear) */}
            {stagedDocs.map((doc, idx) => (
              <div key={idx} className="rounded-xl p-3 space-y-2"
                style={{ backgroundColor: sectionBg, border: `1px dashed ${dark ? 'rgba(96,165,250,0.35)' : '#93c5fd'}` }}>
                <div className="flex items-center gap-2">
                  <FileText size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: dark ? 'rgba(96,165,250,0.15)' : '#dbeafe', color: dark ? '#60a5fa' : '#1d4ed8' }}>
                    pendiente
                  </span>
                  <span className="text-[13px] truncate flex-1" style={{ color: dark ? D.sub : '#6b7280' }}>
                    {doc.file.name}
                  </span>
                  <button type="button" onClick={() => setPreview({ url: doc.objectUrl, nombre: doc.nombre })}
                    className="p-1.5 rounded-lg shrink-0" title="Vista previa"
                    style={{ color: dark ? '#60a5fa' : '#2563eb', backgroundColor: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <Eye size={14} />
                  </button>
                  <button type="button" onClick={() => handleDeleteStaged(idx)}
                    className="p-1.5 rounded-lg shrink-0" title="Quitar"
                    style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <X size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p style={{ ...labelSt, marginBottom: '3px' }}>Nombre</p>
                    <input value={doc.nombre} onChange={e => updateStaged(idx, 'nombre', e.target.value)}
                      style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <p style={{ ...labelSt, marginBottom: '3px' }}>Tipo</p>
                    <select value={doc.tipo} onChange={e => updateStaged(idx, 'tipo', e.target.value)}
                      style={{ ...inputStyle, width: '100%' }}>
                      {TIPO_DOC.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <p style={{ ...labelSt, marginBottom: '3px' }}>Emisión</p>
                    <input type="date" value={doc.fecha_emision}
                      onChange={e => updateStaged(idx, 'fecha_emision', e.target.value)}
                      style={{ ...inputStyle, width: '100%' }} />
                  </div>
                  <div>
                    <p style={{ ...labelSt, marginBottom: '3px' }}>Vencimiento</p>
                    <input type="date" value={doc.fecha_vencimiento}
                      onChange={e => updateStaged(idx, 'fecha_vencimiento', e.target.value)}
                      style={{ ...inputStyle, width: '100%' }} />
                  </div>
                </div>
              </div>
            ))}

            {/* Upload button */}
            <input ref={fileRef} type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
            <button type="button" disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                border: `1.5px dashed ${dark ? 'rgba(255,255,255,0.18)' : '#d1d5db'}`,
                color: dark ? D.sub : '#6b7280',
                backgroundColor: uploading ? (dark ? 'rgba(255,255,255,0.03)' : '#f9fafb') : 'transparent',
              }}
              onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = dark ? 'rgba(96,165,250,0.5)' : '#93c5fd'; if (!uploading) e.currentTarget.style.color = dark ? '#60a5fa' : '#2563eb' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? 'rgba(255,255,255,0.18)' : '#d1d5db'; e.currentTarget.style.color = dark ? D.sub : '#6b7280' }}>
              {uploading
                ? <><div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" /> Subiendo...</>
                : <><Upload size={13} /> Adjuntar PDF(s)</>}
            </button>

            {!biohuerto && stagedDocs.length > 0 && (
              <p className="text-[13px] text-center" style={{ color: dark ? 'rgba(96,165,250,0.70)' : '#2563eb' }}>
                {stagedDocs.length} documento{stagedDocs.length > 1 ? 's' : ''} se adjuntará{stagedDocs.length > 1 ? 'n' : ''} al registrar el biohuerto.
              </p>
            )}
          </div>
        )}
      </div>

      {/* PDF Preview overlay */}
      {preview && <PdfPreviewModal dark={dark} url={preview.url} nombre={preview.nombre} onClose={() => setPreview(null)} />}
    </>
  )
}

/* ── Modal crear/editar biohuerto ── */
function BiohuertModal({ dark, onClose, onSaved, editItem }) {
  const [form,       setForm]       = useState(editItem ? { ...editItem } : EMPTY_FORM)
  const [loading,    setLoading]    = useState(false)
  const [stagedDocs, setStagedDocs] = useState([])

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

  const uploadStagedDocs = async (biohuertId) => {
    for (const d of stagedDocs) {
      try {
        const fd = new FormData()
        fd.append('archivo',           d.file)
        fd.append('nombre',            d.nombre)
        fd.append('tipo',              d.tipo)
        if (d.fecha_emision)     fd.append('fecha_emision',     d.fecha_emision)
        if (d.fecha_vencimiento) fd.append('fecha_vencimiento', d.fecha_vencimiento)
        await api.post(`/biohuertos/${biohuertId}/documentos/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } catch { toast.error(`Error al subir "${d.nombre}".`) }
    }
    stagedDocs.forEach(d => URL.revokeObjectURL(d.objectUrl))
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
        const res = await api.post('/biohuertos/', payload)
        if (stagedDocs.length) await uploadStagedDocs(res.data.id)
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
    width: '100%', borderRadius: '10px', padding: '9px 13px', fontSize: '15px', outline: 'none',
  }
  const labelStyle = {
    display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '5px',
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

        {/* Scrollable form */}
        <form onSubmit={submit} className="flex flex-col min-h-0" style={{ flex: 1 }}>
          <div className="overflow-y-auto thin-scroll px-6 pb-4 space-y-4" style={{ flex: 1 }}>

            {/* Nombre */}
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input name="nombre" value={form.nombre} onChange={handle} style={inputStyle}
                placeholder="Huerto Central" required />
              {!editItem && (
                <p className="mt-1 text-[13px]" style={{ color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                  El código (BH-001, BH-002…) se asigna automáticamente al registrar.
                </p>
              )}
              {editItem?.codigo && (
                <p className="mt-1 text-[13px] font-bold" style={{ color: dark ? '#4ade80' : '#16a34a' }}>
                  Código: {editItem.codigo}
                </p>
              )}
            </div>

            {/* Área */}
            <div>
              <label style={labelStyle}>Área (m²) *</label>
              <input name="area" type="number" step="0.01" min="0" value={form.area} onChange={handle}
                style={inputStyle} placeholder="120.00" required />
            </div>

            {/* Mapa */}
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Navigation size={11} /> Ubicación en mapa
                <span style={{ fontWeight: 400, color: dark ? 'rgba(255,255,255,0.30)' : '#9ca3af' }}>
                  — haz clic para marcar
                </span>
              </label>
              <MapPicker dark={dark} latitud={form.latitud} longitud={form.longitud} onLocationSelect={handleMapSelect} />
            </div>

            {/* Departamento / Provincia / Distrito */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label style={labelStyle}>Departamento</label>
                <input name="departamento" value={form.departamento} onChange={handle} style={inputStyle} placeholder="Lambayeque" />
              </div>
              <div>
                <label style={labelStyle}>Provincia</label>
                <input name="provincia" value={form.provincia} onChange={handle} style={inputStyle} placeholder="Chiclayo" />
              </div>
              <div>
                <label style={labelStyle}>Distrito</label>
                <input name="distrito" value={form.distrito} onChange={handle} style={inputStyle} placeholder="Chiclayo" />
              </div>
            </div>

            {/* Coordenadas */}
            {form.latitud && form.longitud && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Latitud</label>
                  <input readOnly value={form.latitud} style={{ ...inputStyle, opacity: 0.6, cursor: 'default' }} />
                </div>
                <div>
                  <label style={labelStyle}>Longitud</label>
                  <input readOnly value={form.longitud} style={{ ...inputStyle, opacity: 0.6, cursor: 'default' }} />
                </div>
              </div>
            )}

            {/* Dirección */}
            <div>
              <label style={labelStyle}>Dirección de referencia *</label>
              <input name="ubicacion" value={form.ubicacion} onChange={handle} style={inputStyle}
                placeholder="Av. Chiclayo 123, Chiclayo" required />
            </div>

            {/* Descripción */}
            <div>
              <label style={labelStyle}>Descripción</label>
              <textarea name="descripcion" value={form.descripcion} onChange={handle} rows={3}
                style={{ ...inputStyle, resize: 'none' }} placeholder="Descripción del biohuerto..." />
            </div>

            {/* Sección documentos */}
            <DocSection
              dark={dark}
              biohuerto={editItem || null}
              stagedDocs={stagedDocs}
              setStagedDocs={setStagedDocs}
            />

          </div>

          {/* Footer fijo */}
          <div className="flex gap-3 px-6 py-4 shrink-0"
            style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : '#f3f4f6'}` }}>
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-sm">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary text-sm">
              {loading ? 'Guardando...' : editItem ? 'Guardar cambios' : 'Registrar'}
            </button>
          </div>
        </form>
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
  const [biohuertos,    setBiohuertos]    = useState([])
  const [loading,       setLoading]       = useState(true)
  const [search,        setSearch]        = useState('')
  const [estadoFilter,  setEstadoFilter]  = useState('')
  const [modalOpen,     setModalOpen]     = useState(false)
  const [editItem,      setEditItem]      = useState(null)
  const [deleteItem,    setDeleteItem]    = useState(null)
  const [delLoading,    setDelLoading]    = useState(false)

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
          className="flex items-center gap-2 btn-primary text-sm">
          <Plus size={15} /> Nuevo biohuerto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center"
        style={{ ...cardStyle, padding: '14px 16px' }}>
        <div className="relative w-64 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: dark ? D.sub : '#9ca3af' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar biohuerto..."
            style={{
              width: '100%', paddingLeft: '32px', paddingRight: '12px',
              paddingTop: '7px', paddingBottom: '7px', fontSize: '15px', borderRadius: '10px', outline: 'none',
              backgroundColor: dark ? D.inputBg : '#f9fafb',
              border: `1px solid ${dark ? D.inputBorder : '#e5e7eb'}`,
              color: dark ? D.text : '#374151', height: '36px',
            }} />
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
                  {['Nombre', 'Ubicación', 'Área', 'Cultivos', 'Docs', 'Coordenadas', 'Estado', ''].map((h, i) => (
                    <th key={i}
                      className={`px-5 py-3 text-left text-xs font-bold uppercase tracking-wide
                        ${i === 1 ? 'hidden md:table-cell' : ''}
                        ${i === 3 ? 'hidden sm:table-cell' : ''}
                        ${i === 4 ? 'hidden sm:table-cell' : ''}
                        ${i === 5 ? 'hidden xl:table-cell' : ''}
                        ${i === 7 ? 'text-right' : ''}`}
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
                      <p className="font-semibold leading-tight" style={{ color: dark ? D.text : '#111827' }}>{b.nombre}</p>
                      {b.codigo && <p className="text-xs" style={{ color: dark ? D.sub : '#9ca3af' }}>{b.codigo}</p>}
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                        <span className="text-xs line-clamp-1" style={{ color: dark ? D.sub : '#6b7280' }}>{b.ubicacion}</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Ruler size={12} style={{ color: dark ? D.sub : '#9ca3af' }} />
                        <span className="text-xs font-medium" style={{ color: dark ? D.text : '#374151' }}>{b.area} m²</span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="text-xs" style={{ color: dark ? D.sub : '#6b7280' }}>
                        {b.cultivos_count} activo{b.cultivos_count !== 1 ? 's' : ''}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      {b.documentos?.length > 0 ? (
                        <span className="flex items-center gap-1 text-xs font-bold"
                          style={{ color: dark ? '#60a5fa' : '#2563eb' }}>
                          <FileText size={12} /> {b.documentos.length}
                        </span>
                      ) : (
                        <span className="text-xs" style={{ color: dark ? D.sub : '#d1d5db' }}>—</span>
                      )}
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
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(59,130,246,0.15)' : '#eff6ff'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => handleToggleActivo(b)}
                          className="p-2 rounded-lg transition-all duration-150" title={b.activo ? 'Desactivar' : 'Activar'}
                          style={{ color: b.activo ? (dark ? '#4ade80' : '#16a34a') : (dark ? D.sub : '#9ca3af'), backgroundColor: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = b.activo ? (dark ? 'rgba(22,163,74,0.15)' : '#f0fdf4') : (dark ? 'rgba(255,255,255,0.07)' : '#f3f4f6')}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Power size={16} />
                        </button>
                        <button onClick={() => setDeleteItem(b)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: dark ? '#f87171' : '#dc2626', backgroundColor: 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(239,68,68,0.15)' : '#fef2f2'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <Trash2 size={16} />
                        </button>
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
