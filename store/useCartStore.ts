import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Topping } from '@/types';

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  toggleCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string, toppingsStr: string) => void;
  updateQuantity: (id: string, size: string, toppingsStr: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  deliveryFee: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      addItem: (item) => set((state) => {
        const toppingsStr = item.toppings.map(t => t.id).join(',');
        const existing = state.items.find(i => i.id === item.id && i.size === item.size && i.toppings.map(t=>t.id).join(',') === toppingsStr);
        if (existing) {
          return {
            items: state.items.map(i => i === existing ? { ...i, quantity: i.quantity + 1 } : i)
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      removeItem: (id, size, toppingsStr) => set((state) => ({
        items: state.items.filter(i => !(i.id === id && i.size === size && i.toppings.map(t=>t.id).join(',') === toppingsStr))
      })),
      updateQuantity: (id, size, toppingsStr, quantity) => set((state) => ({
        items: state.items.map(i => (i.id === id && i.size === size && i.toppings.map(t=>t.id).join(',') === toppingsStr) ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ items: [] }),
      subtotal: () => get().items.reduce((acc, item) => acc + (item.price + item.toppings.reduce((a, t) => a + t.price, 0)) * item.quantity, 0),
      deliveryFee: () => {
        const sub = get().subtotal();
        if (sub === 0) return 0;
        return sub >= 25 ? 0 : 3.50;
      },
      total: () => get().subtotal() + get().deliveryFee(),
    }),
    {
      name: 'pizza-roma-cart',
      partialize: (state) => ({ items: state.items }), // сохраняем только items, не isOpen
    }
  )
);
