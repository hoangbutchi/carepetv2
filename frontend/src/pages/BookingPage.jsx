import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheck, FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format, addDays } from 'date-fns';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { petAPI, appointmentAPI, authAPI } from '../services/api';
import toast from 'react-hot-toast';

const services = [
    { id: 'grooming', icon: <img src="https://images.pexels.com/photos/6131569/pexels-photo-6131569.jpeg" alt="Grooming" className="w-full h-full object-cover rounded-xl" />, price: 150000, color: 'from-pink-500 to-rose-600' },
    { id: 'vaccination', icon: <img src="https://images.pexels.com/photos/7469213/pexels-photo-7469213.jpeg" alt="Vaccination" className="w-full h-full object-cover rounded-xl" />, price: 200000, color: 'from-cyan-500 to-blue-600' },
    { id: 'checkup', icon: <img src="https://images.pexels.com/photos/6816836/pexels-photo-6816836.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Checkup" className="w-full h-full object-cover rounded-xl" />, price: 100000, color: 'from-green-500 to-emerald-600' },
    { id: 'surgery', icon: <img src="https://images.pexels.com/photos/18726828/pexels-photo-18726828.jpeg" alt="Surgery" className="w-full h-full object-cover rounded-xl" />, price: 500000, color: 'from-purple-500 to-violet-600' },
    { id: 'boarding', icon: <img src="https://images.pexels.com/photos/6821106/pexels-photo-6821106.jpeg" alt="Boarding" className="w-full h-full object-cover rounded-xl" />, price: 80000, color: 'from-orange-500 to-amber-600' },
    { id: 'training', icon: <img src="https://images.pexels.com/photos/15322829/pexels-photo-15322829.jpeg" alt="Training" className="w-full h-full object-cover rounded-xl" />, price: 300000, color: 'from-indigo-500 to-blue-600' },
];

const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '13:00-14:00', '14:00-15:00', '15:00-16:00', '16:00-17:00'
];

