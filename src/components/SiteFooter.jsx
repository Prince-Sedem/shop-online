import { Link } from 'react-router-dom'
import { Instagram, Facebook, Music2, Phone, MessageCircle, ArrowUpRight } from 'lucide-react'
import { storeConfig } from '../config/store'

export default function SiteFooter() {
  const socials = [
    { label: 'Instagram', href: storeConfig.instagramUrl, Icon: Instagram },
    { label: 'TikTok', href: storeConfig.tiktokUrl, Icon: Music2 },
    { label: 'Facebook', href: storeConfig.facebookUrl, Icon: Facebook },
  ].filter(item => item.href)
  return <footer className="site-footer"><div className="container footer-main">
    <div className="footer-about"><Link to="/" className="brand"><span className="brand-mark">m.</span><span>marketday<span className="brand-dot">.</span></span></Link><p>{storeConfig.tagline} Thoughtful picks, friendly service, and easy ordering.</p><a className="footer-shop-link" href="/shop">Explore the shop <ArrowUpRight size={15}/></a></div>
    <div className="footer-links"><h3>Explore</h3><Link to="/shop">Shop all</Link><a href="/#about">About us</a><a href="/#why-us">Why Marketday</a><Link to="/admin/login" className="footer-admin">Admin</Link></div>
    <div className="footer-contact"><h3>Let's connect</h3>{storeConfig.contactNumber ? <a href={`tel:${storeConfig.contactNumber.replace(/[^+\d]/g, '')}`}><Phone size={15}/>{storeConfig.contactNumber}</a> : <span className="footer-config-note"><Phone size={15}/>Add contact number in .env</span>}{storeConfig.contactNumber && <a href={`https://wa.me/${storeConfig.contactNumber.replace(/\D/g, '')}`} target="_blank" rel="noreferrer"><MessageCircle size={15}/>Chat on WhatsApp</a>}{socials.length ? <div className="footer-socials">{socials.map(({ label, href, Icon }) => <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}><Icon size={17}/></a>)}</div> : <p className="footer-config-note">Add your social profile URLs in .env</p>}</div>
  </div><div className="container footer-bottom"><span>© {new Date().getFullYear()} Marketday. All rights reserved.</span><span>Orders confirmed personally on WhatsApp.</span></div></footer>
}
