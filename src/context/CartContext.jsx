import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Minus, Plus, ShoppingCart, Trash2, X, MessageCircle } from 'lucide-react'
import { formatPrice } from '../utils/format'
import { whatsappNumber } from '../lib/supabase'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('marketday-cart') || '[]') } catch { return [] }
  })
  const [open, setOpen] = useState(false)
  useEffect(() => { localStorage.setItem('marketday-cart', JSON.stringify(items)) }, [items])
  const addItem = useCallback((product) => {
    setItems(current => {
      const found = current.find(item => String(item.id) === String(product.id))
      if (found) return current.map(item => String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item)
      return [...current, { id: product.id, name: product.name, price: Number(product.price) || 0, slug: product.slug, image_url: product.image_url, quantity: 1 }]
    })
    setOpen(true)
  }, [])
  const changeQuantity = useCallback((id, delta) => setItems(current => current.map(item => String(item.id) === String(id) ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0)), [])
  const removeItem = useCallback((id) => setItems(current => current.filter(item => String(item.id) !== String(id))), [])
  const clearCart = useCallback(() => setItems([]), [])
  const count = items.reduce((sum, item) => sum + item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const value = useMemo(() => ({ items, count, total, open, setOpen, addItem, changeQuantity, removeItem, clearCart }), [items, count, total, open, addItem, changeQuantity, removeItem, clearCart])
  return <CartContext.Provider value={value}>{children}<CartDrawer /></CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside CartProvider')
  return context
}

function CartDrawer() {
  const { items, count, total, open, setOpen, changeQuantity, removeItem, clearCart } = useCart()
  const message = `Hello, I would like to order:\n\n${items.map(item => `• ${item.name} × ${item.quantity} — ${formatPrice(item.price * item.quantity)}`).join('\n')}\n\nEstimated total: ${formatPrice(total)}\nPlease confirm availability, delivery and final total.`
  const checkoutUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  useEffect(() => {
    if (!open) return
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [open, setOpen])
  return <>
    {open && <div className="cart-backdrop" onClick={() => setOpen(false)} aria-hidden="true"/>}
    <aside className={`cart-drawer ${open ? 'cart-drawer-open' : ''}`} aria-hidden={!open} aria-label="Shopping cart">
      <div className="cart-drawer-head"><div><p className="eyebrow">YOUR PICKS</p><h2>Your cart <span>({count})</span></h2></div><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close cart"><X size={20}/></button></div>
      {!items.length ? <div className="cart-empty"><span><ShoppingCart size={25}/></span><h3>Your cart is waiting</h3><p>Add a few things you love, then send your order to us on WhatsApp.</p><button className="button button-dark" onClick={() => setOpen(false)}>Continue shopping</button></div> : <>
        <div className="cart-items">{items.map(item => <article className="cart-item" key={item.id}><div className="cart-item-image">{item.image_url ? <img src={item.image_url} alt=""/> : <ShoppingCart size={18}/>}</div><div className="cart-item-copy"><strong>{item.name}</strong><span>{formatPrice(item.price)}</span><div className="quantity-control"><button onClick={() => changeQuantity(item.id, -1)} aria-label={`Decrease ${item.name} quantity`}><Minus size={13}/></button><span>{item.quantity}</span><button onClick={() => changeQuantity(item.id, 1)} aria-label={`Increase ${item.name} quantity`}><Plus size={13}/></button></div></div><div className="cart-item-side"><strong>{formatPrice(item.price * item.quantity)}</strong><button className="remove-item" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name}`}><Trash2 size={15}/></button></div></article>)}</div>
        <div className="cart-drawer-bottom"><button className="clear-cart" onClick={clearCart}>Clear cart</button><div className="cart-total"><span>Estimated subtotal</span><strong>{formatPrice(total)}</strong></div><p>Delivery and final availability are confirmed with you on WhatsApp.</p><a className="button button-dark cart-checkout" href={whatsappNumber ? checkoutUrl : undefined} target="_blank" rel="noreferrer" onClick={e => { if (!whatsappNumber) { e.preventDefault(); window.alert('Please add VITE_WHATSAPP_NUMBER to your .env file first.') } }}><MessageCircle size={17}/> Send order on WhatsApp</a>
        </div>
      </>}
    </aside>
  </>
}
