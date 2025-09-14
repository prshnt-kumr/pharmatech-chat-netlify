import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, FileText, FileSpreadsheet, User, Loader2, ThumbsUp, ThumbsDown, MessageSquare, X, Star, Clock, Image, Beaker, Atom } from 'lucide-react';

const MedicalResearchGini = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m Dr. Gini, your AI-powered drug discovery specialist from PharmaTech Innovations. I specialize in early-stage drug discovery, from target identification to lead optimization. I can show you molecular structures, 2D/3D visualizations, and research data. How can I assist you with your drug discovery research today?',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState({ open: false, messageId: null, messageContent: '' });
  const [userFeedback, setUserFeedback] = useState({});
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState(0);
  const messagesEndRef = useRef(null);

  // Configuration
  const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL || 'https://prshntkumrai.app.n8n.cloud/webhook/Chatbot';
  const FEEDBACK_WEBHOOK_URL = 'https://prshntkumrai.app.n8n.cloud/webhook/webhook/Chatbot/feedback';
  const REQUEST_COOLDOWN = 180000; // 3 minutes

  // Utility Functions
  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateMessageId = (type) => `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  // Enhanced image detection logic
  const detectImageRequirement = (message) => {
    const imageKeywords = [
      'structure', 'molecular structure', 'chemical structure', 'show structure',
      'visualize', 'visualization', 'diagram', 'image', 'picture',
      '2d', '3d', 'three dimensional', 'two dimensional', 'render',
      'molecule', 'compound', 'formula', 'bond', 'conformation',
      'show me', 'display', 'draw', 'generate image', 'create visualization'
    ];
    
    const molecularCompounds = [
      'chromene', 'benzene', 'caffeine', 'aspirin', 'penicillin', 
      'dopamine', 'serotonin', 'acetaminophen', 'ibuprofen'
    ];
    
    const lowerMessage = message.toLowerCase();
    const hasImageKeyword = imageKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasMolecularCompound = molecularCompounds.some(compound => lowerMessage.includes(compound));
    
    return {
      needsImage: hasImageKeyword || (hasMolecularCompound && (hasImageKeyword || lowerMessage.includes('structure'))),
      imageType: lowerMessage.includes('3d') ? '3d' : '2d',
      compound: extractCompoundName(message),
      confidence: hasImageKeyword ? 'high' : hasMolecularCompound ? 'medium' : 'low'
    };
  };

  const extractCompoundName = (message) => {
    const compounds = ['chromene', 'benzene', 'caffeine', 'aspirin', 'penicillin', 'dopamine', 'serotonin'];
    const found = compounds.find(compound => message.toLowerCase().includes(compound));
    const formulaMatch = message.match(/([A-Z][a-z]?\d*)+/g);
    return found || (formulaMatch && formulaMatch[0]) || 'unknown';
  };

  // Enhanced text cleaning function
  const cleanSpecialCharacters = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/#{1,6}\s+(.*?)(?:\n|$)/g, '<h3>$1</h3>')
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      .replace(/^\s*\d+\.\s+/gm, (match, offset, string) => {
        const lineStart = string.lastIndexOf('\n', offset) + 1;
        const lineNum = string.substring(0, offset).split('\n').length;
        return `${lineNum}. `;
      })
      .replace(/\\n/g, '<br>')
      .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{3,}/g, ' ')
      .replace(/^\s+|\s+$/gm, '')
      .replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>')
      .replace(/\^(\d+)/g, '<sup>$1</sup>')
      .trim();
  };

  // Enhanced HTML sanitization that preserves base64 images
  const formatHTMLContent = (htmlString) => {
    if (!htmlString) return '';
    
    return htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/src="data:image\/([^;]+);base64,([^"]+)"/gi, (match, format, data) => {
        try {
          if (data && /^[A-Za-z0-9+/]*={0,2}$/.test(data.replace(/\s/g, ''))) {
            return `src="data:image/${format};base64,${data.replace(/\s/g, '')}"`;
          }
        } catch (e) {
          console.warn('Invalid base64 image data:', e);
        }
        return 'src=""';
      });
  };

  // Debug function for image display
  const debugImageDisplay = (htmlContent) => {
    console.log('=== IMAGE DEBUG ===');
    console.log('HTML length:', htmlContent.length);
    console.log('Contains img tag:', htmlContent.includes('<img'));
    console.log('Contains data:image:', htmlContent.includes('data:image/'));
    
    const imgRegex = /<img[^>]*src="data:image\/([^;]+);base64,([^"]*)"[^>]*>/gi;
    let match;
    let imageCount = 0;
    
    while ((match = imgRegex.exec(htmlContent)) !== null) {
      imageCount++;
      const [, format, base64Data] = match;
      
      console.log(`Image ${imageCount}:`);
      console.log('  Format:', format);
      console.log('  Base64 length:', base64Data.length);
      console.log('  Base64 preview:', base64Data.substring(0, 50) + '...');
      
      try {
        const isValidBase64 = /^[A-Za-z0-9+/]*={0,2}$/.test(base64Data.replace(/\s/g, ''));
        console.log('  Valid base64:', isValidBase64);
      } catch (e) {
        console.error(`  Image ${imageCount} validation error:`, e);
      }
    }
    
    console.log('Total images found:', imageCount);
    console.log('=== END DEBUG ===');
  };

  // Enhanced response processor
  const processResponse = async (response, originalMessage = '') => {
    console.log('Processing response - Status:', response.status);
    
    const contentType = response.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    try {
      const rawText = await response.text();
      console.log('Raw response length:', rawText.length);
      console.log('Raw response preview:', rawText.substring(0, 200));

      let finalHtml = '';

      // Check if response is direct HTML (like your N8n webhook returns)
      if (rawText.includes('<div class="molecular-structure-display"') || 
          rawText.includes('<img') || 
          rawText.includes('<p><strong>')) {
        console.log('Processing direct HTML format from N8n');
        finalHtml = rawText;
      }
      else if (rawText.includes('<iframe') && rawText.includes('srcdoc=')) {
        console.log('Processing iframe wrapped HTML');
        
        let iframeMatch = rawText.match(/<iframe[^>]*srcdoc="([^"]*(?:\\"[^"]*)*)"[^>]*>/is);
        if (!iframeMatch) {
          iframeMatch = rawText.match(/<iframe[^>]*srcdoc='([^']*(?:\\'[^']*)*)'[^>]*>/is);
        }
        
        if (iframeMatch && iframeMatch[1]) {
          let extractedContent = iframeMatch[1];
          extractedContent = extractedContent
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&#34;/g, '"')
            .replace(/&apos;/g, "'")
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&#60;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#62;/g, '>')
            .replace(/&nbsp;/g, ' ')
            .replace(/&#160;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&#38;/g, '&');
          
          finalHtml = extractedContent;
        }
      }
      else if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        console.log('Processing JSON format');
        try {
          const jsonData = JSON.parse(rawText);
          console.log('Parsed JSON structure:', typeof jsonData, Array.isArray(jsonData));
          
          if (Array.isArray(jsonData)) {
            console.log('Processing JSON array with', jsonData.length, 'items');
            if (jsonData.length > 0) {
              const firstItem = jsonData[0];
              console.log('First item keys:', Object.keys(firstItem));
              
              finalHtml = firstItem.output || 
                         firstItem.response || 
                         firstItem.content || 
                         firstItem.message || 
                         '';
              
              console.log('Extracted content length:', finalHtml.length);
              console.log('Contains base64 image:', finalHtml.includes('data:image/'));
            }
          } else if (typeof jsonData === 'object') {
            console.log('Processing JSON object with keys:', Object.keys(jsonData));
            finalHtml = jsonData.output || 
                       jsonData.response || 
                       jsonData.content || 
                       jsonData.message || 
                       jsonData.safeResponse ||
                       jsonData.text ||
                       jsonData.data ||
                       JSON.stringify(jsonData, null, 2);
          }
        } catch (jsonError) {
          console.log('JSON parsing failed:', jsonError.message);
          console.log('Treating as plain text/HTML instead');
          finalHtml = rawText;
        }
      }
      else if (rawText.includes('<h2>') || rawText.includes('<h3>') || rawText.includes('<p>') || rawText.includes('<div')) {
        console.log('Processing direct HTML format');
        finalHtml = rawText;
      }
      else {
        console.log('Processing plain text format');
        const formattedText = rawText.replace(/\n/g, '<br>');
        finalHtml = `<p>${formattedText}</p>`;
      }

      // Process escaped characters
      if (typeof finalHtml === 'string') {
        if (finalHtml.includes('\\n')) {
          finalHtml = finalHtml.replace(/\\n/g, '<br>');
        }
        
        if (finalHtml.includes('\\u')) {
          finalHtml = finalHtml.replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
            return String.fromCharCode(parseInt(code, 16));
          });
        }
      }

      // Validate final content
      if (!finalHtml || finalHtml.trim().length < 3) {
        console.warn('Final content is too short');
        return `<div style="padding: 12px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
          <p><strong>Content Processing Issue</strong></p>
          <p>Processed response but content appears empty or too short.</p>
          <p><small>Raw response length: ${rawText.length}</small></p>
        </div>`;
      }

      // Enhanced final cleanup - but preserve base64 images
      const preliminaryClean = finalHtml
        .replace(/^<!DOCTYPE[^>]*>/i, '')
        .replace(/^<html[^>]*>/i, '')
        .replace(/<\/html>$/i, '')
        .replace(/^<head>.*?<\/head>/is, '')
        .replace(/^<body[^>]*>/i, '')
        .replace(/<\/body>$/i, '')
        .trim();

      // Use enhanced cleaning that preserves images
      const cleanedHtml = cleanSpecialCharacters(preliminaryClean);

      // Debug images if present
      if (cleanedHtml.includes('<img')) {
        debugImageDisplay(cleanedHtml);
        
        // Additional check: verify img src attributes
        const imgMatches = cleanedHtml.match(/<img[^>]*src="[^"]*"[^>]*>/gi);
        if (imgMatches) {
          imgMatches.forEach((img, index) => {
            const srcMatch = img.match(/src="([^"]*)"/);
            if (srcMatch) {
              const srcValue = srcMatch[1];
              console.log(`Image ${index + 1} src type:`, 
                srcValue.startsWith('data:image/') ? 'Base64 Data URI' : 
                srcValue.startsWith('http') ? 'HTTP URL' : 
                srcValue === '' ? 'Empty src' : 'Other');
              console.log(`Image ${index + 1} src preview:`, srcValue.substring(0, 80) + '...');
            }
          });
        }
      }

      console.log('FINAL PROCESSED HTML:');
      console.log('   Length:', cleanedHtml.length);
      console.log('   Contains molecular structure:', cleanedHtml.includes('molecular-structure-display'));
      console.log('   Contains image:', cleanedHtml.includes('<img'));
      console.log('   Contains base64:', cleanedHtml.includes('data:image/'));
      
      return cleanedHtml;

    } catch (error) {
      console.error('CRITICAL ERROR in processor:', error);
      return `<div style="color: #dc2626; background: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #fecaca;">
        <strong>Response Processing Error</strong><br/>
        ${error.message}
      </div>`;
    }
  };

  const getSessionId = () => {
    let sessionId = localStorage.getItem('dr_gini_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem('dr_gini_session_id', sessionId);
    }
    return sessionId;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Content Processing Functions
  const isHTMLContent = (content) => /<[a-z][\s\S]*>/i.test(content);

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
      .replace(/<sub[^>]*>(.*?)<\/sub>/g, '$1')
      .replace(/<sup[^>]*>(.*?)<\/sup>/g, '$1')
      .replace(/<img[^>]*>/g, '[Image]')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  };

  // Enhanced message content renderer with image support
  const renderMessageContent = (message) => {
    if (message.isHTML && message.type === 'bot') {
      const cleanedContent = cleanSpecialCharacters(message.content);
      const formattedContent = formatHTMLContent(cleanedContent);
      
      // Debug image content
      if (formattedContent.includes('<img')) {
        console.log('Rendering message with images');
        console.log('Message content preview:', formattedContent.substring(0, 500));
      }
      
      return (
        <div 
          className="research-content"
          dangerouslySetInnerHTML={{ 
            __html: formattedContent
          }}
          style={{
            lineHeight: '1.7',
            fontSize: '14px',
            color: '#374151',
            maxHeight: 'none',
            overflow: 'visible',
            wordBreak: 'break-word',
            width: '100%'
          }}
        />
      );
    } else {
      const cleanedText = cleanSpecialCharacters(message.content);
      
      return (
        <div 
          className="whitespace-pre-wrap research-content" 
          style={{ maxHeight: 'none', overflow: 'visible' }}
          dangerouslySetInnerHTML={{ __html: cleanedText }}
        />
      );
    }
  };

  // Request throttling functions
  const checkCooldown = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_COOLDOWN) {
      const timeLeft = Math.ceil((REQUEST_COOLDOWN - timeSinceLastRequest) / 1000);
      setCooldownTimeLeft(timeLeft);
      return false;
    }
    
    setCooldownTimeLeft(0);
    return true;
  };

  // Enhanced send message function
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Check cooldown
    if (!checkCooldown()) {
      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: `Please wait ${formatTimeLeft(cooldownTimeLeft)} before sending another message. This helps ensure optimal response quality and prevents system overload.`,
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    // Prevent duplicate requests
    if (window.requestInProgress) {
      console.log('Request already in progress, ignoring duplicate');
      return;
    }

    window.requestInProgress = true;

    const sessionId = getSessionId();
    const userId = `user_${Date.now()}`;
    const messageId = generateMessageId('user');

    // Detect image requirements
    const imageRequirement = detectImageRequirement(inputMessage);
    console.log('Image requirement detected:', imageRequirement);

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      messageId: messageId,
      imageRequirement: imageRequirement
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setLastRequestTime(Date.now());

    try {
      const messageData = {
        message: currentMessage,
        sessionId: sessionId,
        userId: userId,
        messageId: messageId,
        timestamp: new Date().toISOString()
      };

      console.log('Sending request to:', N8N_WEBHOOK_URL);
      console.log('Request data:', messageData);

      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/html, application/json, text/plain, */*'
        },
        body: JSON.stringify(messageData)
      });

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
        url: response.url
      });

      if (!response.ok) {        
        if (response.status === 500) {
          throw new Error(`Server error (500): The webhook encountered an internal error. Please check your n8n workflow configuration.`);
        } else if (response.status === 404) {
          throw new Error(`Webhook not found (404): Please verify your webhook URL is correct.`);
        } else if (response.status === 405) {
          throw new Error(`Method not allowed (405): Please check your webhook accepts POST requests.`);
        } else {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
      }

      const aiResponse = await processResponse(response, currentMessage);

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date(),
        isHTML: true,
        messageId: generateMessageId('gini'),
        hasImages: aiResponse.includes('<img') || aiResponse.includes('molecular-structure-display')
      };

      console.log('Creating bot message:', {
        contentLength: aiResponse.length,
        isHTML: true,
        hasImages: botMessage.hasImages,
        contentPreview: aiResponse.substring(0, 100) + '...'
      });

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Sorry, I\'m having trouble processing your request. ';
      
      if (error.message.includes('JSON')) {
        errorMessage += 'There was a formatting issue with the response.';
      } else if (error.message.includes('404')) {
        errorMessage += 'The AI service is temporarily unavailable.';
      } else if (error.message.includes('500')) {
        errorMessage += 'There was a server error. Please try again.';
      } else if (error.message.includes('CORS')) {
        errorMessage += 'There was a connection issue. Please verify your webhook configuration.';
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
      window.requestInProgress = false;
      setIsLoading(false);
    }
  };

  // Feedback Functions
  const handleQuickFeedback = async (messageId, rating) => {
    try {
      const feedback = {
        messageId: messageId,
        sessionId: getSessionId(),
        thumbsRating: rating,
        feedbackType: 'quick',
        timestamp: new Date().toISOString(),
        userId: `user_${Date.now()}`
      };

      const response = await fetch(FEEDBACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        setUserFeedback(prev => ({
          ...prev,
          [messageId]: { ...prev[messageId], thumbs: rating }
        }));
      }
    } catch (error) {
      console.error('Error sending quick feedback:', error);
    }
  };

  const openDetailedFeedback = (messageId, messageContent) => {
    setFeedbackModal({
      open: true,
      messageId: messageId,
      messageContent: messageContent
    });
  };

  const submitDetailedFeedback = async (feedbackData) => {
    try {
      const feedback = {
        messageId: feedbackModal.messageId,
        sessionId: getSessionId(),
        ...feedbackData,
        feedbackType: 'detailed',
        timestamp: new Date().toISOString(),
        userId: `user_${Date.now()}`
      };

      const response = await fetch(FEEDBACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        setUserFeedback(prev => ({
          ...prev,
          [feedbackModal.messageId]: { 
            ...prev[feedbackModal.messageId], 
            detailed: true,
            rating: feedbackData.rating 
          }
        }));

        setFeedbackModal({ open: false, messageId: null, messageContent: '' });
      }
    } catch (error) {
      console.error('Error sending detailed feedback:', error);
    }
  };

  // Download Functions
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
Drug Discovery Research Session Export (With Molecular Visualizations)
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
    element.download = `pharmatech-drugdiscovery-enhanced-${Date.now()}.txt`;
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
Drug Discovery Research Session Export (Enhanced with Molecular Visualizations)
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
    element.download = `pharmatech-drugdiscovery-enhanced-${Date.now()}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadChatAsCSV = () => {
    const csvHeader = '"Timestamp","Sender","Message","Has Images"\n';
    const csvContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'Researcher' : 'Dr. Gini (Drug Discovery Specialist)';
        const content = htmlToPlainText(msg.content).replace(/"/g, '""');
        const hasImages = msg.hasImages ? 'Yes' : 'No';
        return `"${timestamp}","${sender}","${content}","${hasImages}"`;
      })
      .join('\n');

    const fullCsvContent = csvHeader + csvContent;
    
    const element = document.createElement('a');
    const file = new Blob([fullCsvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `pharmatech-drugdiscovery-enhanced-${Date.now()}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Event Handlers
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Effects
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .research-content {
        max-width: none !important;
        max-height: none !important;
        height: auto !important;
        overflow: visible !important;
        word-wrap: break-word;
        overflow-wrap: break-word;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .research-content h1, .research-content h2 {
        color: #1e40af;
        font-size: 18px;
        font-weight: bold;
        margin: 20px 0 12px 0;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 6px;
        line-height: 1.3;
      }
      
      .research-content h3 {
        color: #059669;
        font-size: 16px;
        font-weight: 600;
        margin: 16px 0 8px 0;
        line-height: 1.4;
      }
      
      .research-content p {
        margin: 10px 0;
        line-height: 1.7;
        color: #374151;
      }
      
      .research-content strong, .research-content b {
        color: #1f2937;
        font-weight: 600;
      }
      
      .research-content em, .research-content i {
        color: #4b5563;
        font-style: italic;
      }
      
      .research-content ul {
        margin: 12px 0;
        padding-left: 24px;
        list-style-type: none;
      }
      
      .research-content ul li {
        margin: 8px 0;
        line-height: 1.6;
        position: relative;
      }
      
      .research-content ul li::before {
        content: "•";
        color: #059669;
        font-weight: bold;
        position: absolute;
        left: -16px;
      }
      
      .research-content ol {
        margin: 12px 0;
        padding-left: 24px;
        counter-reset: list-counter;
      }
      
      .research-content ol li {
        margin: 8px 0;
        line-height: 1.6;
        counter-increment: list-counter;
      }
      
      .research-content ol li::marker {
        color: #059669;
        font-weight: 600;
      }
      
      .research-content sub {
        font-size: 0.75em;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
        bottom: -0.25em;
      }
      
      .research-content sup {
        font-size: 0.75em;
        line-height: 0;
        position: relative;
        vertical-align: baseline;
        top: -0.5em;
      }
      
      .research-content code {
        background-color: #f3f4f6;
        padding: 2px 4px;
        border-radius: 3px;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.9em;
        color: #e11d48;
      }
      
      .molecular-structure-display img,
      .research-content img {
        display: block !important;
        max-width: 100% !important;
        height: auto !important;
        margin: 10px auto !important;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        background: white;
        padding: 8px;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      
      .molecular-structure-display img:hover,
      .research-content img:hover {
        transform: scale(1.05);
      }
      
      .loading-spinner {
        animation: spin 1s linear infinite;
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      .image-generation-status {
        animation: pulse 2s ease-in-out infinite;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      /* Debug styles for broken images */
      img[src=""], img:not([src]) {
        display: block !important;
        width: 200px !important;
        height: 100px !important;
        background: #ffe6e6 !important;
        border: 2px dashed #ff0000 !important;
        text-align: center;
        line-height: 100px;
        color: #ff0000;
        font-size: 12px;
        content: "Image failed to load";
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownTimeLeft > 0) {
      const timer = setTimeout(() => {
        setCooldownTimeLeft(cooldownTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTimeLeft]);

  const canSendMessage = cooldownTimeLeft === 0 && !isLoading && inputMessage.trim();

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Add CSP meta tag */}
      <style>{`
        img[src^="data:"] {
          display: block !important;
        }
      `}</style>
      
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 shadow-lg border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <svg width="64" height="64" viewBox="0 0 120 120" className="w-16 h-16">
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
              
              <circle cx="60" cy="60" r="56" fill="url(#logoGradient)" filter="url(#shadow)" />
              <circle cx="60" cy="60" r="50" fill="white" />
              
              <g stroke="#5b21b6" strokeWidth="2" fill="none">
                <polygon points="60,30 75,40 75,60 60,70 45,60 45,40" stroke="#5b21b6" strokeWidth="2" fill="none" />
                <line x1="75" y1="40" x2="90" y2="35" strokeLinecap="round" />
                <line x1="75" y1="60" x2="90" y2="65" strokeLinecap="round" />
                <line x1="45" y1="40" x2="30" y2="35" strokeLinecap="round" />
                <line x1="45" y1="60" x2="30" y2="65" strokeLinecap="round" />
              </g>
              
              <circle cx="60" cy="30" r="4" fill="#ef4444" stroke="#dc2626" strokeWidth="1" />
              <circle cx="75" cy="40" r="3" fill="#3b82f6" stroke="#2563eb" strokeWidth="1" />
              <circle cx="75" cy="60" r="3" fill="#10b981" stroke="#059669" strokeWidth="1" />
              <circle cx="60" cy="70" r="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
              <circle cx="45" cy="60" r="3" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="1" />
              <circle cx="45" cy="40" r="3" fill="#ec4899" stroke="#db2777" strokeWidth="1" />
              
              <circle cx="90" cy="35" r="2.5" fill="#06b6d4" stroke="#0891b2" strokeWidth="1" />
              <circle cx="90" cy="65" r="2.5" fill="#84cc16" stroke="#65a30d" strokeWidth="1" />
              <circle cx="30" cy="35" r="2.5" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
              <circle cx="30" cy="65" r="2.5" fill="#6366f1" stroke="#4f46e5" strokeWidth="1" />
              
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
              
              <text x="60" y="95" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#5b21b6">PT</text>
              <text x="60" y="108" fontFamily="Arial, sans-serif" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#5b21b6" opacity="0.8">INNOVATIONS</text>
              
              <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(123, 58, 237, 0.3)" strokeWidth="2" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-white">DrugDiscovery AI Enhanced</h1>
              <p className="text-sm text-blue-100">PharmaTech Innovations • Accelerating Early-Stage Drug Discovery</p>
              <p className="text-xs text-blue-200 mt-1">"From Molecules to Medicine: AI-Powered Discovery Pipeline"</p>
              <div className="flex items-center space-x-2 mt-1">
                <Beaker className="w-3 h-3 text-blue-300" />
                <span className="text-xs text-blue-300">2D/3D Molecular Visualization</span>
                <Atom className="w-3 h-3 text-blue-300" />
                <span className="text-xs text-blue-300">Structure Generation</span>
              </div>
            </div>
          </div>
          
          {/* Status indicator */}
          {isLoading && (
            <div className="flex items-center space-x-2 text-blue-200">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Processing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex space-x-3 max-w-4xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center relative ${
                message.type === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-md' 
                  : message.isError 
                    ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-md' 
                    : 'bg-gradient-to-br from-green-600 to-emerald-700 shadow-md border-2 border-white'
              }`}>
                {message.type === 'user' ? (
                  <>
                    <User className="w-5 h-5 text-white" />
                    {message.imageRequirement?.needsImage && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <Image className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M19 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-3c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" fill="#1e40af"/>
                        <path d="M16 4.5c0-.28-.22-.5-.5-.5s-.5.22-.5.5V11c0 2.76-2.24 5-5 5s-5-2.24-5-5V4.5c0-.28-.22-.5-.5-.5S4 4.22 4 4.5V11c0 3.31 2.69 6 6 6s6-2.69 6-6V4.5z" fill="#1e40af"/>
                        <circle cx="7" cy="4" r="2" fill="#10b981"/>
                        <circle cx="13" cy="4" r="2" fill="#10b981"/>
                      </svg>
                    </div>
                    {message.hasImages && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <Beaker className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </>
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
                }`} style={{ maxHeight: 'none', overflow: 'visible', maxWidth: '100%' }}>
                  {renderMessageContent(message)}
                </div>

                {/* Feedback Section */}
                {message.type === 'bot' && !message.isError && message.messageId && (
                  <div className="flex items-center space-x-2 mt-2">
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

                    {message.hasImages && (
                      <div className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded">
                        <Beaker className="w-3 h-3" />
                        <span>Contains Structures</span>
                      </div>
                    )}
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
                    <span className="text-gray-600">
                      Dr. Gini is processing your request...
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center space-x-1">
                    <Beaker className="w-3 h-3" />
                    <span>Including molecular structures if requested</span>
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
                <div className="flex items-center space-x-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                  <Beaker className="w-3 h-3" />
                  <span>Enhanced with Molecular Structures</span>
                </div>
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

        {/* Cooldown Notice */}
        {cooldownTimeLeft > 0 && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700">
                Please wait {formatTimeLeft(cooldownTimeLeft)} before sending another message.
              </span>
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
              placeholder="Ask me about drug targets, molecular structures, 2D/3D visualizations, compound optimization, ADMET properties, clinical trials, or any drug discovery questions... Try: 'Show me the structure of chromene' or 'Generate 3D visualization of caffeine'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '50px', maxHeight: '120px' }}
              disabled={isLoading || cooldownTimeLeft > 0}
            />
            
            {/* Quick structure buttons */}
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <button
                onClick={() => setInputMessage('Show me the 2D structure of chromene')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                disabled={isLoading}
                title="Quick: 2D Structure"
              >
                2D
              </button>
              <button
                onClick={() => setInputMessage('Generate 3D visualization of benzene')}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                disabled={isLoading}
                title="Quick: 3D Structure"
              >
                3D
              </button>
            </div>
          </div>
          <button
            onClick={sendMessage}
            disabled={!canSendMessage}
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
          <span>Connected to PharmaTech Discovery Systems</span>
          <span className="mx-2">•</span>
          <span>2D/3D Molecular Visualization Enabled</span>
          <br />
          <span className="text-xs text-gray-400">
            Session: {getSessionId().split('_')[1]} | Enhanced Image Processing
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
    visualQuality: 0,
    comment: '',
    improvementSuggestions: '',
    userExpertise: 'intermediate'
  });

  const handleStarClick = (field, rating) => {
    setFeedback(prev => ({ ...prev, [field]: rating }));
  };

  const handleSubmit = () => {
    onSubmit(feedback);
    setFeedback({
      rating: 0,
      accuracyRating: 0, 
      helpfulnessRating: 0,
      visualQuality: 0,
      comment: '',
      improvementSuggestions: '',
      userExpertise: 'intermediate'
    });
  };

  if (!isOpen) return null;

  const hasImages = messageContent.includes('<img') || messageContent.includes('molecular-image-container');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Provide Detailed Feedback</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

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
            {hasImages && (
              <div className="mt-2 flex items-center space-x-1 text-xs text-purple-600">
                <Beaker className="w-3 h-3" />
                <span>This response includes molecular structures</span>
              </div>
            )}
          </div>

          <div className="space-y-6">
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

            {hasImages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Molecular Structure Quality
                </label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick('visualQuality', star)}
                      className={`p-1 ${
                        star <= feedback.visualQuality ? 'text-purple-400' : 'text-gray-300'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Comments
              </label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="What did you think about this response? Was it helpful for your research? How were the molecular structures?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for Improvement
              </label>
              <textarea
                value={feedback.improvementSuggestions}
                onChange={(e) => setFeedback(prev => ({ ...prev, improvementSuggestions: e.target.value }))}
                placeholder="How could Dr. Gini improve this type of response? What information was missing? How could the molecular visualizations be better?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Submit Feedback
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalResearchGini;