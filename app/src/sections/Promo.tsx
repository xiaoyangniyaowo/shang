import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';

export default function Promo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

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

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={sectionRef} className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`relative overflow-hidden rounded-3xl transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
          }`}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#f6b638] via-[#e3a222] to-[#c28a1a]" />
          <div className="absolute inset-0 bg-[url('/promo.jpg')] bg-cover bg-center opacity-20 mix-blend-overlay" />
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

          {/* Content */}
          <div className="relative z-10 grid lg:grid-cols-2 gap-8 p-8 md:p-16">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">限时特惠</span>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold text-black">
                全场最高
                <br />
                立减<span className="text-white">50%</span>
              </h2>
              
              <p className="text-black/70 text-lg max-w-md">
                抢购顶级产品限时折扣。优惠即将结束——立即选购，不要错过！
              </p>

              {/* Countdown */}
              <div className="flex gap-4">
                {[
                  { value: timeLeft.hours, label: '小时' },
                  { value: timeLeft.minutes, label: '分钟' },
                  { value: timeLeft.seconds, label: '秒' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="w-20 h-20 bg-black/20 rounded-2xl flex flex-col items-center justify-center"
                  >
                    <span className="text-3xl font-bold text-white">
                      {String(item.value).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-black/60">{item.label}</span>
                  </div>
                ))}
              </div>

              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-black/80 transition-colors group"
              >
                立即抢购
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Right Content - Image */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <img
                  src="/hero-product.jpg"
                  alt="Promo Product"
                  className="w-80 h-80 object-cover rounded-3xl shadow-2xl rotate-6 hover:rotate-0 transition-transform duration-500"
                />
                <div className="absolute -bottom-4 -right-4 px-6 py-3 bg-black text-white font-bold rounded-xl">
                  限时 5折
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
