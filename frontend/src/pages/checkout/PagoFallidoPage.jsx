import { Link, useSearchParams } from 'react-router-dom'
import { XCircle, ShoppingCart, Home } from 'lucide-react'

export default function PagoFallidoPage() {
  const [params] = useSearchParams()
  const pedidoId = params.get('pedido')

  return (
    <div className="bg-bio-cream min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {/* Icono */}
        <div className="w-28 h-28 rounded-full mx-auto flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg,#fef2f2,#fee2e2)', boxShadow: '0 8px 32px rgba(220,38,38,0.12)' }}>
          <XCircle size={52} style={{ color: '#dc2626' }} />
        </div>

        <h1 className="font-black text-bio-dark text-3xl mb-2">Pago fallido</h1>
        <p className="text-bio-muted font-semibold text-base mb-2">
          No se pudo completar tu pago.
        </p>
        {pedidoId && (
          <p className="text-bio-muted text-sm mb-6">
            Referencia pedido <span className="font-black text-bio-dark">#{pedidoId}</span>
          </p>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm text-left space-y-2">
          <p className="text-bio-dark font-bold text-sm">Posibles causas:</p>
          <ul className="text-bio-muted text-sm space-y-1 list-disc list-inside">
            <li>Fondos insuficientes en la tarjeta</li>
            <li>Datos de pago incorrectos</li>
            <li>Transacción rechazada por el banco</li>
          </ul>
          <p className="text-bio-muted text-xs pt-1">
            Los productos siguen en tu carrito. Puedes intentarlo nuevamente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/carrito"
            className="flex items-center justify-center gap-2 font-black text-sm px-6 py-3 rounded-xl text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)', boxShadow: '0 4px 16px rgba(45,106,79,0.25)' }}
          >
            <ShoppingCart size={16} /> Intentar de nuevo
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
