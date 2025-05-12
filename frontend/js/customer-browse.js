document.addEventListener('DOMContentLoaded', () => {
    const listingGrid = document.querySelector('.listing-grid');
    const API_BASE_URL = 'http://localhost:8080/api'; 

    function createGigCard(gig) {
        const priceSuffix = gig.perHourPricing ? '/ hour' : '/ each';
        const priceTypeDescription = gig.priceFixed ? 'Fixed Price' : 'Negotiable';
        
        const coverImage = gig.coverImageUrl ? escapeHTML(gig.coverImageUrl) : '../assets/temp.png'; 
        const rating = (Math.random() * 2 + 3).toFixed(1); 
        const featuredBadgeHTML = ''; 

        return `
            <div class="listing-card" data-gig-id="${gig.id}">
                <div class="listing-image">
                    <img src="${coverImage}" alt="${escapeHTML(gig.title)}">
                </div>
                ${featuredBadgeHTML}
                <div class="card-content">
                    <h2 class="card-title">${escapeHTML(gig.title)}</h2>
                    <div class="card-features">
                        ${generateDescriptionSnippet(gig.description, 150)}
                    </div>
                    <div class="card-provider">
                        <span>by ${escapeHTML(gig.userDisplayName || 'Unknown Seller')}</span>
                    </div>
                    <div class="card-footer">
                        <div class="card-rating">
                            <i class="fas fa-star star-icon"></i>
                            <span>${rating}</span>
                        </div>
                        <div class="card-price-section">
                            <div class="card-price">$${gig.price.toFixed(2)} ${priceSuffix}</div>
                            <div class="price-type-badge">${priceTypeDescription}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function generateDescriptionSnippet(description, maxLength = 120) {
        if (!description || description.trim() === '') {
            return '<p class="feature-text">No description provided.</p>';
        }
        
        let snippet = description.trim();
        if (snippet.length > maxLength) {
            snippet = snippet.substring(0, maxLength).trimEnd() + "...";
        }
        return `<p class="feature-text">${escapeHTML(snippet)}</p>`;
    }

    function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return str.toString()
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#39;');
    }

    async function loadGigs() {
        if (!listingGrid) {
            console.error('Listing grid container (.listing-grid) not found in the HTML!');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/gigs`);
            
            if (!response.ok) {
                let errorText = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.message) {
                        errorText += ` - ${errorData.message}`;
                    }
                } catch (e) {  }
                throw new Error(errorText);
            }
            
            const gigs = await response.json();
            listingGrid.innerHTML = ''; 

            if (gigs && gigs.length > 0) {
                gigs.forEach(gig => {
                    listingGrid.insertAdjacentHTML('beforeend', createGigCard(gig));
                });
            } else {
                listingGrid.innerHTML = '<p>No gigs are currently available. Please check back later!</p>';
            }

        } catch (error) {
            console.error("Failed to load gigs:", error);
            listingGrid.innerHTML = `<p>Sorry, we encountered an error trying to load gigs: ${error.message}. Please try refreshing the page.</p>`;
        }
    }

    loadGigs();

    const categoryNavItems = document.querySelectorAll('.category-nav-item');
    categoryNavItems.forEach(item => {
        item.addEventListener('click', () => {
            const categoryName = item.querySelector('span').textContent;
            console.log(`Category clicked: ${categoryName}. Filtering not yet implemented.`);
        });
    });
});