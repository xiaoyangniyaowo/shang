import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current || !contentRef.current) return;
      const scrollY = window.scrollY;
      const heroHeight = heroRef.current.offsetHeight;
      const progress = Math.min(scrollY / heroHeight, 1);
      
      contentRef.current.style.transform = `translateY(${scrollY * 0.3}px)`;
      contentRef.current.style.opacity = `${1 - progress * 0.8}`;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image with Parallax */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Hero Background"
          className="w-full h-full object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020202] via-transparent to-transparent" />
      </div>

      {/* Animated Glow Effect */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#f6b638]/20 rounded-full blur-[150px] animate-pulse-glow pointer-events-none" />

      {/* Content */}
      <div
        ref={contentRef}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                发现<span className="text-[#f6b638]">完美</span>
                <br />
                之选
              </h1>
              <p className="text-lg md:text-xl text-white/70 max-w-lg">
                探索精选优质产品系列，提升您的生活方式。从尖端科技到时尚配饰，找到您所追寻的一切。
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop"
                className="btn-primary flex items-center space-x-2 group"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>立即购买</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/shop"
                className="btn-secondary"
              >
                探索系列
              </Link>
            </div>

            {/* Stats */}
            <div className="flex space-x-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-[#f6b638]">10K+</div>
                <div className="text-sm text-white/60">优质商品</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#f6b638]">50K+</div>
                <div className="text-sm text-white/60">满意客户</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#f6b638]">99%</div>
                <div className="text-sm text-white/60">好评率</div>
              </div>
            </div>
          </div>

          {/* Right Content - Featured Product Card */}
          <div className="hidden lg:flex justify-center">
            <div className="relative group perspective-1000">
              <div className="relative w-80 h-96 glass-card p-6 preserve-3d transition-transform duration-500 group-hover:rotate-y-6 group-hover:rotate-x-6">
                <div className="absolute -inset-4 bg-[#f6b638]/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <img
                  src="/hero-product.jpg"
                  alt="Featured Product"
                  className="w-full h-48 object-cover rounded-xl mb-4"
                />
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-white">无线降噪耳机</h3>
                  <p className="text-white/60 text-sm">沉浸式音质体验</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#f6b638]">¥1,299</span>
                    <Link
                      to="/shop"
                      className="px-4 py-2 bg-[#f6b638] text-black text-sm font-semibold rounded-lg hover:bg-[#ffd77d] transition-colors"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              </div>
              {/* Floating animation */}
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-[#f6b638]/30 rounded-full blur-xl animate-float" />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}
