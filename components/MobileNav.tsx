"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Package, ShoppingCart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCartStore } from "@/store/cartStore";

export default function MobileNav() {
  const [show, setShow] = useState(true);
  const pathname = usePathname();
  const { wishlist } = useWishlist();
  const { items } = useCartStore();

  const isProductDetail = /^\/products\/.+/.test(pathname);

  // Барааны дэлгэрэнгүй хуудасны өмнөх top-level хуудсыг хадгална
  const lastTopLevel = useRef(isProductDetail ? "/" : pathname);
  useEffect(() => {
    if (!isProductDetail) {
      lastTopLevel.current = pathname;
    }
  }, [pathname, isProductDetail]);

  const isActive = (href: string) => {
    const activePath = isProductDetail ? lastTopLevel.current : pathname;
    return href === "/" ? activePath === "/" : activePath.startsWith(href);
  };

  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      // iOS overscroll rubber-band дүнд scrollY < 0 байж болно → 0-д хавчуулна
      const current = Math.max(0, window.scrollY);
      const diff = current - lastScrollY.current;

      if (Math.abs(diff) < 5) return; // жижиг хөдөлгөөн тооцохгүй

      if (current <= 0) {
        setShow(true);          // хамгийн дээд хэсэгт → үргэлж харагдана
      } else if (diff > 0) {
        setShow(false);         // доошоо scroll → нуух
      } else {
        setShow(true);          // дээшээ scroll → харуулах
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-t transition-transform duration-300 lg:hidden
      ${show ? "translate-y-0" : "translate-y-full"}`}
    >
      <div className="flex justify-around items-center h-16">
        <Link href="/" className={`flex flex-col items-center text-xs gap-0.5 transition-colors outline-none focus:outline-none ${isActive("/") ? "text-rose-500" : "text-white/90"}`}>
          <Home size={20} />
          Нүүр
        </Link>
        <Link href="/products" className={`flex flex-col items-center text-xs gap-0.5 transition-colors outline-none focus:outline-none ${isActive("/products") ? "text-rose-500" : "text-white/90"}`}>
          <Package size={20} />
          Бүх бараа
        </Link>
        <Link href="/wishlist" className={`flex flex-col items-center text-xs gap-0.5 transition-colors outline-none focus:outline-none ${isActive("/wishlist") ? "text-rose-500" : "text-white/90"}`}>
          <span className="relative">
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {wishlist.length}
              </span>
            )}
          </span>
          Таалагдсан
        </Link>
        <Link href="/cart" className={`flex flex-col items-center text-xs gap-0.5 transition-colors outline-none focus:outline-none ${isActive("/cart") ? "text-rose-500" : "text-white/90"}`}>
          <span className="relative">
            <ShoppingCart size={20} />
            {items.length > 0 && (
              <span className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                {items.length}
              </span>
            )}
          </span>
          Сагс
        </Link>
      </div>
    </nav>
  );
}