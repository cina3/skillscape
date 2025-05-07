document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const messageArea = document.getElementById('message-area');

    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        console.log("forgot-password.js: User is already logged in. Redirecting.");
        if (typeof getRole === 'function' && typeof redirectToDashboard === 'function') {
            const userRole = getRole();
            if (userRole) {
                redirectToDashboard(userRole);
            } else {
                window.location.href = '/role-choice/choose-role.html';
            }
            return;
        } else { 
            window.location.href = '/landing/index.html';
            return;
        }
    }

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            messageArea.className = 'message hidden'; 
            messageArea.textContent = '';

            const emailInput = document.getElementById('email');
            const email = emailInput.value.trim();

            if (!email) {
                messageArea.textContent = 'Email address is required.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                return;
            }

            const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Sending...';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email }),
                });

                if (response.ok) {
                    const responseText = await response.text(); 
                    console.log("Forgot password response text:", responseText);

                    let successMessage = "If an account with that email exists, password reset instructions have been sent (or token generated for dev).";
                    if (responseText.toLowerCase().includes("reset token (dev):")) {
                        const token = responseText.substring(responseText.toLowerCase().indexOf("reset token (dev):") + "reset token (dev):".length).trim();
                        const resetLink = `${window.location.origin}/auth/reset-password/reset-password.html?token=${token}`;
                        successMessage = `DEV MODE: Password reset token generated. Click to reset: <a href="${resetLink}">${resetLink}</a>`;
                        console.log("Generated Reset Link (DEV):", resetLink);
                    }

                    messageArea.innerHTML = successMessage; 
                    messageArea.classList.add('success-message');
                    messageArea.classList.remove('hidden');
                    emailInput.value = '';
                } else {
                    let errorMessage = 'Failed to process request.';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) {  }
                    messageArea.textContent = errorMessage;
                    messageArea.classList.add('error-message');
                    messageArea.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Forgot password error:', error);
                messageArea.textContent = 'An error occurred while sending reset instructions. Please try again.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Send Reset Instructions';
            }
        });
    } else {
        console.error("Forgot password form (id='forgot-password-form') not found.");
    }
});