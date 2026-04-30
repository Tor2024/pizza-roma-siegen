'use client';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaClock } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

export default function ContactSection() {
  const { t } = useLanguage();
  return (
    <section id="contact" className="py-24 bg-roma-gray text-roma-text">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-poppins font-bold mb-8">{t('contact_title')}</h2>
          
          <div className="space-y-6 mb-10">
            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-roma-red text-white p-3 rounded-xl mt-1"><FaMapMarkerAlt /></div>
              <div>
                <h4 className="font-bold font-poppins text-lg">{t('address')}</h4>
                <p className="text-gray-500">Kölner Straße 45, 57072 Siegen, Germany</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-roma-gold text-roma-dark p-3 rounded-xl mt-1"><FaPhone /></div>
              <div>
                <h4 className="font-bold font-poppins text-lg">{t('contact_phone')}</h4>
                <p className="text-gray-500">+49 271 458 92 10</p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-6 rounded-2xl shadow-sm">
              <div className="bg-roma-dark text-white p-3 rounded-xl mt-1"><FaClock /></div>
              <div>
                <h4 className="font-bold font-poppins text-lg">{t('footer_hours')}</h4>
                <p className="text-gray-500">{t('mon_thu')}: 11:00–22:00 | {t('fri_sat')}: 11:00–23:30 | {t('sun')}: 12:00–22:00</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl overflow-hidden shadow-xl h-[400px] lg:h-auto"
        >
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2529.8!2d8.015!3d50.875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sKölner+Straße+45,+57072+Siegen!5e0!3m2!1sde!2sde!4v1610000000000!5m2!1sde!2sde" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen={false} 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}
