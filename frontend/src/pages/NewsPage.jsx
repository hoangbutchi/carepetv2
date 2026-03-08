import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCalendar, FiEye, FiArrowLeft, FiUser, FiClock, FiEdit3, FiX } from 'react-icons/fi';
import { format } from 'date-fns';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { newsAPI } from '../services/api';
import { Spinner, Badge, Modal } from '../components/common/UI';
import toast from 'react-hot-toast';

// Placeholder images for news
const newsImages = [
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&h=400&fit=crop',
    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=400&fit=crop'
];

const categories = {
    en: [
        { value: 'all', label: 'All' },
        { value: 'health', label: 'Health' },
        { value: 'nutrition', label: 'Nutrition' },
        { value: 'care', label: 'Care Tips' },
        { value: 'training', label: 'Training' },
        { value: 'news', label: 'News' }
    ],
    vi: [
        { value: 'all', label: 'Tất cả' },
        { value: 'health', label: 'Sức khỏe' },
        { value: 'nutrition', label: 'Dinh dưỡng' },
        { value: 'care', label: 'Mẹo chăm sóc' },
        { value: 'training', label: 'Huấn luyện' },
        { value: 'news', label: 'Tin tức' }
    ]
};

const mockNews = [
    {
        _id: '1',
        title: 'Cách chăm sóc thú cưng mùa đông',
        titleEn: 'How to Care for Pets in Winter',
        summary: 'Những tips hữu ích giúp thú cưng của bạn khỏe mạnh trong mùa lạnh',
        summaryEn: 'Useful tips to keep your pet healthy during cold season',
        content: 'Nội dung chi tiết về cách chăm sóc thú cưng mùa đông...',
        category: 'care',
        views: 1250,
        createdAt: new Date('2026-01-15')
    },
    {
        _id: '2',
        title: 'Chế độ dinh dưỡng cho chó con',
        titleEn: 'Nutrition Guide for Puppies',
        summary: 'Hướng dẫn chi tiết về chế độ ăn uống phù hợp cho chó con',
        summaryEn: 'Detailed guide on proper diet for puppies',
        content: 'Nội dung chi tiết về dinh dưỡng cho chó con...',
        category: 'nutrition',
        views: 890,
        createdAt: new Date('2026-01-14')
    },
    {
        _id: '3',
        title: 'Phòng ngừa bệnh cho mèo',
        titleEn: 'Preventing Diseases in Cats',
        summary: 'Các bệnh thường gặp ở mèo và cách phòng ngừa hiệu quả',
        summaryEn: 'Common cat diseases and effective prevention methods',
        content: 'Nội dung chi tiết về phòng ngừa bệnh cho mèo...',
        category: 'health',
        views: 2100,
        createdAt: new Date('2026-01-13')
    },
    {
        _id: '4',
        title: 'Huấn luyện chó cơ bản',
        titleEn: 'Basic Dog Training',
        summary: 'Các kỹ thuật huấn luyện chó cơ bản cho người mới nuôi',
        summaryEn: 'Basic dog training techniques for new pet owners',
        content: 'Nội dung chi tiết về huấn luyện chó...',
        category: 'training',
        views: 1560,
        createdAt: new Date('2026-01-12')
    },
    {
        _id: '5',
        title: 'Khai trương chi nhánh mới',
        titleEn: 'New Branch Opening',
        summary: 'Pet Care Pro khai trương chi nhánh mới tại Quận 7',
        summaryEn: 'Pet Care Pro opens new branch in District 7',
        content: 'Nội dung chi tiết về khai trương...',
        category: 'news',
        views: 3200,
        createdAt: new Date('2026-01-10')
    }
];

