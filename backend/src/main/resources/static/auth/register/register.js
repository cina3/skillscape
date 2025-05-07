document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const messageArea = document.getElementById('message-area');

    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            messageArea.className = 'message hidden'; 
            messageArea.textContent = '';

            const displayNameInput = document.getElementById('display-name'); 
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const confirmPasswordInput = document.getElementById('confirm-password');

            const displayName = displayNameInput.value.trim(); 
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!displayName || !email || !password || !confirmPassword) { 
                messageArea.textContent = 'All fields are required.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                return;
            }

            if (password !== confirmPassword) {
                messageArea.textContent = 'Passwords do not match!';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                return;
            }

            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Registering...';

            try {
                const result = await registerUser(displayName, email, password);

                if (result.success) {
                    messageArea.textContent = result.message || 'Registration successful! Redirecting to login...';
                    messageArea.classList.add('success-message');
                    messageArea.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = '/auth/login/login.html';
                    }, 2000);
                } else {
                    messageArea.textContent = result.message || 'Registration failed. Please try again.';
                    messageArea.classList.add('error-message');
                    messageArea.classList.remove('hidden');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Register';
                }
            } catch (error) {
                messageArea.textContent = 'An unexpected error occurred. Please try again.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Register';
            }
        });
    } else {
        console.error('Register form (id="register-form") not found on this page.');
    }
});