document.addEventListener('DOMContentLoaded', function() {
    console.log('[ProfileScript] DOM fully loaded and parsed');
    
    setupPortfolioViewer();
    
    setupProposalCards();
    
    setupReviewInteractions();
    
    function setupPortfolioViewer() {
        const portfolioItems = document.querySelectorAll('.portfolio-item:not(.more-items)');
        
        portfolioItems.forEach(item => {
            item.addEventListener('click', function() {
                console.log('Portfolio item clicked:', item.querySelector('img').getAttribute('alt'));
            });
        });
        
        const moreItemsBtn = document.querySelector('.portfolio-item.more-items');
        if (moreItemsBtn) {
            moreItemsBtn.addEventListener('click', function() {
                console.log('View more portfolio items clicked');
            });
        }
    }
    
    function setupProposalCards() {
        const viewButtons = document.querySelectorAll('.proposal-card .view-btn');
        
        viewButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const proposalTitle = this.closest('.proposal-card').querySelector('.proposal-title').textContent;
                console.log('View proposal clicked:', proposalTitle);
            });
        });
    }
    
    function setupReviewInteractions() {
        const viewMoreBtn = document.querySelector('.view-more-btn');
        
        if (viewMoreBtn) {
            viewMoreBtn.addEventListener('click', function() {
                console.log('View more reviews clicked');
            });
        }
    }
});