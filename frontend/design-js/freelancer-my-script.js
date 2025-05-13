document.addEventListener('DOMContentLoaded', function() {
    const viewOrderButtons = document.querySelectorAll('.view-order-btn');
    const modal = document.getElementById('orderDetailsModal');
    const closeModalButton = modal ? modal.querySelector('.close-modal-btn') : null;
    const actionModal = document.getElementById('actionModal');
    const closeActionModalButton = actionModal ? actionModal.querySelector('.close-action-modal') : null;
    const leaveRatingButtons = document.querySelectorAll('.leave-rating-btn');
    const stars = actionModal ? actionModal.querySelectorAll('.star-item') : [];
    const ratingText = actionModal ? actionModal.querySelector('.rating-text') : null;
    const submitRatingButton = actionModal ? actionModal.querySelector('#submitRatingBtn') : null;
    const cancelRatingButton = actionModal ? actionModal.querySelector('#cancelRatingBtn') : null;
    const ratingForm = actionModal ? actionModal.querySelector('#ratingForm') : null;

    const viewBidsButtons = document.querySelectorAll('.view-bids-btn');
    const bidSortSelects = document.querySelectorAll('.bid-filter-select, #bidSortSelect');  
    const bidTabButtons = document.querySelectorAll('.bid-tab-button');

    if (viewOrderButtons.length > 0 && modal && closeModalButton) {
        viewOrderButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.classList.add('visible');
                }, 10); 
            });
        });

        closeModalButton.addEventListener('click', function() {
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300); 
        });

        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeModalButton.click();
            }
        });
    } else {
        if (!modal) console.error("Modal with ID 'orderDetailsModal' not found.");
        if (!closeModalButton) console.error("Close button for modal not found.");
        if (viewOrderButtons.length === 0) console.warn("No '.view-order-btn' elements found.");
    }

    if (leaveRatingButtons.length > 0 && actionModal && closeActionModalButton && ratingForm) {
        leaveRatingButtons.forEach(button => {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                const orderTitle = this.closest('.order-card-center').querySelector('.order-title').textContent;
                const orderImage = this.closest('.order-card').querySelector('.order-image').style.backgroundImage;
                
                actionModal.querySelector('.service-info h4').textContent = orderTitle;
                actionModal.querySelector('.service-image').style.backgroundImage = orderImage;
                
                actionModal.style.display = 'flex';
                setTimeout(() => {
                    actionModal.classList.add('visible');
                }, 10);
            });
        });

        closeActionModalButton.addEventListener('click', function() {
            actionModal.classList.remove('visible');
            setTimeout(() => {
                actionModal.style.display = 'none';
                resetRatingForm();
            }, 300);
        });

        actionModal.addEventListener('click', function(event) {
            if (event.target === actionModal) {
                closeActionModalButton.click();
            }
        });

        stars.forEach(star => {
            star.addEventListener('click', function() {
                const ratingValue = this.dataset.value;
                setActiveStars(ratingValue);
                if (ratingText) ratingText.textContent = getRatingText(ratingValue);
                if (submitRatingButton) submitRatingButton.disabled = false;
            });
        });

        if (cancelRatingButton) {
            cancelRatingButton.addEventListener('click', () => {
                closeActionModalButton.click();
            });
        }
        
        ratingForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('Rating submitted:', {
                rating: document.querySelector('.star-item.active:last-child')?.dataset.value,
                review: document.getElementById('reviewText').value,
                reason: document.getElementById('communicationReason').value
            });
            alert('Rating submitted successfully!'); 
            closeActionModalButton.click();
        });

    } else {
        if (leaveRatingButtons.length > 0) {
            if (!actionModal) console.error("Action modal with ID 'actionModal' not found.");
            if (!closeActionModalButton) console.error("Close button for action modal not found.");
            if (!ratingForm) console.error("Rating form with ID 'ratingForm' not found.");
        }
    }

    function setActiveStars(rating) {
        stars.forEach(s => {
            s.classList.remove('active');
            if (parseInt(s.dataset.value) <= parseInt(rating)) {
                s.classList.add('active');
            }
        });
    }

    function getRatingText(rating) {
        switch (rating) {
            case '1': return 'Poor';
            case '2': return 'Fair';
            case '3': return 'Good';
            case '4': return 'Very Good';
            case '5': return 'Excellent';
            default: return 'Select a rating';
        }
    }

    function resetRatingForm() {
        setActiveStars(0);
        if (ratingText) ratingText.textContent = 'Select a rating';
        if (submitRatingButton) submitRatingButton.disabled = true;
        if (ratingForm) ratingForm.reset();
    }

    viewBidsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bidsList = this.nextElementSibling;
            const icon = this.querySelector('i');
            if (bidsList && bidsList.classList.contains('bids-list')) {
                const isVisible = bidsList.style.display === 'block';
                bidsList.style.display = isVisible ? 'none' : 'block';
                if (icon) {
                    icon.classList.toggle('fa-chevron-down', isVisible);
                    icon.classList.toggle('fa-chevron-up', !isVisible);
                }
            }
        });
    });

    bidSortSelects.forEach(select => {
        select.addEventListener('change', function() {
            const bidsListContainer = this.closest('.bid-section, .bid-tab-content').querySelector('.bids-list');
            if (bidsListContainer) {
                sortBids(bidsListContainer, this.value);
            }
        });
    });

    function sortBids(bidsListContainer, sortBy) {
        const bids = Array.from(bidsListContainer.querySelectorAll('.bid-card'));
        bids.sort((a, b) => {
            const priceA = parseFloat(a.dataset.price);
            const priceB = parseFloat(b.dataset.price);
            const ratingA = parseFloat(a.dataset.rating);
            const ratingB = parseFloat(b.dataset.rating);

            switch (sortBy) {
                case 'price-asc':
                    return priceA - priceB;
                case 'price-desc':
                    return priceB - priceA;
                case 'rating-desc':
                    return ratingB - ratingA;
                default:
                    return 0;
            }
        });
        bids.forEach(bid => bidsListContainer.appendChild(bid));
    }
    
    bidTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTabId = this.dataset.target;
            
            bidTabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.bid-tab-content').forEach(content => {
                if (content.closest('#orderDetailsModal')) { 
                    content.style.display = 'none';
                }
            });
            
            this.classList.add('active');
            const targetContent = document.getElementById(targetTabId);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });

});
