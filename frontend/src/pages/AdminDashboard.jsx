import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiPackage, FiDollarSign, FiTrendingUp, FiClock, FiCheck, FiX, FiShoppingBag, FiGrid, FiFileText, FiUsers, FiFilter } from 'react-icons/fi';
import { format, addDays, subDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { appointmentAPI, orderAPI, authAPI } from '../services/api';
import { Badge, Spinner, EmptyState, Modal } from '../components/common/UI';
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
    const [todayAppointments, setTodayAppointments] = useState([]);
    const [orderStats, setOrderStats] = useState({ today: {}, month: {}, pending: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [allOrders, setAllOrders] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [appointmentStats, setAppointmentStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
    const [todayStats, setTodayStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0 });
    const [appointmentFilter, setAppointmentFilter] = useState('all'); // 'all' or 'pending'
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [users, setUsers] = useState([]);
    // Doctor CRUD
    const [showDoctorModal, setShowDoctorModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null); // null = adding new
    const [doctorForm, setDoctorForm] = useState({ name: '', email: '', password: '', phone: '', specialization: '', experience: '', bio: '', role: 'staff', avatar: '' });
    const [savingDoctor, setSavingDoctor] = useState(false);

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
            const fetchedAppointments = appointmentsRes.data.appointments || [];
            setAppointments(fetchedAppointments);
            setAppointmentStats(calculateStats(fetchedAppointments));

            // ALWAYS fetch today's appointments for the overview tab
            const todayRes = await appointmentAPI.getToday();
            setTodayAppointments(todayRes.data.appointments || []);
            setTodayStats(calculateStats(todayRes.data.appointments || []));
        } catch (error) {
            console.error('Error fetching appointments:', error);
            // Don't call setMockData() immediately if it's just a 404 or something, 
            // but for now, we'll keep it as a fallback if the API fails
            if (!appointments.length) setMockData();
        }

        // Fetch orders & stats
        try {
            const [statsRes, ordersRes] = await Promise.all([
                orderAPI.getStats(),
                orderAPI.getAll({ limit: 10 }),
            ]);
            setOrderStats(statsRes.data.stats || { today: {}, month: {}, pending: 0 });
            setRecentOrders(ordersRes.data.orders || []);
            setAllOrders(ordersRes.data.orders || []);
        } catch (error) {
            console.error('Error fetching order/stats data:', error);
            // Non-critical error, just keep default stats
            setOrderStats({ today: { orders: 0, revenue: 0 }, month: { orders: 0, revenue: 0 }, pending: 0 });
        }

        // Fetch users (admin only)
        if (isAdmin) {
            try {
                const [doctorsRes, usersRes] = await Promise.all([
                    authAPI.getDoctors(),
                    authAPI.getAllUsers()
                ]);
                setDoctors(doctorsRes.data?.staff || doctorsRes.data?.doctors || doctorsRes.data || []);
                setUsers(usersRes.data?.users || []);
            } catch (err) {
                console.error('Error fetching admin data:', err);
                setMockAdminData();
            }
        }
        setLoading(false);
    };

    const setMockData = () => {
        const mockAppointments = [
            { _id: '1', service: 'grooming', timeSlot: '09:00-10:00', status: 'confirmed', customer: { name: 'Nguyễn Văn A' }, pet: { name: 'Buddy', species: 'dog', avatar: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg' }, staff: { _id: user?._id, name: 'BS. Nguyễn' }, date: selectedDate },
            { _id: '2', service: 'vaccination', timeSlot: '10:00-11:00', status: 'pending', customer: { name: 'Trần Thị B' }, pet: { name: 'Mèo Mun', species: 'cat', avatar: 'https://images.pexels.com/photos/45201/kitty-cat-kitten-pet-45201.jpeg' }, staff: { _id: user?._id, name: 'BS. Nguyễn' }, date: selectedDate },
            { _id: '3', service: 'checkup', timeSlot: '14:00-15:00', status: 'confirmed', customer: { name: 'Lê Văn C' }, pet: { name: 'Lucky', species: 'dog', avatar: '' }, staff: { _id: '999', name: 'BS. Trần' }, date: selectedDate },
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
            { _id: '1', orderNumber: 'PMS2601001', totalAmount: 650000, orderStatus: 'pending', paymentStatus: 'pending', customer: { name: 'Nguyễn Văn A', email: 'vana@gmail.com', phone: '0912345678' }, createdAt: new Date(), shippingAddress: { fullName: 'Nguyễn Văn A', phone: '0912345678', address: '123 Đường ABC', city: 'Quận 1, HCM', notes: 'Giao giờ hành chính' }, paymentMethod: 'cod', items: [{ product: { name: 'Thức ăn chó Royal Canin', images: ['https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg'] }, quantity: 2, price: 300000 }, { product: { name: 'Cát vệ sinh mèo', images: [] }, quantity: 1, price: 50000 }] },
            { _id: '2', orderNumber: 'PMS2601002', totalAmount: 320000, orderStatus: 'processing', paymentStatus: 'paid', customer: { name: 'Trần Thị B', email: 'thib@gmail.com', phone: '0987654321' }, createdAt: new Date(), shippingAddress: { fullName: 'Trần Thị B', phone: '0987654321', address: '456 Đường XYZ', city: 'Quận 7, HCM' }, paymentMethod: 'vnpay', items: [{ product: { name: 'Sữa tắm thú cưng', images: [] }, quantity: 1, price: 320000 }] },
            { _id: '3', orderNumber: 'PMS2601003', totalAmount: 480000, orderStatus: 'shipping', paymentStatus: 'paid', customer: { name: 'Lê Văn C', email: 'vanc@gmail.com', phone: '0933445566' }, createdAt: new Date(), shippingAddress: { fullName: 'Lê Văn C', phone: '0933445566', address: '789 Đường LMN', city: 'Quận 10, HCM' }, paymentMethod: 'cod', items: [{ product: { name: 'Đồ chơi xương gặm', images: [] }, quantity: 4, price: 120000 }] },
            { _id: '4', orderNumber: 'PMS2601004', totalAmount: 890000, orderStatus: 'delivered', paymentStatus: 'paid', customer: { name: 'Phạm Minh D', email: 'minhd@gmail.com', phone: '0944556677' }, createdAt: new Date(), shippingAddress: { fullName: 'Phạm Minh D', phone: '0944556677', address: '101 Đường PQR', city: 'Quận Bình Thạnh, HCM' }, paymentMethod: 'vnpay', items: [{ product: { name: 'Chuồng chó lớn', images: [] }, quantity: 1, price: 890000 }] },
        ]);
        setDoctors([
            { _id: '1', name: 'BS. Nguyễn Văn An', email: 'doctor1@petcare.com', phone: '0901234568', specialization: 'Nội khoa thú cưng', experience: 8 },
            { _id: '2', name: 'BS. Trần Thị Bình', email: 'doctor2@petcare.com', phone: '0901234569', specialization: 'Phẫu thuật thú cưng', experience: 12 },
        ]);
        setUsers([
            { _id: '1', name: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'customer' },
            { _id: '2', name: 'Trần Thị B', email: 'thib@gmail.com', role: 'staff' },
            { _id: '3', name: 'Admin User', email: 'admin@petcare.com', role: 'admin' },
        ]);
    };

    const setMockAdminData = () => {
        setDoctors([
            { _id: '1', name: 'BS. Nguyễn Văn An', email: 'doctor1@petcare.com', phone: '0901234568', specialization: 'Nội khoa thú cưng', experience: 8 },
            { _id: '2', name: 'BS. Trần Thị Bình', email: 'doctor2@petcare.com', phone: '0901234569', specialization: 'Phẫu thuật thú cưng', experience: 12 },
            { _id: '3', name: 'BS. Lê Minh Hoàng', email: 'doctor3@petcare.com', phone: '0901234570', specialization: 'Da liễu thú cưng', experience: 6 },
        ]);
        setUsers([
            { _id: '1', name: 'Nguyễn Văn A', email: 'vana@gmail.com', role: 'customer' },
            { _id: '2', name: 'Trần Thị B', email: 'thib@gmail.com', role: 'staff' },
            { _id: '3', name: 'BS. Nguyễn Văn An', email: 'doctor1@petcare.com', role: 'staff' },
            { _id: '4', name: 'Admin User', email: 'admin@petcare.com', role: 'admin' },
        ]);
    };

    const calculateStats = (apts) => ({
        total: apts.length,
        pending: apts.filter(a => a.status === 'pending').length,
        confirmed: apts.filter(a => a.status === 'confirmed').length,
        completed: apts.filter(a => a.status === 'completed').length,
    });

    const updateAppointmentStatus = async (id, status) => {
        // Skip API for mock IDs
        if (id.length < 20) {
            setAppointments(prev => prev.map(apt =>
                apt._id === id ? { ...apt, status } : apt
            ));
            toast.success(language === 'en' ? 'Status updated (Demo)' : 'Đã cập nhật (Demo)');
            return;
        }

        try {
            await appointmentAPI.update(id, { status });
            toast.success(language === 'en' ? 'Status updated!' : 'Đã cập nhật trạng thái!');
            fetchData();
        } catch (error) {
            console.error('Appointment update error:', error);
            if (error.response?.status === 403) {
                toast.error(language === 'en' ? 'Not authorized' : 'Không có quyền thực hiện');
                return;
            }
            // Update locally for demo purposes
            setAppointments(prev => prev.map(apt =>
                apt._id === id ? { ...apt, status } : apt
            ));
            toast.success(language === 'en' ? 'Status updated (demo)' : 'Đã cập nhật trạng thái (demo)');
        }
    };

    const updateOrderStatus = async (id, newStatus) => {
        // Skip API for mock IDs
        if (id.length < 20) {
            setAllOrders(prev => prev.map(order =>
                order._id === id ? { ...order, orderStatus: newStatus } : order
            ));
            toast.success(language === 'en' ? 'Order status updated (Demo)' : 'Đã cập nhật đơn hàng (Demo)');
            return;
        }

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

    const updateUserRole = async (userId, newRole) => {
        try {
            await authAPI.updateUserRole(userId, newRole);
            toast.success(language === 'en' ? 'Role updated successfully!' : 'Đã cập nhật quyền hạn!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error updating role');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm(language === 'en' ? 'Are you sure you want to delete this account?' : 'Bạn có chắc chắn muốn xóa tài khoản này?')) return;
        try {
            await authAPI.deleteUser(userId);
            toast.success(language === 'en' ? 'User deleted!' : 'Đã xóa người dùng!');
            fetchData();
        } catch (error) {
            toast.error('Error deleting user');
        }
    };

    const handleSaveDoctor = async (e) => {
        e.preventDefault();
        setSavingDoctor(true);
        try {
            if (editingDoctor) {
                await authAPI.updateDoctor(editingDoctor._id, doctorForm);
                toast.success(language === 'en' ? 'Doctor updated!' : 'Đã cập nhật bác sĩ!');
            } else {
                await authAPI.createDoctor(doctorForm);
                toast.success(language === 'en' ? 'Doctor created!' : 'Đã thêm bác sĩ mới!');
            }
            setShowDoctorModal(false);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || t('common.error'));
        } finally {
            setSavingDoctor(false);
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        if (!window.confirm(language === 'en' ? 'Delete this doctor account?' : 'Xóa tài khoản bác sĩ này?')) return;
        try {
            await authAPI.deleteUser(doctorId);
            toast.success(language === 'en' ? 'Deleted!' : 'Đã xóa!');
            fetchData();
        } catch (err) {
            toast.error(t('common.error'));
        }
    };

    const openAddDoctor = () => {
        setEditingDoctor(null);
        setDoctorForm({ name: '', email: '', password: '', phone: '', specialization: '', experience: '', bio: '', role: 'staff', avatar: '' });
        setShowDoctorModal(true);
    };

    const openEditDoctor = (doctor) => {
        setEditingDoctor(doctor);
        setDoctorForm({ name: doctor.name || '', email: doctor.email || '', password: '', phone: doctor.phone || '', specialization: doctor.specialization || '', experience: doctor.experience || '', bio: doctor.bio || '', role: doctor.role || 'staff', avatar: doctor.avatar || '' });
        setShowDoctorModal(true);
    };

    const handleDoctorAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 3 * 1024 * 1024) {
            toast.error(language === 'en' ? 'Image too large (max 3MB)' : 'Ảnh quá lớn (tối đa 3MB)');
            return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => setDoctorForm(p => ({ ...p, avatar: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'primary',
            processing: 'warning',
            completed: 'success',
            delivered: 'success',
            paid: 'success',
            rated: 'primary',
            cancelled: 'danger',
            failed: 'danger',
            shipping: 'primary',
        };
        const labels = {
            pending: language === 'en' ? 'Pending' : 'Chờ xác nhận',
            confirmed: language === 'en' ? 'Confirmed' : 'Đã xác nhận',
            processing: language === 'en' ? 'Processing' : 'Đang thực hiện',
            completed: language === 'en' ? 'Completed' : 'Hoàn thành',
            rated: language === 'en' ? 'Rated' : 'Đã đánh giá',
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
        ...(isAdmin ? [
            { id: 'doctors', label: language === 'en' ? 'Doctors' : 'Bác sĩ', icon: FiUsers },
            { id: 'users', label: language === 'en' ? 'Accounts' : 'Tài khoản', icon: FiUsers }
        ] : []),
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
                            {/* Pending Activity */}
                            <div className="card-glass overflow-hidden animate-fade-in-up delay-200">
                                <div className="p-6 border-b border-theme flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-theme flex items-center">
                                        <FiClock className="mr-2 text-primary-400" />
                                        {language === 'en' ? "Pending Appointments" : 'Lịch hẹn cần xử lý'}
                                    </h2>
                                    <button onClick={() => { setActiveTab('appointments'); setAppointmentFilter('pending'); }} className="text-primary-400 hover:text-primary-300 text-sm">
                                        {language === 'en' ? 'View all' : 'Xem tất cả'}
                                    </button>
                                </div>
                                <div className="divide-y divide-theme">
                                    {appointments.filter(a => a.status === 'pending').slice(0, 5).map((apt) => (
                                        <div
                                            key={apt._id}
                                            onClick={() => setSelectedAppointment(apt)}
                                            className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} hover:shadow-lg hover:scale-[1.01] active:scale-100 group`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                    {apt.pet?.avatar ? (
                                                        <img src={apt.pet.avatar} alt={apt.pet.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        getServiceIcon(apt.service)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-theme">{apt.customer?.name}</p>
                                                    <p className="text-sm text-theme-secondary">
                                                        {apt.pet?.name} • {format(new Date(apt.date), 'dd/MM')} • {apt.timeSlot}
                                                    </p>
                                                </div>
                                            </div>
                                            {getStatusBadge(apt.status)}
                                        </div>
                                    ))}
                                    {appointments.filter(a => a.status === 'pending').length === 0 && (
                                        <div className="p-8">
                                            <EmptyState
                                                icon={<span className="text-4xl">📅</span>}
                                                title={language === 'en' ? 'No pending appointments' : 'Không có lịch hẹn cần xử lý'}
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
                                        <div
                                            key={order._id}
                                            onClick={() => setSelectedOrder(order)}
                                            className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'} hover:shadow-lg hover:scale-[1.01] active:scale-100 group`}
                                        >
                                            <div>
                                                <p className="font-medium text-theme group-hover:text-primary-400 transition-colors">#{order.orderNumber}</p>
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
                            <button
                                onClick={() => setAppointmentFilter('processed')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${appointmentFilter === 'processed'
                                    ? 'bg-gradient-primary text-white shadow-glow-sm'
                                    : `${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'}`
                                    }`}
                            >
                                {language === 'en' ? 'History' : 'Đã xử lý'} ({appointments.filter(a => ['completed', 'rated'].includes(a.status)).length})
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
                                        ({(() => {
                                            if (appointmentFilter === 'all') return appointments.length;
                                            if (appointmentFilter === 'pending') return appointments.filter(a => a.status === 'pending').length;
                                            if (appointmentFilter === 'processed') return appointments.filter(a => ['completed', 'rated'].includes(a.status)).length;
                                            return 0;
                                        })()})
                                    </span>
                                </h2>
                            </div>
                            <div className="divide-y divide-theme">
                                {(() => {
                                    let filteredApts = appointments;
                                    if (appointmentFilter === 'pending') {
                                        filteredApts = appointments.filter(a => a.status === 'pending');
                                    } else if (appointmentFilter === 'processed') {
                                        filteredApts = appointments.filter(a => ['completed', 'rated'].includes(a.status));
                                    }
                                    return filteredApts.length > 0 ? filteredApts.map((apt) => (
                                        <div
                                            key={apt._id}
                                            onClick={() => setSelectedAppointment(apt)}
                                            className={`p-4 flex items-center justify-between cursor-pointer transition-all duration-300 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'} hover:shadow-lg hover:scale-[1.01] active:scale-100 group`}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                                                    {apt.pet?.avatar ? (
                                                        <img src={apt.pet.avatar} alt={apt.pet.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        getServiceIcon(apt.service)
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-theme">{apt.customer?.name}</p>
                                                    <p className="text-sm text-theme-secondary">
                                                        {!isDateFilterActive && apt.date && (
                                                            <span className="text-primary-400 font-medium">{format(new Date(apt.date), 'dd/MM/yyyy')} • </span>
                                                        )}
                                                        {apt.pet?.name} ({apt.pet?.species}) • {apt.timeSlot}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        {isAdmin && apt.staff && (
                                                            <p className="text-xs text-primary-400">BS: {apt.staff.name || apt.staff}</p>
                                                        )}
                                                        {apt.rating && (
                                                            <div className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                                                                <span>★</span>
                                                                <span className="font-bold">{apt.rating}</span>
                                                            </div>
                                                        )}
                                                    </div>
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
                                            <tr
                                                key={order._id}
                                                onClick={() => setSelectedOrder(order)}
                                                className={`cursor-pointer transition-all duration-300 ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-50'}`}
                                            >
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
                                                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                                    <select
                                                        value={order.orderStatus}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            updateOrderStatus(order._id, e.target.value);
                                                        }}
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
                                    <span className="ml-2 text-sm text-theme-secondary">({doctors.length})</span>
                                </h2>
                                <button className="btn-primary" onClick={openAddDoctor}>
                                    + {language === 'en' ? 'Add Doctor' : 'Thêm Bác sĩ'}
                                </button>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                                {doctors.length === 0 ? (
                                    <div className="col-span-full">
                                        <EmptyState
                                            icon={<span className="text-4xl">👨‍⚕️</span>}
                                            title={language === 'en' ? 'No doctors found' : 'Chưa có bác sĩ'}
                                            description={language === 'en' ? 'Click "Add Doctor" to create the first account' : 'Nhấn "Thêm Bác sĩ" để tạo tài khoản đầu tiên'}
                                        />
                                    </div>
                                ) : doctors.map((doctor) => (
                                    <div key={doctor._id} className={`p-6 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} flex flex-col`}>
                                        <div className="flex items-center space-x-4 mb-4">
                                            <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                                                {doctor.avatar
                                                    ? <img src={doctor.avatar} alt={doctor.name} className="w-full h-full rounded-full object-cover" />
                                                    : <span className="text-2xl text-white font-bold">{doctor.name?.charAt(0)}</span>}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-theme truncate">{doctor.name}</h3>
                                                <p className="text-sm text-theme-secondary truncate">{doctor.specialization || (language === 'en' ? 'No specialization' : 'Chưa có chuyên khoa')}</p>
                                                <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${doctor.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                                                    doctor.role === 'staff' ? 'bg-blue-500/20 text-blue-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                    }`}>{doctor.role?.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 text-sm flex-1">
                                            <p className="text-theme-secondary">📧 {doctor.email}</p>
                                            {doctor.phone && <p className="text-theme-secondary">📱 {doctor.phone}</p>}
                                            {doctor.experience && <p className="text-theme-secondary">⭐ {doctor.experience} {language === 'en' ? 'years exp.' : 'năm kinh nghiệm'}</p>}
                                            {doctor.bio && <p className="text-theme-muted text-xs line-clamp-2 mt-2 italic">{doctor.bio}</p>}
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => openEditDoctor(doctor)}
                                                className="btn-ghost flex-1 text-sm py-2"
                                            >
                                                ✏️ {language === 'en' ? 'Edit' : 'Sửa'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDoctor(doctor._id)}
                                                className="btn-ghost flex-1 text-sm py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            >
                                                🗑 {language === 'en' ? 'Delete' : 'Xóa'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add/Edit Doctor Modal */}
                        <Modal
                            isOpen={showDoctorModal}
                            onClose={() => setShowDoctorModal(false)}
                            title={editingDoctor
                                ? (language === 'en' ? 'Edit Doctor' : 'Chỉnh sửa Bác sĩ')
                                : (language === 'en' ? 'Add New Doctor' : 'Thêm Bác sĩ mới')}
                            size="md"
                        >
                            <form onSubmit={handleSaveDoctor} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Avatar Upload */}
                                    <div className="col-span-2 flex flex-col items-center gap-3">
                                        <div className="relative w-24 h-24">
                                            {doctorForm.avatar ? (
                                                <img
                                                    src={doctorForm.avatar}
                                                    alt="avatar"
                                                    className="w-24 h-24 rounded-full object-cover border-2 border-primary-500 shadow-glow-sm"
                                                />
                                            ) : (
                                                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-4xl text-white font-bold border-2 border-white/10">
                                                    {doctorForm.name ? doctorForm.name.charAt(0).toUpperCase() : '👨‍⚕️'}
                                                </div>
                                            )}
                                            {doctorForm.avatar && (
                                                <button
                                                    type="button"
                                                    onClick={() => setDoctorForm(p => ({ ...p, avatar: '' }))}
                                                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center hover:bg-red-600 transition-colors shadow"
                                                    title={language === 'en' ? 'Remove photo' : 'Xóa ảnh'}
                                                >✕</button>
                                            )}
                                        </div>
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleDoctorAvatarChange}
                                            />
                                            <span className="btn-ghost text-sm px-4 py-2 rounded-lg border border-white/10 hover:border-primary-500/50 transition-colors">
                                                📷 {language === 'en' ? 'Choose Photo' : 'Chọn ảnh'}
                                            </span>
                                        </label>
                                        <p className="text-xs text-gray-500">{language === 'en' ? 'JPG/PNG, max 3MB' : 'Định dạng JPG/PNG, tối đa 3MB'}</p>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'en' ? 'Full Name' : 'Họ và tên'} *</label>
                                        <input required className="input" value={doctorForm.name} onChange={e => setDoctorForm(p => ({ ...p, name: e.target.value }))} placeholder="BS. Nguyễn Văn A" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">Email *</label>
                                        <input required type="email" className="input" value={doctorForm.email} onChange={e => setDoctorForm(p => ({ ...p, email: e.target.value }))} placeholder="doctor@clinic.com" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'en' ? 'Phone' : 'Số điện thoại'}</label>
                                        <input className="input" value={doctorForm.phone} onChange={e => setDoctorForm(p => ({ ...p, phone: e.target.value }))} placeholder="0912345678" />
                                    </div>
                                    {!editingDoctor && (
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'en' ? 'Password' : 'Mật khẩu'}</label>
                                            <input type="password" className="input" value={doctorForm.password} onChange={e => setDoctorForm(p => ({ ...p, password: e.target.value }))} placeholder={language === 'en' ? 'Default: Doctor@123' : 'Mặc định: Doctor@123'} />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'en' ? 'Specialization' : 'Chuyên khoa'}</label>
                                        <input className="input" value={doctorForm.specialization} onChange={e => setDoctorForm(p => ({ ...p, specialization: e.target.value }))} placeholder={language === 'en' ? 'e.g. Internal Medicine' : 'VD: Nội khoa thú cưng'} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'en' ? 'Years of Experience' : 'Năm kinh nghiệm'}</label>
                                        <input type="number" min="0" className="input" value={doctorForm.experience} onChange={e => setDoctorForm(p => ({ ...p, experience: e.target.value }))} placeholder="5" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'en' ? 'Role' : 'Quyền hạn'}</label>
                                        <select className="input" value={doctorForm.role} onChange={e => setDoctorForm(p => ({ ...p, role: e.target.value }))}>
                                            <option value="staff">{language === 'en' ? 'Staff / Doctor' : 'Nhân viên / Bác sĩ'}</option>
                                            <option value="admin">{language === 'en' ? 'Admin' : 'Quản trị viên'}</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-400 mb-1">{language === 'en' ? 'Bio / Description' : 'Giới thiệu'}</label>
                                        <textarea rows={3} className="input resize-none" value={doctorForm.bio} onChange={e => setDoctorForm(p => ({ ...p, bio: e.target.value }))} placeholder={language === 'en' ? 'Short bio...' : 'Giới thiệu ngắn...'} />
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setShowDoctorModal(false)} className="btn-ghost flex-1">
                                        {language === 'en' ? 'Cancel' : 'Hủy'}
                                    </button>
                                    <button type="submit" disabled={savingDoctor} className="btn-primary flex-1">
                                        {savingDoctor ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {language === 'en' ? 'Saving...' : 'Đang lưu...'}
                                            </span>
                                        ) : (editingDoctor ? (language === 'en' ? 'Update' : 'Cập nhật') : (language === 'en' ? 'Create' : 'Tạo tài khoản'))}
                                    </button>
                                </div>
                            </form>
                        </Modal>
                    </div>
                )}

                {activeTab === 'users' && isAdmin && (
                    <div className="animate-fade-in-up">
                        <div className="card-glass overflow-hidden">
                            <div className="p-6 border-b border-theme flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-theme">
                                    {language === 'en' ? 'Account & Permission Management' : 'Quản lý Tài khoản & Phân quyền'}
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className={`${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                        <tr>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'User' : 'Người dùng'}</th>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'Role' : 'Quyền hạn'}</th>
                                            <th className="text-left p-4 text-theme-secondary font-medium">{language === 'en' ? 'Actions' : 'Thao tác'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-theme">
                                        {users.map((u) => (
                                            <tr key={u._id} className={`${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'} transition-colors`}>
                                                <td className="p-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                                                            {u.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-theme">{u.name} {u._id === user?.id && <span className="text-xs text-primary-400">(You)</span>}</p>
                                                            <p className="text-sm text-theme-secondary">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <select
                                                        disabled={u._id === user?.id}
                                                        value={u.role}
                                                        onChange={(e) => updateUserRole(u._id, e.target.value)}
                                                        className={`input py-1.5 px-3 text-sm font-medium ${u.role === 'admin' ? 'text-red-400' : u.role === 'staff' ? 'text-primary-400' : 'text-gray-400'
                                                            }`}
                                                    >
                                                        <option value="customer">{language === 'en' ? 'Customer' : 'Khách hàng'}</option>
                                                        <option value="staff">{language === 'en' ? 'Doctor/Staff' : 'Bác sĩ/Nhân viên'}</option>
                                                        <option value="admin">{language === 'en' ? 'Admin' : 'Quản trị viên'}</option>
                                                    </select>
                                                </td>
                                                <td className="p-4">
                                                    {u._id !== user?.id && (
                                                        <button
                                                            onClick={() => deleteUser(u._id)}
                                                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                                                            title={language === 'en' ? 'Delete account' : 'Xóa tài khoản'}
                                                        >
                                                            <FiX className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Appointment Detail Modal */}
            <Modal
                isOpen={!!selectedAppointment}
                onClose={() => setSelectedAppointment(null)}
                title={language === 'en' ? 'Appointment Details' : 'Chi tiết lịch hẹn'}
                size="md"
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-4xl shadow-glow-sm">
                                {getServiceIcon(selectedAppointment.service)}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">
                                    {t(`services.${selectedAppointment.service}`)}
                                </h3>
                                {getStatusBadge(selectedAppointment.status)}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Customer' : 'Khách hàng'}</p>
                                <p className="font-semibold text-white">{selectedAppointment.customer?.name}</p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-primary-500/20 flex items-center justify-center text-2xl">
                                    {selectedAppointment.pet?.avatar ? (
                                        <img src={selectedAppointment.pet.avatar} alt={selectedAppointment.pet.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{selectedAppointment.pet?.species === 'dog' ? '🐕' : '🐈'}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400 mb-0.5">{language === 'en' ? 'Pet Name' : 'Tên thú cưng'}</p>
                                    <p className="font-semibold text-white">
                                        {selectedAppointment.pet?.name} ({selectedAppointment.pet?.species})
                                    </p>
                                    <p className="text-xs text-primary-400">
                                        {selectedAppointment.pet?.breed} • {selectedAppointment.pet?.age} {language === 'en' ? 'years' : 'tuổi'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {selectedAppointment.pet?.weight}kg • {selectedAppointment.pet?.gender === 'male' ? (language === 'en' ? 'Male' : 'Đực') : (language === 'en' ? 'Female' : 'Cái')}
                                    </p>
                                </div>
                            </div>
                            {selectedAppointment.pet?.notes && (
                                <div className="col-span-2 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                    <p className="text-sm text-primary-400 mb-1">{language === 'en' ? 'Pet Special Notes' : 'Lưu ý đặc biệt về thú cưng'}</p>
                                    <p className="text-gray-200 italic text-sm">"{selectedAppointment.pet.notes}"</p>
                                </div>
                            )}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Date' : 'Ngày hẹn'}</p>
                                <p className="font-semibold text-white">
                                    {selectedAppointment.date ? format(new Date(selectedAppointment.date), 'dd/MM/yyyy') : '---'}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Time Box' : 'Khung giờ'}</p>
                                <p className="font-semibold text-white">{selectedAppointment.timeSlot}</p>
                            </div>
                        </div>

                        {selectedAppointment.staff && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Doctor/Staff' : 'Bác sĩ/Nhân viên'}</p>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-xs text-primary-400 font-bold">
                                        {selectedAppointment.staff.name?.charAt(0)}
                                    </div>
                                    <p className="font-semibold text-white">{selectedAppointment.staff.name}</p>
                                </div>
                            </div>
                        )}

                        {selectedAppointment.notes && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Notes' : 'Ghi chú'}</p>
                                <p className="text-gray-200">{selectedAppointment.notes}</p>
                            </div>
                        )}

                        {(selectedAppointment.rating || selectedAppointment.feedback) && (
                            <div className="p-5 rounded-2xl bg-gradient-to-br from-yellow-400/10 to-transparent border border-yellow-400/20 shadow-inner">
                                <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm font-semibold text-yellow-500 uppercase tracking-wider">{language === 'en' ? 'Customer Feedback' : 'Đánh giá từ khách hàng'}</p>
                                    <div className="flex text-yellow-400 text-lg">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="drop-shadow-glow-sm">
                                                {i < selectedAppointment.rating ? '★' : '☆'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {selectedAppointment.feedback ? (
                                    <p className="text-white italic leading-relaxed">
                                        "{selectedAppointment.feedback}"
                                    </p>
                                ) : (
                                    <p className="text-gray-400 italic text-sm">
                                        {language === 'en' ? 'No written feedback' : 'Không có nhận xét bằng văn bản'}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="btn-ghost px-6"
                            >
                                {language === 'en' ? 'Close' : 'Đóng'}
                            </button>
                            <div className="flex gap-2">
                                {selectedAppointment.status === 'pending' && (
                                    <button
                                        onClick={() => {
                                            updateAppointmentStatus(selectedAppointment._id, 'confirmed');
                                            setSelectedAppointment(null);
                                        }}
                                        className="btn-primary px-6 shadow-glow-sm"
                                    >
                                        {language === 'en' ? 'Confirm' : 'Xác nhận'}
                                    </button>
                                )}
                                {selectedAppointment.status === 'confirmed' && (
                                    <button
                                        onClick={() => {
                                            updateAppointmentStatus(selectedAppointment._id, 'processing');
                                            setSelectedAppointment(null);
                                        }}
                                        className="btn-primary px-6 bg-yellow-500 hover:bg-yellow-600 border-none shadow-glow-sm"
                                    >
                                        {language === 'en' ? 'Start Service' : 'Bắt đầu thực hiện'}
                                    </button>
                                )}
                                {selectedAppointment.status === 'processing' && (
                                    <button
                                        onClick={() => {
                                            updateAppointmentStatus(selectedAppointment._id, 'completed');
                                            setSelectedAppointment(null);
                                        }}
                                        className="btn-primary px-6 bg-green-500 hover:bg-green-600 border-none shadow-glow-sm"
                                    >
                                        {language === 'en' ? 'Complete & Pay' : 'Hoàn thành & TT'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Order Detail Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={language === 'en' ? 'Order Details' : 'Chi tiết đơn hàng'}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Status Highlights */}
                        <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center text-2xl shadow-glow-sm">
                                    <FiPackage className="text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-0.5">#{selectedOrder.orderNumber}</h3>
                                    <p className="text-sm text-gray-400">{format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {getStatusBadge(selectedOrder.orderStatus)}
                                {getStatusBadge(selectedOrder.paymentStatus)}
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Customer Info */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h4 className="text-sm font-semibold text-primary-400 mb-3 uppercase tracking-wider">
                                    {language === 'en' ? 'Customer Info' : 'Thông tin khách hàng'}
                                </h4>
                                <div className="space-y-2">
                                    <p className="text-white font-medium">{selectedOrder.customer?.name}</p>
                                    <p className="text-sm text-gray-400">📧 {selectedOrder.customer?.email}</p>
                                    <p className="text-sm text-gray-400">📱 {selectedOrder.customer?.phone}</p>
                                </div>
                            </div>
                            {/* Shipping Info */}
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <h4 className="text-sm font-semibold text-primary-400 mb-3 uppercase tracking-wider">
                                    {language === 'en' ? 'Shipping & Payment' : 'Giao hàng & Thanh toán'}
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="text-gray-200">
                                        <span className="text-gray-500">📍 {language === 'en' ? 'Addr:' : 'Đ/C:'}</span>
                                        {typeof selectedOrder.shippingAddress === 'object' ? (
                                            <div className="ml-5 mt-1 space-y-1">
                                                <p>{selectedOrder.shippingAddress.address}, {selectedOrder.shippingAddress.city}</p>
                                                {selectedOrder.shippingAddress.fullName && <p className="text-xs text-gray-400">Người nhận: {selectedOrder.shippingAddress.fullName}</p>}
                                                {selectedOrder.shippingAddress.phone && <p className="text-xs text-gray-400">SĐT: {selectedOrder.shippingAddress.phone}</p>}
                                                {selectedOrder.shippingAddress.notes && <p className="text-xs italic text-yellow-400/70">Lưu ý: {selectedOrder.shippingAddress.notes}</p>}
                                            </div>
                                        ) : (
                                            <span className="ml-1">{selectedOrder.shippingAddress}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-200">
                                        <span className="text-gray-500">💳 {language === 'en' ? 'Method:' : 'P/T:'}</span>
                                        <span className="uppercase ml-1">{selectedOrder.paymentMethod}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="rounded-xl border border-white/10 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="text-left p-3 text-gray-400 font-medium">{language === 'en' ? 'Product' : 'Sản phẩm'}</th>
                                        <th className="text-center p-3 text-gray-400 font-medium">{language === 'en' ? 'Qty' : 'SL'}</th>
                                        <th className="text-right p-3 text-gray-400 font-medium">{language === 'en' ? 'Price' : 'Giá'}</th>
                                        <th className="text-right p-3 text-gray-400 font-medium">{language === 'en' ? 'Subtotal' : 'Thành tiền'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-white/5">
                                            <td className="p-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                                                        {item.product?.images?.[0] ? (
                                                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                                        )}
                                                    </div>
                                                    <span className="text-white font-medium line-clamp-1">{item.name || item.product?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-gray-300">x{item.quantity}</td>
                                            <td className="p-3 text-right text-gray-300">{formatPrice(item.price)}</td>
                                            <td className="p-3 text-right text-white font-semibold">{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <div className="text-right space-y-2">
                                <div className="flex justify-between w-64 text-sm">
                                    <span className="text-gray-400">{language === 'en' ? 'Items Total' : 'Tiền hàng'}</span>
                                    <span className="text-white">{formatPrice(selectedOrder.totalAmount || 0)}</span>
                                </div>
                                <div className="flex justify-between w-64 text-sm">
                                    <span className="text-gray-400">{language === 'en' ? 'Shipping' : 'Phí giao hàng'}</span>
                                    <span className="text-white">0₫</span>
                                </div>
                                <div className="flex justify-between w-64 pt-2 border-t border-white/5">
                                    <span className="text-lg font-bold text-white">{language === 'en' ? 'Total' : 'Tổng cộng'}</span>
                                    <span className="text-2xl font-bold text-gradient">{formatPrice(selectedOrder.totalAmount || 0)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 pt-6">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="btn-ghost px-6"
                            >
                                {language === 'en' ? 'Close' : 'Đóng'}
                            </button>
                            {selectedOrder.orderStatus === 'pending' && (
                                <button
                                    onClick={() => {
                                        updateOrderStatus(selectedOrder._id, 'processing');
                                        setSelectedOrder(null);
                                    }}
                                    className="btn-primary px-6 border-none shadow-glow-sm"
                                >
                                    {language === 'en' ? 'Process Order' : 'Xác nhận đơn'}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminDashboard;