const NewsPage = () => {
    const { t, language } = useLanguage();
    const { user, isAuthenticated, isStaff } = useAuth();
    const { isDark } = useTheme();
    const { id } = useParams();
    const [news, setNews] = useState([]);
    const [selectedNews, setSelectedNews] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Article writing state
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [articleForm, setArticleForm] = useState({
        title: '',
        summary: '',
        content: '',
        category: 'care',
        image: ''
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchNewsDetail(id);
        } else {
            fetchNews();
        }
    }, [id, selectedCategory, currentPage]);

    const fetchNews = async () => {
        setLoading(true);
        try {
            const response = await newsAPI.getAll({
                category: selectedCategory,
                page: currentPage
            });
            let newsData = response.data.news || [];

            // Enrich with images if missing
            newsData = newsData.map((item, index) => ({
                ...item,
                image: item.image || newsImages[index % newsImages.length]
            }));

            setNews(newsData);
            setTotalPages(response.data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching news:', error);
            // Use mock data
            const filteredMock = selectedCategory === 'all'
                ? mockNews
                : mockNews.filter(n => n.category === selectedCategory);
            setNews(filteredMock.map((item, index) => ({
                ...item,
                image: newsImages[index % newsImages.length],
                title: language === 'en' ? item.titleEn : item.title,
                summary: language === 'en' ? item.summaryEn : item.summary
            })));
        } finally {
            setLoading(false);
        }
    };

    const fetchNewsDetail = async (newsId) => {
        setLoading(true);
        try {
            const response = await newsAPI.getOne(newsId);
            setSelectedNews(response.data.news);
        } catch (error) {
            console.error('Error fetching news detail:', error);
            // Use mock data
            const mockItem = mockNews.find(n => n._id === newsId);
            if (mockItem) {
                setSelectedNews({
                    ...mockItem,
                    image: newsImages[0],
                    title: language === 'en' ? mockItem.titleEn : mockItem.title,
                    summary: language === 'en' ? mockItem.summaryEn : mockItem.summary
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitArticle = async (e) => {
        e.preventDefault();
        if (!articleForm.title || !articleForm.summary || !articleForm.content) {
            toast.error(language === 'en' ? 'Please fill all required fields' : 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        setSubmitting(true);
        try {
            await newsAPI.create({
                ...articleForm,
                status: isStaff ? 'published' : 'pending' // Staff articles auto-published, others need approval
            });
            toast.success(
                isStaff
                    ? (language === 'en' ? 'Article published!' : 'Bài viết đã được đăng!')
                    : (language === 'en' ? 'Article submitted for review!' : 'Bài viết đã gửi chờ duyệt!')
            );
            setShowWriteModal(false);
            setArticleForm({ title: '', summary: '', content: '', category: 'care', image: '' });
            fetchNews();
        } catch (error) {
            console.error('Error creating article:', error);
            toast.error(language === 'en' ? 'Failed to submit article' : 'Không thể gửi bài viết');
        } finally {
            setSubmitting(false);
        }
    };

    const getCategoryLabel = (categoryValue) => {
        const cat = categories[language].find(c => c.value === categoryValue);
        return cat ? cat.label : categoryValue;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-theme flex items-center justify-center pt-20">
                <Spinner size="lg" />
            </div>
        );
    }

    // News detail view
    if (id && selectedNews) {
        return (
            <div className="min-h-screen bg-theme pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Light mode gradient */}
                    {!isDark && <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/30 opacity-70"></div>}
                    {/* Dark mode gradient */}
                    {isDark && <div className="absolute inset-0 bg-gradient-to-br from-dark-300 via-dark-200 to-indigo-900/10 opacity-80"></div>}
                    
                    {/* Decorative Background Pet Icons */}
                    <div className={`absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay ${isDark ? 'opacity-60' : 'opacity-40'}`}>
                        <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-20 right-[25%] w-24 h-24 rounded-full object-cover transform rotate-45 animate-float shadow-lg" />
                        <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-20 left-[5%] w-20 h-20 rounded-full object-cover transform -rotate-12 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                        <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/3 left-[15%] w-16 h-16 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                    </div>
                </div>

                <div className="container-custom max-w-4xl relative z-10">
                    <Link
                        to="/news"
                        className="inline-flex items-center text-primary-400 hover:text-primary-300 mb-6 transition-colors"
                    >
                        <FiArrowLeft className="mr-2" />
                        {language === 'en' ? 'Back to News' : 'Quay lại tin tức'}
                    </Link>

                    <article className="card-glass overflow-hidden animate-fade-in-up">
                        <div className="h-64 md:h-96 bg-theme-secondary overflow-hidden relative">
                            <img
                                src={selectedNews.image || newsImages[0]}
                                alt={selectedNews.title}
                                className="w-full h-full object-cover"
                            />
                            <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-dark-300' : 'from-white'} to-transparent`} />
                        </div>
                        <div className="p-6 md:p-8 -mt-20 relative">
                            <div className="flex flex-wrap items-center gap-4 mb-4">
                                <Badge variant="primary">{getCategoryLabel(selectedNews.category)}</Badge>
                                <span className="text-sm text-theme-secondary flex items-center">
                                    <FiCalendar className="mr-1" />
                                    {format(new Date(selectedNews.createdAt), 'dd/MM/yyyy')}
                                </span>
                                <span className="text-sm text-theme-secondary flex items-center">
                                    <FiEye className="mr-1" />
                                    {selectedNews.views} {language === 'en' ? 'views' : 'lượt xem'}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-display font-bold text-theme mb-6">
                                {selectedNews.title}
                            </h1>
                            {selectedNews.author && (
                                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-theme">
                                    <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                                        <FiUser className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <span className="font-medium text-theme-secondary">{selectedNews.author.name}</span>
                                </div>
                            )}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg text-theme-secondary mb-6">{selectedNews.summary}</p>
                                <div className="text-theme-muted leading-relaxed whitespace-pre-line">
                                    {selectedNews.content || (language === 'en'
                                        ? 'Full article content would appear here with detailed information about the topic, including tips, recommendations, and expert advice for pet owners.'
                                        : 'Nội dung chi tiết của bài viết sẽ xuất hiện ở đây với thông tin đầy đủ về chủ đề, bao gồm các mẹo, khuyến nghị và lời khuyên chuyên gia dành cho chủ nuôi thú cưng.'
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        );
    }

    // News list view
    return (
        <div className="min-h-screen bg-theme pt-24 pb-12 transition-colors duration-300 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Light mode gradient */}
                {!isDark && <div className="absolute inset-0 bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/30 opacity-70"></div>}
                {/* Dark mode gradient */}
                {isDark && <div className="absolute inset-0 bg-gradient-to-br from-dark-300 via-dark-200 to-indigo-900/10 opacity-80"></div>}
                
                {/* Decorative Background Pet Icons */}
                <div className={`absolute inset-0 pointer-events-none overflow-hidden mix-blend-overlay ${isDark ? 'opacity-60' : 'opacity-40'}`}>
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/4 right-[25%] w-24 h-24 rounded-full object-cover transform rotate-45 animate-float shadow-lg" />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-1/3 left-[15%] w-20 h-20 rounded-full object-cover transform -rotate-12 animate-float shadow-lg" style={{ animationDelay: '1s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-10 left-[15%] w-16 h-16 rounded-full object-cover transform -rotate-45 animate-float shadow-lg" style={{ animationDelay: '2s' }} />
                    <img src="https://images.pexels.com/photos/208834/pexels-photo-208834.jpeg" alt="" className="absolute bottom-10 right-[35%] w-24 h-24 rounded-full object-cover transform rotate-15 animate-float shadow-lg flex" style={{ animationDelay: '3s' }} />
                    <img src="https://images.pexels.com/photos/460797/pexels-photo-460797.jpeg" alt="" className="absolute top-1/2 right-[10%] w-14 h-14 rounded-full object-cover transform rotate-90 animate-float shadow-lg" style={{ animationDelay: '1.5s' }} />
                </div>
            </div>

            <div className="container-custom relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in-up">
                    <span className="badge-primary mb-4">
                        {language === 'en' ? 'Latest Updates' : 'Cập nhật mới nhất'}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-theme mb-4">
                        {language === 'en' ? 'Pet Care News' : 'Tin Tức Thú Cưng'}
                    </h1>
                    <p className="text-xl text-theme-secondary">
                        {language === 'en'
                            ? 'Stay updated with the latest pet care tips and news'
                            : 'Cập nhật những mẹo chăm sóc thú cưng và tin tức mới nhất'
                        }
                    </p>
                </div>

                {/* Write Article Button - for all authenticated users */}
                {isAuthenticated && (
                    <div className="flex justify-center mb-8 animate-fade-in-up">
                        <button
                            onClick={() => setShowWriteModal(true)}
                            className="btn-primary"
                        >
                            <FiEdit3 className="mr-2" />
                            {language === 'en' ? 'Write Article' : 'Viết bài'}
                        </button>
                    </div>
                )}

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mb-8 animate-fade-in-up delay-100">
                    {categories[language].map((cat) => (
                        <button
                            key={cat.value}
                            onClick={() => {
                                setSelectedCategory(cat.value);
                                setCurrentPage(1);
                            }}
                            className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ${selectedCategory === cat.value
                                ? 'bg-gradient-primary text-white shadow-glow-sm'
                                : `${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 border border-gray-200'}`
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* News Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {news.map((item, index) => (
                        <Link
                            key={item._id}
                            to={`/news/${item._id}`}
                            className="card-glass overflow-hidden group hover:-translate-y-2 transition-all duration-500 animate-fade-in-up"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="h-48 bg-theme-secondary overflow-hidden relative">
                                <img
                                    src={item.image || newsImages[index % newsImages.length]}
                                    alt={item.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-dark-300' : 'from-white'} via-transparent to-transparent`} />
                                <Badge variant="primary" className="absolute top-4 left-4">
                                    {getCategoryLabel(item.category)}
                                </Badge>
                            </div>
                            <div className="p-5">
                                <div className="flex items-center gap-4 mb-3 text-sm text-theme-muted">
                                    <span className="flex items-center">
                                        <FiClock className="mr-1 w-3 h-3" />
                                        {format(new Date(item.createdAt), 'dd/MM/yyyy')}
                                    </span>
                                    <span className="flex items-center">
                                        <FiEye className="mr-1 w-3 h-3" />
                                        {item.views}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-theme mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-theme-muted text-sm line-clamp-2">
                                    {item.summary}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-12">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl font-medium transition-all duration-300 ${currentPage === i + 1
                                    ? 'bg-gradient-primary text-white shadow-glow-sm'
                                    : `${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Write Article Modal */}
            <Modal
                isOpen={showWriteModal}
                onClose={() => setShowWriteModal(false)}
                title={language === 'en' ? 'Write New Article' : 'Viết bài mới'}
                size="lg"
            >
                <form onSubmit={handleSubmitArticle} className="space-y-4">
                    {!isStaff && (
                        <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-800'} text-sm`}>
                            ℹ️ {language === 'en'
                                ? 'Your article will be reviewed before publishing.'
                                : 'Bài viết của bạn sẽ được duyệt trước khi đăng.'}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                            {language === 'en' ? 'Title' : 'Tiêu đề'} *
                        </label>
                        <input
                            type="text"
                            value={articleForm.title}
                            onChange={(e) => setArticleForm({ ...articleForm, title: e.target.value })}
                            className="input"
                            placeholder={language === 'en' ? 'Enter article title...' : 'Nhập tiêu đề bài viết...'}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                            {language === 'en' ? 'Category' : 'Danh mục'} *
                        </label>
                        <select
                            value={articleForm.category}
                            onChange={(e) => setArticleForm({ ...articleForm, category: e.target.value })}
                            className="input w-full"
                            style={{
                                backgroundColor: 'var(--bg-secondary)',
                                color: 'var(--text-primary)',
                            }}
                        >
                            {categories[language].filter(c => c.value !== 'all').map((cat) => (
                                <option
                                    key={cat.value}
                                    value={cat.value}
                                    style={{
                                        backgroundColor: 'var(--bg-primary)',
                                        color: 'var(--text-primary)',
                                    }}
                                >
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                            {language === 'en' ? 'Summary' : 'Tóm tắt'} *
                        </label>
                        <textarea
                            value={articleForm.summary}
                            onChange={(e) => setArticleForm({ ...articleForm, summary: e.target.value })}
                            className="input resize-none"
                            rows={2}
                            placeholder={language === 'en' ? 'Brief summary of the article...' : 'Tóm tắt ngắn gọn về bài viết...'}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                            {language === 'en' ? 'Content' : 'Nội dung'} *
                        </label>
                        <textarea
                            value={articleForm.content}
                            onChange={(e) => setArticleForm({ ...articleForm, content: e.target.value })}
                            className="input resize-none"
                            rows={8}
                            placeholder={language === 'en' ? 'Write your article content here...' : 'Viết nội dung bài viết tại đây...'}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-theme-secondary mb-2">
                            {language === 'en' ? 'Image URL (optional)' : 'URL ảnh bìa (tùy chọn)'}
                        </label>
                        <input
                            type="url"
                            value={articleForm.image}
                            onChange={(e) => setArticleForm({ ...articleForm, image: e.target.value })}
                            className="input"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                            {submitting ? (
                                <Spinner size="sm" />
                            ) : (
                                <>
                                    <FiEdit3 className="mr-2" />
                                    {isStaff
                                        ? (language === 'en' ? 'Publish' : 'Đăng bài')
                                        : (language === 'en' ? 'Submit for Review' : 'Gửi chờ duyệt')}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowWriteModal(false)}
                            className="btn-ghost"
                        >
                            {language === 'en' ? 'Cancel' : 'Hủy'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default NewsPage;
