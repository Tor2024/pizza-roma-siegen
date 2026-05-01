'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiLogOut, FiCheckCircle, FiAlertCircle, FiPackage, FiTruck, FiClock } from 'react-icons/fi';

// Status configuration - German only
const statusMap = {
  received: { 
    label: 'Empfangen', 
    color: 'bg-blue-500', 
    icon: FiPackage,
    hint: '🔔 Neue Bestellung! Zutaten prüfen.' 
  },
  preparing: { 
    label: 'In Zubereitung', 
    color: 'bg-orange-500', 
    icon: FiClock,
    hint: '🔥 Pizza im Ofen. Kunde wurde benachrichtigt.' 
  },
  delivering: { 
    label: 'Unterwegs', 
    color: 'bg-indigo-500', 
    icon: FiTruck,
    hint: '🏍 Fahrer unterwegs. Lieferzeit ~15 Min.' 
  },
  done: { 
    label: 'Geliefert', 
    color: 'bg-green-500', 
    icon: FiCheckCircle,
    hint: '✅ Bestellung abgeschlossen.' 
  },
  cancelled: { 
    label: 'Storniert', 
    color: 'bg-red-500', 
    icon: FiAlertCircle,
    hint: '❌ Bestellung storniert.' 
  },
};

type OrderStatus = keyof typeof statusMap;

