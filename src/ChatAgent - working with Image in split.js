import React, { useState, useRef, useEffect } from 'react';
import { Send, Download, FileText, FileSpreadsheet, User, Loader2, ThumbsUp, ThumbsDown, MessageSquare, X, Star, Clock, Image, Beaker, Atom } from 'lucide-react';

// Molecular Structure React Component
const MolecularImage = ({ imageData }) => {
  const [imageStatus, setImageStatus] = useState('loading');
  const [error, setError] = useState(null);

  if (!imageData || !imageData.image_url) {
    return null;
  }

  const { image_url, metadata = {}, size } = imageData;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      border: '2px solid #3b82f6',
      borderRadius: '12px',
      padding: '20px',
      margin: '20px 0',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{
          color: '#1e40af',
          margin: '0 0 12px 0',
          fontSize: '18px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          🧬 {metadata.compound || 'Unknown Compound'} - Molecular Structure
        </h3>
        
        <div style={{ textAlign: 'center', padding: '10px', position: 'relative', minHeight: '200px' }}>
          {imageStatus === 'loading' && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '20px',
              background: '#f0f9ff',
              border: '1px solid #0ea5e9',
              borderRadius: '6px',
              color: '#0369a1'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #0ea5e9',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Loading molecular structure...
              </div>
            </div>
          )}
          
          {imageStatus === 'error' && (
            <div style={{
              padding: '20px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              color: '#dc2626'
            }}>
              <strong>Image Display Error</strong><br/>
              <p style={{ margin: '8px 0', fontSize: '14px' }}>
                Unable to display molecular structure for {metadata.compound}
              </p>
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                Image data: {image_url.length} characters
              </p>
              {error && (
                <p style={{ margin: '4px 0', fontSize: '11px', color: '#999' }}>
                  Error: {error.toString()}
                </p>
              )}
              <button
                onClick={() => {
                  setImageStatus('loading');
                  setError(null);
                  // Force retry by creating new image element
                  const img = new Image();
                  img.onload = () => setImageStatus('loaded');
                  img.onerror = (e) => {
                    setImageStatus('error');
                    setError('Retry failed');
                  };
                  img.src = image_url;
                }}
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '8px'
                }}
              >
                Retry Loading
              </button>
            </div>
          )}
          
          <img
            src={image_url}
            alt={metadata.compound || 'Molecular structure'}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: '6px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              display: imageStatus === 'loaded' ? 'block' : 'none',
              margin: '0 auto',
              background: 'white',
              padding: '8px',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            onLoad={() => {
              console.log('✅ React image loaded successfully:', metadata.compound);
              setImageStatus('loaded');
              setError(null);
            }}
            onError={(e) => {
              console.error('❌ React image failed to load:', metadata.compound, e);
              setImageStatus('error');
              setError(e.target.error || 'Image load failed');
            }}
            onClick={() => {
              // Optional: Open image in new tab on click
              const newWindow = window.open();
              newWindow.document.write(`<img src="${image_url}" style="max-width: 100%; height: auto;" />`);
            }}
          />
        </div>
      </div>
      
      <div style={{
        background: '#eff6ff',
        borderRadius: '6px',
        padding: '12px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '8px',
          textAlign: 'left',
          fontSize: '13px'
        }}>
          <div><strong style={{ color: '#1e40af' }}>Compound:</strong> <span style={{ color: '#374151' }}>{metadata.compound || 'N/A'}</span></div>
          {metadata.cid && <div><strong style={{ color: '#1e40af' }}>PubChem CID:</strong> <span style={{ color: '#374151' }}>{metadata.cid}</span></div>}
          {metadata.inchikey && <div><strong style={{ color: '#1e40af' }}>InChIKey:</strong> <span style={{ color: '#374151', fontFamily: 'monospace', fontSize: '11px' }}>{metadata.inchikey}</span></div>}
          <div><strong style={{ color: '#1e40af' }}>Source:</strong> <span style={{ color: '#374151' }}>{metadata.source || 'Generated'}</span></div>
          {size && <div><strong style={{ color: '#1e40af' }}>Image Size:</strong> <span style={{ color: '#374151' }}>{size} bytes</span></div>}
        </div>
      </div>
    </div>
  );
};

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
  const TEXT_WEBHOOK_URL = process.env.REACT_APP_TEXT_WEBHOOK_URL || 'https://prshntkumrai.app.n8n.cloud/webhook/Chatbot_text';
  const IMAGE_WEBHOOK_URL = process.env.REACT_APP_IMAGE_WEBHOOK_URL || 'https://prshntkumrai.app.n8n.cloud/webhook/Chatbot_image';
  const FEEDBACK_WEBHOOK_URL = 'https://prshntkumrai.app.n8n.cloud/webhook/webhook/Chatbot/feedback';
  const REQUEST_COOLDOWN = 180000; // 3 minutes

  // Enhanced Logging Utility
  const logger = {
    info: (message, data = null) => {
      console.log(`🟢 [ChatAgent] ${message}`, data || '');
    },
    warn: (message, data = null) => {
      console.warn(`🟡 [ChatAgent] ${message}`, data || '');
    },
    error: (message, error = null) => {
      console.error(`🔴 [ChatAgent] ${message}`, error || '');
    },
    debug: (message, data = null) => {
      console.log(`🔵 [DEBUG] ${message}`, data || '');
    },
    image: (message, data = null) => {
      console.log(`🖼️ [IMAGE] ${message}`, data || '');
    }
  };

  // Utility Functions
  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateMessageId = (type) => `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;

  const getSessionId = () => {
    let sessionId = localStorage.getItem('dr_gini_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      localStorage.setItem('dr_gini_session_id', sessionId);
      logger.info('New session created', sessionId);
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

  // Enhanced Image Detection
  const detectImageRequirement = (message) => {
    const imageKeywords = [
      'structure', 'molecular structure', 'chemical structure', 'show structure',
      'visualize', 'visualization', 'diagram', 'image', 'picture', 'display',
      '2d', '3d', 'three dimensional', 'two dimensional', 'render',
      'molecule', 'compound', 'formula', 'bond', 'conformation',
      'show me', 'draw', 'generate image', 'create visualization', 'with image'
    ];
    
    const molecularCompounds = [
      'chromene', 'benzene', 'caffeine', 'aspirin', 'penicillin', 
      'dopamine', 'serotonin', 'acetaminophen', 'ibuprofen', 'rochelle', 'salt'
    ];
    
    const lowerMessage = message.toLowerCase();
    const hasImageKeyword = imageKeywords.some(keyword => lowerMessage.includes(keyword));
    const hasCompound = molecularCompounds.some(compound => lowerMessage.includes(compound));
    
    const result = {
      needsImage: hasImageKeyword || hasCompound,
      imageType: lowerMessage.includes('3d') ? '3d' : '2d',
      compound: extractCompoundName(message),
      confidence: hasImageKeyword ? 'high' : hasCompound ? 'medium' : 'low'
    };

    logger.debug('Image requirement detection', result);
    return result;
  };

  const extractCompoundName = (message) => {
    const compounds = ['chromene', 'benzene', 'caffeine', 'aspirin', 'penicillin', 'dopamine', 'serotonin', 'rochelle salt', 'rochelle'];
    const found = compounds.find(compound => message.toLowerCase().includes(compound));
    const formulaMatch = message.match(/([A-Z][a-z]?\d*)+/g);
    return found || (formulaMatch && formulaMatch[0]) || 'unknown';
  };

  // Enhanced Image Validation
  const validateImageData = (imageUrl) => {
    logger.image('Validating image data', {
      hasDataPrefix: imageUrl.startsWith('data:'),
      length: imageUrl.length,
      format: imageUrl.substring(0, 50),
      isValidBase64: /^data:image\/[a-zA-Z]+;base64,/.test(imageUrl)
    });

    if (!imageUrl.startsWith('data:image/')) {
      logger.warn('Invalid image format - missing data URL prefix');
      return false;
    }

    if (imageUrl.length < 100) {
      logger.warn('Image data too short', imageUrl.length);
      return false;
    }

    return true;
  };

  // Text Processing Functions
  const cleanSpecialCharacters = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/#{1,6}\s+(.*?)(?:\n|$)/g, '<h3>$1</h3>')
      .replace(/^[\s]*[-*+]\s+/gm, '• ')
      .replace(/\\n/g, '<br>')
      .replace(/\\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>')
      .replace(/\^(\d+)/g, '<sup>$1</sup>')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{3,}/g, ' ')
      .trim();
  };

  const formatHTMLContent = (htmlString) => {
    if (!htmlString) return '';
    
    // Basic sanitization for safety
    return htmlString
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  // Enhanced Response Processor with React Component Support
  const processResponse = async (response, isImageWebhook = false) => {
    const webhookType = isImageWebhook ? 'IMAGE' : 'TEXT';
    logger.info(`Processing ${webhookType} response`, { status: response.status, url: response.url });
    
    try {
      const rawText = await response.text();
      logger.debug(`Raw ${webhookType} response`, { length: rawText.length, preview: rawText.substring(0, 200) });

      let finalHtml = '';

      // Handle JSON responses
      if (rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
        try {
          const jsonData = JSON.parse(rawText);
          logger.debug(`Parsed JSON ${webhookType} data`, jsonData);
          
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const firstItem = jsonData[0];
            
            if (isImageWebhook) {
              // Handle image webhook response - Return React component marker
              if (firstItem.success && firstItem.image_url) {
                logger.image('Processing successful image response for React component');
                
                if (!validateImageData(firstItem.image_url)) {
                  throw new Error('Invalid image data format');
                }

                // Return React component marker instead of HTML
                finalHtml = `__MOLECULAR_REACT_COMPONENT__${JSON.stringify(firstItem)}__END_MOLECULAR_REACT_COMPONENT__`;
                
                logger.image('React component marker generated', { compound: firstItem.metadata?.compound, size: firstItem.size });
              } else {
                logger.error('Image webhook returned unsuccessful response', firstItem);
                finalHtml = `<div style="padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #dc2626;">
                  <strong>Molecular Structure Error</strong><br/>
                  <p>${firstItem.error || 'Failed to generate molecular structure'}</p>
                  <p style="font-size: 12px; margin-top: 8px;">Response: ${JSON.stringify(firstItem, null, 2).substring(0, 200)}...</p>
                </div>`;
              }
            } else {
              // Text webhook processing
              finalHtml = firstItem.output || 
                         firstItem.response || 
                         firstItem.content || 
                         firstItem.message || '';
              logger.debug('Text content extracted', { length: finalHtml.length });
            }
          } else if (typeof jsonData === 'object') {
            if (isImageWebhook) {
              // Handle object format for image webhook
              if (jsonData.success && jsonData.image_url) {
                if (!validateImageData(jsonData.image_url)) {
                  throw new Error('Invalid image data format in object response');
                }

                // Return React component marker for object format
                finalHtml = `__MOLECULAR_REACT_COMPONENT__${JSON.stringify(jsonData)}__END_MOLECULAR_REACT_COMPONENT__`;
                logger.image('Object format React component marker generated');
              }
            } else {
              finalHtml = jsonData.output || 
                         jsonData.response || 
                         jsonData.content || 
                         jsonData.message || '';
            }
          }
        } catch (jsonError) {
          logger.error('JSON parsing failed', jsonError);
          finalHtml = rawText;
        }
      }
      // Handle direct HTML
      else if (rawText.includes('<div') || rawText.includes('<p') || rawText.includes('<h')) {
        finalHtml = rawText;
        logger.debug('Direct HTML content detected');
      }
      // Handle plain text
      else {
        finalHtml = `<p>${rawText.replace(/\n/g, '<br>')}</p>`;
        logger.debug('Plain text content converted to HTML');
      }

      // Process escaped characters (but not for React component markers)
      if (typeof finalHtml === 'string' && finalHtml.includes('\\') && !finalHtml.includes('__MOLECULAR_REACT_COMPONENT__')) {
        finalHtml = finalHtml
          .replace(/\\n/g, '<br>')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\u([0-9a-fA-F]{4})/g, (match, code) => {
            return String.fromCharCode(parseInt(code, 16));
          });
        logger.debug('Escaped characters processed');
      }

      // Validate content (except React component markers)
      if (!finalHtml || (finalHtml.trim().length < 5 && !finalHtml.includes('__MOLECULAR_REACT_COMPONENT__'))) {
        logger.warn('Response content too short or empty', finalHtml);
        if (isImageWebhook) {
          return `<div style="padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #dc2626;">
            <strong>Molecular Structure Unavailable</strong><br/>
            <p>Unable to generate molecular structure at this time.</p>
            <p style="font-size: 12px; margin-top: 8px;">Response was empty or too short</p>
          </div>`;
        } else {
          return `<div style="padding: 12px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
            <p><strong>Response Processing Issue</strong></p>
            <p>The response appears to be empty or too short. Please try again.</p>
          </div>`;
        }
      }

      // Clean up and format (but not React component markers)
      if (!finalHtml.includes('__MOLECULAR_REACT_COMPONENT__')) {
        const cleanedHtml = finalHtml
          .replace(/^<!DOCTYPE[^>]*>/i, '')
          .replace(/^<html[^>]*>|<\/html>$/gi, '')
          .replace(/<head>.*?<\/head>/gis, '')
          .replace(/^<body[^>]*>|<\/body>$/gi, '')
          .trim();

        const processedHtml = cleanSpecialCharacters(cleanedHtml);
        finalHtml = formatHTMLContent(processedHtml);
      }

      logger.info(`${webhookType} processing completed`, {
        length: finalHtml.length,
        hasImages: finalHtml.includes('<img'),
        hasMolecularStructure: finalHtml.includes('molecular-structure-display'),
        hasReactComponent: finalHtml.includes('__MOLECULAR_REACT_COMPONENT__')
      });

      return finalHtml;

    } catch (error) {
      logger.error(`Critical error processing ${webhookType} response`, error);
      return `<div style="color: #dc2626; background: #fef2f2; padding: 12px; border-radius: 6px;">
        <strong>${webhookType} Processing Error</strong><br/>
        <p>${error.message}</p>
        <details style="margin-top: 8px;">
          <summary style="cursor: pointer; font-size: 12px;">Technical Details</summary>
          <pre style="font-size: 10px; margin: 4px 0; white-space: pre-wrap;">${error.stack || error.toString()}</pre>
        </details>
      </div>`;
    }
  };

  // Message Rendering with React Component Support
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
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, '$1')
      .replace(/<em[^>]*>(.*?)<\/em>/g, '$1')
      .replace(/<img[^>]*>/g, '[Image]')
      .replace(/<[^>]*>/g, '')
      .replace(/\n\n+/g, '\n\n')
      .trim();
  };

  const renderMessageContent = (message) => {
    if (message.isHTML && message.type === 'bot') {
      const content = message.content;
      
      // Check for React component marker
      if (content.includes('__MOLECULAR_REACT_COMPONENT__')) {
        const componentMatch = content.match(/__MOLECULAR_REACT_COMPONENT__(.*?)__END_MOLECULAR_REACT_COMPONENT__/);
        if (componentMatch) {
          try {
            const imageData = JSON.parse(componentMatch[1]);
            logger.image('Rendering React component for molecular structure', { compound: imageData.metadata?.compound });
            return <MolecularImage imageData={imageData} />;
          } catch (e) {
            logger.error('Failed to parse React component data', e);
            return (
              <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626' }}>
                <strong>Component Rendering Error</strong><br/>
                <p>Failed to render molecular structure component</p>
              </div>
            );
          }
        }
      }
      
      // Regular HTML content
      const cleanedContent = cleanSpecialCharacters(content);
      const formattedContent = formatHTMLContent(cleanedContent);
      
      return (
        <div 
          className="research-content"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
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

  // Request Throttling
  const checkCooldown = () => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < REQUEST_COOLDOWN) {
      const timeLeft = Math.ceil((REQUEST_COOLDOWN - timeSinceLastRequest) / 1000);
      setCooldownTimeLeft(timeLeft);
      logger.warn('Request blocked by cooldown', { timeLeft });
      return false;
    }
    
    setCooldownTimeLeft(0);
    return true;
  };

  // Main Send Message Function with Enhanced Error Handling
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) {
      logger.warn('Send message blocked', { empty: !inputMessage.trim(), loading: isLoading });
      return;
    }

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
      logger.warn('Duplicate request blocked');
      return;
    }
    window.requestInProgress = true;

    const sessionId = getSessionId();
    const requestId = `request_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const messageId = generateMessageId('user');

    // Detect image requirements
    const imageRequirement = detectImageRequirement(inputMessage);
    logger.info('New message processing started', { 
      requestId, 
      messageId, 
      imageRequired: imageRequirement.needsImage,
      compound: imageRequirement.compound
    });

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

    // Message data for webhooks
    const messageData = {
      message: currentMessage,
      sessionId: sessionId,
      userId: `user_${Date.now()}`,
      messageId: messageId,
      requestId: requestId,
      timestamp: new Date().toISOString()
    };

    logger.info('Starting dual webhook requests', { requestId, imageRequired: imageRequirement.needsImage });

    try {
      // STEP 1: Get text response (always)
      logger.info('Fetching text response', { url: TEXT_WEBHOOK_URL });
      
      const textResponse = await fetch(TEXT_WEBHOOK_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/html, text/plain, */*'
        },
        body: JSON.stringify(messageData)
      });

      if (!textResponse.ok) {
        throw new Error(`Text webhook error: ${textResponse.status} - ${textResponse.statusText}`);
      }

      const textContent = await processResponse(textResponse, false);
      logger.info('Text content processed successfully', { length: textContent.length });

      // Create bot message with text content
      const initialBotMessageId = Date.now() + 1;
      const textBotMessage = {
        id: initialBotMessageId,
        type: 'bot',
        content: textContent,
        timestamp: new Date(),
        isHTML: true,
        messageId: generateMessageId('gini'),
        hasImages: false,
        isPartial: imageRequirement.needsImage,
        requestId: requestId
      };

      setMessages(prev => [...prev, textBotMessage]);
      setIsLoading(false);

      // STEP 2: Get image if needed
      if (imageRequirement.needsImage) {
        logger.image('Starting image request', { compound: imageRequirement.compound, url: IMAGE_WEBHOOK_URL });
        
        // Show loading indicator
        const loadingMessageId = Date.now() + 2;
        const imageLoadingMessage = {
          id: loadingMessageId,
          type: 'bot',
          content: `<div style="padding: 12px; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border: 2px solid #3b82f6; border-radius: 12px; text-align: center; margin: 10px 0;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <div style="width: 16px; height: 16px; border: 2px solid #3b82f6; border-top: 2px solid transparent; border-radius: 50%; animation: spin 1s linear infinite;"></div>
              <span style="color: #1e40af; font-weight: 600;">Generating molecular structure for ${imageRequirement.compound}...</span>
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">This may take a moment</p>
          </div>`,
          timestamp: new Date(),
          isHTML: true,
          isImageLoading: true,
          requestId: requestId
        };

        setMessages(prev => [...prev, imageLoadingMessage]);

        try {
          const imageResponse = await fetch(IMAGE_WEBHOOK_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json, text/html, text/plain, */*'
            },
            body: JSON.stringify({
              ...messageData,
              compound: imageRequirement.compound
            })
          });

          if (imageResponse.ok) {
            const imageContent = await processResponse(imageResponse, true);
            logger.image('Image content processed successfully', { length: imageContent.length, hasReactComponent: imageContent.includes('__MOLECULAR_REACT_COMPONENT__') });

            // Remove loading message and add image as separate message
            setMessages(prev => {
              const messagesWithoutLoading = prev.filter(msg => msg.id !== loadingMessageId);
              
              const imageMessage = {
                id: Date.now() + 3,
                type: 'bot',
                content: imageContent,
                timestamp: new Date(),
                isHTML: true,
                hasImages: true,
                messageId: generateMessageId('gini_image'),
                requestId: requestId
              };
              
              return [...messagesWithoutLoading, imageMessage];
            });

            // Mark original text message as having associated images
            setMessages(prev => prev.map(msg => 
              msg.id === initialBotMessageId ? { ...msg, hasImages: true } : msg
            ));

            logger.image('Image message displayed successfully');
          } else {
            throw new Error(`Image webhook error: ${imageResponse.status} - ${imageResponse.statusText}`);
          }
        } catch (imageError) {
          logger.error('Image request failed', imageError);
          
          // Replace loading message with error message
          setMessages(prev => prev.map(msg => 
            msg.id === loadingMessageId ? {
              ...msg,
              content: `<div style="padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; color: #dc2626;">
                <strong>Molecular Structure Unavailable</strong><br/>
                <p style="margin: 8px 0 0 0; font-size: 14px;">Unable to generate molecular structure: ${imageError.message}</p>
                <details style="margin-top: 8px;">
                  <summary style="cursor: pointer; font-size: 12px;">Error Details</summary>
                  <pre style="font-size: 10px; margin: 4px 0; white-space: pre-wrap;">${imageError.stack || imageError.toString()}</pre>
                </details>
              </div>`,
              isImageLoading: false,
              isImageError: true
            } : msg
          ));
        }
      }

    } catch (textError) {
      logger.error('Text request failed', textError);
      
      let errorMessage = 'Sorry, I\'m having trouble processing your request. ';
      if (textError.message.includes('404')) {
        errorMessage += 'The service is temporarily unavailable.';
      } else if (textError.message.includes('500')) {
        errorMessage += 'There was a server error. Please try again.';
      } else {
        errorMessage += 'Please check your connection and try again.';
      }

      const errorMsg = {
        id: Date.now() + 1,
        type: 'bot',
        content: `<div style="color: #dc2626; background: #fef2f2; padding: 12px; border-radius: 6px;">
          <strong>Connection Error</strong><br/>
          <p>${errorMessage}</p>
          <details style="margin-top: 8px;">
            <summary style="cursor: pointer; font-size: 12px;">Technical Details</summary>
            <pre style="font-size: 10px; margin: 4px 0; white-space: pre-wrap;">${textError.stack || textError.toString()}</pre>
          </details>
        </div>`,
        timestamp: new Date(),
        isError: true,
        isHTML: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      window.requestInProgress = false;
      setIsLoading(false);
      logger.info('Message processing completed', { requestId });
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

      logger.info('Sending quick feedback', { messageId, rating });

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
        logger.info('Quick feedback sent successfully');
      }
    } catch (error) {
      logger.error('Error sending quick feedback', error);
    }
  };

  const openDetailedFeedback = (messageId, messageContent) => {
    logger.info('Opening detailed feedback modal', { messageId });
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

      logger.info('Sending detailed feedback', { messageId: feedbackModal.messageId });

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
        logger.info('Detailed feedback sent successfully');
      }
    } catch (error) {
      logger.error('Error sending detailed feedback', error);
    }
  };

  // Download Functions
  const downloadChatAsText = () => {
    logger.info('Downloading chat as text');
    const chatContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'Researcher' : 'Dr. Gini (Drug Discovery Specialist)';
        const content = htmlToPlainText(msg.content);
        return `[${timestamp}] ${sender}: ${content}`;
      })
      .join('\n\n');

    const fullContent = `PharmaTech Innovations - DrugDiscovery AI
Drug Discovery Research Session Export (With Molecular Visualizations)
Generated on: ${new Date().toLocaleString()}
Total Messages: ${messages.length}

${'='.repeat(50)}

${chatContent}

${'='.repeat(50)}
End of Drug Discovery Session
© PharmaTech Innovations`;

    const element = document.createElement('a');
    const file = new Blob([fullContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `pharmatech-drugdiscovery-enhanced-${Date.now()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadChatAsWord = () => {
    logger.info('Downloading chat as Word document');
    const chatContent = messages
      .filter(msg => msg.type !== 'bot' || !msg.isError)
      .map(msg => {
        const timestamp = new Date(msg.timestamp).toLocaleString();
        const sender = msg.type === 'user' ? 'Researcher' : 'Dr. Gini (Drug Discovery Specialist)';
        const content = htmlToPlainText(msg.content);
        return `[${timestamp}] ${sender}: ${content}`;
      })
      .join('\n\n');

    const fullContent = `PharmaTech Innovations - DrugDiscovery AI
Drug Discovery Research Session Export (Enhanced with Molecular Visualizations)
Generated on: ${new Date().toLocaleString()}
Total Messages: ${messages.length}

${'='.repeat(50)}

${chatContent}

${'='.repeat(50)}
End of Drug Discovery Session
© PharmaTech Innovations`;

    const element = document.createElement('a');
    const file = new Blob([fullContent], { type: 'application/msword' });
    element.href = URL.createObjectURL(file);
    element.download = `pharmatech-drugdiscovery-enhanced-${Date.now()}.doc`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadChatAsCSV = () => {
    logger.info('Downloading chat as CSV');
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
    // Enhanced CSP setup
    if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
      const cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      cspMeta.setAttribute('content', "img-src 'self' data: blob: https: 'unsafe-inline'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';");
      document.head.appendChild(cspMeta);
      logger.info('Enhanced CSP meta tag added for image support');
    }

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
      }
      
      .research-content h1, .research-content h2 {
        color: #1e40af;
        font-size: 18px;
        font-weight: bold;
        margin: 20px 0 12px 0;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 6px;
      }
      
      .research-content h3 {
        color: #059669;
        font-size: 16px;
        font-weight: 600;
        margin: 16px 0 8px 0;
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
      
      .research-content sub {
        font-size: 0.75em;
        vertical-align: baseline;
        bottom: -0.25em;
        position: relative;
      }
      
      .research-content sup {
        font-size: 0.75em;
        vertical-align: baseline;
        top: -0.5em;
        position: relative;
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
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

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
      {/* Header */}
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
              </defs>
              <circle cx="60" cy="60" r="56" fill="url(#logoGradient)" />
              <circle cx="60" cy="60" r="50" fill="white" />
              <g stroke="#5b21b6" strokeWidth="2" fill="none">
                <polygon points="60,30 75,40 75,60 60,70 45,60 45,40" />
              </g>
              <circle cx="60" cy="30" r="4" fill="#ef4444" />
              <circle cx="75" cy="40" r="3" fill="#3b82f6" />
              <circle cx="75" cy="60" r="3" fill="#10b981" />
              <circle cx="60" cy="70" r="4" fill="#f59e0b" />
              <circle cx="45" cy="60" r="3" fill="#8b5cf6" />
              <circle cx="45" cy="40" r="3" fill="#ec4899" />
            </svg>
            <div>
              <h1 className="text-xl font-bold text-white">DrugDiscovery AI Enhanced</h1>
              <p className="text-sm text-blue-100">PharmaTech Innovations • React Component Integration</p>
              <div className="flex items-center space-x-2 mt-1">
                <Beaker className="w-3 h-3 text-blue-300" />
                <span className="text-xs text-blue-300">Native React Images</span>
                <Atom className="w-3 h-3 text-blue-300" />
                <span className="text-xs text-blue-300">Molecular Structures</span>
              </div>
            </div>
          </div>
          
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
                      <Beaker className="w-4 h-4 text-blue-600" />
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
                {message.type === 'bot' && !message.isError && !message.isImageLoading && message.messageId && (
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
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
              <div className="flex flex-col items-start">
                <div className="px-4 py-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Dr. Gini is processing your request...</span>
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
              placeholder="Ask me about drug targets, molecular structures, 2D/3D visualizations, compound optimization... Try: 'Show me the structure of caffeine' or 'Explain aspirin and show its molecular structure'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows="1"
              style={{ minHeight: '50px', maxHeight: '120px' }}
              disabled={isLoading || cooldownTimeLeft > 0}
            />
            
            {/* Quick structure buttons */}
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <button
                onClick={() => setInputMessage('Show me the 2D structure of caffeine')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                disabled={isLoading}
                title="Quick: 2D Structure"
              >
                2D
              </button>
              <button
                onClick={() => setInputMessage('Explain aspirin and show its molecular structure')}
                className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded hover:bg-purple-200 transition-colors"
                disabled={isLoading}
                title="Quick: Mixed Content"
              >
                Text+3D
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
          <span>React Component Integration Enabled</span>
          <br />
          <span className="text-xs text-gray-400">
            Text: Chatbot_text | Image: Chatbot_image | Session: {getSessionId().split('_')[1]}
          </span>
          <br />
          <span className="text-xs text-blue-500">
            Check browser console (F12) for detailed logs
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

  const hasImages = messageContent.includes('<img') || messageContent.includes('molecular-structure-display') || messageContent.includes('__MOLECULAR_REACT_COMPONENT__');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Provide Detailed Feedback</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Overall Rating</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick('rating', star)}
                    className={`p-1 ${star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Accuracy</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick('accuracyRating', star)}
                    className={`p-1 ${star <= feedback.accuracyRating ? 'text-blue-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Helpfulness</label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick('helpfulnessRating', star)}
                    className={`p-1 ${star <= feedback.helpfulnessRating ? 'text-green-400' : 'text-gray-300'}`}
                  >
                    <Star className="w-5 h-5 fill-current" />
                  </button>
                ))}
              </div>
            </div>

            {hasImages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Molecular Structure Quality</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleStarClick('visualQuality', star)}
                      className={`p-1 ${star <= feedback.visualQuality ? 'text-purple-400' : 'text-gray-300'}`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Research Background</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="What did you think about this response? How were the molecular structures?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Suggestions for Improvement</label>
              <textarea
                value={feedback.improvementSuggestions}
                onChange={(e) => setFeedback(prev => ({ ...prev, improvementSuggestions: e.target.value }))}
                placeholder="How could Dr. Gini improve? What information was missing?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Submit Feedback
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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