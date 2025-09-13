// ============================================
// TARGETED FIXES FOR IMAGE GENERATION ISSUES
// Keep all existing functionality, fix only image problems
// ============================================

// 1. REMOVE/COMMENT OUT the separate image generation webhook (this doesn't exist)
// const IMAGE_GENERATION_WEBHOOK = process.env.REACT_APP_N8N_IMAGE_WEBHOOK || 'https://prshntkumrai.app.n8n.cloud/webhook/generate-molecular-image';

// 2. MODIFY the generateMolecularImage function to return null (disable frontend image generation)
const generateMolecularImage = async (compound, imageType = '2d') => {
  // ✅ DISABLE frontend image generation - let N8N handle everything
  console.log(`🎨 Image generation delegated to N8N for: ${compound}`);
  return null; // Always return null to let N8N handle images
};

// 3. REMOVE/COMMENT OUT the getFallbackImageUrl function (causes CORS issues)
const getFallbackImageUrl = (compound, imageType) => {
  // ✅ DISABLE fallback URLs - they cause CORS errors
  console.log(`🔄 Fallback images disabled for CORS compliance: ${compound}`);
  return null;
};

// 4. MODIFY the sendMessage function - add timeout and simplify image logic
const sendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  // Check cooldown (keep existing logic)
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

  // Prevent duplicate requests (keep existing logic)
  if (window.requestInProgress) {
    console.log('🚫 Request already in progress, ignoring duplicate');
    return;
  }

  window.requestInProgress = true;

  const sessionId = getSessionId();
  const userId = `user_${Date.now()}`;
  const messageId = generateMessageId('user');

  // ✅ KEEP image detection for UI indicators, but don't use for generation
  const imageRequirement = detectImageRequirement(inputMessage);
  console.log('🎨 Image requirement detected (for UI only):', imageRequirement);

  const userMessage = {
    id: Date.now(),
    type: 'user',
    content: inputMessage,
    timestamp: new Date(),
    messageId: messageId,
    imageRequirement: imageRequirement // Keep for UI indicators
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
      // ✅ REMOVED: imageRequirement from request (N8N Intent Classifier handles this)
    };

    console.log('📤 Sending enhanced request to:', N8N_WEBHOOK_URL);
    console.log('📤 Request data:', messageData);

    // ✅ ADD TIMEOUT to prevent 110-second hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45-second timeout

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html, application/json, text/plain, */*'
      },
      body: JSON.stringify(messageData),
      signal: controller.signal // ✅ ADD timeout control
    });

    clearTimeout(timeoutId); // Clear timeout if request completes

    console.log('📥 Response received:', {
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

    // ✅ SIMPLIFIED: Process response without frontend image generation
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

    console.log('📤 Creating enhanced bot message:', {
      contentLength: aiResponse.length,
      isHTML: true,
      hasImages: botMessage.hasImages,
      contentPreview: aiResponse.substring(0, 100) + '...'
    });

    setMessages(prev => [...prev, botMessage]);

  } catch (error) {
    console.error('❌ Error sending enhanced message:', error);
    
    let errorMessage = 'Sorry, I\'m having trouble processing your request. ';
    
    if (error.name === 'AbortError') {
      errorMessage += 'The request timed out after 45 seconds. Please try a shorter query or check your connection.';
    } else if (error.message.includes('JSON')) {
      errorMessage += 'There was a formatting issue with the response.';
    } else if (error.message.includes('timeout')) {
      errorMessage += 'The request timed out. Please try a shorter query.';
    } else if (error.message.includes('404')) {
      errorMessage += 'The AI service is temporarily unavailable.';
    } else if (error.message.includes('500')) {
      errorMessage += 'There was a server error. Please try again.';
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

// 5. SIMPLIFY the processResponse function - remove frontend image generation
const processResponse = async (response, originalMessage = '') => {
  console.log('🔍 ===== UNIVERSAL RESPONSE PROCESSOR =====');
  console.log('Response status:', response.status);
  
  const contentType = response.headers.get('content-type') || '';
  console.log('Content-Type:', contentType);

  try {
    const rawText = await response.text();
    console.log('📥 Raw response length:', rawText.length);

    let finalHtml = '';

    // Process response (keep existing logic)
    if (rawText.includes('<iframe') && rawText.includes('srcdoc=')) {
      console.log('🎯 AUTO-DETECTED: Iframe wrapped HTML (n8n format)');
      
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
      console.log('🎯 AUTO-DETECTED: JSON format');
      try {
        const jsonData = JSON.parse(rawText);
        
        if (Array.isArray(jsonData)) {
          if (jsonData.length > 0) {
            const firstItem = jsonData[0];
            finalHtml = firstItem.output || firstItem.response || firstItem.content || firstItem.message || '';
          }
        } else if (typeof jsonData === 'object') {
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
        console.log('⚠️ JSON parsing failed:', jsonError.message);
        finalHtml = `<p>${rawText}</p>`;
      }
    }
    else if (rawText.includes('<h2>') || rawText.includes('<h3>') || rawText.includes('<p>')) {
      console.log('🎯 AUTO-DETECTED: Direct HTML format');
      finalHtml = rawText;
    }
    else {
      console.log('🎯 AUTO-DETECTED: Plain text format');
      const formattedText = rawText.replace(/\n/g, '<br>');
      finalHtml = `<p>${formattedText}</p>`;
    }

    // ✅ REMOVED: Frontend image generation logic
    // N8N response already includes molecular structures

    // Process escaped characters (keep existing logic)
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

    // Validate final content (keep existing logic)
    if (!finalHtml || finalHtml.trim().length < 3) {
      console.warn('⚠️ Final content is too short');
      return `<div style="padding: 12px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px;">
        <p><strong>Content Processing Issue</strong></p>
        <p>Processed response but content appears empty or too short.</p>
      </div>`;
    }

    // Enhanced final cleanup (keep existing logic)
    const preliminaryClean = finalHtml
      .replace(/^<!DOCTYPE[^>]*>/i, '')
      .replace(/^<html[^>]*>/i, '')
      .replace(/<\/html>$/i, '')
      .replace(/^<head>.*?<\/head>/is, '')
      .replace(/^<body[^>]*>/i, '')
      .replace(/<\/body>$/i, '')
      .trim();

    const cleanedHtml = cleanSpecialCharacters(preliminaryClean);

    console.log('✅ FINAL PROCESSED HTML:');
    console.log('   Length:', cleanedHtml.length);
    console.log('🔍 ===== END PROCESSOR =====');
    
    return cleanedHtml;

  } catch (error) {
    console.error('❌ CRITICAL ERROR in processor:', error);
    return `<div style="color: #dc2626; background: #fef2f2; padding: 12px; border-radius: 6px; border: 1px solid #fecaca;">
      <strong>Response Processing Error</strong><br/>
      ${error.message}
    </div>`;
  }
};

// ✅ KEEP all other existing functions unchanged:
// - detectImageRequirement() (for UI indicators)
// - extractCompoundName() (for UI indicators) 
// - cleanSpecialCharacters()
// - All styling and UI components
// - All feedback functionality
// - All download functionality
// - All other existing features