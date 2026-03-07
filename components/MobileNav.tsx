"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Home, Package, ShoppingCart, User } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";

export default function MobileNav() {
  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { wishlist } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY) {
        setShow(false); // доош scroll → нуух
      } else {
        setShow(true); // дээш scroll → харуулах
      }
      setLastScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background/70 border-t transition-transform duration-300 lg:hidden
      ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="flex justify-around items-center h-15">
        <Link href="/" className="flex flex-col items-center text-xs">
          <Home size={20} />
          Нүүр
        </Link>
        <Link href="/products" className="flex flex-col items-center text-xs">
          <Package size={20} />
          Бүх бараа
        </Link>
        <Link href="/wishlist" className="flex flex-col items-center text-xs relative">
        {/* {wishlist.length > 0 && (
          <span className="absolute -top-3 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {wishlist.length}
             </span>
         )} */}
          <Heart size={20} />
          Таалагдсан
        </Link>
        <Link href="/cart" className="flex flex-col items-center text-xs">
          <ShoppingCart size={20} />
          Сагс
        </Link>
      </div>
    </nav>
  );
}