import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiPackage, FiImage } from 'react-icons/fi';
import { useLanguage } from '../../i18n/LanguageContext';
import { productAPI } from '../../services/api';
import { Badge, Spinner, EmptyState } from '../common/UI';
import toast from 'react-hot-toast';

const categories = [
    { value: 'food', icon: '🍖' },
    { value: 'accessory', icon: '🎀' },
    { value: 'medicine', icon: '💊' },
    { value: 'toy', icon: '🎾' },
    { value: 'hygiene', icon: '🧴' },
];

const defaultProduct = {
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'food',
    stock: '',
    images: [''],
    isFeatured: false,
};

const ProductManagement = () => {
    const { language } = useLanguage();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState(defaultProduct);
    const [saving, setSaving] = useState(false);

    const categoryLabels = {
        en: { food: 'Food', accessory: 'Accessory', toy: 'Toys', medicine: 'Medicine', hygiene: 'Hygiene' },
        vi: { food: 'Thức ăn', accessory: 'Phụ kiện', toy: 'Đồ chơi', medicine: 'Thuốc', hygiene: 'Vệ sinh' }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await productAPI.getAll({ limit: 100 });
            setProducts(response.data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
            // Mock data
            setProducts([
                { _id: '1', name: 'Thức ăn cho chó Royal Canin 10kg', price: 450000, originalPrice: 500000, category: 'food', stock: 50, isFeatured: true, images: ['https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=200'] },
                { _id: '2', name: 'Vòng cổ da cao cấp', price: 150000, category: 'accessory', stock: 30, images: [] },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormData(defaultProduct);
        setShowModal(true);
    };

    const openEditModal = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            originalPrice: product.originalPrice || '',
            category: product.category || 'food',
            stock: product.stock || '',
            images: product.images?.length ? product.images : [''],
            isFeatured: product.isFeatured || false,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingProduct(null);
        setFormData(defaultProduct);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageChange = (index, value) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const removeImageField = (index) => {
        if (formData.images.length > 1) {
            const newImages = formData.images.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, images: newImages }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.stock) {
            toast.error(language === 'en' ? 'Please fill required fields' : 'Vui lòng điền đầy đủ thông tin');
            return;
        }

        setSaving(true);
        try {
            const data = {
                ...formData,
                price: Number(formData.price),
                originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
                stock: Number(formData.stock),
                images: formData.images.filter(img => img.trim() !== ''),
            };

            if (editingProduct) {
                await productAPI.update(editingProduct._id, data);
                toast.success(language === 'en' ? 'Product updated!' : 'Đã cập nhật sản phẩm!');
            } else {
                await productAPI.create(data);
                toast.success(language === 'en' ? 'Product added!' : 'Đã thêm sản phẩm!');
            }
            closeModal();
            fetchProducts();
        } catch (error) {
            toast.error(language === 'en' ? 'Error saving product' : 'Lỗi khi lưu sản phẩm');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm(language === 'en' ? 'Delete this product?' : 'Xóa sản phẩm này?')) return;

        try {
            await productAPI.delete(id);
            toast.success(language === 'en' ? 'Product deleted!' : 'Đã xóa sản phẩm!');
            fetchProducts();
        } catch (error) {
            toast.error(language === 'en' ? 'Error deleting product' : 'Lỗi khi xóa sản phẩm');
        }
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + '₫';

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="card-glass">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white flex items-center">
                    <FiPackage className="mr-2 text-primary-400" />
                    {language === 'en' ? 'Product Management' : 'Quản lý Sản phẩm'}
                </h2>
                <button onClick={openAddModal} className="btn-primary flex items-center">
                    <FiPlus className="mr-2" />
                    {language === 'en' ? 'Add Product' : 'Thêm sản phẩm'}
                </button>
            </div>

            {/* Product Table */}
            <div className="overflow-x-auto">
                {products.length > 0 ? (
                    <table className="w-full">
                        <thead className="bg-white/5">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Product' : 'Sản phẩm'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Category' : 'Danh mục'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Price' : 'Giá'}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Stock' : 'Tồn kho'}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {language === 'en' ? 'Actions' : 'Thao tác'}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {products.map((product) => (
                                <tr key={product._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                                                {product.images?.[0] ? (
                                                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                        <FiImage className="w-5 h-5" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <p className="font-medium text-white line-clamp-1">{product.name}</p>
                                                {product.isFeatured && (
                                                    <Badge variant="warning" className="text-xs mt-1">⭐ Featured</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-300">
                                            {categories.find(c => c.value === product.category)?.icon}{' '}
                                            {categoryLabels[language][product.category]}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold text-gradient">{formatPrice(product.price)}</span>
                                        {product.originalPrice && (
                                            <span className="text-sm text-gray-500 line-through ml-2">
                                                {formatPrice(product.originalPrice)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${product.stock > 10 ? 'text-green-400' : product.stock > 0 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => openEditModal(product)}
                                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors mr-1"
                                        >
                                            <FiEdit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(product._id)}
                                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-8">
                        <EmptyState
                            icon={<span className="text-4xl">📦</span>}
                            title={language === 'en' ? 'No products yet' : 'Chưa có sản phẩm'}
                            description={language === 'en' ? 'Add your first product to get started' : 'Thêm sản phẩm đầu tiên để bắt đầu'}
                        />
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-dark-200 border border-white/10 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-xl font-semibold text-white">
                                {editingProduct
                                    ? (language === 'en' ? 'Edit Product' : 'Sửa sản phẩm')
                                    : (language === 'en' ? 'Add Product' : 'Thêm sản phẩm')
                                }
                            </h3>
                            <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {language === 'en' ? 'Product Name' : 'Tên sản phẩm'} *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {language === 'en' ? 'Description' : 'Mô tả'}
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="input resize-none"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {language === 'en' ? 'Category' : 'Danh mục'}
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="input"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.icon} {categoryLabels[language][cat.value]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price & Original Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {language === 'en' ? 'Price' : 'Giá bán'} (₫) *
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="input"
                                        required
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        {language === 'en' ? 'Original Price' : 'Giá gốc'} (₫)
                                    </label>
                                    <input
                                        type="number"
                                        name="originalPrice"
                                        value={formData.originalPrice}
                                        onChange={handleChange}
                                        className="input"
                                        min="0"
                                    />
                                </div>
                            </div>

                            {/* Stock */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {language === 'en' ? 'Stock Quantity' : 'Số lượng tồn'} *
                                </label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    className="input"
                                    required
                                    min="0"
                                />
                            </div>

                            {/* Images */}
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    {language === 'en' ? 'Image URLs' : 'Link ảnh'}
                                </label>
                                {formData.images.map((img, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input
                                            type="url"
                                            value={img}
                                            onChange={(e) => handleImageChange(idx, e.target.value)}
                                            placeholder="https://..."
                                            className="input flex-1"
                                        />
                                        {formData.images.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeImageField(idx)}
                                                className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg"
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={addImageField}
                                    className="text-sm text-primary-400 hover:text-primary-300"
                                >
                                    + {language === 'en' ? 'Add more images' : 'Thêm ảnh'}
                                </button>
                            </div>

                            {/* Featured */}
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isFeatured"
                                    id="isFeatured"
                                    checked={formData.isFeatured}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-primary-600 rounded border-gray-600 bg-dark-300"
                                />
                                <label htmlFor="isFeatured" className="ml-2 text-sm text-gray-300">
                                    ⭐ {language === 'en' ? 'Featured Product' : 'Sản phẩm nổi bật'}
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="btn-ghost flex-1">
                                    {language === 'en' ? 'Cancel' : 'Hủy'}
                                </button>
                                <button type="submit" disabled={saving} className="btn-primary flex-1 flex items-center justify-center">
                                    {saving ? <Spinner size="sm" /> : (
                                        <>
                                            <FiSave className="mr-2" />
                                            {language === 'en' ? 'Save' : 'Lưu'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement;
