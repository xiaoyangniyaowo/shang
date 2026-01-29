import Navbar from '@/components/Navbar';
import Hero from '@/sections/Hero';
import About from '@/sections/About';
import Categories from '@/sections/Categories';
import { NewProducts, FeaturedProducts } from '@/sections/Products';
import Promo from '@/sections/Promo';
import Testimonials from '@/sections/Testimonials';
import Features from '@/sections/Features';
import Footer from '@/sections/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020202]">
      <Navbar />
      <main>
        <Hero />
        <About />
        <Categories />
        <NewProducts />
        <Promo />
        <FeaturedProducts />
        <Testimonials />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
