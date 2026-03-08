import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiShoppingBag, FiHeart, FiStar, FiCheck, FiPlay, FiShield, FiClock, FiAward } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { productAPI } from '../services/api';

// Service data with icons and colors
const servicesData = [
    { id: 'grooming', icon: <img src="https://images.pexels.com/photos/6131569/pexels-photo-6131569.jpeg" alt="Grooming" className="w-full h-full object-cover rounded-2xl" />, color: 'from-pink-500 to-rose-600', price: '150.000₫' },
    { id: 'vaccination', icon: <img src="https://images.pexels.com/photos/7469213/pexels-photo-7469213.jpeg" alt="Vaccination" className="w-full h-full object-cover rounded-2xl" />, color: 'from-cyan-500 to-blue-600', price: '200.000₫' },
    { id: 'checkup', icon: <img src="https://images.pexels.com/photos/6816836/pexels-photo-6816836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Checkup" className="w-full h-full object-cover rounded-2xl" />, color: 'from-green-500 to-emerald-600', price: '100.000₫' },
    { id: 'surgery', icon: <img src="https://images.pexels.com/photos/18726828/pexels-photo-18726828.jpeg" alt="Surgery" className="w-full h-full object-cover rounded-2xl" />, color: 'from-purple-500 to-violet-600', price: '500.000₫+' },
    { id: 'boarding', icon: <img src="https://images.pexels.com/photos/6821106/pexels-photo-6821106.jpeg" alt="Boarding" className="w-full h-full object-cover rounded-2xl" />, color: 'from-orange-500 to-amber-600', price: '80.000₫/ngày' },
    { id: 'training', icon: <img src="https://images.pexels.com/photos/15322829/pexels-photo-15322829.jpeg" alt="Training" className="w-full h-full object-cover rounded-2xl" />, color: 'from-indigo-500 to-blue-600', price: '300.000₫' },
];

const whyUsData = [
    { icon: FiShield, title: { en: 'Expert Veterinarians', vi: 'Bác sĩ chuyên nghiệp' }, desc: { en: 'Experienced team with 10+ years', vi: 'Đội ngũ giàu kinh nghiệm 10+ năm' }, color: 'text-cyan-400' },
    { icon: FiAward, title: { en: 'Premium Quality', vi: 'Chất lượng cao cấp' }, desc: { en: 'Best products & services', vi: 'Sản phẩm & dịch vụ tốt nhất' }, color: 'text-yellow-400' },
    { icon: FiHeart, title: { en: 'Pet-First Approach', vi: 'Ưu tiên thú cưng' }, desc: { en: 'We treat pets like family', vi: 'Chăm sóc như gia đình' }, color: 'text-pink-400' },
    { icon: FiClock, title: { en: '24/7 Support', vi: 'Hỗ trợ 24/7' }, desc: { en: 'Always here when you need', vi: 'Luôn sẵn sàng khi bạn cần' }, color: 'text-green-400' },
];

const testimonials = [
    { name: 'Nguyễn Minh', avatar: '👩', rating: 5, text: { en: 'Excellent service! My dog loves coming here.', vi: 'Dịch vụ tuyệt vời! Chó của tôi rất thích đến đây.' } },
    { name: 'Trần Hương', avatar: '👨', rating: 5, text: { en: 'Professional staff and great prices.', vi: 'Nhân viên chuyên nghiệp và giá cả hợp lý.' } },
    { name: 'Lê Anh', avatar: '👩‍🦱', rating: 5, text: { en: 'Best pet shop in town!', vi: 'Cửa hàng thú cưng tốt nhất thành phố!' } },
];

