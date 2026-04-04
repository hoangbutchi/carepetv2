import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiShield, FiTruck, FiPercent } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/common/UI';

const CartPage = () => {
    const { t, language } = useLanguage();
    const { items, updateQuantity, removeFromCart, subtotal, shipping, total } = useCart();

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    };

    const getCategoryIcon = (product) => {
        const icons = { food: '🍖', accessory: '🎀', medicine: '💊', toy: '🎾', hygiene: '🧴' };
        return icons[product.category] || '🛍️';
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-theme-light pt-24 pb-12">
                <div className="container-custom max-w-4xl">
                    <h1 className="text-4xl font-display font-bold text-[#1e293b] mb-8 animate-fade-in-up">{t('cart.title')}</h1>
                    <div className="card-glass p-12 animate-fade-in-up delay-100">
                        <EmptyState
                            icon={<span className="text-5xl">🛒</span>}
                            title={t('cart.empty')}
                            description={language === 'en' ? 'Browse our shop and add some products!' : 'Khám phá cửa hàng và thêm sản phẩm!'}
                            action={
                                <Link to="/shop" className="btn-primary">
                                    <FiShoppingBag className="mr-2" />
                                    {t('cart.continueShopping')}
                                </Link>
                            }
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme-light pt-24 pb-12">
            <div className="container-custom">
                <h1 className="text-4xl font-display font-bold text-[#1e293b] mb-8 animate-fade-in-up">{t('cart.title')}</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, index) => (
                            <div
                                key={item.product._id}
                                className="card-glass p-4 flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Product Image */}
                                <Link
                                    to={`/shop/${item.product._id}`}
                                    className="w-full sm:w-28 h-28 rounded-xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden group"
                                >
                                    {item.product.images?.[0] ? (
                                        <img
                                            src={item.product.images[0]}
                                            alt={item.product.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        />
                                    ) : (
                                        <span className="text-4xl group-hover:scale-110 transition-transform">{getCategoryIcon(item.product)}</span>
                                    )}
                                </Link>

                                {/* Product Info */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <Link to={`/shop/${item.product._id}`}>
                                            <h3 className="font-semibold text-[#1e293b] hover:text-primary-400 transition-colors">{item.product.name}</h3>
                                        </Link>
                                        <p className="text-sm text-[#64748b] capitalize">{item.product.category}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center rounded-lg overflow-hidden bg-white/5 border border-white/10">
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                                                className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-[#1e293b] hover:bg-white/10 transition-colors"
                                            >
                                                <FiMinus className="w-4 h-4" />
                                            </button>
                                            <span className="w-10 text-center font-medium text-[#1e293b]">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center text-[#64748b] hover:text-[#1e293b] hover:bg-white/10 transition-colors"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Price & Remove */}
                                        <div className="flex items-center space-x-4">
                                            <span className="text-lg font-bold text-gradient">
                                                {formatPrice(item.product.price * item.quantity)}
                                            </span>
                                            <button
                                                onClick={() => removeFromCart(item.product._id)}
                                                className="w-8 h-8 rounded-lg text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <Link to="/shop" className="btn-glass w-full py-4 justify-center mt-4">
                            <FiShoppingBag className="mr-2" />
                            {t('cart.continueShopping')}
                        </Link>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="card-glass p-6 sticky top-24 animate-fade-in-up delay-200">
                            <h2 className="text-xl font-semibold text-[#1e293b] mb-6">
                                {language === 'en' ? 'Order Summary' : 'Tóm tắt đơn hàng'}
                            </h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-[#64748b]">
                                    <span>{t('cart.subtotal')}</span>
                                    <span className="text-[#1e293b]">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[#64748b]">
                                    <span>{t('cart.shipping')}</span>
                                    <span className={shipping === 0 ? 'text-green-400' : 'text-[#1e293b]'}>
                                        {shipping === 0 ? (language === 'en' ? 'Free' : 'Miễn phí') : formatPrice(shipping)}
                                    </span>
                                </div>
                                {shipping === 0 && (
                                    <div className="flex items-center text-sm text-green-400 bg-green-500/10 px-3 py-2 rounded-lg">
                                        <FiTruck className="mr-2" />
                                        {language === 'en' ? 'You qualify for free shipping!' : 'Bạn được miễn phí vận chuyển!'}
                                    </div>
                                )}
                                {shipping > 0 && (
                                    <div className="text-sm text-[#64748b]">
                                        {language === 'en'
                                            ? `Add ${formatPrice(500000 - subtotal)} more for free shipping`
                                            : `Thêm ${formatPrice(500000 - subtotal)} để được miễn phí vận chuyển`
                                        }
                                    </div>
                                )}

                                <div className="divider" />

                                <div className="flex justify-between text-xl font-bold">
                                    <span className="text-[#1e293b]">{t('cart.total')}</span>
                                    <span className="text-gradient">{formatPrice(total)}</span>
                                </div>
                            </div>

                            <Link to="/checkout" className="btn-primary w-full py-4 text-lg justify-center group">
                                {t('cart.checkout')}
                                <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            {/* Trust badges */}
                            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                                <div className="flex items-center text-sm text-[#64748b]">
                                    <FiShield className="w-4 h-4 mr-2 text-green-400" />
                                    {language === 'en' ? 'Secure checkout with SSL' : 'Thanh toán an toàn SSL'}
                                </div>
                                <div className="flex items-center text-sm text-[#64748b]">
                                    <FiTruck className="w-4 h-4 mr-2 text-primary-400" />
                                    {language === 'en' ? 'Fast delivery 2-3 days' : 'Giao hàng nhanh 2-3 ngày'}
                                </div>
                                <div className="flex items-center text-sm text-[#64748b]">
                                    <FiPercent className="w-4 h-4 mr-2 text-yellow-400" />
                                    {language === 'en' ? 'Best price guaranteed' : 'Đảm bảo giá tốt nhất'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