interface Order {
  id: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    email?: string;
    note?: string;
  };
  items: Array<{
    id: string;
    name: { de: string; ru: string };
    quantity: number;
    price: number;
    size?: string;
    toppings?: Array<{ id: string; name: { de: string; ru: string }; price: number }>;
    image?: string;
  }>;
  total: number;
  subtotal: number;
  deliveryFee: number;
  status: OrderStatus;
  createdAt: number;
  updatedAt?: number;
  paymentMethod?: string;
  deliveryTime?: string;
  promoCode?: string;
  promoDiscount?: number;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<'orders' | 'menu' | 'offers' | 'legal'>('orders');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [menuData, setMenuData] = useState<any>(null);
  const [menuLoading, setMenuLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [orderFilter, setOrderFilter] = useState<OrderStatus | 'all'>('all');
  
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Get admin token from cookie
  const getAdminToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];
  };

  // Load orders
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

  // Load menu
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

  // Poll every 10 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // Load menu when switching tabs
  useEffect(() => {
    if (tab === 'menu' || tab === 'offers' || tab === 'legal') {
      fetchMenu();
    }
  }, [tab]);

  // Change order status
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

  // Save menu to GitHub
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
        setSaveMessage('✅ Menü gespeichert! Vercel aktualisiert die Site in 1 Minute.');
      } else {
        setSaveMessage(`❌ Fehler: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      setSaveMessage('❌ Netzwerkfehler');
    }

    setMenuLoading(false);
  };

  // Save offers
  const saveOffers = async () => {
    setMenuLoading(true);
    const token = getAdminToken();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(menuData)
      });
      const data = await res.json();
      setSaveMessage(data.success ? '✅ Angebote gespeichert!' : `❌ Fehler: ${data.error || 'Unbekannt'}`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('❌ Speichern fehlgeschlagen');
    }
    setMenuLoading(false);
  };

  // Update legal field
  const updateLegal = (section: 'impressum' | 'datenschutz' | 'agb', field: string, value: string) => {
    const newMenuData = { ...menuData };
    if (!newMenuData.legal) newMenuData.legal = {};
    if (!newMenuData.legal[section]) newMenuData.legal[section] = {};
    newMenuData.legal[section][field] = value;
    setMenuData(newMenuData);
  };

  // Save legal
  const saveLegal = async () => {
    setMenuLoading(true);
    const token = getAdminToken();
    if (!token) return;
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(menuData)
      });
      const data = await res.json();
      setSaveMessage(data.success ? '✅ Rechtliche Texte gespeichert!' : `❌ Fehler: ${data.error || 'Unbekannt'}`);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      setSaveMessage('❌ Speichern fehlgeschlagen');
    }
    setMenuLoading(false);
  };

  // Logout
  const logout = () => {
    document.cookie = 'admin_token=; Max-Age=0; path=/';
    window.location.href = '/admin/login';
  };

  // Format time
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Update menu item
  const updateItem = (categoryKey: string, itemIndex: number, field: string, value: any) => {
    const newMenuData = { ...menuData };
    const item = newMenuData.categories[categoryKey].items[itemIndex];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      item[parent] = { ...item[parent], [child]: value };
    } else {
      item[field] = value;
    }
    
    setMenuData(newMenuData);
  };

  // Update topping
  const updateTopping = (categoryKey: string, itemIndex: number, toppingIndex: number, field: 'de' | 'price', value: any) => {
    const newMenuData = { ...menuData };
    const item = newMenuData.categories[categoryKey].items[itemIndex];
    if (!item.toppings) item.toppings = [];
    
    if (field === 'price') {
      item.toppings[toppingIndex].price = parseFloat(value);
    } else {
      item.toppings[toppingIndex].name[field] = value;
    }
    
    setMenuData(newMenuData);
  };

  // Add new item
  const addItem = (categoryKey: string) => {
    const newMenuData = { ...menuData };
    newMenuData.categories[categoryKey].items.push({
      id: `new_${Date.now()}`,
      name: { de: 'Neues Item', ru: 'Neues Item' },
      description: { de: '', ru: '' },
      price: 0,
      image: '/images/placeholder.webp',
      toppings: []
    });
    setMenuData(newMenuData);
  };

  // Delete item
  const deleteItem = (categoryKey: string, itemIndex: number) => {
    if (confirm('Diesen Artikel löschen?')) {
      const newMenuData = { ...menuData };
      newMenuData.categories[categoryKey].items.splice(itemIndex, 1);
      setMenuData(newMenuData);
    }
  };

  // Add topping
  const addTopping = (categoryKey: string, itemIndex: number) => {
    const newMenuData = { ...menuData };
    const item = newMenuData.categories[categoryKey].items[itemIndex];
    if (!item.toppings) item.toppings = [];
    item.toppings.push({ name: { de: 'Extra', ru: '' }, price: 1 });
    setMenuData(newMenuData);
  };

  // Remove topping
  const removeTopping = (categoryKey: string, itemIndex: number, toppingIndex: number) => {
    const newMenuData = { ...menuData };
    newMenuData.categories[categoryKey].items[itemIndex].toppings.splice(toppingIndex, 1);
    setMenuData(newMenuData);
  };

  // Add new category
  const addCategory = () => {
    const catId = prompt('Kategorie ID eingeben (z.B. snacks, drinks):');
    if (!catId) return;
    
    const name = prompt('Kategoriename:') || 'Neue Kategorie';
    
    const newMenuData = { ...menuData };
    newMenuData.categories[catId] = {
      id: catId,
      name: { de: name, ru: name },
      items: []
    };
    setMenuData(newMenuData);
  };

  // Delete category
  const deleteCategory = (catKey: string) => {
    if (confirm(`Kategorie "${menuData.categories[catKey].name.de}" und alle Artikel löschen?`)) {
      const newMenuData = { ...menuData };
      delete newMenuData.categories[catKey];
      setMenuData(newMenuData);
    }
  };

  // Update category name
  const updateCategoryName = (catKey: string, value: string) => {
    const newMenuData = { ...menuData };
    newMenuData.categories[catKey].name.de = value;
    setMenuData(newMenuData);
  };

  // Update offer
  const updateOffer = (offerIndex: number, field: string, value: any) => {
    const newMenuData = { ...menuData };
    if (!newMenuData.offers) newMenuData.offers = [];
    const offer = newMenuData.offers[offerIndex];
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      offer[parent] = { ...offer[parent], [child]: value };
    } else {
      offer[field] = value;
    }
    
    setMenuData(newMenuData);
  };

  // Add new offer
  const addOffer = () => {
    const newMenuData = { ...menuData };
    if (!newMenuData.offers) newMenuData.offers = [];
    newMenuData.offers.push({
      id: `o_${Date.now()}`,
      img: '/images/offer-placeholder.webp',
      title: { de: 'Neues Angebot', ru: 'Новое предложение' },
      desc: { de: '', ru: '' },
      price: '0.00 €',
      badge: ''
    });
    setMenuData(newMenuData);
  };

  // Delete offer
  const deleteOffer = (offerIndex: number) => {
    if (confirm('Dieses Angebot löschen?')) {
      const newMenuData = { ...menuData };
      newMenuData.offers.splice(offerIndex, 1);
      setMenuData(newMenuData);
    }
  };

  return (
    <div className={`min-h-screen pt-0 transition-colors duration-300 ${isDarkMode ? 'bg-roma-dark text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Fixed Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b px-6 py-3 transition-colors duration-300 ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-roma-red text-2xl">♛</span>
            <h1 className="text-xl font-poppins font-bold">Pizza Roma Admin</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
              title={isDarkMode ? 'Helles Design' : 'Dunkles Design'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={fetchOrders}
              className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
              title="Aktualisieren"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-roma-red hover:bg-red-700 transition-colors text-sm"
            >
              <FiLogOut size={16} /> Abmelden
            </button>
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-14"></div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className={`flex gap-2 border-b ${isDarkMode ? 'border-white/10' : 'border-gray-300'}`}>
          <button 
            onClick={() => setTab('orders')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'orders' 
                ? 'bg-roma-red text-white' 
                : isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Bestellungen ({orders.filter(o => o.status === 'received').length}/{orders.length})
          </button>
          <button 
            onClick={() => setTab('menu')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'menu' 
                ? 'bg-roma-red text-white' 
                : isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Menü & Einstellungen
          </button>
          <button 
            onClick={() => setTab('offers')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'offers' 
                ? 'bg-roma-red text-white' 
                : isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Angebote
          </button>
          <button 
            onClick={() => setTab('legal')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'legal' 
                ? 'bg-roma-red text-white' 
                : isDarkMode ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rechtliches
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
                <div className={`text-center py-20 ${isDarkMode ? 'text-white/40' : 'text-gray-500'}`}>
                  <FiPackage size={48} className="mx-auto mb-4" />
                  <p className="text-xl">Noch keine Bestellungen...</p>
                  <p className="text-sm mt-2">Neue Bestellungen erscheinen hier automatisch</p>
                </div>
              )}

              {/* Order filter */}
              {orders.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  <button
                    onClick={() => setOrderFilter('all')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${orderFilter === 'all' ? 'bg-roma-red text-white' : isDarkMode ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    Alle ({orders.length})
                  </button>
                  {Object.entries(statusMap).map(([status, config]) => {
                    const count = orders.filter(o => o.status === status).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={status}
                        onClick={() => setOrderFilter(status as OrderStatus)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${orderFilter === status ? `${config.color} text-white` : isDarkMode ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                      >
                        <config.icon size={12} />
                        {config.label} ({count})
                      </button>
                    );
                  })}
                </div>
              )}

              {orders
                .filter(o => orderFilter === 'all' || o.status === orderFilter)
                .map((order) => {
                const cfg = statusMap[order.status];
                const StatusIcon = cfg.icon;
                const elapsed = Math.floor((Date.now() - order.createdAt) / 60000);
                const isUrgent = order.status === 'received' && elapsed > 10;
                
                return (
                  <motion.div
                    key={order.id}
                    layout
                    className={`bg-white/5 rounded-2xl p-6 border ${isUrgent ? 'border-red-500/50 animate-pulse' : 'border-white/10'}`}
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Order information */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-bold">📍 {order.customer.address}</h3>
                              {isUrgent && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">⚠ {elapsed} Min</span>}
                            </div>
                            <p className="text-white/60 text-sm">#{order.id.slice(-8)} • {formatTime(order.createdAt)} • Vor {elapsed} Min.</p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${cfg.color} text-white text-sm font-semibold`}>
                            <StatusIcon size={14} />
                            {cfg.label}
                          </div>
                        </div>

                        <div className="space-y-1 mb-4">
                          <p className="text-white/80">📞 {order.customer.phone}</p>
                          {order.customer.email && <p className="text-white/60 text-sm">✉️ {order.customer.email}</p>}
                          {order.customer.note && <p className="text-yellow-400/80 text-sm">� {order.customer.note}</p>}
                          {order.paymentMethod && (
                            <p className="text-white/60 text-sm">
                              💰 {order.paymentMethod === 'cash' ? 'Barzahlung' : order.paymentMethod === 'card' ? 'Karte' : order.paymentMethod === 'paypal' ? 'PayPal' : order.paymentMethod}
                            </p>
                          )}
                          {order.deliveryTime && (
                            <p className="text-white/60 text-sm">🕐 {order.deliveryTime === 'asap' ? 'Schnellstmöglich' : order.deliveryTime}</p>
                          )}
                        </div>

                        <div className="bg-black/20 rounded-xl p-4">
                          <p className="text-sm text-white/60 mb-2">Bestellinhalt:</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-1">
                              <div className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name.de} {item.size && `(${item.size}cm)`}</span>
                                <span className="text-white/60">{(item.price * item.quantity).toFixed(2)} €</span>
                              </div>
                              {item.toppings && item.toppings.length > 0 && (
                                <div className="ml-4 text-xs text-white/40">
                                  + {item.toppings.map(t => t.name.de).join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                          {order.promoCode && (
                            <div className="flex justify-between text-sm py-1 text-green-400">
                              <span>Gutschein {order.promoCode}</span>
                              <span>-{order.promoDiscount?.toFixed(2)} €</span>
                            </div>
                          )}
                          <div className="border-t border-white/10 mt-2 pt-2 space-y-1">
                            <div className="flex justify-between text-sm text-white/60">
                              <span>Zwischensumme</span>
                              <span>{order.subtotal.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/60">
                              <span>Lieferkosten</span>
                              <span>{order.deliveryFee.toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between font-bold">
                              <span>Gesamt</span>
                              <span className="text-roma-gold">{order.total.toFixed(2)} €</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm text-roma-gold mt-3">{cfg.hint}</p>
                      </div>

                      {/* Status management */}
                      <div className="lg:w-64 space-y-2">
                        <p className="text-sm text-white/60 mb-2">Status ändern:</p>
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
                            {config.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : tab === 'menu' ? (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h2 className="text-2xl font-bold mb-4">Menüverwaltung</h2>
                <p className="text-white/60 mb-6">
                  Änderungen werden an GitHub gesendet. Vercel aktualisiert die Site automatisch innerhalb von 1 Minute.
                </p>

                {saveMessage && (
                  <div className={`p-4 rounded-xl mb-4 ${saveMessage.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {saveMessage}
                  </div>
                )}

                {menuLoading ? (
                  <div className="text-center py-10">
                    <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-white/60">Wird geladen...</p>
                  </div>
                ) : menuData ? (
                  <div className="space-y-4">
                    {/* Delivery settings */}
                    <div className="bg-black/20 rounded-xl p-4">
                      <h3 className="font-semibold mb-3">Lieferungseinstellungen</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="text-sm text-white/60">Min. Bestellung (€)</label>
                          <input type="number" step="0.1" value={menuData.settings?.delivery?.minOrder || 15} onChange={(e) => setMenuData({...menuData, settings: {...menuData.settings, delivery: {...menuData.settings?.delivery, minOrder: parseFloat(e.target.value)}}})} className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1 text-white" />
                        </div>
                        <div>
                          <label className="text-sm text-white/60">Gratis ab (€)</label>
                          <input type="number" step="0.1" value={menuData.settings?.delivery?.freeDeliveryThreshold || 25} onChange={(e) => setMenuData({...menuData, settings: {...menuData.settings, delivery: {...menuData.settings?.delivery, freeDeliveryThreshold: parseFloat(e.target.value)}}})} className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1 text-white" />
                        </div>
                        <div>
                          <label className="text-sm text-white/60">Lieferkosten (€)</label>
                          <input type="number" step="0.1" value={menuData.settings?.delivery?.deliveryFee || 3.5} onChange={(e) => setMenuData({...menuData, settings: {...menuData.settings, delivery: {...menuData.settings?.delivery, deliveryFee: parseFloat(e.target.value)}}})} className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1 text-white" />
                        </div>
                        <div>
                          <label className="text-sm text-white/60">Lieferzeit</label>
                          <input type="text" value={menuData.settings?.delivery?.estimatedTime || '25-35 Min'} onChange={(e) => setMenuData({...menuData, settings: {...menuData.settings, delivery: {...menuData.settings?.delivery, estimatedTime: e.target.value}}})} className="w-full bg-white/10 rounded-lg px-3 py-2 mt-1 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Add category button */}
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Menükategorien</h3>
                      <button onClick={addCategory} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold transition-colors">
                        + Kategorie hinzufügen
                      </button>
                    </div>

                    {/* Category editor */}
                    <div className="space-y-4">
                      {Object.entries(menuData.categories || {}).map(([catKey, category]: [string, any]) => (
                        <div key={catKey} className="bg-black/20 rounded-xl p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            {/* Editable category names */}
                            <div className="flex-1">
                              <label className="text-xs text-white/50">Kategoriename</label>
                              <input 
                                type="text" 
                                value={category.name?.de || catKey} 
                                onChange={(e) => updateCategoryName(catKey, e.target.value)}
                                className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-white font-semibold"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => addItem(catKey)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors">
                                + Gericht hinzufügen
                              </button>
                              <button onClick={() => deleteCategory(catKey)} className="px-4 py-2 bg-red-600/50 hover:bg-red-600 rounded-lg text-sm font-semibold transition-colors" title="Kategorie löschen">
                                🗑️
                              </button>
                            </div>
                          </div>

                          {/* Item list */}
                          <div className="space-y-3">
                            {category.items?.map((item: any, idx: number) => (
                              <div key={item.id || idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                                  {/* Name and Bild in one row - SYMMETRIC */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Name field */}
                                    <div>
                                      <label className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Name</label>
                                      <input 
                                        type="text" 
                                        value={item.name?.de || ''} 
                                        onChange={(e) => updateItem(catKey, idx, 'name.de', e.target.value)} 
                                        className={`w-full rounded px-3 py-2 mt-1 text-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} 
                                      />
                                    </div>
                                    {/* Bild field */}
                                    <div>
                                      <label className={`text-xs ${isDarkMode ? 'text-white/50' : 'text-gray-500'}`}>Bild</label>
                                      <div className="flex gap-2">
                                        <input 
                                          type="text" 
                                          value={item.image || ''} 
                                          onChange={(e) => updateItem(catKey, idx, 'image', e.target.value)} 
                                          className={`flex-1 rounded px-3 py-2 mt-1 text-sm ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900 border border-gray-300'}`} 
                                          placeholder="/images/pizza.webp" 
                                        />
                                        <label className={`px-3 py-2 mt-1 rounded cursor-pointer text-sm flex items-center ${isDarkMode ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                          📁
                                          <input 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden"
                                            onChange={async (e) => {
                                              const file = e.target.files?.[0];
                                              if (!file) return;
                                              
                                              const token = getAdminToken();
                                              const formData = new FormData();
                                              const filename = `${item.id}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                                              formData.append('file', file);
                                              formData.append('filename', filename);
                                              
                                              try {
                                                const res = await fetch('/api/admin/upload', {
                                                  method: 'POST',
                                                  headers: { 'Authorization': `Bearer ${token}` },
                                                  body: formData
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                  updateItem(catKey, idx, 'image', data.path);
                                                  setSaveMessage('✅ Bild hochgeladen!');
                                                  setTimeout(() => setSaveMessage(''), 2000);
                                                } else {
                                                  setSaveMessage(`❌ Fehler: ${data.error}`);
                                                }
                                              } catch (err) {
                                                setSaveMessage('❌ Upload fehlgeschlagen');
                                              }
                                            }}
                                          />
                                        </label>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Image preview below */}
                                  {item.image && (
                                    <div className="mt-2">
                                      <img 
                                        src={item.image} 
                                        alt={item.name?.de} 
                                        className="w-24 h-24 rounded object-cover border border-white/20"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                      />
                                    </div>
                                  )}
                                  {/* Single Price (for non-pizza items) */}
                                  {item.price && !item.prices && (
                                    <div>
                                      <label className="text-xs text-white/50">Preis (€)</label>
                                      <input type="number" step="0.01" value={item.price || 0} onChange={(e) => updateItem(catKey, idx, 'price', parseFloat(e.target.value))} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Pizza Sizes with Prices - Dynamic */}
                                {item.prices && (
                                  <div className="mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                      <label className="text-xs text-white/50">Größen & Preise</label>
                                      <button 
                                        onClick={() => {
                                          const newSize = prompt('Neue Größe eingeben (z.B. 30):');
                                          if (newSize && !item.prices[newSize]) {
                                            updateItem(catKey, idx, `prices.${newSize}`, 0);
                                          }
                                        }}
                                        className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors"
                                      >
                                        + Größe
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                      {Object.entries(item.prices).map(([size, price]: [string, any]) => (
                                        <div key={size} className="bg-white/5 rounded-lg p-2 relative group">
                                          <div className="flex items-center gap-1 mb-1">
                                            <input 
                                              type="text" 
                                              value={size} 
                                              className="flex-1 bg-transparent text-xs text-white/70 font-semibold outline-none border-b border-white/20 focus:border-roma-gold"
                                              onChange={(e) => {
                                                const newKey = e.target.value;
                                                if (newKey !== size) {
                                                  const newPrices = { ...item.prices };
                                                  newPrices[newKey] = newPrices[size];
                                                  delete newPrices[size];
                                                  updateItem(catKey, idx, 'prices', newPrices);
                                                }
                                              }}
                                            />
                                            <span className="text-xs text-white/40">cm</span>
                                            <button 
                                              onClick={() => {
                                                const newPrices = { ...item.prices };
                                                delete newPrices[size];
                                                updateItem(catKey, idx, 'prices', newPrices);
                                              }}
                                              className="text-red-400 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >×</button>
                                          </div>
                                          <input 
                                            type="number" 
                                            step="0.01" 
                                            value={price || 0} 
                                            onChange={(e) => updateItem(catKey, idx, `prices.${size}`, parseFloat(e.target.value))} 
                                            className="w-full bg-white/10 rounded px-2 py-1 text-sm text-white" 
                                          />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Description */}
                                <div className="mb-3">
                                  <label className="text-xs text-white/50">Beschreibung</label>
                                  <textarea value={item.description?.de || ''} onChange={(e) => updateItem(catKey, idx, 'description.de', e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white h-16 resize-none" />
                                </div>

                                {/* Extras / Toppings */}
                                <div className="mb-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-white/50">Extras</label>
                                    <button onClick={() => addTopping(catKey, idx)} className="text-xs px-2 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors">+ Extra</button>
                                  </div>
                                  {item.toppings?.map((topping: any, tIdx: number) => (
                                    <div key={tIdx} className="flex gap-2 mb-1">
                                      <input type="text" value={topping.name?.de || ''} onChange={(e) => updateTopping(catKey, idx, tIdx, 'de', e.target.value)} className="flex-1 bg-white/10 rounded px-2 py-1 text-xs text-white" placeholder="Extra Name" />
                                      <input type="number" step="0.1" value={topping.price || 0} onChange={(e) => updateTopping(catKey, idx, tIdx, 'price', e.target.value)} className="w-20 bg-white/10 rounded px-2 py-1 text-xs text-white" placeholder="€" />
                                      <button onClick={() => removeTopping(catKey, idx, tIdx)} className="px-2 py-1 text-red-400 hover:text-red-300 text-xs">×</button>
                                    </div>
                                  ))}
                                </div>

                                {/* Sizes (for pizza) */}
                                {item.sizes && (
                                  <div className="mb-3">
                                    <label className="text-xs text-white/50">Größen</label>
                                    <div className="flex gap-2 mt-1">
                                      {Object.entries(item.sizes).map(([size, price]: [string, any]) => (
                                        <div key={size} className="bg-white/5 rounded px-3 py-1 text-xs">
                                          {size}cm: {price}€
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Buttons */}
                                <div className="flex justify-end">
                                  <button onClick={() => deleteItem(catKey, idx)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors">
                                    Gericht löschen
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <button onClick={saveMenu} disabled={menuLoading} className="w-full bg-roma-red hover:bg-red-700 disabled:bg-gray-600 py-4 rounded-xl font-bold transition-colors sticky bottom-4 shadow-lg">
                      {menuLoading ? 'Wird gespeichert...' : '💾 Alle Änderungen in GitHub speichern'}
                    </button>
                  </div>
                ) : (
                  <p className="text-white/40">Menü konnte nicht geladen werden</p>
                )}
              </div>
            </motion.div>
          ) : tab === 'offers' ? (
            <motion.div
              key="offers"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h2 className="text-2xl font-bold mb-4">Angebote verwalten</h2>
                <p className="text-white/60 mb-6">
                  Änderungen werden an GitHub gesendet und sind in ca. 30 Sekunden auf der Website sichtbar.
                </p>

                {saveMessage && (
                  <div className={`p-4 rounded-xl mb-4 ${saveMessage.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {saveMessage}
                  </div>
                )}

                {menuLoading ? (
                  <div className="text-center py-10">
                    <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-white/60">Wird geladen...</p>
                  </div>
                ) : menuData ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-lg">Angebote ({menuData.offers?.length || 0})</h3>
                      <button onClick={addOffer} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors">
                        + Angebot hinzufügen
                      </button>
                    </div>

                    <div className="space-y-4">
                      {(menuData.offers || []).map((offer: any, idx: number) => (
                        <div key={offer.id || idx} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-3">
                            {/* Image Preview + Title DE */}
                            <div className="flex items-start gap-3">
                              {offer.img && (
                                <img 
                                  src={offer.img} 
                                  alt={offer.title?.de || 'Angebot'} 
                                  className="w-24 h-24 rounded object-cover border border-white/20 flex-shrink-0"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                              )}
                              <div className="flex-1 space-y-2">
                                <div>
                                  <label className="text-xs text-white/50">Titel</label>
                                  <input type="text" value={offer.title?.de || ''} onChange={(e) => updateOffer(idx, 'title.de', e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" />
                                </div>
                              </div>
                            </div>
                            {/* Description + Image URL */}
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs text-white/50">Beschreibung</label>
                                <input type="text" value={offer.desc?.de || ''} onChange={(e) => updateOffer(idx, 'desc.de', e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" placeholder="Beschreibung..." />
                              </div>
                              <div>
                                <label className="text-xs text-white/50">Bild URL</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    value={offer.img || ''} 
                                    onChange={(e) => updateOffer(idx, 'img', e.target.value)} 
                                    className="flex-1 bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" 
                                    placeholder="/images/offer.webp" 
                                  />
                                  <label className="px-3 py-1 mt-1 bg-white/20 hover:bg-white/30 rounded cursor-pointer text-sm flex items-center">
                                    📁
                                    <input 
                                      type="file" 
                                      accept="image/*" 
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const token = getAdminToken();
                                        const formData = new FormData();
                                        const filename = `offer_${offer.id}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                                        formData.append('file', file);
                                        formData.append('filename', filename);
                                        try {
                                          const res = await fetch('/api/admin/upload', {
                                            method: 'POST',
                                            headers: { 'Authorization': `Bearer ${token}` },
                                            body: formData
                                          });
                                          const data = await res.json();
                                          if (data.success) {
                                            updateOffer(idx, 'img', data.path);
                                            setSaveMessage('✅ Bild hochgeladen!');
                                            setTimeout(() => setSaveMessage(''), 2000);
                                          } else {
                                            setSaveMessage(`❌ Fehler: ${data.error}`);
                                          }
                                        } catch (err) {
                                          setSaveMessage('❌ Upload fehlgeschlagen');
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>
                            </div>
                            {/* Price + Badge */}
                            <div className="space-y-2">
                              <div>
                                <label className="text-xs text-white/50">Preis</label>
                                <input type="text" value={offer.price || ''} onChange={(e) => updateOffer(idx, 'price', e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" placeholder="19.90 €" />
                              </div>
                              <div>
                                <label className="text-xs text-white/50">Badge / Etikett</label>
                                <input type="text" value={offer.badge || ''} onChange={(e) => updateOffer(idx, 'badge', e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" placeholder="Spare 30%" />
                              </div>
                              <div className="flex justify-end pt-2">
                                <button onClick={() => deleteOffer(idx)} className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-xs transition-colors">
                                  Angebot löschen
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {(menuData.offers || []).length === 0 && (
                      <div className="text-center py-10 text-white/40">
                        <p className="text-lg">Keine Angebote</p>
                        <p className="text-sm mt-2">Klicken Sie auf "+ Angebot hinzufügen" um ein neues Angebot zu erstellen</p>
                      </div>
                    )}

                    <button onClick={saveOffers} disabled={menuLoading} className="w-full bg-roma-red hover:bg-red-700 disabled:bg-gray-600 py-4 rounded-xl font-bold transition-colors sticky bottom-4 shadow-lg">
                      {menuLoading ? 'Wird gespeichert...' : '💾 Angebote in GitHub speichern'}
                    </button>
                  </div>
                ) : (
                  <p className="text-white/40">Angebote konnten nicht geladen werden</p>
                )}
              </div>
            </motion.div>
          ) : tab === 'legal' ? (
            <motion.div
              key="legal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
                <h2 className="text-2xl font-bold mb-4">Rechtliche Texte verwalten</h2>
                <p className="text-white/60 mb-6">
                  Impressum, Datenschutzerklärung und AGB. Änderungen werden an GitHub gesendet und auf der Website aktualisiert.
                </p>

                {saveMessage && (
                  <div className={`p-4 rounded-xl mb-4 ${saveMessage.includes('✅') ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {saveMessage}
                  </div>
                )}

                {menuLoading ? (
                  <div className="text-center py-10">
                    <FiRefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    <p className="text-white/60">Wird geladen...</p>
                  </div>
                ) : menuData ? (
                  <div className="space-y-8">
                    {/* IMPRESSUM */}
                    <div className="bg-black/20 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-roma-gold">Impressum (§5 TMG)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs text-white/50">Firmenname</label>
                          <input type="text" value={menuData.legal?.impressum?.companyName || ''} onChange={(e) => updateLegal('impressum', 'companyName', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Inhaber</label>
                          <input type="text" value={menuData.legal?.impressum?.owner || ''} onChange={(e) => updateLegal('impressum', 'owner', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Adresse</label>
                          <input type="text" value={menuData.legal?.impressum?.address || ''} onChange={(e) => updateLegal('impressum', 'address', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" placeholder="Straße, PLZ Stadt" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Telefon</label>
                          <input type="text" value={menuData.legal?.impressum?.phone || ''} onChange={(e) => updateLegal('impressum', 'phone', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">E-Mail</label>
                          <input type="email" value={menuData.legal?.impressum?.email || ''} onChange={(e) => updateLegal('impressum', 'email', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">USt-IdNr.</label>
                          <input type="text" value={menuData.legal?.impressum?.ustId || ''} onChange={(e) => updateLegal('impressum', 'ustId', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" placeholder="DEXXXXXXXXX" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Steuernummer</label>
                          <input type="text" value={menuData.legal?.impressum?.steuernummer || ''} onChange={(e) => updateLegal('impressum', 'steuernummer', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Registergericht (optional)</label>
                          <input type="text" value={menuData.legal?.impressum?.registerCourt || ''} onChange={(e) => updateLegal('impressum', 'registerCourt', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Registernummer (optional)</label>
                          <input type="text" value={menuData.legal?.impressum?.registerNumber || ''} onChange={(e) => updateLegal('impressum', 'registerNumber', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Verantwortlich für Inhalt (§55 RStV)</label>
                          <input type="text" value={menuData.legal?.impressum?.responsibleForContent || ''} onChange={(e) => updateLegal('impressum', 'responsibleForContent', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-white/50">Verantwortlich Adresse</label>
                          <input type="text" value={menuData.legal?.impressum?.responsibleAddress || ''} onChange={(e) => updateLegal('impressum', 'responsibleAddress', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-xs text-white/50">Zusätzliche Informationen</label>
                          <textarea value={menuData.legal?.impressum?.additionalInfo || ''} onChange={(e) => updateLegal('impressum', 'additionalInfo', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" placeholder="Weitere rechtliche Hinweise..." />
                        </div>
                      </div>
                    </div>

                    {/* DATENSCHUTZ */}
                    <div className="bg-black/20 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-roma-gold">Datenschutzerklärung (DSGVO)</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-white/50">Einleitung</label>
                          <textarea value={menuData.legal?.datenschutz?.intro || ''} onChange={(e) => updateLegal('datenschutz', 'intro', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Verantwortliche Stelle</label>
                          <input type="text" value={menuData.legal?.datenschutz?.controller || ''} onChange={(e) => updateLegal('datenschutz', 'controller', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Erhobene Daten</label>
                          <textarea value={menuData.legal?.datenschutz?.dataCollected || ''} onChange={(e) => updateLegal('datenschutz', 'dataCollected', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Zweck der Verarbeitung</label>
                          <textarea value={menuData.legal?.datenschutz?.purpose || ''} onChange={(e) => updateLegal('datenschutz', 'purpose', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Hosting (Vercel)</label>
                          <textarea value={menuData.legal?.datenschutz?.hosting || ''} onChange={(e) => updateLegal('datenschutz', 'hosting', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Cookies</label>
                          <textarea value={menuData.legal?.datenschutz?.cookies || ''} onChange={(e) => updateLegal('datenschutz', 'cookies', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Ihre Rechte (DSGVO Artikel)</label>
                          <textarea value={menuData.legal?.datenschutz?.rights || ''} onChange={(e) => updateLegal('datenschutz', 'rights', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Zusätzliche Informationen</label>
                          <textarea value={menuData.legal?.datenschutz?.additionalInfo || ''} onChange={(e) => updateLegal('datenschutz', 'additionalInfo', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                      </div>
                    </div>

                    {/* AGB */}
                    <div className="bg-black/20 rounded-xl p-6">
                      <h3 className="text-xl font-semibold mb-4 text-roma-gold">Allgemeine Geschäftsbedingungen (AGB)</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs text-white/50">Firmenname</label>
                          <input type="text" value={menuData.legal?.agb?.companyName || ''} onChange={(e) => updateLegal('agb', 'companyName', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">Einleitung</label>
                          <textarea value={menuData.legal?.agb?.intro || ''} onChange={(e) => updateLegal('agb', 'intro', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 1 Geltungsbereich</label>
                          <textarea value={menuData.legal?.agb?.scope || ''} onChange={(e) => updateLegal('agb', 'scope', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 2 Vertragsschluss</label>
                          <textarea value={menuData.legal?.agb?.contractFormation || ''} onChange={(e) => updateLegal('agb', 'contractFormation', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 3 Preise</label>
                          <textarea value={menuData.legal?.agb?.prices || ''} onChange={(e) => updateLegal('agb', 'prices', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 4 Lieferung</label>
                          <textarea value={menuData.legal?.agb?.delivery || ''} onChange={(e) => updateLegal('agb', 'delivery', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 5 Zahlung</label>
                          <textarea value={menuData.legal?.agb?.payment || ''} onChange={(e) => updateLegal('agb', 'payment', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 6 Eigentumsvorbehalt</label>
                          <textarea value={menuData.legal?.agb?.retentionOfTitle || ''} onChange={(e) => updateLegal('agb', 'retentionOfTitle', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[40px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 7 Gewährleistung</label>
                          <textarea value={menuData.legal?.agb?.warranty || ''} onChange={(e) => updateLegal('agb', 'warranty', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 8 Haftung</label>
                          <textarea value={menuData.legal?.agb?.liability || ''} onChange={(e) => updateLegal('agb', 'liability', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 9 Widerrufsrecht</label>
                          <textarea value={menuData.legal?.agb?.rightOfWithdrawal || ''} onChange={(e) => updateLegal('agb', 'rightOfWithdrawal', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 10 Datenschutz</label>
                          <textarea value={menuData.legal?.agb?.dataProtection || ''} onChange={(e) => updateLegal('agb', 'dataProtection', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[40px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 11 Schlussbestimmungen</label>
                          <textarea value={menuData.legal?.agb?.finalProvisions || ''} onChange={(e) => updateLegal('agb', 'finalProvisions', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[60px]" />
                        </div>
                        <div>
                          <label className="text-xs text-white/50">§ 12 Zusätzliche Bestimmungen</label>
                          <textarea value={menuData.legal?.agb?.additionalInfo || ''} onChange={(e) => updateLegal('agb', 'additionalInfo', e.target.value)} className="w-full bg-white/10 rounded px-3 py-2 mt-1 text-sm text-white min-h-[80px]" />
                        </div>
                      </div>
                    </div>

                    <button onClick={saveLegal} disabled={menuLoading} className="w-full bg-roma-red hover:bg-red-700 disabled:bg-gray-600 py-4 rounded-xl font-bold transition-colors sticky bottom-4 shadow-lg">
                      {menuLoading ? 'Wird gespeichert...' : '💾 Rechtliche Texte in GitHub speichern'}
                    </button>
                  </div>
                ) : (
                  <p className="text-white/40">Daten konnten nicht geladen werden</p>
                )}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
