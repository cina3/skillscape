const TOKEN_KEY = 'skillscapeAuthToken';
const ROLE_KEY = 'skillscapeUserRole';

function storeToken(token) {
    if (token) {
        localStorage.setItem(TOKEN_KEY, token);
    } else {
        localStorage.removeItem(TOKEN_KEY);
    }
}

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

function storeRole(role) {
    if (role) {
        console.log("Storing role in localStorage:", role);
        localStorage.setItem(ROLE_KEY, role);
    } else {
        console.log("Removing role from localStorage");
        localStorage.removeItem(ROLE_KEY);
    }
    if (typeof initializeNavbar === 'function') {
        initializeNavbar();
    }
}

function getRole() {
    return localStorage.getItem(ROLE_KEY);
}

function isLoggedIn() {
    return !!getToken();
}

function logoutUser() {
    console.log("Logging out user.");
    storeToken(null); 
    storeRole(null); 
    if (typeof initializeNavbar === 'function') {
        initializeNavbar();
    }
    window.location.href = '/auth/login/login.html';
}

async function _fetchWithAuthInternal(url, options = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
        console.warn("Unauthorized request (401) in _fetchWithAuthInternal. Logging out.");
        logoutUser(); 
        throw new Error('Unauthorized or session expired. Please login again.');
    }
    return response; 
}

async function fetchAndStoreUserDetails() {
    if (!isLoggedIn()) {
        console.log("Not logged in, cannot fetch user details.");
        return null;
    }

    try {
        console.log("Fetching user details from:", `${API_BASE_URL}/users/me`);
        const response = await _fetchWithAuthInternal(`${API_BASE_URL}/users/me`);

        if (!response.ok) {
            console.error("Failed to fetch user details. Status:", response.status);
            return null;
        }

        const userDetails = await response.json();
        console.log("User details fetched:", userDetails);

        let roleToStore = null;
        if (userDetails.role) { 
            roleToStore = userDetails.role;
        } else if (userDetails.roles && userDetails.roles.length > 0) {
            const appRole = userDetails.roles.find(r =>
                r.name === 'FREELANCER' || r.name === 'CUSTOMER' ||
                r.name === 'ROLE_FREELANCER' || r.name === 'ROLE_CUSTOMER' ||
                (r.authority && (r.authority === 'FREELANCER' || r.authority === 'CUSTOMER' || r.authority === 'ROLE_FREELANCER' || r.authority === 'ROLE_CUSTOMER'))
            );
            if (appRole) {
                roleToStore = appRole.name || appRole.authority;
                if (roleToStore && roleToStore.startsWith('ROLE_')) {
                    roleToStore = roleToStore.substring(5); 
                }
            }
        } else if (userDetails.authorities && userDetails.authorities.length > 0) { 
             const appAuth = userDetails.authorities.find(a =>
                a.authority === 'FREELANCER' || a.authority === 'CUSTOMER' ||
                a.authority === 'ROLE_FREELANCER' || a.authority === 'ROLE_CUSTOMER'
            );
            if (appAuth) {
                roleToStore = appAuth.authority;
                 if (roleToStore && roleToStore.startsWith('ROLE_')) {
                    roleToStore = roleToStore.substring(5); 
                }
            }
        }


        if (roleToStore && (roleToStore === 'FREELANCER' || roleToStore === 'CUSTOMER')) {
            storeRole(roleToStore);
            return roleToStore;
        } else {
            console.warn("Valid role (FREELANCER/CUSTOMER) not found in userDetails response:", userDetails);
            storeRole(null); 
            return null;
        }

    } catch (error) {
        console.error("Error fetching user details:", error.message);
        return null;
    }
}

async function loginUser(email, password) {
    try {
        console.log("Attempting login for:", email);
        const response = await fetch(`${API_BASE_URL}/auth/login`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            let errorMessage = `Login failed. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || (typeof errorData === 'string' ? errorData : errorMessage);
            } catch (e) {}
            throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.token) {
            console.log("Token received:", data.token);
            storeToken(data.token);

            let userRole = null;
            if (data.role && (data.role === 'FREELANCER' || data.role === 'CUSTOMER')) { 
                userRole = data.role;
                storeRole(userRole);
                console.log("Role from login response:", userRole);
            } else {
                console.log("Role not in login response or invalid, fetching details...");
                userRole = await fetchAndStoreUserDetails(); 
            }

            if (typeof initializeNavbar === 'function') {
                initializeNavbar();
            }

            if (userRole) {
                redirectToDashboard(userRole);
            } else {
                console.log("No role determined, redirecting to role choice.");
                window.location.href = '/role-choice/choose-role.html';
            }
            return { success: true };
        } else {
            throw new Error("Token not found in login response.");
        }
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, message: error.message };
    }
}

async function registerUser(displayName, email, password) { 
    try {
        console.log("Attempting registration for email:", email, "with display name:", displayName);
        const response = await fetch(`${API_BASE_URL}/auth/register`, { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ displayName: displayName, email: email, password: password }),
        });

        if (!response.ok) {
            let errorMessage = `Registration failed. Status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {  }
            throw new Error(errorMessage);
        }
        console.log("Registration successful for:", email);
        return { success: true, message: "Registration successful! Please login." };

    } catch (error) {
        console.error('Registration error:', error.message);
        return { success: false, message: error.message };
    }
}

function redirectToDashboard(role) {
    console.log("Redirecting to dashboard for role:", role);
    if (role === 'FREELANCER') {
        window.location.href = '/freelancer/home.html';
    } else if (role === 'CUSTOMER') {
        window.location.href = '/customer/home.html';
    } else {
        console.warn("Invalid role for dashboard redirection, going to role choice.");
        window.location.href = '/role-choice/choose-role.html';
    }
}
