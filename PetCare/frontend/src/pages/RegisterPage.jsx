import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiUser, FiPhone, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const { t, language } = useLanguage();
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreeTerms, setAgreeTerms] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    // Password strength checker
    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: '', color: '' };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const levels = [
            { strength: 0, label: '', color: '' },
            { strength: 1, label: language === 'en' ? 'Weak' : 'Yếu', color: 'bg-red-500' },
            { strength: 2, label: language === 'en' ? 'Fair' : 'Trung bình', color: 'bg-yellow-500' },
            { strength: 3, label: language === 'en' ? 'Good' : 'Tốt', color: 'bg-green-500' },
            { strength: 4, label: language === 'en' ? 'Strong' : 'Mạnh', color: 'bg-primary-500' },
        ];
        return levels[strength];
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError(language === 'en' ? 'Passwords do not match' : 'Mật khẩu không khớp');
            return;
        }

        if (!agreeTerms) {
            setError(language === 'en' ? 'Please agree to the terms' : 'Vui lòng đồng ý điều khoản');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
            });

            if (result.success) {
                toast.success(language === 'en' ? 'Account created successfully!' : 'Tạo tài khoản thành công!');
                navigate('/');
            } else {
                setError(result.message || (language === 'en' ? 'Registration failed' : 'Đăng ký thất bại'));
            }
        } catch (err) {
            setError(language === 'en' ? 'An error occurred' : 'Đã xảy ra lỗi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-300 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-secondary-500/20 blur-[120px]" />
                <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary-500/20 blur-[120px]" />
            </div>

            <div className="w-full max-w-md relative z-10 py-8">
                {/* Logo */}
                <div className="text-center mb-8 animate-fade-in-down">
                    <Link to="/" className="inline-flex items-center space-x-3 group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center transform group-hover:scale-110 transition-transform">
                            <span className="text-2xl">🐾</span>
                        </div>
                        <span className="text-2xl font-display font-bold text-gradient">Pet Care Pro</span>
                    </Link>
                </div>

                {/* Register Card */}
                <div className="card-glass p-8 animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-display font-bold text-white mb-2">
                            {t('register.title')}
                        </h1>
                        <p className="text-gray-400">
                            {language === 'en' ? 'Create your account to get started' : 'Tạo tài khoản để bắt đầu'}
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-3 animate-fade-in">
                            <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('register.name')}
                            </label>
                            <div className="relative">
                                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input pl-12"
                                    placeholder={language === 'en' ? 'John Doe' : 'Nguyễn Văn A'}
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('register.email')}
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
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

                        {/* Phone Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('register.phone')}
                            </label>
                            <div className="relative">
                                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="input pl-12"
                                    placeholder="0912 345 678"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('register.password')}
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="input pl-12 pr-12"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength.strength ? passwordStrength.color : 'bg-gray-700'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {language === 'en' ? 'Password strength:' : 'Độ mạnh:'} <span className={passwordStrength.color.replace('bg-', 'text-')}>{passwordStrength.label}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {t('register.confirmPassword')}
                            </label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`input pl-12 pr-12 ${formData.confirmPassword && formData.password !== formData.confirmPassword
                                            ? 'border-red-500 focus:border-red-500'
                                            : formData.confirmPassword && formData.password === formData.confirmPassword
                                                ? 'border-green-500 focus:border-green-500'
                                                : ''
                                        }`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                                </button>
                            </div>
                            {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p className="mt-1 text-xs text-green-400 flex items-center">
                                    <FiCheck className="mr-1" />
                                    {language === 'en' ? 'Passwords match' : 'Mật khẩu khớp'}
                                </p>
                            )}
                        </div>

                        {/* Terms Checkbox */}
                        <label className="flex items-start space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="mt-1 w-4 h-4 rounded border-gray-600 bg-white/5 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                            />
                            <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                {language === 'en' ? (
                                    <>I agree to the <Link to="/terms" className="text-primary-400 hover:text-primary-300">Terms of Service</Link> and <Link to="/privacy" className="text-primary-400 hover:text-primary-300">Privacy Policy</Link></>
                                ) : (
                                    <>Tôi đồng ý với <Link to="/terms" className="text-primary-400 hover:text-primary-300">Điều khoản dịch vụ</Link> và <Link to="/privacy" className="text-primary-400 hover:text-primary-300">Chính sách bảo mật</Link></>
                                )}
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading || !agreeTerms}
                            className="btn-primary w-full py-4 text-lg group"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {t('register.submit')}
                                    <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="divider" />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-dark-100 px-4 text-sm text-gray-500">
                            {language === 'en' ? 'or continue with' : 'hoặc tiếp tục với'}
                        </span>
                    </div>

                    {/* Social Login */}
                    <button className="btn-glass w-full py-4 group">
                        <FcGoogle className="w-5 h-5 mr-3" />
                        <span className="text-gray-300 group-hover:text-white transition-colors">
                            {language === 'en' ? 'Continue with Google' : 'Tiếp tục với Google'}
                        </span>
                    </button>

                    {/* Login Link */}
                    <p className="text-center text-gray-400 mt-8">
                        {t('register.hasAccount')}{' '}
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                            {t('register.loginLink')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
