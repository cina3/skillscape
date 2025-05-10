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

        const responseData = await response.json();

        if (response.ok) { 
            console.log('Login successful:', responseData);
            localStorage.setItem('authToken', responseData.token);
            localStorage.setItem('currentUser', JSON.stringify({
                id: responseData.id,
                email: responseData.email,
                displayName: responseData.displayName
            }));
            alert('Login successful!');
        } else {
            console.error('Login failed:', responseData);
            let errorMessage = 'Login failed. Please check your credentials.';
            if (responseData.message) {
                errorMessage = responseData.message;
            } else if (responseData.error) {
                errorMessage = responseData.error;
            }
            alert(errorMessage);
        }
    } catch (error) {
        console.error('Network or other error during login:', error);
        alert('An error occurred during login. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm'); 
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});