import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/context/LanguageContext'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import CartSidebar from '@/components/CartSidebar'
import FloatingCTA from '@/components/FloatingCTA'

export const metadata: Metadata = {
  title: 'Pizza Roma Siegen | Beste Italienische Pizza & Lieferservice',
  description: 'Original italienische Pizza in Siegen. Schnelle Lieferung in 30 Minuten. Bestellen Sie online! Pizza Siegen, Pizza Lieferservice Siegen, beste Pizza in Siegen.',
  keywords: 'Pizza Siegen, Pizza Lieferservice Siegen, beste Pizza in Siegen, italienische Pizza Siegen, Pizza Roma',
  openGraph: {
    title: 'Pizza Roma Siegen | Beste Pizza in der Stadt',
    description: 'Heiße pizza, schnell geliefert. Jetzt online bestellen!',
    images: ['/images/hero-bg.webp']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="font-inter antialiased">
        <LanguageProvider>
          <Header />
          <CartSidebar />
          <main>{children}</main>
          <FloatingCTA />
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
