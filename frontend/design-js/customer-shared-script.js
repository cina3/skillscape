document.addEventListener('DOMContentLoaded', function() {
    console.log('[CustomerSharedScript] DOM fully loaded and parsed. Starting component loading.');

    // Function to load HTML content into a placeholder
    function loadHTMLFragment(url, placeholderId) {
        console.log(`[CustomerSharedScript] Attempting to load HTML from ${url} into #${placeholderId}`);
        return fetch(url)
            .then(response => {
                console.log(`[CustomerSharedScript] Fetch response for ${url}: Status ${response.status}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                    console.log(`[CustomerSharedScript] Successfully loaded HTML from ${url} into #${placeholderId}`);
                } else {
                    console.error(`[CustomerSharedScript] Placeholder with ID '${placeholderId}' not found in the document.`);
                    throw new Error(`[CustomerSharedScript] Placeholder with ID '${placeholderId}' not found.`);
                }
            })
            .catch(error => {
                console.error(`[CustomerSharedScript] Error loading HTML from ${url}:`, error);
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = `<p style="color:red; border:1px solid red; padding:10px;">Failed to load component from ${url}. Check console for details.</p>`;
                }
                throw error; // Re-throw to be caught by Promise.all
            });
    }

    // Paths are relative to the HTML file including this script (e.g., browse.html)
    const headerPath = '../customer/header.html'; 
    const menuPath = '../customer/hamburger-menu.html';

    Promise.all([
        loadHTMLFragment(headerPath, 'header-placeholder'),
        loadHTMLFragment(menuPath, 'hamburger-menu-placeholder')
    ])
    .then(() => {
        console.log('[CustomerSharedScript] Both header and hamburger menu HTML successfully loaded. Proceeding to setup event listeners.');
        setupEventListeners();
    })
    .catch(error => {
        console.error('[CustomerSharedScript] Critical error: Failed to load one or more HTML components. Event listeners will not be set up.', error);
        // Optionally, display a more prominent error message on the page
        const body = document.querySelector('body');
        if (body && !document.getElementById('critical-load-error')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'critical-load-error';
            errorDiv.innerHTML = '<p style="color:red; background-color:pink; text-align:center; padding:20px; font-weight:bold;">Critical error: Could not load page components. Please open the browser console (F12) for details.</p>';
            body.prepend(errorDiv);
        }
    });

    function setupEventListeners() {
        console.log('[CustomerSharedScript] Attempting to set up event listeners...');
        const menuIcon = document.querySelector('.site-header .menu-icon');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const closeMenuBtn = document.getElementById('closeMenuBtn');

        if (menuIcon && hamburgerMenu) {
            console.log('[CustomerSharedScript] Found menuIcon and hamburgerMenu. Attaching open listener.');
            menuIcon.addEventListener('click', () => {
                console.log('[CustomerSharedScript] Menu icon clicked.');
                hamburgerMenu.classList.toggle('open');
                menuIcon.classList.toggle('menu-open');
            });
        } else {
            if (!menuIcon) console.error('[CustomerSharedScript] Menu icon (.site-header .menu-icon) not found after HTML load. Cannot attach open listener.');
            if (!hamburgerMenu) console.error('[CustomerSharedScript] Hamburger menu (#hamburgerMenu) not found after HTML load. Cannot attach open listener.');
        }

        if (closeMenuBtn && hamburgerMenu) {
            console.log('[CustomerSharedScript] Found closeMenuBtn. Attaching close listener.');
            closeMenuBtn.addEventListener('click', () => {
                console.log('[CustomerSharedScript] Close button clicked.');
                closeMenuBtn.classList.add('spinning');
                hamburgerMenu.classList.remove('open');
                if (menuIcon) {
                    menuIcon.classList.remove('menu-open');
                }
                // Ensure the animationend listener is only added once or managed properly
                const onAnimationEnd = () => {
                    closeMenuBtn.classList.remove('spinning');
                    closeMenuBtn.removeEventListener('animationend', onAnimationEnd);
                };
                closeMenuBtn.addEventListener('animationend', onAnimationEnd);
            });
        } else {
            if (!closeMenuBtn) console.error('[CustomerSharedScript] Close button (#closeMenuBtn) not found after HTML load. Cannot attach close listener.');
            // hamburgerMenu might be null if menuIcon was also null, already logged.
        }

        // Optional: Close menu if clicking outside of it
        document.addEventListener('click', function(event) {
            const currentHamburgerMenu = document.getElementById('hamburgerMenu'); 
            if (currentHamburgerMenu && currentHamburgerMenu.classList.contains('open')) {
                const currentMenuIcon = document.querySelector('.site-header .menu-icon');
                const isClickInsideMenu = currentHamburgerMenu.contains(event.target);
                const isClickOnMenuIcon = currentMenuIcon ? currentMenuIcon.contains(event.target) : false;

                if (!isClickInsideMenu && !isClickOnMenuIcon) {
                    console.log('[CustomerSharedScript] Clicked outside menu. Closing menu.');
                    currentHamburgerMenu.classList.remove('open');
                    if (currentMenuIcon) {
                        currentMenuIcon.classList.remove('menu-open');
                    }
                }
            }
        });
        console.log('[CustomerSharedScript] Event listeners setup process complete.');
    }
});