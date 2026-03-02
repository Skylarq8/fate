import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/product";

export default function Home() {
  return (
    <div className="pt-20 mx-3 md:mx-8 lg:mx-16">
      <div className="flex mb-2 justify-between items-baseline-last">
        <h1 className="text-2xl font-heading">Best Seller</h1>
        <h1 className="font-body text-gray-300 text-sm">see all</h1>
      </div>
      <div className="grid grid-cols-2 gap-1 md:grid-cols-3 md:gap-2 lg:grid-cols-4 lg:gap-3">
        {products.map((product) => (
          <ProductCard key={product.id} title={product.title} image={product.image} price={product.price} id={0}/>
        ))}
      </div>
    </div>
  );
}
