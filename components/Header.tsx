'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useCartStore } from '@/store/useCartStore';
import { FiShoppingCart, FiMenu, FiX } from 'react-icons/fi';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const { lang, setLang, t } = useLanguage();
  const { toggleCart, items } = useCartStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { key: 'nav_home', href: '#home' },
    { key: 'nav_menu', href: '#menu' },
    { key: 'nav_offers', href: '#offers' },
    { key: 'nav_delivery', href: '#delivery' },
    { key: 'nav_about', href: '#about' },
    { key: 'nav_contact', href: '#contact' },
  ];

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass py-3' : 'bg-transparent py-5'}`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="text-2xl font-poppins font-bold text-white flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          <span className="text-roma-red text-3xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">♛</span> Pizza Roma
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 font-poppins text-sm tracking-wide">
          {navLinks.map(link => (
            <a key={link.key} href={link.href} className="text-white hover:text-roma-gold transition-colors duration-300 uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-semibold">
              {t(link.key)}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {/* Language switcher */}
          <div className="hidden md:flex items-center bg-black/30 backdrop-blur-sm rounded-full p-1 text-xs font-bold border border-white/20" suppressHydrationWarning>
            <button 
              onClick={() => setLang('de')}
              className={`px-3 py-1 rounded-full transition-all ${lang === 'de' ? 'bg-roma-red text-white' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'}`}
              suppressHydrationWarning
            >DE</button>
            <button 
              onClick={() => setLang('ru')}
              className={`px-3 py-1 rounded-full transition-all ${lang === 'ru' ? 'bg-roma-red text-white' : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'}`}
              suppressHydrationWarning
            >RU</button>
          </div>

          {/* Cart */}
          <button onClick={toggleCart} className="relative text-white hover:text-roma-gold transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            <FiShoppingCart size={24} />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-roma-red text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {items.reduce((acc, curr) => acc + curr.quantity, 0)}
              </span>
            )}
          </button>

          {/* CTA Button */}
          <a href="#menu" className="hidden lg:block bg-roma-red hover:bg-red-700 text-white px-6 py-2.5 rounded-full font-poppins font-semibold transition-all hover:shadow-lg hover:shadow-roma-red/30 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {t('hero_btn_order')}
          </a>

          {/* Mobile menu button */}
          <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden text-white text-2xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {mobileMenu ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass mt-2 mx-4 rounded-2xl overflow-hidden"
          >
            <nav className="flex flex-col p-6 gap-4">
              {navLinks.map(link => (
                <a key={link.key} href={link.href} onClick={() => setMobileMenu(false)} className="text-white text-lg border-b border-white/10 pb-2">
                  {t(link.key)}
                </a>
              ))}
              <div className="flex gap-2 mt-4">
                <button onClick={() => setLang('de')} className={`flex-1 py-2 rounded-lg ${lang === 'de' ? 'bg-roma-red' : 'bg-white/10'}`}>DE</button>
                <button onClick={() => setLang('ru')} className={`flex-1 py-2 rounded-lg ${lang === 'ru' ? 'bg-roma-red' : 'bg-white/10'}`}>RU</button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
