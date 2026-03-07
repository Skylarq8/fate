"use client";

import { useWishlist } from "@/context/WishlistContext";
import ProductCard from "@/components/ProductCard";
import { HeartOff } from "lucide-react";

export default function WishlistPage() {
  const { wishlist } = useWishlist();

  const isEmpty = wishlist.length === 0;

  return (
    <div className="max-w-7xl mx-auto mt-3">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold">
          Таалагдсан бараа
        </h1>

        {!isEmpty && (
          <p className="text-muted-foreground mt-2">
            Нийт {wishlist.length} бараа
          </p>
        )}
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-center min-h-[70vh]">
          <HeartOff className="w-12 h-12 text-muted-foreground mb-4" />

          <p className="text-lg font-medium">
            Хоосон байна
          </p>

          <p className="text-sm text-muted-foreground mt-1">
            Таалагдсан бараа хараахан алга
          </p>
        </div>
      ) : (
        /* Products */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {wishlist.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} {...product} />
          ))}
        </div>
      )}
    </div>
  );
}