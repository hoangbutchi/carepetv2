// Loading Spinner
export const Spinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className={`${sizes[size]} ${className} rounded-full border-white/20 border-t-primary-500 animate-spin`} />
    );
};

// Loading Page Overlay
export const LoadingPage = () => (
    <div className="fixed inset-0 bg-dark-300/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
            <div className="relative">
                <Spinner size="lg" />
                <div className="absolute inset-0 rounded-full bg-gradient-primary opacity-20 blur-lg animate-pulse" />
            </div>
            <p className="mt-6 text-gray-400 font-medium">Loading...</p>
        </div>
    </div>
);

// Skeleton Loader
export const Skeleton = ({ className = '', variant = 'text' }) => {
    const variants = {
        text: 'h-4 w-full',
        title: 'h-8 w-3/4',
        avatar: 'h-12 w-12 rounded-full',
        image: 'h-48 w-full',
        card: 'h-64 w-full rounded-xl',
        button: 'h-10 w-24 rounded-lg',
    };

    return (
        <div className={`skeleton ${variants[variant]} ${className}`} />
    );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => (
    <div className="card p-4">
        <Skeleton variant="image" className="rounded-xl mb-4" />
        <Skeleton variant="title" className="mb-2" />
        <Skeleton className="w-1/2 mb-4" />
        <div className="flex justify-between items-center">
            <Skeleton className="w-20 h-6" />
            <Skeleton variant="button" />
        </div>
    </div>
);

// Empty State
export const EmptyState = ({ icon, title, description, action }) => (
    <div className="text-center py-16">
        <div className="w-20 h-20 glass rounded-2xl flex items-center justify-center mx-auto mb-6">
            {icon || <span className="text-4xl">📭</span>}
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        {description && <p className="text-gray-400 mb-6 max-w-md mx-auto">{description}</p>}
        {action}
    </div>
);

// Badge Component
export const Badge = ({ children, variant = 'primary', className = '' }) => {
    const variants = {
        primary: 'badge-primary',
        secondary: 'bg-secondary-500/20 text-secondary-400 border border-secondary-500/30',
        success: 'badge-success',
        warning: 'badge-warning',
        danger: 'badge-danger',
        gray: 'bg-white/10 text-gray-300 border border-white/20',
    };

    return (
        <span className={`badge ${variants[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-full mx-4',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-dark-300/80 backdrop-blur-sm modal-overlay" onClick={onClose} />
            <div className={`relative card-glass w-full ${sizes[size]} modal-content max-h-[90vh] overflow-y-auto`}>
                {title && (
                    <div className="sticky top-0 bg-dark-200/95 backdrop-blur-sm px-6 py-4 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

// Confirm Dialog
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', variant = 'danger' }) => {
    if (!isOpen) return null;

    const buttonVariants = {
        danger: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
        primary: 'btn-primary',
        warning: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500',
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${variant === 'danger' ? 'bg-red-500/20' : 'bg-primary-500/20'}`}>
                    <span className="text-3xl">{variant === 'danger' ? '⚠️' : 'ℹ️'}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
                <p className="text-gray-400 mb-6">{message}</p>
                <div className="flex space-x-3 justify-center">
                    <button onClick={onClose} className="btn-ghost px-6">
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`btn text-white px-6 ${buttonVariants[variant]}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Input with Label
export const FormInput = ({ label, error, required, className = '', ...props }) => (
    <div className={className}>
        {label && (
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
        )}
        <input
            className={`input ${error ? 'input-error' : ''}`}
            {...props}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
);

// Select with Label
export const FormSelect = ({ label, error, required, options, placeholder, className = '', ...props }) => (
    <div className={className}>
        {label && (
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
        )}
        <select
            className={`input cursor-pointer ${error ? 'input-error' : ''}`}
            {...props}
        >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                    {opt.label}
                </option>
            ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
);

// Textarea with Label
export const FormTextarea = ({ label, error, required, className = '', ...props }) => (
    <div className={className}>
        {label && (
            <label className="block text-sm font-medium text-gray-300 mb-2">
                {label}
                {required && <span className="text-red-400 ml-1">*</span>}
            </label>
        )}
        <textarea
            className={`input min-h-[100px] resize-none ${error ? 'input-error' : ''}`}
            {...props}
        />
        {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
);

// Tabs Component
export const Tabs = ({ tabs, activeTab, onChange }) => (
    <div className="flex space-x-1 p-1 rounded-xl bg-white/5">
        {tabs.map((tab) => (
            <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${activeTab === tab.id
                        ? 'bg-gradient-primary text-white shadow-glow-sm'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
            >
                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                {tab.label}
            </button>
        ))}
    </div>
);

// Progress Bar
export const ProgressBar = ({ value, max = 100, color = 'primary', showLabel = true }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const colors = {
        primary: 'bg-gradient-primary',
        success: 'bg-gradient-to-r from-green-500 to-emerald-500',
        warning: 'bg-gradient-to-r from-yellow-500 to-orange-500',
        danger: 'bg-gradient-to-r from-red-500 to-pink-500',
    };

    return (
        <div className="w-full">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                    className={`h-full ${colors[color]} transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <p className="text-xs text-gray-400 mt-1">{percentage.toFixed(0)}%</p>
            )}
        </div>
    );
};

export default {
    Spinner,
    LoadingPage,
    Skeleton,
    ProductCardSkeleton,
    EmptyState,
    Badge,
    Modal,
    ConfirmDialog,
    FormInput,
    FormSelect,
    FormTextarea,
    Tabs,
    ProgressBar,
};
