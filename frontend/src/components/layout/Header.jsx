import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Menu, Search, Heart, ShoppingCart, X, ChevronRight, Leaf, ChevronDown,
  LayoutDashboard, ShoppingBag, User, LogOut,
  Home, Store, UsersRound, BookOpen, Mail,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import api from '../../api/axios'

/* ────────────────────────────────────────────
   LOGO
──────────────────────────────────────────── */
function KiaraLogomark({ size = 90 }) {
  return (
    <img src="/sinfondo.png" alt="Kiara logo" style={{ height: size, width: 'auto', objectFit: 'contain', display: 'block' }} />
  )
}

function KiaraWordmark() {
  return (
    <span className="font-black tracking-[0.10em] text-[1.22rem] leading-none select-none"
      style={{ background: 'linear-gradient(135deg,#1B4332 30%,#2D6A4F 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      KIARA
    </span>
  )
}

/* ────────────────────────────────────────────
   BOTONES AUTH
──────────────────────────────────────────── */
function BtnPrimary({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="font-black text-sm px-5 py-2 rounded-full text-white whitespace-nowrap hover:opacity-90 transition-opacity"
      style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 2px 12px rgba(45,106,79,0.22)' }}>
      {children}
    </Link>
  )
}
function BtnSecondary({ to, children, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="font-bold text-sm px-5 py-2 rounded-full whitespace-nowrap hover:bg-[#f0fdf4] transition-colors"
      style={{ color: '#2D6A4F', border: '1.5px solid #2D6A4F' }}>
      {children}
    </Link>
  )
}

/* ────────────────────────────────────────────
   NAV LINKS
──────────────────────────────────────────── */
const NAV = [
  { to: '/',              label: 'Inicio',        end: true,  Icon: Home        },
  { to: '/marketplace',   label: 'Marketplace',   end: false, Icon: Store       },
  { to: '/quienes-somos', label: 'Quiénes Somos', end: false, Icon: UsersRound  },
  { to: '/como-funciona', label: 'Cómo Funciona', end: false, Icon: BookOpen    },
  { to: '/contacto',      label: 'Contacto',      end: false, Icon: Mail        },
]

/* ────────────────────────────────────────────
   SEARCH SUGGESTIONS DROPDOWN
──────────────────────────────────────────── */
function SearchDropdown({ results, query, onSelect, onViewAll, loading }) {
  if (!query || query.length < 2) return null

  return (
    <div className="absolute top-[calc(100%-1px)] left-0 right-0 z-50 rounded-b-2xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 16px 40px rgba(0,0,0,0.12)', border: '1.5px solid #2D6A4F', borderTop: 'none' }}>

      <div className="px-5 pt-4 pb-2">
        <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: '#9CA3AF' }}>
          {loading ? 'Buscando...' : results.length > 0 ? 'PRODUCTOS' : 'Sin resultados'}
        </span>
      </div>

      {results.map(item => (
        <button key={item.id} onClick={() => onSelect(item)}
          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-[#f9fafb] transition-colors text-left group">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm leading-tight line-clamp-1 group-hover:text-[#2D6A4F] transition-colors"
              style={{ color: '#1B4332' }}>
              {item.nombre_producto}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
              {item.biohuerto?.nombre || item.biohuerto_nombre || 'Biohuerto KIARA'}
              {item.precio && <span className="ml-2 font-bold" style={{ color: '#2D6A4F' }}>S/ {item.precio}</span>}
            </p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-xl overflow-hidden" style={{ border: '1px solid #f0fdf4' }}>
            {item.foto_url ? (
              <img src={item.foto_url} alt={item.nombre_producto} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: '#f0fdf4' }}>
                <Leaf size={18} style={{ color: '#86efac' }} />
              </div>
            )}
          </div>
        </button>
      ))}

      {loading && (
        <div className="px-5 pb-3 space-y-3">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-3 animate-pulse">
              <div className="flex-1 space-y-1.5">
                <div className="h-3 rounded bg-gray-100 w-3/4" />
                <div className="h-2.5 rounded bg-gray-100 w-1/2" />
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <button onClick={onViewAll}
          className="w-full flex items-center justify-between px-5 py-3.5 font-bold text-sm transition-colors hover:bg-[#f0fdf4]"
          style={{ color: '#2D6A4F', borderTop: '1px solid #f3f4f6' }}>
          <span>Ver todos los resultados de <strong>"{query}"</strong></span>
          <ChevronRight size={15} />
        </button>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────
   MENU DRAWER — dos columnas: nav + categorías
──────────────────────────────────────────── */
function MenuDrawer({ open, onClose, token, categorias }) {
  const navigate     = useNavigate()
  const [hovCat, setHovCat] = useState(null)

  // Set first category as default hovered when categories load
  useEffect(() => {
    if (categorias.length > 0 && hovCat === null) setHovCat(categorias[0].id)
  }, [categorias])

  const activeCat = categorias.find(c => c.id === hovCat)

  const goTo = path => { navigate(path); onClose() }

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose}
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: 'rgba(27,67,50,0.45)',
          backdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }} />

      {/* Drawer — desde la IZQUIERDA, dos columnas */}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: 'min(560px, 94vw)',
          background: '#fff',
          boxShadow: '8px 0 48px rgba(0,0,0,0.14)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}>

        {/* ── Cabecera ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5">
            <KiaraLogomark size={68} />
            <KiaraWordmark />
          </Link>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <X size={18} />
          </button>
        </div>

        {/* ── Cuerpo: dos columnas ── */}
        <div className="flex flex-1 min-h-0">

          {/* Columna izquierda — NAV + categorías */}
          <div className="w-[200px] shrink-0 flex flex-col border-r border-gray-100 overflow-y-auto">

            {/* Nav links */}
            <nav className="py-3 px-3 space-y-0.5">
              {NAV.map(({ to, label, end, Icon }) => (
                <NavLink key={to} to={to} end={end} onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive ? 'text-bio-dark' : 'text-bio-muted hover:text-bio-dark hover:bg-gray-50'}`}
                  style={({ isActive }) => isActive ? { backgroundColor: '#D8F3DC' } : {}}>
                  <Icon size={15} className="shrink-0" />
                  <span className="flex-1 text-[13px]">{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Separador categorías */}
            <div className="px-4 pt-3 pb-2 border-t border-gray-100">
              <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: '#9CA3AF' }}>
                Categorías
              </p>
            </div>

            {/* Lista de categorías */}
            <div className="flex-1 overflow-y-auto pb-3 px-1.5">
              {categorias.length === 0 ? (
                <div className="px-3 py-2 space-y-1.5 animate-pulse">
                  {[1,2,3,4,5,6].map(n => <div key={n} className="h-9 rounded-xl bg-gray-100" />)}
                </div>
              ) : (
                categorias.map(cat => (
                  <button
                    key={cat.id}
                    onMouseEnter={() => setHovCat(cat.id)}
                    onFocus={() => setHovCat(cat.id)}
                    onClick={() => goTo(`/marketplace?categoria=${cat.slug}`)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                    style={{
                      background: hovCat === cat.id ? '#f0fdf4' : 'transparent',
                      color: hovCat === cat.id ? '#1B4332' : '#4B5563',
                    }}>
                    <span className="text-base leading-none">{cat.emoji}</span>
                    <span className="flex-1 text-[13px] font-bold leading-tight">{cat.nombre}</span>
                    <ChevronRight size={13}
                      style={{ color: hovCat === cat.id ? '#2D6A4F' : '#D1D5DB' }} />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Columna derecha — tipos de la categoría hovereada */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {activeCat ? (
              <>
                {/* Header categoría activa */}
                <div className="px-5 pt-5 pb-3 shrink-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{activeCat.emoji}</span>
                    <h3 className="font-black text-base" style={{ color: '#1B4332' }}>
                      {activeCat.nombre}
                    </h3>
                  </div>
                  <p className="text-[11px] font-semibold" style={{ color: '#9CA3AF' }}>
                    Selecciona un tipo para filtrar
                  </p>
                </div>

                {/* Grid de tipos */}
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {/* "Ver todos" de la categoría */}
                    <button
                      onClick={() => goTo(`/marketplace?categoria=${activeCat.slug}`)}
                      className="col-span-2 flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-black transition-all hover:scale-[1.01]"
                      style={{ background: 'linear-gradient(135deg,#1B4332,#2D6A4F)', color: '#fff' }}>
                      <span>Ver todo en {activeCat.nombre}</span>
                      <ChevronRight size={15} />
                    </button>

                    {activeCat.tipos.map(tipo => (
                      <button
                        key={tipo.id}
                        onClick={() => goTo(`/marketplace?tipo=${tipo.slug}`)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-[13px] font-semibold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                        style={{
                          background: '#F5EFE4',
                          color: '#374151',
                          border: '1px solid rgba(0,0,0,0.05)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#D8F3DC'; e.currentTarget.style.color = '#1B4332' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#F5EFE4'; e.currentTarget.style.color = '#374151' }}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#2D6A4F' }} />
                        {tipo.nombre}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-gray-400">Pasa el mouse sobre una categoría</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Auth footer ── */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0">
          {token ? (
            <BtnPrimary to="/dashboard" onClick={onClose}>Mi Dashboard</BtnPrimary>
          ) : (
            <div className="flex gap-2">
              <BtnSecondary to="/login" onClick={onClose}>Ingresar</BtnSecondary>
              <BtnPrimary to="/register" onClick={onClose}>Registrarme gratis</BtnPrimary>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/* ────────────────────────────────────────────
   HEADER PRINCIPAL
──────────────────────────────────────────── */
/* ────────────────────────────────────────────
   USER DROPDOWN
──────────────────────────────────────────── */
function Tooltip({ label, danger }) {
  return (
    <div className="absolute bottom-[calc(100%+7px)] left-1/2 -translate-x-1/2 pointer-events-none
      opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap">
      <div className="px-2.5 py-1.5 rounded-lg text-[11px] font-black text-white"
        style={{ background: danger ? '#DC2626' : '#1B4332', boxShadow: '0 4px 12px rgba(0,0,0,0.18)' }}>
        {label}
      </div>
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
        style={{ borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
          borderTop: `5px solid ${danger ? '#DC2626' : '#1B4332'}` }} />
    </div>
  )
}

function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const displayName = user?.first_name || user?.username || 'Usuario'
  const initials    = displayName.slice(0, 2).toUpperCase()

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const go = path => { setOpen(false); navigate(path) }

  const ACTIONS = [
    { icon: ShoppingBag,    label: 'Mis compras',     action: () => go('/mis-compras') },
    { icon: User,           label: 'Mi cuenta',       action: () => go('/mi-cuenta')   },
    { icon: LayoutDashboard,label: 'Panel admin',     action: () => go('/dashboard')   },
    { icon: LogOut,         label: 'Cerrar sesión',   action: () => { setOpen(false); onLogout() }, danger: true },
  ]

  return (
    <div ref={ref} className="relative hidden sm:block">
      {/* Trigger */}
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all hover:bg-[#f0fdf4]">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
          style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
          {initials}
        </div>
        <span className="text-sm font-bold max-w-[110px] truncate" style={{ color: '#1B4332' }}>
          Hola, {displayName}
        </span>
        <ChevronDown size={13} className="transition-transform duration-200 shrink-0"
          style={{ color: '#6B7280', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {/* Popup horizontal */}
      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 flex items-center gap-0.5 px-2 py-2 rounded-2xl"
          style={{ background: '#fff', boxShadow: '0 8px 32px rgba(27,67,50,0.14)', border: '1px solid #F3F4F6' }}>

          {/* Separador vertical antes de logout */}
          {ACTIONS.map(({ icon: Icon, label, action, danger }, i) => (
            <div key={label} className="flex items-center">
              {i === ACTIONS.length - 1 && (
                <div className="w-px h-6 mx-1 shrink-0" style={{ background: '#F3F4F6' }} />
              )}
              <div className="relative group">
                <button
                  onClick={action}
                  className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150"
                  style={{ color: danger ? '#EF4444' : '#2D6A4F' }}
                  onMouseEnter={e => { e.currentTarget.style.background = danger ? '#FEF2F2' : '#F0FDF4' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                  <Icon size={17} />
                </button>
                <Tooltip label={label} danger={danger} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const { token, user, logout } = useAuth()
  const { count } = useCart()
  const navigate  = useNavigate()

  const [scrolled,    setScrolled]    = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [query,       setQuery]       = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [dropOpen,    setDropOpen]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [categorias,  setCategorias]  = useState([])

  const searchWrapRef = useRef(null)
  const inputRef      = useRef(null)

  /* Fetch categorías una sola vez */
  useEffect(() => {
    api.get('/cosechas/categorias/')
      .then(r => setCategorias(r.data?.results ?? r.data ?? []))
      .catch(() => {})
  }, [])

  /* Shadow on scroll */
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  /* Block body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  /* Close dropdown on outside click */
  useEffect(() => {
    const fn = e => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setDropOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  /* Escape closes dropdown */
  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') { setDropOpen(false); inputRef.current?.blur() } }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [])

  /* Debounced search */
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) { setSuggestions([]); setDropOpen(false); return }
    setLoading(true)
    setDropOpen(true)
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/cosechas/publicas/?search=${encodeURIComponent(q)}&limit=6`)
        const data = res.data?.results ?? res.data ?? []
        setSuggestions(Array.isArray(data) ? data.slice(0, 6) : [])
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 320)
    return () => clearTimeout(timer)
  }, [query])

  const closeDrawer = () => setDrawerOpen(false)

  const handleSearch = e => {
    e?.preventDefault()
    const q = query.trim()
    setDropOpen(false)
    navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace')
    setQuery('')
  }

  const handleSelect = () => { setDropOpen(false); setQuery(''); navigate('/marketplace') }
  const handleViewAll = () => {
    setDropOpen(false)
    navigate(query.trim() ? `/marketplace?q=${encodeURIComponent(query.trim())}` : '/marketplace')
    setQuery('')
  }

  return (
    <>
      {/* ══════════════════════ HEADER BAR ══════════════════════ */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-400"
        style={{
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? '0 4px 32px rgba(27,67,50,0.09)' : 'none',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}>

        <div className="max-w-[1480px] mx-auto px-4 sm:px-6 xl:px-10">
          <div className="flex items-center h-28 gap-2">

            {/* 1 · Logo */}
            <Link to="/" onClick={closeDrawer} className="flex items-center group shrink-0">
              <div className="transition-transform duration-300 group-hover:rotate-6">
                <KiaraLogomark size={90} />
              </div>
              <span style={{ marginLeft: '-12px' }}><KiaraWordmark /></span>
            </Link>

            {/* 2 · Botón Menú */}
            <button onClick={() => setDrawerOpen(v => !v)}
              className="p-2.5 rounded-xl hover:bg-[#f0fdf4] transition-colors shrink-0"
              style={{ color: '#2D6A4F' }}>
              {drawerOpen ? <X size={21} /> : <Menu size={21} />}
            </button>

            {/* 3 · Barra de búsqueda */}
            <div ref={searchWrapRef} className="flex-1 relative hidden md:block mx-2">
              <form onSubmit={handleSearch}>
                <div className="flex items-center transition-all duration-200"
                  style={{
                    border: '1.5px solid #2D6A4F',
                    borderRadius: dropOpen ? '12px 12px 0 0' : '12px',
                    background: '#fff',
                    boxShadow: dropOpen ? '0 0 0 3px rgba(45,106,79,0.08)' : 'none',
                  }}>
                  <div className="pl-4 shrink-0" style={{ color: '#9CA3AF' }}>
                    <Search size={16} />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => { if (query.trim().length >= 2) setDropOpen(true) }}
                    placeholder="Buscar cosechas, productores, cultivos..."
                    className="flex-1 px-3 py-2.5 text-sm outline-none bg-transparent"
                    style={{ color: '#1B4332' }}
                  />
                  {query && (
                    <button type="button"
                      onClick={() => { setQuery(''); setSuggestions([]); setDropOpen(false); inputRef.current?.focus() }}
                      className="p-2 mr-1 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: '#9CA3AF' }}>
                      <X size={14} />
                    </button>
                  )}
                  <button type="submit"
                    className="flex items-center justify-center px-4 py-2.5 rounded-r-[10px] shrink-0 hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', color: '#fff' }}>
                    <Search size={17} />
                  </button>
                </div>
              </form>

              {dropOpen && (
                <SearchDropdown
                  results={suggestions}
                  query={query}
                  onSelect={handleSelect}
                  onViewAll={handleViewAll}
                  loading={loading}
                />
              )}
            </div>

            {/* 4 · Favoritos */}
            <Link to="/marketplace" title="Favoritos"
              className="p-2.5 rounded-xl hover:bg-[#f0fdf4] transition-colors shrink-0"
              style={{ color: '#2D6A4F' }}>
              <Heart size={20} />
            </Link>

            {/* 5 · Carrito */}
            <Link to="/carrito" title="Carrito"
              className="relative p-2.5 rounded-xl hover:bg-[#f0fdf4] transition-colors shrink-0"
              style={{ color: '#2D6A4F' }}>
              <ShoppingCart size={20} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-white text-[9px] font-black flex items-center justify-center"
                  style={{ backgroundColor: '#2D6A4F' }}>
                  {count > 9 ? '9+' : count}
                </span>
              )}
            </Link>

            {/* 6 · Auth */}
            {token && user ? (
              <UserDropdown user={user} onLogout={() => { logout(); navigate('/') }} />
            ) : (
              <div className="hidden sm:flex items-center gap-2 ml-1">
                <BtnSecondary to="/login">Ingresar</BtnSecondary>
                <BtnPrimary to="/register">Registrarme</BtnPrimary>
              </div>
            )}

            {/* Búsqueda móvil */}
            <button onClick={() => navigate('/marketplace')}
              className="md:hidden p-2.5 rounded-xl hover:bg-[#f0fdf4] transition-colors"
              style={{ color: '#2D6A4F' }}>
              <Search size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ══════════════════════ DRAWER ══════════════════════ */}
      <MenuDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        token={token}
        categorias={categorias}
      />
    </>
  )
}
