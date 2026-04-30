'use client';
import { motion } from 'framer-motion';
import { FaMotorcycle, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import { useLanguage } from '@/context/LanguageContext';

export default function DeliverySection() {
  const { t } = useLanguage();
  const zones = ['Siegen Zentrum', 'Weidenau', 'Geisweid', 'Eiserfeld', 'Netphen'];
  const statuses = [
    { time: '0 Min', text: t('order_received'), color: 'bg-blue-500' },
    { time: '10 Min', text: t('status_preparing'), color: 'bg-orange-500' },
    { time: '25 Min', text: t('on_the_way'), color: 'bg-roma-red' },
    { time: '35 Min', text: t('delivered'), color: 'bg-green-500' },
  ];

  return (
    <section id="delivery" className="py-24 bg-roma-dark relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-roma-red/5 rounded-full blur-3xl"></div>
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Map and Zones */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 relative z-10"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-roma-red p-4 rounded-2xl text-white text-2xl"><FaMotorcycle /></div>
            <div>
              <h3 className="text-2xl font-poppins font-bold text-white">{t('delivery_area')}</h3>
              <p className="text-white/60 text-sm">{t('delivery_free_time')}</p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden h-64 mb-6 border border-white/10">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2529.8!2d8.015!3d50.875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sKölner+Straße+45,+57072+Siegen!5e0!3m2!1sde!2sde!4v1610000000000!5m2!1sde!2sde" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="flex flex-wrap gap-3">
            {zones.map(zone => (
              <span key={zone} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm text-white/80">
                <FaMapMarkerAlt className="text-roma-gold text-xs" /> {zone}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Delivery status */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl font-poppins font-bold text-white mb-8">{t('realtime_tracking')}</h3>
          
          <div className="relative pl-8 border-l-2 border-white/10 space-y-10">
            {statuses.map((status, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className={`absolute -left-[25px] top-0 w-4 h-4 rounded-full ${status.color} shadow-lg shadow-current`}></div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">{status.time}</p>
                <h4 className="text-xl font-poppins font-semibold text-white mt-1">{status.text}</h4>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
