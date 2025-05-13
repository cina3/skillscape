document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = '../login.html';
    return;
  }

  fetchUserListings();

  document.querySelector('.orders-grid').addEventListener('click', handleOrdersGridClick);
});

async function fetchUserListings() {
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:8080/api/listings/my', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error fetching listings. Status: ${response.status}, Response: ${errorText}`);
      throw new Error(`Failed to fetch listings (Status: ${response.status})`);
    }

    const listings = await response.json();
    console.log('Fetched listings data:', JSON.stringify(listings, null, 2)); 
    renderListings(listings);
  } catch (error) {
    console.error('Error in fetchUserListings catch block:', error);
    const ordersGrid = document.querySelector('.orders-grid');
    ordersGrid.innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-circle fa-3x"></i>
        <h3>Error loading listings</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function renderListings(listings) {
  const ordersGrid = document.querySelector('.orders-grid');
  
  ordersGrid.innerHTML = '';
  
  if (!listings || listings.length === 0) {
    console.log('No listings found or listings array is empty.');
    ordersGrid.innerHTML = `
      <div class="no-listings" style="text-align:center; padding: 40px 20px;">
        <i class="fas fa-list fa-3x" style="color:#ccc; margin-bottom:20px;"></i>
        <h3>No Listings Found</h3>
        <p>You haven't created any listings yet.</p>
        <a href="new.html" class="view-order-btn" style="display:inline-block; margin-top:20px;">Create a Listing</a>
      </div>
    `;
    return;
  }
  
  listings.forEach((listing, index) => {
    try {
      const listingHtml = createListingHtml(listing);
      ordersGrid.insertAdjacentHTML('beforeend', listingHtml);
    } catch (e) {
      console.error(`Error rendering listing at index ${index}:`, e, 'Listing data:', listing);
      ordersGrid.insertAdjacentHTML('beforeend', `
        <div class="order-card" style="border: 2px solid red; padding: 10px;">
          <p style="color: red; font-weight: bold;">Error displaying this listing.</p>
          <p>Title: ${listing.title || 'N/A'}</p>
          <p>Please check the console for more details.</p>
        </div>`);
    }
  });
  
  initializeBidButtons();
}

function createListingHtml(listing) {
  const statusMap = {
    ACTIVE: { class: 'active', icon: 'fa-bolt', text: 'Active' },
    AWARDED: { class: 'awarded', icon: 'fa-trophy', text: 'Awarded' },
    COMPLETED: { class: 'completed', icon: 'fa-check-circle', text: 'Completed' },
    CANCELLED: { class: 'cancelled', icon: 'fa-ban', text: 'Cancelled' },
    EXPIRED: { class: 'expired', icon: 'fa-clock', text: 'Expired' },
    PENDING: { class: 'pending', icon: 'fa-clock', text: 'Pending' },
    IN_PROGRESS: { class: 'in-progress', icon: 'fa-spinner', text: 'In Progress' }
  };
  
  const status = statusMap[listing.status] || statusMap.ACTIVE;
  
  const formatPrice = (price) => {
    if (price === null || typeof price === 'undefined' || price === '') {
      return 'N/A';
    }
    const numericPrice = Number(price);
    if (isNaN(numericPrice)) {
      console.warn('formatPrice: Invalid price value encountered:', price);
      return 'Invalid Price';
    }
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(numericPrice);
  };
  
  const title = listing.title || 'Untitled Listing';
  const category = listing.category || 'Uncategorized';
  const coverImageUrl = listing.coverImageUrl || '../assets/temp.png';
  
  let priceDisplay;
  if (listing.price !== null && typeof listing.price !== 'undefined') {
    priceDisplay = listing.isPriceFixed ? formatPrice(listing.price) : `${formatPrice(listing.price)} / hour`;
  } else {
    priceDisplay = 'Price not set';
  }
  
  const createdAtDisplay = getTimeAgo(listing.createdAt);
  const awardedToUserDisplayName = listing.awardedToUserDisplayName || 'User';
  
  let orderPriceDisplay = '';
  if (listing.status === 'AWARDED' && listing.orderPrice !== null && typeof listing.orderPrice !== 'undefined') {
    orderPriceDisplay = formatPrice(listing.orderPrice);
  } else if (listing.status === 'AWARDED') {
    orderPriceDisplay = 'N/A';
  }

  let bidsSection = '';
  if (Array.isArray(listing.bids) && listing.bids.length > 0) {
    const validBidsWithPrice = listing.bids.filter(bid => typeof bid.price === 'number' && !isNaN(bid.price));
    const avgBid = validBidsWithPrice.length > 0
        ? validBidsWithPrice.reduce((sum, bid) => sum + bid.price, 0) / validBidsWithPrice.length
        : 0;
    
    const bidsHtml = listing.bids.map(bid => {
      const bidPrice = (bid.price !== null && typeof bid.price !== 'undefined') ? formatPrice(bid.price) : 'N/A';
      const bidUserRating = bid.userRating || 0;
      const bidDeliveryDays = bid.deliveryDays || 'N/A';
      const bidMessage = bid.message || 'No details provided.';
      const bidCreatedAt = getTimeAgo(bid.createdAt);
      const bidderName = bid.userDisplayName || 'Anonymous Bidder';
      const bidderAvatar = bid.userAvatarUrl || '../assets/temp.png';

      return `
        <div class="bid-card" data-price="${bid.price || 0}" data-rating="${bidUserRating.toFixed(1)}">
          <div class="bid-header">
            <div class="bidder-info">
              <img src="${bidderAvatar}" alt="Bidder avatar" class="bidder-avatar">
              <div>
                <div class="bidder-name">${bidderName}</div>
                <div class="rating-stars">
                  ${generateStars(bidUserRating)}
                  <span>${bidUserRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <div class="bid-amount">${bidPrice}</div>
          </div>
          <div class="bid-details">
            <span>Delivery in ${bidDeliveryDays} days</span>
            <span>Bid submitted ${bidCreatedAt}</span>
          </div>
          <p>${bidMessage}</p>
          <div class="bid-actions">
            <button class="award-btn" data-bidder="${bid.userId}" data-bid-id="${bid.id}" data-listing-id="${listing.id}">
              <i class="fas fa-trophy"></i> Award Project
            </button>
            <button class="contact-bidder-btn" data-bidder="${bid.userId}">
              Message
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    bidsSection = `
      <div class="bid-section">
        <div class="bid-stats">
          <div class="bid-stat">
            <i class="fas fa-gavel"></i>
            <span>${listing.bids.length} bids received</span>
          </div>
          <div class="bid-stat">
            <i class="fas fa-dollar-sign"></i>
            <span>Avg. bid: ${avgBid > 0 ? formatPrice(avgBid) : 'N/A'}</span>
          </div>
        </div>
        <button class="view-bids-btn" data-listing-id="${listing.id}">
          <i class="fas fa-chevron-down"></i> View Bids
        </button>
        <div class="bids-list" style="display: none;">
          <div class="bid-sort-filter">
            <span>Sort by:</span>
            <select class="bid-filter-select" data-listing-id="${listing.id}">
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating-desc">Rating: High to Low</option>
            </select>
          </div>
          ${bidsHtml}
        </div>
      </div>
    `;
  } else {
    bidsSection = `
      <div class="bid-section">
        <div class="bid-stats">
          <div class="bid-stat">
            <i class="fas fa-gavel"></i>
            <span>No bids yet</span>
          </div>
        </div>
      </div>
    `;
  }
  
  let actionButtons = '';
  if (listing.status === 'ACTIVE') {
    actionButtons = `
      <div class="status-actions">
        <button class="change-status-btn" data-status="cancelled" data-listing-id="${listing.id}">
          <i class="fas fa-times"></i> Cancel Listing
        </button>
      </div>
    `;
  } else if (listing.status === 'AWARDED') {
    actionButtons = `
      <div class="status-actions">
        <button class="change-status-btn" data-status="completed" data-listing-id="${listing.id}">
          <i class="fas fa-check-circle"></i> Mark as Completed
        </button>
      </div>
    `;
  } else if (listing.status === 'CANCELLED') {
    actionButtons = `
      <div class="order-actions">
        <button class="reorder-btn" data-listing-id="${listing.id}">
          <i class="fas fa-redo"></i> Repost Listing
        </button>
      </div>
    `;
  }
  
  return `
    <div class="order-card ${listing.status === 'CANCELLED' ? 'cancelled' : ''}" data-listing-id="${listing.id}">
      <div class="order-card-left">
        <div class="order-image" style="background-image: url('${coverImageUrl}');">
          <div class="order-provider">${typeof category === 'object' ? (category.displayName || 'Uncategorized') : category}</div>
        </div>
      </div>
      <div class="order-card-center">
        <div class="order-status ${status.class}">
          <i class="fas ${status.icon}"></i>
          ${status.text}
        </div>
        <h3 class="order-title">${title}</h3>
        <div class="order-details">
          <div class="order-detail">
            <span class="detail-label">Budget:</span>
            <span class="detail-value">${priceDisplay}</span>
          </div>
          <div class="order-detail">
            <span class="detail-label">Posted:</span>
            <span class="detail-value">${createdAtDisplay}</span>
          </div>
          ${listing.awardedToUserId ? `
          <div class="order-detail">
            <span class="detail-label">Awarded to:</span>
            <span class="detail-value">${awardedToUserDisplayName}</span>
          </div>
          <div class="order-detail">
            <span class="detail-label">Awarded amount:</span>
            <span class="detail-value">${orderPriceDisplay}</span>
          </div>
          ` : ''}
          ${bidsSection}
          ${actionButtons}
        </div>
      </div>
      <div class="order-card-right">
        <a href="edit.html?id=${listing.id}" class="view-order-btn">
          ${listing.status === 'ACTIVE' ? 'Edit <i class="fas fa-pencil-alt"></i>' : 'View <i class="fas fa-arrow-right"></i>'}
        </a>
        ${listing.status === 'ACTIVE' ? `
        <button class="delete-gig-btn" title="Remove gig" data-listing-id="${listing.id}">
          <i class="fas fa-trash-alt"></i>
        </button>
        ` : ''}
      </div>
    </div>
  `;
}

function generateStars(rating) {
  const numRating = Number(rating);
  if (isNaN(numRating) || numRating < 0) {
    return Array(5).fill('<i class="far fa-star"></i>').join('');
  }

  let stars = '';
  const fullStars = Math.floor(numRating);
  const halfStar = (numRating % 1) >= 0.25 && (numRating % 1) < 0.75;
  const roundedUpStar = (numRating % 1) >= 0.75;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i === fullStars + 1 && halfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else if (i === fullStars + 1 && roundedUpStar) {
      stars += '<i class="fas fa-star"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  return stars;
}

function getTimeAgo(timestamp) {
  if (!timestamp) return 'N/A';
  
  const now = new Date();
  const date = new Date(timestamp);
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function initializeBidButtons() {
  document.querySelectorAll('.view-bids-btn').forEach(button => {
    button.addEventListener('click', function() {
      const bidsList = this.nextElementSibling;
      
      if (bidsList.style.display === 'none') {
        document.querySelectorAll('.bids-list').forEach(list => {
          if (list !== bidsList) list.style.display = 'none';
        });
        document.querySelectorAll('.view-bids-btn').forEach(btn => {
          if (btn !== this) {
            btn.innerHTML = '<i class="fas fa-chevron-down"></i> View Bids';
          }
        });
        
        bidsList.style.display = 'block';
        this.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Bids';
      } else {
        bidsList.style.display = 'none';
        this.innerHTML = '<i class="fas fa-chevron-down"></i> View Bids';
      }
    });
  });

  document.querySelectorAll('.bid-filter-select').forEach(select => {
    select.addEventListener('change', function() {
      const bidsContainer = this.closest('.bids-list');
      const bidCards = Array.from(bidsContainer.querySelectorAll('.bid-card'));
      
      bidCards.sort((a, b) => {
        const sortBy = this.value;
        
        if (sortBy === 'price-asc') {
          return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        } else if (sortBy === 'price-desc') {
          return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        } else if (sortBy === 'rating-desc') {
          return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        }
      });
      
      bidCards.forEach(card => card.remove());
      bidCards.forEach(card => bidsContainer.appendChild(card));
    });
  });
}

function handleOrdersGridClick(e) {
  if (e.target.closest('.change-status-btn')) {
    const btn = e.target.closest('.change-status-btn');
    const status = btn.dataset.status;
    const listingId = parseInt(btn.dataset.listingId, 10);
    
    if (isNaN(listingId)) {
      console.error("Invalid listingId for change status:", btn.dataset.listingId);
      alert("Error: Invalid listing ID.");
      return;
    }
    changeListingStatus(listingId, status);
    return;
  }
  
  if (e.target.closest('.reorder-btn')) {
    const btn = e.target.closest('.reorder-btn');
    const listingId = parseInt(btn.dataset.listingId, 10);
    
    if (isNaN(listingId)) {
      console.error("Invalid listingId for repost:", btn.dataset.listingId);
      alert("Error: Invalid listing ID.");
      return;
    }
    repostListing(listingId);
    return;
  }
  
  if (e.target.closest('.award-btn')) {
    const btn = e.target.closest('.award-btn');
    const bidId = parseInt(btn.dataset.bidId, 10);
    const listingId = parseInt(btn.dataset.listingId, 10);

    if (isNaN(listingId) || isNaN(bidId)) {
      console.error("Invalid listingId or bidId for award:", btn.dataset.listingId, btn.dataset.bidId);
      alert("Error: Invalid listing or bid ID.");
      return;
    }
    awardProject(listingId, bidId);
    return;
  }

  if (e.target.closest('.delete-gig-btn')) {
    const btn = e.target.closest('.delete-gig-btn');
    const listingId = parseInt(btn.dataset.listingId, 10);
    
    if (isNaN(listingId)) {
      console.error("Invalid listingId for delete:", btn.dataset.listingId);
      alert("Error: Invalid listing ID.");
      return;
    }
    deleteListing(listingId);
    return;
  }
  
  if (e.target.closest('.contact-bidder-btn')) {
    const btn = e.target.closest('.contact-bidder-btn');
    const bidderId = btn.dataset.bidder;
    
    alert('Messaging functionality not yet implemented');
    return;
  }
}

async function changeListingStatus(listingId, status) {
  if (!confirm(`Are you sure you want to ${status} this listing?`)) return;
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8080/api/listings/${listingId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: status.toUpperCase() })
    });
    
    if (!response.ok) throw new Error('Failed to update status');
    
    fetchUserListings();
  } catch (error) {
    console.error('Error updating status:', error);
    alert('Failed to update listing status: ' + error.message);
  }
}

async function repostListing(listingId) {
  if (!confirm('Do you want to repost this listing?')) return;
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8080/api/listings/${listingId}/repost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to repost listing');
    
    fetchUserListings();
  } catch (error) {
    console.error('Error reposting listing:', error);
    alert('Failed to repost listing: ' + error.message);
  }
}

async function awardProject(listingId, bidId) {
  if (!confirm('Are you sure you want to award the project to this bidder?')) return;
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8080/api/listings/${listingId}/award`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ bidId: bidId })
    });
    
    if (!response.ok) throw new Error('Failed to award project');
    
    fetchUserListings();
  } catch (error) {
    console.error('Error awarding project:', error);
    alert('Failed to award project: ' + error.message);
  }
}

async function deleteListing(listingId) {
  if (!confirm('Are you sure you want to delete this listing? This action cannot be undone.')) return;
  
  try {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:8080/api/listings/${listingId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) throw new Error('Failed to delete listing');
    
    fetchUserListings();
  } catch (error) {
    console.error('Error deleting listing:', error);
    alert('Failed to delete listing: ' + error.message);
  }
}