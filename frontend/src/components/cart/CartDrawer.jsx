import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Trash2, ShoppingCart, Minus, Plus, PackageCheck } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'

function HarvestPlaceholder() {
  return (
    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-bio-main/10 to-bio-pale flex items-center justify-center shrink-0">
      <PackageCheck size={22} className="text-bio-main/40" />
    </div>
  )
}

export default function CartDrawer({ onClose }) {
  const { items, removeItem, updateQty, clearCart, total } = useCart()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [notas, setNotas] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    if (!token) {
      onClose()
      navigate('/login')
      return
    }
    setLoading(true)
    try {
      await api.post('/pedidos/', {
        notas,
        items: items.map(i => ({ cosecha_id: i.id, cantidad: i.cantidad })),
      })
      toast.success('¡Pedido confirmado! El productor se pondrá en contacto contigo.')
      clearCart()
      onClose()
    } catch (err) {
      const msg = err.response?.data
      if (typeof msg === 'object') {
        Object.values(msg).flat().forEach(m => toast.error(String(m)))
      } else {
        toast.error('Error al confirmar el pedido.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 flex flex-col"
        style={{ background: '#fff', boxShadow: '-8px 0 48px rgba(0,0,0,0.13)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <ShoppingCart size={20} style={{ color: '#2D6A4F' }} />
            <h2 className="font-black text-bio-dark text-base">Mi carrito</h2>
            {items.length > 0 && (
              <span className="text-xs font-black px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: '#2D6A4F' }}>
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
            style={{ color: '#6b7280' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#f0fdf4' }}>
                <ShoppingCart size={36} style={{ color: '#86efac' }} />
              </div>
              <p className="font-black text-bio-dark text-lg">Carrito vacío</p>
              <p className="text-bio-muted text-sm">
                Agrega productos del marketplace para comenzar tu pedido.
              </p>
              <button
                onClick={onClose}
                className="mt-2 text-sm font-black px-5 py-2.5 rounded-xl text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}
              >
                Ver Marketplace
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-gray-50/50">
                  {item.foto_url ? (
                    <img src={item.foto_url} alt={item.nombre_producto}
                      className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : <HarvestPlaceholder />}

                  <div className="flex-1 min-w-0">
                    <p className="font-black text-bio-dark text-sm leading-tight line-clamp-1">
                      {item.nombre_producto}
                    </p>
                    <p className="text-bio-main font-black text-sm mt-0.5">
                      S/ {(parseFloat(item.precio) * item.cantidad).toFixed(2)}
                    </p>
                    <p className="text-bio-muted text-xs">
                      S/ {parseFloat(item.precio).toFixed(2)} / {item.unidad_display || item.unidad}
                    </p>
                  </div>

                  {/* Controles cantidad */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => updateQty(item.id, item.cantidad - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: '#f0fdf4', color: '#2D6A4F' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center font-black text-sm text-bio-dark">
                      {item.cantidad}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.cantidad + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: '#f0fdf4', color: '#2D6A4F' }}
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center ml-1 transition-colors hover:bg-red-50"
                      style={{ color: '#dc2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer con checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <textarea
              value={notas}
              onChange={e => setNotas(e.target.value)}
              placeholder="Notas para el productor (opcional)..."
              rows={2}
              className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#2D6A4F' }}
            />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-bio-muted text-sm">Total estimado</span>
              <span className="font-black text-bio-dark text-xl">
                S/ {total.toFixed(2)}
              </span>
            </div>

            {/* Botón checkout */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm text-white transition-all disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 16px rgba(45,106,79,0.25)' }}
            >
              {loading
                ? 'Confirmando...'
                : token
                  ? 'Confirmar pedido'
                  : 'Inicia sesión para confirmar'}
            </button>

            {!token && (
              <p className="text-center text-xs text-bio-muted">
                Necesitas una cuenta para enviar tu pedido al productor.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}
