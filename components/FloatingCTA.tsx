'use client';
import { motion } from 'framer-motion';
import { FiPhoneCall } from 'react-icons/fi';

export default function FloatingCTA() {
  return (
    <motion.div 
      className="fixed bottom-6 right-6 z-30 md:hidden"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 2, type: 'spring' }}
    >
      <a href="tel:+492714589210" className="bg-roma-red w-16 h-16 rounded-full flex items-center justify-center shadow-2xl shadow-roma-red/50 text-white text-2xl relative">
        <FiPhoneCall />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-roma-gold rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-roma-gold rounded-full"></span>
      </a>
    </motion.div>
  );
}
