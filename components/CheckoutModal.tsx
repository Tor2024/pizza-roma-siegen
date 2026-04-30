'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useCartStore } from '@/store/useCartStore';
import { FiX, FiCheck, FiCreditCard, FiTruck, FiClock } from 'react-icons/fi';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { t } = useLanguage();
  const { items, subtotal, deliveryFee, total, removeItem } = useCartStore();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState('asap');
  const [address, setAddress] = useState({
    street: '',
    number: '',
    zip: '57072',
    city: 'Siegen',
    phone: '',
    email: '',
    note: ''
  });

  const paymentMethods = [
    { id: 'paypal', name: t('paypal'), icon: 'PayPal' },
    { id: 'card', name: t('card'), icon: '💳' },
    { id: 'cash', name: t('cash'), icon: '💵' },
    { id: 'googlepay', name: t('googlepay'), icon: 'G' },
  ];
  const [selectedPayment, setSelectedPayment] = useState('card');

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === 'roma10') {
      setPromoDiscount(subtotal() * 0.1);
    } else if (promoCode.toLowerCase() === 'roma20') {
      setPromoDiscount(subtotal() * 0.2);
    }
  };

  const finalTotal = total() - promoDiscount;

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsSuccess(true);
  };

  const handleNewOrder = () => {
    setIsSuccess(false);
    setStep(1);
    setPromoCode('');
    setPromoDiscount(0);
    onClose();
  };

  const deliveryOptions = [
    { id: 'asap', label: t('asap'), time: '25-35 min' },
    { id: 'scheduled', label: t('scheduled'), time: '' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-roma-dark rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-poppins font-bold text-white">
                {isSuccess ? t('order_success') : 
                 step === 1 ? t('delivery_details') : 
                 t('payment')}
              </h2>
              <button onClick={onClose} className="text-white/70 hover:text-white"><FiX size={24} /></button>
            </div>

            {/* Success State */}
            {isSuccess ? (
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiCheck size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {t('thank_you')}
                </h3>
                <p className="text-white/60 mb-6">
                  {t('preparing')}
                </p>
                <div className="bg-white/5 rounded-2xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-3 text-white/80 mb-2">
                    <FiClock className="text-roma-gold" />
                    <span>{t('delivery_time')}: 25-35 {t('minutes')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <FiTruck className="text-roma-gold" />
                    <span>{t('track_id')}: #PR{Date.now().toString().slice(-6)}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleNewOrder}
                    className="flex-1 bg-roma-red text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    {t('new_order')}
                  </button>
                  <button 
                    onClick={onClose}
                    className="flex-1 bg-white/10 text-white py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto max-h-[70vh]">
                {/* Progress */}
                <div className="flex gap-2 mb-6">
                  <div className={`flex-1 h-2 rounded-full ${step >= 1 ? 'bg-roma-red' : 'bg-white/10'}`} />
                  <div className={`flex-1 h-2 rounded-full ${step >= 2 ? 'bg-roma-red' : 'bg-white/10'}`} />
                </div>

                {step === 1 ? (
                  <div className="space-y-4">
                    {/* Address Form */}
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder={t('street')}
                        value={address.street}
                        onChange={(e) => setAddress({...address, street: e.target.value})}
                        className="bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none placeholder:text-white/40"
                      />
                      <input 
                        type="text" 
                        placeholder={t('number')}
                        value={address.number}
                        onChange={(e) => setAddress({...address, number: e.target.value})}
                        className="bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none placeholder:text-white/40"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input 
                        type="text" 
                        placeholder="PLZ" 
                        value={address.zip}
                        onChange={(e) => setAddress({...address, zip: e.target.value})}
                        className="bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none placeholder:text-white/40"
                      />
                      <input 
                        type="text" 
                        placeholder={t('city')}
                        value={address.city}
                        onChange={(e) => setAddress({...address, city: e.target.value})}
                        className="bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none placeholder:text-white/40"
                      />
                    </div>
                    <input 
                      type="tel" 
                      placeholder={t('phone')}
                      value={address.phone}
                      onChange={(e) => setAddress({...address, phone: e.target.value})}
                      className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none placeholder:text-white/40"
                    />
                    <input 
                      type="email" 
                      placeholder="E-Mail"
                      value={address.email}
                      onChange={(e) => setAddress({...address, email: e.target.value})}
                      className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none placeholder:text-white/40"
                    />
                    
                    {/* Delivery Time */}
                    <div className="pt-4">
                      <p className="text-white/60 text-sm mb-3">{t('delivery_time')}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {deliveryOptions.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => setDeliveryTime(opt.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${deliveryTime === opt.id ? 'border-roma-gold bg-roma-gold/10 text-white' : 'border-white/10 text-white/60'}`}
                          >
                            <p className="font-semibold">{opt.label}</p>
                            {opt.time && <p className="text-sm text-roma-gold">{opt.time}</p>}
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea 
                      placeholder={t('comment')}
                      value={address.note}
                      onChange={(e) => setAddress({...address, note: e.target.value})}
                      className="w-full bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none h-20 resize-none placeholder:text-white/40"
                    />

                    <button 
                      onClick={() => setStep(2)}
                      disabled={!address.street || !address.number || !address.phone}
                      className="w-full bg-roma-gold text-roma-dark py-4 rounded-xl font-bold hover:bg-yellow-500 transition-all disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                      {t('continue_payment')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="bg-white/5 rounded-2xl p-4">
                      <h3 className="text-white font-semibold mb-3">{t('order_summary')}</h3>
                      {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-white/80 text-sm mb-2">
                          <span>{item.quantity}x {item.name.de} ({item.size}cm)</span>
                          <span>{((item.price + item.toppings.reduce((a,t) => a+t.price, 0)) * item.quantity).toFixed(2)} €</span>
                        </div>
                      ))}
                      <div className="border-t border-white/10 pt-2 mt-2 space-y-1">
                        <div className="flex justify-between text-white/60 text-sm">
                          <span>{t('subtotal')}</span>
                          <span>{subtotal().toFixed(2)} €</span>
                        </div>
                        {promoDiscount > 0 && (
                          <div className="flex justify-between text-green-400 text-sm">
                            <span>{t('discount')}</span>
                            <span>-{promoDiscount.toFixed(2)} €</span>
                          </div>
                        )}
                        <div className="flex justify-between text-white/60 text-sm">
                          <span>{t('delivery_fee')}</span>
                          <span className={deliveryFee() === 0 ? 'text-green-400' : ''}>{deliveryFee() === 0 ? t('free') : deliveryFee().toFixed(2) + ' €'}</span>
                        </div>
                        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/10">
                          <span>{t('total')}</span>
                          <span>{finalTotal.toFixed(2)} €</span>
                        </div>
                      </div>
                    </div>

                    {/* Promo Code */}
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder={t('promo_code')}
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 bg-white/10 text-white p-3 rounded-xl border border-white/10 focus:border-roma-gold outline-none placeholder:text-white/40 uppercase"
                      />
                      <button 
                        onClick={applyPromoCode}
                        className="bg-white/20 text-white px-4 py-3 rounded-xl hover:bg-white/30 transition-colors"
                      >
                        {t('apply')}
                      </button>
                    </div>
                    {promoDiscount > 0 && <p className="text-green-400 text-sm">✓ {t('promo_applied')}</p>}

                    {/* Payment Methods */}
                    <div>
                      <p className="text-white/60 text-sm mb-3">{t('payment_method')}</p>
                      <div className="grid grid-cols-2 gap-3">
                        {paymentMethods.map(method => (
                          <button
                            key={method.id}
                            onClick={() => setSelectedPayment(method.id)}
                            className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${selectedPayment === method.id ? 'border-roma-gold bg-roma-gold/10 text-white' : 'border-white/10 text-white/60'}`}
                          >
                            <span className="text-xl">{method.icon}</span>
                            <span className="font-medium">{method.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button 
                        onClick={() => setStep(1)}
                        className="flex-1 bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all"
                      >
                        ← {t('back')}
                      </button>
                      <button 
                        onClick={handlePayment}
                        disabled={isProcessing}
                        className="flex-[2] bg-roma-red text-white py-4 rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            {t('processing')}...
                          </>
                        ) : (
                          <>
                            <FiCreditCard /> {t('pay_now')} {finalTotal.toFixed(2)} €
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
