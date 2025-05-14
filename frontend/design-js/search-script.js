document.addEventListener('DOMContentLoaded', function() {
    window.initializeAllSearchBars();
});

window.initializeAllSearchBars = function() {
    const searchInputs = document.querySelectorAll('.search-bar input[type="search"], #searchInput');
    const searchButtons = document.querySelectorAll('.search-bar .search-icon, #searchButton');
    const searchResultsDropdowns = document.querySelectorAll('.search-results-dropdown');
    
    if (searchInputs.length === 0 && searchResultsDropdowns.length === 0) {
        return;
    }
    
    searchInputs.forEach((searchInput) => {
        const searchComponentRoot = searchInput.closest('.search-container') || searchInput.closest('.search-input-wrapper') || searchInput.closest('.search-bar');
        if (!searchComponentRoot) {
            console.warn("Search component root not found for input:", searchInput);
            return;
        }

        const closestDropdown = searchComponentRoot.querySelector('.search-results-dropdown');
        
        if (!closestDropdown) {
            console.warn("Search results dropdown not found within root:", searchComponentRoot);
            return;
        }
        
        const newSearchInput = searchInput.cloneNode(true);
        searchInput.parentNode.replaceChild(newSearchInput, searchInput);
        
        newSearchInput.addEventListener('focus', function() {
            showSearchResults(closestDropdown);
            if (this.value.trim().toLowerCase().length === 0) {
                resetSearchResults(closestDropdown);
            }
        });
        
        newSearchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            if (query.length > 0) {
                showSearchResults(closestDropdown);
                filterSearchResults(query, closestDropdown);
            } else {
                showSearchResults(closestDropdown);
                resetSearchResults(closestDropdown);
            }
        });
        
        newSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                submitSearch(this);
            }
        });
    });
    
    searchButtons.forEach((searchButton) => {
        const searchComponentRoot = searchButton.closest('.search-container') || searchButton.closest('.search-input-wrapper') || searchButton.closest('.search-bar');
        if (!searchComponentRoot) {
            console.warn("Search component root not found for button:", searchButton);
            return;
        }

        const searchInput = searchComponentRoot.querySelector('input[type="search"], .search-input');

        const newSearchButton = searchButton.cloneNode(true);
        searchButton.parentNode.replaceChild(newSearchButton, searchButton);

        if (searchInput) {
            newSearchButton.addEventListener('click', function(e) {
                submitSearch(searchInput);
            });
        }
    });
    
    if (!document.body.hasAttribute('data-search-click-outside-listener')) {
        document.addEventListener('click', function(event) {
            const isClickInsideSearchComponent = Array.from(document.querySelectorAll('.search-container, .search-bar, .search-input-wrapper'))
                .some(container => container.contains(event.target));
            
            if (!isClickInsideSearchComponent) {
                hideAllSearchResults();
            }
        });
        document.body.setAttribute('data-search-click-outside-listener', 'true');
    }
    
    searchResultsDropdowns.forEach(dropdown => {
        if (!dropdown) return;
        
        dropdown.addEventListener('click', function(event) {
            event.stopPropagation();
        });

        const resultItems = dropdown.querySelectorAll('.search-result-item');
        resultItems.forEach(item => {
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);

            newItem.addEventListener('click', function() {
                const resultTitleElement = this.querySelector('.result-title');
                const resultCategoryElement = this.querySelector('.result-category');
                
                if (resultTitleElement && resultCategoryElement) {
                    const resultTitle = resultTitleElement.textContent;
                    let categoryType = this.dataset.categoryType;
                    if (!categoryType && resultCategoryElement) {
                        categoryType = resultCategoryElement.textContent.replace('in ', '').trim().toLowerCase();
                    }

                    if (resultTitle && categoryType) {
                        navigateToSearchResult(resultTitle, categoryType);
                        hideAllSearchResults();
                    } else {
                        console.warn("Could not determine title or category type for navigation.", this);
                    }
                }
            });
        });
    });

    if (window.location.pathname.includes('search.html')) {
        const categoryTabs = document.querySelectorAll('.category-tab');
        if (categoryTabs.length > 0) {
            categoryTabs.forEach(tab => {
                const newTab = tab.cloneNode(true);
                tab.parentNode.replaceChild(newTab, tab);
                newTab.addEventListener('click', function() {
                    document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                    filterResultsByCategory(this.textContent.trim().toLowerCase());
                });
            });
        }

        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (query) {
            const searchPageInput = document.querySelector('.search-page-container #searchInput, .site-header input[type="search"]');
            if (searchPageInput) {
                searchPageInput.value = query;
            }
            document.title = `Search Results for "${query}" - SkillScape`;
            const heading = document.querySelector('.search-page-container .search-header h1');
            if (heading) {
                heading.textContent = `Search Results for "${query}"`;
            }
        }
    }
};

