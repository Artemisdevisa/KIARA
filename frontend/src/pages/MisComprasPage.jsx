import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingBag, Package, ChevronRight, Clock, CheckCircle, XCircle, Truck } from 'lucide-react'
import api from '../api/axios'

const ESTADO = {
  pendiente:  { label: 'Pendiente',  color: '#D97706', bg: '#FEF3C7', Icon: Clock        },
  confirmado: { label: 'Confirmado', color: '#16A34A', bg: '#DCFCE7', Icon: CheckCircle  },
  entregado:  { label: 'Entregado',  color: '#2563EB', bg: '#DBEAFE', Icon: Truck        },
  cancelado:  { label: 'Cancelado',  color: '#DC2626', bg: '#FEE2E2', Icon: XCircle      },
}

function StatusBadge({ estado }) {
  const s = ESTADO[estado] || ESTADO.pendiente
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      <s.Icon size={11} />
      {s.label}
    </span>
  )
}

export default function MisComprasPage() {
  const [pedidos,  setPedidos]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    api.get('/pedidos/')
      .then(r => setPedidos(r.data?.results ?? r.data ?? []))
      .catch(() => setPedidos([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-6">
          {[1,2,3].map(n => <div key={n} className="h-28 rounded-2xl bg-gray-100" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[70vh] px-4 sm:px-6 xl:px-10 py-14" style={{ background: '#FAFAFA' }}>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
            <ShoppingBag size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-2xl" style={{ color: '#1B4332' }}>Mis compras</h1>
            <p className="text-sm" style={{ color: '#9CA3AF' }}>
              {pedidos.length > 0 ? `${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''}` : 'Sin pedidos aún'}
            </p>
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div className="text-center py-20">
            <Package size={52} className="mx-auto mb-5" style={{ color: '#D1D5DB' }} />
            <h2 className="font-black text-xl mb-2" style={{ color: '#374151' }}>Aún no has realizado compras</h2>
            <p className="text-sm mb-8" style={{ color: '#9CA3AF' }}>
              Explora el marketplace y encuentra productos frescos de productores locales.
            </p>
            <Link to="/marketplace"
              className="inline-flex items-center gap-2 font-black text-sm px-6 py-3 rounded-full text-white"
              style={{ background: 'linear-gradient(135deg,#2D6A4F,#1B4332)' }}>
              Ir al Marketplace <ChevronRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map(pedido => {
              const isOpen = expanded === pedido.id
              const fecha  = new Date(pedido.created_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })

              return (
                <div key={pedido.id}
                  className="bg-white rounded-2xl overflow-hidden transition-shadow hover:shadow-md"
                  style={{ border: '1px solid #E5E7EB' }}>

                  {/* Cabecera del pedido */}
                  <button
                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                    onClick={() => setExpanded(isOpen ? null : pedido.id)}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: '#F0FDF4' }}>
                        <Package size={18} style={{ color: '#2D6A4F' }} />
                      </div>
                      <div>
                        <p className="font-black text-sm" style={{ color: '#1B4332' }}>
                          Pedido #{pedido.id}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{fecha}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <StatusBadge estado={pedido.estado} />
                      <p className="font-black text-base hidden sm:block" style={{ color: '#1B4332' }}>
                        S/ {parseFloat(pedido.total).toFixed(2)}
                      </p>
                      <ChevronRight size={16}
                        className="transition-transform duration-200 shrink-0"
                        style={{ color: '#D1D5DB', transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }} />
                    </div>
                  </button>

                  {/* Detalle expandible */}
                  {isOpen && (
                    <div className="px-6 pb-5 border-t" style={{ borderColor: '#F3F4F6' }}>
                      <div className="pt-4 space-y-3">
                        {pedido.items?.map(item => (
                          <div key={item.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                            style={{ background: '#F9FAFB' }}>
                            <div>
                              <p className="font-bold text-sm" style={{ color: '#1B4332' }}>
                                {item.cosecha_nombre}
                              </p>
                              <p className="text-xs" style={{ color: '#9CA3AF' }}>
                                {parseFloat(item.cantidad)} {item.cosecha_unidad} · S/ {parseFloat(item.precio_unitario).toFixed(2)} c/u
                              </p>
                            </div>
                            <p className="font-black text-sm" style={{ color: '#2D6A4F' }}>
                              S/ {parseFloat(item.subtotal).toFixed(2)}
                            </p>
                          </div>
                        ))}

                        <div className="flex justify-between items-center pt-2 mt-1 border-t" style={{ borderColor: '#F3F4F6' }}>
                          <span className="text-xs font-black uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Total</span>
                          <span className="font-black text-lg" style={{ color: '#1B4332' }}>
                            S/ {parseFloat(pedido.total).toFixed(2)}
                          </span>
                        </div>

                        {pedido.notas && (
                          <div className="mt-2 px-3 py-2.5 rounded-xl text-xs" style={{ background: '#FEF3C7', color: '#92400E' }}>
                            <span className="font-black">Nota: </span>{pedido.notas}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
