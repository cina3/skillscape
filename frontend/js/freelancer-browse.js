document.addEventListener('DOMContentLoaded', () => {
  loadLayout();
  fetchListings();
  initializeModal();
});

let allListings = [];

let gigModalOverlay, gigCoverImage, gigTitle, gigDescription, gigPrice, priceUnit,
    closeGigModalButton, providerAvatar, providerNameText, whatYouGetList,
    toolsTech, gigDeliveryTime, gigLastDelivery, gigLanguages, 
    orderButtonModalEntryPoint, 
    contactButtonModalEntryPoint, 
    reviewsSectionInModal;

let projectDetailView, projectBidFormView;

let backToDetailsBtn, bidFormProjectTitle, bidAmountInput, bidDeliveryTimeInput, bidCoverLetterInput, submitBidBtn;
let bidSummaryProjectTitle, bidSummaryClientName, bidSummaryAmount, bidSummaryFee, bidSummaryTotal, bidSummaryDelivery;

let currentListingForBid = null;

function initializeModal() {
    gigModalOverlay = document.getElementById('gigModal');
    if (!gigModalOverlay) {
        console.error('Gig modal not found in HTML');
        return;
    }
    projectDetailView = document.getElementById('projectDetailView');
    gigCoverImage = document.getElementById('gigCoverImage');
    gigTitle = document.getElementById('gigTitle');
    gigDescription = document.getElementById('gigDescription');
    gigPrice = projectDetailView.querySelector('#gigPrice'); 
    priceUnit = projectDetailView.querySelector('#priceUnit'); 
    closeGigModalButton = document.getElementById('closeGigModal');
    providerAvatar = document.getElementById('providerAvatar');
    providerNameText = document.getElementById('providerName');
    whatYouGetList = document.getElementById('whatYouGetList');
    toolsTech = document.getElementById('toolsTech');
    gigDeliveryTime = document.getElementById('gigDeliveryTime');
    gigLastDelivery = document.getElementById('gigLastDelivery');
    gigLanguages = document.getElementById('gigLanguages');
    orderButtonModalEntryPoint = document.getElementById('orderButtonModalEntryPoint');
    contactButtonModalEntryPoint = document.getElementById('contactButtonModalEntryPoint');
    reviewsSectionInModal = projectDetailView.querySelector('.reviews-section');

    projectBidFormView = document.getElementById('projectBidFormView');
    backToDetailsBtn = document.getElementById('backToDetailsBtn');
    bidFormProjectTitle = document.getElementById('bidFormProjectTitle');
    bidAmountInput = document.getElementById('bidAmount');
    bidDeliveryTimeInput = document.getElementById('bidDeliveryTime');
    bidCoverLetterInput = document.getElementById('bidCoverLetter');
    submitBidBtn = document.getElementById('submitBidBtn');
    
    bidSummaryProjectTitle = document.getElementById('bidSummaryProjectTitle');
    bidSummaryClientName = document.getElementById('bidSummaryClientName');
    bidSummaryAmount = document.getElementById('bidSummaryAmount');
    bidSummaryFee = document.getElementById('bidSummaryFee');
    bidSummaryTotal = document.getElementById('bidSummaryTotal');
    bidSummaryDelivery = document.getElementById('bidSummaryDelivery');

    if (closeGigModalButton) {
        closeGigModalButton.addEventListener('click', closeProjectDetailModal);
    }
    gigModalOverlay.addEventListener('click', (event) => {
        if (event.target === gigModalOverlay) {
            closeProjectDetailModal();
        }
    });

    if (orderButtonModalEntryPoint) {
        orderButtonModalEntryPoint.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentListingForBid) {
                switchToBidFormView(currentListingForBid);
            }
        });
    }

    if (backToDetailsBtn) {
        backToDetailsBtn.addEventListener('click', switchToDetailsView);
    }

    if (submitBidBtn) {
        submitBidBtn.addEventListener('click', handleBidSubmission);
    }

    if (bidAmountInput) {
        bidAmountInput.addEventListener('input', updateBidSummary);
    }
    
    if (bidDeliveryTimeInput) {
        bidDeliveryTimeInput.addEventListener('input', updateBidSummary);
    }
}

function loadLayout() {
  fetch('../freelancer/header.html')
    .then(r => r.text()).then(html => {
      document.getElementById('header-placeholder').innerHTML = html;
      if (typeof initializeSearch === 'function') initializeSearch();
    }).catch(console.warn);

  fetch('../freelancer/hamburger-menu.html')
    .then(r => r.text()).then(html => {
      document.getElementById('hamburger-menu-placeholder').innerHTML = html;
      if (typeof initializeMenu === 'function') initializeMenu('browse.html');
    }).catch(console.warn);
}

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('authToken');
  opts.headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };
  return fetch(path, opts)
    .then(r => {
      if (!r.ok) throw new Error(`${r.status}: ${r.statusText}`);
      return r.json();
    });
}

