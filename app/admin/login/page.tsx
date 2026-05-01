'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  // Проверяем, есть ли уже токен
  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];
    
    // Проверяем только если токен не пустой и не пробелы
    if (token && token.trim().length > 0) {
      // Проверяем валидность токена
      fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      }).then(res => {
        if (res.ok && from !== '/admin/login') {
          window.location.href = from;
        }
      }).catch(() => {
        // Ошибка сети - игнорируем, остаёмся на странице логина
      });
    }
  }, [from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Проверяем пароль через API
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${password}` },
        credentials: 'include'
      });

      if (res.ok) {
        // Session-Cookie (wird beim Schließen des Browsers gelöscht)
        document.cookie = `admin_token=${password}; Path=/; SameSite=Strict`;
        window.location.href = from;
      } else {
        setError('Falsches Passwort');
      }
    } catch (err) {
      setError('Netzwerkfehler');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-roma-dark flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-roma-red text-4xl mb-4">♛</div>
            <h1 className="text-2xl font-poppins font-bold text-white">Pizza Roma</h1>
            <p className="text-white/60 mt-1">Admin-Bereich</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-center"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Administrator-Passwort
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-roma-gold"
                  placeholder="Passwort eingeben"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-roma-red hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold transition-colors"
            >
              {loading ? 'Anmelden...' : 'Anmelden'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-white/40 hover:text-white text-sm transition-colors">
              ← Zurück zur Website
            </a>
          </div>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Nur für Administratoren
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-roma-dark flex items-center justify-center">
        <div className="text-white/60">Wird geladen...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
