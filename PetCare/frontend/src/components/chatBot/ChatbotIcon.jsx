import React from 'react';
import { FiMessageSquare, FiX } from 'react-icons/fi';

const ChatbotIcon = ({ isOpen, toggleChat }) => {
    return (
        <button
            onClick={toggleChat}
            className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 z-50 transform hover:scale-110 active:scale-95 ${
                isOpen ? 'bg-red-500 rotate-90' : 'bg-gradient-primary rotate-0 hover:shadow-glow'
            }`}
            aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
        >
            {isOpen ? (
                <FiX className="w-6 h-6 text-white transition-opacity duration-300" />
            ) : (
                <FiMessageSquare className="w-6 h-6 text-white transition-opacity duration-300" />
            )}
            
            {!isOpen && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-500 border-2 border-white"></span>
                </span>
            )}
        </button>
    );
};

export default ChatbotIcon;
