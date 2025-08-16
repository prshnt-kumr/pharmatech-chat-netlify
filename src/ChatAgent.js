import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, FileText, FileSpreadsheet, Bot, User, Loader2 } from 'lucide-react';

const MedicalResearchGini = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m Gini, your AI-powered medical research assistant from Alpha Medical Research. Our mission is to advance healthcare through cutting-edge AI innovation, transforming medical research one discovery at a time. How can I assist you with your research today?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // N8n webhook URL - replace with your actual webhook URL
  const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://prshntkumrai.app.n8n.cloud/webhook/Chatbot';

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
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I\'m having trouble connecting to the server. Please check your connection and try again.',
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

  const downloadChatAsText = () => {
    const chatContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'User' : 'Medical Research Gini';
        return `[${timestamp}] ${sender}: ${msg.content}`;
      })
      .join('\n\n');

    const content = `Alpha Medical Research - Medical Research Gini
Chat Conversation Export
Generated on: ${new Date().toLocaleString()}
Total Messages: ${messages.length}

${'='.repeat(50)}

${chatContent}

${'='.repeat(50)}
End of Conversation
© Alpha Medical Research`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `alpha-medical-research-gini-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadChatAsWord = () => {
    const chatContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'User' : 'Medical Research Gini';
        return `[${timestamp}] ${sender}: ${msg.content}`;
      })
      .join('\n\n');

    const content = `Alpha Medical Research - Medical Research Gini
Chat Conversation Export
Generated on: ${new Date().toLocaleString()}
Total Messages: ${messages.length}

${'='.repeat(50)}

${chatContent}

${'='.repeat(50)}
End of Conversation
© Alpha Medical Research`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'application/msword' });
    element.href = URL.createObjectURL(file);
    element.download = `alpha-medical-research-gini-${Date.now()}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadChatAsCSV = () => {
    const csvHeader = '"Timestamp","Sender","Message"\n';
    const csvContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'User' : 'Medical Research Gini';
        const content = msg.content.replace(/"/g, '""');
        return `"${timestamp}","${sender}","${content}"`;
      })
      .join('\n');

    const fullCsvContent = csvHeader + csvContent;
    
    const element = document.createElement('a');
    const file = new Blob([fullCsvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `alpha-medical-research-gini-${Date.now()}.csv`;
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
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          {/* Logo - Bigger, more stylish and crisp */}
          <svg width="64" height="64" viewBox="0 0 120 120" className="w-16 h-16">
            {/* Outer gradient ring */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#1e40af" />
                <stop offset="100%" stopColor="#1e3a8a" />
              </linearGradient>
              <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f8fafc" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#1e40af" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* Main background circle with gradient */}
            <circle cx="60" cy="60" r="56" fill="url(#logoGradient)" filter="url(#shadow)" />
            <circle cx="60" cy="60" r="50" fill="white" />
            
            {/* Medical Cross - more prominent */}
            <rect x="50" y="20" width="20" height="80" fill="url(#crossGradient)" rx="3" stroke="#1e40af" strokeWidth="1" />
            <rect x="20" y="50" width="80" height="20" fill="url(#crossGradient)" rx="3" stroke="#1e40af" strokeWidth="1" />
            
            {/* DNA Double Helix - more detailed */}
            <g stroke="#10b981" strokeWidth="3" fill="none" opacity="0.8">
              {/* Left strand */}
              <path d="M25 25 Q35 35 45 25 T65 25 M25 45 Q35 55 45 45 T65 45 M25 65 Q35 75 45 65 T65 65" strokeLinecap="round" />
              {/* Right strand */}
              <path d="M55 75 Q65 85 75 75 T95 75 M55 95 Q65 105 75 95 T95 95" strokeLinecap="round" />
              {/* Connecting bonds - more detailed */}
              <line x1="30" y1="30" x2="40" y2="40" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="50" y1="40" x2="60" y2="30" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="60" y1="80" x2="70" y2="90" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
              <line x1="80" y1="90" x2="90" y2="80" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
            </g>
            
            {/* Research Molecules - more stylish */}
            <circle cx="30" cy="90" r="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
            <circle cx="90" cy="30" r="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
            <circle cx="95" cy="45" r="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <circle cx="25" cy="105" r="3" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <circle cx="40" cy="85" r="2.5" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="80" cy="35" r="2.5" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1" />
            
            {/* Molecular bonds - enhanced */}
            <line x1="30" y1="90" x2="25" y2="105" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="90" y1="30" x2="95" y2="45" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
            <line x1="40" y1="85" x2="30" y2="90" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            <line x1="80" y1="35" x2="90" y2="30" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
            
            {/* Company Initials - more prominent */}
            <text x="60" y="65" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#1e40af">A</text>
            <text x="60" y="78" fontFamily="Arial, sans-serif" fontSize="8" fontWeight="bold" textAnchor="middle" fill="#1e40af" opacity="0.8">MR</text>
            
            {/* Subtle glow effect */}
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
          </svg>
          <div>
            <h1 className="text-xl font-bold text-white">Medical Research Gini</h1>
            <p className="text-sm text-blue-100">Alpha Medical Research • Advancing Healthcare Through AI Innovation</p>
            <p className="text-xs text-blue-200 mt-1">"Transforming Medical Research, One Discovery at a Time"</p>
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
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.type === 'user' 
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
                <div className={`px-4 py-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
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
                    <span className="text-gray-600">Analyzing your research query...</span>
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
        {/* Download Section */}
        {messages.length > 1 && (
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Download className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Download Research Session</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={downloadChatAsText}
                  className="flex items-center space-x-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm transition-colors border border-red-200"
                >
                  <FileText className="w-3 h-3" />
                  <span>Text</span>
                </button>
                <button
                  onClick={downloadChatAsWord}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors border border-blue-200"
                >
                  <FileText className="w-3 h-3" />
                  <span>Word</span>
                </button>
                <button
                  onClick={downloadChatAsCSV}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm transition-colors border border-green-200"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Input */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about medical research, studies, protocols, or any research-related queries..."
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
          <span>🔬 Connected to Alpha Medical Research Systems</span>
        </div>
      </div>
    </div>
  );
};

export default MedicalResearchGini;