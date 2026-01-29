const { pool, query } = require('../src/config/database');
const bcrypt = require('bcryptjs');

const seedDatabase = async () => {
  try {
    console.log('🔄 开始填充初始数据...');

    // 清空现有数据
    await query('TRUNCATE TABLE reviews, order_items, orders, cart_items, products, categories, addresses, users RESTART IDENTITY CASCADE');
    console.log('✅ 清空现有数据');

    // 创建分类
    const categories = [
      { name: '电子产品', slug: 'electronics', description: '前沿科技', image: '/category-electronics.jpg', sort_order: 1 },
      { name: '时尚服饰', slug: 'fashion', description: '潮流风格', image: '/category-fashion.jpg', sort_order: 2 },
      { name: '家居生活', slug: 'home', description: '生活美学', image: '/category-home.jpg', sort_order: 3 },
      { name: '运动户外', slug: 'sports', description: '运动装备', image: '/category-sports.jpg', sort_order: 4 },
    ];

    const categoryIds = {};
    for (const cat of categories) {
      const result = await query(
        `INSERT INTO categories (name, slug, description, image, sort_order) 
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [cat.name, cat.slug, cat.description, cat.image, cat.sort_order]
      );
      categoryIds[cat.slug] = result.rows[0].id;
      console.log(`✅ 创建分类: ${cat.name}`);
    }

    // 创建商品
    const products = [
      {
        name: '无线降噪耳机 Pro',
        slug: 'wireless-noise-cancelling-headphones-pro',
        description: '主动降噪技术，沉浸式音质体验，40小时超长续航，舒适佩戴设计。',
        price: 1299,
        original_price: 1599,
        image: '/product-1.jpg',
        category_slug: 'electronics',
        stock: 50,
        rating: 4.8,
        review_count: 256,
        is_new: true,
        is_featured: true,
      },
      {
        name: '智能手表 Pro',
        slug: 'smart-watch-pro',
        description: '健康监测、运动追踪、智能通知，您的贴身健康管家。',
        price: 2499,
        image: '/product-2.jpg',
        category_slug: 'electronics',
        stock: 30,
        rating: 4.7,
        review_count: 189,
        is_new: true,
      },
      {
        name: '便携蓝牙音箱',
        slug: 'portable-bluetooth-speaker',
        description: '360度环绕音效，IPX7防水，12小时续航，户外派对必备。',
        price: 599,
        original_price: 799,
        image: '/product-3.jpg',
        category_slug: 'electronics',
        stock: 80,
        rating: 4.6,
        review_count: 324,
      },
      {
        name: '降噪耳机 Elite',
        slug: 'noise-cancelling-headphones-elite',
        description: '旗舰级降噪，Hi-Res音质认证，奢华材质，尊享体验。',
        price: 1899,
        image: '/product-4.jpg',
        category_slug: 'electronics',
        stock: 20,
        rating: 4.9,
        review_count: 128,
        is_featured: true,
      },
      {
        name: '旗舰智能手机',
        slug: 'flagship-smartphone',
        description: '骁龙8 Gen3处理器，2K AMOLED屏幕，徕卡影像系统。',
        price: 5999,
        image: '/product-5.jpg',
        category_slug: 'electronics',
        stock: 15,
        rating: 4.8,
        review_count: 567,
        is_featured: true,
      },
      {
        name: '无线耳机 Air',
        slug: 'wireless-earbuds-air',
        description: '真无线设计，智能降噪，24小时综合续航。',
        price: 899,
        original_price: 1099,
        image: '/product-6.jpg',
        category_slug: 'electronics',
        stock: 100,
        rating: 4.5,
        review_count: 892,
      },
      {
        name: '智能手环',
        slug: 'smart-band',
        description: '血氧监测、心率追踪、睡眠分析，全面健康管理。',
        price: 1299,
        image: '/product-7.jpg',
        category_slug: 'electronics',
        stock: 60,
        rating: 4.4,
        review_count: 445,
      },
      {
        name: '便携充电宝',
        slug: 'portable-power-bank',
        description: '20000mAh大容量，65W快充，多设备同时充电。',
        price: 299,
        original_price: 399,
        image: '/product-8.jpg',
        category_slug: 'electronics',
        stock: 150,
        rating: 4.7,
        review_count: 723,
      },
    ];

    for (const product of products) {
      await query(
        `INSERT INTO products (name, slug, description, price, original_price, image, category_id, stock, rating, review_count, is_new, is_featured) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          product.name,
          product.slug,
          product.description,
          product.price,
          product.original_price || null,
          product.image,
          categoryIds[product.category_slug],
          product.stock,
          product.rating,
          product.review_count,
          product.is_new || false,
          product.is_featured || false,
        ]
      );
      console.log(`✅ 创建商品: ${product.name}`);
    }

    console.log('🎉 初始数据填充完成！');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据填充失败:', error);
    process.exit(1);
  }
};

seedDatabase();
