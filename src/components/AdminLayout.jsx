import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, ExternalLink, LogOut, Store } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AdminLayout() {
  const navigate = useNavigate()
  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    navigate('/admin/login')
  }
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <a className="admin-brand" href="/"><span className="brand-mark">m.</span><span>marketday<span className="brand-dot">.</span><small>STORE ADMIN</small></span></a>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="admin-nav">
        <NavLink end to="/admin"><LayoutDashboard size={18}/> Overview</NavLink>
        <NavLink to="/admin/products"><Package size={18}/> Products</NavLink>
      </nav>
      <div className="sidebar-bottom">
        <a href="/" target="_blank" rel="noreferrer"><Store size={17}/> View storefront <ExternalLink size={14}/></a>
        <button onClick={signOut}><LogOut size={17}/> Sign out</button>
      </div>
    </aside>
    <main className="admin-main"><Outlet/></main>
  </div>
}