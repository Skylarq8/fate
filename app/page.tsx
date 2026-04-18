import Accordin from "@/components/Accordin";
import BrandMarquee from "@/components/BrandMarquee";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductSlider from "@/components/ProductSlider";
import { getProducts, getTrendingProducts, getProductsByGender } from "@/lib/api";

export const revalidate = 60

export default async function Home() {
  const [allProducts, trending, mens, womens] = await Promise.all([
    getProducts(),
    getTrendingProducts(50),
    getProductsByGender("хувцас-эрэгтэй"),
    getProductsByGender("хувцас-эмэгтэй"),
  ])

  const discount = allProducts.filter(
    (p) => p.discountEnabled && p.finalPrice
  )
  const newArrivals = allProducts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div>
      <HeroSlider/>
      <ProductSlider title="Хямдралтай бараанууд" products={discount}/>
      <ProductSlider title="Онцлох бараанууд" products={trending}/>
      <ProductSlider title="Эрэгтэй" products={mens}/>
      <ProductSlider title="Эмэгтэй" products={womens}/>
      <ProductSlider title="Шинэ бараанууд" products={newArrivals}/>
      <BrandMarquee/>
      <p className="font-body font-medium text-center text-sm lg:text-xl mt-10 lg:mt-15 text-white/90">Хүмүүсийн нийтлэг асуудаг асуултууд</p>
      <h1 className="font-heading font-semibold text-center text-2xl lg:text-3xl mt-3 text-white/90">FAQ</h1>
      <div className="flex justify-center mt-3">
        <Accordin/>
      </div>
      <Footer/>
    </div>
  );
}
