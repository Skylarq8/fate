import Accordin from "@/components/Accordin";
import BrandMarquee from "@/components/BrandMarquee";
import MusicCards from "@/components/MusicCards";
import Footer from "@/components/Footer";
import { FooterPromoBar } from "@/components/PromoPopup";
import HeroSlider from "@/components/HeroSlider";
import ProductSlider from "@/components/ProductSlider";
import { getProducts, getTrendingProducts, getProductsByGender } from "@/lib/api";

export const revalidate = 60

export default async function Home() {
  const [discount, newArrivals, trending, mens, womens, accessories] = await Promise.all([
    getProducts({ filter: "discount", limit: 30 }),
    getProducts({ filter: "newest", limit: 30 }),
    getTrendingProducts(50),
    getProductsByGender("хувцас-эрэгтэй"),
    getProductsByGender("хувцас-эмэгтэй"),
    getProductsByGender("accessories"),
  ])

  const discountIds = new Set(discount.map((p) => p.id))

  return (
    <div>
      <HeroSlider/>
      <ProductSlider title="Хямдралтай бараанууд" products={discount}/>
      <ProductSlider title="Онцлох бараанууд" products={trending.filter((p) => !discountIds.has(p.id))}/>
      <ProductSlider title="Эрэгтэй" products={mens.filter((p) => !discountIds.has(p.id))}/>
      <ProductSlider title="Эмэгтэй" products={womens.filter((p) => !discountIds.has(p.id))}/>
      <ProductSlider title="Accessories" products={accessories.filter((p) => !discountIds.has(p.id))}/>
      <ProductSlider title="Шинэ бараанууд" products={newArrivals.filter((p) => !discountIds.has(p.id))}/>
      <MusicCards/>
      <BrandMarquee/>
      <FooterPromoBar />
      <p className="font-body font-medium text-center text-sm lg:text-xl mt-6 lg:mt-8 text-white/90">Хүмүүсийн нийтлэг асуудаг асуултууд</p>
      <h1 className="font-heading font-semibold text-center text-2xl lg:text-3xl mt-3 text-white/90">FAQ</h1>
      <div className="flex justify-center mt-3">
        <Accordin/>
      </div>
      <Footer/>
    </div>
  );
}
