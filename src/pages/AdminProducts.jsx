import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, ImagePlus, Package, Plus, Search, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { formatPrice, makeSlug } from '../utils/format'

function ProductForm({ editing = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form,setForm] = useState({name:'',slug:'',category:'',price:'',description:'',image_url:'',in_stock:true,featured:false})
  const [imageFile,setImageFile] = useState(null)
  const [loading,setLoading] = useState(editing)
  const [busy,setBusy] = useState(false)
  const [error,setError] = useState('')
  useEffect(() => {
    if (!editing) return
    let active = true
    supabase.from('products').select('*').eq('id',id).single().then(({data,error})=>{
      if (!active) return
      if (error) setError(error.message)
      else setForm({name:data.name||'',slug:data.slug||'',category:data.category||'',price:String(data.price??''),description:data.description||'',image_url:data.image_url||'',in_stock:data.in_stock ?? true,featured:data.featured ?? false})
      setLoading(false)
    })
    return ()=>{active=false}
  },[editing,id])
  const update = (key,value) => setForm(prev=>({...prev,[key]:value}))
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      let image_url = form.image_url
      if (imageFile) {
        const ext = imageFile.name.split('.').pop().toLowerCase()
        const path = `${crypto.randomUUID()}.${ext}`
        const {error:uploadError} = await supabase.storage.from('product-images').upload(path,imageFile,{upsert:false,contentType:imageFile.type})
        if (uploadError) throw uploadError
        const {data} = supabase.storage.from('product-images').getPublicUrl(path)
        image_url = data.publicUrl
      }
      const payload = {name:form.name.trim(),slug:makeSlug(form.slug || form.name),category:form.category.trim() || 'General',price:Number(form.price),description:form.description.trim(),image_url,in_stock:form.in_stock,featured:form.featured}
      const result = editing ? await supabase.from('products').update(payload).eq('id',id) : await supabase.from('products').insert(payload)
      if (result.error) throw result.error
      navigate('/admin/products')
    } catch (err) { setError(err.message || 'Something went wrong while saving the product.') }
    finally { setBusy(false) }
  }
  if (loading) return <div className="loading-state">Loading product…</div>
  return <div className="admin-content narrow-admin"><div className="admin-page-heading"><div><p className="eyebrow">CATALOGUE MANAGEMENT</p><h1>{editing?'Edit product':'Add product'}<span className="brand-dot">.</span></h1><p>Keep product details clear and up to date.</p></div></div>
    <form className="admin-panel admin-form product-form" onSubmit={submit}>
      {error && <div className="alert-error">{error}</div>}
      <div className="form-section-title"><span>01</span><div><h2>Product information</h2><p>The details customers will see in your shop.</p></div></div>
      <label>Product name *<input required maxLength="120" value={form.name} onChange={e=>{update('name',e.target.value);if(!editing)update('slug',makeSlug(e.target.value))}} placeholder="e.g. Everyday backpack"/></label>
      <div className="form-two-col"><label>Price (GHS) *<input required type="number" min="0" step="0.01" value={form.price} onChange={e=>update('price',e.target.value)} placeholder="0.00"/></label><label>Category<input value={form.category} onChange={e=>update('category',e.target.value)} placeholder="e.g. Accessories"/></label></div>
      <label>Product URL slug<input value={form.slug} onChange={e=>update('slug',e.target.value)} placeholder="everyday-backpack"/><small>Used in the product page URL. Letters, numbers and hyphens work best.</small></label>
      <label>Description<textarea rows="5" maxLength="3000" value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Describe the product, its features and benefits…"/></label>
      <div className="form-section-title section-spaced"><span>02</span><div><h2>Product image</h2><p>Upload a clear image or use an existing image URL.</p></div></div>
      <label className="upload-box"><ImagePlus size={25}/><strong>{imageFile ? imageFile.name : 'Choose a product image'}</strong><span>PNG, JPG, WEBP or other supported image format</span><input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files?.[0]||null)}/></label>
      <label>Or image URL<input type="url" value={form.image_url} onChange={e=>update('image_url',e.target.value)} placeholder="https://example.com/product.jpg"/></label>
      {(imageFile || form.image_url) && <div className="image-preview"><img src={imageFile ? URL.createObjectURL(imageFile) : form.image_url} alt="Product preview" onError={e=>{e.currentTarget.style.display='none'}}/></div>}
      <div className="form-section-title section-spaced"><span>03</span><div><h2>Visibility & availability</h2><p>Control how this product appears in your store.</p></div></div>
      <label className="check-row"><input type="checkbox" checked={form.in_stock} onChange={e=>update('in_stock',e.target.checked)}/><span><strong>Available to order</strong><small>Customers can start an order through WhatsApp.</small></span></label>
      <label className="check-row"><input type="checkbox" checked={form.featured} onChange={e=>update('featured',e.target.checked)}/><span><strong>Featured product</strong><small>Highlight this item in featured areas of the storefront.</small></span></label>
      <div className="form-actions"><Link className="button button-outline" to="/admin/products">Cancel</Link><button className="button button-dark" disabled={busy}>{busy?'Saving…':editing?'Save changes':'Create product'} <ArrowUpRight size={16}/></button></div>
    </form>
  </div>
}

