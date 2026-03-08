import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiPackage, FiDollarSign, FiTrendingUp, FiClock, FiCheck, FiX, FiShoppingBag, FiGrid, FiFileText, FiUsers, FiFilter } from 'react-icons/fi';
import { format, addDays, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { appointmentAPI, orderAPI, authAPI } from '../services/api';
import { Badge, Spinner, EmptyState } from '../components/common/UI';
import ProductManagement from '../components/admin/ProductManagement';
import ArticleManagement from '../components/admin/ArticleManagement';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const { t, language } = useLanguage();
    const { user, isStaff, isAdmin } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [isDateFilterActive, setIsDateFilterActive] = useState(false); // Whether date filter is being used
    const [appointments, setAppointments] = useState([]);
    const [orderStats, setOrderStats] = useState({ today: {}, month: {}, pending: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointmentStats, setAppointmentStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
    const [appointmentFilter, setAppointmentFilter] = useState('all'); // 'all' or 'pending'

    useEffect(() => {
        if (!isStaff) {
            navigate('/');
            return;
        }
        fetchData();
    }, [isStaff, navigate, selectedDate, isDateFilterActive]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch appointments - either by date or all
            let appointmentsRes;
            if (isDateFilterActive) {
                appointmentsRes = await appointmentAPI.getByDate(selectedDate);
            } else {
                // Fetch all appointments (no date filter)
                appointmentsRes = await appointmentAPI.getAll();
            }
            let filteredAppointments = appointmentsRes.data.appointments || [];

            // Note: Backend already filters appointments by role (Staff sees their own, Admin sees all)
            // No additional frontend filtering needed

            setAppointments(filteredAppointments);
            setAppointmentStats(calculateStats(filteredAppointments));

            // Fetch orders
            const [statsRes, ordersRes] = await Promise.all([
                orderAPI.getStats(),
                orderAPI.getAll({ limit: 10 }),
            ]);
            setOrderStats(statsRes.data.stats || { today: {}, month: {}, pending: 0 });
            setRecentOrders(ordersRes.data.orders || []);
            setAllOrders(ordersRes.data.orders || []);

            // Fetch doctors (admin only)
            if (isAdmin) {
                try {
                    const doctorsRes = await authAPI.getDoctors();
                    setDoctors(doctorsRes.data?.staff || doctorsRes.data?.doctors || doctorsRes.data || []);
                } catch (err) {
                    console.error('Error fetching doctors:', err);
                    // Set mock doctors for demo
                    setDoctors([
                        { _id: '1', name: 'BS. Nguyễn Văn An', email: 'doctor1@petcare.com', phone: '0901234568', specialization: 'Nội khoa thú cưng', experience: 8 },
                        { _id: '2', name: 'BS. Trần Thị Bình', email: 'doctor2@petcare.com', phone: '0901234569', specialization: 'Phẫu thuật thú cưng', experience: 12 },
                        { _id: '3', name: 'BS. Lê Minh Hoàng', email: 'doctor3@petcare.com', phone: '0901234570', specialization: 'Da liễu thú cưng', experience: 6 },
                        { _id: '4', name: 'BS. Phạm Thị Dung', email: 'doctor4@petcare.com', phone: '0901234571', specialization: 'Nha khoa thú cưng', experience: 9 },
                        { _id: '5', name: 'BS. Vũ Đức Khang', email: 'doctor5@petcare.com', phone: '0901234572', specialization: 'Cấp cứu & Hồi sức', experience: 15 },
                        { _id: '6', name: 'BS. Hồ Thanh Trúc', email: 'doctor6@petcare.com', phone: '0901234573', specialization: 'Dinh dưỡng & Tiêm phòng', experience: 5 },
                        { _id: '7', name: 'BS. Lê Thị Tú Anh', email: 'doctor7@petcare.com', phone: '0901234574', specialization: 'Chăm sóc răng miệng', experience: 4 },
                        { _id: '8', name: 'BS. Ngô Minh Nhật', email: 'doctor8@petcare.com', phone: '0901234575', specialization: 'Khám tổng quát', experience: 7 },
                        { _id: '9', name: 'BS. Trần Phúc', email: 'doctor9@petcare.com', phone: '0901234576', specialization: 'Xét nghiệm thú y', experience: 11 },
                        { _id: '10', name: 'BS. Đào Thu Hương', email: 'doctor10@petcare.com', phone: '0901234577', specialization: 'Nhãn khoa thú cưng', experience: 8 },
                        { _id: '11', name: 'BS. Lương Tuấn Anh', email: 'doctor11@petcare.com', phone: '0901234578', specialization: 'Thú y chim cảnh', experience: 6 },
                        { _id: '12', name: 'BS. Nguyễn Bảo Ngọc', email: 'doctor12@petcare.com', phone: '0901234579', specialization: 'Tai mũi họng', experience: 5 }
                    ]);
                }
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // Use mock data for demo
            setMockData();
        } finally {
            setLoading(false);
        }
    };

    const setMockData = () => {
        const mockAppointments = [
            { _id: '1', service: 'grooming', timeSlot: '09:00-10:00', status: 'confirmed', customer: { name: 'Nguyễn Văn A' }, pet: { name: 'Buddy', species: 'dog' }, staff: { _id: user?._id, name: 'BS. Nguyễn' }, date: selectedDate },
            { _id: '2', service: 'vaccination', timeSlot: '10:00-11:00', status: 'pending', customer: { name: 'Trần Thị B' }, pet: { name: 'Mèo Mun', species: 'cat' }, staff: { _id: user?._id, name: 'BS. Nguyễn' }, date: selectedDate },
            { _id: '3', service: 'checkup', timeSlot: '14:00-15:00', status: 'confirmed', customer: { name: 'Lê Văn C' }, pet: { name: 'Lucky', species: 'dog' }, staff: { _id: '999', name: 'BS. Trần' }, date: selectedDate },
        ];

        // Filter by role
        const filtered = isAdmin ? mockAppointments : mockAppointments.filter(apt => apt.staff._id === user?._id);
        setAppointments(filtered);
        setAppointmentStats(calculateStats(filtered));

        setOrderStats({
            today: { orders: 5, revenue: 2500000 },
            month: { orders: 120, revenue: 45000000 },
            pending: 12,
        });
        setRecentOrders([
            { _id: '1', orderNumber: 'PMS2601001', totalAmount: 650000, orderStatus: 'pending', paymentStatus: 'pending', customer: { name: 'Nguyễn Văn A' }, createdAt: new Date() },
            { _id: '2', orderNumber: 'PMS2601002', totalAmount: 320000, orderStatus: 'processing', paymentStatus: 'paid', customer: { name: 'Trần Thị B' }, createdAt: new Date() },
            { _id: '3', orderNumber: 'PMS2601003', totalAmount: 480000, orderStatus: 'shipping', paymentStatus: 'paid', customer: { name: 'Lê Văn C' }, createdAt: new Date() },
        ]);
        setAllOrders([
            { _id: '1', orderNumber: 'PMS2601001', totalAmount: 650000, orderStatus: 'pending', paymentStatus: 'pending', customer: { name: 'Nguyễn Văn A' }, createdAt: new Date(), items: [] },
            { _id: '2', orderNumber: 'PMS2601002', totalAmount: 320000, orderStatus: 'processing', paymentStatus: 'paid', customer: { name: 'Trần Thị B' }, createdAt: new Date(), items: [] },
            { _id: '3', orderNumber: 'PMS2601003', totalAmount: 480000, orderStatus: 'shipping', paymentStatus: 'paid', customer: { name: 'Lê Văn C' }, createdAt: new Date(), items: [] },
            { _id: '4', orderNumber: 'PMS2601004', totalAmount: 890000, orderStatus: 'delivered', paymentStatus: 'paid', customer: { name: 'Phạm Minh D' }, createdAt: new Date(), items: [] },
        ]);
        setDoctors([
            { _id: '1', name: 'BS. Nguyễn Văn An', email: 'doctor1@petcare.com', phone: '0901234568', specialization: 'Nội khoa thú cưng', experience: 8 },
            { _id: '2', name: 'BS. Trần Thị Bình', email: 'doctor2@petcare.com', phone: '0901234569', specialization: 'Phẫu thuật thú cưng', experience: 12 },
            { _id: '3', name: 'BS. Lê Minh Hoàng', email: 'doctor3@petcare.com', phone: '0901234570', specialization: 'Da liễu thú cưng', experience: 6 },
            { _id: '4', name: 'BS. Phạm Thị Dung', email: 'doctor4@petcare.com', phone: '0901234571', specialization: 'Nha khoa thú cưng', experience: 9 },
            { _id: '5', name: 'BS. Vũ Đức Khang', email: 'doctor5@petcare.com', phone: '0901234572', specialization: 'Cấp cứu & Hồi sức', experience: 15 },
            { _id: '6', name: 'BS. Hồ Thanh Trúc', email: 'doctor6@petcare.com', phone: '0901234573', specialization: 'Dinh dưỡng & Tiêm phòng', experience: 5 },
            { _id: '7', name: 'BS. Lê Thị Tú Anh', email: 'doctor7@petcare.com', phone: '0901234574', specialization: 'Chăm sóc răng miệng', experience: 4 },
            { _id: '8', name: 'BS. Ngô Minh Nhật', email: 'doctor8@petcare.com', phone: '0901234575', specialization: 'Khám tổng quát', experience: 7 },
            { _id: '9', name: 'BS. Trần Phúc', email: 'doctor9@petcare.com', phone: '0901234576', specialization: 'Xét nghiệm thú y', experience: 11 },
            { _id: '10', name: 'BS. Đào Thu Hương', email: 'doctor10@petcare.com', phone: '0901234577', specialization: 'Nhãn khoa thú cưng', experience: 8 },
            { _id: '11', name: 'BS. Lương Tuấn Anh', email: 'doctor11@petcare.com', phone: '0901234578', specialization: 'Thú y chim cảnh', experience: 6 },
            { _id: '12', name: 'BS. Nguyễn Bảo Ngọc', email: 'doctor12@petcare.com', phone: '0901234579', specialization: 'Tai mũi họng', experience: 5 }
        ]);
    };

    const calculateStats = (apts) => ({
        total: apts.length,
        pending: apts.filter(a => a.status === 'pending').length,
        confirmed: apts.filter(a => a.status === 'confirmed').length,
        completed: apts.filter(a => a.status === 'completed').length,
    });

    const updateAppointmentStatus = async (id, status) => {
        try {
            await appointmentAPI.update(id, { status });
            toast.success(language === 'en' ? 'Status updated!' : 'Đã cập nhật trạng thái!');
            fetchData();
        } catch (error) {
            toast.error(t('common.error'));
        }
    };

    const updateOrderStatus = async (id, newStatus) => {
        try {
            await orderAPI.updateStatus(id, { orderStatus: newStatus });
            toast.success(language === 'en' ? 'Order status updated!' : 'Đã cập nhật đơn hàng!');
            fetchData();
        } catch (error) {
            console.error('Order update error:', error);
            // Update locally for demo purposes
            setAllOrders(prev => prev.map(order =>
                order._id === id ? { ...order, orderStatus: newStatus } : order
            ));
            toast.success(language === 'en' ? 'Order status updated (demo)' : 'Đã cập nhật đơn hàng (demo)');
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'primary',
            processing: 'primary',
            completed: 'success',
            delivered: 'success',
            paid: 'success',
            cancelled: 'danger',
            failed: 'danger',
            shipping: 'primary',
        };
        const labels = {
            pending: language === 'en' ? 'Pending' : 'Chờ xử lý',
            confirmed: language === 'en' ? 'Confirmed' : 'Đã xác nhận',
            processing: language === 'en' ? 'Processing' : 'Đang xử lý',
            completed: language === 'en' ? 'Completed' : 'Hoàn thành',
            delivered: language === 'en' ? 'Delivered' : 'Đã giao',
            paid: language === 'en' ? 'Paid' : 'Đã thanh toán',
            cancelled: language === 'en' ? 'Cancelled' : 'Đã hủy',
            shipping: language === 'en' ? 'Shipping' : 'Đang giao',
        };
        return <Badge variant={variants[status] || 'gray'}>{labels[status] || status}</Badge>;
    };

    const getServiceIcon = (service) => {
        const icons = { grooming: <img src="https://images.pexels.com/photos/6131569/pexels-photo-6131569.jpeg" alt="Grooming" className="w-full h-full object-cover rounded-xl" />, vaccination: <img src="https://images.pexels.com/photos/7469213/pexels-photo-7469213.jpeg" alt="Vaccination" className="w-full h-full object-cover rounded-xl" />, checkup: <img src="https://images.pexels.com/photos/6816836/pexels-photo-6816836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Checkup" className="w-full h-full object-cover rounded-xl" />, surgery: <img src="https://images.pexels.com/photos/18726828/pexels-photo-18726828.jpeg" alt="Surgery" className="w-full h-full object-cover rounded-xl" />, boarding: <img src="https://images.pexels.com/photos/6821106/pexels-photo-6821106.jpeg" alt="Boarding" className="w-full h-full object-cover rounded-xl" />, training: <img src="https://images.pexels.com/photos/15322829/pexels-photo-15322829.jpeg" alt="Training" className="w-full h-full object-cover rounded-xl" /> };
        return icons[service] || '📋';
    };

    // Define tabs based on role
    const tabs = [
        { id: 'overview', label: language === 'en' ? 'Overview' : 'Tổng quan', icon: FiGrid },
        { id: 'appointments', label: language === 'en' ? 'Appointments' : 'Lịch hẹn', icon: FiCalendar },
        { id: 'orders', label: language === 'en' ? 'Orders' : 'Đơn hàng', icon: FiPackage },
        ...(isAdmin ? [{ id: 'products', label: language === 'en' ? 'Products' : 'Sản phẩm', icon: FiShoppingBag }] : []),
        { id: 'articles', label: language === 'en' ? 'Articles' : 'Bài viết', icon: FiFileText },
        ...(isAdmin ? [{ id: 'doctors', label: language === 'en' ? 'Doctors' : 'Bác sĩ', icon: FiUsers }] : []),
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center pt-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme pt-24 pb-12 transition-colors duration-300">
            <div className="container-custom">
                {/* Header */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-4xl font-display font-bold text-theme mb-2">
                        {isAdmin ? (language === 'en' ? 'Admin Dashboard' : 'Bảng điều khiển Admin') : (language === 'en' ? 'Staff Dashboard' : 'Bảng điều khiển Nhân viên')}
                    </h1>
                    <p className="text-theme-secondary">{format(new Date(), 'EEEE, dd/MM/yyyy', { locale: vi })}</p>
                </div>

                {/* Tabs */}
                <div className={`flex flex-wrap gap-1 p-1 rounded-xl mb-8 animate-fade-in-up delay-100 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-primary text-white shadow-glow-sm'
                                : `${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                        <FiCalendar className="w-6 h-6 text-primary-400" />
                                    </div>
                                    <span className="text-green-400 text-sm font-medium">+12%</span>
                                </div>
                                <p className="text-theme-secondary mb-1">{language === 'en' ? "Today's Appointments" : 'Lịch hẹn hôm nay'}</p>
                                <p className="text-3xl font-bold text-theme">{appointmentStats.total}</p>
                                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-lg">{appointmentStats.confirmed} {language === 'en' ? 'confirmed' : 'xác nhận'}</span>
                                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-lg">{appointmentStats.pending} {language === 'en' ? 'pending' : 'chờ'}</span>
                                </div>
                            </div>

                            <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                        <FiPackage className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <span className="text-yellow-400 text-sm font-medium">{language === 'en' ? 'Need attention' : 'Cần xử lý'}</span>
                                </div>
                                <p className="text-theme-secondary mb-1">{language === 'en' ? 'Pending Orders' : 'Đơn chờ xử lý'}</p>
                                <p className="text-3xl font-bold text-theme">{orderStats.pending}</p>
                            </div>

                            <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                        <FiDollarSign className="w-6 h-6 text-green-400" />
                                    </div>
                                    <span className="text-green-400 text-sm font-medium">+8%</span>
                                </div>
                                <p className="text-theme-secondary mb-1">{language === 'en' ? "Today's Revenue" : 'Doanh thu hôm nay'}</p>
                                <p className="text-3xl font-bold text-gradient">{formatPrice(orderStats.today?.revenue || 0)}</p>
                            </div>

                            <div className="card-glass p-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                                        <FiTrendingUp className="w-6 h-6 text-secondary-400" />
                                    </div>
                                    <span className="text-green-400 text-sm font-medium">+23%</span>
                                </div>
                                <p className="text-theme-secondary mb-1">{language === 'en' ? 'Monthly Revenue' : 'Doanh thu tháng'}</p>
                                <p className="text-3xl font-bold text-gradient">{formatPrice(orderStats.month?.revenue || 0)}</p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Today's Appointments */}
                            <div className="card-glass overflow-hidden animate-fade-in-up delay-200">
                                <div className="p-6 border-b border-theme flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-theme flex items-center">
                                        <FiClock className="mr-2 text-primary-400" />
                                        {language === 'en' ? "Today's Appointments" : 'Lịch hẹn hôm nay'}
                                    </h2>
                                    <button onClick={() => setActiveTab('appointments')} className="text-primary-400 hover:text-primary-300 text-sm">
                                        {language === 'en' ? 'View all' : 'Xem tất cả'}
                                    </button>
                                </div>
                                <div className="divide-y divide-theme">
                                    {appointments.slice(0, 3).map((apt) => (
                                        <div key={apt._id} className={`p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                    {getServiceIcon(apt.service)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-theme">{apt.customer?.name}</p>
                                                    <p className="text-sm text-theme-secondary">
                                                        {apt.pet?.name} • {apt.timeSlot}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusBadge(apt.status)}
                                        </div>
                                    ))}
                                    {appointments.length === 0 && (
                                        <div className="p-8">
                                            <EmptyState
                                                icon={<span className="text-4xl">📅</span>}
                                                title={language === 'en' ? 'No appointments' : 'Không có lịch hẹn'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="card-glass overflow-hidden animate-fade-in-up delay-300">
                                <div className="p-6 border-b border-theme flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-theme flex items-center">
                                        <FiPackage className="mr-2 text-yellow-400" />
                                        {language === 'en' ? 'Recent Orders' : 'Đơn hàng mới'}
                                    </h2>
                                    <button onClick={() => setActiveTab('orders')} className="text-primary-400 hover:text-primary-300 text-sm">
                                        {language === 'en' ? 'View all' : 'Xem tất cả'}
                                    </button>
                                </div>
                                <div className="divide-y divide-theme">
                                    {recentOrders.slice(0, 3).map((order) => (
                                        <div key={order._id} className={`p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                                            <div>
                                                <p className="font-medium text-theme">#{order.orderNumber}</p>
                                                <p className="text-sm text-theme-secondary">{order.customer?.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gradient">{formatPrice(order.totalAmount)}</p>
                                                {getStatusBadge(order.orderStatus)}
                                            </div>
                                        </div>
                                    ))}
                                    {recentOrders.length === 0 && (
                                        <div className="p-8">
                                            <EmptyState
                                                icon={<span className="text-4xl">📦</span>}
                                                title={language === 'en' ? 'No orders' : 'Không có đơn hàng'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'appointments' && (
                    <div className="animate-fade-in-up">
                        {/* Date Filter */}
                        <div className="card-glass p-4 mb-6 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <FiFilter className="text-theme-secondary" />
                                <span className="text-theme-secondary">{language === 'en' ? 'Filter by date:' : 'Lọc theo ngày:'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        setSelectedDate(format(subDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
                                        setIsDateFilterActive(true);
                                    }}
                                    className="btn-ghost px-3 py-2"
                                >
                                    ←
                                </button>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        setSelectedDate(e.target.value);
                                        setIsDateFilterActive(true);
                                    }}
                                    className="input px-4 py-2"
                                />
                                <button
                                    onClick={() => {
                                        setSelectedDate(format(addDays(new Date(selectedDate), 1), 'yyyy-MM-dd'));
                                        setIsDateFilterActive(true);
                                    }}
                                    className="btn-ghost px-3 py-2"
                                >
                                    →
                                </button>
                            </div>
                            <button
                                onClick={() => {
                                    setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
                                    setIsDateFilterActive(true);
                                }}
                                className="btn-primary px-4 py-2"
                            >
                                {language === 'en' ? 'Today' : 'Hôm nay'}
                            </button>
                            {isDateFilterActive && (
                                <button
                                    onClick={() => setIsDateFilterActive(false)}
                                    className="btn-ghost px-4 py-2 text-red-400 hover:text-red-300"
                                >
                                    ✕ {language === 'en' ? 'Clear filter' : 'Xóa lọc'}
                                </button>
                            )}
                            {!isAdmin && (
                                <span className="text-sm text-theme-muted ml-auto">
                                    {language === 'en' ? 'Showing your appointments only' : 'Chỉ hiện lịch hẹn của bạn'}
                                </span>
                            )}
                        </div>

                        {/* Sub-tabs for appointment filtering */}
                        <div className={`flex gap-2 p-1 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} style={{ width: 'fit-content' }}>
                            <button
                                onClick={() => setAppointmentFilter('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${appointmentFilter === 'all'
                                    ? 'bg-gradient-primary text-white shadow-glow-sm'
                                    : `${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
                                    }`}
                            >
                                {language === 'en' ? 'All Appointments' : 'Toàn bộ'} ({appointments.length})
                            </button>
                            <button
                                onClick={() => setAppointmentFilter('pending')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${appointmentFilter === 'pending'
                                    ? 'bg-gradient-primary text-white shadow-glow-sm'
                                    : `${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
                                    }`}
                            >
                                {language === 'en' ? 'Pending' : 'Chờ xử lý'} ({appointments.filter(a => a.status === 'pending').length})
                            </button>
                        </div>

                        {/* Appointments List */}
                        <div className="card-glass overflow-hidden">
                            <div className="p-6 border-b border-theme">
                                <h2 className="text-xl font-semibold text-theme">
                                    {isDateFilterActive
                                        ? `${language === 'en' ? 'Appointments for' : 'Lịch hẹn ngày'} ${format(new Date(selectedDate), 'dd/MM/yyyy')}`
                                        : (language === 'en' ? 'All Appointments' : 'Tất cả lịch hẹn')
                                    }
                                    <span className="ml-2 text-theme-secondary">
                                        ({appointmentFilter === 'all' ? appointments.length : appointments.filter(a => a.status === 'pending').length})
                                    </span>
                                </h2>
                            </div>
                            <div className="divide-y divide-theme">
                                {(() => {
                                    const filteredApts = appointmentFilter === 'all'
                                        ? appointments
                                        : appointments.filter(a => a.status === 'pending');
                                    return filteredApts.length > 0 ? filteredApts.map((apt) => (
                                        <div key={apt._id} className={`p-4 flex items-center justify-between ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                    {getServiceIcon(apt.service)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-theme">{apt.customer?.name}</p>
                                                    <p className="text-sm text-theme-secondary">
                                                        {!isDateFilterActive && apt.date && (
                                                            <span className="text-primary-400 font-medium">{format(new Date(apt.date), 'dd/MM/yyyy')} • </span>
                                                        )}
                                                        {apt.pet?.name} ({apt.pet?.species}) • {apt.timeSlot}
                                                    </p>
                                                    {isAdmin && apt.staff && (
                                                        <p className="text-xs text-primary-400">BS: {apt.staff.name}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {getStatusBadge(apt.status)}
                                                {apt.status === 'pending' && (
                                                    <div className="flex space-x-1">
                                                        <button
                                                            onClick={() => updateAppointmentStatus(apt._id, 'confirmed')}
                                                            className="w-8 h-8 bg-green-500/20 text-green-400 rounded-lg flex items-center justify-center hover:bg-green-500/30 transition-colors"
                                                        >
                                                            <FiCheck className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => updateAppointmentStatus(apt._id, 'cancelled')}
                                                            className="w-8 h-8 bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-500/30 transition-colors"
                                                        >
                                                            <FiX className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                                {apt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateAppointmentStatus(apt._id, 'completed')}
                                                        className="btn-primary text-xs px-3 py-1"
                                                    >
                                                        {language === 'en' ? 'Complete' : 'Hoàn thành'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="p-8">
                                            <EmptyState
                                                icon={<span className="text-4xl">📅</span>}
                                                title={language === 'en' ? 'No appointments for this date' : 'Không có lịch hẹn cho ngày này'}
                                            />
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-fade-in-up">
                        <div className="card-glass overflow-hidden">
                            <div className="p-6 border-b border-theme">
                                <h2 className="text-xl font-semibold text-theme">
                                    {language === 'en' ? 'Order Management' : 'Quản lý đơn hàng'}
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={`${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'Order' : 'Đơn hàng'}</th>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'Customer' : 'Khách hàng'}</th>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'Amount' : 'Số tiền'}</th>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'Status' : 'Trạng thái'}</th>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'Actions' : 'Thao tác'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme">
                                        {allOrders.map((order) => (
                                            <tr key={order._id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                                                <td className="p-4">
                                                    <p className="font-medium text-theme">#{order.orderNumber}</p>
                                                    <p className="text-sm text-theme-secondary">{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                                </td>
                                                <td className="p-4 text-theme">{order.customer?.name}</td>
                                                <td className="p-4 font-semibold text-gradient">{formatPrice(order.totalAmount)}</td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        {getStatusBadge(order.orderStatus)}
                                                        {getStatusBadge(order.paymentStatus)}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                        className="input py-1 px-2 text-sm"
                                                    >
                                                        <option value="pending">{language === 'en' ? 'Pending' : 'Chờ xử lý'}</option>
                                                        <option value="processing">{language === 'en' ? 'Processing' : 'Đang xử lý'}</option>
                                                        <option value="shipping">{language === 'en' ? 'Shipping' : 'Đang giao'}</option>
                                                        <option value="delivered">{language === 'en' ? 'Delivered' : 'Đã giao'}</option>
                                                        <option value="cancelled">{language === 'en' ? 'Cancelled' : 'Đã hủy'}</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && isAdmin && <ProductManagement />}

                {activeTab === 'articles' && <ArticleManagement />}

                {activeTab === 'doctors' && isAdmin && (
                    <div className="animate-fade-in-up">
                        <div className="card-glass overflow-hidden">
                            <div className="p-6 border-b border-theme flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-theme">
                                    {language === 'en' ? 'Doctor Management' : 'Quản lý Bác sĩ'}
                                </h2>
                                <button className="btn-primary">
                                    + {language === 'en' ? 'Add Doctor' : 'Thêm Bác sĩ'}
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {doctors.length === 0 ? (
                                    <div className="col-span-full">
                                        <EmptyState
                                            icon={<span className="text-4xl">👨‍⚕️</span>}
                                            title={language === 'en' ? 'No doctors found' : 'Chưa có bác sĩ'}
                                            description={language === 'en' ? 'Add doctors to start managing staff' : 'Thêm bác sĩ để quản lý nhân viên'}
                                        />
                                    </div>
                                ) : doctors.map((doctor) => (
                                    <div key={doctor._id} className={`p-6 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center">
                                                <span className="text-2xl text-white font-bold">{doctor.name?.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-theme">{doctor.name}</h3>
                                                <p className="text-sm text-theme-secondary">{doctor.specialization}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p className="text-theme-secondary">📧 {doctor.email}</p>
                                            <p className="text-theme-secondary">📱 {doctor.phone}</p>
                                            <p className="text-theme-secondary">⭐ {doctor.experience} {language === 'en' ? 'years experience' : 'năm kinh nghiệm'}</p>
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button className="btn-ghost flex-1 text-sm py-2">
                                                {language === 'en' ? 'Edit' : 'Sửa'}
                                            </button>
                                            <button className="btn-ghost flex-1 text-sm py-2 text-red-400 hover:text-red-300">
                                                {language === 'en' ? 'Delete' : 'Xóa'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
