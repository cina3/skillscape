document.addEventListener('DOMContentLoaded', () => {
    const listingGrid  = document.querySelector('.listing-grid');
    const API_BASE_URL = 'http://localhost:8080/api';
    const TOKEN = localStorage.getItem('authToken') || localStorage.getItem('token');

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
        const coverImage           = gig.coverImageUrl
                                      ? escapeHTML(gig.coverImageUrl)
                                      : '../assets/temp.png';

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

        try {
            const res = await fetch(`${API_BASE_URL}/gigs`);
            if (!res.ok) throw new Error(`Gigs fetch failed: ${res.status}`);
            const gigs = await res.json();

            const gigsWithStats = await Promise.all(
                gigs.map(async gig => {
                    const stats = await fetchGigStats(gig.id);
                    return { gig, stats };
                })
            );

            listingGrid.innerHTML = gigsWithStats.length
                ? gigsWithStats.map(({ gig, stats }) =>
                    createGigCard(gig, stats.average, stats.count)
                  ).join('')
                : '<p>No gigs available.</p>';

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
                                console.error('openGigModal function not found');
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
            .replace(/&/g, '&')
            .replace(/</g, '<')
            .replace(/>/g, '>')
            .replace(/"/g, '"')
            .replace(/'/g, '&#39;');
    }

    loadGigs();
});