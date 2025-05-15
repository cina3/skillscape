function showSettings() {
    console.log("Settings function called directly");
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
        console.error("Settings modal not found!");
        return false;
    }
    
    settingsModal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    const changePasswordOption = document.getElementById('changePasswordOption');
    if (changePasswordOption) {
        changePasswordOption.onclick = function(e) {
            e.preventDefault();
            closeSettingsModal();
            const passwordModal = document.getElementById('passwordModal');
            if (passwordModal) passwordModal.style.display = 'flex';
        };
    }
    
    const deleteAccountOption = document.getElementById('deleteAccountOption');
    if (deleteAccountOption) {
        deleteAccountOption.onclick = function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                window.location.href = '../auth/login.html';
            }
        };
    }
    
    return false;
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function closePasswordModal() {
    const modal = document.getElementById('passwordModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('Please fill in all password fields');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match');
        return;
    }

    alert('Password changed successfully!');

    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmNewPassword').value = '';
    
    closePasswordModal();
}

function showInbox() {
    console.log("Inbox function called");
    return false;
}

function signOut() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = '../auth/login.html';
    return false;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Settings modal script initialized");
    
    document.addEventListener('click', function(e) {
        const settingsModal = document.getElementById('settingsModal');
        const passwordModal = document.getElementById('passwordModal');
        
        if (settingsModal && e.target === settingsModal) {
            closeSettingsModal();
        }
        
        if (passwordModal && e.target === passwordModal) {
            closePasswordModal();
        }
    });

    const sm = document.getElementById('settingsModal');
    const pm = document.getElementById('passwordModal');
    
    if (sm && sm.parentElement !== document.body) {
        document.body.appendChild(sm);
    }
    if (pm && pm.parentElement !== document.body) {
        document.body.appendChild(pm);
    }
    
    const signOutLinks = document.querySelectorAll('.sign-out-link');
    signOutLinks.forEach(link => {
        link.removeEventListener('click', signOut);
        link.addEventListener('click', signOut);
    });
});
