const express = require('express');
const { query } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 获取仪表盘统计数据
router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    // 总用户数
    const usersResult = await query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(usersResult.rows[0].count);

    // 总商品数
    const productsResult = await query('SELECT COUNT(*) FROM products WHERE is_active = true');
    const totalProducts = parseInt(productsResult.rows[0].count);

    // 总订单数
    const ordersResult = await query('SELECT COUNT(*) FROM orders');
    const totalOrders = parseInt(ordersResult.rows[0].count);

    // 总营收
    const revenueResult = await query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status IN ('paid', 'shipped', 'delivered')"
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total);

    // 今日订单
    const todayOrdersResult = await query(
      "SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE"
    );
    const todayOrders = parseInt(todayOrdersResult.rows[0].count);

    // 今日营收
    const todayRevenueResult = await query(
      "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE DATE(created_at) = CURRENT_DATE AND status IN ('paid', 'shipped', 'delivered')"
    );
    const todayRevenue = parseFloat(todayRevenueResult.rows[0].total);

    // 最近订单
    const recentOrdersResult = await query(
      `SELECT o.*, u.name as user_name
       FROM orders o
       JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // 热销商品
    const topProductsResult = await query(
      `SELECT p.id, p.name, p.image, SUM(oi.quantity) as total_sold
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       GROUP BY p.id, p.name, p.image
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        todayOrders,
        todayRevenue,
      },
      recentOrders: recentOrdersResult.rows,
      topProducts: topProductsResult.rows,
    });
  } catch (error) {
    console.error('获取仪表盘数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取用户列表
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    let sql = `
      SELECT id, email, name, avatar, role, phone, created_at
      FROM users
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (search) {
      sql += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC`;

    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    // 获取总数
    let countSql = 'SELECT COUNT(*) FROM users WHERE 1=1';
    if (search) {
      countSql += ' AND (name ILIKE $1 OR email ILIKE $1)';
    }
    const countParams = search ? [`%${search}%`] : [];
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户角色
router.put('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: '无效的角色' });
    }

    const result = await query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      message: '用户角色已更新',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('更新用户角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取分类列表（管理员）
router.get('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const result = await query(
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY c.sort_order`
    );

    res.json({ categories: result.rows });
  } catch (error) {
    console.error('获取分类列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建分类
router.post('/categories', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, slug, description, image, sort_order } = req.body;

    const result = await query(
      `INSERT INTO categories (name, slug, description, image, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, slug, description, image, sort_order || 0]
    );

    res.status(201).json({
      message: '分类创建成功',
      category: result.rows[0],
    });
  } catch (error) {
    console.error('创建分类错误:', error);
    if (error.code === '23505') {
      return res.status(400).json({ message: '分类 slug 已存在' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新分类
router.put('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, sort_order, is_active } = req.body;

    const result = await query(
      `UPDATE categories 
       SET name = $1, slug = $2, description = $3, image = $4, sort_order = $5, is_active = $6
       WHERE id = $7
       RETURNING *`,
      [name, slug, description, image, sort_order, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '分类不存在' });
    }

    res.json({
      message: '分类更新成功',
      category: result.rows[0],
    });
  } catch (error) {
    console.error('更新分类错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除分类
router.delete('/categories/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // 检查分类下是否有商品
    const productsResult = await query(
      'SELECT COUNT(*) FROM products WHERE category_id = $1',
      [id]
    );

    if (parseInt(productsResult.rows[0].count) > 0) {
      return res.status(400).json({ message: '该分类下还有商品，无法删除' });
    }

    const result = await query(
      'DELETE FROM categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '分类不存在' });
    }

    res.json({ message: '分类已删除' });
  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
