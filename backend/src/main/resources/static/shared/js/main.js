const PUBLIC_PATHS = [
    '/', 
    '/landing/index.html',
    '/auth/login/login.html',
    '/auth/register/register.html',
    '/auth/forgot-password/forgot-password.html',
    '/auth/reset-password/reset-password.html',
    '/404.html'
];

function isCurrentPathPublic() {
    const currentPath = window.location.pathname;
    if (currentPath.endsWith('/') && PUBLIC_PATHS.includes(currentPath + 'index.html')) {
        return true;
    }
    return PUBLIC_PATHS.includes(currentPath);
}


const NAVBAR_HTML_PATH = '/shared/components/navbar.html';
console.log("main.js: Script loaded. NAVBAR_HTML_PATH =", NAVBAR_HTML_PATH);

let updateNavbarLinkVisibility = () => { 
    console.warn("main.js: updateNavbarLinkVisibility called before it was fully defined (e.g. before navbar loaded).");
};
window.updateNavbarLinkVisibility = () => { 
    if (typeof _updateNavbarLinkVisibilityScoped === 'function') {
        _updateNavbarLinkVisibilityScoped();
    } else {
        console.warn("main.js: _updateNavbarLinkVisibilityScoped not ready to be called via window object.");
    }
};


let _updateNavbarLinkVisibilityScoped = () => { 
    console.warn("main.js: _updateNavbarLinkVisibilityScoped called before navbar DOM ready.");
};

async function loadAndInitializeNavbar() {
    console.log("main.js: loadAndInitializeNavbar: Attempting to fetch navbar...");
    try {
        const response = await fetch(NAVBAR_HTML_PATH);
        console.log("main.js: loadAndInitializeNavbar: Fetch response status:", response.status, "OK:", response.ok);

        if (!response.ok) {
            const errorText = await response.text().catch(() => "Could not read error response body.");
            console.error(`main.js: Failed to load navbar HTML. Status: ${response.status}. Response body: ${errorText}`);
            throw new Error(`Failed to load navbar HTML: ${response.statusText} (Status: ${response.status})`);
        }

        const navbarHtml = await response.text();
        if (navbarHtml.trim() === "") {
            console.error("main.js: loadAndInitializeNavbar: Fetched navbar HTML is empty!");
            throw new Error("Fetched navbar HTML is empty.");
        }
        console.log("main.js: loadAndInitializeNavbar: Navbar HTML fetched successfully.");

        if (document.body) {
            document.body.insertAdjacentHTML('afterbegin', navbarHtml);
            console.log("main.js: loadAndInitializeNavbar: Navbar HTML injected into body.");
        } else {
            console.error("main.js: loadAndInitializeNavbar: document.body not available for injection!");
            throw new Error("Document body not found for navbar injection.");
        }

        const headerElement = document.getElementById('main-header'); 
        if (headerElement) {
            console.log("main.js: loadAndInitializeNavbar: Navbar header (#main-header) FOUND in DOM after injection.");
            _updateNavbarLinkVisibilityScoped = () => { 
                console.log("main.js: _updateNavbarLinkVisibilityScoped (actual): Updating visibility.");
                if (typeof isLoggedIn !== 'function' || typeof getRole !== 'function') {
                    console.warn("main.js: _updateNavbarLinkVisibilityScoped (actual): isLoggedIn or getRole from authService.js not found.");
                    const loginLnk = document.getElementById('nav-login-link');
                    const registerLnk = document.getElementById('nav-register-link');
                    if (loginLnk) loginLnk.classList.remove('hidden');
                    if (registerLnk) registerLnk.classList.remove('hidden');
                    return;
                }
                const loggedIn = isLoggedIn();
                const userRole = getRole();
                console.log(`main.js: _updateNavbarLinkVisibilityScoped (actual): Logged In: ${loggedIn}, Role: ${userRole}`);
                const toggle = (id, show) => {
                    const el = document.getElementById(id);
                    if (el) el.classList.toggle('hidden', !show);
                };
                toggle('nav-login-link', !loggedIn);
                toggle('nav-register-link', !loggedIn);
                toggle('logout-button', loggedIn);
                toggle('nav-change-password', loggedIn);
                if (loggedIn) {
                    toggle('nav-choose-role', !userRole);
                    toggle('nav-switch-role', !!userRole);
                    toggle('nav-freelancer-dashboard', userRole === 'FREELANCER');
                    toggle('nav-customer-dashboard', userRole === 'CUSTOMER');
                    if (!userRole) {
                        toggle('nav-freelancer-dashboard', false);
                        toggle('nav-customer-dashboard', false);
                    }
                } else {
                    ['nav-freelancer-dashboard', 'nav-customer-dashboard', 'nav-choose-role', 'nav-switch-role'].forEach(id => toggle(id, false));
                }
            };

            if (typeof isLoggedIn === 'function' && isLoggedIn() && 
                typeof isCurrentPathPublic === 'function' && !isCurrentPathPublic()) {
                console.log("main.js: User has token and is on a non-public page. Validating token globally...");
                if (typeof validateCurrentToken === 'function') {
                    await validateCurrentToken();
                } else {
                    console.warn("main.js: validateCurrentToken function not available for global check.");
                }
            } else if (typeof isCurrentPathPublic === 'function' && isCurrentPathPublic()) {
                console.log("main.js: Current path is public, skipping global token validation.");
            } else {
                console.log("main.js: No token found, auth functions missing, or path check function missing. Skipping global token validation.");
            }

            window.updateNavbarLinkVisibility();
            setupNavbarEventListeners();
        } else {
            console.error("main.js: loadAndInitializeNavbar: Navbar header (#main-header) NOT FOUND in DOM after injection. Navbar will not be functional.");
        }
    } catch (error) {
        console.error("main.js: Error in loadAndInitializeNavbar (catch block):", error.message);
        const fallbackNav = '<header id="main-header" style="background:red;color:white;text-align:center;padding:10px;">Error Loading Navigation - Check Console</header>';
        if (document.body) document.body.insertAdjacentHTML('afterbegin', fallbackNav);
    }
}

function setupNavbarEventListeners() {
    console.log("main.js: setupNavbarEventListeners: Called.");
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        console.log("main.js: setupNavbarEventListeners: Found logout-button, attaching listener.");
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log("main.js: Logout button CLICKED!");
            if (typeof logoutUser === 'function') logoutUser(); 
            else console.error("main.js: logoutUser function not found!");
        });
    } else {
        console.warn("main.js: setupNavbarEventListeners: 'logout-button' not found in DOM after navbar load.");
    }

    const hamburger = document.querySelector('#main-header .hamburger-menu');
    const navLinksList = document.querySelector('#main-header #main-nav ul.nav-links');
    if (hamburger && navLinksList) {
        console.log("main.js: setupNavbarEventListeners: Hamburger and navLinksList found, attaching listener.");
        hamburger.addEventListener('click', () => {
            navLinksList.classList.toggle('active');
            const isExpanded = navLinksList.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
            hamburger.classList.toggle('open', isExpanded);
        });
    } else {
        if (!hamburger) console.warn("main.js: setupNavbarEventListeners: Hamburger not found in loaded navbar.");
        if (!navLinksList) console.warn("main.js: setupNavbarEventListeners: Nav links list not found in loaded navbar.");
    }
}

function initializeGlobalUI() {
    console.log("main.js: initializeGlobalUI: Called.");
    loadAndInitializeNavbar();
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("main.js: DOMContentLoaded event fired. Initializing global UI.");
    initializeGlobalUI();
});