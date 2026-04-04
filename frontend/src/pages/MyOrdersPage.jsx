import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { FiPackage, FiClock, FiCheckCircle, FiTruck, FiInfo, FiSearch, FiFilter, FiDollarSign, FiCalendar, FiBox } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { Modal, Spinner, EmptyState, Badge } from '../components/common/UI';
import toast from 'react-hot-toast';

const MyOrdersPage = () => {
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, pending, processing, shipping, delivered
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated, navigate]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await orderAPI.getAll();
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(language === 'en' ? 'Failed to load orders' : 'Không thể tải đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'primary',
            processing: 'warning',
            shipped: 'primary',
            delivered: 'success',
            cancelled: 'danger',
            failed: 'danger'
        };

        const labels = {
            pending: language === 'en' ? 'Awaiting Confirmation' : 'Chờ xác nhận',
            confirmed: language === 'en' ? 'Confirmed' : 'Đã xác nhận',
            processing: language === 'en' ? 'Processing' : 'Đang thực hiện',
            shipped: language === 'en' ? 'Shipping' : 'Đang giao hàng',
            delivered: language === 'en' ? 'Delivered' : 'Hoàn thành',
            cancelled: language === 'en' ? 'Cancelled' : 'Đã hủy',
        };

        const icons = {
            pending: <FiClock className="w-3 h-3" />,
            processing: <FiBox className="w-3 h-3" />,
            shipped: <FiTruck className="w-3 h-3" />,
            delivered: <FiCheckCircle className="w-3 h-3" />,
        };

        return {
            label: labels[status] || status,
            variant: variants[status] || 'gray',
            icon: icons[status] || null
        };
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

    const filteredOrders = orders.filter(order => {
        const matchesTab = activeTab === 'all' || 
            (activeTab === 'pending' && order.orderStatus === 'pending') ||
            (activeTab === 'processing' && order.orderStatus === 'processing') ||
            (activeTab === 'shipping' && order.orderStatus === 'shipped') ||
            (activeTab === 'delivered' && order.orderStatus === 'delivered');
            
        const matchesSearch = 
            order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items?.some(item => item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

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
                        <h1 className="text-4xl font-display font-bold text-[#1e293b] mb-2">
                            {language === 'en' ? 'My Orders' : 'Đơn hàng của tôi'}
                        </h1>
                        <p className="text-[#64748b] max-w-2xl">
                            {language === 'en'
                                ? 'Track your purchases and order history.'
                                : 'Theo dõi các sản phẩm đã mua và lịch sử đơn hàng của bạn.'}
                        </p>
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100">
                    {/* Tabs & Search */}
                    <div className="p-6 border-b border-gray-50 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex bg-gray-50 p-1 rounded-xl w-fit overflow-x-auto no-scrollbar">
                            {[
                                { id: 'all', label: language === 'en' ? 'All' : 'Tất cả' },
                                { id: 'pending', label: language === 'en' ? 'Pending' : 'Chờ xác nhận' },
                                { id: 'processing', label: language === 'en' ? 'Processing' : 'Đang xử lý' },
                                { id: 'shipping', label: language === 'en' ? 'Shipping' : 'Đang giao' },
                                { id: 'delivered', label: language === 'en' ? 'Delivered' : 'Hoàn thành' },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                                            ? 'bg-primary-500 text-[#1e293b] shadow-md scale-[1.02]'
                                            : 'text-gray-500 hover:text-primary-500'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative group w-full lg:w-96">
                            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder={language === 'en' ? 'Search order number, product...' : 'Tìm mã đơn, tên sản phẩm...'}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-[#1e293b] focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Orders List */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-[#64748b] text-xs font-bold uppercase tracking-wider">
                                    <th className="px-8 py-5">{language === 'en' ? 'Order' : 'Đơn hàng'}</th>
                                    <th className="px-8 py-5">{language === 'en' ? 'Date' : 'Ngày đặt'}</th>
                                    <th className="px-8 py-5">{language === 'en' ? 'Total' : 'Tổng tiền'}</th>
                                    <th className="px-8 py-5">{language === 'en' ? 'Status' : 'Trạng thái'}</th>
                                    <th className="px-8 py-5 text-center">{language === 'en' ? 'Action' : 'Thao tác'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-xl">
                                                        📦
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#1e293b]">#{order.orderNumber}</p>
                                                        <p className="text-xs text-[#64748b] line-clamp-1">
                                                            {order.items?.length} {language === 'en' ? 'products' : 'sản phẩm'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center space-x-2 text-[#475569]">
                                                    <FiCalendar className="text-primary-500" />
                                                    <span>{format(new Date(order.createdAt), 'dd/MM/yyyy')}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 font-bold text-[#1e293b]">
                                                {formatPrice(order.totalAmount)}
                                            </td>
                                            <td className="px-8 py-6">
                                                {(() => {
                                                    const info = getStatusInfo(order.orderStatus);
                                                    return (
                                                        <Badge variant={info.variant}>
                                                            <div className="flex items-center space-x-1">
                                                                {info.icon}
                                                                <span>{info.label}</span>
                                                            </div>
                                                        </Badge>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 rounded-lg bg-gray-50 text-gray-500 hover:text-primary-500 hover:bg-primary-50 transition-all"
                                                        title={language === 'en' ? 'View details' : 'Xem chi tiết'}
                                                    >
                                                        <FiInfo className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10">
                                            <EmptyState
                                                title={language === 'en' ? 'No orders found' : 'Không tìm thấy đơn hàng nào'}
                                                description={language === 'en' ? 'Start shopping to see your orders here!' : 'Bác hãy mua sắm để thấy đơn hàng tại đây nhé!'}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={language === 'en' ? 'Order Details' : 'Chi tiết đơn hàng'}
                size="lg"
            >
                {selectedOrder && (
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100 justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-2xl">
                                    <FiPackage className="text-primary-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#1e293b] mb-0.5">#{selectedOrder.orderNumber}</h3>
                                    <p className="text-sm text-[#64748b]">{format(new Date(selectedOrder.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {(() => {
                                    const info = getStatusInfo(selectedOrder.orderStatus);
                                    return <Badge variant={info.variant}>{info.label}</Badge>;
                                })()}
                                <Badge variant={selectedOrder.paymentStatus === 'paid' ? 'success' : 'warning'}>
                                    {selectedOrder.paymentStatus === 'paid' 
                                        ? (language === 'en' ? 'Paid' : 'Đã thanh toán')
                                        : (language === 'en' ? 'Unpaid' : 'Chưa thanh toán')}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-gray-100">
                                <h4 className="text-sm font-semibold text-primary-500 mb-3 uppercase tracking-wider">
                                    {language === 'en' ? 'Shipping Address' : 'Địa chỉ giao hàng'}
                                </h4>
                                <div className="space-y-1 text-sm text-[#475569]">
                                    <p className="font-bold text-[#1e293b]">{selectedOrder.shippingAddress?.fullName}</p>
                                    <p>{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}</p>
                                    <p>📱 {selectedOrder.shippingAddress?.phone}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-gray-100">
                                <h4 className="text-sm font-semibold text-primary-500 mb-3 uppercase tracking-wider">
                                    {language === 'en' ? 'Payment Method' : 'Thanh toán'}
                                </h4>
                                <div className="space-y-1 text-sm text-[#475569]">
                                    <p className="font-bold text-[#1e293b] uppercase">{selectedOrder.paymentMethod}</p>
                                    <p>{selectedOrder.paymentStatus === 'paid' 
                                        ? (language === 'en' ? 'Transaction successful' : 'Giao dịch thành công')
                                        : (language === 'en' ? 'Awaiting payment' : 'Đang chờ thanh toán')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-gray-100 overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left p-3 text-[#64748b]">{language === 'en' ? 'Product' : 'Sản phẩm'}</th>
                                        <th className="text-center p-3 text-[#64748b]">{language === 'en' ? 'Qty' : 'SL'}</th>
                                        <th className="text-right p-3 text-[#64748b]">{language === 'en' ? 'Price' : 'Giá'}</th>
                                        <th className="text-right p-3 text-[#64748b]">{language === 'en' ? 'Subtotal' : 'Thành tiền'}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.items?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td className="p-3">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-50 overflow-hidden">
                                                        {item.product?.images?.[0] ? (
                                                            <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs">📦</div>
                                                        )}
                                                    </div>
                                                    <span className="text-[#1e293b] font-medium">{item.name || item.product?.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center text-[#475569]">x{item.quantity}</td>
                                            <td className="p-3 text-right text-[#475569]">{formatPrice(item.price)}</td>
                                            <td className="p-3 text-right text-[#1e293b] font-semibold">{formatPrice(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-50">
                            <div className="text-right space-y-2">
                                <div className="flex justify-between w-64 text-sm font-bold">
                                    <span className="text-[#1e293b]">{language === 'en' ? 'Total' : 'Tổng cộng'}</span>
                                    <span className="text-xl text-primary-500">{formatPrice(selectedOrder.totalAmount || 0)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-6">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="btn-primary px-8"
                            >
                                {language === 'en' ? 'Close' : 'Đóng'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MyOrdersPage;
