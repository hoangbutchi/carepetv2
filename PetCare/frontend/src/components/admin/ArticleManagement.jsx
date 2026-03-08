import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiFileText, FiCheck, FiXCircle, FiClock } from 'react-icons/fi';
import { format } from 'date-fns';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { newsAPI } from '../../services/api';
import { Badge, Spinner, EmptyState } from '../common/UI';
import toast from 'react-hot-toast';

const categories = [
    { value: 'health', icon: '🏥' },
    { value: 'nutrition', icon: '🥗' },
    { value: 'care', icon: '💝' },
    { value: 'training', icon: '🎓' },
    { value: 'news', icon: '📰' },
];

const defaultArticle = {
    title: '',
    summary: '',
    content: '',
    category: 'care',
    image: '',
};

const ArticleManagement = () => {
    const { language } = useLanguage();
    const { user, isStaff } = useAuth();

    const [activeTab, setActiveTab] = useState('write');
    const [myArticles, setMyArticles] = useState([]);
    const [pendingArticles, setPendingArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(defaultArticle);
    const [editingArticle, setEditingArticle] = useState(null);
    const [saving, setSaving] = useState(false);

    const categoryLabels = {
        en: { health: 'Health', nutrition: 'Nutrition', care: 'Care Tips', training: 'Training', news: 'News' },
        vi: { health: 'Sức khỏe', nutrition: 'Dinh dưỡng', care: 'Mẹo chăm sóc', training: 'Huấn luyện', news: 'Tin tức' }
    };

    const statusLabels = {
        en: { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' },
        vi: { pending: 'Chờ duyệt', approved: 'Đã duyệt', rejected: 'Bị từ chối' }
    };

    useEffect(() => {
        if (activeTab === 'my-articles') {
            fetchMyArticles();
        } else if (activeTab === 'pending' && isStaff) {
            fetchPendingArticles();
        }
    }, [activeTab]);

    const fetchMyArticles = async () => {
        setLoading(true);
        try {
            const response = await newsAPI.getMyArticles();
            setMyArticles(response.data.news || response.data.articles || []);
        } catch (error) {
            console.error('Error fetching my articles:', error);
            setMyArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingArticles = async () => {
        setLoading(true);
        try {
            const response = await newsAPI.getPending();
            setPendingArticles(response.data.news || response.data.articles || []);
        } catch (error) {
            console.error('Error fetching pending articles:', error);
            setPendingArticles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content) {
            toast.error(language === 'en' ? 'Please fill title and content' : 'Vui lòng điền tiêu đề và nội dung');
            return;
        }

        setSaving(true);
        try {
            if (editingArticle) {
                await newsAPI.update(editingArticle._id, formData);
                toast.success(language === 'en' ? 'Article updated!' : 'Đã cập nhật bài viết!');
            } else {
                await newsAPI.create(formData);
                const msg = isStaff
                    ? (language === 'en' ? 'Article published!' : 'Bài viết đã đăng!')
                    : (language === 'en' ? 'Article submitted for review!' : 'Bài viết đã gửi chờ duyệt!');
                toast.success(msg);
            }
            setFormData(defaultArticle);
            setEditingArticle(null);
            if (activeTab === 'my-articles') fetchMyArticles();
        } catch (error) {
            toast.error(language === 'en' ? 'Error saving article' : 'Lỗi khi lưu bài viết');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (article) => {
        setFormData({
            title: article.title || '',
            summary: article.summary || '',
            content: article.content || '',
            category: article.category || 'care',
            image: article.image || '',
        });
        setEditingArticle(article);
        setActiveTab('write');
    };

    const handleDelete = async (id) => {
        if (!confirm(language === 'en' ? 'Delete this article?' : 'Xóa bài viết này?')) return;
        try {
            await newsAPI.delete(id);
            toast.success(language === 'en' ? 'Article deleted!' : 'Đã xóa bài viết!');
            fetchMyArticles();
        } catch (error) {
            toast.error(language === 'en' ? 'Error deleting' : 'Lỗi khi xóa');
        }
    };

    const handleApprove = async (id) => {
        try {
            await newsAPI.approve(id);
            toast.success(language === 'en' ? 'Article approved!' : 'Đã duyệt bài viết!');
            fetchPendingArticles();
        } catch (error) {
            toast.error(language === 'en' ? 'Error approving' : 'Lỗi khi duyệt');
        }
    };

    const handleReject = async (id) => {
        const reason = prompt(language === 'en' ? 'Rejection reason (optional):' : 'Lý do từ chối (không bắt buộc):');
        try {
            await newsAPI.reject(id, { reason });
            toast.success(language === 'en' ? 'Article rejected' : 'Đã từ chối bài viết');
            fetchPendingArticles();
        } catch (error) {
            toast.error(language === 'en' ? 'Error rejecting' : 'Lỗi khi từ chối');
        }
    };

    const cancelEdit = () => {
        setFormData(defaultArticle);
        setEditingArticle(null);
    };

    const getStatusBadge = (status) => {
        const variants = { pending: 'warning', approved: 'success', rejected: 'danger' };
        return <Badge variant={variants[status]}>{statusLabels[language][status]}</Badge>;
    };

    return (
        <div className="card-glass">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <FiFileText className="mr-2 text-primary-400" />
                    {language === 'en' ? 'Article Management' : 'Quản lý Bài viết'}
                </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
                <button
                    onClick={() => setActiveTab('write')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ${activeTab === 'write'
                        ? 'text-white border-b-2 border-primary-500 bg-white/5'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <FiPlus className="inline mr-1" />
                    {language === 'en' ? 'Write Article' : 'Viết bài'}
                </button>
                <button
                    onClick={() => setActiveTab('my-articles')}
                    className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ${activeTab === 'my-articles'
                        ? 'text-white border-b-2 border-primary-500 bg-white/5'
                        : 'text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <FiFileText className="inline mr-1" />
                    {language === 'en' ? 'My Articles' : 'Bài của tôi'}
                </button>
                {isStaff && (
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-300 ${activeTab === 'pending'
                            ? 'text-white border-b-2 border-primary-500 bg-white/5'
                            : 'text-gray-500 hover:text-gray-300'
                            }`}
                    >
                        <FiClock className="inline mr-1" />
                        {language === 'en' ? 'Pending Review' : 'Chờ duyệt'}
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === 'write' && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {editingArticle && (
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-xl flex items-center justify-between">
                                <span>{language === 'en' ? 'Editing article...' : 'Đang sửa bài viết...'}</span>
                                <button type="button" onClick={cancelEdit} className="text-blue-400 hover:underline">
                                    {language === 'en' ? 'Cancel' : 'Hủy'}
                                </button>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {language === 'en' ? 'Title' : 'Tiêu đề'} *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="input"
                                placeholder={language === 'en' ? 'Article title...' : 'Tiêu đề bài viết...'}
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {language === 'en' ? 'Summary' : 'Tóm tắt'}
                            </label>
                            <input
                                type="text"
                                name="summary"
                                value={formData.summary}
                                onChange={handleChange}
                                className="input"
                                placeholder={language === 'en' ? 'Short description...' : 'Mô tả ngắn...'}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {language === 'en' ? 'Category' : 'Danh mục'}
                                </label>
                                <select name="category" value={formData.category} onChange={handleChange} className="input">
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {categoryLabels[language][cat.value]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {language === 'en' ? 'Cover Image URL' : 'Link ảnh bìa'}
                                </label>
                                <input
                                    type="url"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleChange}
                                    className="input"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                {language === 'en' ? 'Content' : 'Nội dung'} *
                            </label>
                            <textarea
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                rows={8}
                                className="input resize-none"
                                placeholder={language === 'en' ? 'Write your article content here...' : 'Viết nội dung bài viết ở đây...'}
                                required
                            />
                        </div>

                        {!isStaff && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-2 rounded-xl text-sm">
                                ⚠️ {language === 'en'
                                    ? 'Your article will be submitted for review by staff before publication.'
                                    : 'Bài viết của bạn sẽ được gửi đến nhân viên duyệt trước khi đăng.'}
                            </div>
                        )}

                        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center">
                            {saving ? <Spinner size="sm" /> : (
                                <>
                                    <FiSave className="mr-2" />
                                    {editingArticle
                                        ? (language === 'en' ? 'Update Article' : 'Cập nhật')
                                        : isStaff
                                            ? (language === 'en' ? 'Publish Article' : 'Đăng bài')
                                            : (language === 'en' ? 'Submit for Review' : 'Gửi duyệt')
                                    }
                                </>
                            )}
                        </button>
                    </form>
                )}

                {activeTab === 'my-articles' && (
                    loading ? (
                        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
                    ) : myArticles.length === 0 ? (
                        <EmptyState
                            icon={<span className="text-4xl">📝</span>}
                            title={language === 'en' ? 'No articles yet' : 'Chưa có bài viết'}
                            description={language === 'en' ? 'Start writing your first article!' : 'Hãy viết bài viết đầu tiên!'}
                        />
                    ) : (
                        <div className="space-y-4">
                            {myArticles.map(article => (
                                <div key={article._id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {getStatusBadge(article.status)}
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(article.createdAt), 'dd/MM/yyyy HH:mm')}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-white">{article.title}</h3>
                                            {article.summary && (
                                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{article.summary}</p>
                                            )}
                                            {article.rejectionReason && (
                                                <p className="text-sm text-red-400 mt-2">
                                                    ❌ {language === 'en' ? 'Reason' : 'Lý do'}: {article.rejectionReason}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleEdit(article)}
                                                className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(article._id)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'pending' && isStaff && (
                    loading ? (
                        <div className="flex justify-center py-8"><Spinner size="lg" /></div>
                    ) : pendingArticles.length === 0 ? (
                        <EmptyState
                            icon={<span className="text-4xl">✅</span>}
                            title={language === 'en' ? 'No pending articles' : 'Không có bài chờ duyệt'}
                            description={language === 'en' ? 'All articles have been reviewed!' : 'Tất cả bài viết đã được duyệt!'}
                        />
                    ) : (
                        <div className="space-y-4">
                            {pendingArticles.map(article => (
                                <div key={article._id} className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge variant="warning">{language === 'en' ? 'Pending' : 'Chờ duyệt'}</Badge>
                                                <span className="text-xs text-gray-400">
                                                    {language === 'en' ? 'By' : 'Bởi'}: {article.author?.name || 'Unknown'}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {format(new Date(article.createdAt), 'dd/MM/yyyy HH:mm')}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-white">{article.title}</h3>
                                            {article.summary && (
                                                <p className="text-sm text-gray-300 mt-1">{article.summary}</p>
                                            )}
                                            <p className="text-sm text-gray-500 mt-2 line-clamp-3">{article.content}</p>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleApprove(article._id)}
                                                className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg"
                                                title={language === 'en' ? 'Approve' : 'Duyệt'}
                                            >
                                                <FiCheck className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleReject(article._id)}
                                                className="p-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
                                                title={language === 'en' ? 'Reject' : 'Từ chối'}
                                            >
                                                <FiXCircle className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ArticleManagement;
