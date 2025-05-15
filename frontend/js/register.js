async function handleSignup(event) {
    event.preventDefault();
    const form = event.target;
    const displayNameValue = form.name.value;
    const emailValue = form.email.value;
    const passwordValue = form.password.value;
    const confirmPasswordValue = form['confirm-password'].value;

    if (!displayNameValue.trim()) {
        errorMessage('Name cannot be empty.');
        return;
    }
    if (displayNameValue.trim().length <= 2) {
        errorMessage('Name must be at least 3 characters long.');
        return;
    }
    if (passwordValue.length < 6) {
        errorMessage('Password must be at least 6 characters long.');
        return;
    }
    if (passwordValue !== confirmPasswordValue) {
        errorMessage('Passwords do not match.');
        return;
    }

    const signupData = {
        displayName: displayNameValue,
        email: emailValue,
        password: passwordValue
    };

    const backendUrl = 'http://3.75.88.34:8080/api/auth/signup';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signupData)
        });

        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        if (response.ok) {
            localStorage.setItem('authToken', responseData.token);
            localStorage.setItem('currentUser', JSON.stringify({
                id: responseData.id,
                email: responseData.email,
                displayName: responseData.displayName
            }));
            successMessage('Signup successful! You are now logged in.');
            setTimeout(() => {
                window.location.href = '../auth/choose-account.html';
            }, 1500);
        } else {
            let errorMessageText = 'Signup failed. Please try again.';

            if (typeof responseData === 'object' && responseData !== null) {
                if (responseData.message) {
                    errorMessageText = responseData.message;
                } else if (responseData.errors && responseData.errors.length > 0) {
                    errorMessageText = responseData.errors.map(err => err.defaultMessage || err.field).join(', ');
                } else if (responseData.error) {
                    errorMessageText = responseData.error;
                }
            } else if (typeof responseData === 'string' && responseData.trim() !== '') {
                errorMessageText = responseData;
            }

            const genericErrorPattern = /bad request/i;
            if (
                genericErrorPattern.test(errorMessageText) &&
                !(typeof responseData === 'object' && responseData !== null && responseData.message) && 
                !(typeof responseData === 'object' && responseData !== null && responseData.errors && responseData.errors.length > 0) 
            ) {
                errorMessageText = 'There was an issue with the information provided. Please review your details and try again.';
            }
            
            errorMessage(errorMessageText);
        }
    } catch (error) {
        console.error('error', error);
        errorMessage('An error occurred during signup. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = '../auth/choose-account.html';
        return;
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
});