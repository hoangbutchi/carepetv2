import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.user);
                } catch (error) {
                    console.error('Auth init error:', error);
                    sessionStorage.removeItem('token');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token: newToken, user: userData } = response.data;

            sessionStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(userData);

            return { success: true, user: userData };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Đăng nhập thất bại';
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token: newToken, user: newUser } = response.data;

            sessionStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);

            return { success: true, user: newUser };
        } catch (error) {
            console.error('Register error:', error);
            const message = error.response?.data?.message || 'Đăng ký thất bại';
            return { success: false, message };
        }
    };

    const logout = () => {
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (data) => {
        const response = await api.put('/auth/profile', data);
        setUser(response.data.user);
        return response.data.user;
    };

    const updateUser = (userData) => {
        setUser(userData);
    };

    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';
    const isStaff = user?.role === 'staff' || user?.role === 'doctor' || user?.role === 'admin';
    const isCustomer = user?.role === 'customer' || !user?.role;
    const isDoctor = user?.role === 'doctor';

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            register,
            logout,
            updateProfile,
            updateUser,
            isAuthenticated,
            isAdmin,
            isStaff,
            isCustomer
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;

