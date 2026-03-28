import React, { useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';

const ChatForm = ({ onSendMessage, isLoading }) => {
    const [message, setMessage] = useState('');
    const { isDark } = useTheme();
    const { language } = useLanguage();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;
        
        onSendMessage(message);
        setMessage('');
    };

    return (
        <form onSubmit={handleSubmit} className={`p-4 border-t ${isDark ? 'bg-dark-200 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex gap-3 items-center">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={language === 'en' ? 'Ask AI anything...' : 'Hỏi AI bất kỳ điều gì...'}
                    className={`flex-1 px-5 py-3 rounded-full outline-none transition-all ${isDark
                        ? 'bg-dark-300 border border-white/10 text-white placeholder-gray-500 focus:border-primary-500'
                        : 'bg-gray-100 border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-primary-500 focus:bg-white'
                    }`}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !message.trim()}
                    className="w-12 h-12 bg-gradient-primary text-white rounded-full flex items-center justify-center hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex-shrink-0"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <FiSend className="w-5 h-5" />
                    )}
                </button>
            </div>
        </form>
    );
};

export default ChatForm;
