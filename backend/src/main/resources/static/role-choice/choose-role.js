// src/main/resources/static/role-choice/choose-role.js
document.addEventListener('DOMContentLoaded', () => {
    if (typeof isLoggedIn !== 'function' || typeof storeRole !== 'function' || typeof redirectToDashboard !== 'function') {
        console.error("Critical functions from authService.js (isLoggedIn, storeRole, redirectToDashboard) are not available. Page functionality will be broken.");
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            messageArea.textContent = "Page error: Essential services not loaded. Please try refreshing or contact support.";
            messageArea.className = 'message error-message'; 
        }
        return; 
    }

    if (!isLoggedIn()) {
        console.warn("Not logged in, redirecting to login from choose-role page.");
        window.location.href = `/auth/login/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
        return; 
    }

    const currentRole = getRole(); 
    if (currentRole) {
        console.log(`User already has role: ${currentRole}. Redirecting to their dashboard from choose-role.`);
        redirectToDashboard(currentRole); 
        return; 
    }

    const freelancerButton = document.getElementById('freelancer-role-button');
    const customerButton = document.getElementById('customer-role-button');
    const messageArea = document.getElementById('message-area');

    if (!freelancerButton || !customerButton) {
        console.error("Role selection buttons (freelancer-role-button or customer-role-button) not found.");
        if (messageArea) {
            messageArea.textContent = "Page error: UI elements missing. Please try refreshing.";
            messageArea.className = 'message error-message';
        }
        return; 
    }

    function handleRoleSelection(selectedRole) {
        if (!selectedRole) {
            console.error("No role selected in handleRoleSelection.");
            return;
        }

        console.log(`Role selected: ${selectedRole}`);

        freelancerButton.disabled = true;
        customerButton.disabled = true;
        if (selectedRole === 'FREELANCER') {
            freelancerButton.textContent = "Processing...";
        } else if (selectedRole === 'CUSTOMER') {
            customerButton.textContent = "Processing...";
        }

        if (messageArea) {
            messageArea.className = 'message hidden'; 
        }

        storeRole(selectedRole); 

        setTimeout(() => {
            redirectToDashboard(selectedRole); 
        }, 300); 
    }

    freelancerButton.addEventListener('click', () => {
        handleRoleSelection('FREELANCER');
    });

    customerButton.addEventListener('click', () => {
        handleRoleSelection('CUSTOMER');
    });

    console.log("choose-role.js loaded and event listeners attached.");
});