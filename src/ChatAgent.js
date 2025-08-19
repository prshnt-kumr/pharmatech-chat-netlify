import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, FileText, FileSpreadsheet, User, Loader2, ThumbsUp, ThumbsDown, MessageSquare, X, Star } from 'lucide-react';

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
  const [feedbackModal, setFeedbackModal] = useState({ open: false, messageId: null, messageContent: '' });
  const [userFeedback, setUserFeedback] = useState({});
  const messagesEndRef = useRef(null);

  // Function to handle quick feedback (thumbs up/down)
  const handleQuickFeedback = async (messageId, rating) => {
    try {
      const feedback = {
        messageId: messageId,
        thumbsRating: rating, // 'up' or 'down'
        feedbackType: 'quick',
        timestamp: new Date().toISOString(),
        userId: `user-${Date.now()}` // You can make this more sophisticated
      // Xata configuration for ZAPAL01GRP01 database
  const XATA_CONFIG = {
    baseURL: 'https://Prashant-Kumar-s-workspace-9seqfg.us-east-1.xata.sh/db/ZAPAL01GRP01:main',
    apiKey: process.env.REACT_APP_XATA_API_KEY || 'YOUR_XATA_API_KEY_HERE', // Add your Xata API key
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_XATA_API_KEY || 'YOUR_XATA_API_KEY_HERE'}`,
      'Content-Type': 'application/json'
    }
  // Function to generate unique session ID
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Function to generate unique message ID  
  const generateMessageId = (type) => {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  };

  // Get or create session ID
  const getSessionId = () => {
    let sessionId = localStorage.getItem('dr_gini_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem('dr_gini_session_id', sessionId);
    }
    return sessionId;
  };

  // Test Xata connection function
  const testXataConnection = async () => {
    try {
      const response = await fetch(`${XATA_CONFIG.baseURL}/tables/messages/query`, {
        method: 'POST',
        headers: XATA_CONFIG.headers,
        body: JSON.stringify({
          page: { size: 1 }
        })
      });
      
      if (response.ok) {
        console.log('✅ Xata connection successful!');
        return true;
      } else {
        console.error('❌ Xata connection failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Xata connection error:', error);
      return false;
    }
  };

  // n8n webhook URL - we'll create this next
  const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://prshntkumrai.app.n8n.cloud/webhook/Chatbot';

      // Send feedback to n8n webhook
      await fetch(`${N8N_WEBHOOK_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      // Update local state to show feedback was given
      setUserFeedback(prev => ({
        ...prev,
        [messageId]: { ...prev[messageId], thumbs: rating }
      }));

    } catch (error) {
      console.error('Error sending quick feedback:', error);
    }
  };

  // Function to open detailed feedback modal
  const openDetailedFeedback = (messageId, messageContent) => {
    setFeedbackModal({
      open: true,
      messageId: messageId,
      messageContent: messageContent
    });
  };

  // Function to submit detailed feedback
  const submitDetailedFeedback = async (feedbackData) => {
    try {
      const feedback = {
        messageId: feedbackModal.messageId,
        ...feedbackData,
        feedbackType: 'detailed',
        timestamp: new Date().toISOString(),
        userId: `user-${Date.now()}`
      };

      // Send to n8n webhook
      await fetch(`${N8N_WEBHOOK_URL}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      // Update local state
      setUserFeedback(prev => ({
        ...prev,
        [feedbackModal.messageId]: { 
          ...prev[feedbackModal.messageId], 
          detailed: true,
          rating: feedbackData.rating 
        }
      }));

      // Close modal
      setFeedbackModal({ open: false, messageId: null, messageContent: '' });

    } catch (error) {
      console.error('Error sending detailed feedback:', error);
    }
  };

  // Add CSS styles for research content
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .research-content h2 {
        color: #1e40af;
        font-size: 18px;
        font-weight: bold;
        margin: 16px 0 12px 0;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 6px;
      }
      .research-content h3 {
        color: #059669;
        font-size: 16px;
        font-weight: bold;
        margin: 14px 0 8px 0;
      }
      .research-content p {
        margin: 8px 0;
        line-height: 1.6;
      }
      .research-content strong {
        color: #374151;
        font-weight: 600;
      }
      .research-content ul {
        margin: 8px 0;
        padding-left: 20px;
      }
      .research-content li {
        margin: 6px 0;
        line-height: 1.5;
      }
      .research-content ul li::marker {
        color: #059669;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to clean and format HTML content
  const formatHTMLContent = (htmlString) => {
    // Basic HTML sanitization for safety
    const allowedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'div', 'span'];
    
    // Remove script tags and other potentially dangerous content
    let cleaned = htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');

    return cleaned;
  };

  // Function to detect if content is HTML
  const isHTMLContent = (content) => {
    return /<[a-z][\s\S]*>/i.test(content);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const sessionId = getSessionId();
    const userId = `user_${Date.now()}`; // You can make this more sophisticated
    const messageId = generateMessageId('user');

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      messageId: messageId
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Prepare message data for n8n/Xata
      const messageData = {
        message: currentMessage,
        sessionId: sessionId,
        userId: userId,
        messageId: messageId,
        timestamp: new Date().toISOString()
      };

      // Send to n8n webhook (which will handle Xata storage and AI response)
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
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

      // Note: Removed truncation to allow full research responses
      // If performance becomes an issue, consider pagination or collapsible sections
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: responseText,
        timestamp: new Date(),
        truncated: data.truncated || false,
        isHTML: isHTMLContent(responseText),
        messageId: data.messageId || generateMessageId('gini') // Get messageId from n8n response
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

  // Function to convert HTML to plain text for downloads
  const htmlToPlainText = (html) => {
    if (!isHTMLContent(html)) return html;
    
    return html
      .replace(/<h[1-6][^>]*>/g, '\n\n')
      .replace(/<\/h[1-6]>/g, '\n')
      .replace(/<p[^>]*>/g, '\n')
      .replace(/<\/p>/g, '\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<li[^>]*>/g, '\n• ')
      .replace(/<\/li>/g, '')
      .replace(/<ul[^>]*>|<\/ul>/g, '\n')
      .replace(/<ol[^>]*>|<\/ol>/g, '\n')
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '$1')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '$1')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  };

  const downloadChatAsText = () => {
    const chatContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'Researcher' : 'Dr. Gini (Drug Discovery Specialist)';
        const content = htmlToPlainText(msg.content);
        return `[${timestamp}] ${sender}: ${content}`;
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
        const content = htmlToPlainText(msg.content);
        return `[${timestamp}] ${sender}: ${content}`;
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
        const content = htmlToPlainText(msg.content).replace(/"/g, '""');
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
                  {/* CRITICAL CHANGE: Render HTML content properly with better styling */}
                  {message.isHTML && message.type === 'bot' ? (
                    <div 
                      className="research-content"
                      dangerouslySetInnerHTML={{ 
                        __html: formatHTMLContent(message.content) 
                      }}
                      style={{
                        lineHeight: '1.7',
                        fontSize: '14px',
                        color: '#374151',
                      }}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>

                {/* Feedback Section - Only for Dr. Gini responses */}
                {message.type === 'bot' && !message.isError && message.messageId && (
                  <div className="flex items-center space-x-2 mt-2">
                    {/* Quick Feedback Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleQuickFeedback(message.messageId, 'up')}
                        className={`p-1 rounded transition-colors ${
                          userFeedback[message.messageId]?.thumbs === 'up'
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        title="Helpful response"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleQuickFeedback(message.messageId, 'down')}
                        className={`p-1 rounded transition-colors ${
                          userFeedback[message.messageId]?.thumbs === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-gray-100 text-gray-500'
                        }`}
                        title="Not helpful"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Detailed Feedback Button */}
                    <button
                      onClick={() => openDetailedFeedback(message.messageId, message.content)}
                      className={`flex items-center space-x-1 px-2 py-1 text-xs rounded transition-colors ${
                        userFeedback[message.messageId]?.detailed
                          ? 'bg-blue-100 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-500'
                      }`}
                      title="Provide detailed feedback"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Feedback</span>
                    </button>
                  </div>
                )}

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
          <br />
          <span className="text-xs text-gray-400">
            Session: {getSessionId().split('_')[1]} | Xata DB: ZAPAL01GRP01
          </span>
        </div>
      </div>

      {/* Detailed Feedback Modal */}
      {feedbackModal.open && (
        <DetailedFeedbackModal
          isOpen={feedbackModal.open}
          messageContent={feedbackModal.messageContent}
          onClose={() => setFeedbackModal({ open: false, messageId: null, messageContent: '' })}
          onSubmit={submitDetailedFeedback}
        />
      )}
    </div>
  );
};

