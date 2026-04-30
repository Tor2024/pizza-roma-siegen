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
    if (tab === 'menu') {
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
  const updateTopping = (categoryKey: string, itemIndex: number, toppingIndex: number, field: 'de' | 'ru' | 'price', value: any) => {
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
  const updateCategoryName = (catKey: string, lang: 'de' | 'ru', value: string) => {
    const newMenuData = { ...menuData };
    newMenuData.categories[catKey].name[lang] = value;
    setMenuData(newMenuData);
  };

  return (
    <div className="min-h-screen bg-roma-dark text-white pt-0">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-roma-red text-2xl">♛</span>
            <h1 className="text-xl font-poppins font-bold">Pizza Roma Admin</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchOrders}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
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
        <div className="flex gap-2 border-b border-white/10">
          <button 
            onClick={() => setTab('orders')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'orders' ? 'bg-roma-red text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Bestellungen ({orders.length})
          </button>
          <button 
            onClick={() => setTab('menu')} 
            className={`px-6 py-3 rounded-t-lg font-semibold transition-colors ${
              tab === 'menu' ? 'bg-roma-red text-white' : 'text-white/50 hover:text-white'
            }`}
          >
            Menü & Einstellungen
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
                  <p className="text-xl">Noch keine Bestellungen...</p>
                  <p className="text-sm mt-2">Neue Bestellungen erscheinen hier automatisch</p>
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
                      {/* Order information */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold">{order.customer.name}</h3>
                            <p className="text-white/60 text-sm">#{order.id.slice(-8)} • {formatTime(order.createdAt)}</p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${cfg.color} text-white text-sm font-semibold`}>
                            <StatusIcon size={14} />
                            {cfg.label}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <p className="text-white/80">📞 {order.customer.phone}</p>
                          <p className="text-white/60 text-sm">📍 {order.customer.address}</p>
                        </div>

                        <div className="bg-black/20 rounded-xl p-4">
                          <p className="text-sm text-white/60 mb-2">Bestellinhalt:</p>
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm py-1">
                              <span>{item.quantity}x {item.name.de} {item.size && `(${item.size}cm)`}</span>
                              <span className="text-white/60">{(item.price * item.quantity).toFixed(2)} €</span>
                            </div>
                          ))}
                          {order.promoCode && (
                            <div className="flex justify-between text-sm py-1 text-green-400">
                              <span>Gutschein {order.promoCode}</span>
                              <span>-{order.promoDiscount?.toFixed(2)} €</span>
                            </div>
                          )}
                          <div className="border-t border-white/10 mt-2 pt-2 flex justify-between font-bold">
                            <span>Gesamt:</span>
                            <span className="text-roma-gold">{order.total.toFixed(2)} €</span>
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
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
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
                                onChange={(e) => updateCategoryName(catKey, 'de', e.target.value)}
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
                                  {/* Name */}
                                  <div>
                                    <label className="text-xs text-white/50">Name</label>
                                    <input type="text" value={item.name?.de || ''} onChange={(e) => updateItem(catKey, idx, 'name.de', e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" />
                                  </div>
                                  {/* Image */}
                                  <div>
                                    <label className="text-xs text-white/50">Bild</label>
                                    <input type="text" value={item.image || ''} onChange={(e) => updateItem(catKey, idx, 'image', e.target.value)} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" placeholder="/images/pizza.webp" />
                                  </div>
                                  {/* Single Price (for non-pizza items) */}
                                  {item.price && !item.prices && (
                                    <div>
                                      <label className="text-xs text-white/50">Preis (€)</label>
                                      <input type="number" step="0.01" value={item.price || 0} onChange={(e) => updateItem(catKey, idx, 'price', parseFloat(e.target.value))} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" />
                                    </div>
                                  )}
                                </div>

                                {/* Pizza Sizes with Prices */}
                                {item.prices && (
                                  <div className="grid grid-cols-3 gap-4 mb-3">
                                    <div>
                                      <label className="text-xs text-white/50">26 cm (€)</label>
                                      <input type="number" step="0.01" value={item.prices?.['26'] || 0} onChange={(e) => updateItem(catKey, idx, 'prices.26', parseFloat(e.target.value))} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-white/50">32 cm (€)</label>
                                      <input type="number" step="0.01" value={item.prices?.['32'] || 0} onChange={(e) => updateItem(catKey, idx, 'prices.32', parseFloat(e.target.value))} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" />
                                    </div>
                                    <div>
                                      <label className="text-xs text-white/50">40 cm (€)</label>
                                      <input type="number" step="0.01" value={item.prices?.['40'] || 0} onChange={(e) => updateItem(catKey, idx, 'prices.40', parseFloat(e.target.value))} className="w-full bg-white/10 rounded px-2 py-1 mt-1 text-sm text-white" />
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
