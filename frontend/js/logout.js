function performSignOut() {
    const token = localStorage.getItem('authToken');
    
    if (token) {
        fetch('http://localhost:8080/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
    }
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    
    window.location.href = '../auth/login.html';
    
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    const signOutLinks = document.querySelectorAll('.sign-out-link');
    
    signOutLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            performSignOut();
        });
    });
});
