document.addEventListener('DOMContentLoaded', () => {
    const requiredAuthFunctions = ['isLoggedIn', 'storeRole', 'redirectToDashboard', 'getRole'];
    for (const funcName of requiredAuthFunctions) {
        if (typeof window[funcName] !== 'function') { 
            console.error(`Critical function ${funcName} from authService.js is not available. Page functionality will be broken.`);
            const messageArea = document.getElementById('message-area');
            if (messageArea) {
                messageArea.textContent = "Page error: Essential services not loaded. Please try refreshing or contact support.";
                messageArea.className = 'message error-message';
                messageArea.classList.remove('hidden');
            }
            return; 
        }
    }
    if (typeof window.updateNavbarLinkVisibility !== 'function') {
        console.warn("window.updateNavbarLinkVisibility function not found. Navbar UI might not update immediately on this page after role selection.");
    }


    if (!isLoggedIn()) { 
        console.warn("Not logged in, redirecting to login from choose-role page.");
        window.location.href = `/auth/login/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
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
            messageArea.classList.remove('hidden');
        }
        return;
    }

    const currentRoleForDisplay = getRole(); 
    if (currentRoleForDisplay && messageArea) {
        messageArea.textContent = `You are currently a ${currentRoleForDisplay}. Choose a new role or update your selection.`;
        messageArea.className = 'message info-message';
        messageArea.classList.remove('hidden');
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
            customerButton.textContent = "I'm a Customer";
        } else if (selectedRole === 'CUSTOMER') {
            customerButton.textContent = "Processing...";
            freelancerButton.textContent = "I'm a Freelancer";
        }

        if (messageArea) {
            messageArea.className = 'message hidden'; 
        }

        storeRole(selectedRole); 

        if (typeof window.updateNavbarLinkVisibility === 'function') {
            console.log("choose-role.js: Calling window.updateNavbarLinkVisibility() after role selection.");
            window.updateNavbarLinkVisibility();
        } else {
            console.warn("choose-role.js: window.updateNavbarLinkVisibility function not found. Navbar UI might not update on this page before redirect.");
        }

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
