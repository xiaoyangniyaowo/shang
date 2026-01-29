const express = require('express');
const { query, getClient } = require('../config/database');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// 生成订单号
const generateOrderNo = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `ORD${year}${month}${day}${random}`;
};

// 获取订单列表
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let sql = `
      SELECT o.*, 
             json_agg(json_build_object(
               'id', oi.id,
               'product_id', oi.product_id,
               'product_name', oi.product_name,
               'product_image', oi.product_image,
               'price', oi.price,
               'quantity', oi.quantity
             )) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.user_id = $1
    `;
    const params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      sql += ` AND o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` GROUP BY o.id ORDER BY o.created_at DESC`;

    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    // 获取总数
    let countSql = 'SELECT COUNT(*) FROM orders WHERE user_id = $1';
    const countParams = [req.user.id];
    if (status) {
      countSql += ' AND status = $2';
      countParams.push(status);
    }
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取单个订单
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'id', oi.id,
                'product_id', oi.product_id,
                'product_name', oi.product_name,
                'product_image', oi.product_image,
                'price', oi.price,
                'quantity', oi.quantity
              )) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.json({ order: result.rows[0] });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 创建订单
router.post('/', authenticate, async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { shipping_address, remark } = req.body;

    // 获取购物车商品
    const cartResult = await client.query(
      `SELECT ci.*, p.name, p.price, p.stock, p.image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.is_active = true`,
      [req.user.id]
    );

    if (cartResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: '购物车为空' });
    }

    const cartItems = cartResult.rows;

    // 检查库存
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          message: `商品 "${item.name}" 库存不足，当前库存: ${item.stock}` 
        });
      }
    }

    // 计算总价
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 创建订单
    const orderResult = await client.query(
      `INSERT INTO orders (order_no, user_id, total_amount, shipping_name, shipping_phone, 
                          shipping_address, shipping_city, shipping_province, shipping_zip, remark)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        generateOrderNo(),
        req.user.id,
        totalAmount,
        shipping_address.name,
        shipping_address.phone,
        shipping_address.address,
        shipping_address.city,
        shipping_address.province,
        shipping_address.zip_code,
        remark,
      ]
    );

    const order = orderResult.rows[0];

    // 创建订单商品
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.product_id, item.name, item.image, item.price, item.quantity]
      );

      // 减少库存
      await client.query(
        'UPDATE products SET stock = stock - $1, sold_count = sold_count + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // 清空购物车
    await client.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);

    await client.query('COMMIT');

    res.status(201).json({
      message: '订单创建成功',
      order: {
        ...order,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          product_image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('创建订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    client.release();
  }
});

// 取消订单
router.put('/:id/cancel', authenticate, async (req, res) => {
  const client = await getClient();

  try {
    await client.query('BEGIN');

    const { id } = req.params;

    // 获取订单
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: '订单不存在' });
    }

    const order = orderResult.rows[0];

    // 只能取消待付款或待发货的订单
    if (order.status !== 'pending' && order.status !== 'paid') {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: '该订单无法取消' });
    }

    // 恢复库存
    const itemsResult = await client.query(
      'SELECT * FROM order_items WHERE order_id = $1',
      [id]
    );

    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // 更新订单状态
    await client.query(
      "UPDATE orders SET status = 'cancelled' WHERE id = $1",
      [id]
    );

    await client.query('COMMIT');

    res.json({ message: '订单已取消' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('取消订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  } finally {
    client.release();
  }
});

// ===== 管理员接口 =====

// 获取所有订单（管理员）
router.get('/admin/all', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let sql = `
      SELECT o.*, u.name as user_name, u.email as user_email,
             json_agg(json_build_object(
               'id', oi.id,
               'product_name', oi.product_name,
               'price', oi.price,
               'quantity', oi.quantity
             )) as items
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    const params = [];
    let paramIndex = 1;

    if (status) {
      sql += ` WHERE o.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` GROUP BY o.id, u.name, u.email ORDER BY o.created_at DESC`;

    // 分页
    const offset = (parseInt(page) - 1) * parseInt(limit);
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);

    const result = await query(sql, params);

    // 获取总数
    let countSql = 'SELECT COUNT(*) FROM orders';
    if (status) {
      countSql += ' WHERE status = $1';
    }
    const countParams = status ? [status] : [];
    const countResult = await query(countSql, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('获取所有订单错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新订单状态（管理员）
router.put('/:id/status', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: '无效的订单状态' });
    }

    let updateFields = ['status = $1'];
    let params = [status];

    // 根据状态更新时间戳
    if (status === 'paid') {
      updateFields.push('paid_at = CURRENT_TIMESTAMP');
    } else if (status === 'shipped') {
      updateFields.push('shipped_at = CURRENT_TIMESTAMP');
    } else if (status === 'delivered') {
      updateFields.push('delivered_at = CURRENT_TIMESTAMP');
    }

    params.push(id);

    const result = await query(
      `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${params.length} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '订单不存在' });
    }

    res.json({
      message: '订单状态已更新',
      order: result.rows[0],
    });
  } catch (error) {
    console.error('更新订单状态错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
