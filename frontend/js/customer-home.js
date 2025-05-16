document.addEventListener('DOMContentLoaded', () => {
    initializeRecommendedSection();
});

async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  opts.headers = headers;

  const response = await fetch(path, opts);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorBody}`);
  }
  try {
    return await response.json();
  } catch (e) {
    console.error("Failed to parse JSON response", e);
    return null; 
  }
}

function createRecommendedItemCard(item) {
    const card = document.createElement('div');
    card.className = 'recommended-item';

    const imageUrl = '../assets/temp.png';
    const title = item.title || 'Untitled Gig';
    const sellerName = item.user ? item.user.username : (item.sellerName || 'N/A');
    const rating = item.averageRating || item.rating;
    const ratingText = rating ? `<i class="fas fa-star star-icon"></i> ${Number(rating).toFixed(1)}` : 'No rating';
    const priceText = item.price ? `$${item.price}` : 'Price N/A';
    const detailsUrl = item.id ? `browse.html#gig-${item.id}` : '#'; 

    card.innerHTML = `
        <div class="item-image">
            <img src="${imageUrl}" alt="${title}">
        </div>
        <div class="item-details">
            <h3 class="item-title">${title}</h3>
            <p class="item-seller">by ${sellerName}</p>
            <p class="item-rating">${ratingText} - ${priceText}</p>
        </div>
        <a href="${detailsUrl}" class="view-button" data-gig-id="${item.id || ''}">View <i class="fas fa-chevron-right arrow-icon"></i></a>
    `;

    return card;
}

async function loadRecommendedItems(apiUrl, listElement) {
    listElement.innerHTML = '<p class="loading-message" style="text-align:center; padding: 20px;">Loading recommendations...</p>';
    try {
        const response = await apiFetch(apiUrl); 
        
        let items = [];
        if (response && typeof response === 'object' && Array.isArray(response.content)) {
            items = response.content;
        } else if (Array.isArray(response)) { 
            items = response;
        } else {
            console.warn("Unexpected API response structure:", response);
        }

        listElement.innerHTML = ''; 

        if (items && items.length > 0) {
            const itemsToDisplay = items.slice(0, 6); 
            itemsToDisplay.forEach(item => {
                const cardElement = createRecommendedItemCard(item);
                listElement.appendChild(cardElement);
            });
        } else {
            listElement.innerHTML = '<p class="empty-message" style="text-align:center; padding: 20px;">No gigs available at the moment. Explore other categories or check back later!</p>';
        }
    } catch (error) {
        console.error('Failed to load recommended items:', error);
        listElement.innerHTML = '<p class="error-message" style="text-align:center; padding: 20px; color: red;">Could not load recommendations. Please try again later.</p>';
    }
}

function initializeRecommendedSection() {
    const recommendedListElement = document.querySelector('.main-content-area .recommended-section .recommended-list');
    if (!recommendedListElement) {
        console.warn('Recommended list element not found in customer home.');
        return;
    }

    const apiUrl = 'http://localhost:8080/api/gigs?status=ACTIVE&size=6&sort=averageRating,desc&page=0'; 

    loadRecommendedItems(apiUrl, recommendedListElement);
}