import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiActivity, FiBell, FiCamera, FiX, FiSave, FiDownload } from 'react-icons/fi';
import { format } from 'date-fns';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { petAPI, appointmentAPI } from '../services/api';
import { Modal, Badge, EmptyState, Spinner, FormInput, FormSelect, FormTextarea } from '../components/common/UI';
import toast from 'react-hot-toast';

const speciesOptions = [
    { value: 'dog', label: '🐕 Dog' },
    { value: 'cat', label: '🐈 Cat' },
    { value: 'bird', label: '🐦 Bird' },
    { value: 'rabbit', label: '🐰 Rabbit' },
    { value: 'hamster', label: '🐹 Hamster' },
    { value: 'fish', label: '🐠 Fish' },
    { value: 'other', label: '🐾 Other' },
];

const medicalTypes = [
    { value: 'vaccination', label: '💉 Vaccination' },
    { value: 'deworming', label: '💊 Deworming' },
    { value: 'checkup', label: '🩺 Checkup' },
    { value: 'treatment', label: '💉 Treatment' },
    { value: 'surgery', label: '🏥 Surgery' },
];

// Pet placeholder images
const petImages = {
    dog: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop&crop=face',
    cat: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop&crop=face',
    bird: 'https://images.unsplash.com/photo-1522926193341-e9ffd686c60f?w=200&h=200&fit=crop&crop=face',
    rabbit: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop&crop=face',
    hamster: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=200&h=200&fit=crop&crop=face',
    fish: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=200&h=200&fit=crop&crop=face',
    other: 'https://images.unsplash.com/photo-1518882605630-8e6cd93c7a58?w=200&h=200&fit=crop&crop=face'
};

