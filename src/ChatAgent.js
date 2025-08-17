import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, FileText, FileSpreadsheet, User, Loader2 } from 'lucide-react';

const MedicalResearchGini = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m Dr. Gini, your AI-powered drug discovery specialist from PharmaTech Innovations. I specialize in early-stage drug discovery, from target identification to lead optimization. How can I assist you with your drug discovery research today?',
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

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON format');
      }

      const data = await response.json();
      
      // Handle different response formats
      let responseText = '';
      if (data.response) {
        responseText = data.response;
      } else if (data.message) {
        responseText = data.message;
      } else if (data.text) {
        responseText = data.text;
      } else if (typeof data === 'string') {
        responseText = data;
      } else {
        responseText = 'I received your message successfully.';
      }

      // Truncate if too long (frontend safety)
      if (responseText.length > 8000) {
        responseText = responseText.substring(0, 8000) + '\n\n[Response truncated for display]';
      }
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: responseText,
        timestamp: new Date(),
        truncated: data.truncated || false
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Sorry, I\'m having trouble processing your request. ';
      
      if (error.message.includes('JSON')) {
        errorMessage += 'There was a formatting issue with the response. Please try a shorter query.';
      } else if (error.message.includes('timeout')) {
        errorMessage += 'The request timed out. Please try breaking your query into smaller parts.';
      } else {
        errorMessage += 'Please check your connection and try again.';
      }

      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
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
        const sender = msg.type === 'user' ? 'Researcher' : 'Dr. Gini (Drug Discovery Specialist)';
        return `[${timestamp}] ${sender}: ${msg.content}`;
      })
      .join('\n\n');

    const content = `PharmaTech Innovations - DrugDiscovery AI
Drug Discovery Research Session Export
Generated on: ${new Date().toLocaleString()}
Total Messages: ${messages.length}

${'='.repeat(50)}

${chatContent}

${'='.repeat(50)}
End of Drug Discovery Session
© PharmaTech Innovations`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `pharmatech-drugdiscovery-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadChatAsWord = () => {
    const chatContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'Researcher' : 'Dr. Gini (Drug Discovery Specialist)';
        return `[${timestamp}] ${sender}: ${msg.content}`;
      })
      .join('\n\n');

    const content = `PharmaTech Innovations - DrugDiscovery AI
Drug Discovery Research Session Export
Generated on: ${new Date().toLocaleString()}
Total Messages: ${messages.length}

${'='.repeat(50)}

${chatContent}

