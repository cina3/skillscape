async function handleForgotPassword(event) {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;

    if (!email.trim()) {
        errorMessage('Email address cannot be empty.');
        return;
    }

    const forgotPasswordData = {
        email: email
    };

    const backendUrl = 'http://localhost:8080/api/auth/forgot-password';
    const submitButton = form.querySelector('button[type="submit"]');

    try {
        if (submitButton) submitButton.disabled = true;

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(forgotPasswordData)
        });

        const responseDataText = await response.text();

        if (response.ok) {
            successMessage(responseDataText || 'If your email is registered, a reset link will be sent.');
            form.reset();
        } else {
            errorMessage(responseDataText || 'Could not process request. Please try again.');
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        errorMessage('An error occurred. Please try again.');
    } finally {
        if (submitButton) submitButton.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
});