// 📁 store/cartStore.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"


export interface CartItem {
  id: string
  productId: string
  title: string
  price: number
  originalPrice?: number
  image: string
  size: string
  color: string
  variants: {
    label: string
    value: string
  }[]
  quantity: number
}

export interface CouponState {
  code: string
  type: "percentage" | "amount"
  discountPercent?: number
  discountAmount?: number
}

interface CartStore {
  items: CartItem[]
  coupon: CouponState | null

  addItem:    (item: Omit<CartItem, "id">) => void
  removeItem: (id: string) => void
  increaseQty:(id: string) => void
  decreaseQty:(id: string) => void
  clearCart:  () => void
  setCoupon:  (coupon: CouponState | null) => void

  totalCount:    () => number
  totalPrice:    () => number
  subtotal:      () => number
  shippingFee:   () => number
  couponDiscount:() => number
  finalTotal:    () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items:  [],
      coupon: null,

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

      removeItem:  (id) => set(state => ({ items: state.items.filter(i => i.id !== id) })),

      increaseQty: (id) => set(state => ({
        items: state.items.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i)
      })),

      decreaseQty: (id) => set(state => ({
        items: state.items
          .map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
          .filter(i => i.quantity > 0)
      })),

      clearCart: () => set({ items: [], coupon: null }),

      setCoupon: (coupon) => set({ coupon }),

      totalCount: () => get().items.reduce((s, i) => s + i.quantity, 0),

      // барааны үндсэн нийт (хямдралгүй)
      totalPrice: () => get().items.reduce((s, i) => s + (i.originalPrice || i.price) * i.quantity, 0),

      // барааны хямдрал хасагдсан дүн
      subtotal: () => {
        const items = get().items
        const base     = items.reduce((s, i) => s + (i.originalPrice || i.price) * i.quantity, 0)
        const prodDisc = items.reduce((s, i) => i.originalPrice ? s + (i.originalPrice - i.price) * i.quantity : s, 0)
        return base - prodDisc
      },

      shippingFee: () => get().subtotal() >= 100000 ? 0 : 5000,

      couponDiscount: () => {
        const coupon   = get().coupon
        const subtotal = get().subtotal()
        if (!coupon) return 0
        if (coupon.type === "percentage" && coupon.discountPercent) {
          return Math.round(subtotal * (coupon.discountPercent / 100))
        }
        if (coupon.type === "amount" && coupon.discountAmount) {
          return Math.min(coupon.discountAmount, subtotal)
        }
        return 0
      },

      finalTotal: () => {
        return get().subtotal() + get().shippingFee() - get().couponDiscount()
      },
    }),
    { name: "cart-storage" }
  )
)