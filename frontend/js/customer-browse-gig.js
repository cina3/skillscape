document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('gigModal');
    const closeBtn = document.getElementById('closeGigModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            closeGigModal();
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeGigModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeGigModal();
        }
    });
    
    function closeGigModal() {
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            setTimeout(() => {
                if (modal) modal.querySelector('.gig-modal').scrollTop = 0;
            }, 300);
        }
    }
    
    window.openGigModal = function(gigData) {
        if (!modal) return;
        
        document.getElementById('gigTitle').textContent = gigData.title || 'Gig Title';
        document.getElementById('gigDescription').textContent = gigData.description || 'No description available';
        document.getElementById('providerName').textContent = `by ${gigData.userDisplayName || 'Unknown Seller'}`;
        document.getElementById('ratingValue').textContent = gigData.rating || '0.0';
        document.getElementById('reviewCount').textContent = `(${gigData.reviewCount || 0} reviews)`;
        document.getElementById('totalReviewCount').textContent = gigData.reviewCount || 0;
        document.getElementById('gigPrice').textContent = `$${gigData.price?.toFixed(2) || '0.00'}`;
        document.getElementById('priceUnit').textContent = gigData.perHourPricing ? '/ hour' : '/ each';
        
        if (gigData.coverImageUrl) {
            document.getElementById('gigCoverImage').src = gigData.coverImageUrl;
        } else {
            document.getElementById('gigCoverImage').src = '../assets/temp.png';
        }
        
        document.getElementById('providerAvatar').src = gigData.providerAvatarUrl || '../assets/temp.png'; 
        
        const ratingStarsContainer = modal.querySelector('.rating-stars');
        if (ratingStarsContainer) {
            updateStarRating(parseFloat(gigData.rating || 0), ratingStarsContainer);
        }
        
        const reviewsSection = modal.querySelector('.reviews-section');
        if (reviewsSection) {
            reviewsSection.style.display = 'block';
        }
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; 
        
        const modalContent = modal.querySelector('.gig-modal');
        if (modalContent) modalContent.scrollTop = 0;
        
        setDynamicReviewsElement(gigData.reviewCount || 0);
    }
    
    function setDynamicReviewsElement(count) {
        const totalReviewsEl = document.getElementById('totalReviewCount');
        if (totalReviewsEl) {
            totalReviewsEl.textContent = count;
            
            const reviewsSection = document.querySelector('.reviews-section');
            if (reviewsSection) {
                reviewsSection.style.display = 'block';
            }
        }
    }
    
    function updateStarRating(rating, container) {
        container.innerHTML = ''; 
        const maxStars = 5;
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.3 && rating % 1 <= 0.7;
        const emptyStars = maxStars - fullStars - (hasHalfStar ? 1 : 0);
        
        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('i');
            star.className = 'fas fa-star star-icon';
            container.appendChild(star);
        }
        
        if (hasHalfStar) {
            const halfStar = document.createElement('i');
            halfStar.className = 'fas fa-star-half-alt star-icon';
            container.appendChild(halfStar);
        } else if (rating % 1 > 0.7) {
            const star = document.createElement('i');
            star.className = 'fas fa-star star-icon';
            container.appendChild(star);
        }
        
        for (let i = 0; i < emptyStars; i++) {
            const emptyStar = document.createElement('i');
            emptyStar.className = 'far fa-star star-icon';
            container.appendChild(emptyStar);
        }
        
        container.setAttribute('aria-label', `Rating: ${rating} out of 5 stars`);
    }
    
    const viewAllReviewsBtn = document.querySelector('.view-all-reviews');
    if (viewAllReviewsBtn) {
        viewAllReviewsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('The full reviews system will be implemented soon.');
        });
    }
});
