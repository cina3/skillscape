document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const messageArea = document.getElementById('message-area');
    
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        console.log("login.js: User is already logged in.");
        if (typeof getRole === 'function' && typeof redirectToDashboard === 'function') {
            const userRole = getRole();
            if (userRole) {
                console.log(`login.js: Redirecting to dashboard for role: ${userRole}`);
                redirectToDashboard(userRole);
            } else {
                console.log("login.js: User logged in but no role, redirecting to role choice.");
                window.location.href = '/role-choice/choose-role.html';
            }
            return; 
        } else {
            console.warn("login.js: authService functions (getRole/redirectToDashboard) not found for redirection.");
            window.location.href = '/landing/index.html'; 
            return;
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            messageArea.className = 'message hidden'; 
            messageArea.textContent = '';

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                messageArea.textContent = 'Email and password are required.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                return;
            }

            const submitButton = loginForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Logging in...';

            const result = await loginUser(email, password);

            if (!result.success) {
                messageArea.textContent = result.message || 'Login failed. Please check your credentials.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Login';
            }
        });
    } else {
        console.error('Login form (id="login-form") not found on this page.');
    }
});