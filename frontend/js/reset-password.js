let currentToken = null;

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

async function handleResetPassword(event) {
    event.preventDefault();
    const form = event.target;
    const newPassword = form.newPassword.value;
    const confirmNewPassword = form.confirmNewPassword.value;

    if (!currentToken) {
        errorMessage('No reset token found. Please use the link from your email.');
        return;
    }
    if (newPassword.length < 6) {
        errorMessage('Password must be at least 6 characters long.');
        return;
    }
    if (newPassword !== confirmNewPassword) {
        errorMessage('Passwords do not match.');
        return;
    }

    const resetPasswordData = {
        token: currentToken,
        newPassword: newPassword
    };

    const backendUrl = 'http://3.75.88.34:8080/api/auth/reset-password';
    const submitButton = form.querySelector('button[type="submit"]');
    let isSuccess = false;

    try {
        if (submitButton) submitButton.disabled = true;

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(resetPasswordData)
        });

        const responseDataText = await response.text();

        if (response.ok) {
            successMessage(responseDataText || 'Password has been reset successfully! You can now login.');
            form.reset();
            if (submitButton) submitButton.textContent = "Redirecting...";
            isSuccess = true;
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            errorMessage(responseDataText || 'Failed to reset password. The token might be invalid or expired.');
        }
    } catch (error) {
        console.error('Reset password error:', error);
        errorMessage('An error occurred. Please try again.');
    } finally {
        if (submitButton) {
            submitButton.disabled = isSuccess; 
            if (!isSuccess) {
                submitButton.textContent = "Reset Password";
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    currentToken = getQueryParam('token');
    const hiddenTokenInput = document.getElementById('resetToken');
    if (hiddenTokenInput && currentToken) {
        hiddenTokenInput.value = currentToken;
    } else if (!currentToken) {
        errorMessage('Invalid or missing password reset token. Please use the link from your email.', 0);
        const form = document.getElementById('resetPasswordForm');
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;
        }
    }

    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', handleResetPassword);
    }
});