const MyPetsPage = () => {
    const { t, language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [pets, setPets] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [petAppointments, setPetAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPet, setSelectedPet] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [ratingForm, setRatingForm] = useState({ rating: 5, feedback: '' });

    const [petForm, setPetForm] = useState({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        gender: 'male',
        avatar: '',
        notes: ''
    });

    const [editPetForm, setEditPetForm] = useState({
        name: '',
        species: 'dog',
        breed: '',
        age: '',
        weight: '',
        gender: 'male',
        avatar: '',
        notes: ''
    });



    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchPets();
        fetchReminders();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (selectedPet) {
            fetchPetAppointments(selectedPet._id);
        }
    }, [selectedPet]);

    const fetchPets = async () => {
        try {
            const response = await petAPI.getAll();
            setPets(response.data.pets || []);
        } catch (error) {
            console.error('Error fetching pets:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchReminders = async () => {
        try {
            const response = await petAPI.getAllReminders();
            setReminders(response.data.reminders || []);
        } catch (error) {
            console.error('Error fetching reminders:', error);
        }
    };

    const fetchPetAppointments = async (petId) => {
        try {
            const response = await appointmentAPI.getAll();
            const filtered = (response.data.appointments || []).filter(
                apt => apt.pet?._id === petId || apt.pet === petId
            );
            setPetAppointments(filtered);
        } catch (error) {
            console.error('Error fetching pet appointments:', error);
        }
    };



    const handleAddPet = async (e) => {
        e.preventDefault();
        try {
            await petAPI.create(petForm);
            toast.success(language === 'en' ? 'Pet added successfully!' : 'Thêm thú cưng thành công!');
            setShowAddModal(false);
            setPetForm({ name: '', species: 'dog', breed: '', age: '', weight: '', gender: 'male', avatar: '', notes: '' });
            fetchPets();
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const handleEditPet = async (e) => {
        e.preventDefault();
        if (!selectedPet) return;

        try {
            await petAPI.update(selectedPet._id, editPetForm);
            toast.success(language === 'en' ? 'Pet updated successfully!' : 'Cập nhật thành công!');
            setShowEditModal(false);
            fetchPets();
            // Update selected pet
            setSelectedPet({ ...selectedPet, ...editPetForm });
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const openEditModal = () => {
        if (selectedPet) {
            setEditPetForm({
                name: selectedPet.name || '',
                species: selectedPet.species || 'dog',
                breed: selectedPet.breed || '',
                age: selectedPet.age || '',
                weight: selectedPet.weight || '',
                gender: selectedPet.gender || 'male',
                avatar: selectedPet.avatar || '',
                notes: selectedPet.notes || ''
            });
            setShowEditModal(true);
        }
    };



    const handleRateAppointment = async (e) => {
        e.preventDefault();
        if (!selectedAppointment) return;

        try {
            await appointmentAPI.update(selectedAppointment._id, {
                ...ratingForm,
                status: 'rated' // Mark as rated
            });
            toast.success(language === 'en' ? 'Thank you for your feedback!' : 'Cảm ơn bác đã đánh giá!');
            setShowRatingModal(false);
            setSelectedAppointment(null); // Close the detail modal too
            fetchPetAppointments(selectedPet._id);
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm(language === 'en' ? 'Are you sure you want to delete this pet?' : 'Bạn có chắc muốn xóa thú cưng này?')) {
            return;
        }

        try {
            await petAPI.delete(petId);
            toast.success(language === 'en' ? 'Pet deleted successfully!' : 'Đã xóa thú cưng!');
            setPets(pets.filter(p => p._id !== petId));
            if (selectedPet?._id === petId) setSelectedPet(null);
        } catch (error) {
            toast.error(error.response?.data?.message || t('common.error'));
        }
    };

    const getPetImage = (pet) => {
        if (pet.avatar) return pet.avatar;
        return petImages[pet.species] || petImages.other;
    };

    const getStatusBadge = (status) => {
        const variants = {
            pending: 'warning',
            confirmed: 'info',
            completed: 'success',
            cancelled: 'danger'
        };
        return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center pt-20">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-theme pt-24 pb-12">
            <div className="container-custom">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Pet List */}
                    <div className="lg:w-1/3">
                        <div className="card-glass p-6 sticky top-24">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-display font-bold text-[#1e293b]">{t('pets.title')}</h2>
                                <button
                                    onClick={() => setShowAddModal(true)}
                                    className="btn-primary text-sm"
                                >
                                    <FiPlus className="mr-1" /> {t('pets.addPet')}
                                </button>
                            </div>

                            {pets.length === 0 ? (
                                <EmptyState
                                    icon={<span className="text-4xl">🐾</span>}
                                    title={t('pets.noPets')}
                                    action={
                                        <button onClick={() => setShowAddModal(true)} className="btn-primary">
                                            {t('pets.addPet')}
                                        </button>
                                    }
                                />
                            ) : (
                                <div className="space-y-3">
                                    {pets.map((pet, index) => (
                                        <button
                                            key={pet._id}
                                            onClick={() => { setSelectedPet(pet); setActiveTab('info'); }}
                                            className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${selectedPet?._id === pet._id
                                                ? 'bg-gradient-primary shadow-glow-sm'
                                                : 'bg-white/5 hover:bg-white/10 border border-white/10'
                                                }`}
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={getPetImage(pet)}
                                                        alt={pet.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = petImages[pet.species] || petImages.other;
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-[#1e293b] truncate">{pet.name}</h3>
                                                    <p className="text-sm text-gray-400 capitalize">{pet.breed || pet.species}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {pet.age} {t('pets.years')} • {pet.weight}{t('pets.kg')}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Reminders Section */}
                            {reminders.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/10">
                                    <h3 className="text-lg font-semibold text-[#1e293b] mb-4 flex items-center">
                                        <FiBell className="mr-2 text-yellow-400" />
                                        {t('pets.upcomingReminders')}
                                    </h3>
                                    <div className="space-y-3">
                                        {reminders.slice(0, 3).map((reminder, idx) => (
                                            <div key={idx} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium text-[#1e293b]">{reminder.petName}</span>
                                                    <Badge variant="warning">{reminder.type}</Badge>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {format(new Date(reminder.dueDate), 'dd/MM/yyyy')}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Pet Details */}
                    <div className="lg:w-2/3">
                        {selectedPet ? (
                            <div className="space-y-6">
                                {/* Pet Info Card */}
                                <div className="card-glass p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="relative">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden">
                                                    <img
                                                        src={getPetImage(selectedPet)}
                                                        alt={selectedPet.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = petImages[selectedPet.species] || petImages.other;
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-display font-bold text-[#1e293b]">{selectedPet.name}</h2>
                                                <p className="text-gray-400 capitalize">{selectedPet.breed || selectedPet.species}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={openEditModal}
                                                className="btn-glass text-sm"
                                            >
                                                <FiEdit2 className="mr-1" /> {t('common.edit')}
                                            </button>
                                            <button
                                                onClick={() => handleDeletePet(selectedPet._id)}
                                                className="btn text-sm bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
                                            >
                                                <FiTrash2 className="mr-1" /> {t('common.delete')}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl">
                                        <button
                                            onClick={() => setActiveTab('info')}
                                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'info' ? 'bg-gradient-primary text-[#1e293b] shadow-glow-sm' : 'text-gray-400 hover:text-[#1e293b] hover:bg-white/5'
                                                }`}
                                        >
                                            {language === 'en' ? 'Info' : 'Thông tin'}
                                        </button>

                                        <button
                                            onClick={() => setActiveTab('services')}
                                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'services' ? 'bg-gradient-primary text-[#1e293b] shadow-glow-sm' : 'text-gray-400 hover:text-[#1e293b] hover:bg-white/5'
                                                }`}
                                        >
                                            {language === 'en' ? 'Services' : 'Dịch vụ'}
                                        </button>
                                    </div>

                                    {activeTab === 'info' && (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                                <p className="text-sm text-gray-500">{t('pets.age')}</p>
                                                <p className="text-xl font-semibold text-[#1e293b]">{selectedPet.age} {t('pets.years')}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                                <p className="text-sm text-gray-500">{t('pets.weight')}</p>
                                                <p className="text-xl font-semibold text-[#1e293b]">{selectedPet.weight} {t('pets.kg')}</p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                                <p className="text-sm text-gray-500">{t('pets.gender')}</p>
                                                <p className="text-xl font-semibold text-[#1e293b] capitalize">
                                                    {t(`pets.${selectedPet.gender}`)}
                                                </p>
                                            </div>
                                            <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10">
                                                <p className="text-sm text-gray-500">{t('pets.species')}</p>
                                                <p className="text-xl font-semibold text-[#1e293b] capitalize">{selectedPet.species}</p>
                                            </div>
                                            {selectedPet.notes && (
                                                <div className="col-span-full bg-white/5 rounded-xl p-4 border border-white/10">
                                                    <p className="text-sm text-gray-500 mb-1">{language === 'en' ? 'Notes / Special Care' : 'Ghi chú / Lưu ý đặc biệt'}</p>
                                                    <p className="text-[#1e293b] italic">"{selectedPet.notes}"</p>
                                                </div>
                                            )}
                                        </div>
                                    )}



                                    {activeTab === 'services' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-[#1e293b] flex items-center">
                                                    <FiCalendar className="mr-2 text-primary-400" />
                                                    {language === 'en' ? 'Service History' : 'Lịch sử dịch vụ'}
                                                </h3>
                                                <Link to={`/booking?petId=${selectedPet._id}`} className="btn-primary text-sm">
                                                    <FiPlus className="mr-1" /> {language === 'en' ? 'Book Service' : 'Đặt dịch vụ'}
                                                </Link>
                                            </div>

                                            {petAppointments.length > 0 ? (
                                                <div className="space-y-4">
                                                    {petAppointments.map((apt) => (
                                                        <div
                                                            key={apt._id}
                                                            onClick={() => setSelectedAppointment(apt)}
                                                            className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
                                                        >
                                                            <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                                                                <div>
                                                                    <p className="font-semibold text-[#1e293b] capitalize flex items-center">
                                                                        {apt.service}
                                                                        {apt.status === 'completed' && (
                                                                            <span className="ml-2 text-xs text-primary-400 bg-primary-400/10 px-2 py-0.5 rounded cursor-pointer hover:bg-primary-400/20"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedAppointment(apt);
                                                                                    setRatingForm({ rating: apt.rating || 5, feedback: apt.feedback || '' });
                                                                                    setShowRatingModal(true);
                                                                                }}>
                                                                                {apt.rating ? '⭐ ' + apt.rating : '+ ' + (language === 'en' ? 'Rate' : 'Đánh giá')}
                                                                            </span>
                                                                        )}
                                                                    </p>
                                                                    <p className="text-sm text-theme-secondary">
                                                                        {apt.date ? format(new Date(apt.date), 'dd/MM/yyyy') : ''} - {apt.timeSlot}
                                                                    </p>
                                                                </div>
                                                                {getStatusBadge(apt.status)}
                                                            </div>
                                                            <div className="flex justify-between items-end">
                                                                <div>
                                                                    {apt.staff && (
                                                                        <p className="text-sm text-gray-400">
                                                                            {language === 'en' ? 'Staff:' : 'Nhân viên:'} {apt.staff.name || apt.staff}
                                                                        </p>
                                                                    )}
                                                                    {apt.notes && (
                                                                        <p className="text-sm text-gray-500 mt-1 italic line-clamp-1">{apt.notes}</p>
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {language === 'en' ? 'Click for detail' : 'Bấn để xem chi tiết'} →
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState
                                                    icon={<FiCalendar className="w-12 h-12 text-gray-500" />}
                                                    title={language === 'en' ? 'No services booked' : 'Chưa có dịch vụ'}
                                                    description={language === 'en' ? 'Book grooming, checkup or other services' : 'Đặt dịch vụ grooming, khám bệnh...'}
                                                    action={
                                                        <Link to={`/booking?petId=${selectedPet._id}`} className="btn-primary">
                                                            {language === 'en' ? 'Book Now' : 'Đặt ngay'}
                                                        </Link>
                                                    }
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card-glass p-12">
                                <EmptyState
                                    icon={<span className="text-5xl">👈</span>}
                                    title={language === 'en' ? 'Select a pet to view details' : 'Chọn thú cưng để xem chi tiết'}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Add Pet Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title={t('pets.addPet')}
                size="md"
            >
                <form onSubmit={handleAddPet} className="space-y-4">
                    <FormInput
                        label={language === 'en' ? 'Pet Name' : 'Tên thú cưng'}
                        required
                        value={petForm.name}
                        onChange={(e) => setPetForm({ ...petForm, name: e.target.value })}
                        placeholder="Buddy"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label={t('pets.species')}
                            required
                            value={petForm.species}
                            onChange={(e) => setPetForm({ ...petForm, species: e.target.value })}
                            options={speciesOptions}
                        />
                        <FormSelect
                            label={t('pets.gender')}
                            required
                            value={petForm.gender}
                            onChange={(e) => setPetForm({ ...petForm, gender: e.target.value })}
                            options={[
                                { value: 'male', label: t('pets.male') },
                                { value: 'female', label: t('pets.female') },
                            ]}
                        />
                    </div>

                    <FormInput
                        label={t('pets.breed')}
                        value={petForm.breed}
                        onChange={(e) => setPetForm({ ...petForm, breed: e.target.value })}
                        placeholder="Golden Retriever"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label={`${t('pets.age')} (${t('pets.years')})`}
                            type="number"
                            value={petForm.age}
                            onChange={(e) => setPetForm({ ...petForm, age: e.target.value })}
                            placeholder="3"
                        />
                        <FormInput
                            label={`${t('pets.weight')} (${t('pets.kg')})`}
                            type="number"
                            value={petForm.weight}
                            onChange={(e) => setPetForm({ ...petForm, weight: e.target.value })}
                            placeholder="25"
                        />
                    </div>

                    <FormInput
                        placeholder="https://example.com/pet.jpg"
                    />

                    <FormTextarea
                        label={language === 'en' ? 'Notes & Special Care' : 'Ghi chú & Lưu ý đặc biệt'}
                        value={petForm.notes}
                        onChange={(e) => setPetForm({ ...petForm, notes: e.target.value })}
                        placeholder={language === 'en' ? 'Allergies, personality, or special needs...' : 'Các lưu ý về dị ứng, tính cách hoặc nhu cầu đặc biệt...'}
                        rows={3}
                    />

                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowAddModal(false)} className="btn-outline flex-1">
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            {t('common.save')}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Pet Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={language === 'en' ? 'Edit Pet' : 'Chỉnh sửa thú cưng'}
                size="md"
            >
                <form onSubmit={handleEditPet} className="space-y-4">
                    <FormInput
                        label={language === 'en' ? 'Pet Name' : 'Tên thú cưng'}
                        required
                        value={editPetForm.name}
                        onChange={(e) => setEditPetForm({ ...editPetForm, name: e.target.value })}
                        placeholder="Buddy"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label={t('pets.species')}
                            required
                            value={editPetForm.species}
                            onChange={(e) => setEditPetForm({ ...editPetForm, species: e.target.value })}
                            options={speciesOptions}
                        />
                        <FormSelect
                            label={t('pets.gender')}
                            required
                            value={editPetForm.gender}
                            onChange={(e) => setEditPetForm({ ...editPetForm, gender: e.target.value })}
                            options={[
                                { value: 'male', label: t('pets.male') },
                                { value: 'female', label: t('pets.female') },
                            ]}
                        />
                    </div>

                    <FormInput
                        label={t('pets.breed')}
                        value={editPetForm.breed}
                        onChange={(e) => setEditPetForm({ ...editPetForm, breed: e.target.value })}
                        placeholder="Golden Retriever"
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label={`${t('pets.age')} (${t('pets.years')})`}
                            type="number"
                            value={editPetForm.age}
                            onChange={(e) => setEditPetForm({ ...editPetForm, age: e.target.value })}
                            placeholder="3"
                        />
                        <FormInput
                            label={`${t('pets.weight')} (${t('pets.kg')})`}
                            type="number"
                            value={editPetForm.weight}
                            onChange={(e) => setEditPetForm({ ...editPetForm, weight: e.target.value })}
                            placeholder="25"
                        />
                    </div>

                    <FormInput
                        label={language === 'en' ? 'Photo URL' : 'URL ảnh'}
                        value={editPetForm.avatar}
                        onChange={(e) => setEditPetForm({ ...editPetForm, avatar: e.target.value })}
                        placeholder="https://example.com/pet.jpg"
                    />

                    <FormTextarea
                        label={language === 'en' ? 'Notes & Special Care' : 'Ghi chú & Lưu ý đặc biệt'}
                        value={editPetForm.notes}
                        onChange={(e) => setEditPetForm({ ...editPetForm, notes: e.target.value })}
                        placeholder={language === 'en' ? 'Allergies, personality, or special needs...' : 'Các lưu ý về dị ứng, tính cách hoặc nhu cầu đặc biệt...'}
                        rows={3}
                    />

                    {editPetForm.avatar && (
                        <div className="flex justify-center">
                            <img
                                src={editPetForm.avatar}
                                alt="Preview"
                                className="w-24 h-24 rounded-xl object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                        <button type="button" onClick={() => setShowEditModal(false)} className="btn-outline flex-1">
                            <FiX className="mr-1" /> {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn-primary flex-1">
                            <FiSave className="mr-1" /> {t('common.save')}
                        </button>
                    </div>
                </form>
            </Modal>


            {/* Appointment Detail Modal */}
            <Modal
                isOpen={!!selectedAppointment && !showRatingModal}
                onClose={() => setSelectedAppointment(null)}
                title={language === 'en' ? 'Service Detail' : 'Chi tiết dịch vụ'}
                size="md"
            >
                {selectedAppointment && (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-4xl shadow-glow-sm">
                                {selectedAppointment.service === 'grooming' ? '✂️' :
                                    selectedAppointment.service === 'vaccination' ? '💉' :
                                        selectedAppointment.service === 'checkup' ? '🩺' :
                                            selectedAppointment.service === 'surgery' ? '🏥' : '📋'}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[#1e293b] mb-1 capitalize">
                                    {selectedAppointment.service}
                                </h3>
                                {getStatusBadge(selectedAppointment.status)}
                            </div>
                        </div>

                        {/* Pet Info */}
                        <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center text-2xl">
                                {selectedAppointment.pet?.species === 'dog' ? '🐕' : '🐈'}
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 mb-0.5">{language === 'en' ? 'Pet Name' : 'Tên thú cưng'}</p>
                                <p className="font-semibold text-[#1e293b]">
                                    {selectedAppointment.pet?.name || selectedPet?.name} ({selectedAppointment.pet?.species || selectedPet?.species})
                                </p>
                                <p className="text-xs text-primary-400">
                                    {selectedAppointment.pet?.age || selectedPet?.age} {language === 'en' ? 'years' : 'tuổi'} •
                                    {selectedAppointment.pet?.weight || selectedPet?.weight}kg •
                                    {(selectedAppointment.pet?.gender || selectedPet?.gender) === 'male' ? (language === 'en' ? 'Male' : 'Đực') : (language === 'en' ? 'Female' : 'Cái')}
                                </p>
                            </div>
                        </div>

                        {selectedAppointment.pet?.notes && (
                            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                                <p className="text-sm text-yellow-400 mb-1">{language === 'en' ? 'Pet Special Notes' : 'Lưu ý đặc biệt'}</p>
                                <p className="text-gray-300 italic text-sm">"{selectedAppointment.pet.notes}"</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Date' : 'Ngày'}</p>
                                <p className="font-semibold text-[#1e293b]">
                                    {selectedAppointment.date ? format(new Date(selectedAppointment.date), 'dd/MM/yyyy') : '---'}
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Time' : 'Giờ'}</p>
                                <p className="font-semibold text-[#1e293b]">{selectedAppointment.timeSlot}</p>
                            </div>
                        </div>

                        {selectedAppointment.staff && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Staff/Doctor' : 'Nhân viên/Bác sĩ'}</p>
                                <p className="font-semibold text-[#1e293b]">{selectedAppointment.staff.name || selectedAppointment.staff}</p>
                            </div>
                        )}

                        {selectedAppointment.notes && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <p className="text-sm text-gray-400 mb-1">{language === 'en' ? 'Customer Notes' : 'Ghi chú của bạn'}</p>
                                <p className="text-gray-200">{selectedAppointment.notes}</p>
                            </div>
                        )}

                        {selectedAppointment.rating && (
                            <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-primary-400 font-medium">{language === 'en' ? 'Your Rating' : 'Đánh giá của bạn'}</p>
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
                            {selectedAppointment.status === 'completed' && !selectedAppointment.rating && (
                                <button
                                    onClick={() => setShowRatingModal(true)}
                                    className="btn-primary mr-3"
                                >
                                    {language === 'en' ? 'Rate Now' : 'Đánh giá ngay'}
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="btn-ghost px-6"
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
                        <p className="text-gray-400 mb-4">{language === 'en' ? 'How was your experience?' : 'Bác thấy dịch vụ thế nào?'}</p>
                        <div className="flex justify-center space-x-2 text-4xl">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                                    className={`transition-all duration-200 ${ratingForm.rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-600 hover:text-gray-500'}`}
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
                        rows={4}
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

export default MyPetsPage;
