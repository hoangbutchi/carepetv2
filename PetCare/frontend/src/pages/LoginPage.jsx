import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const { t, language } = useLanguage();
    const { login } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await login(formData.email, formData.password);
            if (result.success) {
                toast.success(language === 'en' ? 'Welcome back!' : 'Chào mừng trở lại!');
                navigate('/');
            } else {
                setError(result.message || (language === 'en' ? 'Login failed' : 'Đăng nhập thất bại'));
            }
        } catch (err) {
            setError(language === 'en' ? 'An error occurred' : 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-theme flex items-center justify-center p-4 pt-24 relative overflow-hidden transition-colors duration-300">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-primary-500/20' : 'bg-primary-500/10'
                    }`} />
                <div className={`absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[120px] ${isDark ? 'bg-secondary-500/20' : 'bg-secondary-500/10'
                    }`} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in-down">
                    <Link to="/" className="inline-flex items-center space-x-3 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🐾</span>
                        </div>
                        <span className="text-2xl font-display font-bold text-gradient">Pet Care Pro</span>
                    </Link>
                </div>

                {/* Login Card */}
                <div className="card-glass p-8 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold text-theme mb-2">
                            {language === 'en' ? 'Welcome Back' : 'Chào Mừng Trở Lại'}
                        </h1>
                        <p className="text-theme-secondary">
                            {language === 'en' ? 'Please enter your details to sign in.' : 'Vui lòng nhập thông tin đăng nhập.'}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 animate-fade-in">
                            <FiAlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-red-500 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">
                                {language === 'en' ? 'Email' : 'Email'}
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="input pl-12"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-theme-secondary mb-2">
                                {language === 'en' ? 'Password' : 'Mật khẩu'}
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-12 pr-12"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-muted hover:text-theme transition-colors"
                                >
                                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center space-x-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-400 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                                />
                                <span className="text-sm text-theme-secondary group-hover:text-theme transition-colors">
                                    {language === 'en' ? 'Remember me' : 'Ghi nhớ đăng nhập'}
                                </span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-400 transition-colors">
                                {language === 'en' ? 'Forgot password?' : 'Quên mật khẩu?'}
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 text-lg group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {language === 'en' ? 'Sign In' : 'Đăng Nhập'}
                                    <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="divider" />
                        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-sm text-theme-muted ${isDark ? 'bg-dark-200' : 'bg-white'
                            }`}>
                            {language === 'en' ? 'or continue with' : 'hoặc tiếp tục với'}
                        </span>
                    </div>

                    {/* Social Login */}
                    <button className="btn-glass w-full py-4 group">
                        <FcGoogle className="w-5 h-5 mr-3" />
                        <span className="text-theme-secondary group-hover:text-theme transition-colors">
                            {language === 'en' ? 'Continue with Google' : 'Tiếp tục với Google'}
                        </span>
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-theme-secondary mt-8">
                        {language === 'en' ? "Don't have an account?" : 'Chưa có tài khoản?'}{' '}
                        <Link to="/register" className="text-primary-500 hover:text-primary-400 font-medium transition-colors">
                            {language === 'en' ? 'Sign up' : 'Đăng ký'}
                        </Link>
                    </p>
                </div>

                {/* Demo Accounts */}
                <div className={`mt-6 p-4 rounded-xl border animate-fade-in-up delay-200 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'
                    }`}>
                    <p className="text-sm text-theme-secondary mb-3 text-center font-medium">
                        {language === 'en' ? '🔐 Demo Accounts' : '🔐 Tài khoản demo'}
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs">
                        <div className={`flex justify-between items-center p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'
                            }`}>
                            <span className="text-theme-muted">Admin:</span>
                            <code className="text-primary-500">admin@petcare.com / 123456</code>
                        </div>
                        <div className={`flex justify-between items-center p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'
                            }`}>
                            <span className="text-theme-muted">Bác sĩ:</span>
                            <code className="text-secondary-500">doctor1@petcare.com / 123456</code>
                        </div>
                        <div className={`flex justify-between items-center p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'
                            }`}>
                            <span className="text-theme-muted">Khách hàng:</span>
                            <code className="text-accent-500">customer1@gmail.com / 123456</code>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
