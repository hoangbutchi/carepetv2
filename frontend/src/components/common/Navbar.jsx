import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiShoppingCart, FiChevronDown, FiGlobe, FiMessageCircle, FiUser, FiLogOut, FiHeart, FiSun, FiMoon, FiCalendar } from 'react-icons/fi';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

import { useTheme } from '../../context/ThemeContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const { t, language, toggleLanguage } = useLanguage();
    const { user, isAuthenticated, isStaff, logout } = useAuth();
    const { cartCount } = useCart();
    const { theme, toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (userMenuOpen && !e.target.closest('.user-menu-container')) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [userMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate('/');
        setUserMenuOpen(false);
    };

    // Navigation links based on role
    const customerLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.doctors'), path: '/doctors' },
        { name: t('nav.shop'), path: '/shop' },
        { name: t('nav.news'), path: '/news' },
        { name: t('nav.booking'), path: '/booking' },
    ];

    const staffLinks = [
        { name: t('nav.dashboard'), path: '/dashboard' },
        { name: t('nav.news'), path: '/news' },
    ];

    const navLinks = isStaff ? staffLinks : customerLinks;

    const isActiveLink = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'navbar-glass shadow-lg' : 'bg-transparent'
            }`}>
            <div className="container-custom">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link
                        to={isStaff ? '/dashboard' : '/'}
                        className="flex items-center space-x-3 group"
                    >
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-[#00adef] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-md">
                                <span className="text-xl">🐾</span>
                            </div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-[#00adef] hidden sm:block">
                            PetCare<span className="text-[#1e293b]">Pro</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden xl:flex items-center space-x-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 ${isActiveLink(link.path)
                                    ? 'text-primary-500'
                                    : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                    }`}
                            >
                                {link.name}
                                {isActiveLink(link.path) && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                                )}
                            </Link>
                        ))}

                        {/* My Appointments & My Pets - only for customers */}
                        {isAuthenticated && !isStaff && (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/my-appointments"
                                    className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 ${isActiveLink('/my-appointments')
                                        ? 'text-primary-500'
                                        : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                        }`}
                                >
                                    {t('nav.myAppointments')}
                                    {isActiveLink('/my-appointments') && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                                    )}
                                </Link>
                                <Link
                                    to="/my-pets"
                                    className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 ${isActiveLink('/my-pets')
                                        ? 'text-primary-500'
                                        : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                        }`}
                                >
                                    {t('nav.myPets')}
                                    {isActiveLink('/my-pets') && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                                    )}
                                </Link>
                                <Link
                                    to="/my-orders"
                                    className={`relative px-3 py-2 rounded-lg font-medium transition-all duration-300 ${isActiveLink('/my-orders')
                                        ? 'text-primary-500'
                                        : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                        }`}
                                >
                                    {t('nav.myOrders')}
                                    {isActiveLink('/my-orders') && (
                                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                                    )}
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Right Section */}
                    <div className="hidden md:flex items-center space-x-3">

                        {/* Language Toggle */}
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-all duration-300"
                            title={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang Tiếng Anh'}
                        >
                            <FiGlobe className="w-5 h-5" />
                            <span className="text-sm font-medium uppercase">{language}</span>
                        </button>

                        {/* Cart - only for customers */}
                        {!isStaff && (
                            <Link
                                to="/cart"
                                className="relative p-2.5 rounded-lg text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-all duration-300"
                            >
                                <FiShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold text-[#1e293b] rounded-full bg-gradient-secondary animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {/* Chat - for authenticated users */}
                        {isAuthenticated && (
                            <Link
                                to="/chat"
                                className="p-2.5 rounded-lg text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-all duration-300"
                                title={language === 'en' ? 'Chat' : 'Tin nhắn'}
                            >
                                <FiMessageCircle className="w-5 h-5" />
                            </Link>
                        )}

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative user-menu-container">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setUserMenuOpen(!userMenuOpen);
                                    }}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-theme-tertiary transition-all duration-300"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                                        <span className="text-[#1e293b] text-sm font-semibold">
                                            {user?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <span className="text-theme-secondary font-medium hidden lg:block">
                                        {user?.name?.split(' ')[0]}
                                    </span>
                                    <FiChevronDown className={`w-4 h-4 text-theme-muted transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl card-glass shadow-2xl py-2 animate-fade-in-down">
                                        <div className="px-4 py-3 border-b border-theme">
                                            <p className="text-sm text-theme-muted">Đăng nhập với</p>
                                            <p className="font-medium text-theme truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center space-x-3 px-4 py-3 text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-colors"
                                        >
                                            <FiUser className="w-4 h-4" />
                                            <span>{t('nav.profile')}</span>
                                        </Link>

                                        {!isStaff && (
                                            <>
                                                <Link
                                                    to="/my-appointments"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center space-x-3 px-4 py-3 text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-colors"
                                                >
                                                    <FiCalendar className="w-4 h-4" />
                                                    <span>{t('nav.myAppointments')}</span>
                                                </Link>
                                                <Link
                                                    to="/my-orders"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center space-x-3 px-4 py-3 text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-colors"
                                                >
                                                    <FiPackage className="w-4 h-4" />
                                                    <span>{t('nav.myOrders')}</span>
                                                </Link>
                                                <Link
                                                    to="/my-pets"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center space-x-3 px-4 py-3 text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-colors"
                                                >
                                                    <FiHeart className="w-4 h-4" />
                                                    <span>{t('nav.myPets')}</span>
                                                </Link>
                                            </>
                                        )}

                                        <div className="border-t border-theme mt-2 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            >
                                                <FiLogOut className="w-4 h-4" />
                                                <span>{t('nav.logout')}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="btn-ghost text-sm">
                                    {t('nav.login')}
                                </Link>
                                <Link to="/register" className="btn-primary text-sm">
                                    {t('nav.register')}
                                </Link>
                            </div>
                        )}
                    </div>


                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-2 md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-all duration-300"
                        >
                            {isOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden py-4 border-t border-theme animate-fade-in-down">
                        <div className="flex flex-col space-y-1">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActiveLink(link.path)
                                        ? 'text-primary-500 bg-primary-500/10'
                                        : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}

                             {isAuthenticated && !isStaff && (
                                <>
                                    <Link
                                        to="/my-appointments"
                                        onClick={() => setIsOpen(false)}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActiveLink('/my-appointments')
                                            ? 'text-primary-500 bg-primary-500/10'
                                            : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                            }`}
                                    >
                                        <span>{t('nav.myAppointments')}</span>
                                    </Link>
                                    <Link
                                        to="/my-orders"
                                        onClick={() => setIsOpen(false)}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActiveLink('/my-orders')
                                            ? 'text-primary-500 bg-primary-500/10'
                                            : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                            }`}
                                    >
                                        {t('nav.myOrders')}
                                    </Link>
                                    <Link
                                        to="/my-pets"
                                        onClick={() => setIsOpen(false)}
                                        className={`px-4 py-3 rounded-lg font-medium transition-all duration-300 ${isActiveLink('/my-pets')
                                            ? 'text-primary-500 bg-primary-500/10'
                                            : 'text-theme-secondary hover:text-theme hover:bg-theme-tertiary'
                                            }`}
                                    >
                                        {t('nav.myPets')}
                                    </Link>
                                </>
                            )}

                            <div className="divider my-3" />

                            {/* Mobile Language & Cart */}
                            <div className="flex items-center justify-between px-4 py-2">
                                <button
                                    onClick={toggleLanguage}
                                    className="flex items-center space-x-2 text-theme-secondary hover:text-theme transition-colors"
                                >
                                    <FiGlobe className="w-5 h-5" />
                                    <span>{language === 'en' ? 'Tiếng Việt' : 'English'}</span>
                                </button>

                                {!isStaff && (
                                    <Link
                                        to="/cart"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center space-x-2 text-theme-secondary hover:text-theme transition-colors"
                                    >
                                        <FiShoppingCart className="w-5 h-5" />
                                        {cartCount > 0 && (
                                            <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full bg-gradient-secondary">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                )}
                            </div>

                            <div className="divider my-3" />

                            {isAuthenticated ? (
                                <>
                                    <div className="px-4 py-3 rounded-lg bg-theme-tertiary">
                                        <p className="text-sm text-theme-muted">Đăng nhập với</p>
                                        <p className="font-medium text-theme">{user?.name}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        onClick={() => setIsOpen(false)}
                                        className="px-4 py-3 rounded-lg text-theme-secondary hover:text-theme hover:bg-theme-tertiary transition-all"
                                    >
                                        {t('nav.profile')}
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsOpen(false);
                                        }}
                                        className="px-4 py-3 rounded-lg text-left text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                    >
                                        {t('nav.logout')}
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col space-y-2 px-4 pt-2">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="btn-outline w-full justify-center"
                                    >
                                        {t('nav.login')}
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setIsOpen(false)}
                                        className="btn-primary w-full justify-center"
                                    >
                                        {t('nav.register')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
