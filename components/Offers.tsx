'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const fallbackOffers = [
  {
    id: 'o1',
    img: '/images/offer-2pizza.webp',
    title: { de: '2 Pizzen + Cola', ru: '2 Пиццы + Кола' },
    desc: { de: '2 Pizzen nach Wahl + 0,5L Cola', ru: '2 Пиццы на выбор + 0,5л Кола' },
    price: '19.90 €',
    badge: 'Spare 30%'
  },
  {
    id: 'o2',
    img: '/images/offer-family.webp',
    title: { de: 'Familien Menü', ru: 'Семейное Меню' },
    desc: { de: '3 Pizzen + 2 Getränke + Dessert', ru: '3 Пиццы + 2 Напитка + Десерт' },
    price: '29.90 €',
    badge: 'Bestseller'
  },
  {
    id: 'o3',
    img: '/images/offer-lunch.webp',
    title: { de: 'Mittagsangebot', ru: 'Обеденное предложение' },
    desc: { de: 'Pizza + Salat + Getränk 11-14 Uhr', ru: 'Пицца + Салат + Напиток 11-14' },
    price: '8.90 €',
    badge: '11-14 Uhr'
  }
];

export default function Offers() {
  const { t, lang } = useLanguage();
  const [offers, setOffers] = useState(fallbackOffers);

  useEffect(() => {
    fetch('/api/menu', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.offers && data.offers.length > 0) {
          setOffers(data.offers);
        }
      })
      .catch(() => {});
  }, []);

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
              key={offer.id || i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="glass rounded-3xl overflow-hidden group relative cursor-pointer"
            >
              {offer.badge && (
                <div className="absolute top-4 right-4 bg-roma-gold text-roma-dark px-3 py-1 rounded-full text-sm font-bold z-10 shadow-lg">
                  {offer.badge}
                </div>
              )}
              <div className="h-56 overflow-hidden relative">
                <Image 
                  src={offer.img} 
                  alt={offer.title?.de || offer.title?.ru || 'Angebot'}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-poppins font-semibold text-white">
                    {offer.title?.[lang] || offer.title?.de}
                  </h3>
                  {offer.desc?.[lang] && (
                    <p className="text-sm text-white/60 mt-1">{offer.desc[lang]}</p>
                  )}
                </div>
                <span className="text-2xl font-poppins font-bold text-roma-gold">{offer.price}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
