import { useEffect, useState } from 'react'
import { ArrowUpRight, Package, Plus, ShoppingBag, Tags } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../utils/format'

export default function AdminDashboard() {
  const [products,setProducts] = useState([])
  const [loading,setLoading] = useState(true)
  const [error,setError] = useState('')
  useEffect(() => {
    let active = true
    async function load() {
      const { data,error } = await supabase.from('products').select('*').order('created_at',{ascending:false})
      if (!active) return
      if (error) setError(error.message)
      else setProducts(data || [])
      setLoading(false)
    }
    load()
    return () => { active = false }
  },[])
  const inStock = products.filter(p=>p.in_stock).length
  const categories = new Set(products.map(p=>p.category).filter(Boolean)).size
  return <div className="admin-content"><div className="admin-page-heading"><div><p className="eyebrow">YOUR STORE AT A GLANCE</p><h1>Overview<span className="brand-dot">.</span></h1><p>Manage your products and keep your catalogue up to date.</p></div><Link to="/admin/products/new" className="button button-dark"><Plus size={17}/> Add product</Link></div>
    {error && <div className="alert-error">{error}</div>}
    <div className="stats-grid"><div className="stat-card"><span className="stat-icon"><Package/></span><p>Total products</p><strong>{loading?'—':products.length}</strong><small>Products in your catalogue</small></div><div className="stat-card"><span className="stat-icon"><ShoppingBag/></span><p>In stock</p><strong>{loading?'—':inStock}</strong><small>Available to order</small></div><div className="stat-card"><span className="stat-icon"><Tags/></span><p>Categories</p><strong>{loading?'—':categories}</strong><small>Product categories used</small></div></div>
    <section className="admin-panel"><div className="panel-heading"><div><h2>Recently added products</h2><p>Your latest catalogue updates.</p></div><Link to="/admin/products" className="text-link">Manage products <ArrowUpRight size={16}/></Link></div>
      {loading ? <div className="loading-state">Loading catalogue…</div> : products.length === 0 ? <div className="admin-empty"><span className="empty-icon"><Package size={24}/></span><h3>Your catalogue is ready</h3><p>Add your first product to start building your online shop.</p><Link to="/admin/products/new" className="button button-dark"><Plus size={17}/> Add your first product</Link></div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>{products.slice(0,6).map(p=><tr key={p.id}><td><div className="table-product"><img src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=70'} alt=""/><span>{p.name}</span></div></td><td>{p.category || '—'}</td><td>{formatPrice(p.price)}</td><td><span className={`status-pill ${p.in_stock?'status-good':'status-muted'}`}>{p.in_stock?'In stock':'Out of stock'}</span></td><td><Link className="table-action" to={`/admin/products/${p.id}/edit`}>Edit <ArrowUpRight size={14}/></Link></td></tr>)}</tbody></table></div>}
    </section>
  </div>
}