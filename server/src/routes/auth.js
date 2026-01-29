const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { generateToken, authenticate } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('password').isLength({ min: 6 }).withMessage('密码至少需要6个字符'),
    body('name').trim().notEmpty().withMessage('请输入用户名'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password, name } = req.body;

      // 检查邮箱是否已存在
      const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: '该邮箱已被注册' });
      }

      // 检查是否是第一个用户（第一个用户设为管理员）
      const userCount = await query('SELECT COUNT(*) FROM users');
      const isFirstUser = parseInt(userCount.rows[0].count) === 0;
      const role = isFirstUser ? 'admin' : 'user';

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const result = await query(
        `INSERT INTO users (email, password, name, role) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, email, name, role, created_at`,
        [email, hashedPassword, name, role]
      );

      const user = result.rows[0];
      const token = generateToken(user.id);

      res.status(201).json({
        message: '注册成功',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        token,
        isFirstUser,
      });
    } catch (error) {
      console.error('注册错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 登录
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('请输入有效的邮箱地址'),
    body('password').notEmpty().withMessage('请输入密码'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { email, password } = req.body;

      // 查找用户
      const result = await query(
        'SELECT id, email, password, name, role, avatar, created_at FROM users WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // 用户不存在，自动注册
        const name = email.split('@')[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 检查是否是第一个用户
        const userCount = await query('SELECT COUNT(*) FROM users');
        const isFirstUser = parseInt(userCount.rows[0].count) === 0;
        const role = isFirstUser ? 'admin' : 'user';

        const newUserResult = await query(
          `INSERT INTO users (email, password, name, role) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id, email, name, role, created_at`,
          [email, hashedPassword, name, role]
        );

        const newUser = newUserResult.rows[0];
        const token = generateToken(newUser.id);

        return res.status(201).json({
          message: isFirstUser ? '注册成功！您已成为管理员' : '注册成功',
          user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
          },
          token,
          isNewUser: true,
        });
      }

      const user = result.rows[0];

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: '密码错误' });
      }

      const token = generateToken(user.id);

      res.json({
        message: '登录成功',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      });
    } catch (error) {
      console.error('登录错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  }
);

// 获取当前用户信息
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 更新用户信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    
    const result = await query(
      `UPDATE users SET name = $1, phone = $2, avatar = $3 
       WHERE id = $4 
       RETURNING id, email, name, phone, avatar, role`,
      [name, phone, avatar, req.user.id]
    );

    res.json({
      message: '更新成功',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 修改密码
router.put('/password', authenticate, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 获取当前密码
    const userResult = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // 验证旧密码
    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ message: '原密码错误' });
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({ message: '密码修改成功' });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