${'='.repeat(50)}
End of Drug Discovery Session
© PharmaTech Innovations`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'application/msword' });
    element.href = URL.createObjectURL(file);
    element.download = `pharmatech-drugdiscovery-${Date.now()}.doc`;
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
        const sender = msg.type === 'user' ? 'Researcher' : 'Dr. Gini (Drug Discovery Specialist)';
        const content = msg.content.replace(/"/g, '""');
        return `"${timestamp}","${sender}","${content}"`;
      })
      .join('\n');

    const fullCsvContent = csvHeader + csvContent;
    
    const element = document.createElement('a');
    const file = new Blob([fullCsvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `pharmatech-drugdiscovery-${Date.now()}.csv`;
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
          {/* Logo - Drug Discovery focused design */}
          <svg width="64" height="64" viewBox="0 0 120 120" className="w-16 h-16">
            {/* Outer gradient ring */}
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="50%" stopColor="#5b21b6" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
              <linearGradient id="moleculeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodColor="#5b21b6" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* Main background circle with gradient */}
            <circle cx="60" cy="60" r="56" fill="url(#logoGradient)" filter="url(#shadow)" />
            <circle cx="60" cy="60" r="50" fill="white" />
            
            {/* Central drug molecule structure */}
            <g stroke="#5b21b6" strokeWidth="2" fill="none">
              {/* Benzene ring */}
              <polygon points="60,30 75,40 75,60 60,70 45,60 45,40" stroke="#5b21b6" strokeWidth="2" fill="none" />
              {/* Side chains */}
              <line x1="75" y1="40" x2="90" y2="35" strokeLinecap="round" />
              <line x1="75" y1="60" x2="90" y2="65" strokeLinecap="round" />
              <line x1="45" y1="40" x2="30" y2="35" strokeLinecap="round" />
              <line x1="45" y1="60" x2="30" y2="65" strokeLinecap="round" />
            </g>
            
            {/* Drug compound atoms */}
            <circle cx="60" cy="30" r="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
            <circle cx="75" cy="40" r="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
            <circle cx="75" cy="60" r="3" fill="#10b981" stroke="#059669" strokeWidth="1" />
            <circle cx="60" cy="70" r="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
            <circle cx="45" cy="60" r="3" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1" />
            <circle cx="45" cy="40" r="3" fill="#ec4899" stroke="#db2777" strokeWidth="1" />
            
            {/* Terminal functional groups */}
            <circle cx="90" cy="35" r="2.5" fill="#06b6d4" stroke="#0891b2" strokeWidth="1" />
            <circle cx="90" cy="65" r="2.5" fill="#84cc16" stroke="#65a30d" strokeWidth="1" />
            <circle cx="30" cy="35" r="2.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
            <circle cx="30" cy="65" r="2.5" fill="#6366f1" stroke="#4f46e5" strokeWidth="1" />
            
            {/* Activity indicator */}
            <g stroke="url(#moleculeGradient)" strokeWidth="1.5" fill="none" opacity="0.6">
              <circle cx="60" cy="60" r="25" strokeDasharray="3,3">
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 60 60"
                  to="360 60 60"
                  dur="8s"
                  repeatCount="indefinite"/>
              </circle>
            </g>
            
            {/* Company Initials */}
            <text x="60" y="95" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#5b21b6">PT</text>
            <text x="60" y="108" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#5b21b6" opacity="0.8">INNOVATIONS</text>
            
            {/* Subtle glow effect */}
            <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(123, 58, 237, 0.3)" strokeWidth="2" />
          </svg>
          <div>
            <h1 className="text-xl font-bold text-white">DrugDiscovery AI</h1>
            <p className="text-sm text-blue-100">PharmaTech Innovations • Accelerating Early-Stage Drug Discovery</p>
            <p className="text-xs text-blue-200 mt-1">"From Molecules to Medicine: AI-Powered Discovery Pipeline"</p>
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
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-md' 
                  : message.isError 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-md' 
                    : 'bg-gradient-to-br from-green-600 to-emerald-700 shadow-md border-2 border-white'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4">
                      {/* Medical stethoscope icon */}
                      <path d="M19 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" fill="#1e40af"/>
                      <path d="M16 4.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5V11c0 2.76-2.24 5-5 5s-5-2.24-5-5V4.5c0-.28-.22-.5-.5-.5S4 4.22 4 4.5V11c0 3.31 2.69 6 6 6s6-2.69 6-6V4.5z" fill="#1e40af"/>
                      <circle cx="7" cy="4" r="2" fill="#10b981"/>
                      <circle cx="13" cy="4" r="2" fill="#10b981"/>
                    </svg>
                  </div>
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
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-emerald-700 shadow-md border-2 border-white flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4">
                    <path d="M19 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" fill="#1e40af"/>
                    <path d="M16 4.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5V11c0 2.76-2.24 5-5 5s-5-2.24-5-5V4.5c0-.28-.22-.5-.5-.5S4 4.22 4 4.5V11c0 3.31 2.69 6 6 6s6-2.69 6-6V4.5z" fill="#1e40af"/>
                    <circle cx="7" cy="4" r="2" fill="#10b981"/>
                    <circle cx="13" cy="4" r="2" fill="#10b981"/>
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-gray-600">Dr. Gini is analyzing your research query...</span>
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
                <span className="text-sm font-medium text-gray-700">Download Discovery Session</span>
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
              placeholder="Ask me about drug targets, compound optimization, ADMET properties, clinical trials, or any drug discovery questions..."
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
          <span>🧬 Connected to PharmaTech Discovery Systems</span>
        </div>
      </div>
    </div>
  );
};

export default MedicalResearchGini;