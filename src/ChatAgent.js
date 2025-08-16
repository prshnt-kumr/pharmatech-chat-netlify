import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, FileText, FileSpreadsheet, Bot, User, Loader2 } from 'lucide-react';

const ChatAgent = () => {
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Hello! I\'m your AI assistant powered by N8n. How can I help you today?',
            timestamp: new Date(),
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // N8n webhook URL from environment variable
    const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/chat';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        const currentMessage = inputMessage;
        setInputMessage('');
        setIsLoading(true);

        try {
            const response = await fetch(N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: currentMessage,
                    userId: `user-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const botMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: data.response || data.message || data.text || 'I received your message successfully.',
                timestamp: new Date(),
                downloadData: {
                    userQuery: currentMessage,
                    aiResponse: data.response || data.message || data.text || '',
                    timestamp: new Date().toISOString(),
                    additionalData: data.additionalData || null
                }
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage = {
                id: Date.now() + 1,
                type: 'bot',
                content: 'Sorry, I\'m having trouble connecting to the server. Please check your N8n webhook URL and try again.',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const downloadAsPDF = (message) => {
        const content = `
Query: ${message.downloadData.userQuery}

Response: ${message.downloadData.aiResponse}

Generated on: ${new Date(message.downloadData.timestamp).toLocaleString()}
    `.trim();

        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `chat-response-${Date.now()}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadAsWord = (message) => {
        const content = `
Query: ${message.downloadData.userQuery}

Response: ${message.downloadData.aiResponse}

Generated on: ${new Date(message.downloadData.timestamp).toLocaleString()}
    `.trim();

        const element = document.createElement('a');
        const file = new Blob([content], { type: 'application/msword' });
        element.href = URL.createObjectURL(file);
        element.download = `chat-response-${Date.now()}.doc`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadAsCSV = (message) => {
        const csvContent = `"Field","Content"\n"User Query","${message.downloadData.userQuery.replace(/"/g, '""')}"\n"AI Response","${message.downloadData.aiResponse.replace(/"/g, '""')}"\n"Timestamp","${message.downloadData.timestamp}"`;

        const element = document.createElement('a');
        const file = new Blob([csvContent], { type: 'text/csv' });
        element.href = URL.createObjectURL(file);
        element.download = `chat-response-${Date.now()}.csv`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const formatTime = (date) => {
        return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b px-6 py-4">
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800">N8n AI Assistant</h1>
                        <p className="text-sm text-gray-500">Powered by your N8n workflow</p>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex space-x-3 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'user'
                                    ? 'bg-blue-600'
                                    : message.isError
                                        ? 'bg-red-500'
                                        : 'bg-green-600'
                                }`}>
                                {message.type === 'user' ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-white" />
                                )}
                            </div>

                            {/* Message Content */}
                            <div className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-3 rounded-lg ${message.type === 'user'
                                        ? 'bg-blue-600 text-white'
                                        : message.isError
                                            ? 'bg-red-50 text-red-800 border border-red-200'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                    }`}>
                                    <p className="whitespace-pre-wrap">{message.content}</p>

                                    {/* Download buttons for bot messages */}
                                    {message.type === 'bot' && message.downloadData && !message.isError && (
                                        <div className="mt-3 flex space-x-2 border-t border-gray-100 pt-3">
                                            <button
                                                onClick={() => downloadAsPDF(message)}
                                                className="flex items-center space-x-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
                                            >
                                                <FileText className="w-3 h-3" />
                                                <span>PDF</span>
                                            </button>
                                            <button
                                                onClick={() => downloadAsWord(message)}
                                                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
                                            >
                                                <FileText className="w-3 h-3" />
                                                <span>Word</span>
                                            </button>
                                            <button
                                                onClick={() => downloadAsCSV(message)}
                                                className="flex items-center space-x-1 px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm transition-colors"
                                            >
                                                <FileSpreadsheet className="w-3 h-3" />
                                                <span>CSV</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs text-gray-400 mt-1">
                                    {formatTime(message.timestamp)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex space-x-3 max-w-3xl">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="px-4 py-3 rounded-lg bg-white border border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                        <span className="text-gray-600">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white border-t px-6 py-4">
                <div className="flex space-x-4">
                    <div className="flex-1 relative">
                        <textarea
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message here..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="1"
                            style={{ minHeight: '50px', maxHeight: '120px' }}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isLoading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        <span>Send</span>
                    </button>
                </div>

                {/* Connection Status */}
                <div className="mt-2 text-xs text-gray-500 text-center">
                    {N8N_WEBHOOK_URL.includes('your-n8n-instance') ? (
                        <span className="text-amber-600">⚠️ Please configure your N8n webhook URL</span>
                    ) : (
                        <span>✅ Connected to N8n</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatAgent;