document.addEventListener('DOMContentLoaded', () => {
    console.log('[F-Browse] DOMContentLoaded');
    const listingGrid = document.querySelector('.listing-grid');
    const gigModalOverlay = document.getElementById('gigModal'); 
    const closeGigModalBtn = document.getElementById('closeGigModal');

    console.log('[F-Browse] listingGrid:', listingGrid);
    console.log('[F-Browse] gigModalOverlay (div#gigModal):', gigModalOverlay);
    console.log('[F-Browse] closeGigModalBtn:', closeGigModalBtn);

    if (!listingGrid) console.error('[F-Browse] CRITICAL: listingGrid not found!');
    if (!gigModalOverlay) console.error('[F-Browse] CRITICAL: gigModalOverlay (div#gigModal) not found!');
    if (!closeGigModalBtn) console.warn('[F-Browse] WARN: closeGigModalBtn not found.');

    const gigCoverImageEl = document.getElementById('gigCoverImage');
    const gigTitleEl = document.getElementById('gigTitle');
    const providerAvatarEl = document.getElementById('providerAvatar');
    const providerNameTextEl = document.getElementById('providerNameText');
    const gigDescriptionEl = document.getElementById('gigDescription');
    const whatYouGetListEl = document.getElementById('whatYouGetList');
    const toolsTechEl = document.getElementById('toolsTech');
    const gigPriceEl = document.getElementById('gigPrice');
    const priceUnitEl = document.getElementById('priceUnit');
    const gigDeliveryTimeEl = document.getElementById('gigDeliveryTime');
    const gigLanguagesEl = document.getElementById('gigLanguages');
    const gigOrderButton = document.getElementById('gigOrderButton');

    let currentDetailedListingData = null;
    let originalGigHTML = {};

    const API_BASE_URL = 'http://localhost:8080/api'; 

    function escapeHTML(str) {
        if (str === null || typeof str === 'undefined') return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function createListingCard(listing) {
        console.log('[F-Browse] createListingCard called for listing:', listing.id);
        const card = document.createElement('div');
        card.classList.add('listing-card');
        card.dataset.listingId = listing.id;

        const listingImageDiv = document.createElement('div');
        listingImageDiv.classList.add('listing-image');
        const img = document.createElement('img');
        img.src = escapeHTML(listing.coverImageUrl || '../assets/temp.png');
        img.alt = escapeHTML(listing.title);
        listingImageDiv.appendChild(img);
        card.appendChild(listingImageDiv);

        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const titleH2 = document.createElement('h2');
        titleH2.classList.add('card-title');
        titleH2.textContent = escapeHTML(listing.title);
        cardContent.appendChild(titleH2);

        const featuresDiv = document.createElement('div');
        featuresDiv.classList.add('card-features');
        if (listing.whatYouGet && listing.whatYouGet.length > 0) {
            listing.whatYouGet.slice(0, 2).forEach(featureText => {
                const feature = document.createElement('div');
                feature.classList.add('feature');
                const icon = document.createElement('i');
                icon.classList.add('fas', 'fa-check-circle', 'check-icon');
                feature.appendChild(icon);
                feature.appendChild(document.createTextNode(' ' + escapeHTML(featureText)));
                featuresDiv.appendChild(feature);
            });
        } else {
            const feature = document.createElement('div');
            feature.classList.add('feature');
            feature.textContent = 'No specific features listed.';
            featuresDiv.appendChild(feature);
        }
        cardContent.appendChild(featuresDiv);

        const providerDiv = document.createElement('div');
        providerDiv.classList.add('card-provider');
        const providerSpan = document.createElement('span');
        providerSpan.textContent = `by ${escapeHTML(listing.userDisplayName || 'Unknown User')}`;
        providerDiv.appendChild(providerSpan);
        cardContent.appendChild(providerDiv);

        const cardFooter = document.createElement('div');
        cardFooter.classList.add('card-footer');

        const priceDiv = document.createElement('div');
        priceDiv.classList.add('card-price');
        let priceText = 'Price not set';
        if (listing.price !== null) {
            const formattedPrice = Number(listing.price).toFixed(2);
            if (listing.isPerHourPricing) {
                priceText = `$${formattedPrice} / hour`;
            } else if (listing.isPriceFixed) {
                priceText = `$${formattedPrice} / each`;
            } else {
                 priceText = `$${formattedPrice}`;
            }
        }
        priceDiv.textContent = escapeHTML(priceText);
        cardFooter.appendChild(priceDiv);

        cardContent.appendChild(cardFooter);
        card.appendChild(cardContent);

        card.addEventListener('click', (event) => {
            console.log('[F-Browse] Card clicked! Listing ID:', listing.id, 'Event target:', event.target);
            event.stopPropagation();
            handleCardClick(listing.id); 
        });
        console.log('[F-Browse] Event listener attached to card for listing ID:', listing.id);
        return card;
    }

    async function fetchListingDetails(listingId) {
        console.log('[F-Browse] fetchListingDetails for ID:', listingId);
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            const response = await fetch(`${API_BASE_URL}/listings/${listingId}`, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('[F-Browse] Fetched details:', data);
            return data;
        } catch (error) {
            console.error(`[F-Browse] Could not fetch details for listing ${listingId}:`, error);
            return null;
        }
    }

    function populateAndShowGigModal(detailedListing) {
        console.log('[F-Browse] populateAndShowGigModal called with:', detailedListing);
        if (!detailedListing || !gigModalOverlay) {
            console.error("Missing listing data or modal overlay for populateAndShowGigModal.");
            if (gigModalOverlay) gigModalOverlay.classList.remove('active'); 
            document.body.style.overflow = '';
            return;
        }

        currentDetailedListingData = detailedListing;

        gigCoverImageEl.src = escapeHTML(detailedListing.coverImageUrl || '../assets/temp.png');
        gigTitleEl.textContent = escapeHTML(detailedListing.title || 'N/A');
        providerAvatarEl.src = escapeHTML(detailedListing.userProfilePictureUrl || '../assets/temp.png');
        providerNameTextEl.textContent = escapeHTML(detailedListing.userDisplayName || 'Unknown User');
        gigDescriptionEl.innerHTML = detailedListing.description ? escapeHTML(detailedListing.description).replace(/\n/g, '<br>') : 'No description provided.';

        whatYouGetListEl.innerHTML = '';
        if (detailedListing.whatYouGet && detailedListing.whatYouGet.length > 0) {
            detailedListing.whatYouGet.forEach(item => {
                const li = document.createElement('li');
                const icon = document.createElement('i');
                icon.className = 'fas fa-check-circle';
                li.appendChild(icon);
                li.appendChild(document.createTextNode(' ' + escapeHTML(item)));
                whatYouGetListEl.appendChild(li);
            });
        } else {
            whatYouGetListEl.innerHTML = '<li>No specific offerings listed.</li>';
        }

        toolsTechEl.textContent = Array.isArray(detailedListing.toolsAndTechnology) ?
            detailedListing.toolsAndTechnology.map(escapeHTML).join(', ') :
            escapeHTML(detailedListing.toolsAndTechnology || 'N/A');

        if (detailedListing.price !== null) {
            const formattedPrice = Number(detailedListing.price).toFixed(2);
            gigPriceEl.textContent = `$${formattedPrice}`;
            if (detailedListing.isPerHourPricing) {
                priceUnitEl.textContent = '/ hour';
            } else if (detailedListing.isPriceFixed) {
                priceUnitEl.textContent = '/ each';
            } else {
                priceUnitEl.textContent = '';
            }
        } else {
            gigPriceEl.textContent = 'Price not set';
            priceUnitEl.textContent = '';
        }

        gigDeliveryTimeEl.textContent = detailedListing.deliveryTimeDays ? `${escapeHTML(detailedListing.deliveryTimeDays.toString())} days` : 'N/A';
        gigLanguagesEl.textContent = Array.isArray(detailedListing.languages) ?
            detailedListing.languages.map(escapeHTML).join(', ') :
            escapeHTML(detailedListing.languages || 'N/A');

        const orderButton = document.getElementById('gigOrderButton');
        if (orderButton) {
            const newOrderButton = orderButton.cloneNode(true);
            orderButton.parentNode.replaceChild(newOrderButton, orderButton);
            newOrderButton.addEventListener('click', function(e) {
                e.preventDefault();
                toggleBidForm(true);
            });
        }

        gigModalOverlay.classList.add('active'); 
        document.body.style.overflow = 'hidden';
        console.log("[F-Browse] Modal overlay class 'active' added. Overlay display:", window.getComputedStyle(gigModalOverlay).display, "Overlay opacity:", window.getComputedStyle(gigModalOverlay).opacity);

        const innerModal = gigModalOverlay.querySelector('.gig-modal');
        if (innerModal) {
            const computedStyle = window.getComputedStyle(innerModal);
            console.log('[F-Browse] Inner .gig-modal computed - width:', computedStyle.width, 'height:', computedStyle.height, 'display:', computedStyle.display, 'visibility:', computedStyle.visibility, 'opacity:', computedStyle.opacity, 'transform:', computedStyle.transform);
        } else {
            console.error('[F-Browse] .gig-modal (inner content box) not found inside overlay!');
        }
    }

    function toggleBidForm(showBidForm = true) {
        console.log('[F-Browse] toggleBidForm called, showBidForm:', showBidForm);
        if (!gigModalOverlay || !currentDetailedListingData) return;
        
        const detailsCol = gigModalOverlay.querySelector('.gig-details-column');
        const sidebarCol = gigModalOverlay.querySelector('.gig-sidebar-column');
        
        if (!detailsCol || !sidebarCol) {
            console.error('[F-Browse] Cannot find details or sidebar column');
            return;
        }

        if (showBidForm) {
            originalGigHTML = {
                details: detailsCol.innerHTML,
                sidebar: sidebarCol.innerHTML
            };

            const listing = currentDetailedListingData;
            const title = escapeHTML(listing.title);
            const priceNum = Number(listing.price).toFixed(2);
            const priceStr = `$${priceNum}`;
            const typeStr = listing.isPerHourPricing ? '/ hour' : '/ each';

            gigModalOverlay.classList.add('order-mode');
            
            detailsCol.innerHTML = `
                <div class="order-form">
                    <div class="order-header">
                        <button class="back-to-gig" id="backToGigBtn">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h1 class="order-title">Bid on: ${title}</h1>
                    </div>
                    
                    <h2>Your Bid</h2>
                    
                    <div class="price-proposal-section">
                        <div class="form-group">
                            <label for="requestedPrice">Your Bid Amount</label>
                            <div class="price-input-wrapper">
                                <span class="currency-symbol">$</span>
                                <input type="number" id="requestedPrice" name="requestedPrice" value="${listing.price}" min="1" step="0.01" required>
                            </div>
                            <div class="price-hint">
                                <span>Original listed price: ${priceStr} ${typeStr}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="requestMessage">Message</label>
                        <textarea id="requestMessage" name="requestMessage" rows="5" placeholder="Introduce yourself and explain why you're the best fit for this job. Include any questions about the project details."></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Attachments</label>
                        <div class="file-upload-area" id="fileUploadArea">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Drag & drop files here</p>
                            <p>or <span class="browse-files">browse files</span></p>
                            <p class="file-hint">Upload examples of similar work or credentials (max 5MB each)</p>
                        </div>
                        <div class="uploaded-files" id="uploadedFiles"></div>
                    </div>
                </div>
            `;
            
            sidebarCol.innerHTML = `
                <div class="gig-sidebar">
                    <div class="price-section">
                        <div class="price-title">Bid Summary</div>
                        <div class="price-value" id="summaryPrice">${priceStr}</div>
                        <div class="price-unit" id="summaryPriceUnit">${typeStr}</div>
                        
                        <div class="price-includes">
                            <div>Your bid includes:</div>
                            <ul>
                                <li><i class="fas fa-check-circle"></i> Your proposal message</li>
                                <li><i class="fas fa-check-circle"></i> Any attached files</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div class="action-buttons">
                        <button class="order-button" id="submitBidBtn">
                            <span>Submit Bid</span>
                        </button>
                        <button class="contact-button" id="cancelBidBtn">
                            Cancel
                        </button>
                    </div>
                </div>
            `;
            
            const backBtn = document.getElementById('backToGigBtn');
            const cancelBtn = document.getElementById('cancelBidBtn');
            const submitBtn = document.getElementById('submitBidBtn');
            const requestedPrice = document.getElementById('requestedPrice');
            
            if (backBtn) backBtn.addEventListener('click', () => toggleBidForm(false));
            if (cancelBtn) cancelBtn.addEventListener('click', () => toggleBidForm(false));
            if (submitBtn) {
                submitBtn.addEventListener('click', handleBidSubmission);
            }
            
            if (requestedPrice) {
                requestedPrice.addEventListener('input', function() {
                    const summaryPrice = document.getElementById('summaryPrice');
                    if (summaryPrice) {
                        const newPrice = parseFloat(this.value).toFixed(2);
                        summaryPrice.textContent = `$${newPrice}`;
                        
                        const originalPrice = parseFloat(listing.price);
                        if (parseFloat(newPrice) !== originalPrice) {
                            this.classList.add('price-changed');
                            summaryPrice.classList.add('price-changed');
                        } else {
                            this.classList.remove('price-changed');
                            summaryPrice.classList.remove('price-changed');
                        }
                    }
                });
            }
            
            setupFileUpload();
            
        } else {
            gigModalOverlay.classList.remove('order-mode');
            
            if (originalGigHTML.details) {
                detailsCol.innerHTML = originalGigHTML.details;
            }
            if (originalGigHTML.sidebar) {
                sidebarCol.innerHTML = originalGigHTML.sidebar;
            }
            
            const orderButton = document.getElementById('gigOrderButton');
            if (orderButton) {
                const newOrderButton = orderButton.cloneNode(true);
                orderButton.parentNode.replaceChild(newOrderButton, orderButton);
                newOrderButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    toggleBidForm(true);
                });
            }
        }
    }

    function setupFileUpload() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const uploadedFiles = document.getElementById('uploadedFiles');
        
        if (!fileUploadArea || !uploadedFiles) return;
        
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        fileInput.id = 'fileInput';
        document.body.appendChild(fileInput);
        
        fileUploadArea.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            handleFiles(this.files);
        });
        
        fileUploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        fileUploadArea.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        fileUploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            handleFiles(e.dataTransfer.files);
        });
    }
    
    function handleFiles(files) {
        const uploadedFiles = document.getElementById('uploadedFiles');
        if (!uploadedFiles) return;
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileSize = formatFileSize(file.size);
            const fileExtension = file.name.split('.').pop().toLowerCase();
            
            const fileItem = document.createElement('div');
            fileItem.className = 'uploaded-file';
            
            let iconClass = 'fa-file';
            if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(fileExtension)) {
                iconClass = 'fa-file-image';
            } else if (['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(fileExtension)) {
                iconClass = 'fa-file-alt';
            } else if (['xls', 'xlsx', 'csv'].includes(fileExtension)) {
                iconClass = 'fa-file-excel';
            } else if (['zip', 'rar', '7z'].includes(fileExtension)) {
                iconClass = 'fa-file-archive';
            }
            
            fileItem.innerHTML = `
                <i class="fas ${iconClass}"></i>
                <span>${file.name}</span>
                <span class="file-size">${fileSize}</span>
                <button type="button" class="remove-file" aria-label="Remove file">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            fileItem.querySelector('.remove-file').addEventListener('click', function() {
                fileItem.remove();
            });
            
            uploadedFiles.appendChild(fileItem);
        }
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function handleBidSubmission() {
        const submitBtn = document.getElementById('submitBidBtn');
        const requestMessage = document.getElementById('requestMessage');
        const requestedPrice = document.getElementById('requestedPrice');
        
        if (!submitBtn || !requestMessage || !requestedPrice || !currentDetailedListingData) {
            console.error('[F-Browse] Missing elements for bid submission');
            return;
        }
        
        if (!requestMessage.value.trim()) {
            alert('Please include a message with your bid.');
            return;
        }
        
        if (!requestedPrice.value || parseFloat(requestedPrice.value) <= 0) {
            alert('Please enter a valid bid amount.');
            return;
        }
        
        submitBtn.classList.add('processing');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin spinner"></i> Submitting...';
        
        const bidData = {
            listingId: currentDetailedListingData.id,
            message: requestMessage.value,
            bidAmount: parseFloat(requestedPrice.value)
        };
        
        console.log('[F-Browse] Submitting bid:', bidData);
        
        setTimeout(() => {
            submitBtn.classList.remove('processing');
            submitBtn.classList.add('success');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Bid Submitted!';
            
            setTimeout(() => {
                alert('Your bid has been submitted successfully!');
                toggleBidForm(false); 
            }, 1500);
        }, 1500);
    }

    async function handleCardClick(listingId) {
        console.log('[F-Browse] handleCardClick for listing ID:', listingId);
        if (!gigModalOverlay) {
            console.error("GigModal overlay not found. Cannot open.");
            return;
        }
        console.log('[F-Browse] Attempting to show modal with loading state...');
        gigTitleEl.textContent = 'Loading...';
        gigDescriptionEl.textContent = 'Fetching details...';
        gigModalOverlay.classList.add('active');  
        document.body.style.overflow = 'hidden';
        console.log('[F-Browse] Added "active" class to modal overlay. Current classes:', gigModalOverlay.className);
        console.log('[F-Browse] Modal overlay display after adding class:', window.getComputedStyle(gigModalOverlay).display, "Opacity:", window.getComputedStyle(gigModalOverlay).opacity);

        const detailedListingData = await fetchListingDetails(listingId);
        if (detailedListingData) {
            console.log('[F-Browse] Detailed data fetched, populating modal.');
            populateAndShowGigModal(detailedListingData);
        } else {
            gigTitleEl.textContent = 'Error';
            gigDescriptionEl.textContent = 'Could not load listing details. Please try again later.';
            console.error("[F-Browse] Failed to load detailed listing data for modal.");
        }
    }

    function closeModal() {
        console.log('[F-Browse] closeModal called.');
        if (gigModalOverlay) {
            gigModalOverlay.classList.remove('active'); 
            gigModalOverlay.classList.remove('order-mode'); 
            document.body.style.overflow = '';
            console.log("[F-Browse] Modal overlay class 'active' removed.");
            gigTitleEl.textContent = 'Gig Title';
            gigDescriptionEl.textContent = 'Description loading...';
            gigCoverImageEl.src = '../assets/temp.png';
        }
    }
    
    if (closeGigModalBtn) {
        closeGigModalBtn.addEventListener('click', (event) => {
            console.log('[F-Browse] Close button clicked.');
            event.stopPropagation();
            closeModal();
        });
    }

    if (gigModalOverlay) {
        gigModalOverlay.addEventListener('click', (event) => {
            if (event.target === gigModalOverlay) {
                console.log('[F-Browse] Overlay clicked.');
                closeModal();
            }
        });
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && gigModalOverlay && gigModalOverlay.classList.contains('active')) {
            console.log('[F-Browse] Escape key pressed.');
            closeModal();
        }
    });

    async function fetchListings() {
        console.log('[F-Browse] fetchListings called.');
        try {
            const token = localStorage.getItem('authToken') || localStorage.getItem('accessToken');
            console.log('[F-Browse] Freelancer browse: Retrieved token:', token);

            const headers = { 'Content-Type': 'application/json' };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            } else {
                console.warn('[F-Browse] Freelancer browse: No access token found.');
                if (listingGrid) {
                    listingGrid.innerHTML = '<p>Authentication token not found. Please <a href="../auth/login.html">log in</a>.</p>';
                }
                return [];
            }

            const response = await fetch(`${API_BASE_URL}/listings`, { headers });
            console.log('[F-Browse] Fetch listings response status:', response.status);
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    console.error("[F-Browse] Freelancer browse: Unauthorized/Forbidden. Token:", token);
                    if (listingGrid) {
                        listingGrid.innerHTML = `<p>Error: Not authorized. (Status: ${response.status})</p>`;
                    }
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const listings = await response.json();
            console.log('[F-Browse] Listings fetched successfully:', listings.length, 'listings.');
            return listings;
        } catch (error) {
            console.error("[F-Browse] Freelancer browse: Could not fetch listings:", error);
            if (listingGrid && !listingGrid.innerHTML.includes("Error:")) {
                listingGrid.innerHTML = '<p>Error loading listings. Please try again later.</p>';
            }
            return [];
        }
    }

    function displayListings(listings) {
        console.log('[F-Browse] displayListings called with', listings.length, 'listings.');
        if (!listingGrid) {
            console.error('[F-Browse] Listing grid not found for displayListings');
            return;
        }
        listingGrid.innerHTML = '';

        if (!listings || listings.length === 0) {
            console.log('[F-Browse] No listings to display.');
            listingGrid.innerHTML = '<p>No listings found.</p>';
            return;
        }

        listings.forEach(listing => {
            const cardElement = createListingCard(listing);
            listingGrid.appendChild(cardElement);
        });
        console.log('[F-Browse] Finished appending listing cards to grid.');
    }

    async function init() {
        console.log('[F-Browse] Initializing freelancer browse page script...');
        if (!listingGrid) {
            console.error("[F-Browse] Critical: Listing grid not found on init!");
            return;
        }
        if (!gigModalOverlay) {
            console.warn("[F-Browse] Warning: Gig modal overlay element not found on init. Modal functionality will be affected.");
        }
        if (!gigCoverImageEl) console.warn("[F-Browse] WARN: gigCoverImageEl not found on init");
        if (!gigTitleEl) console.warn("[F-Browse] WARN: gigTitleEl not found on init");
        const listings = await fetchListings();
        displayListings(listings);
        console.log('[F-Browse] Freelancer browse script initialized. Listings displayed:', listings.length);
    }

    init();
});