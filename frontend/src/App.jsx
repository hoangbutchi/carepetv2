import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BookingPage from './pages/BookingPage';
import MyPetsPage from './pages/MyPetsPage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';
import DoctorsPage from './pages/DoctorsPage';
import NewsPage from './pages/NewsPage';
import ChatPage from './pages/ChatPage';
import PaymentResultPage from './pages/PaymentResultPage';

// Scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

// Toast wrapper to use theme
const ThemedToaster = () => {
    const { isDark } = useTheme();

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: isDark ? '#1a1a2e' : '#ffffff',
                    color: isDark ? '#fff' : '#1e293b',
                    borderRadius: '12px',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 4px 20px rgba(0,0,0,0.1)',
                },
                success: {
                    iconTheme: {
                        primary: '#10B981',
                        secondary: '#fff',
                    },
                },
                error: {
                    iconTheme: {
                        primary: '#EF4444',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
};

// Main App content
const AppContent = () => {
    const { isDark } = useTheme();
    return (
        <Router>
            <ScrollToTop />
            <div className={`min-h-screen flex flex-col ${isDark ? 'bg-theme' : 'bg-transparent'} transition-colors duration-300 relative`}>
                
                {/* Global Light Mode Organic Background */}
                {!isDark && (
                    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                        {/* Porcelain White to Mint to Sky Blue Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white via-[#f0fdf4] to-[#f0f9ff] opacity-90"></div>
                        
                        {/* Abstract floating pastel circles */}
                        <div className="absolute top-[10%] left-[60%] w-[50vw] max-w-[600px] h-[50vw] max-h-[600px] rounded-full bg-emerald-100/60 blur-[100px] animate-pulse-slow"></div>
                        <div className="absolute top-[60%] left-[10%] w-[60vw] max-w-[800px] h-[60vw] max-h-[800px] rounded-full bg-sky-200/50 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                        
                        {/* High blur Monstera / Leaves in corners */}
                        <div 
                            className="absolute -top-[10%] -left-[5%] w-[40vw] max-w-[500px] h-[40vw] max-h-[500px] rounded-full mix-blend-multiply opacity-30 blur-[12px] transform rotate-12"
                            style={{ backgroundImage: 'url("https://images.pexels.com/photos/3125132/pexels-photo-3125132.jpeg?auto=compress&cs=tinysrgb&w=800")', backgroundSize: 'cover' }}
                        ></div>
                        <div 
                            className="absolute -bottom-[10%] -right-[5%] w-[50vw] max-w-[600px] h-[50vw] max-h-[600px] rounded-full mix-blend-multiply opacity-25 blur-[16px] transform -rotate-15"
                            style={{ backgroundImage: 'url("https://images.pexels.com/photos/3125132/pexels-photo-3125132.jpeg?auto=compress&cs=tinysrgb&w=800")', backgroundSize: 'cover' }}
                        ></div>
                    </div>
                )}
                <Navbar />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/booking" element={<BookingPage />} />
                        <Route path="/my-pets" element={<MyPetsPage />} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/shop/:id" element={<ProductDetailPage />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/dashboard" element={<AdminDashboard />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/doctors" element={<DoctorsPage />} />
                        <Route path="/news" element={<NewsPage />} />
                        <Route path="/news/:id" element={<NewsPage />} />
                        <Route path="/chat" element={<ChatPage />} />
                        <Route path="/payment-result" element={<PaymentResultPage />} />
                    </Routes>
                </main>
                <Footer />
            </div>
            <ThemedToaster />
        </Router>
    );
};

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AuthProvider>
                    <CartProvider>
                        <AppContent />
                    </CartProvider>
                </AuthProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;
