import Accordin from "@/components/Accordin";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ProductSlider from "@/components/ProductSlider";

export default function Home() {
  return (
    <div>
      <HeroSlider/>
      <ProductSlider title="Хямдралтай бараанууд" filter="featured" />
      <ProductSlider title="Шинэ бараанууд"   filter="newest"   />
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
