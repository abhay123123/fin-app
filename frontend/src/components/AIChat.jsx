import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { chatWithAnalyst } from '../api';

const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm your AI Financial Analyst. Ask me about your spending, like 'How much did I spend on Food?' or 'Total spent?'" }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const data = await chatWithAnalyst(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', text: data.response }]);
        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I encountered an error analyzing your data." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-opacity ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
                <MessageSquare className="h-6 w-6" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.9 }}
                        className="fixed bottom-6 right-6 w-96 h-[500px] glass rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-white/20 dark:border-gray-700/30"
                    >
                        {/* Header */}
                        <div className="p-4 bg-indigo-600/90 backdrop-blur-md flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">FinTrack AI</h3>
                                    <p className="text-xs text-indigo-100">Financial Analyst</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900' : 'bg-emerald-100 dark:bg-emerald-900'}`}>
                                        {msg.role === 'user' ? <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> : <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm max-w-[80%] ${msg.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-none'
                                        }`}>
                                        {msg.text.split('\n').map((line, i) => (
                                            <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                        <Bot className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 dark:border-gray-700">
                                        <div className="flex gap-1.5">
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                className="w-2 h-2 bg-gray-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                className="w-2 h-2 bg-gray-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                className="w-2 h-2 bg-gray-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about your spending..."
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all dark:text-white placeholder-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="absolute right-2 top-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIChat;
