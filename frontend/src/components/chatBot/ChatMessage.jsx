import React from 'react';
import ReactMarkdown from 'react-markdown';
import { FiUser } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';

const ChatMessage = ({ msg }) => {
    const { isDark } = useTheme();
    const { language } = useLanguage();
    
    const isBot = msg.sender === 'bot';

    return (
        <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in-up mb-4`}>
            {isBot && (
                <div className="flex-shrink-0 mr-3 mt-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                        <span className="text-sm font-bold">AI</span>
                    </div>
                </div>
            )}
            
            <div className={`max-w-[80%] ${
                isBot 
                    ? isDark 
                        ? 'bg-dark-200 text-white rounded-2xl rounded-bl-sm border border-white/10' 
                        : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm shadow-md border border-gray-100'
                    : 'bg-gradient-primary text-white rounded-2xl rounded-br-sm shadow-lg'
            } px-4 py-3`}>
                {isBot ? (
                    <div className={`prose prose-sm ${isDark ? 'prose-invert text-white' : 'text-gray-900'} max-w-none`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                ) : (
                    <p className="break-words leading-relaxed">{msg.text}</p>
                )}
            </div>

            {!isBot && (
                <div className="flex-shrink-0 ml-3 mt-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isDark ? 'bg-dark-200 border border-white/10' : 'bg-gray-200'}`}>
                        <FiUser className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatMessage;
