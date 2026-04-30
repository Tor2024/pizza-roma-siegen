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
    
    if (token) {
      // Проверяем валидность токена
      fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => {
        if (res.ok) {
          window.location.href = from;
        }
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
        headers: { 'Authorization': `Bearer ${password}` }
      });

      if (res.ok) {
        // Устанавливаем cookie на 30 дней
        document.cookie = `admin_token=${password}; Max-Age=${30 * 24 * 60 * 60}; Path=/; SameSite=Strict`;
        window.location.href = from;
      } else {
        setError('Неверный пароль');
      }
    } catch (err) {
      setError('Ошибка сети');
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
            <p className="text-white/60 mt-1">Панель администратора</p>
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
                Пароль администратора
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-white/40 focus:outline-none focus:border-roma-gold"
                  placeholder="Введите пароль"
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
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-white/40 hover:text-white text-sm transition-colors">
              ← Вернуться на сайт
            </a>
          </div>
        </div>

        <p className="text-center text-white/30 text-sm mt-6">
          Доступ только для администраторов
        </p>
      </motion.div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-roma-dark flex items-center justify-center">
        <div className="text-white/60">Загрузка...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
