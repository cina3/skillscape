document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const messageArea = document.getElementById('message-area');
    let currentToken = null; 

    const urlParams = new URLSearchParams(window.location.search);
    currentToken = urlParams.get('token');

    if (!currentToken) {
        messageArea.textContent = 'Invalid or missing password reset token. Please request a new reset link.';
        messageArea.classList.add('error-message');
        messageArea.classList.remove('hidden');
        if (resetPasswordForm) resetPasswordForm.classList.add('hidden');
        return; 
    } else {
        console.log("Password reset token from URL:", currentToken);
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            messageArea.className = 'message hidden';
            messageArea.textContent = '';

            const newPasswordInput = document.getElementById('new-password');
            const confirmPasswordInput = document.getElementById('confirm-password');

            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            if (!newPassword || !confirmPassword) {
                messageArea.textContent = 'Both password fields are required.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                return;
            }

            if (newPassword !== confirmPassword) {
                messageArea.textContent = 'Passwords do not match.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                return;
            }

            const submitButton = resetPasswordForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Resetting...';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: currentToken, newPassword: newPassword }),
                });

                if (response.ok) {
                    messageArea.textContent = 'Password has been reset successfully! Redirecting to login...';
                    messageArea.classList.add('success-message');
                    messageArea.classList.remove('hidden');
                    setTimeout(() => {
                        window.location.href = '/auth/login/login.html';
                    }, 3000);
                } else {
                    let errorMessage = 'Failed to reset password. The token might be invalid or expired.';
                    try {
                        const errorData = await response.json();
                        errorMessage = errorData.message || errorData.error || errorMessage;
                    } catch (e) { /* Failed to parse JSON error */ }
                    messageArea.textContent = errorMessage;
                    messageArea.classList.add('error-message');
                    messageArea.classList.remove('hidden');
                    submitButton.disabled = false;
                    submitButton.textContent = 'Reset Password';
                }
            } catch (error) {
                console.error('Reset password error:', error);
                messageArea.textContent = 'An error occurred while resetting your password. Please try again.';
                messageArea.classList.add('error-message');
                messageArea.classList.remove('hidden');
                submitButton.disabled = false;
                submitButton.textContent = 'Reset Password';
            }
        });
    } else {
        console.error("Reset password form (id='reset-password-form') not found.");
    }
});