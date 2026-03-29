import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add token
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

// API Helper functions
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    getStaff: () => api.get('/auth/staff'),
    getDoctors: () => api.get('/auth/doctors'),
    getAllUsers: () => api.get('/auth/users'),
    updateUserRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }),
    deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const petAPI = {
    getAll: () => api.get('/pets'),
    getOne: (id) => api.get(`/pets/${id}`),
    create: (data) => api.post('/pets', data),
    update: (id, data) => api.put(`/pets/${id}`, data),
    delete: (id) => api.delete(`/pets/${id}`),
    addMedical: (id, data) => api.post(`/pets/${id}/medical`, data),
    getReminders: (id) => api.get(`/pets/${id}/reminders`),
    getAllReminders: () => api.get('/pets/reminders/all'),
};

export const appointmentAPI = {
    getAll: () => api.get('/appointments'),
    getOne: (id) => api.get(`/appointments/${id}`),
    create: (data) => api.post('/appointments', data),
    update: (id, data) => api.put(`/appointments/${id}`, data),
    cancel: (id) => api.delete(`/appointments/${id}`),
    getAvailableSlots: (date, staffId) =>
        api.get('/appointments/available-slots', { params: { date, staffId } }),
    getToday: () => api.get('/appointments/today'),
    getByDate: (date) => api.get('/appointments/by-date', { params: { date } }),
};

export const productAPI = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    getFeatured: () => api.get('/products/featured'),
    getByCategory: (category) => api.get(`/products/category/${category}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

export const orderAPI = {
    getAll: (params) => api.get('/orders', { params }),
    getOne: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
    processPayment: (id, data) => api.post(`/orders/${id}/payment`, data),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
    getStats: () => api.get('/orders/stats'),
};

export const messageAPI = {
    send: (data) => api.post('/messages', data),
    getConversations: () => api.get('/messages/conversations'),
    getMessages: (userId) => api.get(`/messages/${userId}`),
    markAsRead: (userId) => api.put(`/messages/${userId}/read`),
    getUnreadCount: () => api.get('/messages/unread/count'),
    getStaff: () => api.get('/messages/staff'),
};

export const newsAPI = {
    getAll: (params) => api.get('/news', { params }),
    getOne: (id) => api.get(`/news/${id}`),
    getFeatured: () => api.get('/news/featured'),
    create: (data) => api.post('/news', data),
    update: (id, data) => api.put(`/news/${id}`, data),
    delete: (id) => api.delete(`/news/${id}`),
    getMyArticles: () => api.get('/news/my-articles'),
    getPending: () => api.get('/news/pending'),
    approve: (id) => api.put(`/news/${id}/approve`),
    reject: (id, reason) => api.put(`/news/${id}/reject`, { reason }),
};

export const momoAPI = {
    createPayment: (data) => api.post('/momo/payment', data),
};

export const vnpayAPI = {
    createPayment: (data) => api.post('/vnpay/payment', data),
};

export const healthAPI = {
    getHistory: (petId) => api.get(`/health/${petId}`),
    createRecord: (data) => api.post('/health', data),
    exportPDF: (petId) => api.get(`/health/export-pdf/${petId}`, { responseType: 'blob' }),
};

export const lostPetAPI = {
    getAll: () => api.get('/lost-pets'),
    create: (data) => api.post('/lost-pets', data),
    updateStatus: (id, data) => api.put(`/lost-pets/${id}`, data),
    delete: (id) => api.delete(`/lost-pets/${id}`),
};
