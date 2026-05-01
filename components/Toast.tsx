'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX } from 'react-icons/fi';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: ((toast: Toast) => void)[] = [];

export function showToast(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const toast: Toast = {
    id: Math.random().toString(36).substr(2, 9),
    message,
    type
  };
  toastListeners.forEach(listener => listener(toast));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (toast: Toast) => {
      setToasts(prev => [...prev, toast]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, 3000);
    };

    toastListeners.push(handleToast);
    return () => {
      toastListeners = toastListeners.filter(l => l !== handleToast);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${
              toast.type === 'success' 
                ? 'bg-green-500/90 border-green-400 text-white' 
                : toast.type === 'error'
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-roma-gold/90 border-roma-gold text-roma-dark'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              {toast.type === 'success' && <FiCheck size={14} />}
              {toast.type === 'error' && <FiX size={14} />}
              {toast.type === 'info' && <span className="text-sm">ℹ</span>}
            </div>
            <span className="font-medium text-sm">{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-white/70 hover:text-white"
            >
              <FiX size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
