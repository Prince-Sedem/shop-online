import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export default function ScrollReveal() {
  const location = useLocation()

  useEffect(() => {
    const revealAll = () => {
      document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach((el) => {
        el.classList.add('is-visible')
      })
    }

    if (typeof IntersectionObserver === 'undefined') {
      revealAll()
      return
    }

    let fallbackTimer
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.01, rootMargin: '0px 0px -5% 0px' })

    const observeElements = () => {
      document.querySelectorAll('.reveal-on-scroll:not(.is-visible)').forEach((el) => observer.observe(el))
    }

    // Route elements mount after this component; observe both the initial page and later updates.
    observeElements()
    const mutationObserver = new MutationObserver(observeElements)
    mutationObserver.observe(document.body, { childList: true, subtree: true })

    // Fail open if a browser delays or blocks intersection callbacks, so content never stays hidden.
    fallbackTimer = window.setTimeout(revealAll, 1800)

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
      window.clearTimeout(fallbackTimer)
    }
  }, [location.pathname, location.search])

  return null
}
