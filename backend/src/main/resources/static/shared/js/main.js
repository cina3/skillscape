function setupLogoutButtonListener() {
    console.log("main.js: setupLogoutButtonListener: Called");

    const logoutButton = document.getElementById('logout-button');
    console.log("main.js: setupLogoutButtonListener: Logout button (looking for id='logout-button'):", logoutButton);

    if (logoutButton) {

        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); 
            console.log("main.js: setupLogoutButtonListener: Logout button (id='logout-button') CLICKED!");

            if (typeof logoutUser === 'function') {
                console.log("main.js: setupLogoutButtonListener: Calling logoutUser() from authService.");
                logoutUser();
            } else {
                console.error("main.js: setupLogoutButtonListener: logoutUser function not found! Logout will not work correctly. Ensure authService.js is loaded before main.js and logoutUser is global.");
                alert("Logout error: Service not available.");
            }
        });
        console.log("main.js: setupLogoutButtonListener: Logout button event listener ATTACHED to id='logout-button'.");
    } else {
        console.warn("main.js: setupLogoutButtonListener: Logout button (id='logout-button') NOT FOUND in the DOM on this page. No logout listener attached for it here.");
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("main.js: DOMContentLoaded event fired.");
    setupLogoutButtonListener();
});