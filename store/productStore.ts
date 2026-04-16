// import { create } from "zustand"
// import { Product } from "@/lib/api"

// interface ProductState {
//   selectedProduct: Product | null
//   setSelectedProduct: (product: Product) => void
//   clearProduct: () => void
// }

// export const useProductStore = create<ProductState>((set) => ({
//   selectedProduct: null,
//   setSelectedProduct: (product) => set({ selectedProduct: product }),
//   clearProduct: () => set({ selectedProduct: null }),
// }))

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { Product } from "@/lib/api"

interface ProductState {
  selectedProduct: Product | null
  setSelectedProduct: (p: Product) => void
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      selectedProduct: null,
      setSelectedProduct: (p) => set({ selectedProduct: p }),
    }),
    {
      name: "product-storage", // localStorage key
    }
  )
)