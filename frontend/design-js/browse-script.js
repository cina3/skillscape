document.addEventListener('DOMContentLoaded', function() {
    const filterButton = document.querySelector('.filter-button');
    const filterOptions = document.querySelector('.filter-options');
    
    const filterOverlay = document.createElement('div');
    filterOverlay.className = 'filter-overlay';
    document.body.appendChild(filterOverlay);
    
    if (filterButton && filterOptions) {
        filterButton.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('active');
            filterOptions.classList.toggle('active');
            
            if (window.innerWidth <= 768) {
                filterOverlay.classList.toggle('active');
                if (filterOptions.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        });
        
        filterOverlay.addEventListener('click', function() {
            filterButton.classList.remove('active');
            filterOptions.classList.remove('active');
            filterOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        document.addEventListener('click', function(e) {
            if (!filterOptions.contains(e.target) && e.target !== filterButton && !filterButton.contains(e.target)) {
                filterButton.classList.remove('active');
                filterOptions.classList.remove('active');
                filterOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
        
        filterOptions.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
    
    const sortDropdown = document.querySelector('.sort-dropdown');
    const sortOptions = document.querySelector('.sort-options');
    
    if (sortDropdown && sortOptions) {
        sortDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
            sortOptions.classList.toggle('active');
        });
        
        document.addEventListener('click', function() {
            if (sortOptions.classList.contains('active')) {
                sortOptions.classList.remove('active');
            }
        });
        
        sortOptions.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        
        const sortOptionItems = document.querySelectorAll('.sort-option');
        sortOptionItems.forEach(option => {
            option.addEventListener('click', function() {
                sortOptionItems.forEach(item => item.classList.remove('selected'));
                this.classList.add('selected');
                const selectedText = this.textContent.trim().replace(/^✓\s*/, '');
                document.querySelector('.sort-dropdown span').textContent = selectedText;
                sortOptions.classList.remove('active');
            });
        });
    }
    
    const sliders = document.querySelectorAll('.filter-slider');
    sliders.forEach(slider => {
        const valueDisplay = slider.nextElementSibling.querySelector('.filter-slider-value');
        const badge = slider.closest('.filter-group').querySelector('.filter-group-badge');
        
        function updateSliderBackground(slider) {
            const value = slider.value;
            const min = slider.min || 0;
            const max = slider.max || 100;
            const percentage = ((value - min) / (max - min)) * 100;
            slider.style.background = `linear-gradient(to right, var(--brand-blue) 0%, var(--brand-blue) ${percentage}%, #e3eaf6 ${percentage}%, #e3eaf6 100%)`;
        }
        
        updateSliderBackground(slider);
        
        if (valueDisplay) {
            if (slider.classList.contains('rating-slider')) {
                valueDisplay.textContent = slider.value + '★';
                if (badge) badge.textContent = slider.value + '★';
            } else if (slider.id === 'priceSlider') {
                valueDisplay.textContent = '$' + slider.value;
                if (badge) badge.textContent = '$' + slider.value;
            } else {
                valueDisplay.textContent = slider.value;
                if (badge) badge.textContent = slider.value;
            }
        }
        
        slider.addEventListener('input', function() {
            updateSliderBackground(this);
            
            if (valueDisplay) {
                if (slider.classList.contains('rating-slider')) {
                    valueDisplay.textContent = slider.value + '★';
                    if (badge) badge.textContent = slider.value + '★';
                } else if (slider.id === 'priceSlider') {
                    valueDisplay.textContent = '$' + slider.value;
                    if (badge) badge.textContent = '$' + slider.value;
                } else {
                    valueDisplay.textContent = slider.value;
                    if (badge) badge.textContent = slider.value;
                }
            }
        });
    });
    
    const priceTypeOptions = document.querySelectorAll('.price-type-option');
    priceTypeOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (!this.classList.contains('selected')) {
                priceTypeOptions.forEach(item => item.classList.remove('selected'));
                this.classList.add('selected');
                const selectedPriceType = this.textContent.trim();
                console.log('Selected price type:', selectedPriceType);
                if (window.applyPriceTypeFilter) {
                    window.applyPriceTypeFilter(selectedPriceType);
                }
            }
        });
    });
    
    const filterResetBtn = document.querySelector('.filter-reset');
    if (filterResetBtn) {
        filterResetBtn.addEventListener('click', function() {
            sliders.forEach(slider => {
                const defaultValue = slider.getAttribute('data-default') || slider.min;
                slider.value = defaultValue;
                const inputEvent = new Event('input', { bubbles: true });
                slider.dispatchEvent(inputEvent);
            });
            
            if (priceTypeOptions.length) {
                priceTypeOptions.forEach(option => option.classList.remove('selected'));
                priceTypeOptions[0].classList.add('selected');
            }
            
            this.classList.add('reset-active');
            setTimeout(() => {
                this.classList.remove('reset-active');
            }, 300);
        });
    }
    
    const filterApplyBtn = document.querySelector('.filter-apply');
    if (filterApplyBtn) {
        filterApplyBtn.addEventListener('click', function() {
            console.log('Applying filters...');
            const filters = {
                priceType: document.querySelector('.price-type-option.selected')?.textContent.trim(),
                price: document.getElementById('priceSlider')?.value,
                orderCount: document.getElementById('orderCountSlider')?.value,
                reviewCount: document.getElementById('reviewCountSlider')?.value,
                freelancerRating: document.getElementById('freelancerRatingSlider')?.value,
                rating: document.getElementById('ratingSlider')?.value
            };
            console.log('Applied filters:', filters);
            if (window.applyFilters) {
                window.applyFilters(filters);
            }
            filterButton.classList.remove('active');
            filterOptions.classList.remove('active');
            filterOverlay.classList.remove('active');
            document.body.style.overflow = '';
            this.classList.add('apply-active');
            setTimeout(() => {
                this.classList.remove('apply-active');
            }, 300);
        });
    }
    
    const paginationItems = document.querySelectorAll('.pagination-item');
    paginationItems.forEach(item => {
        item.addEventListener('click', function() {
            paginationItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    const nextPageButton = document.querySelector('.next-page');
    if (nextPageButton) {
        nextPageButton.addEventListener('click', function() {
            alert('Next page of results will be loaded');
        });
    }

    const categoryNavItems = document.querySelectorAll('.category-nav-item');

    function setActiveCategory(selectedCategoryItem) {
        categoryNavItems.forEach(item => {
            item.classList.remove('active-category');
        });
        if (selectedCategoryItem) {
            selectedCategoryItem.classList.add('active-category');
            const category = selectedCategoryItem.dataset.category;
            const newUrl = window.location.pathname + '?category=' + category;
            history.pushState({path: newUrl}, '', newUrl);
        } else {
            const newUrl = window.location.pathname;
            history.pushState({path: newUrl}, '', newUrl);
        }
        if (window.loadGigs) {
            window.loadGigs();
        }
    }

    categoryNavItems.forEach(item => {
        item.addEventListener('click', function() {
            if (this.classList.contains('active-category')) {
                setActiveCategory(null); 
            } else {
                setActiveCategory(this);
            }
        });
    });

    function loadCategoryFromURL() {
        const params = new URLSearchParams(window.location.search);
        const category = params.get('category');
        const categoryItemToActivate = category ? document.querySelector(`.category-nav-item[data-category="${category}"]`) : null;
        
        categoryNavItems.forEach(item => item.classList.remove('active-category'));
        if (categoryItemToActivate) {
            categoryItemToActivate.classList.add('active-category');
        }
    }

    loadCategoryFromURL();

    window.addEventListener('popstate', function() {
        loadCategoryFromURL();
        if (window.loadGigs) {
            window.loadGigs();
        }
    });
});