import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, ShoppingBag, Home } from 'lucide-react'
import { useCart } from '../../context/CartContext'

export default function PagoExitosoPage() {
  const [params] = useSearchParams()
  const pedidoId = params.get('pedido')
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [])

  return (
    <div className="bg-bio-cream min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Icono */}
        <div className="w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', boxShadow: '0 8px 32px rgba(45,106,79,0.18)' }}>
          <CheckCircle size={52} style={{ color: '#16a34a' }} />
        </div>

        <h1 className="font-black text-bio-dark text-3xl mb-2">¡Pago exitoso!</h1>
        <p className="text-bio-muted font-semibold text-base mb-2">
          Tu pedido ha sido confirmado.
        </p>
        {pedidoId && (
          <p className="text-bio-muted text-sm mb-6">
            Pedido <span className="font-black text-bio-dark">#{pedidoId}</span>
          </p>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm text-left space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: '#f0fdf4' }}>
              <CheckCircle size={14} style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="font-black text-bio-dark text-sm">Pago procesado por MercadoPago</p>
              <p className="text-bio-muted text-xs">Recibirás una confirmación a tu correo.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: '#f0fdf4' }}>
              <CheckCircle size={14} style={{ color: '#16a34a' }} />
            </div>
            <div>
              <p className="font-black text-bio-dark text-sm">El productor coordinará la entrega</p>
              <p className="text-bio-muted text-xs">Te contactarán para coordinar recojo o envío.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/marketplace"
            className="flex items-center justify-center gap-2 font-black text-sm px-6 py-3 rounded-xl text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 16px rgba(45,106,79,0.25)' }}
          >
            <ShoppingBag size={16} /> Seguir comprando
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 font-black text-sm px-6 py-3 rounded-xl border-2 text-bio-dark transition-all hover:border-bio-dark"
            style={{ borderColor: '#d1d5db' }}
          >
            <Home size={16} /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
