document.addEventListener('DOMContentLoaded', function() {
    // Function to load HTML content into a placeholder
    function loadHTML(url, placeholderId, callback) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                    if (callback) callback(); // Execute callback after loading
                } else {
                    console.warn(`Placeholder with ID '${placeholderId}' not found.`);
                }
            })
            .catch(error => console.error('Error loading HTML:', error));
    }

    // Load header
    loadHTML('../customer/header.html', 'header-placeholder', () => {
        // Callback to attach event listeners after header is loaded
        const menuIcon = document.querySelector('.site-header .menu-icon');
        const hamburgerMenu = document.getElementById('hamburgerMenu'); // Get menu after it's loaded

        if (menuIcon && hamburgerMenu) {
            menuIcon.addEventListener('click', () => {
                hamburgerMenu.classList.toggle('open');
                menuIcon.classList.toggle('menu-open'); // Toggle the menu-open class for animation
            });
        } else {
            // Poll for elements if they are not immediately available after loadHTML callback
            // This is a fallback, ideally elements are found right after innerHTML is set.
            let attempts = 0;
            const intervalId = setInterval(() => {
                const menuIconRetry = document.querySelector('.site-header .menu-icon');
                const hamburgerMenuRetry = document.getElementById('hamburgerMenu');
                if (menuIconRetry && hamburgerMenuRetry) {
                    menuIconRetry.addEventListener('click', () => {
                        hamburgerMenuRetry.classList.toggle('open');
                        menuIconRetry.classList.toggle('menu-open'); // Toggle the menu-open class for animation
                    });
                    clearInterval(intervalId);
                } else if (attempts++ > 10) { // Stop after ~1 second
                    console.warn('Could not find menu icon or hamburger menu after multiple attempts.');
                    clearInterval(intervalId);
                }
            }, 100);
        }
    });

    // Load hamburger menu
    loadHTML('../customer/hamburger-menu.html', 'hamburger-menu-placeholder', () => {
        // Callback to attach event listeners after menu is loaded
        const closeMenuBtn = document.getElementById('closeMenuBtn');
        const hamburgerMenu = document.getElementById('hamburgerMenu'); // Re-select in case it wasn't available globally

        if (closeMenuBtn && hamburgerMenu) {
            closeMenuBtn.addEventListener('click', () => {
                // Add spinning class
                closeMenuBtn.classList.add('spinning');
                
                // Close the menu
                hamburgerMenu.classList.remove('open');
                
                // Remove menu-open class from menu icon when closing menu
                const menuIcon = document.querySelector('.site-header .menu-icon');
                if (menuIcon) {
                    menuIcon.classList.remove('menu-open');
                }

                // Remove spinning class after animation finishes
                closeMenuBtn.addEventListener('animationend', () => {
                    closeMenuBtn.classList.remove('spinning');
                }, { once: true }); // { once: true } ensures the listener is removed after firing
            });
        } else {
             // Poll for elements if they are not immediately available
            let attempts = 0;
            const intervalId = setInterval(() => {
                const closeMenuBtnRetry = document.getElementById('closeMenuBtn');
                const hamburgerMenuRetry = document.getElementById('hamburgerMenu');
                if (closeMenuBtnRetry && hamburgerMenuRetry) {
                     closeMenuBtnRetry.addEventListener('click', () => {
                        // Add spinning class
                        closeMenuBtnRetry.classList.add('spinning');
                        
                        // Close the menu
                        hamburgerMenuRetry.classList.remove('open');
                        
                        // Remove menu-open class from menu icon when closing menu
                        const menuIcon = document.querySelector('.site-header .menu-icon');
                        if (menuIcon) {
                            menuIcon.classList.remove('menu-open');
                        }

                        // Remove spinning class after animation finishes
                        closeMenuBtnRetry.addEventListener('animationend', () => {
                            closeMenuBtnRetry.classList.remove('spinning');
                        }, { once: true });
                    });
                    clearInterval(intervalId);
                } else if (attempts++ > 10) {
                    console.warn('Could not find close button or hamburger menu after multiple attempts.');
                    clearInterval(intervalId);
                }
            }, 100);
        }

        // Optional: Close menu if clicking outside of it
        document.addEventListener('click', function(event) {
            const hamburgerMenuElem = document.getElementById('hamburgerMenu');
            const menuIconElem = document.querySelector('.site-header .menu-icon');

            if (hamburgerMenuElem && hamburgerMenuElem.classList.contains('open')) {
                // Check if the click is outside the menu and not on the menu icon
                const isClickInsideMenu = hamburgerMenuElem.contains(event.target);
                const isClickOnMenuIcon = menuIconElem ? menuIconElem.contains(event.target) : false;

                if (!isClickInsideMenu && !isClickOnMenuIcon) {
                    hamburgerMenuElem.classList.remove('open');
                    
                    // Remove menu-open class from menu icon when closing menu
                    const menuIcon = document.querySelector('.site-header .menu-icon');
                    if (menuIcon) {
                        menuIcon.classList.remove('menu-open');
                    }
                }
            }
        });
    });
});