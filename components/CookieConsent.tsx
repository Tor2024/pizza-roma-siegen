'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  const acceptEssentialOnly = () => {
    localStorage.setItem('cookieConsent', 'essential');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 border-t border-white/20 p-4 md:p-6"
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">🍪 Datenschutz & Cookies</h3>
                <p className="text-white/70 text-sm leading-relaxed max-w-3xl">
                  Wir verwenden technisch notwendige Cookies, um den Betrieb der Website zu gewährleisten (z.B. Warenkorb, Login). 
                  Diese Cookies sind ohne Ihre Einwilligung erforderlich. Weitere Informationen finden Sie in unserer{' '}
                  <a href="/datenschutz" className="text-roma-gold hover:underline">Datenschutzerklärung</a>.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={acceptEssentialOnly}
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Nur Essenzielle
                </button>
                <button
                  onClick={acceptCookies}
                  className="px-4 py-2.5 bg-roma-red hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  Alle Akzeptieren
                </button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
              <p>
                Sie können Ihre Cookie-Einstellungen jederzeit ändern. 
                Gesetzliche Grundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse) für technisch notwendige Cookies.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
