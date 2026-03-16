import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [installed, setInstalled] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true)
      return
    }

    // Check iOS
    const ios = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
    setIsIOS(ios)

    // Check if dismissed before
    const dismissed = localStorage.getItem('pwa_dismissed')
    if (dismissed) return

    // Listen for install prompt (Android/Desktop Chrome)
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setTimeout(() => setShowBanner(true), 3000)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // Show iOS instructions after delay
    if (ios) {
      setTimeout(() => setShowBanner(true), 5000)
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW registered:', reg.scope))
        .catch(err => console.log('SW error:', err))
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
        setShowBanner(false)
      }
      setDeferredPrompt(null)
    } else if (isIOS) {
      setShowInstructions(true)
    }
  }

  const dismiss = () => {
    setShowBanner(false)
    localStorage.setItem('pwa_dismissed', '1')
  }

  if (isStandalone) return null

  return (
    <>
      {/* Install Banner */}
      <AnimatePresence>
        {showBanner && !installed && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            style={{
              position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
              zIndex: 9998, width: 'min(420px, 92vw)',
              background: '#0d1424', border: '1px solid rgba(0,212,255,0.3)',
              borderRadius: 16, padding: '16px 18px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0,212,255,0.1)',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* App icon */}
              <div style={{ width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg,#00d4ff,#0055ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: '0 0 20px rgba(0,212,255,0.4)' }}>
                ⚡
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 15, color: '#e2e8f0', letterSpacing: '0.05em', marginBottom: 2 }}>
                  INSTALL SMARTFLOW AI
                </div>
                <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                  Add to home screen for instant access, offline support & push alerts
                </div>
              </div>
              <button onClick={dismiss} style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: 18, padding: 4, flexShrink: 0 }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={install} style={{ flex: 1, padding: '10px', borderRadius: 9, border: '1px solid rgba(0,212,255,0.4)', background: 'linear-gradient(135deg,rgba(0,212,255,0.2),rgba(0,136,255,0.2))', color: '#00d4ff', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', cursor: 'pointer' }}>
                📱 {isIOS ? 'HOW TO INSTALL' : 'INSTALL APP'}
              </button>
              <button onClick={dismiss} style={{ padding: '10px 16px', borderRadius: 9, border: '1px solid #1a2744', background: 'transparent', color: '#475569', fontFamily: 'Rajdhani,sans-serif', fontSize: 12, cursor: 'pointer' }}>
                Not now
              </button>
            </div>

            {/* Features */}
            <div style={{ display: 'flex', gap: 12, marginTop: 12, paddingTop: 12, borderTop: '1px solid #1a2744' }}>
              {[['⚡','Fast'],['📵','Offline'],['🔔','Alerts'],['🏠','Home Screen']].map(([i,l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569' }}>
                  <span>{i}</span><span>{l}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 20 }}
            onClick={() => setShowInstructions(false)}>
            <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} onClick={e => e.stopPropagation()}
              style={{ background: '#0d1424', border: '1px solid #1a2744', borderRadius: 20, padding: 28, width: '100%', maxWidth: 420 }}>
              <h3 style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 18, color: '#e2e8f0', margin: '0 0 20px', textAlign: 'center' }}>
                📱 Add to iPhone Home Screen
              </h3>
              {[
                { step: '1', icon: '⬆️', text: 'Tap the Share button at the bottom of Safari' },
                { step: '2', icon: '➕', text: 'Scroll down and tap "Add to Home Screen"' },
                { step: '3', icon: '⚡', text: 'Tap "Add" in the top right corner' },
                { step: '4', icon: '🎉', text: 'SmartFlow AI is now on your home screen!' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, color: '#00d4ff', flexShrink: 0 }}>{s.step}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{s.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.4 }}>{s.text}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowInstructions(false)} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid rgba(0,212,255,0.3)', background: 'rgba(0,212,255,0.1)', color: '#00d4ff', fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                ✅ Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Installed success toast */}
      <AnimatePresence>
        {installed && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9998, background: '#0d1424', border: '1px solid rgba(0,255,136,0.4)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <span style={{ fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, fontSize: 14, color: '#00ff88' }}>SmartFlow installed successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
