function listingCard(l) {
    const card = document.createElement('div');
    card.className = 'recommended-item';

    const titleToDisplay = safeTitle(l.title || 'Untitled Project');
    const customerName = l.customer ? (l.customer.displayName || l.customer.username) : 'A Customer';

    card.innerHTML = `
      <div class="item-image">
        <img src="${'../assets/temp.png'}" alt="${escapeHtml(titleToDisplay)}">
      </div>
      <div class="item-details">
        <h3 class="item-title">${escapeHtml(titleToDisplay)}</h3>
        ${
          l.customer
            ? `<p class="item-provider">Posted by: ${escapeHtml(customerName)}</p>`
            : ''
        }
      </div>
      <a href="browse.html#listing-${l.id}" class="view-button">
        View <i class="fas fa-chevron-right arrow-icon"></i>
      </a>`;
    return card;
  }

function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) {
        return '';
    }
    return String(unsafe)
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function safeTitle(title) {
    if (!title) return 'Untitled Project';
    let safe = String(title);
    if (safe.startsWith('http') && (safe.includes('://') || safe.includes('www.'))) {
      return 'Project Listing';
    }
    return safe;
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
      if (r.status === 204) return null;
      return r.json();
    });
}

async function fetchLatestListings() {
  try {
    const listings = await apiFetch('http://3.75.88.34:8080/api/listings');
    const activeListings = listings.filter(l => l.status === 'ACTIVE');
    renderLatestListings(activeListings.slice(0, 5));
  } catch (e) {
    console.error('Failed to load latest listings:', e);
    const recommendedList = document.querySelector('.recommended-list');
    if (recommendedList) {
        recommendedList.innerHTML = '<p class="error-message">Could not load latest listings. Please try again later.</p>';
    }
  }
}

function renderLatestListings(listings) {
  const recommendedList = document.querySelector('.recommended-list');
  if (!recommendedList) {
    console.error('Recommended list container not found.');
    return;
  }
  recommendedList.innerHTML = '';

  if (!listings || listings.length === 0) {
    recommendedList.innerHTML = '<p>No active listings found at the moment.</p>';
    return;
  }

  listings.forEach(listing => {
    const card = listingCard(listing);
    recommendedList.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
    fetchLatestListings();
});

