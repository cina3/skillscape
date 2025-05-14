let API_URL_BASE = "http://localhost:5001"; 

const AI_Module = {
  setApiUrl(newBaseUrl) {
    API_URL_BASE = newBaseUrl.replace(/\/$/, ""); 
    console.log(`AI API Base URL set to: ${API_URL_BASE}`);
    return this;
  },

  async checkConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const testUrl = `${API_URL_BASE}/test`;
      console.log(`Checking AI service connection at ${testUrl}`);
      
      const res = await fetch(testUrl, { 
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error(`AI service connection check failed with status: ${res.status} ${res.statusText}`);
        window.AITools?.displayAIMessage?.(`⚠️ AI service responded with error ${res.status}. Please check server logs.`);
        return false;
      }
      
      console.log("AI service /test endpoint is reachable and responded OK.");
      return true;
    } catch (err) {
      console.error("AI service connection check failed:", err);
      if (err.name === 'AbortError') {
        window.AITools?.displayAIMessage?.("⚠️ AI service connection timed out. Please ensure the AI server is running.");
      } else {
        window.AITools?.displayAIMessage?.("⚠️ Cannot connect to AI service: " + err.message + ". Check CORS and if server is running.");
      }
      return false;
    }
  },

  async ask(userPrompt, model = "google/gemini-2.0-flash-exp:free") {
    const chatUrl = `${API_URL_BASE}/chat`;  
    console.log(`Sending AI request to ${chatUrl}`, model);
    
    const chatInstance = window.aiChatInstance; 
    if (!chatInstance) {
        console.error("AIChat instance not found on window.aiChatInstance");
        window.AITools?.displayAIMessage?.("⚠️ Chat UI is not ready.");
        return;
    }

    try {
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        chatInstance.removeThinkingIndicator?.();
        chatInstance.removeTypingIndicator?.();
        return; 
      }
      
      const requestData = { prompt: userPrompt, model };
      console.log("Request data:", requestData);
      
      const response = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        chatInstance.removeThinkingIndicator?.();
        chatInstance.removeTypingIndicator?.();
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const fullText = data.reply || "";
      
      this._processSpecialTags(fullText);
      
      const cleanText = this._getCleanText(fullText);
      
      chatInstance.removeThinkingIndicator?.();
      chatInstance.removeTypingIndicator?.();
      this._fakeStreamText(cleanText, chatInstance);
      
    } catch (err) {
      console.error("AI API Error:", err);
      chatInstance.removeThinkingIndicator?.();
      chatInstance.removeTypingIndicator?.();
      chatInstance.addAIMessage("⚠️ Sorry, there was an error: " + err.message);
    }
  },
  
  _processSpecialTags(text) {
    if (!window.AITools) return;

    const explRegex = /<EXPL>([\s\S]*?)<\/EXPL>/gi;
    let match;
    let explContent = "";
    while ((match = explRegex.exec(text)) !== null) {
      const expl = match[1].trim();
      if (expl) {
        explContent += expl + "\n"; 
      }
    }
    if (explContent) {
      window.AITools.updateRequirementsText?.(explContent.trim());
    }

    const fileRegex = /<FILE>([\w.\-]+)<\/FILE(?:_NAME)?>/gi;
    let fileMatch;
    while ((fileMatch = fileRegex.exec(text)) !== null) {
      const fileName = fileMatch[1].trim();
      if (fileName) window.AITools.simulateFileUpload?.(fileName);
    }
  },
  
  _getCleanText(text) {
    return text
      .replace(/<EXPL>[\s\S]*?<\/EXPL>/gi, "")
      .replace(/<FILE>[\w.\-]+<\/FILE(?:_NAME)?>/gi, "")
      .trim();
  },
  
  async _fakeStreamText(text, chatInstance) {
    if (!chatInstance) return;
    
    chatInstance.createStreamMessageBubble();
    
    const chars = text.split('');
    const chunks = [];
    
    let currentChunk = "";
    let charsInCurrentChunk = 0;
    const maxCharsPerChunk = 8;
    
    for (let i = 0; i < chars.length; i++) {
      currentChunk += chars[i];
      charsInCurrentChunk++;
      
      const isEndOfSentence = ['.', '!', '?', '\n'].includes(chars[i]);
      const isMaxSize = charsInCurrentChunk >= maxCharsPerChunk;
      
      if (isEndOfSentence || isMaxSize || i === chars.length - 1) {
        chunks.push(currentChunk);
        currentChunk = "";
        charsInCurrentChunk = 0;
      }
    }
    
    let accumulator = "";
    for (const chunk of chunks) {
      accumulator += chunk;
      chatInstance.appendToStreamMessage(chunk);
      
      let delay = 30; 
      
      if (chunk.includes('\n')) delay += 200;  
      if (['.', '!', '?'].some(p => chunk.includes(p))) delay += 150; 
      if ([',', ';', ':'].some(p => chunk.includes(p))) delay += 80;  
      
      delay += Math.floor(Math.random() * 70);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    chatInstance.finalizeStreamMessage(text);
  },

  _handleAIReply(text, isStreamed = false) {
    this._processSpecialTags(text);
    const clean = this._getCleanText(text);
    
    if (!isStreamed && clean) {
      const chatInstance = window.aiChatInstance;
      if (chatInstance) {
        chatInstance.addAIMessage(clean);
      } else {
        window.AITools?.displayAIMessage?.(clean);
      }
    }
  }
};

window.AI_Module = AI_Module;
console.log("ai.js loaded successfully – AI_Module.ask(...) is ready to use for streaming.");

window.testAIRequest = function(prompt = "Hello, can you help me explain my project requirements?", model) {
  console.log("Testing AI request with prompt:", prompt, "Model:", model || "default");
  AI_Module.ask(prompt, model); 
};

window.setAIPort = function(port = 5001) { 
  AI_Module.setApiUrl(`http://localhost:${port}`);
  console.log(`AI API Base URL set to: http://localhost:${port}`);
  return "You can now test the AI with this port using testAIRequest()";
};

const currentPort = new URL(API_URL_BASE).port || 5001;
setAIPort(currentPort); 

console.log("You can test the AI by typing: testAIRequest('your test message', 'model_id_if_not_default') in the console");
console.log(`If the AI service is running on a different port, use: setAIPort(newPort) to change it. Currently: ${API_URL_BASE}`);