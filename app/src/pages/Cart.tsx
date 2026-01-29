import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/sections/Footer';
import { useApp } from '@/store/AppContext';
import { orderApi } from '@/services/api';
import { toast } from 'sonner';

export default function Cart() {
  const navigate = useNavigate();
  const { state, removeFromCart, updateCartQuantity, refreshCart } = useApp();
  const { cart, cartTotal, cartCount, isAuthenticated } = state;
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('请先登录');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('购物车为空');
      return;
    }

    setIsCheckingOut(true);

    try {
      // 使用默认地址创建订单
      await orderApi.createOrder({
        shipping_address: {
          name: state.user?.name || '用户',
          phone: '13800138000',
          address: '北京市朝阳区建国路88号',
          city: '北京',
          province: '北京',
          zip_code: '100000',
        },
      });

      toast.success('订单提交成功！');
      refreshCart();
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || '订单提交失败');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#020202]">
        <Navbar />
        <div className="pt-32 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <ShoppingBag className="w-12 h-12 text-white/40" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                购物车是空的
              </h1>
              <p className="text-white/60 mb-8">
                快去选购心仪的商品吧
              </p>
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
                去购物
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202]">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white mb-8">
            购物<span className="text-[#f6b638]">车</span>
            <span className="text-lg font-normal text-white/60 ml-2">
              ({cartCount} 件商品)
            </span>
          </h1>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-4 flex gap-4 group"
                >
                  {/* Image */}
                  <Link
                    to={`/product/${item.product_id}`}
                    className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.product_id}`}>
                      <h3 className="text-white font-semibold truncate group-hover:text-[#f6b638] transition-colors">
                        {item.name}
                      </h3>
                    </Link>
                    <p className="text-white/50 text-sm mt-1">
                      ¥{item.price.toLocaleString()}
                    </p>

                    <div className="flex items-center justify-between mt-4">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price & Remove */}
                      <div className="flex items-center gap-4">
                        <span className="text-[#f6b638] font-bold">
                          ¥{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-white/40 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">
                  订单摘要
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-white/60">
                    <span>商品小计</span>
                    <span>¥{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-white/60">
                    <span>运费</span>
                    <span className="text-green-500">免费</span>
                  </div>
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex justify-between text-white font-bold text-lg">
                      <span>总计</span>
                      <span className="text-[#f6b638]">
                        ¥{cartTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckingOut ? (
                    <>
                      <Package className="w-5 h-5 animate-spin" />
                      处理中...
                    </>
                  ) : (
                    <>
                      结算
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <Link
                  to="/shop"
                  className="w-full mt-4 btn-secondary text-center block"
                >
                  继续购物
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
