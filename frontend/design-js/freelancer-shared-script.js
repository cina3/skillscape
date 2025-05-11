document.addEventListener('DOMContentLoaded', function() {
    console.log('[FreelancerSharedScript] DOM fully loaded and parsed. Starting component loading.');

    function loadHTMLFragment(url, placeholderId) {
        console.log(`[FreelancerSharedScript] Attempting to load HTML from ${url} into #${placeholderId}`);
        return fetch(url)
            .then(response => {
                console.log(`[FreelancerSharedScript] Fetch response for ${url}: Status ${response.status}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                    console.log(`[FreelancerSharedScript] Successfully loaded HTML from ${url} into #${placeholderId}`);
                } else {
                    console.error(`[FreelancerSharedScript] Placeholder with ID '${placeholderId}' not found in the document.`);
                    throw new Error(`[FreelancerSharedScript] Placeholder with ID '${placeholderId}' not found.`);
                }
            })
            .catch(error => {
                console.error(`[FreelancerSharedScript] Error loading HTML from ${url}:`, error);
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = `<p style="color:red; border:1px solid red; padding:10px;">Failed to load component from ${url}. Check console for details.</p>`;
                }
                throw error;
            });
    }

    function setActiveMenuItem() {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (!hamburgerMenu) {
            console.log('[FreelancerSharedScript] Hamburger menu not found for setActiveMenuItem.');
            return;
        }

        const navLinks = hamburgerMenu.querySelectorAll('.menu-nav > ul > li > a');
        const currentPagePath = window.location.pathname;
        const currentPageFilename = currentPagePath.substring(currentPagePath.lastIndexOf('/') + 1) || 'home.html'; // Default to home.html if path ends in /

        navLinks.forEach(link => {
            link.classList.remove('active-menu-item');
            const existingDot = link.querySelector('i.fa-circle');
            if (existingDot) {
                existingDot.remove();
            }

            const linkHref = link.getAttribute('href');
            if (linkHref) {
                const linkFilename = linkHref.substring(linkHref.lastIndexOf('/') + 1);
                const linkPageName = linkFilename.split('?')[0];

                if (linkPageName === currentPageFilename) {
                    link.classList.add('active-menu-item');
                    const dotIcon = document.createElement('i');
                    dotIcon.className = 'fas fa-circle';
                    dotIcon.style.fontSize = '0.5em';
                    dotIcon.style.verticalAlign = 'middle';
                    dotIcon.style.marginRight = '8px';
                    link.prepend(dotIcon);
                }
            }
        });
        console.log('[FreelancerSharedScript] Active menu item check complete.');
    }

    const headerPath = '../freelancer/header.html';
    const menuPath = '../freelancer/hamburger-menu.html';

    Promise.all([
        loadHTMLFragment(headerPath, 'header-placeholder'),
        loadHTMLFragment(menuPath, 'hamburger-menu-placeholder')
    ])
    .then(() => {
        console.log('[FreelancerSharedScript] Both header and hamburger menu HTML successfully loaded. Proceeding to setup event listeners.');
        setupEventListeners();
        setActiveMenuItem();
    })
    .catch(error => {
        console.error('[FreelancerSharedScript] Critical error: Failed to load one or more HTML components. Event listeners will not be set up.', error);
        const body = document.querySelector('body');
        if (body && !document.getElementById('critical-load-error')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'critical-load-error';
            errorDiv.innerHTML = '<p style="color:red; background-color:pink; text-align:center; padding:20px; font-weight:bold;">Critical error: Could not load page components. Please open the browser console (F12) for details.</p>';
            body.prepend(errorDiv);
        }
    });

    function setupEventListeners() {
        console.log('[FreelancerSharedScript] Attempting to set up event listeners...');
        const menuIcon = document.querySelector('.site-header .menu-icon');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const closeMenuBtn = document.getElementById('closeMenuBtn');

        if (menuIcon && hamburgerMenu) {
            console.log('[FreelancerSharedScript] Found menuIcon and hamburgerMenu. Attaching open listener.');
            menuIcon.addEventListener('click', () => {
                console.log('[FreelancerSharedScript] Menu icon clicked.');
                hamburgerMenu.classList.toggle('open');
                menuIcon.classList.toggle('menu-open');
            });
        } else {
            if (!menuIcon) console.error('[FreelancerSharedScript] Menu icon (.site-header .menu-icon) not found after HTML load. Cannot attach open listener.');
            if (!hamburgerMenu) console.error('[FreelancerSharedScript] Hamburger menu (#hamburgerMenu) not found after HTML load. Cannot attach open listener.');
        }

        if (closeMenuBtn && hamburgerMenu) {
            console.log('[FreelancerSharedScript] Found closeMenuBtn. Attaching close listener.');
            closeMenuBtn.addEventListener('click', () => {
                console.log('[FreelancerSharedScript] Close button clicked.');
                closeMenuBtn.classList.add('spinning');
                hamburgerMenu.classList.remove('open');
                if (menuIcon) {
                    menuIcon.classList.remove('menu-open');
                }
                const onAnimationEnd = () => {
                    closeMenuBtn.classList.remove('spinning');
                    closeMenuBtn.removeEventListener('animationend', onAnimationEnd);
                };
                closeMenuBtn.addEventListener('animationend', onAnimationEnd);
            });
        } else {
            if (!closeMenuBtn) console.error('[FreelancerSharedScript] Close button (#closeMenuBtn) not found after HTML load. Cannot attach close listener.');
        }

        document.addEventListener('click', function(event) {
            const currentHamburgerMenu = document.getElementById('hamburgerMenu');
            if (currentHamburgerMenu && currentHamburgerMenu.classList.contains('open')) {
                const currentMenuIcon = document.querySelector('.site-header .menu-icon');
                const isClickInsideMenu = currentHamburgerMenu.contains(event.target);
                const isClickOnMenuIcon = currentMenuIcon ? currentMenuIcon.contains(event.target) : false;

                if (!isClickInsideMenu && !isClickOnMenuIcon) {
                    console.log('[FreelancerSharedScript] Clicked outside menu. Closing menu.');
                    currentHamburgerMenu.classList.remove('open');
                    if (currentMenuIcon) {
                        currentMenuIcon.classList.remove('menu-open');
                    }
                }
            }
        });
        console.log('[FreelancerSharedScript] Event listeners setup process complete.');
    }
});