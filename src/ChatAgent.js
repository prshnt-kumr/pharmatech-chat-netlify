// ============================================
// SIMPLIFIED CHATBOT - REMOVE REDUNDANT IMAGE LOGIC
// Let N8N handle ALL image generation
// ============================================

// 1. REMOVE these functions entirely:
// - detectImageRequirement()
// - generateMolecularImage()
// - getFallbackImageUrl()
// - All IMAGE_GENERATION_WEBHOOK logic

// 2. REPLACE the sendMessage function with this simplified version:

const sendMessage = async () => {
  if (!inputMessage.trim() || isLoading) return;

  // Check cooldown
  if (!checkCooldown()) {
    const errorMsg = {
      id: Date.now() + 1,
      type: 'bot',
      content: `Please wait ${formatTimeLeft(cooldownTimeLeft)} before sending another message.`,
      timestamp: new Date(),
      isError: true
    };
    setMessages(prev => [...prev, errorMsg]);
    return;
  }

  // Prevent duplicate requests
  if (window.requestInProgress) {
    console.log('🚫 Request already in progress, ignoring duplicate');
    return;
  }

  window.requestInProgress = true;

  const sessionId = getSessionId();
  const userId = `user_${Date.now()}`;
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
  setLastRequestTime(Date.now());

  try {
    // SIMPLIFIED: Just send the message, let N8N handle everything
    const messageData = {
      message: currentMessage,
      sessionId: sessionId,
      userId: userId,
      messageId: messageId,
      timestamp: new Date().toISOString()
      // ✅ REMOVED: imageRequirement (N8N Intent Classifier handles this)
    };

    console.log('📤 Sending simplified request to:', N8N_WEBHOOK_URL);

    // ✅ ADD TIMEOUT to prevent 110-second hangs
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/html, application/json, text/plain, */*'
      },
      body: JSON.stringify(messageData),
      signal: controller.signal // ✅ ADD TIMEOUT CONTROL
    });

    clearTimeout(timeoutId); // Clear timeout if request completes

    console.log('📥 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {        
      if (response.status === 500) {
        throw new Error(`Server error (500): The webhook encountered an internal error.`);
      } else if (response.status === 404) {
        throw new Error(`Webhook not found (404): Please verify your webhook URL.`);
      } else if (response.status === 405) {
        throw new Error(`Method not allowed (405): Please check webhook configuration.`);
      } else {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
    }

    // ✅ SIMPLIFIED: Just process the response (N8N includes images already)
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

    setMessages(prev => [...prev, botMessage]);

  } catch (error) {
    console.error('❌ Error sending message:', error);
    
    let errorMessage = 'Sorry, I\'m having trouble processing your request. ';
    
    if (error.name === 'AbortError') {
      errorMessage += 'The request timed out after 30 seconds. Please try a shorter query.';
    } else if (error.message.includes('JSON')) {
      errorMessage += 'There was a formatting issue with the response.';
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

// 3. REMOVE/SIMPLIFY the processResponse function:
// Remove all the image generation logic since N8N handles it

// 4. UPDATE loading indicator:
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

// 5. REMOVE these constants:
// const IMAGE_GENERATION_WEBHOOK = ...
// const isGeneratingImage state
// All fallback image logic