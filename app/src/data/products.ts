// 静态数据 - 用于前端展示（当后端不可用时）
import type { Product, Category, Review } from '@/types';

export const categories: Category[] = [
  {
    id: '1',
    name: '电子产品',
    slug: 'electronics',
    description: '前沿科技',
    image: '/category-electronics.jpg',
    product_count: 8,
  },
  {
    id: '2',
    name: '时尚服饰',
    slug: 'fashion',
    description: '潮流风格',
    image: '/category-fashion.jpg',
    product_count: 12,
  },
  {
    id: '3',
    name: '家居生活',
    slug: 'home',
    description: '生活美学',
    image: '/category-home.jpg',
    product_count: 6,
  },
  {
    id: '4',
    name: '运动户外',
    slug: 'sports',
    description: '运动装备',
    image: '/category-sports.jpg',
    product_count: 5,
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: '无线降噪耳机 Pro',
    slug: 'wireless-noise-cancelling-headphones-pro',
    description: '主动降噪技术，沉浸式音质体验，40小时超长续航，舒适佩戴设计。',
    price: 1299,
    original_price: 1599,
    image: '/product-1.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 50,
    rating: 4.8,
    review_count: 256,
    is_new: true,
    is_featured: true,
  },
  {
    id: '2',
    name: '智能手表 Pro',
    slug: 'smart-watch-pro',
    description: '健康监测、运动追踪、智能通知，您的贴身健康管家。',
    price: 2499,
    image: '/product-2.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 30,
    rating: 4.7,
    review_count: 189,
    is_new: true,
  },
  {
    id: '3',
    name: '便携蓝牙音箱',
    slug: 'portable-bluetooth-speaker',
    description: '360度环绕音效，IPX7防水，12小时续航，户外派对必备。',
    price: 599,
    original_price: 799,
    image: '/product-3.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 80,
    rating: 4.6,
    review_count: 324,
  },
  {
    id: '4',
    name: '降噪耳机 Elite',
    slug: 'noise-cancelling-headphones-elite',
    description: '旗舰级降噪，Hi-Res音质认证，奢华材质，尊享体验。',
    price: 1899,
    image: '/product-4.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 20,
    rating: 4.9,
    review_count: 128,
    is_featured: true,
  },
  {
    id: '5',
    name: '旗舰智能手机',
    slug: 'flagship-smartphone',
    description: '骁龙8 Gen3处理器，2K AMOLED屏幕，徕卡影像系统。',
    price: 5999,
    image: '/product-5.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 15,
    rating: 4.8,
    review_count: 567,
    is_featured: true,
  },
  {
    id: '6',
    name: '无线耳机 Air',
    slug: 'wireless-earbuds-air',
    description: '真无线设计，智能降噪，24小时综合续航。',
    price: 899,
    original_price: 1099,
    image: '/product-6.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 100,
    rating: 4.5,
    review_count: 892,
  },
  {
    id: '7',
    name: '智能手环',
    slug: 'smart-band',
    description: '血氧监测、心率追踪、睡眠分析，全面健康管理。',
    price: 1299,
    image: '/product-7.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 60,
    rating: 4.4,
    review_count: 445,
  },
  {
    id: '8',
    name: '便携充电宝',
    slug: 'portable-power-bank',
    description: '20000mAh大容量，65W快充，多设备同时充电。',
    price: 299,
    original_price: 399,
    image: '/product-8.jpg',
    category_id: '1',
    category_name: '电子产品',
    stock: 150,
    rating: 4.7,
    review_count: 723,
  },
];

export const reviews: Review[] = [
  {
    id: '1',
    user_id: 'u1',
    user_name: '王小明',
    user_avatar: '/avatar-1.jpg',
    product_id: '1',
    rating: 5,
    content: '产品质量超出预期，降噪效果非常棒，配送也很快！',
    created_at: '2024-01-15',
  },
  {
    id: '2',
    user_id: 'u2',
    user_name: '李芳',
    user_avatar: '/avatar-2.jpg',
    product_id: '2',
    rating: 5,
    content: '在这家店的体验非常愉快，客服态度很好，一定会再次光顾。',
    created_at: '2024-01-12',
  },
  {
    id: '3',
    user_id: 'u3',
    user_name: '张伟',
    user_avatar: '/avatar-3.jpg',
    product_id: '3',
    rating: 4,
    content: '出色的产品选择和有竞争力的价格，强烈推荐！',
    created_at: '2024-01-10',
  },
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(p => p.id === id);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter(p => p.category_id === categoryId);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter(p => p.is_featured);
};

export const getNewProducts = (): Product[] => {
  return products.filter(p => p.is_new);
};
