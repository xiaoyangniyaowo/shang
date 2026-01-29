const express = require('express');
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取商品列表
router.get('/', async (req, res) => {
  try {
    const {
      category,
      search,
      sort = 'created_at',
      order = 'desc',
      page = 1,
      limit = 20,
      min_price,
      max_price,
      is_new,
      is_featured,
    } = req.query;

    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const params = [];
    let paramIndex = 1;

    // 分类筛选
    if (category) {
      sql += ` AND c.slug = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    // 搜索
    if (search) {
      sql += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // 价格范围
    if (min_price) {
      sql += ` AND p.price >= $${paramIndex}`;
      params.push(min_price);
      paramIndex++;
    }
    if (max_price) {
      sql += ` AND p.price <= $${paramIndex}`;
      params.push(max_price);
      paramIndex++;
    }

    // 新品/精选
    if (is_new === 'true') {
      sql += ` AND p.is_new = true`;
    }
    if (is_featured === 'true') {
      sql += ` AND p.is_featured = true`;
    }

    // 排序
    const allowedSortFields = ['created_at', 'price', 'rating', 'sold_count', 'name'];
    const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = order.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    sql += ` ORDER BY p.${sortField} ${sortOrder}`;

    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    // 获取总数
    let countSql = `
      SELECT COUNT(*) 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = true
    `;
    const countParams = [];
    let countParamIndex = 1;

    if (category) {
      countSql += ` AND c.slug = $${countParamIndex}`;
      countParams.push(category);
      countParamIndex++;
    }
    if (search) {
      countSql += ` AND (p.name ILIKE $${countParamIndex} OR p.description ILIKE $${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }
    if (min_price) {
      countSql += ` AND p.price >= $${countParamIndex}`;
      countParams.push(min_price);
      countParamIndex++;
    }
    if (max_price) {
      countSql += ` AND p.price <= $${countParamIndex}`;
      countParams.push(max_price);
      countParamIndex++;
    }
    if (is_new === 'true') {
      countSql += ` AND p.is_new = true`;
    }
    if (is_featured === 'true') {
      countSql += ` AND p.is_featured = true`;
    }

    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个商品
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1 AND p.is_active = true`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '商品不存在' });
    }

    // 获取相关商品
    const relatedResult = await query(
      `SELECT id, name, slug, price, original_price, image, rating
       FROM products
       WHERE category_id = $1 AND id != $2 AND is_active = true
       LIMIT 4`,
      [result.rows[0].category_id, id]
    );

    res.json({
      product: result.rows[0],
      relatedProducts: relatedResult.rows,
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取商品分类
router.get('/categories/list', async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.sort_order`
    );

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// ===== 管理员接口 =====

// 创建商品（管理员）
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      original_price,
      image,
      images,
      category_id,
      stock,
      is_new,
      is_featured,
    } = req.body;

    const result = await query(
      `INSERT INTO products (name, slug, description, price, original_price, image, images, category_id, stock, is_new, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        name,
        slug,
        description,
        price,
        original_price,
        image,
        JSON.stringify(images || []),
        category_id,
        stock,
        is_new || false,
        is_featured || false,
      ]
    );

    res.status(201).json({
      message: '商品创建成功',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('创建商品错误:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: '商品 slug 已存在' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新商品（管理员）
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      original_price,
      image,
      images,
      category_id,
      stock,
      is_new,
      is_featured,
      is_active,
    } = req.body;

    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, original_price = $4, 
           image = $5, images = $6, category_id = $7, stock = $8, 
           is_new = $9, is_featured = $10, is_active = $11
       WHERE id = $12
       RETURNING *`,
      [
        name,
        description,
        price,
        original_price,
        image,
        JSON.stringify(images || []),
        category_id,
        stock,
        is_new,
        is_featured,
        is_active,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json({
      message: '商品更新成功',
      product: result.rows[0],
    });
  } catch (error) {
    console.error('更新商品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除商品（管理员）
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE products SET is_active = false WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '商品不存在' });
    }

    res.json({ message: '商品已删除' });
  } catch (error) {
    console.error('删除商品错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