export function NewProduct() { return <ProductForm/> }
export function EditProduct() { return <ProductForm editing/> }

export default function AdminProducts() {
  const [products,setProducts] = useState([])
  const [loading,setLoading] = useState(true)
  const [search,setSearch] = useState('')
  const [error,setError] = useState('')
  const [deleting,setDeleting] = useState('')
  const load = useCallback(async()=>{
    setLoading(true)
    const {data,error}=await supabase.from('products').select('*').order('created_at',{ascending:false})
    if(error)setError(error.message);else {setError('');setProducts(data||[])}
    setLoading(false)
  },[])
  useEffect(()=>{load()},[load])
  async function remove(product) {
    if(!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setDeleting(product.id);setError('')
    const {error}=await supabase.from('products').delete().eq('id',product.id)
    if(error)setError(error.message);else setProducts(prev=>prev.filter(p=>p.id!==product.id))
    setDeleting('')
  }
  const filtered=products.filter(p=>`${p.name} ${p.category||''}`.toLowerCase().includes(search.toLowerCase()))
  return <div className="admin-content"><div className="admin-page-heading"><div><p className="eyebrow">YOUR CATALOGUE</p><h1>Products<span className="brand-dot">.</span></h1><p>Add, update and organise the products customers see.</p></div><Link to="/admin/products/new" className="button button-dark"><Plus size={17}/> Add product</Link></div>
    {error&&<div className="alert-error">{error}</div>}
    <section className="admin-panel"><div className="products-toolbar"><div><h2>All products <span className="subtle-count">{products.length}</span></h2><p>Manage your online catalogue.</p></div><label className="search-field admin-search"><Search size={17}/><input placeholder="Search products…" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
      {loading?<div className="loading-state">Loading products…</div>:filtered.length===0?<div className="admin-empty"><span className="empty-icon"><Package size={24}/></span><h3>{search?'No matching products':'No products yet'}</h3><p>{search?'Try a different search term.':'Create your first product to start filling your shop.'}</p>{!search&&<Link to="/admin/products/new" className="button button-dark"><Plus size={17}/> Add product</Link>}</div>:<div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Status</th><th>Featured</th><th>Actions</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><div className="table-product"><img src={p.image_url||'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=120&q=70'} alt=""/><span>{p.name}</span></div></td><td>{p.category||'—'}</td><td>{formatPrice(p.price)}</td><td><span className={`status-pill ${p.in_stock?'status-good':'status-muted'}`}>{p.in_stock?'In stock':'Out of stock'}</span></td><td>{p.featured?'Yes':'—'}</td><td><div className="table-actions"><Link className="table-action" to={`/admin/products/${p.id}/edit`}>Edit <ArrowUpRight size={14}/></Link><button className="delete-action" onClick={()=>remove(p)} disabled={deleting===p.id} aria-label={`Delete ${p.name}`}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div>}
    </section>
  </div>
}