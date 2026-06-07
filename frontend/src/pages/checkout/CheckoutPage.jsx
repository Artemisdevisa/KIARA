import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, PackageCheck, Lock } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

/* Logo MercadoPago */
function MercadoPagoLogo() {
  return (
    <svg height="22" viewBox="0 0 148 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M28.8 17c0 9.4-7.6 17-17 17S0 26.4 0 17 7.6 0 17.8 0s11 7.6 11 17z" fill="#009EE3"/>
      <path d="M17.8 7.4c-3.3 0-6.3 1.4-8.5 3.6L17.8 19l8.5-8C24.1 8.8 21.1 7.4 17.8 7.4z" fill="#fff"/>
      <text x="36" y="24" fontFamily="sans-serif" fontWeight="800" fontSize="16" fill="#333">mercadopago</text>
    </svg>
  )
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart()
  const { token, user } = useAuth()
  const navigate = useNavigate()
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)

  if (items.length === 0) {
    return (
      <div className="bg-bio-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-bio-muted font-semibold mb-4">Tu carrito está vacío.</p>
          <Link to="/marketplace" className="btn-primary text-sm">Ir al Marketplace</Link>
        </div>
      </div>
    )
  }

  const handlePagar = async () => {
    if (!token) {
      toast.error('Debes iniciar sesión para pagar.')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/pedidos/checkout/', {
        notas,
        items: items.map(i => ({ cosecha_id: i.id, cantidad: i.cantidad })),
      })

      if (res.data.error) {
        toast.error(res.data.error)
        setLoading(false)
        return
      }

      // Redirigir a MercadoPago
      clearCart()
      window.location.href = res.data.init_point
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') {
        Object.values(msg).flat().forEach(m => toast.error(String(m)))
      } else {
        toast.error('Error al procesar el pago.')
      }
      setLoading(false)
    }
  }

  return (
    <div className="bg-bio-cream min-h-screen">

      {/* Hero */}
      <section
        className="relative py-12 px-4 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)' }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Lock size={18} className="text-white/70" />
          <span className="text-white/70 text-xs font-bold tracking-wide uppercase">Pago seguro</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white mb-1">Checkout</h1>
        <p className="text-white/60 text-sm font-semibold">Revisa tu pedido y elige cómo pagar</p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link to="/carrito"
          className="flex items-center gap-1.5 text-bio-muted hover:text-bio-dark text-sm font-bold mb-8 transition-colors w-fit">
          <ArrowLeft size={15} /> Volver al carrito
        </Link>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Formulario ── */}
          <div className="flex-1 space-y-5">

            {/* Datos del comprador */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h2 className="font-black text-bio-dark text-base mb-4 flex items-center gap-2">
                <ShieldCheck size={18} style={{ color: '#2D6A4F' }} />
                Información de contacto
              </h2>
              {token ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ backgroundColor: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm shrink-0"
                      style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
                      {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-bio-dark text-sm">
                        {user?.first_name && user?.last_name
                          ? `${user.first_name} ${user.last_name}`
                          : user?.username}
                      </p>
                      <p className="text-bio-muted text-xs">{user?.email}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-bio-muted uppercase tracking-wide mb-1.5">
                      Notas para el productor (opcional)
                    </label>
                    <textarea
                      value={notas}
                      onChange={e => setNotas(e.target.value)}
                      placeholder="Ej: Entregar en la mañana, preferencia de empaque, etc."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-bio-ink placeholder-bio-muted/50 resize-none focus:outline-none focus:ring-2"
                      style={{ '--tw-ring-color': '#2D6A4F' }}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <p className="text-bio-muted text-sm">
                    Necesitas una cuenta para completar tu compra.
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link to="/login"
                      className="font-black text-sm px-5 py-2.5 rounded-xl text-white"
                      style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
                      Iniciar sesión
                    </Link>
                    <Link to="/register"
                      className="font-black text-sm px-5 py-2.5 rounded-xl border-2 text-bio-dark"
                      style={{ borderColor: '#2D6A4F' }}>
                      Registrarme
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Método de pago */}
            {token && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="font-black text-bio-dark text-base mb-4">Método de pago</h2>
                <div className="flex items-center gap-4 p-4 rounded-xl border-2"
                  style={{ borderColor: '#009EE3', backgroundColor: '#f0f9ff' }}>
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
                    style={{ backgroundColor: '#009EE3' }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                      <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-black text-bio-dark text-sm">MercadoPago</p>
                    <p className="text-bio-muted text-xs">
                      Tarjeta, transferencia, efectivo · Pago 100% seguro
                    </p>
                  </div>
                  <div className="ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                    style={{ borderColor: '#009EE3', backgroundColor: '#009EE3' }}>
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Resumen ── */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
              <h2 className="font-black text-bio-dark text-base mb-4 flex items-center gap-2">
                <PackageCheck size={16} style={{ color: '#2D6A4F' }} />
                Tu pedido
              </h2>

              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-start">
                    {item.foto_url ? (
                      <img src={item.foto_url} alt={item.nombre_producto}
                        className="w-11 h-11 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: '#f0fdf4' }}>
                        <PackageCheck size={18} style={{ color: '#86efac' }} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-bio-dark font-bold text-xs leading-tight line-clamp-1">
                        {item.nombre_producto}
                      </p>
                      <p className="text-bio-muted text-xs">×{item.cantidad}</p>
                    </div>
                    <p className="font-black text-bio-dark text-sm shrink-0">
                      S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-bio-muted font-semibold">Subtotal</span>
                  <span className="font-bold text-bio-dark">S/ {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-bio-muted font-semibold">Envío / Recojo</span>
                  <span className="font-bold text-bio-main">A coordinar</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                  <span className="font-black text-bio-dark">Total</span>
                  <span className="font-black text-bio-dark text-xl">S/ {total.toFixed(2)}</span>
                </div>
              </div>

              {token ? (
                <button
                  onClick={handlePagar}
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{ backgroundColor: '#009EE3', boxShadow: '0 4px 20px rgba(0,158,227,0.35)' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Redirigiendo...
                    </>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                        <path d="M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                      Pagar con MercadoPago
                    </>
                  )}
                </button>
              ) : (
                <div className="text-center text-xs text-bio-muted py-2">
                  Inicia sesión para habilitar el pago.
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Lock size={11} style={{ color: '#9ca3af' }} />
                <span className="text-xs text-bio-muted">Pago procesado por MercadoPago</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
