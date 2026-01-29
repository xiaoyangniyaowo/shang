import type { User, Product, CartItem, Order, Category } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// 获取存储的 token
const getToken = () => localStorage.getItem('token');

// 通用请求函数
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || '请求失败');
  }

  return data;
}

// ========== 认证相关 ==========
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    request<{ user: User; token: string; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    request<{ user: User }>('/auth/me'),

  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) =>
    request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ========== 商品相关 ==========
export const productApi = {
  getProducts: (params?: {
    category?: string;
    search?: string;
    sort?: string;
    order?: string;
    page?: number;
    limit?: number;
    min_price?: number;
    max_price?: number;
    is_new?: boolean;
    is_featured?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return request<{
      products: Product[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/products?${queryParams.toString()}`);
  },

  getProduct: (id: string) =>
    request<{ product: Product; relatedProducts: Product[] }>(`/products/${id}`),

  getCategories: () =>
    request<{ categories: Category[] }>('/products/categories/list'),
};

// ========== 购物车相关 ==========
export const cartApi = {
  getCart: () =>
    request<{ items: CartItem[]; total: number; count: number }>('/cart'),

  addToCart: (data: { product_id: string; quantity?: number }) =>
    request<{ items: CartItem[]; total: number; count: number; message: string }>('/cart', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateQuantity: (id: string, quantity: number) =>
    request<{ message: string }>(`/cart/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeItem: (id: string) =>
    request<{ message: string }>(`/cart/${id}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    request<{ message: string }>('/cart', {
      method: 'DELETE',
    }),

  getCount: () =>
    request<{ count: number }>('/cart/count'),
};

// ========== 订单相关 ==========
export const orderApi = {
  getOrders: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return request<{
      orders: Order[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/orders?${queryParams.toString()}`);
  },

  getOrder: (id: string) =>
    request<{ order: Order }>(`/orders/${id}`),

  createOrder: (data: {
    shipping_address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      province: string;
      zip_code?: string;
    };
    remark?: string;
  }) =>
    request<{ order: Order; message: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancelOrder: (id: string) =>
    request<{ message: string }>(`/orders/${id}/cancel`, {
      method: 'PUT',
    }),
};

// ========== 管理员相关 ==========
export const adminApi = {
  getDashboard: () =>
    request<{
      stats: {
        totalUsers: number;
        totalProducts: number;
        totalOrders: number;
        totalRevenue: number;
        todayOrders: number;
        todayRevenue: number;
      };
      recentOrders: Order[];
      topProducts: { id: string; name: string; image: string; total_sold: number }[];
    }>('/admin/dashboard'),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return request<{
      users: User[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/admin/users?${queryParams.toString()}`);
  },

  updateUserRole: (id: string, role: 'user' | 'admin') =>
    request<{ user: User; message: string }>(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  getAllOrders: (params?: { page?: number; limit?: number; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    return request<{
      orders: Order[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/orders/admin/all?${queryParams.toString()}`);
  },

  updateOrderStatus: (id: string, status: string) =>
    request<{ order: Order; message: string }>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  createProduct: (data: Partial<Product>) =>
    request<{ product: Product; message: string }>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id: string, data: Partial<Product>) =>
    request<{ product: Product; message: string }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: string) =>
    request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
};