const BookingPage = () => {
    const { t, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();
    const { isDark } = useTheme();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [pets, setPets] = useState([]);
    const [staff, setStaff] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    const [booking, setBooking] = useState({
        service: searchParams.get('service') || '',
        pet: '',
        date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        timeSlot: '',
        staff: searchParams.get('staff') || '',
        notes: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            toast.error(language === 'en' ? 'Please login to book' : 'Vui lòng đăng nhập');
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const [petsRes, staffRes] = await Promise.all([
                    petAPI.getAll(),
                    authAPI.getStaff(),
                ]);
                setPets(petsRes.data.pets || []);
                setStaff(staffRes.data.staff || []);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [isAuthenticated, navigate, language]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (booking.date) {
                try {
                    const response = await appointmentAPI.getAvailableSlots(booking.date, booking.staff || undefined);
                    setAvailableSlots(response.data.slots || response.data.availableSlots || []);
                } catch (error) {
                    console.error('Error fetching slots:', error);
                }
            }
        };

        fetchSlots();
    }, [booking.date, booking.staff]);

    const selectedService = services.find(s => s.id === booking.service);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + '₫';
    };

    const handleNext = () => {
        if (step === 1 && !booking.service) {
            toast.error(language === 'en' ? 'Please select a service' : 'Vui lòng chọn dịch vụ');
            return;
        }
        if (step === 2 && (!booking.date || !booking.timeSlot)) {
            toast.error(language === 'en' ? 'Please select date and time' : 'Vui lòng chọn ngày và giờ');
            return;
        }
        if (step === 3 && !booking.pet) {
            toast.error(language === 'en' ? 'Please select a pet' : 'Vui lòng chọn thú cưng');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await appointmentAPI.create({
                service: booking.service,
                pet: booking.pet,
                staff: booking.staff || undefined,
                date: booking.date,
                timeSlot: booking.timeSlot,
                notes: booking.notes,
                price: selectedService?.price || 0,
            });
            toast.success(t('booking.bookingSuccess'));
            navigate('/my-pets');
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-12">
            {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-semibold transition-all duration-300 ${step > s
                                ? 'bg-green-500 text-white shadow-glow-sm'
                                : step === s
                                    ? 'bg-gradient-primary text-white shadow-glow-sm scale-110'
                                    : 'bg-white/10 text-gray-500'
                            }`}
                    >
                        {step > s ? <FiCheck className="w-5 h-5" /> : s}
                    </div>
                    {s < 4 && (
                        <div
                            className={`w-12 md:w-20 h-1 mx-2 rounded-full transition-colors duration-300 ${step > s ? 'bg-green-500' : 'bg-white/10'
                                }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );

    const renderStep1 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-display font-bold text-white mb-6">{t('booking.selectService')}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                    <button
                        key={service.id}
                        onClick={() => setBooking({ ...booking, service: service.id })}
                        className={`relative p-6 rounded-2xl text-left transition-all duration-300 group ${booking.service === service.id
                                ? 'card-glow ring-2 ring-primary-500'
                                : 'card-glass hover:bg-white/10'
                            }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                    >
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                            {service.icon}
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-1">{t(`services.${service.id}`)}</h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{t(`services.${service.id}Desc`)}</p>
                        <p className="text-xl font-bold text-gradient">{formatPrice(service.price)}</p>

                        {booking.service === service.id && (
                            <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                <FiCheck className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-display font-bold text-white mb-6">{t('booking.selectDate')}</h2>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Date Picker */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-3">
                        <FiCalendar className="mr-2 text-primary-400" />
                        {language === 'en' ? 'Select Date' : 'Chọn ngày'}
                    </label>
                    <input
                        type="date"
                        value={booking.date}
                        onChange={(e) => setBooking({ ...booking, date: e.target.value, timeSlot: '' })}
                        min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                        className="input"
                    />
                </div>

                {/* Staff Selection */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-300 mb-3">
                        <FiUser className="mr-2 text-primary-400" />
                        {t('booking.selectStaff')} <span className="text-gray-500 ml-1">({language === 'en' ? 'Optional' : 'Tùy chọn'})</span>
                    </label>
                    <select
                        value={booking.staff}
                        onChange={(e) => setBooking({ ...booking, staff: e.target.value, timeSlot: '' })}
                        className="input cursor-pointer"
                    >
                        <option value="">{language === 'en' ? 'Any available staff' : 'Bất kỳ nhân viên'}</option>
                        {staff.map((s) => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Time Slots */}
            <div className="mt-8">
                <label className="flex items-center text-sm font-medium text-gray-300 mb-4">
                    <FiClock className="mr-2 text-primary-400" />
                    {language === 'en' ? 'Select Time' : 'Chọn giờ'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {timeSlots.map((slot) => {
                        const isAvailable = Array.isArray(availableSlots)
                            ? (typeof availableSlots[0] === 'string'
                                ? availableSlots.includes(slot)
                                : availableSlots.find(s => s.slot === slot)?.available)
                            : true;

                        return (
                            <button
                                key={slot}
                                onClick={() => isAvailable && setBooking({ ...booking, timeSlot: slot })}
                                disabled={!isAvailable}
                                className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 ${booking.timeSlot === slot
                                        ? 'bg-gradient-primary text-white shadow-glow-sm'
                                        : isAvailable
                                            ? 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-primary-500/50'
                                            : 'bg-white/5 text-gray-600 cursor-not-allowed opacity-50'
                                    }`}
                            >
                                {slot}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-fade-in-up">
            <h2 className="text-2xl font-display font-bold text-white mb-6">{t('booking.yourPet')}</h2>

            {pets.length === 0 ? (
                <div className="text-center py-16 card-glass rounded-2xl">
                    <span className="text-6xl mb-4 block">🐾</span>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('pets.noPets')}</h3>
                    <p className="text-gray-400 mb-6">{language === 'en' ? 'Please add a pet first' : 'Vui lòng thêm thú cưng trước'}</p>
                    <button onClick={() => navigate('/my-pets')} className="btn-primary">
                        {t('pets.addPet')}
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pets.map((pet, index) => (
                        <button
                            key={pet._id}
                            onClick={() => setBooking({ ...booking, pet: pet._id })}
                            className={`relative p-6 rounded-2xl text-left transition-all duration-300 ${booking.pet === pet._id
                                    ? 'card-glow ring-2 ring-primary-500'
                                    : 'card-glass hover:bg-white/10'
                                }`}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center text-3xl">
                                    {pet.species === 'dog' ? '🐕' : pet.species === 'cat' ? '🐈' : '🐾'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{pet.name}</h3>
                                    <p className="text-sm text-gray-400 capitalize">{pet.species} - {pet.breed}</p>
                                    <p className="text-sm text-gray-500">{pet.age} {t('pets.years')}, {pet.weight}{t('pets.kg')}</p>
                                </div>
                            </div>

                            {booking.pet === pet._id && (
                                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                                    <FiCheck className="w-4 h-4 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Notes */}
            <div className="mt-8">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                    {t('booking.notes')}
                </label>
                <textarea
                    value={booking.notes}
                    onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                    placeholder={language === 'en' ? 'Any special requests or notes...' : 'Yêu cầu đặc biệt hoặc ghi chú...'}
                    className="input min-h-[120px] resize-none"
                />
            </div>
        </div>
    );

    const renderStep4 = () => {
        const selectedPet = pets.find(p => p._id === booking.pet);
        const selectedStaff = staff.find(s => s._id === booking.staff);

        return (
            <div className="animate-fade-in-up">
                <h2 className="text-2xl font-display font-bold text-white mb-6">{t('booking.confirm')}</h2>

                <div className="card-glass rounded-2xl p-6 space-y-0">
                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-gray-400">{t('booking.selectService')}</span>
                        <span className="font-semibold text-white flex items-center">
                            <span className="mr-2">{selectedService?.icon}</span>
                            {t(`services.${booking.service}`)}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-gray-400">{t('booking.selectDate')}</span>
                        <span className="font-semibold text-white">
                            {format(new Date(booking.date), 'dd/MM/yyyy')} - {booking.timeSlot}
                        </span>
                    </div>

                    <div className="flex justify-between items-center py-4 border-b border-white/10">
                        <span className="text-gray-400">{t('booking.yourPet')}</span>
                        <span className="font-semibold text-white flex items-center">
                            <span className="mr-2">{selectedPet?.species === 'dog' ? '🐕' : '🐈'}</span>
                            {selectedPet?.name}
                        </span>
                    </div>

                    {selectedStaff && (
                        <div className="flex justify-between items-center py-4 border-b border-white/10">
                            <span className="text-gray-400">{t('booking.selectStaff')}</span>
                            <span className="font-semibold text-white">{selectedStaff.name}</span>
                        </div>
                    )}

                    {booking.notes && (
                        <div className="py-4 border-b border-white/10">
                            <span className="text-gray-400 block mb-2">{t('booking.notes')}</span>
                            <p className="text-gray-300">{booking.notes}</p>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-6">
                        <span className="text-xl font-semibold text-white">{t('cart.total')}</span>
                        <span className="text-3xl font-bold text-gradient">
                            {formatPrice(selectedService?.price || 0)}
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-dark-300 pt-24 pb-12">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8 animate-fade-in-up">
                        <span className="badge-primary mb-4">{t('booking.step')} {step}/4</span>
                        <h1 className="text-4xl font-display font-bold text-white mb-4">{t('booking.title')}</h1>
                    </div>

                    {/* Step Indicator */}
                    {renderStepIndicator()}

                    {/* Form Card */}
                    <div className="card-glass p-8 mb-8">
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <button
                            onClick={handleBack}
                            disabled={step === 1}
                            className={`btn-ghost px-6 py-3 ${step === 1 ? 'invisible' : ''}`}
                        >
                            <FiChevronLeft className="mr-2" />
                            {t('booking.previous')}
                        </button>

                        {step < 4 ? (
                            <button onClick={handleNext} className="btn-primary px-8 py-3 group">
                                {t('booking.next')}
                                <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="btn-primary px-8 py-3"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                        {language === 'en' ? 'Booking...' : 'Đang đặt...'}
                                    </span>
                                ) : (
                                    <>
                                        <FiCheck className="mr-2" />
                                        {t('booking.confirm')}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;
