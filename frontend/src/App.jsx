import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';

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
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import MyOrdersPage from './pages/MyOrdersPage';

// Scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

// Toast wrapper
const ThemedToaster = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3000,
                style: {
                    background: '#ffffff',
                    color: '#1e293b',
                    borderRadius: '12px',
                    border: '1px solid rgba(0,0,0,0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
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
    return (
        <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col bg-transparent relative">
                
                {/* Global Healthcare Background */}
                <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f0f9ff] via-white to-[#f0f9ff] opacity-90"></div>
                    <div className="absolute top-[10%] left-[60%] w-[50vw] max-w-[600px] h-[50vw] max-h-[600px] rounded-full bg-sky-100/40 blur-[100px]"></div>
                    <div className="absolute top-[60%] left-[10%] w-[60vw] max-w-[800px] h-[60vw] max-h-[800px] rounded-full bg-orange-50/40 blur-[120px]"></div>
                </div>

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
                        <Route path="/my-appointments" element={<MyAppointmentsPage />} />
                        <Route path="/my-orders" element={<MyOrdersPage />} />
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
