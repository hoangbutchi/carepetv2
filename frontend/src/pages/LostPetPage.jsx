import { useState, useEffect } from 'react';
import { FiMapPin, FiPhone, FiPlus, FiSearch, FiAlertCircle, FiCheckCircle, FiUploadCloud, FiX, FiImage, FiLink } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { lostPetAPI } from '../services/api';
import { Modal, Badge, EmptyState, Spinner, FormInput, FormTextarea } from '../components/common/UI';
import VietnamAddressSelector from '../components/common/VietnamAddressSelector';
import MapPicker from '../components/common/MapPicker';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format } from 'date-fns';

const LostPetPage = () => {
    const { user, isAuthenticated } = useAuth();
    const { language } = useLanguage();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [imageUploadMode, setImageUploadMode] = useState('file'); // 'file' | 'url'
    const [mapGeocode, setMapGeocode] = useState(null); // { city, district, ward } from reverse geocode

    // Filters
    const [searchTerm, setSearchTerm] = useState('');

    // New Post Form
    const [formData, setFormData] = useState({
        petName: '',
        petImage: '',
        description: '',
        contactPhone: '',
        city: null,
        district: null,
        ward: null,
        location: {
            type: 'Point',
            coordinates: [105.8544, 21.0285]
        }
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const res = await lostPetAPI.getAll();
            setPosts(res.data.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    const handleImageFileChange = (file) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error(language === 'en' ? 'Please select an image file.' : 'Vui lòng chọn file ảnh hợp lệ.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error(language === 'en' ? 'Image must be smaller than 5MB.' : 'Ảnh phải nhỏ hơn 5MB.');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setFormData(prev => ({ ...prev, petImage: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) handleImageFileChange(file);
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();

        if (!formData.city || !formData.district) {
            toast.error(language === 'en' ? 'Please select a location' : 'Vui lòng chọn địa chỉ');
            return;
        }

        if (!formData.petImage) {
            toast.error(language === 'en' ? 'Please provide a pet image URL' : 'Vui lòng cung cấp link ảnh của bé');
            return;
        }

        try {
            setSubmitting(true);
            const res = await lostPetAPI.create(formData);
            if (res.data.success) {
                const alerted = res.data.alertedCount || 0;
                toast.success(
                    language === 'en'
                        ? `Post created! Notified ${alerted} users in ${formData.district.name}.`
                        : `Đã đăng tin! Đã thông báo đến ${alerted} người dùng tại ${formData.district.name}.`,
                    { duration: 5000 }
                );
                setIsModalOpen(false);
                setImagePreview('');
                setImageUploadMode('file');
                setFormData({
                    petName: '',
                    petImage: '',
                    description: '',
                    contactPhone: user?.phone || '',
                    city: null,
                    district: null,
                    ward: null,
                    location: {
                        type: 'Point',
                        coordinates: [105.8544, 21.0285]
                    }
                });
                fetchPosts();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkAsFound = async (postId) => {
        try {
            const res = await lostPetAPI.updateStatus(postId, { status: 'resolved' });
            if (res.data.success) {
                toast.success(
                    language === 'en'
                        ? 'So happy you found your pet! This post will now be removed from the public list.'
                        : 'Chúc mừng bạn đã tìm thấy bé! Tin báo sẽ được kết thúc.',
                    { icon: '🎉' }
                );
                fetchPosts();
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredPosts = posts.filter(post =>
        post.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.district?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.ward?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-dark-300 pt-24 pb-12">
            <div className="container-custom">
                {/* Hero Section */}
                <div className="card-glass p-8 mb-8 text-center animate-fade-in relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-50 transition-opacity group-hover:opacity-70" />

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-red-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-sm">
                            <FiAlertCircle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-4xl font-display font-bold text-white mb-4">
                            {language === 'en' ? 'Lost Pet Community Alert' : 'Cộng đồng Tìm kiếm Thú cưng'}
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
                            {language === 'en'
                                ? 'Post a report and we will instantly notify every CarePet user in your district via email.'
                                : 'Đăng tin và CarePet sẽ ngay lập tức gửi email thông báo khẩn cấp đến toàn bộ người dùng trong khu vực của bạn.'}
                        </p>
                        <button
                            onClick={() => {
                                if (!isAuthenticated) {
                                    toast.error(language === 'en' ? 'Please login to post' : 'Vui lòng đăng nhập để đăng tin');
                                    return;
                                }
                                setFormData(prev => ({ ...prev, contactPhone: user?.phone || '' }));
                                setIsModalOpen(true);
                            }}
                            className="btn-primary px-10 py-4 text-lg bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-glow-sm transform transition-transform hover:scale-105"
                        >
                            <FiPlus className="mr-2 w-5 h-5" />
                            {language === 'en' ? 'Report Lost Pet' : 'Báo lạc ngay bây giờ'}
                        </button>
                    </div>
                </div>

                {/* Dashboard Map */}
                <div className="mb-10 animate-fade-in delay-200">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <h4 className="text-sm font-semibold text-gray-400 mb-4 flex items-center gap-2">
                            🗺️ {language === 'en' ? 'Active Alerts Map' : 'Bản đồ cảnh báo đang hoạt động'}
                        </h4>
                        <div className="h-[400px] rounded-xl overflow-hidden shadow-2xl relative z-[1]">
                            <MapContainer
                                center={[21.0285, 105.8544]}
                                zoom={12}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                {filteredPosts.map(post => (
                                    <Marker
                                        key={post._id}
                                        position={[post.location.coordinates[1], post.location.coordinates[0]]}
                                        icon={new L.Icon({
                                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                            iconSize: [25, 41],
                                            iconAnchor: [12, 41],
                                            popupAnchor: [1, -34],
                                            shadowSize: [41, 41]
                                        })}
                                    >
                                        <Popup>
                                            <div className="p-1 min-w-[150px]">
                                                <img src={post.petImage} className="w-full h-24 object-cover rounded mb-2" />
                                                <p className="font-bold text-red-600 mb-1">{post.petName}</p>
                                                <p className="text-xs text-gray-600 mb-2">{post.ward?.name}</p>
                                                <a href={`tel:${post.contactPhone}`} className="text-xs text-white bg-red-500 px-2 py-1 rounded-full">{post.contactPhone}</a>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {/* Search & Statistics */}
                <div className="flex flex-col md:flex-row gap-6 mb-8 items-center">
                    <div className="relative flex-1 w-full">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            placeholder={language === 'en' ? 'Search by name, district or ward...' : 'Tìm theo tên bé, quận/huyện hoặc phường...'}
                            className="input pl-12 w-full py-4 text-lg bg-white/5 border-white/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/5 px-6 py-2 rounded-2xl border border-white/10 text-center">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">{language === 'en' ? 'Active Alerts' : 'Đang tìm'}</p>
                            <p className="text-2xl font-bold font-display text-white">{posts.length}</p>
                        </div>
                    </div>
                </div>

                {/* Posts Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24">
                        <Spinner size="lg" />
                        <p className="mt-4 text-gray-400">{language === 'en' ? 'Scanning community reports...' : 'Đang quét dữ liệu cộng đồng...'}</p>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <EmptyState
                        icon={<FiAlertCircle className="w-16 h-16 text-gray-600" />}
                        title={language === 'en' ? 'No active alerts' : 'Hiện không có tin báo lạc'}
                        description={language === 'en' ? 'All reported pets are currently home, or try adjusting your search.' : 'Mọi bé đã về nhà an toàn, hoặc hãy thử tìm kiếm theo khu vực khác.'}
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPosts.map((post, idx) => (
                            <div key={post._id} className="card-glass overflow-hidden group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                <div className="relative h-72 overflow-hidden">
                                    <img
                                        src={post.petImage}
                                        alt={post.petName}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <Badge variant="danger" className="shadow-lg backdrop-blur-md px-3 py-1 font-bold">
                                            {language === 'en' ? 'LOST' : 'BÁO LẠC'}
                                        </Badge>
                                    </div>

                                    <div className="absolute bottom-4 left-4">
                                        <p className="text-white text-sm font-medium flex items-center gap-1 opacity-90 shadow-sm">
                                            📅 {format(new Date(post.createdAt), 'dd MMM, yyyy')}
                                        </p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-red-400 transition-colors">{post.petName}</h3>
                                        <div className="flex -space-x-2">
                                            {post.user?.avatar ? (
                                                <img src={post.user.avatar} className="w-8 h-8 rounded-full border-2 border-dark-300" alt="Owner" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-xs font-bold border-2 border-dark-300">
                                                    {post.user?.name?.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 text-gray-300 text-sm mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <FiMapPin className="mt-1 flex-shrink-0 text-red-500" />
                                        <span className="leading-relaxed">
                                            <span className="font-semibold text-white">{post.ward?.name}</span>, {post.district?.name}, {post.city?.name}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-6 line-clamp-3 italic">
                                        "{post.description}"
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/10">
                                        <a
                                            href={`tel:${post.contactPhone}`}
                                            className="btn-primary py-2 px-4 shadow-none bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center gap-2 rounded-xl text-sm"
                                        >
                                            <FiPhone className="w-4 h-4" />
                                            {post.contactPhone}
                                        </a>

                                        {(user && (user._id === post.user?._id || user.role === 'admin')) ? (
                                            <button
                                                onClick={() => handleMarkAsFound(post._id)}
                                                className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                                                title={language === 'en' ? 'Mark as Found' : 'Đã tìm thấy'}
                                            >
                                                <FiCheckCircle className="w-5 h-5" />
                                            </button>
                                        ) : (
                                            <p className="text-xs text-gray-500 font-medium">{post.user?.name}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={language === 'en' ? 'Community Lost Pet Alert' : 'Báo cáo Thú cưng đi lạc'}
                    size="lg"
                >
                    <form onSubmit={handleCreatePost} className="space-y-6">
                        <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex gap-4">
                            <FiAlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-200">
                                {language === 'en'
                                    ? 'Once submitted, we will immediately email all members in your district to help look for your pet.'
                                    : 'Khi gửi, chúng tôi sẽ ngay lập tức gửi email đến tất cả thành viên TRONG CÙNG QUẬN/HUYỆN của bạn để hỗ trợ tìm kiếm.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label={language === 'en' ? 'Pet Name' : 'Tên bé'}
                                required
                                value={formData.petName}
                                onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                                placeholder="VD: Mochi, LuLu..."
                            />
                            <FormInput
                                label={language === 'en' ? 'Contact Phone' : 'Số điện thoại liên hệ'}
                                required
                                value={formData.contactPhone}
                                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                                placeholder="0xxx..."
                            />
                        </div>

                        {/* ===== IMAGE UPLOAD SECTION ===== */}
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-300">
                                {language === 'en' ? 'Pet Photo' : 'Ảnh của bé'}
                                <span className="text-red-400 ml-1">*</span>
                            </label>

                            {/* Tab switcher */}
                            <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setImageUploadMode('file')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageUploadMode === 'file'
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <FiUploadCloud className="w-4 h-4" />
                                    {language === 'en' ? 'Upload from Device' : 'Tải từ thiết bị'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setImageUploadMode('url')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${imageUploadMode === 'url'
                                        ? 'bg-primary-500 text-white shadow-md'
                                        : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <FiLink className="w-4 h-4" />
                                    {language === 'en' ? 'Image URL' : 'Nhập link ảnh'}
                                </button>
                            </div>

                            {imageUploadMode === 'file' ? (
                                <div>
                                    {imagePreview ? (
                                        /* Preview */
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
                                            <img
                                                src={imagePreview}
                                                alt="preview"
                                                className="w-full h-52 object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImagePreview('');
                                                        setFormData(prev => ({ ...prev, petImage: '' }));
                                                    }}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-medium transition-colors"
                                                >
                                                    <FiX className="w-4 h-4" />
                                                    {language === 'en' ? 'Remove photo' : 'Xóa ảnh'}
                                                </button>
                                            </div>
                                            <div className="absolute bottom-3 left-3 bg-green-500/90 text-white text-xs px-3 py-1 rounded-full font-medium">
                                                ✓ {language === 'en' ? 'Photo ready' : 'Ảnh đã sẵn sàng'}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Drop Zone */
                                        <label
                                            className="flex flex-col items-center justify-center gap-3 h-48 rounded-2xl border-2 border-dashed border-white/20 bg-white/3 hover:border-primary-400/60 hover:bg-primary-500/5 cursor-pointer transition-all group"
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={handleImageDrop}
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-primary-500/10 group-hover:bg-primary-500/20 flex items-center justify-center transition-colors">
                                                <FiUploadCloud className="w-7 h-7 text-primary-400" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-medium text-sm">
                                                    {language === 'en' ? 'Click to select or drag & drop' : 'Nhấn để chọn hoặc kéo thả ảnh vào đây'}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1">
                                                    {language === 'en' ? 'PNG, JPG, WEBP — max 5MB' : 'PNG, JPG, WEBP — tối đa 5MB'}
                                                </p>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => handleImageFileChange(e.target.files[0])}
                                            />
                                        </label>
                                    )}
                                </div>
                            ) : (
                                /* URL input */
                                <div className="space-y-3">
                                    <div className="relative">
                                        <FiImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                                        <input
                                            type="url"
                                            className="input pl-11 w-full"
                                            placeholder="https://example.com/pet-photo.jpg"
                                            value={imageUploadMode === 'url' ? formData.petImage : ''}
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                setFormData(prev => ({ ...prev, petImage: url }));
                                                setImagePreview(url);
                                            }}
                                        />
                                    </div>
                                    {formData.petImage && imageUploadMode === 'url' && (
                                        <div className="relative rounded-2xl overflow-hidden border border-white/10 h-40">
                                            <img
                                                src={formData.petImage}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-4">
                            <h4 className="text-sm font-semibold text-primary-400 uppercase tracking-wider flex items-center gap-2">
                                <FiMapPin className="text-red-500" />
                                {language === 'en' ? 'Area to Notify' : 'Khu vực gửi thông báo'}
                            </h4>
                            <VietnamAddressSelector
                                onAddressChange={(addr) => setFormData(prev => ({ ...prev, ...addr }))}
                                mapGeocode={mapGeocode}
                                onCoordsFound={(coords) => setFormData(prev => ({
                                    ...prev,
                                    location: { type: 'Point', coordinates: coords }
                                }))}
                            />

                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-400 mb-2">
                                    🛰️ {language === 'en' ? 'Mark precise location on map' : 'Ghim vị trí chính xác trên bản đồ'}
                                </p>
                                <MapPicker
                                    initialLocation={formData.location.coordinates}
                                    onLocationSelect={(coords) => setFormData(prev => ({
                                        ...prev,
                                        location: { type: 'Point', coordinates: coords }
                                    }))}
                                    onGeocode={(geocode) => setMapGeocode(geocode)}
                                />
                            </div>
                        </div>

                        <FormTextarea
                            label={language === 'en' ? 'Visual Description & Last Seen Details' : 'Đặc điểm nhận diện & Khu vực lần cuối thấy bé'}
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder={language === 'en'
                                ? "Describe color, collar, breed, behavior, and where exactly they were last seen..."
                                : "Mô tả màu lông, vòng cổ, giống loài, tính cách, bé đang chạy hướng nào..."}
                        />

                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="btn-primary flex-1 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 shadow-glow-sm"
                                disabled={submitting}
                            >
                                {submitting ? <Spinner size="sm" /> : (language === 'en' ? 'Broadcast Alert Now' : 'Bắt đầu gửi thông báo khẩn')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="btn-ghost px-8"
                            >
                                {language === 'en' ? 'Cancel' : 'Hủy'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default LostPetPage;
