import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import ProductCard from '../components/ProductCard'
import { demoProducts } from '../data/demoProducts'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import SiteFooter from '../components/SiteFooter'

export default function Shop() {
  const [products, setProducts] = useState(demoProducts)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')
  const [loading, setLoading] = useState(isSupabaseConfigured)
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
  const filtered = products.filter(p => (category === 'All' || p.category === category) && `${p.name} ${p.description || ''}`.toLowerCase().includes(search.toLowerCase())).sort((a,b) => sort === 'low' ? a.price-b.price : sort === 'high' ? b.price-a.price : 0)
  return <><SiteHeader/><main className="shop-page"><div className="container">
    <div className="breadcrumb"><Link to="/">Home</Link><span>/</span><span>Shop</span></div>
    <div className="shop-title-row reveal-on-scroll"><div><p className="eyebrow">THE FULL COLLECTION</p><h1>Shop all <em>products.</em></h1><p className="section-subtitle">Take your time. Find something you love.</p></div><span className="product-count">{filtered.length} products</span></div>
    <div className="shop-toolbar"><label className="search-field"><Search size={17}/><input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/></label><label className="sort-select"><SlidersHorizontal size={16}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Recently added</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label></div>
    <div className="filter-pills shop-pills">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    {loading ? <div className="loading-state">Loading products…</div> : filtered.length ? <div className="product-grid">{filtered.map((p,i)=><ProductCard key={p.id} product={p} index={i}/>)}</div> : <div className="empty-state"><span>✳</span><h3>No products found</h3><p>Try a different search or category.</p><button className="button button-dark" onClick={()=>{setSearch('');setCategory('All')}}>Clear filters</button></div>}
  </div></main><SiteFooter/></>
}