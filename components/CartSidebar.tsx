'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/store/useCartStore';
import { useLanguage } from '@/context/LanguageContext';
import { FiX, FiMinus, FiPlus, FiShoppingBag } from 'react-icons/fi';
import CheckoutModal from './CheckoutModal';

export default function CartSidebar() {
  const { isOpen, toggleCart, items, updateQuantity, removeItem, subtotal, deliveryFee, total } = useCartStore();
  const { t } = useLanguage();
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          />
          
          {/* Panel */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-roma-dark z-50 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-poppins font-bold text-white flex items-center gap-3">
                <FiShoppingBag className="text-roma-gold" /> {t('cart_title')}
              </h2>
              <button onClick={toggleCart} className="text-white/70 hover:text-white text-2xl"><FiX /></button>
            </div>

            {/* Items list */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-white/40">
                  <FiShoppingBag size={48} className="mb-4" />
                  <p>{t('cart_empty')}</p>
                </div>
              ) : (
                items.map((item) => {
                  const topStr = item.toppings.map(t=>t.id).join(',');
                  return (
                    <motion.div key={`${item.id}-${item.size}-${topStr}`} layout className="flex gap-4 bg-white/5 p-3 rounded-2xl">
                      <img src={item.image} alt="" className="w-20 h-20 rounded-xl object-cover"/>
                      <div className="flex-grow">
                        <h4 className="font-poppins font-semibold text-white">{item.name.de} ({item.size}cm)</h4>
                        {item.toppings.length > 0 && (
                          <p className="text-xs text-roma-gold mt-1">+ {item.toppings.map(t => t.name.de).join(', ')}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg">
                            <button onClick={() => updateQuantity(item.id, item.size, topStr, item.quantity - 1)} className="p-1 text-white/70 hover:text-white"><FiMinus /></button>
                            <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.size, topStr, item.quantity + 1)} className="p-1 text-white/70 hover:text-white"><FiPlus /></button>
                          </div>
                          <span className="text-white font-bold">{(item.price * item.quantity + item.toppings.reduce((a,b)=>a+b.price,0)*item.quantity).toFixed(2)} €</span>
                        </div>
                      </div>
                      <button onClick={() => removeItem(item.id, item.size, topStr)} className="text-red-400 hover:text-red-300 self-start mt-1"><FiX /></button>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-black/20">
                <div className="space-y-3 mb-6 text-white/80 text-sm">
                  <div className="flex justify-between">
                    <span>{t('subtotal')}</span>
                    <span>{subtotal().toFixed(2)} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('delivery_fee')}</span>
                    <span className={deliveryFee() === 0 ? 'text-green-400' : ''}>{deliveryFee() === 0 ? t('free') : deliveryFee().toFixed(2) + ' €'}</span>
                  </div>
                  {subtotal() < 15 && <p className="text-red-400 text-xs">{t('min_order')}: 15.00 €</p>}
                  {subtotal() < 25 && subtotal() >= 15 && <p className="text-roma-gold text-xs">{t('until_free_delivery')}: {(25 - subtotal()).toFixed(2)} €</p>}
                  <div className="flex justify-between pt-3 border-t border-white/20 text-lg font-bold text-white">
                    <span>{t('total')}</span>
                    <span>{total().toFixed(2)} €</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">Alle Preise inkl. 19% MwSt.</p>
                </div>
                <button 
                  onClick={() => setShowCheckout(true)}
                  disabled={subtotal() < 15} 
                  className="w-full bg-roma-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-poppins font-bold text-lg transition-all shadow-lg shadow-roma-red/20"
                >
                  {t('checkout')}
                </button>

                <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
