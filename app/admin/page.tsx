'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiLogOut, FiCheckCircle, FiAlertCircle, FiPackage, FiTruck, FiClock } from 'react-icons/fi';

// Конфигурация статусов
const statusMap = {
  received: { 
    label: 'Получен', 
    labelDe: 'Empfangen', 
    color: 'bg-blue-500', 
    icon: FiPackage,
    hint: '🔔 Новый заказ! Проверьте наличие ингредиентов.' 
  },
  preparing: { 
    label: 'Готовится', 
    labelDe: 'In Zubereitung', 
    color: 'bg-orange-500', 
    icon: FiClock,
    hint: '🔥 Пицца в печи. Клиент получил SMS.' 
  },
  delivering: { 
    label: 'В пути', 
    labelDe: 'Unterwegs', 
    color: 'bg-indigo-500', 
    icon: FiTruck,
    hint: '🏍 Курьер выехал. Время доставки ~15 мин.' 
  },
  done: { 
    label: 'Доставлен', 
    labelDe: 'Geliefert', 
    color: 'bg-green-500', 
    icon: FiCheckCircle,
    hint: '✅ Заказ завершен.' 
  },
  cancelled: { 
    label: 'Отменен', 
    labelDe: 'Storniert', 
    color: 'bg-red-500', 
    icon: FiAlertCircle,
    hint: '❌ Заказ отменен.' 
  },
};

