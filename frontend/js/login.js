async function handleLogin(event) {
    event.preventDefault();

    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;

    const loginData = {
        email: email,
        password: password
    };

    const backendUrl = 'http://localhost:8080/api/auth/signin';

    try {
        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        let responseData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            responseData = await response.json();
        } else {
            responseData = await response.text();
        }

        if (response.ok) {
            console.log('Login successful:', responseData);
            localStorage.setItem('authToken', responseData.token);
            localStorage.setItem('currentUser', JSON.stringify({
                id: responseData.id,
                email: responseData.email,
                displayName: responseData.displayName
            }));

            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = '../customer/home.html';
            }, 1500);

        } else {
            console.error('Login failed:', responseData);
            let errorMessageText = 'Login failed. Please check your credentials.';

            if (typeof responseData === 'object' && responseData !== null) {
                if (responseData.message) {
                    errorMessageText = responseData.message;
                } else if (responseData.error && responseData.message) {
                    errorMessageText = `${responseData.error}: ${responseData.message}`;
                } else if (responseData.error) {
                    errorMessageText = responseData.error;
                }
            } else if (typeof responseData === 'string' && responseData.trim() !== '') {
                errorMessageText = responseData;
            }
            
            showMessage(errorMessageText, 'error');
        }
    } catch (error) {
        console.error('error', error);
        
        showMessage('An error occurred during login. Please try again.', 'error');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        window.location.href = '../auth/choose-account.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});