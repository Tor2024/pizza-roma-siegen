'use client';
import { motion } from 'framer-motion';
import { FaStar, FaQuoteLeft } from 'react-icons/fa';

const reviews = [
  { id: 1, name: 'Markus W.', text: 'Beste Pizza in Siegen. Schnelle Lieferung, der Teig ist perfekt!', rating: 5, lang: 'de' },
  { id: 2, name: 'Анна С.', text: 'Очень вкусно и быстро доставили. Пицца Маргарита просто огонь!', rating: 5, lang: 'ru' },
  { id: 3, name: 'Lena K.', text: 'Familienservice erstklassig. Das Quattro Formaggi ist auf einer anderen Ebene.', rating: 5, lang: 'de' },
];

export default function ReviewsSection() {
  return (
    <section className="py-24 bg-roma-dark relative overflow-hidden">
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-poppins font-bold text-white">Kunden <span className="text-roma-gold">Lieben</span> Uns</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="glass p-8 rounded-3xl hover:bg-white/10 transition-all duration-300 group"
            >
              <FaQuoteLeft className="text-roma-red/30 text-4xl mb-4 group-hover:text-roma-red/50 transition-colors" />
              <div className="flex mb-4 text-roma-gold">
                {[...Array(review.rating)].map((_, i) => <FaStar key={i} />)}
              </div>
              <p className="text-white/80 mb-6 text-lg italic leading-relaxed">&ldquo;{review.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-roma-red flex items-center justify-center text-white font-bold">
                  {review.name[0]}
                </div>
                <span className="text-white font-poppins font-semibold">{review.name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
