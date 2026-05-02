'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { ImFire } from 'react-icons/im';
import { BsStarFill, BsPeopleFill, BsClockFill } from 'react-icons/bs';

export default function Hero() {
  const { t } = useLanguage();

  const stats = [
    { icon: <BsStarFill className="text-roma-gold" />, value: t('hero_rating') },
    { icon: <BsPeopleFill className="text-roma-gold" />, value: t('hero_customers') },
    { icon: <BsClockFill className="text-roma-gold" />, value: t('hero_delivery') },
  ];

  return (
    <section id="home" className="relative min-h-screen flex items-start justify-center overflow-hidden pt-20 md:pt-24">
      {/* Background and overlay */}
      <div className="absolute inset-0 bg-hero-pattern bg-cover bg-center scale-105 animate-slow-zoom"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-roma-dark via-roma-dark/70 to-transparent"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-roma-dark/90 to-transparent"></div>

      {/* Content */}
       <div className="relative z-10 container mx-auto px-4 grid lg:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 bg-roma-red/20 border border-roma-red/50 px-4 py-2 rounded-full text-roma-red mb-6"
          >
            <ImFire /> {t('badge_text')}
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-extrabold leading-tight mb-4 text-white">
            {t('hero_title').split('–')[0]} 
            <span className="text-roma-gold drop-shadow-lg">– {t('hero_title').split('–')[1]}</span>
          </h1>

          <div className="flex flex-wrap gap-4 mb-4">
            <a href="#menu" className="group relative bg-roma-red hover:bg-red-700 text-white px-8 py-4 rounded-full font-poppins font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:shadow-roma-red/40 flex items-center gap-2 overflow-hidden">
            <span className="relative z-10">{t('hero_btn_order')}</span>
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </a>
          <a href="#menu" className="border-2 border-white/20 hover:border-roma-gold text-white px-8 py-4 rounded-full font-poppins font-semibold text-lg transition-all duration-300 hover:text-roma-gold">
              {t('hero_btn_menu')}
            </a>
          </div>

          <div className="flex flex-wrap gap-4 md:gap-10 mt-2">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.2 }}
                className="flex items-center gap-3 text-white/90 font-inter"
              >
            <div className="text-2xl">{stat.icon}</div>
            <div className="text-sm font-medium">{stat.value}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right side - Pizza decoration */}
        <motion.div 
          className="hidden lg:flex items-start justify-center mt-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, type: 'spring' }}
        >
          <div className="relative w-[500px] h-[500px] lg:w-[600px] lg:h-[600px] rounded-full overflow-hidden shadow-2xl border-4 border-roma-gold/30 rotate-3 hover:rotate-0 transition-transform duration-700">
            <img src="/images/pizza-hero-main.webp" alt="Pizza Roma" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-8 h-12 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-roma-gold rounded-full"></div>
        </div>
      </motion.div>
    </section>
  );
}