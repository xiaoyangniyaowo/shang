import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { getNewProducts, getFeaturedProducts } from '@/data/products';
import { useApp } from '@/store/AppContext';
import type { Product } from '@/types';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index: number;
  isVisible: boolean;
}

function ProductCard({ product, index, isVisible }: ProductCardProps) {
  const { addToCart } = useApp();
  const [isHovered, setIsHovered] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} 已加入购物车`);
    } catch (error: any) {
      if (error.message === '请先登录') {
        toast.error('请先登录');
      } else {
        toast.error(error.message || '添加失败');
      }
    }
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`product-card group block transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
      }`}
      style={{ transitionDelay: `${index * 100 + 200}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_new && (
            <span className="px-3 py-1 bg-[#f6b638] text-black text-xs font-bold rounded-full">
              新品
            </span>
          )}
          {product.original_price && (
            <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
              特惠
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div
          className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all duration-300 ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#f6b638] text-black text-sm font-semibold rounded-xl hover:bg-[#ffd77d] transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            加入购物车
          </button>
          <button className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold truncate group-hover:text-[#f6b638] transition-colors">
          {product.name}
        </h3>
        <p className="text-white/50 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-[#f6b638] fill-[#f6b638]" />
            <span className="text-white/80 text-sm">{product.rating}</span>
          </div>
          <span className="text-white/40 text-sm">({product.review_count})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xl font-bold text-[#f6b638]">
            ¥{product.price.toLocaleString()}
          </span>
          {product.original_price && (
            <span className="text-white/40 line-through text-sm">
              ¥{product.original_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

interface ProductsSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  showViewAll?: boolean;
}

function ProductsSection({ title, subtitle, products, showViewAll = true }: ProductsSectionProps) {
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
      { threshold: 0.1 }
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
          className={`flex items-end justify-between mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div>
            {subtitle && (
              <span className="text-[#f6b638] text-sm font-semibold tracking-wider uppercase">
                {subtitle}
              </span>
            )}
            <h2 className="section-title mt-2">{title}</h2>
          </div>
          {showViewAll && (
            <Link
              to="/shop"
              className="hidden sm:flex items-center gap-2 text-[#f6b638] font-semibold hover:text-[#ffd77d] transition-colors"
            >
              查看全部
              <span className="text-xl">→</span>
            </Link>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              index={index}
              isVisible={isVisible}
            />
          ))}
        </div>

        {/* Mobile View All Button */}
        {showViewAll && (
          <div className="mt-8 text-center sm:hidden">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 rounded-xl text-white font-semibold"
            >
              查看全部
              <span>→</span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export function NewProducts() {
  const products = getNewProducts();
  return (
    <ProductsSection
      title="最新上架"
      subtitle="本季新品"
      products={products}
    />
  );
}

export function FeaturedProducts() {
  const products = getFeaturedProducts();
  return (
    <ProductsSection
      title="热门精选"
      subtitle="顾客最爱"
      products={products}
    />
  );
}
