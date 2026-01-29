const express = require('express');
const { query, getClient } = require('../config/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// 获取购物车
router.get('/', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT ci.id, ci.quantity, ci.created_at,
              p.id as product_id, p.name, p.price, p.original_price, p.image, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.is_active = true
       ORDER BY ci.created_at DESC`,
      [req.user.id]
    );

    const items = result.rows;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      items,
      total,
      count,
    });
  } catch (error) {
    console.error('获取购物车错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 添加商品到购物车
router.post('/', authenticate, async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    // 检查商品是否存在且有库存
    const productResult = await query(
      'SELECT id, stock FROM products WHERE id = $1 AND is_active = true',
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: '商品不存在' });
    }

    const product = productResult.rows[0];

    // 检查购物车中是否已有该商品
    const existingResult = await query(
      'SELECT id, quantity FROM cart_items WHERE user_id = $1 AND product_id = $2',
      [req.user.id, product_id]
    );

    if (existingResult.rows.length > 0) {
      // 更新数量
      const newQuantity = existingResult.rows[0].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ message: '库存不足' });
      }

      await query(
        'UPDATE cart_items SET quantity = $1 WHERE id = $2',
        [newQuantity, existingResult.rows[0].id]
      );
    } else {
      // 新增商品
      if (quantity > product.stock) {
        return res.status(400).json({ message: '库存不足' });
      }

      await query(
        'INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)',
        [req.user.id, product_id, quantity]
      );
    }

    // 返回更新后的购物车
    const cartResult = await query(
      `SELECT ci.id, ci.quantity,
              p.id as product_id, p.name, p.price, p.original_price, p.image
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.is_active = true`,
      [req.user.id]
    );

    const items = cartResult.rows;
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const count = items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      message: '已添加到购物车',
      items,
      total,
      count,
    });
  } catch (error) {
    console.error('添加购物车错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新购物车商品数量
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({ message: '数量不能小于1' });
    }

    // 检查购物车项是否存在且属于当前用户
    const cartItemResult = await query(
      `SELECT ci.id, p.stock
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.user_id = $2`,
      [id, req.user.id]
    );

    if (cartItemResult.rows.length === 0) {
      return res.status(404).json({ message: '购物车项不存在' });
    }

    if (quantity > cartItemResult.rows[0].stock) {
      return res.status(400).json({ message: '库存不足' });
    }

    await query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2',
      [quantity, id]
    );

    res.json({ message: '更新成功' });
  } catch (error) {
    console.error('更新购物车错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除购物车商品
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM cart_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: '购物车项不存在' });
    }

    res.json({ message: '已删除' });
  } catch (error) {
    console.error('删除购物车项错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 清空购物车
router.delete('/', authenticate, async (req, res) => {
  try {
    await query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: '购物车已清空' });
  } catch (error) {
    console.error('清空购物车错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取购物车数量（用于导航栏）
router.get('/count', authenticate, async (req, res) => {
  try {
    const result = await query(
      `SELECT COALESCE(SUM(ci.quantity), 0) as count
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.user_id = $1 AND p.is_active = true`,
      [req.user.id]
    );

    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('获取购物车数量错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
