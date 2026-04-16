import Accordin from "@/components/Accordin";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductSlider from "@/components/ProductSlider";
import { getProducts } from "@/lib/api";

export default async function Home() {
  const [discount, newArrivals, all] = await Promise.all([
    getProducts({ filter: "discount" }),
    getProducts({ filter: "newest" }),
    getProducts({ filter: "oldest" }),
  ])

  return (
    <div>
      <HeroSlider/>
      <ProductSlider title="Хямдралтай бараанууд" products={discount}/>
      <ProductSlider title="Шинэ бараанууд" products={newArrivals}/>
      <ProductSlider title="Бүх бараанууд" products={all}/>
      <p className="font-body font-medium text-center text-sm lg:text-xl mt-10 lg:mt-15 text-white/90">Хүмүүсийн нийтлэг асуудаг асуултууд</p>
      <h1 className="font-heading font-semibold text-center text-2xl lg:text-3xl mt-3 text-white/90">FAQ</h1>
      <div className="flex justify-center mt-3">
        <Accordin/>
      </div>
      <Footer/>
    </div>
  );
}
