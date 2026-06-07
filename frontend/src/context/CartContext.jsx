import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kiara_cart') || '[]') }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('kiara_cart', JSON.stringify(items))
  }, [items])

  const addItem = (cosecha) => {
    setItems(prev => {
      if (prev.find(i => i.id === cosecha.id)) return prev
      return [...prev, { ...cosecha, cantidad: 1 }]
    })
  }

  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id))

  const updateQty = (id, qty) => {
    if (qty <= 0) { removeItem(id); return }
    setItems(prev => prev.map(i => i.id === id ? { ...i, cantidad: qty } : i))
  }

  const clearCart = () => setItems([])

  const count = items.length
  const total = items.reduce((sum, i) => sum + parseFloat(i.precio) * i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
