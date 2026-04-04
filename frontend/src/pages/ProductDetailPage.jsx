import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiMinus, FiPlus, FiCheck, FiPackage, FiHeart, FiShare2, FiTruck, FiShield, FiRefreshCw } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import { Spinner, Badge } from '../components/common/UI';
import toast from 'react-hot-toast';

const ProductDetailPage = () => {
    const { id } = useParams();
    const { language } = useLanguage();
    const { isStaff } = useAuth();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [addedToCart, setAddedToCart] = useState(false);

    const categoryLabels = {
        en: { food: 'Food', accessory: 'Accessory', toy: 'Toys', medicine: 'Medicine', hygiene: 'Hygiene' },
        vi: { food: 'Thức ăn', accessory: 'Phụ kiện', toy: 'Đồ chơi', medicine: 'Thuốc', hygiene: 'Vệ sinh' }
    };

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        setLoading(true);
        try {
            const response = await productAPI.getOne(id);
            setProduct(response.data.product);
        } catch (error) {
            console.error('Error fetching product:', error);
            setProduct({
                _id: id,
                name: language === 'en' ? 'Premium Dog Food 10kg' : 'Thức ăn cao cấp cho chó 10kg',
                description: language === 'en'
                    ? 'High-quality dog food made with natural ingredients. Contains essential vitamins and minerals for your pet\'s health. Suitable for adult dogs of all breeds.'
                    : 'Thức ăn cho chó chất lượng cao được làm từ nguyên liệu tự nhiên. Chứa các vitamin và khoáng chất thiết yếu cho sức khỏe thú cưng. Phù hợp với chó trưởng thành mọi giống.',
                price: 450000,
                originalPrice: 500000,
                category: 'food',
                stock: 50,
                images: [],
                isFeatured: true
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (isStaff) {
            toast.error(language === 'en' ? 'Staff cannot purchase items' : 'Nhân viên không thể mua hàng');
            return;
        }
        addToCart(product, quantity);
        setAddedToCart(true);
        toast.success(language === 'en' ? 'Added to cart!' : 'Đã thêm vào giỏ hàng!');
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const incrementQuantity = () => {
        if (quantity < (product?.stock || 99)) {
            setQuantity(q => q + 1);
        }
    };

    const decrementQuantity = () => {
        if (quantity > 1) {
            setQuantity(q => q - 1);
        }
    };

    const getCategoryIcon = (cat) => {
        const icons = { food: '🍖', accessory: '🎀', medicine: '💊', toy: '🎾', hygiene: '🧴' };
        return icons[cat] || '🛍️';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-theme-light flex items-center justify-center pt-20">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-theme-light flex items-center justify-center pt-20">
                <div className="text-center">
                    <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FiPackage className="w-10 h-10 text-[#64748b]" />
                    </div>
                    <h2 className="text-xl font-semibold text-[#1e293b] mb-4">
                        {language === 'en' ? 'Product not found' : 'Không tìm thấy sản phẩm'}
                    </h2>
                    <Link to="/shop" className="btn-primary">
                        {language === 'en' ? 'Back to Shop' : 'Quay lại cửa hàng'}
                    </Link>
                </div>
            </div>
        );
    }

    const discount = product.originalPrice
        ? Math.round((1 - product.price / product.originalPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-theme-light pt-24 pb-12">
            <div className="container-custom">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-[#64748b] mb-8 animate-fade-in">
                    <Link to="/" className="hover:text-primary-400 transition-colors">{language === 'en' ? 'Home' : 'Trang chủ'}</Link>
                    <span>/</span>
                    <Link to="/shop" className="hover:text-primary-400 transition-colors">{language === 'en' ? 'Shop' : 'Cửa hàng'}</Link>
                    <span>/</span>
                    <span className="text-[#475569] truncate max-w-[200px]">{product.name}</span>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Images */}
                    <div className="space-y-4 animate-fade-in-up">
                        <div className="aspect-square card-glass rounded-3xl overflow-hidden flex items-center justify-center">
                            {product.images?.[selectedImage] ? (
                                <img
                                    src={product.images[selectedImage]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-9xl">{getCategoryIcon(product.category)}</span>
                            )}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="flex gap-3">
                                {product.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedImage(idx)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden transition-all duration-300 ${selectedImage === idx
                                                ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-dark-300'
                                                : 'opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6 animate-fade-in-up delay-100">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <Badge variant="primary">
                                    {categoryLabels[language][product.category] || product.category}
                                </Badge>
                                {product.isFeatured && (
                                    <Badge variant="warning">
                                        ⭐ {language === 'en' ? 'Featured' : 'Nổi bật'}
                                    </Badge>
                                )}
                                {discount > 0 && (
                                    <Badge variant="danger">-{discount}%</Badge>
                                )}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-[#1e293b] mb-4">{product.name}</h1>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-4">
                            <span className="text-4xl font-bold text-gradient">
                                {new Intl.NumberFormat('vi-VN').format(product.price)}₫
                            </span>
                            {product.originalPrice && (
                                <span className="text-xl text-[#64748b] line-through">
                                    {new Intl.NumberFormat('vi-VN').format(product.originalPrice)}₫
                                </span>
                            )}
                        </div>

                        {/* Stock */}
                        <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${product.stock > 10
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : product.stock > 0
                                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                            {product.stock > 10
                                ? `✓ ${language === 'en' ? 'In stock' : 'Còn hàng'} (${product.stock})`
                                : product.stock > 0
                                    ? `⚠ ${language === 'en' ? 'Low stock' : 'Sắp hết hàng'} (${product.stock})`
                                    : `✗ ${language === 'en' ? 'Out of stock' : 'Hết hàng'}`
                            }
                        </div>

                        {/* Description */}
                        <div className="card-glass p-6 rounded-2xl">
                            <h3 className="font-semibold text-[#1e293b] mb-3">
                                {language === 'en' ? 'Description' : 'Mô tả sản phẩm'}
                            </h3>
                            <p className="text-[#1e293b] leading-relaxed">
                                {product.description || (language === 'en'
                                    ? 'High-quality product for your beloved pet. Made with premium ingredients and carefully tested for safety.'
                                    : 'Sản phẩm chất lượng cao cho thú cưng yêu quý của bạn. Được làm từ nguyên liệu cao cấp và kiểm tra an toàn cẩn thận.'
                                )}
                            </p>
                        </div>

                        {/* Quantity & Add to Cart */}
                        {!isStaff && product.stock > 0 && (
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center rounded-xl overflow-hidden bg-white/5 border border-white/10">
                                        <button
                                            onClick={decrementQuantity}
                                            className="w-12 h-12 flex items-center justify-center text-[#64748b] hover:text-[#1e293b] hover:bg-white/10 transition-colors"
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="w-16 text-center font-semibold text-lg text-[#1e293b]">{quantity}</span>
                                        <button
                                            onClick={incrementQuantity}
                                            className="w-12 h-12 flex items-center justify-center text-[#64748b] hover:text-[#1e293b] hover:bg-white/10 transition-colors"
                                        >
                                            <FiPlus />
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${addedToCart
                                                ? 'bg-green-500 text-[#1e293b]'
                                                : 'btn-primary'
                                            }`}
                                    >
                                        {addedToCart ? (
                                            <>
                                                <FiCheck className="w-5 h-5" />
                                                {language === 'en' ? 'Added!' : 'Đã thêm!'}
                                            </>
                                        ) : (
                                            <>
                                                <FiShoppingCart className="w-5 h-5" />
                                                {language === 'en' ? 'Add to Cart' : 'Thêm vào giỏ'}
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Action buttons */}
                                <div className="flex gap-3">
                                    <button className="btn-glass flex-1 py-3">
                                        <FiHeart className="mr-2" />
                                        {language === 'en' ? 'Wishlist' : 'Yêu thích'}
                                    </button>
                                    <button className="btn-glass flex-1 py-3">
                                        <FiShare2 className="mr-2" />
                                        {language === 'en' ? 'Share' : 'Chia sẻ'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Total */}
                        {!isStaff && product.stock > 0 && (
                            <div className="card-glass rounded-2xl p-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-[#64748b]">{language === 'en' ? 'Total' : 'Tổng cộng'}:</span>
                                    <span className="text-3xl font-bold text-gradient">
                                        {new Intl.NumberFormat('vi-VN').format(product.price * quantity)}₫
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-xl bg-white/5">
                                <FiTruck className="w-6 h-6 mx-auto text-primary-400 mb-2" />
                                <p className="text-xs text-[#64748b]">{language === 'en' ? 'Free Shipping' : 'Miễn phí ship'}</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/5">
                                <FiShield className="w-6 h-6 mx-auto text-green-400 mb-2" />
                                <p className="text-xs text-[#64748b]">{language === 'en' ? 'Genuine' : 'Chính hãng'}</p>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-white/5">
                                <FiRefreshCw className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
                                <p className="text-xs text-[#64748b]">{language === 'en' ? 'Easy Return' : 'Đổi trả dễ'}</p>
                            </div>
                        </div>

                        {/* Back button */}
                        <Link
                            to="/shop"
                            className="inline-flex items-center text-[#64748b] hover:text-primary-400 transition-colors"
                        >
                            <FiArrowLeft className="mr-2" />
                            {language === 'en' ? 'Continue Shopping' : 'Tiếp tục mua sắm'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
