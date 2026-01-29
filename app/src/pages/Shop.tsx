import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid3X3, LayoutList, ShoppingCart, Star } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/sections/Footer';
import { productApi } from '@/services/api';
import { useApp } from '@/store/AppContext';
import type { Product, Category } from '@/types';
import { toast } from 'sonner';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useApp();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // 加载分类
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { categories } = await productApi.getCategories();
        setCategories(categories);
      } catch (error) {
        console.error('加载分类失败:', error);
      }
    };
    loadCategories();
  }, []);

  // 加载商品
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const params: any = {
          page: pagination.page,
          limit: pagination.limit,
          sort: sortBy,
          order: sortOrder,
        };

        if (selectedCategory !== 'all') {
          params.category = selectedCategory;
        }

        if (searchQuery) {
          params.search = searchQuery;
        }

        if (priceRange[1] < 10000) {
          params.max_price = priceRange[1];
        }

        const data = await productApi.getProducts(params);
        setProducts(data.products);
        setPagination(data.pagination);
      } catch (error) {
        console.error('加载商品失败:', error);
        toast.error('加载商品失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [selectedCategory, sortBy, sortOrder, pagination.page, searchQuery, priceRange[1]]);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      toast.success(`${product.name} 已加入购物车`);
    } catch (error: any) {
      if (error.message === '请先登录') {
        toast.error('请先登录');
      } else {
        toast.error(error.message || '添加失败');
      }
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, page: 1 }));
    if (category === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-[#020202]">
      <Navbar />
      
      {/* Header */}
      <div className="pt-24 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            商品<span className="text-[#f6b638]">商城</span>
          </h1>
          <p className="text-white/60">探索我们的精选产品系列</p>
        </div>
      </div>

      {/* Filters & Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            {/* Search */}
            <div className="glass-card p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索商品..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#f6b638]/50"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="glass-card p-4">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                分类
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('all')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#f6b638] text-black'
                      : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  全部商品
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryChange(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-[#f6b638] text-black'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="glass-card p-4">
              <h3 className="text-white font-semibold mb-4">价格范围</h3>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange[1]}
                  onChange={(e) =>
                    setPriceRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full accent-[#f6b638]"
                />
                <div className="flex justify-between text-white/60 text-sm">
                  <span>¥0</span>
                  <span>¥{priceRange[1]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <p className="text-white/60">
                共 <span className="text-white">{pagination.total}</span> 件商品
              </p>
              <div className="flex items-center gap-4">
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order as 'asc' | 'desc');
                  }}
                  className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#f6b638]"
                >
                  <option value="created_at-desc">最新上架</option>
                  <option value="price-asc">价格从低到高</option>
                  <option value="price-desc">价格从高到低</option>
                  <option value="rating-desc">评分最高</option>
                </select>
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${
                      viewMode === 'grid' ? 'bg-white/10' : ''
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${
                      viewMode === 'list' ? 'bg-white/10' : ''
                    }`}
                  >
                    <LayoutList className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#f6b638] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : products.length > 0 ? (
              <div
                className={`grid gap-4 ${
                  viewMode === 'grid'
                    ? 'grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {products.map((product) => (
                  <div
                    key={product.id}
                    className={`product-card group ${
                      viewMode === 'list' ? 'flex gap-4' : ''
                    }`}
                  >
                    {/* Image */}
                    <Link
                      to={`/product/${product.id}`}
                      className={`relative overflow-hidden ${
                        viewMode === 'list'
                          ? 'w-48 h-48 flex-shrink-0'
                          : 'aspect-square'
                      }`}
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      {product.is_new && (
                        <span className="absolute top-2 left-2 px-2 py-1 bg-[#f6b638] text-black text-xs font-bold rounded">
                          新品
                        </span>
                      )}
                    </Link>

                    {/* Content */}
                    <div className="p-4 flex-1">
                      <Link to={`/product/${product.id}`}>
                        <h3 className="text-white font-semibold group-hover:text-[#f6b638] transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-white/50 text-sm mt-1 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-[#f6b638] fill-[#f6b638]" />
                        <span className="text-white/60 text-sm">
                          {product.rating}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-[#f6b638]">
                            ¥{product.price.toLocaleString()}
                          </span>
                          {product.original_price && (
                            <span className="text-white/40 line-through text-sm">
                              ¥{product.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-2 bg-[#f6b638] text-black rounded-lg hover:bg-[#ffd77d] transition-colors"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-white/60 text-lg">没有找到相关商品</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setPriceRange([0, 10000]);
                  }}
                  className="mt-4 text-[#f6b638] hover:underline"
                >
                  清除筛选条件
                </button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination(prev => ({ ...prev, page }))}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      page === pagination.page
                        ? 'bg-[#f6b638] text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
