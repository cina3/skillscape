async function fetchWithAuth(endpoint, options = {}) {
    if (typeof getToken !== 'function' || typeof logoutUser !== 'function') {
        console.error("authService.js not loaded correctly or getToken/logoutUser not global.");
        throw new Error("Authentication service not available.");
    }
    if (typeof API_BASE_URL === 'undefined') {
        console.error("config.js not loaded correctly or API_BASE_URL not defined.");
        throw new Error("API configuration not available.");
    }

    const token = getToken();

    const headers = {
        ...options.headers, 
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body && typeof options.body === 'object' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
        if (headers['Content-Type'] === 'application/json' && typeof options.body !== 'string') {
            options.body = JSON.stringify(options.body);
        }
    }


    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    console.log(`fetchWithAuth: ${options.method || 'GET'} ${url}`);

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            console.warn("API call returned 401. Logging out.");
            logoutUser(); 
            throw new Error('Session expired or unauthorized. Please login again.');
        }

        return response; 

    } catch (error) {
        console.error(`Error in fetchWithAuth for endpoint ${url}:`, error.message);
        throw error; 
    }
}