import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSend, FiUser, FiMessageCircle, FiSearch, FiArrowLeft, FiPhone, FiVideo, FiMoreVertical } from 'react-icons/fi';
import { format } from 'date-fns';
import { useLanguage } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { messageAPI } from '../services/api';
import { Spinner, EmptyState } from '../components/common/UI';
import toast from 'react-hot-toast';

const ChatPage = () => {
    const { t, language } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const messagesEndRef = useRef(null);

    const [conversations, setConversations] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileChat, setShowMobileChat] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchInitialData();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        // Auto-select doctor from URL param
        const doctorId = searchParams.get('doctor');
        if (doctorId && staff.length > 0) {
            const doctor = staff.find(s => s._id === doctorId);
            if (doctor) {
                handleSelectUser(doctor);
            }
        }
    }, [searchParams, staff]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Poll for new messages every 5 seconds
        if (selectedUser) {
            const interval = setInterval(() => {
                fetchMessages(selectedUser._id, true);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedUser]);

    const fetchInitialData = async () => {
        try {
            const [conversationsRes, staffRes] = await Promise.all([
                messageAPI.getConversations().catch(() => ({ data: { conversations: [] } })),
                messageAPI.getStaff().catch(() => ({ data: { staff: [] } }))
            ]);
            setConversations(conversationsRes.data.conversations || []);
            setStaff(staffRes.data.staff || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId, silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await messageAPI.getMessages(userId);
            setMessages(response.data.messages || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    const handleSelectUser = (chatUser) => {
        setSelectedUser(chatUser);
        setShowMobileChat(true);
        fetchMessages(chatUser._id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setSending(true);
        try {
            const response = await messageAPI.send({
                receiverId: selectedUser._id,
                message: newMessage.trim()
            });
            setMessages([...messages, response.data.message]);
            setNewMessage('');
        } catch (error) {
            toast.error(language === 'en' ? 'Failed to send message' : 'Gửi tin nhắn thất bại');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    };

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const allUsers = [...conversations.map(c => c.user), ...filteredStaff.filter(s =>
        !conversations.some(c => c.user?._id === s._id)
    )];

    if (loading && !selectedUser) {
        return (
            <div className={`min-h-screen flex items-center justify-center pt-20 ${isDark ? 'bg-dark-100' : 'bg-gray-50'}`}>
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen pt-20 transition-colors duration-300 ${isDark ? 'bg-dark-100' : 'bg-gray-50'}`}>
            <div className="container-custom py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className={`text-2xl md:text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {language === 'en' ? 'Messages' : 'Tin nhắn'}
                    </h1>
                    <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {language === 'en' ? 'Chat with our veterinarians and staff' : 'Trò chuyện với bác sĩ thú y và nhân viên'}
                    </p>
                </div>

                {/* Main Chat Container */}
                <div className={`rounded-2xl overflow-hidden h-[calc(100vh-200px)] shadow-xl border ${isDark ? 'bg-dark-200 border-white/10' : 'bg-white border-gray-200'
                    }`}>
                    <div className="flex h-full">
                        {/* Sidebar - User list */}
                        <div className={`w-full md:w-80 lg:w-96 flex flex-col border-r ${isDark ? 'bg-dark-200 border-white/10' : 'bg-gray-50 border-gray-200'
                            } ${showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                            {/* Search Header */}
                            <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                <div className="relative">
                                    <FiSearch className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder={language === 'en' ? 'Search doctors...' : 'Tìm bác sĩ...'}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none transition-all ${isDark
                                                ? 'bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500'
                                                : 'bg-white border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
                                            }`}
                                    />
                                </div>
                            </div>

                            {/* User list */}
                            <div className="flex-1 overflow-y-auto">
                                {allUsers.length === 0 ? (
                                    <div className={`p-6 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                        <FiUser className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>{language === 'en' ? 'No contacts available' : 'Chưa có liên hệ'}</p>
                                    </div>
                                ) : (
                                    allUsers.map((chatUser) => (
                                        <button
                                            key={chatUser?._id}
                                            onClick={() => handleSelectUser(chatUser)}
                                            className={`w-full p-4 flex items-center gap-4 transition-all duration-200 border-b ${selectedUser?._id === chatUser?._id
                                                    ? isDark
                                                        ? 'bg-gradient-to-r from-primary-500/20 to-transparent border-l-4 border-l-primary-500 border-b-white/5'
                                                        : 'bg-primary-50 border-l-4 border-l-primary-500 border-b-gray-100'
                                                    : isDark
                                                        ? 'hover:bg-white/5 border-b-white/5'
                                                        : 'hover:bg-gray-100 border-b-gray-100'
                                                }`}
                                        >
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium overflow-hidden shadow-lg">
                                                    {chatUser?.avatar ? (
                                                        <img src={chatUser.avatar} alt={chatUser.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-lg">{chatUser?.name?.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                    {chatUser?.name}
                                                </p>
                                                <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    {chatUser?.specialization || (chatUser?.role === 'admin' ? 'Admin' : 'Staff')}
                                                </p>
                                            </div>
                                            {conversations.find(c => c.user?._id === chatUser?._id)?.unreadCount > 0 && (
                                                <span className="min-w-[24px] h-6 bg-gradient-primary text-white text-xs rounded-full flex items-center justify-center px-2 shadow-lg">
                                                    {conversations.find(c => c.user?._id === chatUser?._id)?.unreadCount}
                                                </span>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat area */}
                        <div className={`flex-1 flex flex-col ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}>
                            {selectedUser ? (
                                <>
                                    {/* Chat header */}
                                    <div className={`px-4 py-3 flex items-center gap-4 border-b ${isDark ? 'bg-dark-200 border-white/10' : 'bg-white border-gray-200'
                                        }`}>
                                        <button
                                            onClick={() => setShowMobileChat(false)}
                                            className={`md:hidden p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            <FiArrowLeft className="w-5 h-5" />
                                        </button>
                                        <div className="relative">
                                            <div className="w-11 h-11 bg-gradient-primary rounded-full flex items-center justify-center text-white font-medium overflow-hidden">
                                                {selectedUser.avatar ? (
                                                    <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg">{selectedUser.name?.charAt(0).toUpperCase()}</span>
                                                )}
                                            </div>
                                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                                        </div>
                                        <div className="flex-1">
                                            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedUser.name}</p>
                                            <p className={`text-sm flex items-center gap-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                                {language === 'en' ? 'Online' : 'Trực tuyến'}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                                }`}>
                                                <FiPhone className="w-5 h-5" />
                                            </button>
                                            <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                                }`}>
                                                <FiVideo className="w-5 h-5" />
                                            </button>
                                            <button className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                                                }`}>
                                                <FiMoreVertical className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDark ? 'bg-dark-300' : 'bg-gray-50'
                                        }`}>
                                        {messages.length === 0 ? (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="text-center">
                                                    <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'
                                                        }`}>
                                                        <FiMessageCircle className={`w-10 h-10 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                                                    </div>
                                                    <p className={`text-lg font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                                        {language === 'en' ? 'Start a conversation' : 'Bắt đầu cuộc trò chuyện'}
                                                    </p>
                                                    <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {language === 'en' ? 'Send a message to get started' : 'Gửi tin nhắn để bắt đầu'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            messages.map((msg, index) => (
                                                <div
                                                    key={msg._id}
                                                    className={`flex ${msg.sender?._id === user?.id ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
                                                    style={{ animationDelay: `${index * 30}ms` }}
                                                >
                                                    <div className={`max-w-[75%] ${msg.sender?._id === user?.id
                                                        ? 'bg-gradient-primary text-white rounded-2xl rounded-br-md shadow-lg'
                                                        : isDark
                                                            ? 'bg-dark-200 text-white rounded-2xl rounded-bl-md border border-white/10'
                                                            : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-md border border-gray-100'
                                                        } px-4 py-3`}>
                                                        <p className="break-words leading-relaxed">{msg.message}</p>
                                                        <p className={`text-xs mt-2 ${msg.sender?._id === user?.id
                                                            ? 'text-white/70'
                                                            : isDark ? 'text-gray-500' : 'text-gray-400'
                                                            }`}>
                                                            {format(new Date(msg.createdAt), 'HH:mm')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Message input */}
                                    <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDark ? 'bg-dark-200 border-white/10' : 'bg-white border-gray-200'
                                        }`}>
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                placeholder={language === 'en' ? 'Type a message...' : 'Nhập tin nhắn...'}
                                                className={`flex-1 px-5 py-3 rounded-full outline-none transition-all ${isDark
                                                        ? 'bg-dark-300 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500'
                                                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:bg-white'
                                                    }`}
                                                disabled={sending}
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !newMessage.trim()}
                                                className="w-12 h-12 bg-gradient-primary text-white rounded-full flex items-center justify-center hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                                            >
                                                {sending ? (
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <FiSend className="w-5 h-5" />
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-dark-300' : 'bg-gray-50'
                                    }`}>
                                    <div className="text-center p-8">
                                        <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'
                                            }`}>
                                            <FiMessageCircle className={`w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                                        </div>
                                        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {language === 'en' ? 'Select a conversation' : 'Chọn cuộc trò chuyện'}
                                        </h3>
                                        <p className={`max-w-sm mx-auto ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                            {language === 'en'
                                                ? 'Choose a doctor or staff member from the list to start chatting'
                                                : 'Chọn bác sĩ hoặc nhân viên từ danh sách để bắt đầu trò chuyện'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
