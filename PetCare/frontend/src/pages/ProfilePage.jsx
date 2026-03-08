import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiCamera, FiPackage, FiCalendar, FiSave, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { authAPI, orderAPI, appointmentAPI } from '../services/api';
import { Modal, Badge, EmptyState, Spinner } from '../components/common/UI';
import toast from 'react-hot-toast';

const ProfilePage = () => {
    const { t, language } = useLanguage();
    const { user, isAuthenticated, updateUser } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        address: '',
        avatar: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        setEditForm({
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || '',
            avatar: user?.avatar || ''
        });
        fetchData();
    }, [isAuthenticated, navigate, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [ordersRes, appointmentsRes] = await Promise.all([
                orderAPI.getAll().catch(() => ({ data: { orders: [] } })),
                appointmentAPI.getAll().catch(() => ({ data: { appointments: [] } }))
            ]);
            setOrders(ordersRes.data.orders || []);
            setAppointments(appointmentsRes.data.appointments || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const response = await authAPI.updateProfile(editForm);
            if (response.data.success) {
                updateUser(response.data.user);
                toast.success(language === 'en' ? 'Profile updated!' : 'Cập nhật thành công!');
                setIsEditing(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'primary',
            completed: 'success',
            cancelled: 'danger',
            processing: 'primary',
            shipped: 'primary',
            delivered: 'success'
        };
        return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
    };

    const tabs = [
        { id: 'profile', label: language === 'en' ? 'Personal Info' : 'Thông tin cá nhân', icon: FiUser },
        { id: 'orders', label: language === 'en' ? 'My Orders' : 'Đơn hàng', icon: FiPackage },
        { id: 'appointments', label: language === 'en' ? 'My Appointments' : 'Lịch hẹn', icon: FiCalendar }
    ];

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-dark-300 flex items-center justify-center pt-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-300 pt-24 pb-12">
            <div className="container-custom">
                {/* Header */}
                <div className="card-glass p-6 mb-6 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-primary rounded-2xl flex items-center justify-center text-4xl text-white overflow-hidden shadow-glow-sm">
                                {user?.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors">
                                    <FiCamera className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl font-display font-bold text-white">{user?.name}</h1>
                            <p className="text-gray-400">{user?.email}</p>
                            <p className="text-sm text-gray-500 mt-1">
                                {language === 'en' ? 'Member since' : 'Thành viên từ'} {user?.createdAt ? format(new Date(user.createdAt), 'MM/yyyy') : ''}
                            </p>
                        </div>
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn-primary"
                            >
                                <FiEdit2 className="mr-2" />
                                {language === 'en' ? 'Edit Profile' : 'Chỉnh sửa'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl w-fit animate-fade-in-up delay-100">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gradient-primary text-white shadow-glow-sm'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <tab.icon className="mr-2 w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="card-glass p-6 animate-fade-in-up delay-200">
                    {activeTab === 'profile' && (
                        <div>
                            {isEditing ? (
                                <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {language === 'en' ? 'Full Name' : 'Họ và tên'}
                                        </label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="input"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {language === 'en' ? 'Phone' : 'Số điện thoại'}
                                        </label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="input"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {language === 'en' ? 'Address' : 'Địa chỉ'}
                                        </label>
                                        <textarea
                                            value={editForm.address}
                                            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                            className="input resize-none"
                                            rows={3}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            {language === 'en' ? 'Avatar URL' : 'URL ảnh đại diện'}
                                        </label>
                                        <input
                                            type="url"
                                            value={editForm.avatar}
                                            onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                                            className="input"
                                            placeholder="https://example.com/avatar.jpg"
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button type="submit" className="btn-primary">
                                            <FiSave className="mr-2" />
                                            {t('common.save')}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="btn-ghost"
                                        >
                                            <FiX className="mr-2" />
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                                <FiUser className="w-5 h-5 text-primary-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">{language === 'en' ? 'Full Name' : 'Họ và tên'}</p>
                                                <p className="font-medium text-white">{user?.name || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="w-12 h-12 bg-secondary-500/20 rounded-xl flex items-center justify-center">
                                                <FiMail className="w-5 h-5 text-secondary-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Email</p>
                                                <p className="font-medium text-white">{user?.email || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                                                <FiPhone className="w-5 h-5 text-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">{language === 'en' ? 'Phone' : 'Số điện thoại'}</p>
                                                <p className="font-medium text-white">{user?.phone || '-'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                                <FiMapPin className="w-5 h-5 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">{language === 'en' ? 'Address' : 'Địa chỉ'}</p>
                                                <p className="font-medium text-white">{user?.address || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div>
                            <h3 className="text-xl font-semibold text-theme mb-4">
                                {language === 'en' ? 'Order History' : 'Lịch sử đơn hàng'}
                            </h3>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Spinner />
                                </div>
                            ) : orders.length === 0 ? (
                                <EmptyState
                                    icon={<FiPackage className="w-12 h-12 text-theme-secondary" />}
                                    title={language === 'en' ? 'No orders yet' : 'Chưa có đơn hàng'}
                                    description={language === 'en' ? 'Your order history will appear here' : 'Lịch sử đơn hàng sẽ hiển thị ở đây'}
                                    action={
                                        <Link to="/shop" className="btn-primary">
                                            {language === 'en' ? 'Start Shopping' : 'Mua sắm ngay'}
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="space-y-6">
                                    {orders.map((order) => {
                                        // Order status progress
                                        const statusSteps = ['pending', 'processing', 'shipping', 'delivered'];
                                        const currentStep = statusSteps.indexOf(order.orderStatus || 'pending');
                                        const statusLabels = {
                                            pending: language === 'en' ? 'Pending' : 'Chờ xử lý',
                                            processing: language === 'en' ? 'Processing' : 'Đang xử lý',
                                            shipping: language === 'en' ? 'Shipping' : 'Đang giao',
                                            delivered: language === 'en' ? 'Delivered' : 'Đã giao'
                                        };

                                        return (
                                            <div key={order._id} className="card-glass overflow-hidden">
                                                {/* Order Header */}
                                                <div className="bg-theme-tertiary p-4 flex flex-wrap justify-between items-center gap-4">
                                                    <div>
                                                        <p className="font-semibold text-theme">
                                                            {language === 'en' ? 'Order' : 'Đơn hàng'} #{order.orderNumber || order._id?.slice(-8)}
                                                        </p>
                                                        <p className="text-sm text-theme-secondary">
                                                            {order.createdAt ? format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm') : ''}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {getStatusBadge(order.orderStatus || order.status || 'pending')}
                                                        {order.paymentStatus && getStatusBadge(order.paymentStatus)}
                                                    </div>
                                                </div>

                                                {/* Order Status Tracking */}
                                                <div className="p-4 bg-theme-tertiary/50">
                                                    <p className="text-sm text-theme-secondary mb-3">
                                                        {language === 'en' ? 'Order Status' : 'Trạng thái đơn hàng'}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        {statusSteps.map((step, idx) => (
                                                            <div key={step} className="flex items-center flex-1">
                                                                <div className="flex flex-col items-center">
                                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${idx <= currentStep
                                                                            ? 'bg-gradient-primary text-white shadow-glow-sm'
                                                                            : 'bg-theme-tertiary text-theme-muted'
                                                                        }`}>
                                                                        {idx < currentStep ? '✓' : idx + 1}
                                                                    </div>
                                                                    <span className={`text-xs mt-1 text-center ${idx <= currentStep ? 'text-primary-400 font-medium' : 'text-theme-muted'
                                                                        }`}>
                                                                        {statusLabels[step]}
                                                                    </span>
                                                                </div>
                                                                {idx < statusSteps.length - 1 && (
                                                                    <div className={`flex-1 h-0.5 mx-2 ${idx < currentStep ? 'bg-primary-500' : 'bg-theme-tertiary'
                                                                        }`} />
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div className="p-4 divide-y divide-theme">
                                                    {order.items?.map((item, idx) => (
                                                        <div key={idx} className="py-3 flex items-center gap-4">
                                                            <div className="w-16 h-16 bg-theme-tertiary rounded-lg flex items-center justify-center flex-shrink-0">
                                                                {item.product?.images?.[0] ? (
                                                                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                                                                ) : (
                                                                    <span className="text-2xl">📦</span>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-theme truncate">
                                                                    {item.product?.name || item.name || 'Sản phẩm'}
                                                                </p>
                                                                <p className="text-sm text-theme-secondary">
                                                                    {language === 'en' ? 'Qty:' : 'SL:'} {item.quantity}
                                                                </p>
                                                            </div>
                                                            <p className="font-semibold text-theme">
                                                                {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}₫
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Order Footer */}
                                                <div className="bg-theme-tertiary p-4 flex justify-between items-center">
                                                    <div className="text-sm text-theme-secondary">
                                                        {order.items?.length || 0} {language === 'en' ? 'items' : 'sản phẩm'}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-theme-secondary">{language === 'en' ? 'Total' : 'Tổng cộng'}</p>
                                                        <p className="text-xl font-bold text-gradient">
                                                            {new Intl.NumberFormat('vi-VN').format(order.totalAmount || order.total || 0)}₫
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'appointments' && (
                        <div>
                            <h3 className="text-xl font-semibold text-white mb-4">
                                {language === 'en' ? 'Appointment History' : 'Lịch sử đặt lịch'}
                            </h3>
                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <Spinner />
                                </div>
                            ) : appointments.length === 0 ? (
                                <EmptyState
                                    icon={<FiCalendar className="w-12 h-12 text-gray-500" />}
                                    title={language === 'en' ? 'No appointments yet' : 'Chưa có lịch hẹn'}
                                    description={language === 'en' ? 'Your appointments will appear here' : 'Lịch hẹn sẽ hiển thị ở đây'}
                                    action={
                                        <Link to="/booking" className="btn-primary">
                                            {language === 'en' ? 'Book Now' : 'Đặt lịch ngay'}
                                        </Link>
                                    }
                                />
                            ) : (
                                <div className="space-y-4">
                                    {appointments.map((appointment) => {
                                        const serviceIcons = { grooming: <img src="https://images.pexels.com/photos/6131569/pexels-photo-6131569.jpeg" alt="Grooming" className="w-full h-full object-cover rounded-xl" />, vaccination: <img src="https://images.pexels.com/photos/7469213/pexels-photo-7469213.jpeg" alt="Vaccination" className="w-full h-full object-cover rounded-xl" />, checkup: <img src="https://images.pexels.com/photos/6816836/pexels-photo-6816836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Checkup" className="w-full h-full object-cover rounded-xl" />, surgery: <img src="https://images.pexels.com/photos/18726828/pexels-photo-18726828.jpeg" alt="Surgery" className="w-full h-full object-cover rounded-xl" />, boarding: <img src="https://images.pexels.com/photos/6821106/pexels-photo-6821106.jpeg" alt="Boarding" className="w-full h-full object-cover rounded-xl" />, training: <img src="https://images.pexels.com/photos/15322829/pexels-photo-15322829.jpeg" alt="Training" className="w-full h-full object-cover rounded-xl" /> };
                                        const servicePrices = { grooming: 250000, vaccination: 150000, checkup: 200000, surgery: 500000, boarding: 300000, training: 350000 };
                                        return (
                                            <div key={appointment._id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                                {/* Header */}
                                                <div className="bg-white/5 p-4 flex flex-wrap justify-between items-center gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center text-2xl">
                                                            {serviceIcons[appointment.service] || '📋'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white capitalize">
                                                                {appointment.service}
                                                            </p>
                                                            <p className="text-sm text-gray-500">
                                                                {language === 'en' ? 'Booking' : 'Mã đặt'} #{appointment._id?.slice(-6)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(appointment.status)}
                                                </div>

                                                {/* Content */}
                                                <div className="p-4 grid sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'Date & Time' : 'Ngày & giờ'}</p>
                                                        <p className="font-medium text-white">
                                                            📅 {appointment.date ? format(new Date(appointment.date), 'dd/MM/yyyy') : ''}<br />
                                                            🕐 {appointment.timeSlot}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'Details' : 'Chi tiết'}</p>
                                                        <p className="font-medium text-white">
                                                            {appointment.pet && <span>🐾 {appointment.pet.name}<br /></span>}
                                                            {appointment.staff && <span>👨‍⚕️ {appointment.staff.name}</span>}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="bg-white/5 p-4 flex justify-between items-center">
                                                    {appointment.notes && (
                                                        <p className="text-sm text-gray-500 italic">{appointment.notes}</p>
                                                    )}
                                                    {!appointment.notes && <div />}
                                                    <p className="font-semibold text-gradient">
                                                        {new Intl.NumberFormat('vi-VN').format(servicePrices[appointment.service] || 200000)}₫
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
