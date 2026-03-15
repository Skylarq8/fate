// 📁 store/cartStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  productId: string
  title: string
  price: number          // төлөх үнэ
  originalPrice?: number // үндсэн үнэ (хямдрал байвал)
  image: string
  size: string
  color: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  increaseQty: (id: string) => void
  decreaseQty: (id: string) => void
  clearCart: () => void
  totalCount: () => number
  totalPrice: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const key = `${item.productId}-${item.size}-${item.color}`
        set(state => {
          const existing = state.items.find(i => i.id === key)
          if (existing) {
            return {
              items: state.items.map(i =>
                i.id === key ? { ...i, quantity: i.quantity + item.quantity } : i
              )
            }
          }
          return { items: [...state.items, { ...item, id: key }] }
        })
      },

      removeItem: (id) =>
        set(state => ({ items: state.items.filter(i => i.id !== id) })),

      increaseQty: (id) =>
        set(state => ({
          items: state.items.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
        })),

      decreaseQty: (id) =>
        set(state => ({
          items: state.items
            .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
            .filter(i => i.quantity > 0)
        })),

      clearCart: () => set({ items: [] }),

      totalCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
)