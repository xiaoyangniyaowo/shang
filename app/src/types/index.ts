export interface Product {
  id: string;
  name: string;
  slug?: string;
  price: number;
  original_price?: number;
  image: string;
  images?: string[];
  category_id?: string;
  category_name?: string;
  category_slug?: string;
  description: string;
  rating: number;
  review_count: number;
  stock: number;
  sold_count?: number;
  is_new?: boolean;
  is_featured?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  original_price?: number;
  image: string;
  quantity: number;
  stock?: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'user' | 'admin';
  phone?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  order_no?: string;
  user_id?: string;
  user_name?: string;
  items?: OrderItem[];
  total_amount: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  shipping_name?: string;
  shipping_phone?: string;
  shipping_address?: string;
  shipping_city?: string;
  shipping_province?: string;
  shipping_zip?: string;
  remark?: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
}

export interface Address {
  id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  zip_code?: string;
  is_default?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sort_order?: number;
  product_count?: number;
  is_active?: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  product_id: string;
  order_id?: string;
  rating: number;
  content: string;
  images?: string[];
  is_anonymous?: boolean;
  created_at: string;
}
