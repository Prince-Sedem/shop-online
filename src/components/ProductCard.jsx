import { ArrowUpRight, MessageCircle, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/format'
import { productImage, whatsappNumber } from '../lib/supabase'

export function whatsappLink(product) {
  const message = `Hello, I’m interested in ${product.name} (${formatPrice(product.price)}).${product.slug ? ` Product: ${window.location.origin}/product/${product.slug}` : ''}`
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
}

export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()
  return (
    <article className="product-card reveal-on-scroll" style={{ animationDelay: `${index * 60}ms` }}>
      <Link className="product-image-wrap" to={`/product/${product.slug || product.id}`}>
        <img src={productImage(product)} alt={product.name} loading="lazy" />
        {product.featured && <span className="image-tag">Featured</span>}
        {!product.in_stock && <span className="stock-tag">Currently unavailable</span>}
        <span className="product-arrow"><ArrowUpRight size={18}/></span>
      </Link>
      <div className="product-card-info">
        <div><p className="product-category">{product.category || 'General'}</p><Link to={`/product/${product.slug || product.id}`} className="product-name">{product.name}</Link></div>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>
      <div className="product-card-actions"><button className={`product-add-cart ${!product.in_stock ? 'is-disabled' : ''}`} disabled={!product.in_stock} onClick={() => addItem(product)}><ShoppingCart size={15}/> Add to cart</button><a className={`product-order ${!product.in_stock ? 'is-disabled' : ''}`} href={product.in_stock ? whatsappLink(product) : undefined} target="_blank" rel="noreferrer" onClick={e => { if (!product.in_stock) e.preventDefault() }}>
        <MessageCircle size={15}/>{product.in_stock ? 'WhatsApp' : 'Out of stock'}
      </a></div>
    </article>
  )
}