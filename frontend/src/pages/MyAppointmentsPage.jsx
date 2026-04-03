import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiInfo, FiChevronRight, FiSearch, FiFilter, FiUser, FiActivity, FiStar } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI } from '../services/api';
import { Modal, FormTextarea, Spinner, EmptyState } from '../components/common/UI';
import toast from 'react-hot-toast';

const MyAppointmentsPage = () => {
    const { t, language } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('unprocessed'); // 'unprocessed' or 'processed'
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Rating State
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingForm, setRatingForm] = useState({
        rating: 5,
        feedback: ''
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchAppointments();
    }, [isAuthenticated, navigate]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const response = await appointmentAPI.getAll();
            setAppointments(response.data.appointments);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            toast.error(language === 'en' ? 'Failed to load appointments' : 'Không thể tải lịch hẹn');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelAppointment = async (id) => {
        if (!window.confirm(language === 'en' ? 'Are you sure you want to cancel this appointment?' : 'Bạn có chắc chắn muốn hủy lịch hẹn này?')) {
            return;
        }

        try {
            await appointmentAPI.update(id, { status: 'cancelled' });
            toast.success(language === 'en' ? 'Appointment cancelled' : 'Đã hủy lịch hẹn');
            fetchAppointments();
            setSelectedAppointment(null);
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const handleRateAppointment = async (e) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        try {
            await appointmentAPI.update(selectedAppointment._id, {
                ...ratingForm,
                status: 'rated'
            });
            toast.success(language === 'en' ? 'Thank you for your feedback!' : 'Cảm ơn bác đã đánh giá!');
            setShowRatingModal(false);
            setSelectedAppointment(null);
            fetchAppointments();
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'pending':
                return {
                    label: language === 'en' ? 'Pending' : 'Chờ xác nhận',
                    color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                    icon: <FiClock className="w-3 h-3" />
                };
            case 'confirmed':
                return {
                    label: language === 'en' ? 'Confirmed' : 'Đã xác nhận',
                    color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                    icon: <FiCheckCircle className="w-3 h-3" />
                };
            case 'processing':
                return {
                    label: language === 'en' ? 'Processing' : 'Đang xử lý',
                    color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                    icon: <FiActivity className="w-3 h-3" />
                };
            case 'completed':
                return {
                    label: language === 'en' ? 'Completed' : 'Hoàn thành',
                    color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                    icon: <FiCheckCircle className="w-3 h-3" />
                };
            case 'rated':
                return {
                    label: language === 'en' ? 'Rated' : 'Đã đánh giá',
                    color: 'bg-primary-500/10 text-primary-500 border-primary-500/20',
                    icon: <FiStar className="w-3 h-3" />
                };
            case 'cancelled':
                return {
                    label: language === 'en' ? 'Cancelled' : 'Đã hủy',
                    color: 'bg-red-500/10 text-red-500 border-red-500/20',
                    icon: <FiXCircle className="w-3 h-3" />
                };
            default:
                return { label: status, color: 'bg-gray-500/10 text-gray-500', icon: null };
        }
    };

    const getServiceName = (service) => {
        if (language === 'en') {
            const en = { grooming: 'Grooming', vaccination: 'Vaccination', checkup: 'Checkup', surgery: 'Surgery', boarding: 'Boarding', training: 'Training' };
            return en[service] || service;
        }
        const vi = { grooming: 'Tắm & Cắt tỉa lông', vaccination: 'Tiêm vắc-xin', checkup: 'Khám định kỳ', surgery: 'Phẫu thuật', boarding: 'Trông giữ thú cưng', training: 'Huấn luyện' };
        return vi[service] || service;
    };

    const getServiceIcon = (service) => {
        const icons = { grooming: '✂️', vaccination: '💉', checkup: '🩺', surgery: '🏥', boarding: '🏠', training: '🎾' };
        return icons[service] || '📋';
    };

    const filteredAppointments = appointments.filter(app => {
        const isProcessed = ['completed', 'rated', 'cancelled'].includes(app.status);
        const matchesTab = activeTab === 'processed' ? isProcessed : !isProcessed;
        const matchesSearch =
            app.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.pet?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.staff?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesTab && matchesSearch;
    });

    if (loading) {
        return (
            <div className="pt-32 pb-20 flex justify-center items-center">
                <Spinner size="lg" className="border-primary-500" />
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 min-h-screen bg-theme-light">
            <div className="container-custom">
                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-theme mb-2">
                            {language === 'en' ? 'My Appointments' : 'Lịch hẹn của tôi'}
                        </h1>
                        <p className="text-theme-secondary max-w-2xl">
                            {language === 'en'
                                ? 'Manage and track all your pet care service appointments.'
                                : 'Quản lý và theo dõi tất cả các lịch hẹn dịch vụ cho thú cưng của bạn.'}
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="card-glass rounded-3xl overflow-hidden shadow-xl border border-white/10">
                    {/* Tabs & Search */}
                    <div className="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex bg-theme-tertiary/50 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('unprocessed')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 'unprocessed'
                                        ? 'bg-primary-500 text-white shadow-glow-sm scale-[1.02]'
                                        : 'text-theme-secondary hover:text-theme'
                                    }`}
                            >
                                <FiActivity className="w-4 h-4" />
                                <span>{language === 'en' ? 'Unprocessed' : 'Chưa xử lý'}</span>
                                {appointments.filter(a => !['completed', 'rated', 'cancelled'].includes(a.status)).length > 0 && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'unprocessed' ? 'bg-white text-primary-500' : 'bg-primary-500/20 text-primary-500'
                                        }`}>
                                        {appointments.filter(a => !['completed', 'rated', 'cancelled'].includes(a.status)).length}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('processed')}
                                className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${activeTab === 'processed'
                                        ? 'bg-primary-500 text-white shadow-glow-sm scale-[1.02]'
                                        : 'text-theme-secondary hover:text-theme'
                                    }`}
                            >
                                <FiCheckCircle className="w-4 h-4" />
                                <span>{language === 'en' ? 'Processed' : 'Đã xử lý'}</span>
                            </button>
                        </div>

                        <div className="relative group w-full lg:w-96">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-primary-400 transition-colors" />
                            <input
                                type="text"
                                placeholder={language === 'en' ? 'Search service, pet, staff...' : 'Tìm dịch vụ, thú cưng, bác sĩ...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-theme-tertiary border border-white/10 rounded-xl py-3 pl-12 pr-4 text-theme focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Table View (Desktop) */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-theme-secondary text-xs font-bold uppercase tracking-wider">
                                    <th className="px-8 py-5">{language === 'en' ? 'Service/Pet' : 'Dịch vụ/Thú cưng'}</th>
                                    <th className="px-8 py-5">{language === 'en' ? 'Staff/Doctor' : 'Bác sĩ/Nhân viên'}</th>
                                    <th className="px-8 py-5">{language === 'en' ? 'Date & Time' : 'Ngày & Giờ'}</th>
                                    <th className="px-8 py-5">{language === 'en' ? 'Status' : 'Trạng thái'}</th>
                                    <th className="px-8 py-5 text-center">{language === 'en' ? 'Action' : 'Thao tác'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredAppointments.length > 0 ? (
                                    filteredAppointments.map((app) => (
                                        <tr key={app._id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl shadow-glow-sm">
                                                        {getServiceIcon(app.service)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-theme">{getServiceName(app.service)}</p>
                                                        <p className="text-xs text-primary-400">🐾 {app.pet?.name || '---'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-2">
                                                    <FiUser className="text-theme-muted" />
                                                    <span className="text-theme font-medium">{app.staff?.name || '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-theme">
                                                        <FiCalendar className="w-4 h-4 text-primary-400" />
                                                        <span className="font-semibold">{format(new Date(app.date), 'dd/MM/yyyy')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-theme-secondary text-sm">
                                                        <FiClock className="w-4 h-4 text-primary-400" />
                                                        <span>{app.timeSlot}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {(() => {
                                                    const info = getStatusInfo(app.status);
                                                    return (
                                                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${info.color}`}>
                                                            {info.icon}
                                                            <span>{info.label}</span>
                                                        </span>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => setSelectedAppointment(app)}
                                                        className="p-2 rounded-lg bg-white/5 text-theme-secondary hover:text-primary-500 hover:bg-primary-500/10 transition-all shadow-sm"
                                                        title={language === 'en' ? 'View details' : 'Xem chi tiết'}
                                                    >
                                                        <FiInfo className="w-5 h-5" />
                                                    </button>
                                                    {['pending', 'confirmed'].includes(app.status) && (
                                                        <button
                                                            onClick={() => handleCancelAppointment(app._id)}
                                                            className="p-2 rounded-lg bg-white/5 text-theme-secondary hover:text-red-500 hover:bg-red-500/10 transition-all shadow-sm"
                                                            title={language === 'en' ? 'Cancel' : 'Hủy lịch'}
                                                        >
                                                            <FiXCircle className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    {app.status === 'completed' && !app.rating && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedAppointment(app);
                                                                setShowRatingModal(true);
                                                                setRatingForm({ rating: 5, feedback: '' });
                                                            }}
                                                            className="p-2 rounded-lg bg-white/5 text-theme-secondary hover:text-yellow-500 hover:bg-yellow-500/10 transition-all shadow-sm"
                                                            title={language === 'en' ? 'Rate' : 'Đánh giá'}
                                                        >
                                                            <FiStar className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10">
                                            <EmptyState
                                                title={language === 'en' ? 'No appointments found' : 'Không tìm thấy lịch hẹn nào'}
                                                description={language === 'en' ? 'You haven\'t scheduled any service yet.' : 'Bác chưa có lịch hẹn dịch vụ nào.'}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile View */}
                    <div className="md:hidden divide-y divide-white/5">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((app) => (
                                <div key={app._id} className="p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-2xl">
                                                {getServiceIcon(app.service)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-theme">{getServiceName(app.service)}</h3>
                                                <p className="text-xs text-primary-400">🐾 {app.pet?.name}</p>
                                            </div>
                                        </div>
                                        {(() => {
                                            const info = getStatusInfo(app.status);
                                            return (
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${info.color}`}>
                                                    {info.label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="text-theme-secondary">
                                            <p className="mb-1">{language === 'en' ? 'Date' : 'Ngày'}</p>
                                            <p className="text-theme font-semibold">{format(new Date(app.date), 'dd/MM/yyyy')}</p>
                                        </div>
                                        <div className="text-theme-secondary">
                                            <p className="mb-1">{language === 'en' ? 'Time' : 'Giờ'}</p>
                                            <p className="text-theme font-semibold">{app.timeSlot}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center text-sm text-theme-secondary">
                                            <FiUser className="mr-2" />
                                            <span>{app.staff?.name}</span>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => setSelectedAppointment(app)}
                                                className="px-4 py-2 rounded-lg bg-primary-500/10 text-primary-500 text-xs font-bold"
                                            >
                                                {language === 'en' ? 'Details' : 'Chi tiết'}
                                            </button>
                                            {['pending', 'confirmed'].includes(app.status) && (
                                                <button
                                                    onClick={() => handleCancelAppointment(app._id)}
                                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-bold"
                                                >
                                                    {language === 'en' ? 'Cancel' : 'Hủy'}
                                                </button>
                                            )}
                                            {app.status === 'completed' && !app.rating && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedAppointment(app);
                                                        setShowRatingModal(true);
                                                        setRatingForm({ rating: 5, feedback: '' });
                                                    }}
                                                    className="px-4 py-2 rounded-lg bg-yellow-500/10 text-yellow-500 text-xs font-bold"
                                                >
                                                    {language === 'en' ? 'Rate' : 'Đánh giá'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center opacity-40">
                                <EmptyState
                                    title={language === 'en' ? 'No appointments' : 'Không có lịch hẹn'}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedAppointment && !showRatingModal}
                onClose={() => setSelectedAppointment(null)}
                title={language === 'en' ? 'Appointment Detail' : 'Chi tiết lịch hẹn'}
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
                                    {getServiceName(selectedAppointment.service)}
                                </h3>
                                {(() => {
                                    const info = getStatusInfo(selectedAppointment.status);
                                    return (
                                        <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${info.color}`}>
                                            {info.icon}
                                            <span>{info.label}</span>
                                        </span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Pet Info */}
                        <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center text-2xl">
                                {selectedAppointment.pet?.species === 'dog' ? '🐕' : '🐈'}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-0.5">{language === 'en' ? 'Pet Name' : 'Tên thú cưng'}</p>
                                <p className="font-semibold text-white">
                                    {selectedAppointment.pet?.name} ({selectedAppointment.pet?.species})
                                </p>
                                <p className="text-xs text-primary-400">
                                    {selectedAppointment.pet?.age} {language === 'en' ? 'years' : 'tuổi'} •
                                    {selectedAppointment.pet?.weight}kg •
                                    {selectedAppointment.pet?.gender === 'male' ? (language === 'en' ? 'Male' : 'Đực') : (language === 'en' ? 'Female' : 'Cái')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Date' : 'Ngày'}</p>
                                <p className="font-semibold text-white">
                                    {format(new Date(selectedAppointment.date), 'dd/MM/yyyy')}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Time' : 'Giờ'}</p>
                                <p className="font-semibold text-white">{selectedAppointment.timeSlot}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Staff/Doctor' : 'Nhân viên/Bác sĩ'}</p>
                            <p className="font-semibold text-white">{selectedAppointment.staff?.name}</p>
                            <p className="text-xs text-theme-muted">{selectedAppointment.staff?.email}</p>
                        </div>

                        {selectedAppointment.notes && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Your Notes' : 'Ghi chú của bạn'}</p>
                                <p className="text-gray-200">{selectedAppointment.notes}</p>
                            </div>
                        )}

                        {selectedAppointment.rating && (
                            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-yellow-500 font-medium">{language === 'en' ? 'Your Rating' : 'Đánh giá của bạn'}</p>
                                    <div className="flex text-yellow-400">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i}>{i < selectedAppointment.rating ? '★' : '☆'}</span>
                                        ))}
                                    </div>
                                </div>
                                {selectedAppointment.feedback && (
                                    <p className="text-gray-200 italic">"{selectedAppointment.feedback}"</p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-white/10">
                            {['pending', 'confirmed'].includes(selectedAppointment.status) && (
                                <button
                                    onClick={() => handleCancelAppointment(selectedAppointment._id)}
                                    className="btn-outline border-red-500/30 text-red-500 hover:bg-red-500/10 mr-auto"
                                >
                                    {language === 'en' ? 'Cancel Appointment' : 'Hủy lịch hẹn'}
                                </button>
                            )}
                            {selectedAppointment.status === 'completed' && !selectedAppointment.rating && (
                                <button
                                    onClick={() => {
                                        setShowRatingModal(true);
                                        setRatingForm({ rating: 5, feedback: '' });
                                    }}
                                    className="btn-primary mr-3"
                                >
                                    {language === 'en' ? 'Rate Now' : 'Đánh giá ngay'}
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="btn-ghost px-8"
                            >
                                {language === 'en' ? 'Close' : 'Đóng'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Rating Modal */}
            <Modal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                title={language === 'en' ? 'Rate Service' : 'Đánh giá dịch vụ'}
                size="md"
            >
                <form onSubmit={handleRateAppointment} className="space-y-6">
                    <div className="text-center">
                        <p className="text-theme-secondary mb-4">{language === 'en' ? 'How was your experience?' : 'Trải nghiệm của bác thế nào?'}</p>
                        <div className="flex justify-center space-x-2 text-4xl">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                                    className={`transition-all duration-200 ${ratingForm.rating >= star ? 'text-yellow-400 scale-110' : 'text-theme-tertiary hover:text-theme-secondary'}`}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                    </div>

                    <FormTextarea
                        label={language === 'en' ? 'Review & Feedback' : 'Nhận xét & Góp ý'}
                        value={ratingForm.feedback}
                        onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                        placeholder={language === 'en' ? 'Tell us more about the service...' : 'Chia sẻ thêm về trải nghiệm của bác...'}
                        required
                    />

                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowRatingModal(false)} className="btn-outline flex-1">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn-primary flex-1 shadow-glow-sm">
                            {language === 'en' ? 'Submit Feedback' : 'Gửi đánh giá'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default MyAppointmentsPage;
