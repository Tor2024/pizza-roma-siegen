'use client';
import { useLanguage } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="bg-[#0A0A0A] pt-16 pb-8 text-white/60">
      <div className="container mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-poppins font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-roma-red text-3xl">♛</span> Pizza Roma
          </h3>
          <p className="text-sm leading-relaxed">{t('footer_desc')}</p>
        </div>
        
        {/* Navigation */}
        <div>
          <h4 className="text-lg font-poppins font-semibold text-white mb-4">{t('footer_nav')}</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#menu" className="hover:text-roma-gold transition-colors">{t('nav_menu')}</a></li>
            <li><a href="#delivery" className="hover:text-roma-gold transition-colors">{t('nav_delivery')}</a></li>
            <li><a href="#about" className="hover:text-roma-gold transition-colors">{t('nav_about')}</a></li>
            <li><a href="#contact" className="hover:text-roma-gold transition-colors">{t('nav_contact')}</a></li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h4 className="text-lg font-poppins font-semibold text-white mb-4">{t('footer_hours')}</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>{t('mon_thu')}</span> <span className="text-white">11:00 - 22:00</span></li>
            <li className="flex justify-between"><span>{t('fri_sat')}</span> <span className="text-white">11:00 - 23:30</span></li>
            <li className="flex justify-between"><span>{t('sun')}</span> <span className="text-white">12:00 - 22:00</span></li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h4 className="text-lg font-poppins font-semibold text-white mb-4">{t('footer_social')}</h4>
          <div className="flex gap-3 mb-6">
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-roma-red hover:border-roma-red transition-all">
              IG
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-roma-red hover:border-roma-red transition-all">
              FB
            </a>
            <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-roma-red hover:border-roma-red transition-all">
              TK
            </a>
          </div>
          <a href="#" className="inline-block bg-white/10 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-white/20 transition-all">
            🍔 {t('footer_findus')}
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs px-4 container mx-auto">
        <p>© 2024 Pizza Roma Siegen. {t('footer_copyright')}</p>
        <div className="flex gap-6 mt-4 md:mt-0">
          <a href="#" className="hover:text-white transition-colors">{t('footer_privacy')}</a>
          <a href="#" className="hover:text-white transition-colors">{t('footer_imprint')}</a>
          <a href="#" className="hover:text-white transition-colors">{t('footer_terms')}</a>
        </div>
      </div>
    </footer>
  );
}
