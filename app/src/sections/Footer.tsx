import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone, Send, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

const footerLinks = {
  about: [
    { name: '我们的故事', href: '/about' },
    { name: '团队介绍', href: '/about' },
    { name: '招贤纳士', href: '/about' },
  ],
  service: [
    { name: '联系我们', href: '/contact' },
    { name: '配送信息', href: '/shipping' },
    { name: '退换货政策', href: '/returns' },
  ],
  quickLinks: [
    { name: '商城', href: '/shop' },
    { name: '分类', href: '/shop' },
    { name: '特惠', href: '/shop' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('订阅成功！感谢您的关注。');
      setEmail('');
    }
  };

  return (
    <footer className="relative">
      {/* Newsletter Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#f6b638] via-[#e3a222] to-[#c28a1a]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-black mb-2">
                订阅独家优惠
              </h3>
              <p className="text-black/70">
                获取最新产品更新和折扣信息
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="输入您的邮箱"
                  className="w-full pl-12 pr-4 py-4 bg-black/10 rounded-xl text-black placeholder:text-black/40 focus:outline-none focus:ring-2 focus:ring-black/20"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-4 bg-black text-white font-semibold rounded-xl hover:bg-black/80 transition-colors flex items-center gap-2"
              >
                订阅
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="bg-[#0c0c0c] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link to="/" className="inline-block mb-6">
                <span className="text-2xl font-bold text-white">
                  优品<span className="text-[#f6b638]">商城</span>
                </span>
              </Link>
              <p className="text-white/60 text-sm mb-6">
                致力于为您提供最优质的购物体验，精选全球好物。
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin className="w-4 h-4 text-[#f6b638]" />
                  <span>北京市朝阳区建国路88号</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Phone className="w-4 h-4 text-[#f6b638]" />
                  <span>400-888-8888</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <Mail className="w-4 h-4 text-[#f6b638]" />
                  <span>support@youpin.com</span>
                </div>
              </div>
            </div>

            {/* About Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">关于我们</h4>
              <ul className="space-y-3">
                {footerLinks.about.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/60 text-sm hover:text-[#f6b638] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Service Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">客户服务</h4>
              <ul className="space-y-3">
                {footerLinks.service.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/60 text-sm hover:text-[#f6b638] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">快速链接</h4>
              <ul className="space-y-3">
                {footerLinks.quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-white/60 text-sm hover:text-[#f6b638] transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/40 text-sm">
                © 2024 优品商城。保留所有权利。
              </p>
              <div className="flex items-center gap-4">
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#f6b638] hover:text-black transition-all">
                  <MessageCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
