document.addEventListener('DOMContentLoaded', function() {
    const viewOrderButtons = document.querySelectorAll('.view-order-btn');
    const orderModal = document.getElementById('orderDetailsModal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    
    const leaveRatingBtn = document.querySelector('.leave-rating-btn');
    const ratingModal = document.getElementById('ratingModal');
    const ratingStars = document.querySelectorAll('.star-item');
    const ratingText = document.querySelector('.rating-text');
    const submitRatingBtn = document.getElementById('submitRating');
    
    const reportIssueBtn = document.getElementById('reportIssueBtn');
    const reportIssueModal = document.getElementById('reportIssueModal');
    const issueTypeSelect = document.getElementById('issueType');
    const issueDescriptionField = document.getElementById('issueDescription');
    const submitIssueBtn = document.getElementById('submitIssue');
    
    const closeModalButtons = document.querySelectorAll('.close-action-modal');
    const cancelButtons = document.querySelectorAll('.cancel-button');
    
    viewOrderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            orderModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
    });
    
    closeModalBtn.addEventListener('click', function() {
        orderModal.classList.remove('visible');
        document.body.style.overflow = '';
    });
    
    orderModal.addEventListener('click', function(e) {
        if (e.target === orderModal) {
            orderModal.classList.remove('visible');
            document.body.style.overflow = '';
        }
    });
    
    let selectedRating = 0;
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.dataset.rating);
            selectedRating = rating;
            
            ratingStars.forEach(s => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                    s.classList.add('active');
                } else {
                    s.classList.remove('fas');
                    s.classList.remove('active');
                    s.classList.add('far');
                }
            });
            
            ratingText.textContent = getRatingText(rating);
            submitRatingBtn.disabled = false;
        });
        
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.dataset.rating);
            
            ratingStars.forEach(s => {
                if (parseInt(s.dataset.rating) <= rating) {
                    s.classList.add('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', function() {
            ratingStars.forEach(s => s.classList.remove('hover'));
        });
    });
    
    if (leaveRatingBtn) {
        leaveRatingBtn.addEventListener('click', function() {
            ratingModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (reportIssueBtn) {
        reportIssueBtn.addEventListener('click', function() {
            reportIssueModal.classList.add('visible');
            document.body.style.overflow = 'hidden';
        });
    }
    
    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeActionModal);
    });
    
    cancelButtons.forEach(button => {
        button.addEventListener('click', closeActionModal);
    });
    
    function closeActionModal() {
        document.querySelectorAll('.action-modal').forEach(modal => {
            modal.classList.remove('visible');
        });
        document.body.style.overflow = '';
        resetForms();
    }
    
    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', function() {
            const commentText = document.getElementById('ratingComment').value;
            
            console.log(`Submitting rating: ${selectedRating} stars`);
            console.log(`Comment: ${commentText}`);
            
            alert(`Thank you for your ${selectedRating}-star rating!`);
            closeActionModal();
        });
    }
    
    if (submitIssueBtn) {
        submitIssueBtn.addEventListener('click', function() {
            const issueType = issueTypeSelect.value;
            const issueDescription = issueDescriptionField.value;
            
            if (!issueType || !issueDescription) {
                alert('Please fill out all fields');
                return;
            }
            
            console.log(`Issue type: ${issueType}`);
            console.log(`Description: ${issueDescription}`);
            
            alert('Your issue has been reported. We will review it shortly.');
            closeActionModal();
        });
    }
    
    function resetForms() {
        selectedRating = 0;
        ratingStars.forEach(s => {
            s.classList.remove('fas', 'active');
            s.classList.add('far');
        });
        ratingText.textContent = 'Select your rating';
        submitRatingBtn.disabled = true;
        if (document.getElementById('ratingComment')) {
            document.getElementById('ratingComment').value = '';
        }
        
        if (issueTypeSelect) issueTypeSelect.value = '';
        if (issueDescriptionField) issueDescriptionField.value = '';
    }
    
    function getRatingText(rating) {
        switch(rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select your rating';
        }
    }
    
    const cancelOrderBtn = document.querySelector('.cancel-order-btn');
    if (cancelOrderBtn) {
        cancelOrderBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel this order?')) {
                alert('Order cancellation would be processed here');
            }
        });
    }
    
    const reorderBtn = document.querySelector('.reorder-btn');
    if (reorderBtn) {
        reorderBtn.addEventListener('click', function() {
            alert('Order will be recreated with the same specifications');
        });
    }
    
    const bidTabButtons = document.querySelectorAll('.bid-tab-button');
    const bidTabContents = document.querySelectorAll('.bid-tab-content');
    
    bidTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.dataset.target;
            
            bidTabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            bidTabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            document.getElementById(target).style.display = 'block';
        });
    });
    
    const viewBidsButtons = document.querySelectorAll('.view-bids-btn');
    
    viewBidsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bidSection = this.closest('.bid-section');
            const bidsList = bidSection.querySelector('.bids-list');
            
            if (bidsList.style.display === 'none' || !bidsList.style.display) {
                bidsList.style.display = 'flex';
                this.innerHTML = '<i class="fas fa-chevron-up"></i> Hide Bids';
            } else {
                bidsList.style.display = 'none';
                this.innerHTML = '<i class="fas fa-chevron-down"></i> View Bids';
            }
        });
    });
    
    const awardButtons = document.querySelectorAll('.award-btn');
    
    awardButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bidderName = this.dataset.bidder;
            
            if (confirm(`Are you sure you want to award this project to ${bidderName}?`)) {
                alert(`Project awarded to ${bidderName}! They have been notified.`);
                
                const card = this.closest('.order-card');
                const statusBadge = card.querySelector('.order-status');
                
                statusBadge.className = 'order-status awarded';
                statusBadge.innerHTML = '<i class="fas fa-trophy"></i> Awarded';
                
                const bidActions = card.querySelectorAll('.bid-actions');
                bidActions.forEach(action => {
                    action.style.display = 'none';
                });
                
                card.querySelector('.bid-section').innerHTML = `
                    <div class="awarded-message">
                        <p><i class="fas fa-check-circle"></i> Awarded to ${bidderName}</p>
                    </div>
                `;
            }
        });
    });
    
    const statusChangeButtons = document.querySelectorAll('.change-status-btn');
    
    statusChangeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const newStatus = this.dataset.status;
            const listingId = this.dataset.listing;
            
            if (confirm(`Are you sure you want to change this listing to ${newStatus}?`)) {
                console.log(`Changing listing ${listingId} status to ${newStatus}`);
                
                const card = this.closest('.order-card');
                const statusBadge = card.querySelector('.order-status');
                const statusActions = card.querySelector('.status-actions');
                
                switch(newStatus) {
                    case 'active':
                        statusBadge.className = 'order-status active';
                        statusBadge.innerHTML = '<i class="fas fa-bolt"></i> Active';
                        break;
                    case 'completed':
                        statusBadge.className = 'order-status completed';
                        statusBadge.innerHTML = '<i class="fas fa-check-circle"></i> Completed';
                        break;
                    case 'cancelled':
                        statusBadge.className = 'order-status cancelled';
                        statusBadge.innerHTML = '<i class="fas fa-ban"></i> Cancelled';
                        break;
                }
                
                if (statusActions) {
                    statusActions.style.display = 'none';
                }
                
                alert(`Listing status changed to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
            }
        });
    });
    
    const contactBidderButtons = document.querySelectorAll('.contact-bidder-btn');
    
    contactBidderButtons.forEach(button => {
        button.addEventListener('click', function() {
            const bidderName = this.dataset.bidder;
            alert(`Opening message dialog with ${bidderName}...`);
        });
    });
    
    const bidSortSelect = document.getElementById('bidSortSelect');
    
    if (bidSortSelect) {
        bidSortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const bidsList = document.querySelector('.bids-list');
            const bids = Array.from(bidsList.querySelectorAll('.bid-card'));
            
            bids.sort((a, b) => {
                if (sortValue === 'price-asc') {
                    return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
                } else if (sortValue === 'price-desc') {
                    return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
                } else if (sortValue === 'rating-desc') {
                    return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
                }
                return 0;
            });
            
            bidsList.innerHTML = '';
            bids.forEach(bid => {
                bidsList.appendChild(bid);
            });
        });
    }
});