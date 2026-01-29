import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Minus, Plus, ArrowLeft, Check } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/sections/Footer';
import { productApi } from '@/services/api';
import { useApp } from '@/store/AppContext';
import type { Product } from '@/types';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await productApi.getProduct(id);
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts);
      } catch (error) {
        console.error('加载商品失败:', error);
        toast.error('商品不存在');
        navigate('/shop');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#f6b638] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">商品不存在</h1>
          <button onClick={() => navigate('/shop')} className="btn-primary">
            返回商城
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = async () => {
    try {
      await addToCart(product.id, quantity);
      toast.success(`已将 ${quantity} 件 ${product.name} 加入购物车`);
    } catch (error: any) {
      if (error.message === '请先登录') {
        toast.error('请先登录');
      } else {
        toast.error(error.message || '添加失败');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#020202]">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </button>

          {/* Product Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Image */}
            <div className="glass-card p-4">
              <div className="relative aspect-square rounded-xl overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {product.is_new && (
                  <span className="absolute top-4 left-4 px-3 py-1 bg-[#f6b638] text-black text-sm font-bold rounded-full">
                    新品
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(product.rating)
                            ? 'text-[#f6b638] fill-[#f6b638]'
                            : 'text-white/20'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white/60">
                    {product.rating} ({product.review_count} 条评价)
                  </span>
                </div>
              </div>

              <p className="text-white/70 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-[#f6b638]">
                  ¥{product.price.toLocaleString()}
                </span>
                {product.original_price && (
                  <span className="text-xl text-white/40 line-through">
                    ¥{product.original_price.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Stock */}
              <div className="flex items-center gap-2 text-white/60">
                <Check className="w-4 h-4 text-green-500" />
                <span>库存充足 ({product.stock} 件)</span>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-white/60">数量</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-white font-semibold">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  加入购物车
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                {[
                  '正品保证',
                  '7天退换',
                  '全国联保',
                  '极速发货',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#f6b638]" />
                    <span className="text-white/60 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-white mb-8">
                相关<span className="text-[#f6b638]">推荐</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProducts.map((p) => (
                  <div
                    key={p.id}
                    className="product-card group cursor-pointer"
                    onClick={() => navigate(`/product/${p.id}`)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold truncate group-hover:text-[#f6b638] transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-[#f6b638] font-bold mt-2">
                        ¥{p.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
