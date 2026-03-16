import type { AppProps } from 'next/app'
import { AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'
import PWAInstall from '../components/PWAInstall'
import FloatingActions from '../components/FloatingActions'
import '../styles/globals.css'

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Component key={router.route} {...pageProps} />
          <Footer />
        </div>
      </AnimatePresence>
      <PWAInstall />
      <FloatingActions />
    </>
  )
}
