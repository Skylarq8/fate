import Accordin from "@/components/Accordin";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductSlider from "@/components/ProductSlider";


async function getProducts(filter: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products?filter=${filter}`, {
    next: { revalidate: 60 }, // 60 секунд cache
  })
  return res.json()
}

export default async function Home() {
  const [discount, newArrivals, all] = await Promise.all([
    getProducts('discount'),
    getProducts('newest'),
    getProducts('oldest'),
  ])
  console.log(discount.data[0].id)
  return (
    <div>
      <HeroSlider/>
      <ProductSlider title="Хямдралтай бараанууд" products={discount.data}/>
      <ProductSlider title="Шинэ бараанууд" products={newArrivals.data}/>
      <ProductSlider title="Бүх бараанууд" products={all.data}/>
      {/* <ProductSlider title="Бүх бараа"         filter="all"      /> */}
      <p className="font-body font-medium text-center text-sm lg:text-xl mt-10 lg:mt-15 text-white/90">Хүмүүсийн нийтлэг асуудаг асуултууд</p>
      <h1 className="font-heading font-semibold text-center text-2xl lg:text-3xl mt-3 text-white/90">FAQ</h1>
      <div className="flex justify-center mt-3">
        <Accordin/>
      </div>
      <Footer/>
    </div>
  );
}