// Floating particles component
const Particles = () => (
    <div className="particles-container">
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className="particle"
                style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 15}s`,
                    opacity: Math.random() * 0.5 + 0.2,
                }}
            />
        ))}
    </div>
);

const HomePage = () => {
    const { t, language } = useLanguage();
    const { isDark } = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await productAPI.getFeatured();
                setProducts(response.data.bestselling?.slice(0, 4) || []);
            } catch (error) {
                console.error('Error fetching products:', error);
                setProducts([
                    { _id: '1', name: 'Royal Canin Dog Food', price: 450000, images: [], category: 'food' },
                    { _id: '2', name: 'Whiskas Cat Food', price: 180000, images: [], category: 'food' },
                    { _id: '3', name: 'Premium Dog Collar', price: 150000, images: [], category: 'accessory' },
                    { _id: '4', name: 'Cat Scratching Post', price: 450000, images: [], category: 'accessory' },
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    };

    return (
        <div className="min-h-screen bg-theme transition-colors duration-300">
            <Particles />

            {/* ==================== HERO SECTION ==================== */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: 'url("https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1920&q=80")' }}
                >
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-dark-300/90 via-dark-300/70 to-dark-300/40"></div>
                </div>

                {/* Animated Gradient Orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
                    <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-500/20 blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-secondary-500/20 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                </div>

                <div className="container-custom relative z-10 pt-24 pb-16">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <div className="space-y-8">
                            {/* Badge */}
                            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full glass animate-fade-in">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                </span>
                                <span className="text-sm font-medium text-gray-300">#1 Pet Care Service</span>
                            </div>

                            {/* Main Heading */}
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight animate-fade-in-up">
                                <span className="text-white">{language === 'en' ? 'Your Pet' : 'Thú Cưng'}</span>
                                <br />
                                <span className="text-gradient">{language === 'en' ? 'Deserves The Best' : 'Xứng Đáng Điều Tốt Nhất'}</span>
                            </h1>

                            {/* Description */}
                            <p className="text-xl text-gray-400 leading-relaxed max-w-lg animate-fade-in-up delay-200">
                                {t('home.heroDescription')}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex flex-wrap gap-4 animate-fade-in-up delay-300">
                                <Link to="/booking" className="btn-primary text-lg px-8 py-4 group">
                                    <FiCalendar className="mr-2 w-5 h-5" />
                                    {t('home.bookNow')}
                                    <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link to="/shop" className="btn-glass text-lg px-8 py-4 group">
                                    <FiShoppingBag className="mr-2 w-5 h-5" />
                                    {t('home.exploreShop')}
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-8 pt-6 animate-fade-in-up delay-400">
                                <div className="text-center">
                                    <p className="stats-number">10K+</p>
                                    <p className="text-gray-500 text-sm mt-1">{language === 'en' ? 'Happy Pets' : 'Thú cưng hạnh phúc'}</p>
                                </div>
                                <div className="divider-vertical h-16 hidden sm:block" />
                                <div className="text-center">
                                    <p className="stats-number">50+</p>
                                    <p className="text-gray-500 text-sm mt-1">{language === 'en' ? 'Expert Vets' : 'Bác sĩ thú y'}</p>
                                </div>
                                <div className="divider-vertical h-16 hidden sm:block" />
                                <div className="text-center">
                                    <p className="stats-number">8+</p>
                                    <p className="text-gray-500 text-sm mt-1">{language === 'en' ? 'Years Experience' : 'Năm kinh nghiệm'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Hero Visual */}
                        <div className="relative hidden lg:block animate-fade-in delay-300">
                            <div className="relative w-full aspect-square max-w-lg mx-auto">
                                {/* Main visual */}
                                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-primary-500/30 to-secondary-500/30 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                    <div className="w-full h-full flex items-center justify-center p-8">
                                        <img src="https://images.pexels.com/photos/46024/pexels-photo-46024.jpeg" alt="Happy pets" className="w-full h-full object-cover rounded-[2rem] shadow-2xl animate-float" />
                                    </div>
                                </div>

                                {/* Floating cards */}
                                <div className="absolute -left-8 top-1/4 card-glass p-4 animate-float" style={{ animationDelay: '0.5s' }}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                            <FiCheck className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">{language === 'en' ? 'Verified' : 'Đã xác thực'}</p>
                                            <p className="text-xs text-gray-400">5.0 ⭐ Rating</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute -right-4 bottom-1/3 card-glass p-4 animate-float" style={{ animationDelay: '1.5s' }}>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                                            <FiHeart className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">10,000+</p>
                                            <p className="text-xs text-gray-400">{language === 'en' ? 'Happy Clients' : 'Khách hài lòng'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2">
                        <div className="w-1 h-3 bg-gray-500 rounded-full animate-pulse" />
                    </div>
                </div>
            </section>

            {/* ==================== SERVICES SECTION ==================== */}
            <section className="section relative overflow-hidden">
                {/* Decorative Background Pet Icons */}
                <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-60 overflow-hidden mix-blend-overlay">
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-10 left-[5%] w-20 h-20 rounded-full object-cover transform -rotate-12 animate-float shadow-lg" />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-40 right-[10%] w-16 h-16 rounded-full object-cover transform rotate-45 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-20 left-[20%] w-24 h-24 rounded-full object-cover transform rotate-12 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute -bottom-10 right-[5%] w-32 h-32 rounded-full object-cover transform -rotate-15 animate-float shadow-lg flex" style={{ animationDelay: '3s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-1/2 left-[2%] w-14 h-14 rounded-full object-cover transform rotate-90 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/3 right-[30%] w-20 h-20 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '0.5s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-10 left-[45%] w-16 h-16 rounded-full object-cover transform rotate-180 animate-float shadow-lg" style={{ animationDelay: '2.5s' }} />
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="badge-primary mb-4">{language === 'en' ? 'Our Services' : 'Dịch vụ'}</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                            {t('home.featuredServices')}
                        </h2>
                        <p className="text-xl text-gray-400">{t('home.featuredServicesDesc')}</p>
                    </div>

                    {/* Bento Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {servicesData.map((service, index) => (
                            <div
                                key={service.id}
                                className={`card-glow p-8 group animate-fade-in-up`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300`}>
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-3">
                                    {t(`services.${service.id}`)}
                                </h3>
                                <p className="text-gray-400 mb-4 line-clamp-2">
                                    {t(`services.${service.id}Desc`)}
                                </p>
                                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                    <span className="text-lg font-bold text-gradient">{service.price}</span>
                                    <Link
                                        to={`/booking?service=${service.id}`}
                                        className="flex items-center text-primary-400 hover:text-primary-300 font-medium group-hover:translate-x-1 transition-transform"
                                    >
                                        {t('home.bookNow')} <FiArrowRight className="ml-1" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== PRODUCTS SECTION ==================== */}
            <section className="section relative bg-dark-200/50 overflow-hidden">
                {/* Decorative Background Pet Icons */}
                <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-60 overflow-hidden mix-blend-overlay">
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-20 right-[5%] w-20 h-20 rounded-full object-cover transform rotate-12 animate-float shadow-lg" />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-40 left-[10%] w-16 h-16 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/2 left-[20%] w-24 h-24 rounded-full object-cover transform rotate-12 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-1/4 right-[25%] w-14 h-14 rounded-full object-cover transform -rotate-90 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute bottom-20 right-[15%] w-32 h-32 rounded-full object-cover transform -rotate-15 animate-float shadow-lg flex" style={{ animationDelay: '3s' }} />
                </div>

                <div className="container-custom relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                        <div>
                            <span className="badge-primary mb-4">{language === 'en' ? 'Shop' : 'Cửa hàng'}</span>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                                {t('home.bestSelling')}
                            </h2>
                            <p className="text-xl text-gray-400">{t('home.bestSellingDesc')}</p>
                        </div>
                        <Link to="/shop" className="btn-outline group">
                            {t('home.viewAll')}
                            <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {loading ? (
                            [...Array(4)].map((_, i) => (
                                <div key={i} className="card p-4">
                                    <div className="skeleton h-48 rounded-xl mb-4" />
                                    <div className="skeleton h-6 w-3/4 mb-2" />
                                    <div className="skeleton h-4 w-1/2 mb-4" />
                                    <div className="flex justify-between">
                                        <div className="skeleton h-6 w-20" />
                                        <div className="skeleton h-10 w-24 rounded-lg" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            products.map((product, index) => (
                                <div
                                    key={product._id}
                                    className="card group overflow-hidden animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="product-image-container h-48 flex items-center justify-center">
                                        {product.images?.[0] ? (
                                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-6xl">{product.category === 'food' ? '🍖' : product.category === 'toy' ? '🎾' : '🛍️'}</span>
                                        )}
                                        <button className="absolute top-3 right-3 w-10 h-10 rounded-xl glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-pink-500/20">
                                            <FiHeart className="w-5 h-5 text-gray-400 hover:text-pink-400" />
                                        </button>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-xs text-primary-400 uppercase font-medium mb-1">{product.category}</p>
                                        <h3 className="font-semibold text-white mb-3 line-clamp-2 group-hover:text-primary-400 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-lg font-bold text-gradient">{formatPrice(product.price)}</span>
                                            <Link to={`/shop/${product._id}`} className="btn-primary text-sm px-4 py-2">
                                                {t('shop.addToCart')}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* ==================== WHY CHOOSE US ==================== */}
            <section className="section relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-dark-300 via-primary-900/20 to-dark-300" />

                {/* Decorative Background Pet Icons */}
                <div className="absolute inset-0 pointer-events-none opacity-70 dark:opacity-80 overflow-hidden mix-blend-overlay">
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-10 right-[25%] w-24 h-24 rounded-full object-cover transform rotate-45 animate-float shadow-lg" />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-20 left-[5%] w-20 h-20 rounded-full object-cover transform -rotate-12 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/3 left-[15%] w-16 h-16 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-1/2 right-[10%] w-32 h-32 rounded-full object-cover transform -rotate-15 animate-float shadow-lg flex" style={{ animationDelay: '3s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute bottom-10 right-[35%] w-14 h-14 rounded-full object-cover transform rotate-180 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center mb-16">
                        <span className="badge-primary mb-4">{language === 'en' ? 'Why Us' : 'Tại sao chọn chúng tôi'}</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                            {t('home.whyChooseUs')}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {whyUsData.map((item, index) => (
                            <div
                                key={index}
                                className="card-glass text-center p-8 hover-lift animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className={`w-16 h-16 rounded-2xl glass mx-auto mb-6 flex items-center justify-center ${item.color}`}>
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-2">
                                    {item.title[language]}
                                </h3>
                                <p className="text-gray-400">
                                    {item.desc[language]}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== TESTIMONIALS ==================== */}
            <section className="section overflow-hidden relative" style={{ backgroundColor: '#0B0D17' }}>
                {/* Background Details */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-teal-500/5 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-lime-400/5 rounded-full blur-[120px]"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent"></div>

                    {/* Bioluminescent mushroom/vein image background */}
                    <div className="absolute inset-0 opacity-20 bg-cover bg-center mix-blend-screen" style={{ backgroundImage: 'url("https://images.pexels.com/photos/1054366/pexels-photo-1054366.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2")', filter: 'contrast(1.2) sepia(100%) hue-rotate(150deg) saturate(300%) blur(4px)' }}></div>

                    {/* Decorative Background Pet Icons */}
                    <div className="absolute inset-0 pointer-events-none opacity-50 dark:opacity-60 overflow-hidden mix-blend-overlay">
                        <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-10 left-[10%] w-16 h-16 rounded-full object-cover transform rotate-12 animate-float shadow-lg" />
                        <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/4 right-[15%] w-24 h-24 rounded-full object-cover transform -rotate-12 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                        <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-20 right-[5%] w-20 h-20 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                        <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute bottom-1/3 left-[5%] w-32 h-32 rounded-full object-cover transform rotate-15 animate-float shadow-lg flex" style={{ animationDelay: '3s' }} />
                        <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute top-1/2 left-[30%] w-14 h-14 rounded-full object-cover transform rotate-90 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
                        <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute bottom-10 left-[45%] w-16 h-16 rounded-full object-cover transform rotate-180 animate-float shadow-lg" style={{ animationDelay: '2.5s' }} />
                    </div>

                    {/* Bokeh lights */}
                    <div className="particles-container">
                        {[...Array(15)].map((_, i) => (
                            <div
                                key={`bokeh-${i}`}
                                className="absolute rounded-full bg-teal-200"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    width: `${Math.random() * 6 + 2}px`,
                                    height: `${Math.random() * 6 + 2}px`,
                                    animation: `particle-float ${Math.random() * 20 + 20}s linear infinite`,
                                    animationDelay: `${Math.random() * -30}s`,
                                    opacity: Math.random() * 0.4 + 0.1,
                                    boxShadow: '0 0 10px 2px rgba(45, 212, 191, 0.4)'
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="container-custom relative z-10">
                    <div className="text-center mb-16">
                        <span className="badge-primary mb-4">{language === 'en' ? 'Testimonials' : 'Đánh giá'}</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                            {t('home.testimonials')}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div
                                key={index}
                                className="card-glass-frosted p-8 hover-lift animate-fade-in-up glow-sm"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Stars */}
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <FiStar key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-gray-300 mb-6 italic leading-relaxed">
                                    "{testimonial.text[language]}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center pt-4 border-t border-white/10">
                                    <div className="w-12 h-12 rounded-xl glass flex items-center justify-center text-2xl mr-4">
                                        {testimonial.avatar}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{testimonial.name}</p>
                                        <p className="text-sm text-gray-500">{language === 'en' ? 'Verified Customer' : 'Khách hàng'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== CTA SECTION ==================== */}
            <section className="py-24 relative overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-600 to-accent-600 animate-gradient" />
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />

                <div className="container-custom relative z-10 text-center">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6 animate-fade-in-up">
                        {language === 'en' ? 'Ready to Give Your Pet the Best Care?' : 'Sẵn sàng chăm sóc thú cưng của bạn?'}
                    </h2>
                    <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in-up delay-200">
                        {language === 'en'
                            ? 'Book an appointment today and experience the difference!'
                            : 'Đặt lịch hẹn ngay hôm nay và trải nghiệm sự khác biệt!'}
                    </p>
                    <Link
                        to="/booking"
                        className="inline-flex items-center bg-white text-primary-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:-translate-y-1 animate-fade-in-up delay-400"
                    >
                        {t('home.bookNow')}
                        <FiArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
