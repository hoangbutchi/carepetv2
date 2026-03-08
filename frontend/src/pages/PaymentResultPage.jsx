import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { useLanguage } from '../i18n/LanguageContext';

const PaymentResultPage = () => {
    const { t, language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);

    useEffect(() => {
        // Parse the query parameters from MoMo's redirect URL
        const searchParams = new URLSearchParams(location.search);
        const resultCode = searchParams.get('resultCode');
        const orderId = searchParams.get('orderId');
        const message = searchParams.get('message');
        const amount = searchParams.get('amount');

        if (!orderId) {
            navigate('/');
            return;
        }

        setResultData({
            isSuccess: resultCode === '0',
            orderId,
            message,
            amount: amount ? new Intl.NumberFormat('vi-VN').format(amount) + '₫' : ''
        });
    }, [location, navigate]);

    if (!resultData) return null;

    return (
        <div className="min-h-screen bg-dark-300 pt-24 pb-12 flex items-center justify-center">
            <div className="card-glass p-12 max-w-lg w-full text-center animate-fade-in-up">
                {resultData.isSuccess ? (
                    <>
                        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                            <FiCheckCircle className="w-12 h-12 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-white mb-4">
                            {language === 'en' ? 'Payment Successful!' : 'Thanh Toán Thành Công!'}
                        </h1>
                        <p className="text-gray-400 mb-6">
                            {language === 'en' 
                                ? 'Thank you for your purchase. Your order is being processed.' 
                                : 'Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.'}
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                            <FiXCircle className="w-12 h-12 text-red-400" />
                        </div>
                        <h1 className="text-3xl font-display font-bold text-white mb-4">
                            {language === 'en' ? 'Payment Failed' : 'Thanh Toán Thất Bại'}
                        </h1>
                        <p className="text-red-400 mb-6 font-medium">
                            {resultData.message || (language === 'en' ? 'Transaction was cancelled or encountered an error.' : 'Giao dịch đã bị hủy hoặc gặp lỗi.')}
                        </p>
                    </>
                )}

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{language === 'en' ? 'Order ID:' : 'Mã đơn hàng:'}</span>
                        <span className="text-white font-medium">{resultData.orderId}</span>
                    </div>
                    {resultData.amount && (
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">{language === 'en' ? 'Amount:' : 'Số tiền:'}</span>
                            <span className="text-primary-400 font-bold">{resultData.amount}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={() => navigate('/')} 
                        className="btn-outline px-6 py-3"
                    >
                        {language === 'en' ? 'Back to Home' : 'Về trang chủ'}
                    </button>
                    {!resultData.isSuccess && (
                        <button 
                            onClick={() => navigate('/checkout')} 
                            className="bg-pink-600 hover:bg-pink-700 text-white font-medium px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-pink-500/25"
                        >
                            {language === 'en' ? 'Try Again' : 'Thử lại'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentResultPage;
