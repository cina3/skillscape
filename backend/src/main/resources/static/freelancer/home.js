document.addEventListener('DOMContentLoaded', () => {
    if (typeof isLoggedIn !== 'function' || typeof getRole !== 'function' || typeof redirectToDashboard !== 'function') {
        console.error("freelancer/home.js: Critical authService functions not found. Redirecting to login.");
        window.location.href = '/auth/login/login.html'; 
        return;
    }

    if (!isLoggedIn()) {
        console.log("freelancer/home.js: User not logged in. Redirecting to login.");
        window.location.href = `/auth/login/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        return; 
    }

    const userRole = getRole();
    if (userRole !== 'FREELANCER') {
        console.warn(`freelancer/home.js: User role is "${userRole}", not FREELANCER. Redirecting.`);
        if (userRole === 'CUSTOMER') {
            redirectToDashboard('CUSTOMER'); 
        } else {
            window.location.href = '/role-choice/choose-role.html';
        }
        return; 
    }

    console.log("freelancer/home.js: Welcome, Freelancer! Page content can now load.");
    const messageArea = document.getElementById('message-area'); 
    if (messageArea) {
    }

});