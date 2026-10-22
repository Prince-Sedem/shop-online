import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import Storefront from './pages/Storefront'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import AdminLogin from './pages/AdminLogin'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminProducts, { EditProduct, NewProduct } from './pages/AdminProducts'
import { CartProvider } from './context/CartContext'
import ScrollReveal from './components/ScrollReveal'

function ProtectedAdmin() {
  const [session,setSession] = useState(null)
  const [loading,setLoading] = useState(true)
  const location = useLocation()
  useEffect(()=>{
    if(!isSupabaseConfigured){setLoading(false);return}
    supabase.auth.getSession().then(({data})=>{setSession(data.session);setLoading(false)})
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,nextSession)=>setSession(nextSession))
    return ()=>subscription.unsubscribe()
  },[])
  if(loading) return <div className="auth-loading">Checking admin access…</div>
  if(!isSupabaseConfigured) return <Navigate to="/admin/login" replace state={{from:location.pathname}}/>
  if(!session) return <Navigate to="/admin/login" replace state={{from:location.pathname}}/>
  return <AdminLayout/>
}

export default function App() {
  return <CartProvider><ScrollReveal/><Routes>
    <Route path="/" element={<Storefront/>}/>
    <Route path="/shop" element={<Shop/>}/>
    <Route path="/product/:slug" element={<ProductDetail/>}/>
    <Route path="/admin/login" element={<AdminLogin/>}/>
    <Route path="/admin" element={<ProtectedAdmin/>}>
      <Route index element={<AdminDashboard/>}/>
      <Route path="products" element={<AdminProducts/>}/>
      <Route path="products/new" element={<NewProduct/>}/>
      <Route path="products/:id/edit" element={<EditProduct/>}/>
    </Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></CartProvider>
}