import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FiX, FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import ChatbotIcon from './ChatbotIcon';
import ChatMessage from './ChatMessage';
import ChatForm from './ChatForm';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';

const AI_ROLE_PROMPT = `You are a helpful and knowledgeable AI assistant for PetCare, a veterinary clinic and pet shop. 
Be polite, concise, and helpful. Use markdown to format your answers (bullet points, bold text). 
If asked about things outside your scope, gently redirect to pet care, veterinary services, or our shop.`;

const ChatBotWidget = () => {
    const { isDark } = useTheme();
    const { language } = useLanguage();
    
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [messages, setMessages] = useState([
        { id: 'welcome', text: language === 'en' ? 'Hello! I am PetCare AI. How can I help you today?' : 'Xin chào! Tôi là Trợ lý AI của PetCare. Tôi có thể giúp gì cho bạn hôm nay?', sender: 'bot' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Initialize Gemini AI
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey || 'DUMMY_KEY');
    
    // We can't actually pass system instruction easily in older Gemini versions without specific format, but we'll prepend it to the first user message or use it as context if using standard chat.
    // For simplicity, we just use generateContent or startChat.

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const generateBotResponse = async (userText) => {
        if (!apiKey) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: 'API Key is missing. Please configure VITE_GEMINI_API_KEY in your .env file.',
                sender: 'bot'
            }]);
            return;
        }

        try {
            const model = genAI.getGenerativeModel(
                { 
                    model: 'gemini-2.0-flash',
                    systemInstruction: AI_ROLE_PROMPT
                },
                { apiVersion: 'v1' }
            );

            // For a better experience, we can construct the history, but here we just do standard startChat
            const history = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    role: m.sender === 'bot' ? 'model' : 'user',
                    parts: [{ text: m.text }]
                }));

            const chat = model.startChat({
                history,
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            });

            const result = await chat.sendMessage(userText);
            const response = await result.response;
            const text = response.text();

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: text,
                sender: 'bot'
            }]);
        } catch (error) {
            console.error('Error generating AI response:', error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                text: language === 'en' ? 'Sorry, I encountered an error. Please try again later.' : 'Xin lỗi, tôi đã gặp lỗi. Vui lòng thử lại sau.',
                sender: 'bot'
            }]);
        }
    };

    const handleSendMessage = async (text) => {
        // Add user message
        const newUserMsg = { id: Date.now().toString(), text, sender: 'user' };
        setMessages(prev => [...prev, newUserMsg]);
        setIsLoading(true);

        // Fetch AI response
        await generateBotResponse(text);
        
        setIsLoading(false);
    };

    return (
        <>
            {/* The Floating Button */}
            <ChatbotIcon isOpen={isOpen} toggleChat={toggleChat} />

            {/* The Chat Window */}
            {isOpen && (
                <div 
                    className={`fixed right-6 bottom-24 z-50 flex flex-col overflow-hidden shadow-2xl transition-all duration-300 transform origin-bottom-right ${
                        isExpanded 
                            ? 'w-[400px] sm:w-[500px] h-[600px] md:h-[700px] rounded-2xl' 
                            : 'w-[350px] h-[500px] rounded-2xl'
                    } ${isDark ? 'bg-dark-200 border border-white/10' : 'bg-white border border-gray-200'}`}
                >
                    {/* Header */}
                    <div className="bg-gradient-primary p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shadow-inner">
                                <span className="text-xl font-bold">AI</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg leading-tight">PetCare AI</h3>
                                <p className="text-xs text-white/80 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                    {language === 'en' ? 'Always online' : 'Luôn trực tuyến'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
                            </button>
                            <button 
                                onClick={toggleChat}
                                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className={`flex-1 overflow-y-auto p-4 shrink-1 ${
                        isDark ? 'bg-dark-300/50' : 'bg-gray-50'
                    }`}>
                        {messages.map(msg => (
                            <ChatMessage key={msg.id} msg={msg} />
                        ))}
                        {isLoading && (
                            <div className="flex flex-col gap-2 items-start mb-4 animate-fade-in-up">
                                <div className="flex-shrink-0 ml-1">
                                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white">
                                        <span className="text-xs font-bold">AI</span>
                                    </div>
                                </div>
                                <div className={`px-4 py-3 rounded-2xl rounded-bl-sm ${
                                    isDark ? 'bg-dark-200 text-white' : 'bg-white text-gray-900 border border-gray-100'
                                }`}>
                                    <div className="flex gap-1.5 items-center h-6">
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <ChatForm onSendMessage={handleSendMessage} isLoading={isLoading} />
                </div>
            )}
        </>
    );
};

export default ChatBotWidget;