function showSearchResults(dropdown) {
    if (dropdown) {
        dropdown.style.display = 'block';
        dropdown.classList.add('show');
    }
}

function hideAllSearchResults() {
    const searchResultsDropdowns = document.querySelectorAll('.search-results-dropdown');
    searchResultsDropdowns.forEach(dropdown => {
        if (dropdown) {
            dropdown.classList.remove('show');
            setTimeout(() => {
                if (!dropdown.classList.contains('show')) {
                    dropdown.style.display = 'none';
                }
            }, 200);
        }
    });
}

function resetSearchResults(dropdown) {
    if (!dropdown) return;
    
    const resultItems = dropdown.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
        item.style.display = 'flex';
    });
    
    const noResultsItem = dropdown.querySelector('.no-results');
    if (noResultsItem) {
        noResultsItem.style.display = 'none';
    }
}

function filterSearchResults(query, dropdown) {
    if (!dropdown) return;
    
    const resultItems = dropdown.querySelectorAll('.search-result-item:not(.no-results)');
    let visibleItemsCount = 0;
    
    resultItems.forEach(item => {
        const titleElement = item.querySelector('.result-title');
        const categoryElement = item.querySelector('.result-category');
        let match = false;

        if (titleElement && titleElement.textContent.toLowerCase().includes(query)) {
            match = true;
        }
        if (categoryElement && categoryElement.textContent.toLowerCase().includes(query)) {
            match = true;
        }
        
        if (match) {
            item.style.display = 'flex';
            visibleItemsCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    let noResultsItem = dropdown.querySelector('.no-results');
    if (visibleItemsCount === 0 && query.length > 0) {
        if (!noResultsItem) {
            noResultsItem = document.createElement('div');
            noResultsItem.className = 'search-result-item no-results';
            noResultsItem.innerHTML = `
                <div class="result-text">
                    <span class="result-title">No results found for "${query}"</span>
                    <span class="result-category">Try a different search term</span>
                </div>
            `;
            dropdown.appendChild(noResultsItem);
        }
        noResultsItem.style.display = 'flex';
        const noResultsTitle = noResultsItem.querySelector('.result-title');
        if (noResultsTitle) noResultsTitle.textContent = `No results found for "${query}"`;

    } else if (noResultsItem) {
        noResultsItem.style.display = 'none';
    }
}

function submitSearch(searchInput) {
    const query = searchInput.value.trim();
    if (query) {
        const currentPath = window.location.pathname;
        const isCustomer = currentPath.includes('/customer/');
        const searchPath = isCustomer ? '../customer/search.html' : '../freelancer/search.html';
        window.location.href = `${searchPath}?q=${encodeURIComponent(query)}`;
    }
}

function navigateToSearchResult(title, category) {
    const currentPath = window.location.pathname;
    const isCustomer = currentPath.includes('/customer/');
    
    let targetUrl;
    
    switch (category) {
        case 'categories':
            targetUrl = isCustomer ? 
                `../customer/browse.html?category=${encodeURIComponent(title.toLowerCase())}` :
                `../freelancer/browse.html?category=${encodeURIComponent(title.toLowerCase())}`;
            break;
        case 'freelancers':
            targetUrl = isCustomer ? 
                `../customer/freelancer-profile.html?username=${encodeURIComponent(title)}` :
                `../freelancer/freelancer-profile.html?username=${encodeURIComponent(title)}`;
            break;
        case 'proposals':
            targetUrl = isCustomer ?
                `../customer/proposal.html?title=${encodeURIComponent(title)}` :
                `../freelancer/proposal.html?title=${encodeURIComponent(title)}`;
            break;
        default:
            targetUrl = isCustomer ?
                `../customer/search.html?q=${encodeURIComponent(title)}` :
                `../freelancer/search.html?q=${encodeURIComponent(title)}`;
    }
    
    window.location.href = targetUrl;
}

function filterResultsByCategory(category) {
    const resultSections = document.querySelectorAll('.results-section-title');
    
    if (category === 'all') {
        resultSections.forEach(section => {
            section.style.display = 'block';
            const grid = section.nextElementSibling;
            if (grid && grid.classList.contains('results-grid')) {
                grid.style.display = 'grid';
            }
        });
        return;
    }
    
    resultSections.forEach(section => {
        const sectionTitle = section.textContent.toLowerCase();
        const matchesCategory = sectionTitle.includes(category);
        
        section.style.display = matchesCategory ? 'block' : 'none';
        
        const grid = section.nextElementSibling;
        if (grid && grid.classList.contains('results-grid')) {
            grid.style.display = matchesCategory ? 'grid' : 'none';
        }
    });
}