// Detailed Feedback Modal Component
const DetailedFeedbackModal = ({ isOpen, messageContent, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState({
    rating: 0,
    accuracyRating: 0,
    helpfulnessRating: 0,
    comment: '',
    improvementSuggestions: '',
    userExpertise: 'intermediate'
  });

  const handleStarClick = (field, rating) => {
    setFeedback(prev => ({ ...prev, [field]: rating }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(feedback);
    // Reset form
    setFeedback({
      rating: 0,
      accuracyRating: 0, 
      helpfulnessRating: 0,
      comment: '',
      improvementSuggestions: '',
      userExpertise: 'intermediate'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Provide Detailed Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Message Preview */}
          <div className="bg-gray-50 p-3 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-2">Dr. Gini's Response:</p>
            <div 
              className="text-sm max-h-32 overflow-y-auto"
              dangerouslySetInnerHTML={{ 
                __html: messageContent.length > 200 
                  ? messageContent.substring(0, 200) + '...' 
                  : messageContent 
              }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick('rating', star)}
                    className={`p-1 ${
                      star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Accuracy Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Accuracy
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick('accuracyRating', star)}
                    className={`p-1 ${
                      star <= feedback.accuracyRating ? 'text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* Helpfulness Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Helpfulness
              </label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick('helpfulnessRating', star)}
                    className={`p-1 ${
                      star <= feedback.helpfulnessRating ? 'text-green-400' : 'text-gray-300'
                    }`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {/* User Expertise */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Research Background
              </label>
              <select
                value={feedback.userExpertise}
                onChange={(e) => setFeedback(prev => ({ ...prev, userExpertise: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="beginner">Beginner Researcher</option>
                <option value="intermediate">Intermediate Researcher</option>
                <option value="advanced">Advanced Researcher</option>
                <option value="expert">Expert/Principal Investigator</option>
              </select>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="What did you think about this response? Was it helpful for your research?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Improvement Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for Improvement
              </label>
              <textarea
                value={feedback.improvementSuggestions}
                onChange={(e) => setFeedback(prev => ({ ...prev, improvementSuggestions: e.target.value }))}
                placeholder="How could Dr. Gini improve this type of response? What information was missing?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Feedback
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
};

export default MedicalResearchGini;