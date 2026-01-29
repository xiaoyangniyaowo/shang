import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Plus,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '@/store/AppContext';
import { adminApi } from '@/services/api';
import type { User, Order } from '@/types';
import { toast } from 'sonner';

type TabType = 'dashboard' | 'products' | 'orders' | 'users' | 'analytics' | 'settings';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
}

export default function Admin() {
  const navigate = useNavigate();
  const { state, logout } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = state;

  // 检查权限
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // 加载仪表盘数据
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboard();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  const loadDashboard = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getDashboard();
      setStats(data.stats);
      setRecentOrders(data.recentOrders);
    } catch (error: any) {
      toast.error(error.message || '加载数据失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getUsers({ search: searchQuery });
      setUsers(data.users);
    } catch (error: any) {
      toast.error(error.message || '加载用户失败');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllOrders();
      setAllOrders(data.orders);
    } catch (error: any) {
      toast.error(error.message || '加载订单失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      toast.success('订单状态已更新');
      loadOrders();
    } catch (error: any) {
      toast.error(error.message || '更新失败');
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: '仪表盘', icon: LayoutDashboard },
    { id: 'products', label: '商品管理', icon: Package },
    { id: 'orders', label: '订单管理', icon: ShoppingCart },
    { id: 'users', label: '用户管理', icon: Users },
    { id: 'analytics', label: '数据分析', icon: BarChart3 },
    { id: 'settings', label: '系统设置', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#f6b638] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: '总用户数', value: stats?.totalUsers || 0, icon: Users },
                    { label: '总商品数', value: stats?.totalProducts || 0, icon: Package },
                    { label: '总订单数', value: stats?.totalOrders || 0, icon: ShoppingCart },
                    { label: '总营收', value: `¥${(stats?.totalRevenue || 0).toLocaleString()}`, icon: BarChart3 },
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="glass-card p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white/60 text-sm">{stat.label}</p>
                            <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-[#f6b638]/20 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[#f6b638]" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Orders */}
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">最近订单</h3>
                  {recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {recentOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 bg-white/5 rounded-xl"
                        >
                          <div>
                            <p className="text-white font-medium">{order.order_no || order.id}</p>
                            <p className="text-white/50 text-sm">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[#f6b638] font-bold">
                              ¥{order.total_amount?.toLocaleString()}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                order.status === 'delivered'
                                  ? 'bg-green-500/20 text-green-500'
                                  : order.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-500'
                                  : 'bg-blue-500/20 text-blue-500'
                              }`}
                            >
                              {order.status === 'pending' && '待处理'}
                              {order.status === 'paid' && '已付款'}
                              {order.status === 'shipped' && '已发货'}
                              {order.status === 'delivered' && '已送达'}
                              {order.status === 'cancelled' && '已取消'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/50 text-center py-8">暂无订单</p>
                  )}
                </div>
              </>
            )}
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索商品..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#f6b638]/50"
                />
              </div>
              <button
                onClick={() => toast.info('功能开发中')}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                添加商品
              </button>
            </div>

            <div className="glass-card p-8 text-center">
              <p className="text-white/50">商品管理功能开发中...</p>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">订单管理</h3>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-[#f6b638] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : allOrders.length > 0 ? (
              <div className="space-y-3">
                {allOrders.map((order) => (
                  <div key={order.id} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{order.order_no || order.id}</span>
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="bg-white/10 text-white text-sm rounded-lg px-3 py-1"
                        >
                          <option value="pending">待处理</option>
                          <option value="paid">已付款</option>
                          <option value="shipped">已发货</option>
                          <option value="delivered">已送达</option>
                          <option value="cancelled">已取消</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/50">
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      <span className="text-[#f6b638] font-bold">
                        ¥{order.total_amount?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-white/50 text-center py-8">暂无订单</p>
            )}
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadUsers();
                  }}
                  placeholder="搜索用户..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#f6b638]/50"
                />
              </div>
            </div>

            <div className="glass-card p-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#f6b638] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f6b638] to-[#e3a222] flex items-center justify-center">
                          <span className="text-black font-bold">{user.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-white/50 text-sm">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-[#f6b638]/20 text-[#f6b638]' 
                            : 'bg-white/10 text-white/60'
                        }`}>
                          {user.role === 'admin' ? '管理员' : '用户'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white/50 text-center py-8">暂无用户</p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="glass-card p-12 text-center">
            <p className="text-white/50">功能开发中...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#020202]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#0c0c0c] border-r border-white/10 z-50">
        <div className="p-6">
          <Link to="/" className="inline-block">
            <span className="text-xl font-bold text-white">
              优品<span className="text-[#f6b638]">商城</span>
            </span>
          </Link>
          <span className="ml-2 text-xs text-white/40">管理后台</span>
        </div>

        <nav className="px-4 py-4">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors mb-1 ${
                  activeTab === item.id
                    ? 'bg-[#f6b638] text-black'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#020202]/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                返回前台
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f6b638] to-[#e3a222] flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white">{user?.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">{renderContent()}</div>
      </main>
    </div>
  );
}
