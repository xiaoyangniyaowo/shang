# 优品商城 - 全栈电商系统

一个功能完整的电商网站，包含前端展示、用户系统、购物车、订单管理和后台管理系统，数据存储在 PostgreSQL 数据库中。

## 系统架构

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   前端 (React)  │────▶│  后端 API (Node)│────▶│  PostgreSQL DB  │
│   端口: 5173    │     │   端口: 3001    │     │   端口: 5432    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## 功能特性

### 前端功能
- 🎨 现代化 UI 设计，毛玻璃特效
- 📱 响应式布局，支持移动端
- 🔐 用户注册/登录
- 🛒 购物车管理
- 📦 商品浏览和搜索
- ⭐ 商品评价

### 后端功能
- 🔑 JWT 认证
- 👤 用户管理（第一个注册用户自动成为管理员）
- 📊 商品管理
- 🛍️ 购物车同步
- 📋 订单管理
- 📈 数据统计仪表盘

## 快速开始

### 1. 安装 PostgreSQL

```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt-get install postgresql
sudo service postgresql start

# 创建数据库
createdb youpin_mall
```

### 2. 启动后端服务

```bash
cd server

# 安装依赖
npm install

# 配置环境变量（编辑 .env 文件）
cp .env.example .env

# 初始化数据库
npm run db:init

# 填充初始数据
npm run db:seed

# 启动服务
npm run dev
```

### 3. 启动前端服务

```bash
cd app

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 4. 访问网站

- 前端: http://localhost:5173
- 后端 API: http://localhost:3001
- API 文档: http://localhost:3001/health

## 数据库表结构

```
users          - 用户表
products       - 商品表
categories     - 分类表
cart_items     - 购物车表
orders         - 订单表
order_items    - 订单商品表
reviews        - 评价表
addresses      - 地址表
```

## API 接口

### 认证
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户
- `PUT /api/auth/profile` - 更新用户信息
- `PUT /api/auth/password` - 修改密码

### 商品
- `GET /api/products` - 获取商品列表
- `GET /api/products/:id` - 获取商品详情
- `GET /api/products/categories/list` - 获取分类列表
- `POST /api/products` - 创建商品（管理员）
- `PUT /api/products/:id` - 更新商品（管理员）
- `DELETE /api/products/:id` - 删除商品（管理员）

### 购物车
- `GET /api/cart` - 获取购物车
- `POST /api/cart` - 添加商品
- `PUT /api/cart/:id` - 更新数量
- `DELETE /api/cart/:id` - 删除商品
- `DELETE /api/cart` - 清空购物车
- `GET /api/cart/count` - 获取数量

### 订单
- `GET /api/orders` - 获取订单列表
- `GET /api/orders/:id` - 获取订单详情
- `POST /api/orders` - 创建订单
- `PUT /api/orders/:id/cancel` - 取消订单

### 管理员
- `GET /api/admin/dashboard` - 仪表盘数据
- `GET /api/admin/users` - 用户列表
- `PUT /api/admin/users/:id/role` - 更新用户角色
- `GET /api/orders/admin/all` - 所有订单
- `PUT /api/orders/:id/status` - 更新订单状态

## 部署指南

### 部署到服务器

1. **准备服务器**
   - 安装 Node.js 18+
   - 安装 PostgreSQL
   - 配置防火墙

2. **部署后端**
   ```bash
   cd server
   npm install
   npm run db:init
   npm run db:seed
   npm start
   ```

3. **部署前端**
   ```bash
   cd app
   npm install
   npm run build
   # 将 dist 文件夹部署到静态服务器
   ```

4. **配置 Nginx 反向代理**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           root /path/to/app/dist;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 环境变量

### 后端 (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=youpin_mall
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
PORT=3001
NODE_ENV=production
CLIENT_URL=https://your-domain.com
```

### 前端 (.env.production)
```
VITE_API_URL=https://your-domain.com/api
```

## 管理员账号

第一个注册的账号自动成为管理员，可以访问 `/admin` 后台管理页面。

## 技术栈

- **前端**: React + TypeScript + Tailwind CSS + Vite
- **后端**: Node.js + Express
- **数据库**: PostgreSQL
- **认证**: JWT
- **部署**: 支持 Cloudflare Pages / Vercel / 自建服务器

## 许可证

MIT
