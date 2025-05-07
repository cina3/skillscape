document.addEventListener('DOMContentLoaded', () => {
    if (typeof isLoggedIn !== 'function' || typeof getRole !== 'function' || typeof redirectToDashboard !== 'function') {
        console.error("customer/home.js: Critical authService functions not found. Redirecting to login.");
        window.location.href = '/auth/login/login.html'; 
        return;
    }

    if (!isLoggedIn()) {
        console.log("customer/home.js: User not logged in. Redirecting to login.");
        window.location.href = `/auth/login/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        return; 
    }

    const userRole = getRole();
    if (userRole !== 'CUSTOMER') {
        console.warn(`customer/home.js: User role is "${userRole}", not CUSTOMER. Redirecting.`);
        if (userRole === 'FREELANCER') {
            redirectToDashboard('FREELANCER');
        } else {
            window.location.href = '/role-choice/choose-role.html';
        }
        return; 
    }

    console.log("customer/home.js: Welcome, Customer! Page content can now load.");
    const messageArea = document.getElementById('message-area'); 
    if (messageArea) {
    }

});