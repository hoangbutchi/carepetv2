import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiGrid, FiList, FiShoppingCart, FiHeart, FiSearch, FiChevronDown, FiX, FiSliders } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const categories = [
    { id: 'all', icon: '🛍️' },
    { id: 'food', icon: '🍖' },
    { id: 'accessory', icon: '🎀' },
    { id: 'medicine', icon: '💊' },
    { id: 'toy', icon: '🎾' },
    { id: 'hygiene', icon: '🧴' },
];

const ShopPage = () => {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
    const { addToCart } = useCart();
    const [searchParams, setSearchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState('newest');
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, [activeCategory, sortBy]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {
                sort: sortBy,
                ...(activeCategory !== 'all' && { category: activeCategory }),
            };
            const response = await productAPI.getAll(params);
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            const allProducts = [
                { _id: '1', name: 'Thức ăn hạt cho chó Poodle trưởng thành 1.5kg', category: 'food', price: 250000, originalPrice: 280000, stock: 45, isFeatured: true, images: ['https://loremflickr.com/400/400/dog,food,bowl?lock=1'] },
                { _id: '2', name: 'Pate hỗn hợp cá mòi và cá ngừ cho mèo', category: 'food', price: 25000, stock: 120, images: ['https://loremflickr.com/400/400/cat,food,bowl?lock=2'] },
                { _id: '3', name: 'Sữa bột bổ sung dinh dưỡng cho chó mèo sơ sinh', category: 'food', price: 180000, stock: 30, images: ['https://loremflickr.com/400/400/puppy,milk,bottle?lock=3'] },
                { _id: '4', name: 'Vòng cổ da bò có khắc tên cho chó lớn', category: 'accessory', price: 195000, stock: 25, isFeatured: true, images: ['https://loremflickr.com/400/400/dog,collar,leather?lock=4'] },
                { _id: '5', name: 'Balo phi hành gia vận chuyển thú cưng', category: 'accessory', price: 320000, originalPrice: 400000, stock: 15, images: ['https://loremflickr.com/400/400/cat,carrier,backpack?lock=5'] },
                { _id: '6', name: 'Giường nệm oval lót lông cừu ấm áp', category: 'accessory', price: 260000, stock: 40, images: ['https://loremflickr.com/400/400/dog,bed,sleeping?lock=6'] },
                { _id: '7', name: 'Nhà cây cào móng 3 tầng có võng cho mèo', category: 'accessory', price: 680000, originalPrice: 850000, stock: 10, isFeatured: true, images: ['https://loremflickr.com/400/400/cat,tree,scratch?lock=7'] },
                { _id: '8', name: 'Đồ chơi cần câu mèo lông vũ gắn chuông', category: 'toy', price: 45000, stock: 80, images: ['https://loremflickr.com/400/400/cat,toy,feather?lock=8'] },
                { _id: '9', name: 'Đồ chơi xương gặm cao su sạch răng chó', category: 'toy', price: 85000, stock: 60, isFeatured: true, images: ['https://loremflickr.com/400/400/bone,toy,dog?lock=9'] },
                { _id: '10', name: 'Sữa tắm khử mùi chuyên dụng cho chó', category: 'hygiene', price: 150000, stock: 35, images: ['https://loremflickr.com/400/400/dog,bath,shampoo?lock=10'] },
                { _id: '11', name: 'Cát vệ sinh đất sét vón cục mạnh cho mèo 8L', category: 'hygiene', price: 110000, stock: 150, isFeatured: true, images: ['https://loremflickr.com/400/400/cat,litter,sand?lock=11'] },
                { _id: '12', name: 'Lược chải lông rụng giảm gãy rụng tới 90%', category: 'hygiene', price: 140000, stock: 50, images: ['https://loremflickr.com/400/400/dog,brush,grooming?lock=12'] },
                { _id: '13', name: 'Bỉm tã lót siêu thấm hút size M (Bịch 10 miếng)', category: 'hygiene', price: 90000, stock: 80, images: ['https://loremflickr.com/400/400/puppy,diaper?lock=13'] },
                { _id: '14', name: 'Thuốc nhỏ gáy đặc trị ve, rận rệp cho chó 10-20kg', category: 'medicine', price: 185000, stock: 25, images: ['https://loremflickr.com/400/400/dog,flea,medicine?lock=14'] },
                { _id: '15', name: 'Gel uống tiêu búi lông cho mèo', category: 'medicine', price: 160000, stock: 45, isFeatured: true, images: ['https://loremflickr.com/400/400/cat,medicine?lock=15'] },
                { _id: '16', name: 'Khay vệ sinh có thành cao cho mèo lớn', category: 'hygiene', price: 210000, originalPrice: 250000, stock: 20, images: ['https://loremflickr.com/400/400/cat,litter,box?lock=16'] }
            ];
            setProducts(allProducts.filter(p => activeCategory === 'all' || p.category === activeCategory));
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        if (category === 'all') {
            searchParams.delete('category');
        } else {
            searchParams.set('category', category);
        }
        setSearchParams(searchParams);
    };

    const handleAddToCart = (product) => {
        addToCart(product);
        toast.success(language === 'en' ? 'Added to cart!' : 'Đã thêm vào giỏ hàng!');
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryIcon = (cat) => {
        const icons = { food: '🍖', accessory: '🎀', medicine: '💊', toy: '🎾', hygiene: '🧴' };
        return icons[cat] || '🛍️';
    };

    return (
        <div className="min-h-screen bg-theme pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Light mode gradient */}
                {!isDark && <div className="absolute inset-0 bg-gradient-to-br from-white via-green-50/40 to-emerald-50/30 opacity-70"></div>}
                {/* Dark mode gradient */}
                {isDark && <div className="absolute inset-0 bg-gradient-to-br from-dark-300 via-dark-200 to-emerald-900/10 opacity-80"></div>}
                
                {/* Decorative Background Pet Icons */}
                <div className={`absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay ${isDark ? 'opacity-60' : 'opacity-40'}`}>
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-32 left-[10%] w-24 h-24 rounded-full object-cover transform rotate-12 animate-float shadow-lg" />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/4 right-[15%] w-20 h-20 rounded-full object-cover transform -rotate-12 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-40 right-[10%] w-28 h-28 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute bottom-1/3 left-[5%] w-24 h-24 rounded-full object-cover transform rotate-15 animate-float shadow-lg flex" style={{ animationDelay: '3s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-1/2 left-[30%] w-16 h-16 rounded-full object-cover transform rotate-90 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute bottom-10 left-[40%] w-20 h-20 rounded-full object-cover transform rotate-180 animate-float shadow-lg" style={{ animationDelay: '2.5s' }} />
                </div>
            </div>

            <div className="container-custom relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <span className="badge-primary mb-4">{language === 'en' ? 'Pet Shop' : 'Cửa hàng'}</span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{t('shop.title')}</h1>
                    <p className="text-xl text-gray-400">
                        {language === 'en' ? 'Quality products for your beloved pets' : 'Sản phẩm chất lượng cho thú cưng của bạn'}
                    </p>
                </div>

                {/* Filters Bar */}
                <div className="card-glass p-4 mb-8 animate-fade-in-up delay-100">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        {/* Search */}
                        <div className="relative w-full lg:w-80">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder={t('common.search')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-12"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                >
                                    <FiX className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Categories - Desktop */}
                        <div className="hidden lg:flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 ${activeCategory === cat.id
                                            ? 'bg-gradient-primary text-white shadow-glow-sm'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.id === 'all' ? t('shop.all') : t(`shop.${cat.id}`)}</span>
                                </button>
                            ))}
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden btn-glass w-full"
                        >
                            <FiSliders className="mr-2" />
                            {language === 'en' ? 'Filters' : 'Bộ lọc'}
                            <FiChevronDown className={`ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Sort & View */}
                        <div className="flex items-center space-x-3">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="input py-2 w-40 cursor-pointer"
                            >
                                <option value="newest">{t('shop.newest')}</option>
                                <option value="price_asc">{t('shop.priceAsc')}</option>
                                <option value="price_desc">{t('shop.priceDesc')}</option>
                                <option value="bestselling">{t('shop.bestselling')}</option>
                            </select>

                            <div className="flex rounded-xl overflow-hidden border border-white/10">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <FiGrid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                                >
                                    <FiList className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Categories */}
                    {showFilters && (
                        <div className="lg:hidden mt-4 pt-4 border-t border-white/10 animate-fade-in-down">
                            <p className="text-sm text-gray-500 mb-3">{language === 'en' ? 'Categories' : 'Danh mục'}</p>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            handleCategoryChange(cat.id);
                                            setShowFilters(false);
                                        }}
                                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center space-x-2 ${activeCategory === cat.id
                                                ? 'bg-gradient-primary text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.id === 'all' ? t('shop.all') : t(`shop.${cat.id}`)}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6 animate-fade-in">
                    <p className="text-gray-400">
                        {language === 'en' ? `Showing ${filteredProducts.length} products` : `Hiển thị ${filteredProducts.length} sản phẩm`}
                    </p>
                    {activeCategory !== 'all' && (
                        <button
                            onClick={() => handleCategoryChange('all')}
                            className="text-primary-400 hover:text-primary-300 text-sm flex items-center"
                        >
                            <FiX className="mr-1" />
                            {language === 'en' ? 'Clear filter' : 'Xóa bộ lọc'}
                        </button>
                    )}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="card p-4">
                                <div className="skeleton h-52 rounded-xl mb-4" />
                                <div className="skeleton h-4 w-1/3 mb-2" />
                                <div className="skeleton h-6 w-3/4 mb-2" />
                                <div className="skeleton h-6 w-1/2 mb-4" />
                                <div className="flex justify-between">
                                    <div className="skeleton h-6 w-24" />
                                    <div className="skeleton h-10 w-28 rounded-lg" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 animate-fade-in">
                        <span className="text-6xl mb-4 block">📦</span>
                        <h3 className="text-xl font-semibold text-white mb-2">{t('common.noResults')}</h3>
                        <p className="text-gray-400">{language === 'en' ? 'Try adjusting your search or filters' : 'Thử điều chỉnh tìm kiếm hoặc bộ lọc'}</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product._id}
                                className="card group overflow-hidden animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Image */}
                                <Link to={`/shop/${product._id}`} className="block">
                                    <div className="relative h-52 bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{getCategoryIcon(product.category)}</span>
                                        )}

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                                            {product.isFeatured && (
                                                <span className="badge-primary">{language === 'en' ? 'Featured' : 'Nổi bật'}</span>
                                            )}
                                            {product.originalPrice && (
                                                <span className="badge-danger">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                                            )}
                                        </div>

                                        {/* Wishlist */}
                                        <button
                                            onClick={(e) => e.preventDefault()}
                                            className="absolute top-3 right-3 w-10 h-10 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-pink-500/20"
                                        >
                                            <FiHeart className="w-5 h-5 text-gray-400 hover:text-pink-400 transition-colors" />
                                        </button>

                                        {/* Quick add button */}
                                        <button
                                            onClick={(e) => { e.preventDefault(); handleAddToCart(product); }}
                                            disabled={product.stock === 0}
                                            className="absolute bottom-3 left-3 right-3 btn-primary py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:opacity-50"
                                        >
                                            {product.stock === 0 ? t('shop.outOfStock') : (
                                                <>
                                                    <FiShoppingCart className="mr-2" />
                                                    {t('shop.addToCart')}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </Link>

                                {/* Content */}
                                <div className="p-4">
                                    <p className="text-xs text-primary-400 uppercase tracking-wide mb-1">{product.category}</p>
                                    <Link to={`/shop/${product._id}`}>
                                        <h3 className="font-semibold text-white mb-3 line-clamp-2 min-h-[48px] hover:text-primary-400 transition-colors">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-lg font-bold text-gradient">{formatPrice(product.price)}</span>
                                            {product.originalPrice && (
                                                <span className="text-sm text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                                            )}
                                        </div>
                                        {product.stock <= 10 && product.stock > 0 && (
                                            <span className="text-xs text-accent-400">{language === 'en' ? `Only ${product.stock} left` : `Còn ${product.stock}`}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // List View
                    <div className="space-y-4">
                        {filteredProducts.map((product, index) => (
                            <div
                                key={product._id}
                                className="card-glass p-4 flex flex-col sm:flex-row gap-6 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <Link to={`/shop/${product._id}`} className="block">
                                    <div className="w-full sm:w-40 h-40 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden group">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                        ) : (
                                            <span className="text-5xl group-hover:scale-110 transition-transform">{getCategoryIcon(product.category)}</span>
                                        )}
                                    </div>
                                </Link>
                                <div className="flex-1">
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <span className="badge-primary text-xs">{product.category}</span>
                                        {product.isFeatured && <span className="badge-warning text-xs">{language === 'en' ? 'Featured' : 'Nổi bật'}</span>}
                                        {product.originalPrice && (
                                            <span className="badge-danger text-xs">-{Math.round((1 - product.price / product.originalPrice) * 100)}%</span>
                                        )}
                                    </div>
                                    <Link to={`/shop/${product._id}`}>
                                        <h3 className="text-xl font-semibold text-white mb-2 hover:text-primary-400 transition-colors">{product.name}</h3>
                                    </Link>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                        {language === 'en' ? 'High-quality product for your beloved pet' : 'Sản phẩm chất lượng cao cho thú cưng của bạn'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-2xl font-bold text-gradient">{formatPrice(product.price)}</span>
                                            {product.originalPrice && (
                                                <span className="text-gray-500 line-through ml-2">{formatPrice(product.originalPrice)}</span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={product.stock === 0}
                                            className="btn-primary"
                                        >
                                            <FiShoppingCart className="mr-2" />
                                            {product.stock === 0 ? t('shop.outOfStock') : t('shop.addToCart')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShopPage;
