const TOKEN_KEY = 'authToken';
const ROLE_KEY = 'userRole';

if (typeof API_BASE_URL === 'undefined') {
    console.error("authService.js: API_BASE_URL is not defined. Ensure config.js is loaded before authService.js.");
}

function storeToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
    if (typeof window.updateNavbarLinkVisibility === 'function') {
        window.updateNavbarLinkVisibility();
    }
}
window.storeToken = storeToken;

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}
window.getToken = getToken;

function removeToken() {
    localStorage.removeItem(TOKEN_KEY);
}
window.removeToken = removeToken;

function isLoggedIn() {
    return !!getToken();
}
window.isLoggedIn = isLoggedIn;

function storeRole(role) {
    if (role) {
        localStorage.setItem(ROLE_KEY, role);
    } else {
        localStorage.removeItem(ROLE_KEY);
    }
    if (typeof window.updateNavbarLinkVisibility === 'function') {
        window.updateNavbarLinkVisibility();
    }
}
window.storeRole = storeRole;

function getRole() {
    return localStorage.getItem(ROLE_KEY);
}
window.getRole = getRole;

function logoutUser() {
    console.log("authService.js: logoutUser called");
    removeToken();
    storeRole(null); 
    if (typeof window.updateNavbarLinkVisibility === 'function') {
        window.updateNavbarLinkVisibility();
    }
    window.location.href = '/auth/login/login.html';
}
window.logoutUser = logoutUser;

function redirectToDashboard(role) {
    console.log(`authService.js: redirectToDashboard called with role: ${role}`);
    if (role === 'FREELANCER') {
        window.location.href = '/freelancer/home.html';
    } else if (role === 'CUSTOMER') {
        window.location.href = '/customer/home.html';
    } else {
        console.warn(`authService.js: Unknown role or no role for dashboard redirection: ${role}. Redirecting to role choice.`);
        window.location.href = '/role-choice/choose-role.html';
    }
}
window.redirectToDashboard = redirectToDashboard;

async function loginUser(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        
        if (response.ok) {
            const data = await response.json();
            storeToken(data.token);
            
            if (typeof window.updateNavbarLinkVisibility === 'function') {
                window.updateNavbarLinkVisibility();
            }

            const params = new URLSearchParams(window.location.search);
            const redirectUrl = params.get('redirect');

            if (redirectUrl) {
                window.location.href = redirectUrl;
            } else {
                const userRole = getRole(); 
                if (userRole) {
                     redirectToDashboard(userRole);
                } else {
                    window.location.href = '/role-choice/choose-role.html'; 
                }
            }
            return { success: true, token: data.token };
        } else {
            let errorMessage = 'Login failed. Please check your credentials.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || (typeof errorData === 'string' ? errorData : errorMessage);
            } catch (e) {}
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'An unexpected error occurred during login.' };
    }
}
window.loginUser = loginUser;

async function registerUser(displayName, email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName, email, password }),
        });

        if (response.status === 201) { 
            const data = await response.json();
            storeToken(data.token); 
            if (typeof window.updateNavbarLinkVisibility === 'function') {
                window.updateNavbarLinkVisibility();
            }
            return { success: true, message: 'Registration successful! Redirecting...' };
        } else {
            let errorMessage = 'Registration failed.';
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || (typeof errorData === 'string' ? errorData : errorMessage);
                 if (response.status === 409) { 
                    errorMessage = errorData.message || "An account with this email already exists.";
                }
            } catch (e) {  }
            return { success: false, message: errorMessage };
        }
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'An unexpected error occurred during registration.' };
    }
}
window.registerUser = registerUser;

async function validateCurrentToken() {
    console.log("authService.js: validateCurrentToken called");
    if (!isLoggedIn()) {
        console.log("authService.js: No token to validate.");
        return false; // Or true, depending on desired behavior if no token
    }

    try {
        // Assuming you have a '/api/users/me' or similar endpoint
        // that requires authentication and returns user info or just a 200 OK.
        // fetchWithAuth (from apiService.js) should handle 401s by logging out.
        const response = await fetchWithAuth('/users/me'); // Or your validation endpoint

        if (response.ok) {
            console.log("authService.js: Token is valid.");
            // Optionally, you could update user details here if the endpoint returns them
            // const userData = await response.json();
            // storeUserDetails(userData); // Example
            return true;
        } else {
            // fetchWithAuth should ideally handle 401 by calling logoutUser.
            // If it doesn't, or for other non-OK statuses that mean invalid token:
            console.warn(`authService.js: Token validation failed with status ${response.status}. Logging out.`);
            logoutUser(); // Ensure logout if not already handled
            return false;
        }
    } catch (error) {
        // Errors during fetch (network error, or if fetchWithAuth throws after logout)
        console.error("authService.js: Error during token validation:", error.message);
        // It's possible logoutUser() was already called by fetchWithAuth if it was a 401
        // If not, and we are sure this error means invalid session, call it.
        // However, repeated calls to logoutUser are generally safe.
        if (isLoggedIn()) { // Check if still logged in, to avoid redundant redirects if fetchWithAuth already logged out
            logoutUser();
        }
        return false;
    }
}
window.validateCurrentToken = validateCurrentToken;

console.log("authService.js loaded and global functions defined.");