import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useApp } from '@/store/AppContext';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state, logout } = useApp();
  const { user, isAuthenticated, cartCount } = state;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: '首页', path: '/' },
    { name: '商城', path: '/shop' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/95 backdrop-blur-xl border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
          >
            <span className="text-2xl font-bold text-white">
              优品<span className="text-[#f6b638]">商城</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`nav-link text-sm font-medium ${
                  isActive(link.path) ? 'text-[#f6b638] after:w-full' : ''
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-white/80 hover:text-white transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#f6b638] text-black text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-2 p-2 rounded-xl hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f6b638] to-[#e3a222] flex items-center justify-center">
                    <User className="w-4 h-4 text-black" />
                  </div>
                  <span className="hidden sm:block text-sm text-white/80">
                    {user?.name}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-dark border-white/10">
                  {user?.role === 'admin' && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => navigate('/admin')}
                        className="text-white hover:bg-white/10 cursor-pointer"
                      >
                        后台管理
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-white/10 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="text-sm">登录</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger className="md:hidden p-2 text-white">
                <Menu className="w-6 h-6" />
              </SheetTrigger>
              <SheetContent 
                side="right" 
                className="w-80 bg-[#0c0c0c] border-l border-white/10 p-0"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <span className="text-xl font-bold text-white">
                      优品<span className="text-[#f6b638]">商城</span>
                    </span>
                  </div>
                  <div className="flex-1 py-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-4 py-3 text-lg font-medium transition-colors ${
                          isActive(link.path)
                            ? 'text-[#f6b638] bg-white/5'
                            : 'text-white/80 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                  {!isAuthenticated && (
                    <div className="p-4 border-t border-white/10 space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-3 text-center bg-white/10 rounded-xl text-white hover:bg-white/20 transition-colors"
                      >
                        登录
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block w-full py-3 text-center bg-[#f6b638] rounded-xl text-black font-semibold hover:bg-[#ffd77d] transition-colors"
                      >
                        注册
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
