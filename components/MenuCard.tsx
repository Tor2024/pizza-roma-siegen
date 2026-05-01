'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useCartStore } from '@/store/useCartStore';
import { FiPlus, FiCheck } from 'react-icons/fi';
import { showToast } from '@/components/Toast';

interface Topping { id: string; name: { de: string; ru: string }; price: number; }
interface Props {
  id: string;
  image: string;
  name: { de: string; ru: string };
  desc: { de: string; ru: string };
  prices: { [size: string]: number };
  toppings: Topping[];
}

export default function MenuCard({ id, image, name, desc, prices, toppings }: Props) {
  const { t } = useLanguage();
  const addItem = useCartStore(state => state.addItem);
  const [selectedSize, setSelectedSize] = useState(Object.keys(prices)[0]);
  const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddTopping = (topping: Topping) => {
    setSelectedToppings(prev => 
      prev.find(t => t.id === topping.id) 
        ? prev.filter(t => t.id !== topping.id) 
        : [...prev, topping]
    );
  };

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      size: selectedSize,
      price: prices[selectedSize],
      quantity: 1,
      toppings: selectedToppings,
      image
    });
    setAddedToCart(true);
    showToast(`${name.de} (${selectedSize}cm) zum Warenkorb hinzugefügt`, 'success');
    setTimeout(() => setAddedToCart(false), 1500);
  };

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-light rounded-3xl overflow-hidden flex flex-col h-full text-roma-text"
    >
      <div className="relative aspect-[4/3] overflow-hidden group">
        <Image 
          src={image} 
          alt={name.de} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <h3 className="font-poppins font-bold text-xl mb-1">{name.de}</h3>
        <p className="text-sm text-gray-500 mb-4 flex-grow">{desc.de}</p>

        {/* Size selection */}
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t('size')}:</p>
          <div className="flex gap-2 flex-wrap">
            {Object.keys(prices).map(size => (
              <button 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedSize === size ? 'bg-roma-red text-white shadow-lg' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {size} cm - {prices[size].toFixed(2)} € <span className="text-xs font-normal text-gray-400">(inkl. 19% MwSt)</span>
              </button>
            ))}
          </div>
        </div>

        {/* Toppings */}
        {toppings.length > 0 && (
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">{t('extras')}:</p>
            <div className="flex flex-wrap gap-2">
              {toppings.map(top => (
                <button 
                  key={top.id}
                  onClick={() => handleAddTopping(top)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${selectedToppings.find(t => t.id === top.id) ? 'bg-roma-gold/10 border-roma-gold text-roma-dark' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                >
                  +{top.name.de} ({top.price.toFixed(2)}€)
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Add to cart button */}
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={handleAddToCart}
          className={`w-full py-3 rounded-2xl font-poppins font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${addedToCart ? 'bg-green-500 text-white' : 'bg-roma-dark text-white hover:bg-roma-red'}`}
        >
          {addedToCart ? <><FiCheck /> {t('added')}</> : <><FiPlus /> {t('add_to_cart')} – {(prices[selectedSize] + selectedToppings.reduce((a, b) => a + b.price, 0)).toFixed(2)} € <span className="text-xs font-normal opacity-70">(inkl. MwSt)</span></>}
        </motion.button>
      </div>
    </motion.div>
  );
}
