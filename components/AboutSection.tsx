'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

export default function AboutSection() {
  const text = 'Pizza Roma Siegen — eine Familienpizzeria, die seit 2016 arbeitet. Wir kochen nach traditionellen italienischen Rezepten, verwenden frische Zutaten und liefern heiße Pizza in ganz Siegen.';

  return (
    <section id="about" className="py-24 bg-roma-gray text-roma-text">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="rounded-3xl overflow-hidden shadow-2xl premium-shadow rotate-2 hover:rotate-0 transition-transform duration-700">
            <img src="/images/chiefs.webp" alt="Our Chiefs" className="w-full h-[500px] object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 bg-roma-gold text-roma-dark px-6 py-3 rounded-2xl font-poppins font-bold shadow-xl text-lg">
            Seit 2016
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-poppins font-bold mb-6">Über <span className="text-roma-red">Uns</span></h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">{text}</p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-roma-red">
              <h4 className="text-4xl font-bold text-roma-red font-poppins">100%</h4>
              <p className="text-sm text-gray-500 mt-1">Frische Zutaten</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-roma-gold">
              <h4 className="text-4xl font-bold text-roma-gold font-poppins">30min</h4>
              <p className="text-sm text-gray-500 mt-1">Schnelle Lieferung</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
