import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiHeart, FiArrowUp } from 'react-icons/fi';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

const Footer = () => {
    const { language } = useLanguage();
    const { isDark } = useTheme();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const footerLinks = {
        services: [
            { name: language === 'en' ? 'Pet Grooming' : 'Làm đẹp thú cưng', path: '/booking?service=grooming' },
            { name: language === 'en' ? 'Vaccination' : 'Tiêm phòng', path: '/booking?service=vaccination' },
            { name: language === 'en' ? 'Health Checkup' : 'Khám sức khỏe', path: '/booking?service=checkup' },
            { name: language === 'en' ? 'Pet Boarding' : 'Trông giữ thú cưng', path: '/booking?service=boarding' },
            { name: language === 'en' ? 'Training' : 'Huấn luyện', path: '/booking?service=training' },
        ],
        shop: [
            { name: language === 'en' ? 'Dog Food' : 'Thức ăn cho chó', path: '/shop?category=food' },
            { name: language === 'en' ? 'Cat Food' : 'Thức ăn cho mèo', path: '/shop?category=food' },
            { name: language === 'en' ? 'Accessories' : 'Phụ kiện', path: '/shop?category=accessory' },
            { name: language === 'en' ? 'Toys' : 'Đồ chơi', path: '/shop?category=toy' },
            { name: language === 'en' ? 'Health Care' : 'Chăm sóc sức khỏe', path: '/shop?category=medicine' },
        ],
        support: [
            { name: language === 'en' ? 'About Us' : 'Về chúng tôi', path: '/about' },
            { name: language === 'en' ? 'Contact' : 'Liên hệ', path: '/contact' },
            { name: language === 'en' ? 'FAQs' : 'Câu hỏi thường gặp', path: '/faqs' },
            { name: language === 'en' ? 'Privacy Policy' : 'Chính sách bảo mật', path: '/privacy' },
            { name: language === 'en' ? 'Terms of Service' : 'Điều khoản dịch vụ', path: '/terms' },
        ],
    };

    const socialLinks = [
        { icon: FiFacebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-500' },
        { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-500' },
        { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-cyan-400' },
        { icon: FiYoutube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-500' },
    ];

    return (
        <footer className={`relative pt-20 pb-8 transition-colors duration-300 ${isDark ? 'bg-dark-200' : 'bg-gray-100'
            }`}>
            {/* Wave Divider */}
            <div className="absolute top-0 left-0 right-0 overflow-hidden">
                <svg
                    className="relative block w-full h-12"
                    viewBox="0 0 1200 120"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        className={isDark ? 'fill-dark-300' : 'fill-gray-50'}
                    />
                </svg>
            </div>

            <div className="container-custom">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center space-x-3 mb-6 group">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-2xl">🐾</span>
                                </div>
                                <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-50 blur-lg transition-opacity duration-300" />
                            </div>
                            <span className="text-2xl font-display font-bold text-gradient">
                                Pet Care Pro
                            </span>
                        </Link>
                        <p className="text-theme-secondary mb-6 max-w-md leading-relaxed">
                            {language === 'en'
                                ? 'Your trusted partner in pet care. We provide comprehensive veterinary services, premium pet products, and loving care for your furry friends.'
                                : 'Đối tác đáng tin cậy trong việc chăm sóc thú cưng. Chúng tôi cung cấp dịch vụ thú y toàn diện, sản phẩm thú cưng cao cấp và sự chăm sóc yêu thương cho các bé cưng của bạn.'}
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-3">
                            <a href="tel:+84123456789" className="flex items-center space-x-3 text-theme-secondary hover:text-primary-500 transition-colors group">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors ${isDark ? 'bg-white/5' : 'bg-gray-200'
                                    }`}>
                                    <FiPhone className="w-4 h-4" />
                                </div>
                                <span>+84 123 456 789</span>
                            </a>
                            <a href="mailto:contact@petcarepro.com" className="flex items-center space-x-3 text-theme-secondary hover:text-primary-500 transition-colors group">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors ${isDark ? 'bg-white/5' : 'bg-gray-200'
                                    }`}>
                                    <FiMail className="w-4 h-4" />
                                </div>
                                <span>contact@petcarepro.com</span>
                            </a>
                            <div className="flex items-center space-x-3 text-theme-secondary">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-200'
                                    }`}>
                                    <FiMapPin className="w-4 h-4" />
                                </div>
                                <span>{language === 'en' ? '123 Pet Street, District 1, HCMC' : '123 Đường Thú Cưng, Quận 1, TP.HCM'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Services Links */}
                    <div>
                        <h3 className="text-theme font-semibold text-lg mb-6">
                            {language === 'en' ? 'Services' : 'Dịch vụ'}
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.services.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-theme-secondary hover:text-primary-500 transition-colors duration-300 hover:translate-x-1 inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h3 className="text-theme font-semibold text-lg mb-6">
                            {language === 'en' ? 'Shop' : 'Cửa hàng'}
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-theme-secondary hover:text-primary-500 transition-colors duration-300 hover:translate-x-1 inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-theme font-semibold text-lg mb-6">
                            {language === 'en' ? 'Support' : 'Hỗ trợ'}
                        </h3>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.path}
                                        className="text-theme-secondary hover:text-primary-500 transition-colors duration-300 hover:translate-x-1 inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="card-glass p-8 mb-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-xl font-semibold text-theme mb-2">
                                {language === 'en' ? 'Subscribe to our Newsletter' : 'Đăng ký nhận tin'}
                            </h3>
                            <p className="text-theme-secondary">
                                {language === 'en'
                                    ? 'Get the latest updates on new products and upcoming sales.'
                                    : 'Nhận thông tin mới nhất về sản phẩm và khuyến mãi.'}
                            </p>
                        </div>
                        <div className="flex w-full md:w-auto gap-3">
                            <input
                                type="email"
                                placeholder={language === 'en' ? 'Enter your email' : 'Nhập email của bạn'}
                                className="input flex-1 md:w-64"
                            />
                            <button className="btn-primary whitespace-nowrap">
                                {language === 'en' ? 'Subscribe' : 'Đăng ký'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className={`flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t ${isDark ? 'border-white/10' : 'border-gray-200'
                    }`}>
                    {/* Copyright */}
                    <p className="text-theme-muted text-sm flex items-center">
                        © 2026 Pet Care Pro. {language === 'en' ? 'Made with' : 'Làm với'}
                        <FiHeart className="w-4 h-4 mx-1 text-red-500" />
                        {language === 'en' ? 'for pets' : 'cho thú cưng'}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center space-x-4">
                        {socialLinks.map((social, index) => (
                            <a
                                key={index}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-theme-secondary ${social.color} transition-all duration-300 ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-200 hover:bg-gray-300'
                                    }`}
                                aria-label={social.label}
                            >
                                <social.icon className="w-5 h-5" />
                            </a>
                        ))}
                    </div>

                    {/* Back to Top */}
                    <button
                        onClick={scrollToTop}
                        className="flex items-center space-x-2 text-theme-secondary hover:text-primary-500 transition-colors group"
                    >
                        <span className="text-sm">{language === 'en' ? 'Back to top' : 'Về đầu trang'}</span>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-primary-500/20 transition-colors ${isDark ? 'bg-white/5' : 'bg-gray-200'
                            }`}>
                            <FiArrowUp className="w-4 h-4" />
                        </div>
                    </button>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
