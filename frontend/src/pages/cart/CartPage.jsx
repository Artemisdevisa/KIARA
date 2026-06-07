import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Minus, Plus, ShoppingCart, ArrowLeft, ArrowRight, PackageCheck } from 'lucide-react'
import { useCart } from '../../context/CartContext'

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-24 h-24 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
        <ShoppingCart size={40} style={{ color: '#86efac' }} />
      </div>
      <h2 className="font-black text-bio-dark text-2xl">Tu carrito está vacío</h2>
      <p className="text-bio-muted text-sm text-center max-w-xs">
        Aún no tienes productos. Explora el marketplace y agrega cosechas frescas de productores locales.
      </p>
      <Link
        to="/marketplace"
        className="mt-2 font-black text-sm px-6 py-3 rounded-xl text-white transition-all"
        style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 16px rgba(45,106,79,0.25)' }}
      >
        Ir al Marketplace
      </Link>
    </div>
  )
}

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCart()
  const navigate = useNavigate()

  return (
    <div className="bg-bio-cream min-h-screen">

      {/* Hero */}
      <section
        className="relative py-12 px-4 flex flex-col items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#1B4332 0%,#2D6A4F 100%)' }}
      >
        <h1 className="text-3xl md:text-4xl font-black text-white mb-1">Mi carrito</h1>
        <p className="text-white/60 text-sm font-semibold">
          {items.length === 0
            ? 'Sin productos aún'
            : `${items.length} producto${items.length !== 1 ? 's' : ''} seleccionado${items.length !== 1 ? 's' : ''}`}
        </p>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {items.length === 0 ? <EmptyCart /> : (
          <div className="flex flex-col lg:flex-row gap-8">

            {/* ── Lista de items ── */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <Link to="/marketplace"
                  className="flex items-center gap-1.5 text-bio-muted hover:text-bio-dark text-sm font-bold transition-colors">
                  <ArrowLeft size={15} /> Seguir comprando
                </Link>
                <button onClick={clearCart}
                  className="text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                  Vaciar carrito
                </button>
              </div>

              {items.map(item => (
                <div key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">

                  {/* Imagen */}
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.nombre_producto}
                      className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)' }}>
                      <PackageCheck size={28} style={{ color: '#86efac' }} />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-bio-dark text-base leading-tight">{item.nombre_producto}</h3>
                    <p className="text-bio-muted text-xs mt-0.5">
                      S/ {parseFloat(item.precio).toFixed(2)} por {item.unidad_display || item.unidad}
                    </p>
                    <p className="text-bio-main font-black text-lg mt-1">
                      S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                    </p>
                  </div>

                  {/* Controles */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, item.cantidad - 1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black transition-colors"
                      style={{ backgroundColor: '#f0fdf4', color: '#2D6A4F' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center font-black text-bio-dark text-base">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.cantidad + 1)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-black transition-colors"
                      style={{ backgroundColor: '#f0fdf4', color: '#2D6A4F' }}
                    >
                      <Plus size={14} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center ml-2 transition-colors hover:bg-red-50"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Resumen del pedido ── */}
            <div className="lg:w-80 shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-24">
                <h2 className="font-black text-bio-dark text-base mb-5">Resumen del pedido</h2>

                <div className="space-y-3 mb-5">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-bio-muted font-semibold line-clamp-1 flex-1 mr-2">
                        {item.nombre_producto} ×{item.cantidad}
                      </span>
                      <span className="font-black text-bio-dark shrink-0">
                        S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-bio-muted">Total estimado</span>
                    <span className="font-black text-bio-dark text-2xl">S/ {total.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-bio-muted mt-1">
                    Precio referencial · El productor confirmará la disponibilidad
                  </p>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full py-4 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 20px rgba(45,106,79,0.30)' }}
                >
                  Proceder al pago <ArrowRight size={16} />
                </button>

                <Link to="/marketplace"
                  className="block text-center text-bio-muted hover:text-bio-dark text-xs font-bold mt-3 transition-colors">
                  ← Seguir comprando
                </Link>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
