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
});
