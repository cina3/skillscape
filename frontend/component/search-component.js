document.addEventListener('DOMContentLoaded', function() {
    const searchComponent = document.getElementById('skillscapeSearchComponent'); 
    if (!searchComponent) {
        return;
    }

    const searchInput = searchComponent.querySelector('#searchInput');
    const searchInputWrapper = searchComponent.querySelector('#searchInputWrapper');
    const searchResultsDropdown = searchComponent.querySelector('#searchResultsDropdown');
    const searchButton = searchComponent.querySelector('#searchButton');

    if (!searchInput || !searchResultsDropdown || !searchInputWrapper || !searchButton) {
        console.error('Search component inner elements not found. Check IDs: searchInput, searchInputWrapper, searchResultsDropdown, searchButton within skillscapeSearchComponent.');
        return;
    }

    const showDropdown = () => {
        searchResultsDropdown.classList.add('visible');
        searchInputWrapper.classList.add('focused');
    };

    const hideDropdown = () => {
        searchResultsDropdown.classList.remove('visible');
        searchInputWrapper.classList.remove('focused');
    };

    searchInput.addEventListener('focus', showDropdown);

    searchInput.addEventListener('click', function(event) {
        event.stopPropagation(); 
        showDropdown();
    });
    
    searchButton.addEventListener('click', function(event) {
        event.stopPropagation();
        if (searchResultsDropdown.classList.contains('visible')) {
            hideDropdown();
        } else {
            searchInput.focus(); 
        }
    });

    searchResultsDropdown.addEventListener('click', function(event) {
        event.stopPropagation(); 
        const item = event.target.closest('.search-result-item');
        if (item) {
            const title = item.querySelector('.result-title').textContent;
            console.log('Selected item:', title); 
            hideDropdown();
        }
    });

    document.addEventListener('click', function(event) {
        if (!searchComponent.contains(event.target)) {
            hideDropdown();
        }
    });

    searchInput.addEventListener('input', function() {
        const filterText = searchInput.value.toLowerCase();
        const items = searchResultsDropdown.querySelectorAll('.search-result-item');
        
        let hasVisibleItems = false;
        items.forEach(function(item) {
            const titleElement = item.querySelector('.result-title');
            const categoryElement = item.querySelector('.result-category');
            const title = titleElement ? titleElement.textContent.toLowerCase() : "";
            const category = categoryElement ? categoryElement.textContent.toLowerCase() : "";

            if (title.includes(filterText) || category.includes(filterText)) {
                item.style.display = "";
                hasVisibleItems = true;
            } else {
                item.style.display = "none";
            }
        });

        if (filterText.length > 0 && hasVisibleItems) {
            showDropdown();
        } else if (filterText.length > 0 && !hasVisibleItems) {
            showDropdown(); 
        } else if (filterText.length === 0 && document.activeElement === searchInput) {
            showDropdown(); 
        }
    });
});
