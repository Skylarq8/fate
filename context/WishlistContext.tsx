// WishlistContext.tsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { ProductItem } from "@/lib/product";

interface WishlistContextType {
  wishlist: ProductItem[];
  toggleWishlist: (product: ProductItem) => void;
  isInWishlist: (id: number) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: React.ReactNode }) => {
  const [wishlist, setWishlist] = useState<ProductItem[]>([]);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("wishlist");
    if (stored) setWishlist(JSON.parse(stored));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const toggleWishlist = (product: ProductItem) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      return [...prev, product];
    });
  };

  const isInWishlist = (id: number) => wishlist.some((p) => p.id === id);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
};