type OrderStatus = keyof typeof statusMap;

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{
    name: { de: string; ru: string };
    quantity: number;
    price: number;
    size?: string;
  }>;
  total: number;
  subtotal: number;
  deliveryFee: number;
  status: OrderStatus;
  createdAt: number;
  promoCode?: string;
  promoDiscount?: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'orders' | 'menu'>('orders');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuData, setMenuData] = useState<any>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Получаем admin token из cookie
  const getAdminToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];
  };

  // Загрузка заказов
  const fetchOrders = async () => {
    const token = getAdminToken();
    if (!token) {
      setError('Not authenticated');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setError('');
      } else {
        const err = await res.json();
        setError(err.error || 'Failed to fetch orders');
      }
    } catch (err) {
      setError('Network error');
    }
    setLoading(false);
  };

  // Загрузка меню
  const fetchMenu = async () => {
    setMenuLoading(true);
    try {
      const res = await fetch('/api/admin/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuData(data);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    }
    setMenuLoading(false);
  };

  // Polling каждые 10 секунд
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Загрузка меню при переключении таба
  useEffect(() => {
    if (tab === 'menu') {
      fetchMenu();
    }
  }, [tab]);

  // Изменение статуса заказа
  const changeStatus = async (orderId: string, newStatus: OrderStatus) => {
    const token = getAdminToken();
    if (!token) return;

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id: orderId, newStatus })
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: newStatus } : o
        ));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Сохранение меню в GitHub
  const saveMenu = async () => {
    const token = getAdminToken();
    if (!token || !menuData) return;

    setMenuLoading(true);
    setSaveMessage('');

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(menuData)
      });

      const result = await res.json();
      if (res.ok) {
        setSaveMessage('✅ Меню сохранено! Vercel обновит сайт через 1 минуту.');
      } else {
        setSaveMessage(`❌ Ошибка: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      setSaveMessage('❌ Network error');
    }

    setMenuLoading(false);
  };

  // Выход
  const logout = () => {
    document.cookie = 'admin_token=; Max-Age=0; path=/';
    window.location.href = '/admin/login';
  };

  // Форматирование времени
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-roma-dark text-white">
      {/* Header */}
      <header className="bg-black/30 border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-roma-red text-3xl">♛</span>
            <h1 className="text-2xl font-poppins font-bold">Pizza Roma Admin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchOrders}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="Обновить"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-roma-red hover:bg-red-700 transition-colors"
            >
              <FiLogOut /> Выход
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b border-white/10">
          <button 
            onClick={() => setTab('orders')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'orders' ? 'bg-roma-red text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Заказы ({orders.length})
          </button>
          <button 
            onClick={() => setTab('menu')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'menu' ? 'bg-roma-red text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Меню и Настройки
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <AnimatePresence mode="wait">
          {tab === 'orders' ? (
            <motion.div
              key="orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                  {error}
                </div>
              )}

              {orders.length === 0 && !loading && (
                <div className="text-center py-20 text-white/40">
                  <FiPackage size={48} className="mx-auto mb-4" />
                  <p className="text-xl">Заказов пока нет...</p>
                  <p className="text-sm mt-2">Новые заказы появятся здесь автоматически</p>
                </div>
              )}

              {orders.map((order) => {
                const cfg = statusMap[order.status];
                const StatusIcon = cfg.icon;
                
                return (
                  <motion.div
                    key={order.id}
                    layout
                    className="bg-white/5 rounded-2xl p-6 border border-white/10"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Информация о заказе */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{order.customer.name}</h3>
                            <p className="text-white/60 text-sm">#{order.id.slice(-8)} • {formatTime(order.createdAt)}</p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${cfg.color} text-white text-sm font-semibold`}>
                            <StatusIcon size={14} />
                            {cfg.label} / {cfg.labelDe}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-white/80">📞 {order.customer.phone}</p>
                          <p className="text-white/60 text-sm">📍 {order.customer.address}</p>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4">
                          <p className="text-sm text-white/60 mb-2">Состав заказа:</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm py-1">
                              <span>{item.quantity}x {item.name.ru} {item.size && `(${item.size}cm)`}</span>
                              <span className="text-white/60">{(item.price * item.quantity).toFixed(2)} €</span>
                            </div>
                          ))}
                          {order.promoCode && (
                            <div className="flex justify-between text-sm py-1 text-green-400">
                              <span>Промокод {order.promoCode}</span>
                              <span>-{order.promoDiscount?.toFixed(2)} €</span>
                            </div>
                          )}
                          <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-bold">
                            <span>Итого:</span>
                            <span className="text-roma-gold">{order.total.toFixed(2)} €</span>
                          </div>
                        </div>

                        <p className="text-sm text-roma-gold mt-3">{cfg.hint}</p>
                      </div>

                      {/* Управление статусом */}
                      <div className="lg:w-64 space-y-2">
                        <p className="text-sm text-white/60 mb-2">Изменить статус:</p>
                        {Object.entries(statusMap).map(([status, config]) => (
                          <button
                            key={status}
                            onClick={() => changeStatus(order.id, status as OrderStatus)}
                            disabled={order.status === status}
                            className={`w-full flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                              order.status === status
                                ? `${config.color} text-white cursor-default`
                                : 'bg-white/5 hover:bg-white/10 text-white/80'
                            }`}
                          >
                            <config.icon size={14} />
                            {config.label} / {config.labelDe}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h2 className="text-2xl font-bold mb-4">Управление Меню</h2>
                <p className="text-white/60 mb-6">
                  Изменения будут отправлены в GitHub. Vercel автоматически обновит сайт в течение 1 минуты.
                </p>

                {saveMessage && (
                  <div className={`p-4 rounded-xl mb-4 ${saveMessage.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {saveMessage}
                  </div>
                )}

                {menuLoading ? (
                  <div className="text-center py-10">
                    <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-white/60">Загрузка...</p>
                  </div>
                ) : menuData ? (
                  <div className="space-y-4">
                    {/* Настройки доставки */}
                    <div className="bg-black/20 rounded-xl p-4">
                      <h3 className="font-semibold mb-3">Настройки доставки</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm text-white/60">Мин. заказ (€)</label>
                          <input
                            type="number"
                            value={menuData.settings.delivery.minOrder}
                            onChange={(e) => setMenuData({
                              ...menuData,
                              settings: { ...menuData.settings, delivery: { ...menuData.settings.delivery, minOrder: parseFloat(e.target.value) } }
                            })}
                            className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/60">Бесплатно от (€)</label>
                          <input
                            type="number"
                            value={menuData.settings.delivery.freeDeliveryThreshold}
                            onChange={(e) => setMenuData({
                              ...menuData,
                              settings: { ...menuData.settings, delivery: { ...menuData.settings.delivery, freeDeliveryThreshold: parseFloat(e.target.value) } }
                            })}
                            className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/60">Стоимость доставки (€)</label>
                          <input
                            type="number"
                            value={menuData.settings.delivery.deliveryFee}
                            onChange={(e) => setMenuData({
                              ...menuData,
                              settings: { ...menuData.settings, delivery: { ...menuData.settings.delivery, deliveryFee: parseFloat(e.target.value) } }
                            })}
                            className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-white/60">Время доставки</label>
                          <input
                            type="text"
                            value={menuData.settings.delivery.estimatedTime}
                            onChange={(e) => setMenuData({
                              ...menuData,
                              settings: { ...menuData.settings, delivery: { ...menuData.settings.delivery, estimatedTime: e.target.value } }
                            })}
                            className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Статистика */}
                    <div className="bg-black/20 rounded-xl p-4">
                      <h3 className="font-semibold mb-3">Статистика меню</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {Object.entries(menuData.categories).map(([key, cat]: [string, any]) => (
                          <div key={key} className="bg-white/5 rounded-lg p-3 text-center">
                            <p className="text-2xl font-bold text-roma-gold">{cat.items.length}</p>
                            <p className="text-sm text-white/60">{cat.name.ru}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={saveMenu}
                      disabled={menuLoading}
                      className="w-full bg-roma-red hover:bg-red-700 disabled:bg-gray-600 py-4 rounded-xl font-bold transition-colors"
                    >
                      {menuLoading ? 'Сохранение...' : '💾 Сохранить изменения в GitHub'}
                    </button>
                  </div>
                ) : (
                  <p className="text-white/40">Не удалось загрузить меню</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
