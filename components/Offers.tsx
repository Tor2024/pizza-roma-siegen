'use client';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const offers = [
  {
    id: 1,
    img: '/images/offer-2pizza.webp',
    title: { de: '2 Pizzen + Cola', ru: '2 Пиццы + Кола' },
    price: '19.90 €',
    badge: 'Spare 30%'
  },
  {
    id: 2,
    img: '/images/offer-family.webp',
    title: { de: 'Familien Menü', ru: 'Семейное Меню' },
    price: '29.90 €',
    badge: 'Bestseller'
  },
  {
    id: 3,
    img: '/images/offer-lunch.webp',
    title: { de: 'Mittagsangebot', ru: 'Обеденное предложение' },
    price: '8.90 €',
    badge: '11-14 Uhr'
  }
];

export default function Offers() {
  const { t } = useLanguage();

  return (
    <section id="offers" className="py-20 bg-roma-dark">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-poppins font-bold text-white">{t('nav_offers')}</h2>
          <div className="w-20 h-1 bg-roma-gold mx-auto mt-4"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {offers.map((offer, i) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="glass rounded-3xl overflow-hidden group relative cursor-pointer"
            >
              <div className="absolute top-4 right-4 bg-roma-gold text-roma-dark px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                {offer.badge}
              </div>
              <div className="h-56 overflow-hidden">
                <img 
                  src={offer.img} 
                  alt={offer.title.de}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 will-change-transform"
                />
              </div>
              <div className="p-6 flex justify-between items-center">
                <h3 className="text-xl font-poppins font-semibold text-white">{offer.title.de}</h3>
                <span className="text-2xl font-poppins font-bold text-roma-gold">{offer.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
