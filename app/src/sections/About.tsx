import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const features = [
    '严选品质保证',
    '极速物流配送',
    '7天无理由退换',
    '专属客服服务',
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-24 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-0 items-center">
          {/* Image */}
          <div
            className={`relative transition-all duration-1000 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 -translate-x-20'
            }`}
          >
            <div className="relative rounded-2xl overflow-hidden lg:-mr-20">
              <img
                src="/about-us.jpg"
                alt="About Us"
                className="w-full h-[400px] lg:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#020202]/50" />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 border-2 border-[#f6b638]/30 rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div
            className={`relative lg:pl-20 transition-all duration-1000 delay-300 ${
              isVisible
                ? 'opacity-100 translate-x-0'
                : 'opacity-0 translate-x-20'
            }`}
          >
            <div className="glass-card p-8 lg:p-12">
              <span className="text-[#f6b638] text-sm font-semibold tracking-wider uppercase">
                关于我们
              </span>
              <h2 className="section-title mt-4 mb-6">
                我们重新定义
                <br />
                <span className="text-[#f6b638]">线上购物体验</span>
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                我们致力于以具有竞争力的价格提供优质产品。我们精心策划的系列确保您收到的每件商品都符合我们严格的质量和风格标准。
              </p>

              {/* Features List */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#f6b638]/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-[#f6b638]" />
                    </div>
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/about"
                className="inline-flex items-center space-x-2 text-[#f6b638] font-semibold hover:text-[#ffd77d] transition-colors group"
              >
                <span>了解更多</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
