import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, CheckCircle2, MessageCircle, ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import SiteFooter from '../components/SiteFooter'
import { Link, useParams } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { demoProducts } from '../data/demoProducts'
import { isSupabaseConfigured, productImage, supabase, whatsappNumber } from '../lib/supabase'
import { formatPrice } from '../utils/format'

export default function ProductDetail() {
  const { slug } = useParams()
  const { addItem } = useCart()
  const [product, setProduct] = useState(demoProducts.find(p => p.slug === slug || p.id === slug) || null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  useEffect(() => {
    let active = true
    async function load() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle()
      if (active && data && !error) setProduct(data)
      else if (active && !data) setProduct(null)
      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [slug])
  const message = product ? `Hello, I’m interested in ${product.name} (${formatPrice(product.price)}). Product link: ${window.location.href}` : ''
  const wa = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
  return <><SiteHeader/><main className="detail-page container"><div className="breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/shop">Shop</Link><span>/</span><span>Product</span></div>
    {loading ? <div className="loading-state">Loading product…</div> : !product ? <div className="empty-state"><span>✳</span><h3>Product not found</h3><p>This product may have been removed or the link is incorrect.</p><Link to="/shop" className="button button-dark">Back to shop</Link></div> : <div className="detail-grid"><div className="detail-image"><img src={productImage(product)} alt={product.name}/>{product.featured && <span className="image-tag">Featured</span>}</div><div className="detail-copy"><Link className="back-link" to="/shop"><ArrowLeft size={16}/> Back to shop</Link><p className="eyebrow">{product.category || 'GENERAL'}</p><h1>{product.name}</h1><p className="detail-price">{formatPrice(product.price)}</p><p className="detail-description">{product.description || 'Contact us on WhatsApp to learn more about this product.'}</p><div className={`availability ${product.in_stock ? '' : 'unavailable'}`}><CheckCircle2 size={17}/>{product.in_stock ? 'Available to order' : 'Currently out of stock'}</div><div className="detail-actions"><button className="button button-outline" disabled={!product.in_stock} onClick={() => addItem(product)}><ShoppingCart size={17}/> Add to cart</button><a className={`button button-dark detail-order ${!product.in_stock ? 'is-disabled' : ''}`} href={product.in_stock ? wa : undefined} target="_blank" rel="noreferrer" onClick={e=>{if(!product.in_stock)e.preventDefault()}}><MessageCircle size={18}/>{product.in_stock ? 'Order via WhatsApp' : 'Out of stock'}{product.in_stock && <ArrowUpRight size={17}/>}</a></div><div className="detail-note"><MessageCircle size={17}/><span><strong>Have a question?</strong><small>Chat with us to confirm availability, delivery and other details.</small></span></div></div></div>}
  </main><SiteFooter/></>
}