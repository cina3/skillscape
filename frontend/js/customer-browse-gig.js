document.addEventListener('DOMContentLoaded', () => {
  if (typeof initializeMessageBox === 'function') {
    initializeMessageBox();
  }

  const modal           = document.getElementById('gigModal');
  const closeBtn        = document.getElementById('closeGigModal');
  const API_BASE_URL    = 'http://localhost:8080/api';
  const ORDERS_ENDPOINT = `${API_BASE_URL}/orders`;
  const TOKEN           = localStorage.getItem('authToken') || localStorage.getItem('token');
  let orderButtonClickHandler = null; 
  let orderSpecificStylesInjected = false; c
  window.aiChatInstance = null; 

  window.AITools = {
    displayAIMessage: function(text) {
      if (window.aiChatInstance && typeof window.aiChatInstance.addAIMessage === 'function') {
        window.aiChatInstance.removeTypingIndicator?.(); 
        window.aiChatInstance.removeThinkingIndicator?.();
        window.aiChatInstance.show(); 
        window.aiChatInstance.addAIMessage(text);
      } else {
        console.warn('AI Chat instance or addAIMessage method not available.');
      }
    },
    simulateFileUpload: function(fileName) {
      const list = document.getElementById('uploadedFiles');
      if (!list) {
        console.warn('Uploaded files container (uploadedFiles) not found.');
        return;
      }
      if (list.children.length >= 5) {
        errorMessage('Maximum 5 files allowed for simulation.');
        return;
      }

      const size = Math.floor(Math.random() * 5120) + 1; 
      const sizeStr = size < 1024 
        ? `${size} B` 
        : `${(size / 1024).toFixed(1)} KB`;

      const div = document.createElement('div');
      div.className = 'uploaded-file';
      div.dataset.filename = fileName;
      div.innerHTML = `
        <i class="fas fa-file-alt"></i>
        <span>${escapeHTML(fileName)}</span>
        <span class="file-size">${sizeStr}</span>
        <button class="remove-file" title="Remove file"><i class="fas fa-times"></i></button>
      `;
      
      div.querySelector('.remove-file').addEventListener('click', () => div.remove());
      list.appendChild(div);
      console.log(`AITools: Simulated upload of ${fileName} (${sizeStr})`);
    },
    updateRequirementsText: function(text) {
      const textarea = document.getElementById('orderDescription');
      if (textarea) {
        let cleanedText = text.replace(/\*\*/g, '');
        
        cleanedText = cleanedText.replace(/^[\*\-\+\•]\s*/gm, ''); 
        
        cleanedText = cleanedText.replace(/\n{3,}/g, "\n\n");
        
        cleanedText = cleanedText.trim();
          
        textarea.value = cleanedText; 
        textarea.dispatchEvent(new Event('input')); 
        textarea.classList.add('flash-update');
        
        textarea.style.borderColor = "var(--brand-blue)";
        setTimeout(() => {
          textarea.classList.remove('flash-update');
          textarea.style.borderColor = "";
        }, 1500);
        
        console.log(`AITools: Updated requirements text to: "${cleanedText}"`);
      } else {
        console.warn('Order description textarea (orderDescription) not found.');
      }
    }
  };

  loadAIChatComponent();

  if (closeBtn) closeBtn.addEventListener('click', closeGigModal);
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeGigModal();
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) closeGigModal();
  });

  function closeGigModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      modal.querySelector('.gig-modal')?.scrollTo(0, 0);
      if (modal.classList.contains('order-mode')) toggleOrderMode(false);
    }, 300);
  }

  function stars(score) {
    const full  = '★'.repeat(score);
    const empty = '☆'.repeat(5 - score);
    return full + empty;
  }

  function escapeHTML(str = '') {
    return str.toString()
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatRelativeTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `About ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `About ${hours} hour${hours > 1 ? 's' : ''} ago`;
    
    const days = Math.floor(hours / 24);
    if (days < 30) return `About ${days} day${days > 1 ? 's' : ''} ago`;

    const months = Math.floor(days / 30);
    if (months < 12) return `About ${months} month${months > 1 ? 's' : ''} ago`;

    const years = Math.floor(months / 12);
    return `About ${years} year${years > 1 ? 's' : ''} ago`;
  }

  async function loadReviews(gigId) {
    const listEl   = modal.querySelector('.reviews-list');
    const ratingEl = document.getElementById('ratingValue');
    const countEl  = document.getElementById('reviewCount');
    const totalEl  = document.getElementById('totalReviewCount');
    const starsBox = modal.querySelector('.rating-stars');
    if (!listEl || !ratingEl || !countEl || !totalEl || !starsBox) {
        console.error('One or more review elements not found in modal.');
        return;
    }

    listEl.innerHTML     = '<p class="loading">Loading reviews…</p>';

    try {
      const headers = TOKEN ? { 'Authorization': `Bearer ${TOKEN}` } : {};
      const res     = await fetch(`${API_BASE_URL}/reviews/gig/${gigId}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const reviews = await res.json();
      if (reviews.length === 0) {
        listEl.innerHTML = '<p class="no-reviews">No reviews yet. Be the first!</p>';
        return;
      }

      const sum = reviews.reduce((acc, r) => acc + (r.score || 0), 0);
      const avg = (sum / reviews.length).toFixed(1);

      ratingEl.textContent = avg;
      countEl.textContent  = `(${reviews.length} review${reviews.length !== 1 ? 's' : ''})`;
      totalEl.textContent  = reviews.length;
      starsBox.innerHTML   = stars(Math.round(avg));

      listEl.innerHTML = reviews.map(r => `
        <div class="review-item">
          <div class="review-header">
            <img src="../assets/temp.png" alt="Avatar" class="reviewer-avatar">
            <div class="reviewer-info">
              <div class="reviewer-name">${escapeHTML(r.userDisplayName)}</div>
              <div class="review-date">${new Date(r.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="review-rating">${stars(r.score)}</div>
          </div>
          <div class="review-content">
            ${r.comment ? escapeHTML(r.comment) : '<em>No comment provided.</em>'}
          </div>
        </div>
      `).join('');

    } catch (err) {
      console.error('Failed to load reviews:', err);
      listEl.innerHTML = '<p class="error">Could not load reviews.</p>';
    }
  }

  function loadAIChatComponent() {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    iframe.onload = function() {
      try {
        const template = iframe.contentDocument.getElementById('ai-chat-template');
        if (template) {
          const importedNode = document.importNode(template, true);
          document.body.appendChild(importedNode);
          
          const scriptContent = Array.from(iframe.contentDocument.querySelectorAll('script'))
            .map(script => script.textContent)
            .join('\n');
          
          const script = document.createElement('script');
          script.textContent = scriptContent;
          document.body.appendChild(script);
          
          const styleContent = Array.from(iframe.contentDocument.querySelectorAll('style'))
            .map(style => style.textContent)
            .join('\n');
          
          const style = document.createElement('style');
          style.textContent = styleContent;
          document.head.appendChild(style);
          
          console.log('AI Chat component loaded successfully');
          
          if (typeof AIChat === 'function') {
            window.aiChatInstance = new AIChat({ 
              parent: document.body,
              onClose: function() {},
              onUserSend: function(message) {
                console.log("AI Chat: User sending message - ", message);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error importing AI Chat component:', error);
      } finally {
        document.body.removeChild(iframe);
      }
    };
    
    iframe.src = '../components/ai-chat.html';
  }

  function toggleOrderMode(showOrderForm = true) {
    if (!modal) return;
    const detailsCol = modal.querySelector('.gig-details-column');
    const sidebarCol = modal.querySelector('.gig-sidebar-column');

    if (showOrderForm) {
      window.originalGigHTML = {
        details: detailsCol.innerHTML,
        sidebar: sidebarCol.innerHTML
      };

      const gig      = window.currentGigData;
      const title    = escapeHTML(gig.title);
      const priceNum = Number(gig.price).toFixed(2);
      const priceStr = `$${priceNum}`;
      const typeStr  = gig.perHourPricing ? '/ hour' : '/ each';
      const isNegotiable = !gig.priceFixed;

      modal.classList.add('order-mode');

      detailsCol.innerHTML = `
        <div class="order-form" style="animation:fadeIn 0.4s ease-out;max-width:95%;">
          <div class="order-header" style="display:flex;align-items:center;margin-bottom:25px;border-bottom:1px solid var(--border-color);padding-bottom:15px;">
            <button type="button" class="back-to-gig" aria-label="Back" style="background-color:white;border:1px solid var(--border-color);border-radius:50%;width:38px;height:38px;display:flex;justify-content:center;align-items:center;margin-right:15px;box-shadow:0 2px 5px rgba(0,0,0,0.05);transition:all 0.2s;cursor:pointer;">
              <i class="fas fa-arrow-left" style="color:var(--text-dark);transition:transform 0.2s;"></i>
            </button>
            <h1 class="order-title" style="margin:0;font-size:1.6rem;font-weight:600;color:var(--text-dark);">Place Your Order</h1>
          </div>
          
          <div class="gig-title-card" style="background-color:white;border-radius:12px;padding:20px;margin-bottom:25px;box-shadow:0 3px 12px rgba(0,0,0,0.08);border:1px solid var(--border-color);transition:all 0.25s;">
            <h2 style="margin:0;font-size:1.3rem;color:var(--text-dark);font-weight:600;">${title}</h2>
            <div style="display:flex;align-items:center;margin-top:12px;">
              <div style="width:32px;height:32px;border-radius:50%;overflow:hidden;margin-right:10px;background-color:#f1f1f1;flex-shrink:0;">
                <img src="${gig.providerAvatarUrl || '../assets/temp.png'}" alt="Provider" style="width:100%;height:100%;object-fit:cover;">
              </div>
              <span style="font-size:0.95rem;color:var(--text-muted);">${gig.userDisplayName || 'Service Provider'}</span>
            </div>
          </div>
          
          ${isNegotiable ? `
          <div class="form-group price-proposal-section" style="background:linear-gradient(to right, rgba(39,67,94,0.03), rgba(39,67,94,0.02));border-left:4px solid var(--brand-blue);border-radius:12px;padding:25px;margin-bottom:30px;box-shadow:0 2px 10px rgba(0,0,0,0.04);transition:all 0.3s;">
            <label for="requestedPrice" style="display:block;font-size:1.05rem;font-weight:500;margin-bottom:10px;color:var(--text-dark);">Propose Your Price <small style="opacity:0.7;">(This gig accepts price offers)</small></label>
            <div class="price-input-wrapper" style="max-width:250px;position:relative;transition:all 0.3s;">
              <span class="currency-symbol" style="position:absolute;left:15px;top:50%;transform:translateY(-50%);color:var(--text-dark);font-weight:500;z-index:2;transition:color 0.3s;">$</span>
              <input type="number" id="requestedPrice" min="1" step="0.01" value="${priceNum}" placeholder="Enter your price" style="width:100%;padding:12px 15px 12px 30px;border-radius:8px;border:1px solid var(--border-color);background-color:white;font-size:1.1rem;box-shadow:0 2px 6px rgba(0,0,0,0.05);transition:all 0.3s;">
            </div>
            <p class="price-hint" style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">Original price: ${priceStr}</p>
          </div>
          ` : ''}
          
          <div class="form-group" style="margin-bottom:30px;">
            <label for="orderDescription" style="display:block;font-size:1.05rem;font-weight:500;margin-bottom:10px;color:var(--text-dark);">Project Requirements</label>
            <textarea id="orderDescription" rows="5" placeholder="Describe your project requirements in detail..." style="width:100%;padding:15px;border-radius:12px;border:1px solid var(--border-color);background-color:white;font-size:1rem;box-shadow:0 2px 6px rgba(0,0,0,0.05);transition:all 0.3s;resize:vertical;min-height:120px;"></textarea>
            <div class="ai-button-wrapper" style="display:flex;justify-content:flex-end;margin-top:12px;margin-bottom:8px;gap:12px;">
              <button type="button" id="explainWithAI" class="explain-with-ai-button">
                <i class="fas fa-robot ai-icon"></i>
                <span>Explain with AI</span>
                <div class="shine-effect"></div>
              </button>
            </div>
            <p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">Be specific about what you need for best results.</p>
          </div>
          
          <div class="form-group" style="margin-bottom:30px;">
            <label style="display:block;font-size:1.05rem;font-weight:500;margin-bottom:10px;color:var(--text-dark);">Upload Files <small style="opacity:0.7;">(max 5 × 25MB)</small></label>
            <div id="fileUploadArea" class="file-upload-area" style="border:2px dashed var(--border-color);border-radius:12px;padding:35px 20px;text-align:center;transition:all 0.3s;background-color:rgba(255,255,255,0.7);cursor:pointer;margin-bottom:15px;">
              <i class="fas fa-cloud-upload-alt" style="font-size:2.5rem;color:var(--brand-blue);margin-bottom:15px;display:block;transition:transform 0.3s;"></i>
              <p style="margin:5px 0;color:var(--text-dark);font-size:1rem;">Drag & drop or <span class="browse-files" style="color:var(--brand-blue);text-decoration:underline;cursor:pointer;font-weight:500;transition:all 0.2s;">browse</span> files</p>
              <p style="margin:5px 0;color:var(--text-muted);font-size:0.85rem;">Attach mockups, examples or documentation</p>
              <input type="file" id="fileUpload" multiple style="display:none">
            </div>
            <div id="uploadedFiles" class="uploaded-files" style="margin-top:15px;display:grid;gap:10px;"></div>
          </div>
        </div>
      `;

      sidebarCol.innerHTML = `
        <div class="order-summary" style="background-color:white;border-radius:12px;padding:25px;box-shadow:0 3px 15px rgba(0,0,0,0.08);border:1px solid var(--border-color);position:sticky;top:20px;animation:fadeIn 0.5s ease-out;transition:all 0.3s;">
          <h3 style="margin-top:0;margin-bottom:20px;font-size:1.2rem;font-weight:600;color:var(--text-dark);border-bottom:1px solid var(--border-color);padding-bottom:15px;">Order Summary</h3>
          
          <div class="summary-line" style="display:flex;justify-content:space-between;margin-bottom:15px;font-size:0.95rem;">
            <span style="color:var(--text-muted);">Service</span>
            <span style="color:var(--text-dark);font-weight:500;text-align:right;max-width:60%;">${title.length > 20 ? title.substring(0, 20) + '...' : title}</span>
          </div>
          
          <div class="summary-line" style="display:flex;justify-content:space-between;margin-bottom:15px;font-size:0.95rem;">
            <span style="color:var(--text-muted);">Price</span>
            <div class="price-wrapper" style="position:relative;height:24px;overflow:hidden;">
              <span id="summaryPrice" class="animated-price" style="color:var(--text-dark);font-weight:500;transition:all 0.4s;display:block;">${priceStr}</span>
            </div>
          </div>
          
          <div class="summary-line" style="display:flex;justify-content:space-between;margin-bottom:15px;font-size:0.95rem;">
            <span style="color:var(--text-muted);">Type</span>
            <span id="summaryType" style="color:var(--text-dark);">${typeStr}</span>
          </div>
          
          <div class="summary-divider" style="height:1px;background-color:var(--border-color);margin:20px 0;"></div>
          
          <div class="summary-line total" style="display:flex;justify-content:space-between;margin-bottom:25px;font-size:1.1rem;position:relative;">
            <span style="color:var(--text-dark);font-weight:500;">Total</span>
            <div class="total-price-wrapper" style="position:relative;height:28px;overflow:hidden;">
              <span id="totalPrice" class="animated-price" style="color:var(--brand-blue);font-weight:600;transition:all 0.4s;display:block;">${priceStr}</span>
            </div>
          </div>
          
          <button type="button" class="order-confirm-button" style="width:100%;padding:14px;background:linear-gradient(135deg, var(--brand-blue), #1a5f9e);color:white;border:none;border-radius:8px;font-size:1.05rem;font-weight:500;cursor:pointer;transition:all 0.3s;box-shadow:0 4px 10px rgba(26,95,158,0.2);display:flex;justify-content:center;align-items:center;gap:8px;">
            ${isNegotiable ? '<i class="fas fa-paper-plane"></i> Send Offer' : '<i class="fas fa-check-circle"></i> Order Now'}
          </button>
          
          <div class="payment-info" style="margin-top:20px;font-size:0.85rem;color:var(--text-muted);display:flex;align-items:center;gap:10px;padding:12px;background-color:rgba(39,67,94,0.03);border-radius:8px;transition:all 0.3s;cursor:default;">
            <i class="fas fa-shield-alt" style="color:var(--brand-blue);font-size:1.1rem;"></i> 
            <span>Your payment is protected by our <a href="#" style="color:var(--brand-blue);text-decoration:none;font-weight:500;transition:all 0.2s;">Escrow Service</a></span>
          </div>
        </div>
      `;

      if (!orderSpecificStylesInjected) {
        document.head.insertAdjacentHTML('beforeend', `
          <style>
            .back-to-gig:hover { transform: translateX(-3px); border-color: var(--brand-blue); background-color: #f8faff; }
            .back-to-gig:hover i { transform: translateX(-2px); }
            .back-to-gig:active { transform: translateX(-3px) scale(0.96); }
            
            #requestedPrice:hover { border-color: var(--brand-blue); box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
            #requestedPrice:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(39,67,125,0.15); outline: none; }
            #orderDescription:hover { border-color: var(--brand-blue); box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
            #orderDescription:focus { border-color: var(--brand-blue); box-shadow: 0 0 0 3px rgba(39,67,125,0.15); outline: none; }
            
            .file-upload-area:hover { border-color: var(--brand-blue); background-color: #f8faff; transform: translateY(-2px); }
            .file-upload-area:hover i { transform: translateY(-5px); }
            .drag-over { border-color: var(--brand-blue) !important; background-color: #f0f7ff !important; box-shadow: 0 5px 15px rgba(39,67,125,0.1) !important; }
            
            .uploaded-file { display: flex; align-items: center; padding: 10px 15px; background-color: #f8faff; border: 1px solid var(--border-color); border-radius: 8px; transition: all 0.2s; }
            .uploaded-file:hover { background-color: white; box-shadow: 0 3px 8px rgba(0,0,0,0.08); transform: translateY(-1px); }
            .uploaded-file .fas { margin-right: 10px; color: var(--brand-blue); }
            .uploaded-file .file-size { margin-left: auto; color: var(--text-muted); font-size: 0.85rem; }
            .uploaded-file .remove-file { background: none; border: none; color: #d93025; opacity: 0.7; cursor: pointer; margin-left: 10px; transition: all 0.2s; }
            .uploaded-file .remove-file:hover { opacity: 1; transform: scale(1.15); }
            .uploaded-file .remove-file:active { transform: scale(0.9); }
            
            .order-confirm-button:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(26,95,158,0.25) !important; }
            .order-confirm-button:active { transform: translateY(-1px) scale(0.98); }
            .price-input-wrapper:hover .currency-symbol { color: var(--brand-blue); }
            .payment-info:hover { background-color: rgba(39,67,94,0.06); }
            .payment-info:hover i { transform: scale(1.1); }
            .payment-info i { transition: transform 0.2s; }
            
            .animated-price.slide-up { transform: translateY(-100%); opacity: 0; }
            .animated-price.slide-down { transform: translateY(100%); opacity: 0; }
            .price-changed#summaryPrice, .price-changed#totalPrice {
              color: #2e7d32 !important;
              font-weight: 700;
              transition: color 0.3s;
            }
            .price-changed.price-proposal-section { border-left-color: #2e7d32; background: linear-gradient(to right, rgba(46,125,50,0.05), rgba(46,125,50,0.01)); }
            .pulse-circle { display: none !important; }
            
            .browse-files:hover { text-decoration: none; }
            .payment-info a:hover { text-decoration: underline; }
            
            .gig-title-card:hover { box-shadow: 0 5px 15px rgba(0,0,0,0.1); transform: translateY(-2px); }
            .order-summary:hover { box-shadow: 0 5px 20px rgba(0,0,0,0.12); }
            
            .order-confirm-button.processing, .order-confirm-button.success { position: relative; }
            .order-confirm-button.processing { background: linear-gradient(135deg, #5c8eb9, #3c6e97); }
            .order-confirm-button.success { background: linear-gradient(135deg, #4caf50, #2e7d32); }
            .flash-success { animation: successPulse 1.5s; }
            @keyframes successPulse { 0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7); } 
                                    70% { box-shadow: 0 0 0 15px rgba(76, 175, 80, 0); } 
                                    100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); } }
            
            .ai-button-wrapper {
              gap: 15px;
              margin-top: 18px;
            }
            
            .explain-with-ai-button {
              position: relative;
              padding: 12px 22px;
              border: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 1rem;
              cursor: pointer;
              overflow: hidden;
              transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
              display: flex;
              align-items: center;
              gap: 12px;
              letter-spacing: 0.3px;
              background: linear-gradient(135deg, var(--brand-blue), #8b5cf6);
              color: white;
              box-shadow: 0 8px 20px rgba(39, 67, 94, 0.35), inset 0 -3px 0 rgba(0, 0, 0, 0.1);
              text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
            }
            
            .explain-with-ai-button:hover {
              transform: translateY(-4px) scale(1.02);
              box-shadow: 0 12px 24px rgba(39, 67, 94, 0.5), inset 0 -3px 0 rgba(0, 0, 0, 0.15);
              background: linear-gradient(135deg, #2b5079 10%, #7c3aed 100%);
              letter-spacing: 0.4px;
            }
            
            .explain-with-ai-button:active {
              transform: translateY(0) scale(0.98);
              transition-duration: 0.1s;
            }
            
            .explain-with-ai-button .ai-icon {
              font-size: 1.25rem;
              transform-origin: center;
              animation: pulse 2s infinite;
            }
            
            .shine-effect {
              position: absolute;
              top: 0;
              left: -100%;
              width: 60%;
              height: 100%;
              background: linear-gradient(
                90deg,
                rgba(255, 255, 255, 0) 0%,
                rgba(255, 255, 255, 0.4) 50%,
                rgba(255, 255, 255, 0) 100%
              );
              transform: skewX(-25deg);
              animation: shine 6s infinite;
            }
            
            @keyframes shine {
              0% { left: -100%; }
              15% { left: 200%; }
              100% { left: 200%; }
            }
            
            @keyframes pulse {
              0% { opacity: 0.8; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.1); }
              100% { opacity: 0.8; transform: scale(1); }
            }
            
            @keyframes flashTextarea {
              0% { box-shadow: 0 0 0 0 rgba(39, 67, 94, 0.7); }
              70% { box-shadow: 0 0 0 10px rgba(39, 67, 94, 0); }
              100% { box-shadow: 0 0 0 0 rgba(39, 67, 94, 0); }
            }
            
            .flash-update {
              animation: flashTextarea 1s ease-out;
              border-color: var(--brand-blue) !important;
            }
          </style>
        `);
        orderSpecificStylesInjected = true;
      }

      setupOrderFormListeners();

    } else {
      modal.classList.remove('order-mode');
      if (window.originalGigHTML && typeof window.originalGigHTML.details === 'string' && typeof window.originalGigHTML.sidebar === 'string') {
        detailsCol.innerHTML = window.originalGigHTML.details;
        sidebarCol.innerHTML = window.originalGigHTML.sidebar;
        populateGigModal(window.currentGigData);
      } else {
        console.warn("toggleOrderMode(false): originalGigHTML not available or invalid. Repopulating with current data.");
        populateGigModal(window.currentGigData);
      }
      if(window.currentGigData && window.currentGigData.id) {
        loadReviews(window.currentGigData.id);
      }
    }
  }

  function setupOrderFormListeners() {
    const backBtn = modal.querySelector('.back-to-gig');
    if (backBtn) {
      backBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleOrderMode(false);
        return false;
      };
    }

    const area = document.getElementById('fileUploadArea');
    const input = document.getElementById('fileUpload');
    const list = document.getElementById('uploadedFiles');
    
    if (area && input) {
      area.addEventListener('click', () => input.click());
      
      area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('drag-over');
      });
      
      area.addEventListener('dragleave', () => {
        area.classList.remove('drag-over');
      });
      
      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        if (e.dataTransfer?.files) {
          handleFileUpload(e.dataTransfer.files, list);
        }
      });
      
      input.addEventListener('change', e => handleFileUpload(e.target.files, list));
    }

    const confirmBtn = modal.querySelector('.order-confirm-button');
    const summaryPriceEl = document.getElementById('summaryPrice');
    const totalPriceEl = document.getElementById('totalPrice');
    const requestedInput = document.getElementById('requestedPrice');
    const priceSection = modal.querySelector('.price-proposal-section');
    const priceHint = modal.querySelector('.price-hint');

    if (requestedInput) {
      requestedInput.addEventListener('input', () => {
        const value = requestedInput.value;
        updatePriceDisplay(value);
      });
    }

    function updatePriceDisplay(value) {
      const v = Number(value);
      const originalPrice = Number(window.currentGigData.price);
      
      if (v > 0) {
        const priceStr = `$${v.toFixed(2)}`;
        const originalPriceStr = `$${originalPrice.toFixed(2)}`;
        
        if (summaryPriceEl) {
          animatePriceChange(summaryPriceEl, priceStr);
        }
        
        if (totalPriceEl) {
          animatePriceChange(totalPriceEl, priceStr);
        }
        
        if (v !== originalPrice) {
          if (priceSection) priceSection.classList.add('price-changed');
          if (confirmBtn) {
            confirmBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Custom Offer';
            confirmBtn.classList.add('price-changed');
          }
          if (priceHint) {
            priceHint.classList.add('price-changed');
            priceHint.innerHTML = `Original price: ${originalPriceStr} <i class="fas fa-arrow-right"></i> <strong>Your offer: ${priceStr}</strong>`;
          }
          if (summaryPriceEl) summaryPriceEl.classList.add('price-changed');
          if (totalPriceEl) totalPriceEl.classList.add('price-changed');
        } else {
          resetPriceChangeUI(originalPriceStr);
        }
      } else {
        resetPriceChangeUI(`$${originalPrice.toFixed(2)}`);
      }
    }

    function animatePriceChange(element, newPrice) {
      const clone = element.cloneNode(true);
      clone.classList.add('slide-up');
      element.parentNode.appendChild(clone);
      
      element.classList.add('slide-down');
      
      setTimeout(() => {
        element.textContent = newPrice;
        element.classList.remove('slide-down');
        
        setTimeout(() => {
          if (clone.parentNode) clone.parentNode.removeChild(clone);
        }, 300);
      }, 150);
    }

    function resetPriceChangeUI(originalPriceStr) {
      const isNegotiable = !window.currentGigData.priceFixed;
      
      if (summaryPriceEl) summaryPriceEl.classList.remove('price-changed');
      if (totalPriceEl) totalPriceEl.classList.remove('price-changed');
      
      if (confirmBtn) {
        confirmBtn.innerHTML = isNegotiable ? 
          '<i class="fas fa-paper-plane"></i> Send Offer' : 
          '<i class="fas fa-check-circle"></i> Order Now';
        confirmBtn.classList.remove('price-changed');
      }
      
      if (priceSection) priceSection.classList.remove('price-changed');
      if (priceHint) {
        priceHint.classList.remove('price-changed');
        priceHint.textContent = `Original price: ${originalPriceStr}`;
      }
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const gigId = window.currentGigData.id;
        const requirements = document.getElementById('orderDescription').value.trim();
        const uploadEls = document.querySelectorAll('.uploaded-file');
        const uploadUrls = Array.from(uploadEls).map(el => el.dataset.filename);
        const requested = requestedInput ? Number(requestedInput.value) : null;

        if (!requirements) {
          errorMessage('Please describe your requirements.');
          document.getElementById('orderDescription').focus();
          return;
        }

        const originalText = confirmBtn.textContent;
        confirmBtn.disabled = true;
        confirmBtn.classList.add('processing');
        confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin spinner"></i> Processing...';

        const payload = {
          gigId,
          requirements,
          uploadUrls,
          requestedPrice: requested
        };

        try {
          const res = await fetch(ORDERS_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(TOKEN && { 'Authorization': `Bearer ${TOKEN}` })
            },
            body: JSON.stringify(payload)
          });
          
          if (!res.ok) throw new Error(`Status ${res.status}`);
          
          confirmBtn.classList.remove('processing');
          confirmBtn.classList.add('success');
          confirmBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
          confirmBtn.classList.add('flash-success');
          
          successMessage('Order placed successfully!');
          
          setTimeout(() => {
            toggleOrderMode(false);
          }, 1500);
          
        } catch (err) {
          console.error('Order error:', err);
          
          confirmBtn.disabled = false;
          confirmBtn.classList.remove('processing');
          confirmBtn.textContent = originalText;
          
          errorMessage('Failed to place order. Please try again.');
        }
      });
    }

    const aiButton = document.getElementById('explainWithAI');
    if (aiButton) {
      aiButton.addEventListener('click', function() {
        const textarea = document.getElementById('orderDescription');
        
        if (textarea) {
          const currentText = textarea.value.trim();
          
          if (!window.aiChatInstance) { 
            if (typeof AIChat === 'function') {
              window.aiChatInstance = new AIChat({ 
                parent: document.querySelector('.gig-modal') || document.body,
                onClose: function() { },
                onUserSend: function(message) {
                  console.log("User sent message:", message);
                }
              });
            } else {
              console.error('AIChat class not available.');
              return;
            }
          }
          
          window.aiChatInstance.show();
          
          if (currentText) {
            window.aiChatInstance.addAIMessage(
              "I see you've already started writing requirements. You can copy them here or ask me to help you elaborate on them."
            );
          }
        }
      });
    }
  }

  function successMessage(message) {
    if (typeof window.showSuccessMessage === 'function') {
      window.showSuccessMessage(message);
    } else if (typeof errorMessage === 'function') {
      alert('Success: ' + message);
    } else {
      console.log('Success: ' + message);
      alert('Success: ' + message);
    }
  }
  
  function errorMessage(message) {
    if (typeof window.showErrorMessage === 'function') {
      window.showErrorMessage(message);
    } else {
      console.error('Error: ' + message);
      alert('Error: ' + message);
    }
  }

  function handleFileUpload(files, container) {
    if (!container) return;
    
    Array.from(files).forEach(file => {
      if (file.size > 25 * 1024 * 1024) {
        errorMessage(`${file.name} exceeds 25MB.`);
        return;
      }
      if (container.children.length >= 5) {
        errorMessage('Maximum 5 files allowed.');
        return;
      }
      
      const size = file.size;
      let sizeStr = '';
      if (size < 1024) {
        sizeStr = `${size} B`;
      } else if (size < 1024 * 1024) {
        sizeStr = `${(size / 1024).toFixed(1)} KB`;
      } else {
        sizeStr = `${(size / (1024 * 1024)).toFixed(1)} MB`;
      }
      
      const div = document.createElement('div');
      div.className = 'uploaded-file';
      div.dataset.filename = file.name;
      div.innerHTML = `
        <i class="fas fa-file"></i>
        <span>${escapeHTML(file.name)}</span>
        <span class="file-size">${sizeStr}</span>
        <button class="remove-file" title="Remove file"><i class="fas fa-times"></i></button>
      `;
      
      div.querySelector('.remove-file').addEventListener('click', () => div.remove());
      container.appendChild(div);
    });
  }

  window.openGigModal = gig => {
    if (!modal) {
        console.error("Modal element not found. Cannot open gig modal.");
        return;
    }
    window.currentGigData = gig;

    if (modal.classList.contains('order-mode')) {
        toggleOrderMode(false);
    } else {
        populateGigModal(gig);
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    const gigModalContent = modal.querySelector('.gig-modal');
    if (gigModalContent) {
        gigModalContent.scrollTo(0, 0);
    } else {
        modal.scrollTo(0,0);
    }
    
    loadReviews(gig.id);
  };

  function populateGigModal(gig) {
    if (!gig) {
        console.error("populateGigModal called with no gig data.");
        return;
    }
    const gigTitleEl = document.getElementById('gigTitle');
    const gigDescriptionEl = document.getElementById('gigDescription');
    const providerNameEl = document.getElementById('providerName');
    const gigPriceEl = document.getElementById('gigPrice');
    const priceUnitEl = document.getElementById('priceUnit');
    const gigCoverImageEl = document.getElementById('gigCoverImage');
    const providerAvatarEl = document.getElementById('providerAvatar');
    const ratingStarsContainer = modal.querySelector('.rating-stars');
    const ratingValueEl = document.getElementById('ratingValue');
    const reviewCountEl = document.getElementById('reviewCount');
    const totalReviewCountEl = document.getElementById('totalReviewCount');
    const gigLastDeliveryEl = document.getElementById('gigLastDelivery');

    const youGetEl = document.getElementById('whatYouGetList');
    if (youGetEl && Array.isArray(gig.whatYouGet)) {
      youGetEl.innerHTML = gig.whatYouGet
        .map(item => `<li><i class="fas fa-check-circle"></i><span class="feature-item-text">${escapeHTML(item)}</span></li>`)
        .join('');
    }

    const techEl = document.getElementById('toolsTech');
    if (techEl) {
      techEl.textContent = gig.toolsAndTechnology || 'N/A';
    }

    const langEl = document.getElementById('gigLanguages');
    if (langEl && Array.isArray(gig.languages)) {
      langEl.textContent = gig.languages.join(', ');
    }

    const dtEl = document.getElementById('gigDeliveryTime');
    if (dtEl) {
      if (gig.deliveryTimeDays != null) {
        dtEl.textContent = `${gig.deliveryTimeDays} day${gig.deliveryTimeDays !== 1 ? 's' : ''}`;
      } else {
        dtEl.textContent = 'N/A';
      }
    }

    if (gigLastDeliveryEl) {
      gigLastDeliveryEl.textContent = formatRelativeTime(gig.lastDeliveryAt);
    }

    if (gigTitleEl) gigTitleEl.textContent = gig.title || 'N/A';
    if (gigDescriptionEl) gigDescriptionEl.textContent = gig.description || 'No description available.';
    if (providerNameEl) providerNameEl.textContent = gig.userDisplayName || 'Unknown Seller';
    if (gigPriceEl) gigPriceEl.textContent = `$${Number(gig.price || 0).toFixed(2)}`;
    if (priceUnitEl) priceUnitEl.textContent = gig.isPerHourPricing ? '/ hour' : '/ each';
    if (gigCoverImageEl) gigCoverImageEl.src = gig.coverImageUrl || '../assets/temp.png';
    if (providerAvatarEl) providerAvatarEl.src = gig.providerAvatarUrl || '../assets/temp.png';

    const initialRating = parseFloat(gig.rating || 0);
    const initialReviewCount = parseInt(gig.reviewCount || 0, 10);

    if (ratingStarsContainer) updateStarRating(initialRating, ratingStarsContainer);
    if (ratingValueEl) ratingValueEl.textContent = initialRating.toFixed(1);
    if (reviewCountEl) reviewCountEl.textContent = `(${initialReviewCount} review${initialReviewCount !== 1 ? 's' : ''})`;
    if (totalReviewCountEl) totalReviewCountEl.textContent = initialReviewCount;
    
    const orderBtn = modal.querySelector('.order-button');
    if (orderBtn) {
        if (orderButtonClickHandler) {
            orderBtn.removeEventListener('click', orderButtonClickHandler);
        }
        orderButtonClickHandler = (e) => {
            e.preventDefault();
            toggleOrderMode(true);
        };
        orderBtn.addEventListener('click', orderButtonClickHandler);
    }
  }
  
  function updateStarRating(score, container) {
    if (!container) return;
    
    const roundedScore = Math.round(Number(score) || 0);
    
    const fullStars = '★'.repeat(roundedScore);
    const emptyStars = '☆'.repeat(5 - roundedScore);
    container.innerHTML = fullStars + emptyStars;
  }

  window.updateAIChatUI = function(message) {
    if (window.AITools && typeof window.AITools.displayAIMessage === 'function') {
      window.AITools.displayAIMessage(message);
    } else {
      console.warn('AITools.displayAIMessage not available for updateAIChatUI.');
    }
  };

  window.handleFileUpload = handleFileUpload;
});