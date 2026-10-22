import { useEffect, useMemo, useState } from 'react'
import { ArrowDownRight, ArrowRight, Search, ShieldCheck, Truck, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import ProductCard from '../components/ProductCard'
import { demoProducts } from '../data/demoProducts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import SiteFooter from '../components/SiteFooter'

export default function Storefront() {
  const [products, setProducts] = useState(demoProducts)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  useEffect(() => {
    let active = true
    async function load() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      if (active && !error && data) setProducts(data)
      if (active) setLoading(false)
    }
    load()
    return () => { active = false }
  }, [])
  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category).filter(Boolean))], [products])
  const filtered = products.filter(p => (category === 'All' || p.category === category) && `${p.name} ${p.description || ''}`.toLowerCase().includes(search.toLowerCase()))
  const featured = products.filter(p => p.featured && p.in_stock).slice(0, 3)
  return <><SiteHeader/><main>
    <section className="hero-section reveal-on-scroll"><div className="container hero-grid">
      <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-line"/> THOUGHTFULLY PICKED, READY FOR YOU</p><h1>Good finds.<br/><em>Better everyday.</em></h1><p className="hero-description">Discover useful, well-chosen products for the way you live, work and unwind.</p><div className="hero-actions"><Link className="button button-dark" to="/shop">Explore the collection <ArrowRight size={17}/></Link><a className="text-link" href="#why-us">Why shop with us <ArrowDownRight size={17}/></a></div><div className="hero-note"><span className="avatar-stack"><i>M</i><i>+</i><i>✓</i></span><span>Personal service, one message away.</span></div></div>
      <div className="hero-art"><div className="hero-image-main"><img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=85" alt="Minimal wristwatch"/></div><div className="hero-float-card"><span className="float-icon"><MessageCircle size={17}/></span><div><strong>Easy ordering</strong><small>Chat with us on WhatsApp</small></div></div><div className="hero-sticker">THE GOOD<br/>STUFF <span>↗</span></div></div>
    </div></section>
    <section className="trust-strip reveal-on-scroll"><div className="container trust-grid"><div><ShieldCheck/><span><strong>Curated quality</strong><small>Products picked with care</small></span></div><div><MessageCircle/><span><strong>Human support</strong><small>Talk directly to our team</small></span></div><div><Truck/><span><strong>Delivery arranged</strong><small>Confirm details on WhatsApp</small></span></div></div></section>
    <section className="section container reveal-on-scroll" id="featured"><div className="section-heading"><div><p className="eyebrow">A FEW GOOD THINGS</p><h2>Featured <em>finds.</em></h2><p className="section-subtitle">A little inspiration for your next favourite thing.</p></div><Link className="text-link" to="/shop">View all products <ArrowRight size={17}/></Link></div>
      {loading ? <div className="loading-state">Loading products…</div> : <div className="product-grid">{(featured.length ? featured : products.filter(p => p.in_stock).slice(0,3)).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div>}
      {!isSupabaseConfigured && <p className="demo-notice">Preview mode: sample products are shown. Connect Supabase to load your real catalogue.</p>}
    </section>
    <section className="about-section reveal-on-scroll" id="about"><div className="container about-grid"><div className="about-image"><img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=85" alt="Carefully arranged products in a bright shop" loading="lazy"/><span className="about-image-label">A little more thoughtful.</span></div><div className="about-copy"><p className="eyebrow">A LITTLE ABOUT US</p><h2>Good shopping,<br/><em>without the fuss.</em></h2><p>Marketday is all about finding useful, lovely things for everyday life. We keep our collection considered, our service personal, and the buying process refreshingly simple.</p><p>See something you like? Add it to your cart and send your list to us on WhatsApp. We’ll help you confirm availability, delivery and the details before you order.</p><Link to="/shop" className="button button-dark">Get to know the collection <ArrowRight size={17}/></Link></div></div></section>
    <section className="why-section reveal-on-scroll" id="why-us"><div className="container why-grid"><div><p className="eyebrow">A BETTER WAY TO SHOP</p><h2>Shopping should feel<br/><em>simple.</em></h2></div><div className="why-copy"><p>We keep things easy. Find what you like, ask us any questions, and place your order directly with our team on WhatsApp.</p><Link to="/shop" className="button button-light">Find your next favourite <ArrowRight size={17}/></Link></div></div></section>
    <section className="section container shop-preview reveal-on-scroll"><div className="section-heading"><div><p className="eyebrow">YOUR NEXT FIND IS HERE</p><h2>Browse the <em>shop.</em></h2></div><div className="search-field"><Search size={17}/><input aria-label="Search products" placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="filter-pills">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="product-grid">{filtered.slice(0,6).map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div><div className="center-action"><Link className="button button-outline" to="/shop">Browse all products <ArrowRight size={17}/></Link></div></section>
  </main><SiteFooter/></>
}