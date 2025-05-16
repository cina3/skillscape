document.addEventListener('DOMContentLoaded', () => {
    const listingGrid  = document.querySelector('.listing-grid');
    const API_BASE_URL = 'http://localhost:8080/api';
    const TOKEN = localStorage.getItem('authToken') || localStorage.getItem('token');
    let allGigsCache = []; 
    let activeFilters = {}; 

    console.log('Using token:', TOKEN);

    async function fetchGigStats(gigId) {
        try {
            const headers = {};
            if (TOKEN) {
                headers['Authorization'] = `Bearer ${TOKEN}`;
            }
            const res = await fetch(`${API_BASE_URL}/reviews/gig/${gigId}`, { headers });
            if (!res.ok) {
                console.warn(`Stats fetch failed for gig ${gigId}: ${res.status}`);
                return { average: 0, count: 0 };
            }
            const reviews = await res.json();
            const count   = reviews.length;
            const sum     = reviews.reduce((acc, r) => acc + (r.score || 0), 0);
            const avg     = count ? (sum / count).toFixed(1) : '0.0';
            return { average: avg, count };
        } catch (err) {
            console.error(`Error fetching stats for gig ${gigId}`, err);
            return { average: 0, count: 0 };
        }
    }

    function createGigCard(gig, averageRating, reviewCount) {
        const priceSuffix          = gig.perHourPricing ? '/ hour' : '/ each';
        const priceTypeDescription = gig.priceFixed     ? 'Fixed Price' : 'Negotiable';
        const coverImage           = '../assets/temp.png';

        return `
            <div class="listing-card" data-gig-id="${gig.id}">
                <div class="listing-image">
                    <img src="${coverImage}" alt="${escapeHTML(gig.title)}">
                </div>
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
                            <span>${averageRating}&nbsp;(${reviewCount} review${reviewCount!==1?'s':''})</span>
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

    async function loadGigs() {
        if (!listingGrid) {
            console.error('Listing grid container (.listing-grid) not found!');
            return;
        }
        listingGrid.innerHTML = '<p>Loading gigs...</p>';

        const params = new URLSearchParams(window.location.search);
        const selectedCategoryFromURL = params.get('category'); 
        console.log('Selected category from URL:', selectedCategoryFromURL);

        try {
            if (allGigsCache.length === 0) {
                const res = await fetch(`${API_BASE_URL}/gigs`);
                if (!res.ok) throw new Error(`Gigs fetch failed: ${res.status}`);
                allGigsCache = await res.json();
            }
            
            console.log('Applying filters to gigs:', JSON.parse(JSON.stringify(activeFilters)));

            let filteredGigs = allGigsCache;
            if (selectedCategoryFromURL) {
                const categoryToMatch = selectedCategoryFromURL.toUpperCase().replace(/-/g, '_');
                console.log('Filtering by category:', categoryToMatch);
                
                filteredGigs = allGigsCache.filter(gig => {
                    return gig.category && typeof gig.category === 'string' && gig.category.toUpperCase() === categoryToMatch;
                });
            }

            if (activeFilters.price) {
                filteredGigs = filteredGigs.filter(gig => parseFloat(gig.price) >= parseFloat(activeFilters.price));
            }
            
            if (activeFilters.priceType) {
                if (activeFilters.priceType === 'Fixed Price') {
                    filteredGigs = filteredGigs.filter(gig => gig.priceFixed);
                } else if (activeFilters.priceType === 'Bid') {
                    filteredGigs = filteredGigs.filter(gig => !gig.priceFixed);
                }
            }

            const gigsWithStats = await Promise.all(
                filteredGigs.map(async gig => {
                    const stats = await fetchGigStats(gig.id);
                    return { gig, stats };
                })
            );
            
            let filteredWithStats = gigsWithStats;
            
            if (activeFilters.rating) {
                const minRating = parseFloat(activeFilters.rating);
                filteredWithStats = filteredWithStats.filter(item => 
                    parseFloat(item.stats.average) >= minRating
                );
            }
            
            if (activeFilters.reviewCount) {
                const minReviews = parseInt(activeFilters.reviewCount);
                filteredWithStats = filteredWithStats.filter(item => 
                    item.stats.count >= minReviews
                );
            }

            listingGrid.innerHTML = filteredWithStats.length
                ? filteredWithStats.map(({ gig, stats }) =>
                    createGigCard(gig, stats.average, stats.count)
                  ).join('')
                : '<p>No gigs found for this category or matching your criteria.</p>';

            document.querySelectorAll('.listing-card').forEach(card => {
                card.addEventListener('click', async () => {
                    const gigId = card.getAttribute('data-gig-id');
                    if (gigId) {
                        try {
                            const res = await fetch(`${API_BASE_URL}/gigs/${gigId}`);
                            if (!res.ok) throw new Error(`Failed to fetch gig details: ${res.status}`);
                            const gigData = await res.json();
                            const stats = await fetchGigStats(gigId);

                            const modalData = {
                                ...gigData,
                                rating: stats.average,
                                reviewCount: stats.count,
                                providerAvatarUrl: gigData.providerAvatarUrl || '../assets/temp.png'
                            };

                            if (window.openGigModal) {
                                window.openGigModal(modalData);
                            } else {
                                console.error('openGigModal function not found. Ensure it is defined in customer-browse-gig.js and attached to the window object.');
                            }
                        } catch (error) {
                            console.error('Error fetching gig details:', error);
                        }
                    }
                });
            });

        } catch (error) {
            console.error("Failed to load gigs:", error);
            listingGrid.innerHTML = `<p>Error loading gigs: ${error.message}</p>`;
        }
    }

    function generateDescriptionSnippet(description, maxLength = 120) {
        if (!description?.trim()) {
            return '<p class="feature-text">No description provided.</p>';
        }
        let snippet = description.trim();
        if (snippet.length > maxLength) {
            snippet = snippet.substring(0, maxLength).trimEnd() + '…';
        }
        return `<p class="feature-text">${escapeHTML(snippet)}</p>`;
    }

    function escapeHTML(str) {
        if (str == null) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    
    window.applyFilters = function(filters) {
        activeFilters = filters;
        loadGigs();
    };
    
    window.applyPriceTypeFilter = function(priceType) {
        activeFilters.priceType = priceType;
    };

    window.loadGigs = loadGigs; 
    loadGigs(); 
});