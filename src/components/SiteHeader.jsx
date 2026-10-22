import { Link, NavLink } from 'react-router-dom'
import { ArrowUpRight, Menu, ShoppingBag, X } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

function CartButton({ count, onClick, mobile = false }) {
  return (
    <button
      className={`cart-trigger${mobile ? ' cart-trigger-mobile' : ' cart-trigger-desktop'}`}
      onClick={onClick}
      aria-label={`Open cart, ${count} items`}
      title="Open cart"
    >
      <ShoppingBag size={18} />
      <span>Cart</span>
      <b>{count}</b>
    </button>
  )
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false)
  const { count, setOpen: setCartOpen } = useCart()

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">m.</span><span>marketday<span className="brand-dot">.</span></span>
        </Link>

        {/* On mobile the cart sits beside the brand, while the menu stays at the far right. */}
        <CartButton count={count} onClick={() => setCartOpen(true)} mobile />

        <nav className={`nav-links ${open ? 'nav-open' : ''}`}>
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/shop" onClick={() => setOpen(false)}>Shop all</NavLink>
          <a href="/#about" onClick={() => setOpen(false)}>About</a>
          <a href="/#why-us" onClick={() => setOpen(false)}>Why Marketday</a>
        </nav>

        <div className="nav-actions">
          <CartButton count={count} onClick={() => setCartOpen(true)} />
          <Link to="/shop" className="nav-cta">Explore shop <ArrowUpRight size={16}/></Link>
        </div>

        <button className="icon-button mobile-menu" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X size={21}/> : <Menu size={21}/>}
        </button>
      </div>
    </header>
  )
}
