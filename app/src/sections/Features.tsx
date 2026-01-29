import { useEffect, useRef, useState } from 'react';
import { Truck, Headphones, Shield, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: '免费配送',
    description: '所有订单满299元免费配送',
  },
  {
    icon: Headphones,
    title: '24/7支持',
    description: '全天候客户服务支持',
  },
  {
    icon: Shield,
    title: '安全支付',
    description: '100%安全支付交易',
  },
  {
    icon: RotateCcw,
    title: '轻松退货',
    description: '30天无理由退货',
  },
];

export default function Features() {
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

  return (
    <section ref={sectionRef} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-16 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <span className="text-[#f6b638] text-sm font-semibold tracking-wider uppercase">
            我们的优势
          </span>
          <h2 className="section-title mt-4">
            为什么选择<span className="text-[#f6b638]">我们</span>
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`glass-card p-8 text-center group hover:bg-white/10 transition-all duration-700 ${
                  isVisible
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-16'
                }`}
                style={{ transitionDelay: `${index * 100 + 200}ms` }}
              >
                {/* Icon */}
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#f6b638]/20 to-[#f6b638]/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-[#f6b638]" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