async function fetchListings() {
  try {
    const data = await apiFetch('http://localhost:8080/api/listings');
    allListings = data.filter(l => l.status === 'ACTIVE');
    applyActiveCategoryFilter();
  } catch (e) {
    console.error('Failed to load listings', e);
    document.querySelector('.listing-grid').innerHTML = '<p class="error">Could not load projects.</p>';
  }
}

function renderListings(listings) {
  const grid = document.querySelector('.listing-grid');
  grid.innerHTML = '';
  if (!listings || !listings.length) {
    grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><h3>No projects found</h3><p>Try adjusting your filters or selected category.</p></div>';
    return;
  }

  listings.forEach(listing => {
    const title = listing.title || 'Untitled Project';
    let safeTitle = title;
    if (title.startsWith('http') && (title.includes('://') || title.includes('www.'))) {
      safeTitle = 'Project #' + (listing.id || Math.floor(Math.random() * 1000));
      console.warn('Project title appears to be a URL:', title);
    }

    let safeDescription = listing.description || 'No description provided.';
    if (safeDescription.startsWith('http') && (safeDescription.includes('://') || safeDescription.includes('www.'))) {
      safeDescription = 'This project requires a freelancer. Click to see details.';
      console.warn('Project description appears to be a URL');
    }
    
    const shortDesc = safeDescription.length > 100 ? 
                      safeDescription.substring(0, 97) + '...' : 
                      safeDescription;

    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <div class="listing-image">
          <img src="${listing.coverImageUrl || '../assets/temp.png'}" alt="${safeTitle}">
          ${listing.isFeatured ? '<div class="featured-badge">Featured</div>' : ''}
      </div>
      <div class="card-content">
          <h3 class="card-title">${safeTitle}</h3>
          <div class="card-features">
              <p class="feature-text">${shortDesc}</p>
          </div>
          ${listing.customer && listing.customer.username ? `
          <div class="card-provider">
              <i class="fas fa-user-circle" style="margin-right: 5px;"></i> Posted by: ${listing.customer.username}
          </div>` : ''}
      </div>
      <div class="card-footer">
          <div class="card-price-section">
              <span class="card-price">$${listing.price || 0}</span>
              <span class="price-type-badge">${listing.isPriceFixed ? 'Fixed Price' : (listing.priceType === 'HOURLY' ? 'Hourly' : 'Fixed')}</span>
          </div>
      </div>
    `;
    grid.appendChild(card);

    card.addEventListener('click', () => {
        openProjectDetailModal(listing);
    });
  });
}

function openProjectDetailModal(listing) {
    if (!gigModalOverlay || !projectDetailView || !projectBidFormView) return;

    currentListingForBid = listing;

    const title = listing.title || 'Untitled Project';
    let safeTitle = title;
    if (title.startsWith('http') && (title.includes('://') || title.includes('www.'))) {
      safeTitle = 'Project #' + (listing.id || Math.floor(Math.random() * 1000));
    }

    let safeDescription = listing.description || 'No description provided.';
    if (safeDescription.startsWith('http') && (safeDescription.includes('://') || safeDescription.includes('www.'))) {
      safeDescription = 'Project details will be discussed after initial contact.';
    }

    gigCoverImage.src = listing.coverImageUrl || '../assets/temp.png';
    gigTitle.textContent = safeTitle;
    gigDescription.textContent = safeDescription;
    
    gigPrice.textContent = `$${listing.price || '0'}`;
    priceUnit.textContent = listing.isPriceFixed ? 'Fixed Price' : (listing.priceType === 'HOURLY' ? '/hr' : 'Total');

    if (providerAvatar && providerNameText) {
        providerAvatar.src = listing.customer?.avatarUrl || '../assets/temp.png';
        providerNameText.textContent = listing.customer?.username || 'A Customer';
    }

    whatYouGetList.innerHTML = '';
    
    if (listing.requiredSkills && Array.isArray(listing.requiredSkills) && listing.requiredSkills.length > 0) {
        listing.requiredSkills.forEach(skill => {
            whatYouGetList.innerHTML += `<li><i class="fas fa-check-circle"></i> ${skill}</li>`;
        });
    } else {
        whatYouGetList.innerHTML = '<li><i class="fas fa-check-circle"></i> Details will be provided on request</li>';
    }

    toolsTech.textContent = listing.requiredSkills && Array.isArray(listing.requiredSkills) && listing.requiredSkills.length > 0 
        ? 'Skills: ' + listing.requiredSkills.join(', ') 
        : 'Not specified';
    
    if (reviewsSectionInModal) {
        reviewsSectionInModal.style.display = 'none';
    }

    gigDeliveryTime.textContent = listing.deadline ? new Date(listing.deadline).toLocaleDateString() : 'Not specified';
    gigLastDelivery.textContent = 'N/A';
    gigLanguages.textContent = listing.language || 'English';

    projectDetailView.style.display = 'flex';
    projectBidFormView.style.display = 'none';
    
    gigModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProjectDetailModal() {
    if (!gigModalOverlay) return;
    gigModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    currentListingForBid = null;
}

function switchToBidFormView(listing) {
    if (!projectDetailView || !projectBidFormView || !listing) return;

    projectDetailView.style.display = 'none';
    projectBidFormView.style.display = 'block';

    const title = listing.title || 'Untitled Project';
    let safeTitle = title;
    if (title.startsWith('http') && (title.includes('://') || title.includes('www.'))) {
      safeTitle = 'Project #' + (listing.id || Math.floor(Math.random() * 1000));
    }

    bidFormProjectTitle.textContent = safeTitle;
    bidAmountInput.value = listing.price || '';
    bidDeliveryTimeInput.value = '7';
    bidCoverLetterInput.value = '';
    
    bidSummaryProjectTitle.textContent = safeTitle;
    bidSummaryClientName.textContent = listing.customer?.username || 'Unknown Client';
    
    updateBidSummary();
}

function switchToDetailsView() {
    if (!projectDetailView || !projectBidFormView) return;

    projectBidFormView.style.display = 'none';
    projectDetailView.style.display = 'flex';
}

function updateBidSummary() {
    const bidAmount = parseFloat(bidAmountInput.value) || 0;
    const deliveryTime = parseInt(bidDeliveryTimeInput.value) || 0;
    
    const fee = bidAmount * 0.1;
    const total = bidAmount - fee;
    
    bidSummaryAmount.textContent = '$' + bidAmount.toFixed(2);
    bidSummaryFee.textContent = '-$' + fee.toFixed(2);
    bidSummaryTotal.textContent = '$' + total.toFixed(2);
    
    if (deliveryTime > 0) {
        const dayText = deliveryTime === 1 ? 'day' : 'days';
        bidSummaryDelivery.textContent = `${deliveryTime} ${dayText}`;
    } else {
        bidSummaryDelivery.textContent = 'Not specified';
    }
}

async function handleBidSubmission() {
    if (!currentListingForBid) {
        alert('Error: No project selected for bidding.');
        return;
    }

    const amount = parseFloat(bidAmountInput.value);
    const deliveryTime = parseInt(bidDeliveryTimeInput.value);
    const description = bidCoverLetterInput.value.trim();

    if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid bid amount.');
        bidAmountInput.focus();
        return;
    }
    
    if (isNaN(deliveryTime) || deliveryTime <= 0) {
        alert('Please enter a valid delivery time.');
        bidDeliveryTimeInput.focus();
        return;
    }
    
    if (!description) {
        alert('Please provide a cover letter or proposal.');
        bidCoverLetterInput.focus();
        return;
    }

    submitBidBtn.disabled = true;
    submitBidBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

    try {
        await placeBid(currentListingForBid.id, amount, description, deliveryTime);
        submitBidBtn.innerHTML = '<i class="fas fa-check"></i> Bid Placed Successfully!';
        submitBidBtn.classList.add('success');
        
        setTimeout(() => {
            closeProjectDetailModal();
        }, 1500);
    } catch (e) {
        submitBidBtn.innerHTML = 'Submit Bid';
        submitBidBtn.disabled = false;
        alert('Failed to place bid. Please try again.');
    }
}

async function placeBid(listingId, amount, description, deliveryTime) {
  try {
    const dto = { 
        listingId, 
        requestedPrice: amount, 
        description,
        estimatedDeliveryTime: deliveryTime 
    };
    await apiFetch(`http://localhost:8080/api/listings/${listingId}/bids`, {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  } catch (e) {
    console.error('Bid failed', e);
    throw e;
  }
}

function applyActiveCategoryFilter() {
    const activeCategoryItem = document.querySelector('.category-nav-item.active-category');
    if (!allListings) {
        console.warn("Listings not loaded yet for category filtering.");
        return;
    }

    if (activeCategoryItem) {
        const category = activeCategoryItem.dataset.category;
        const filtered = allListings.filter(listing => {
            const listingCategory = listing.category?.toLowerCase().replace(/_/g, '-') || '';
            return listingCategory === category;
        });
        renderListings(filtered);
    } else {
        renderListings(allListings);
    }
}
window.applyActiveCategoryFilter = applyActiveCategoryFilter;

window.applyFilters = function(newFilters) {
    console.log("Filters received in freelancer-browse.js:", newFilters);
    let filteredListings = allListings;

    const activeCategoryItem = document.querySelector('.category-nav-item.active-category');
    if (activeCategoryItem) {
        const category = activeCategoryItem.dataset.category;
        filteredListings = filteredListings.filter(listing => {
            const listingCategory = listing.category?.toLowerCase().replace(/_/g, '-') || '';
            return listingCategory === category;
        });
    }
    
    if (newFilters.price) {
        filteredListings = filteredListings.filter(l => l.price <= parseFloat(newFilters.price));
    }
    if (newFilters.priceType) {
        const isFixed = newFilters.priceType === 'Fixed Price';
        filteredListings = filteredListings.filter(l => (l.isPriceFixed !== undefined ? l.isPriceFixed : (l.priceType === 'FIXED')) === isFixed);
    }
    renderListings(filteredListings);
};