import { Link, useSearchParams } from 'react-router-dom'
import { Clock, ShoppingBag, Home } from 'lucide-react'

export default function PagoPendientePage() {
  const [params] = useSearchParams()
  const pedidoId = params.get('pedido')

  return (
    <div className="bg-bio-cream min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Icono */}
        <div className="w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,#fffbeb,#fef3c7)', boxShadow: '0 8px 32px rgba(202,138,4,0.15)' }}>
          <Clock size={52} style={{ color: '#d97706' }} />
        </div>

        <h1 className="font-black text-bio-dark text-3xl mb-2">Pago pendiente</h1>
        <p className="text-bio-muted font-semibold text-base mb-2">
          Tu pago está siendo procesado.
        </p>
        {pedidoId && (
          <p className="text-bio-muted text-sm mb-6">
            Pedido <span className="font-black text-bio-dark">#{pedidoId}</span>
          </p>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm text-left">
          <p className="text-bio-muted text-sm">
            MercadoPago está verificando tu pago. Esto puede tomar unos minutos.
            Recibirás una notificación cuando se confirme.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/marketplace"
            className="flex items-center justify-center gap-2 font-black text-sm px-6 py-3 rounded-xl text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 16px rgba(45,106,79,0.25)' }}
          >
            <ShoppingBag size={16} /> Ir al Marketplace
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 font-black text-sm px-6 py-3 rounded-xl border-2 text-bio-dark transition-all"
            style={{ borderColor: '#d1d5db' }}
          >
            <Home size={16} /> Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
