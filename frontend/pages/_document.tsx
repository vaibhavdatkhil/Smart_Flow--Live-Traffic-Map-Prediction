import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* PWA */}
        <link rel="manifest" href="/manifest.json"/>
        <meta name="theme-color" content="#00d4ff"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <meta name="apple-mobile-web-app-title" content="SmartFlow"/>
        <link rel="apple-touch-icon" href="/icon-192.png"/>
        <meta name="description" content="AI-powered smart city traffic prediction for 8 Indian cities"/>
        <meta name="keywords" content="traffic, AI, prediction, smart city, India, maps"/>
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Exo+2:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      </Head>
      <body>
        <Main/>
        <NextScript/>
      </body>
    </Html>
  )
}
