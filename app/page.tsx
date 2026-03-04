import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/product";

export default function Home() {
  return (
    <div>
      <div>
        <div className="flex mb-3 sm:mb-4 justify-between items-baseline-last">
          <h1 className="text-[20px] sm:text-2xl font-heading font-bold">Онцлох бүтээгдэхүүн</h1>
          <h1 className="font-body text-gray-300 text-[12px] sm:text-[13px] lg:text-[14px] border-b border-current inline-block">Бүгдийг харах</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} title={product.title} image={product.image} price={product.price} id={0}/>
          ))}
        </div>
      </div>
      <div>
        <div className="flex mt-7 mb-3 sm:mb-4 justify-between items-baseline-last">
          <h1 className="text-[20px] sm:text-2xl font-heading font-bold">Шинэ бүтээгдэхүүн</h1>
          <h1 className="font-body text-gray-300 text-[12px] sm:text-[13px] lg:text-[14px] border-b border-current inline-block">Бүгдийг харах</h1>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} title={product.title} image={product.image} price={product.price} id={0}/>
          ))}
        </div>
      </div>
    </div>
  );
}
