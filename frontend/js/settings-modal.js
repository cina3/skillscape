function showSettings() {
    console.log("Settings function called directly");
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
        console.error("Settings modal not found!");
        return false;
    }
    
    // Ensure the modal is attached to the body for proper visibility
    if (settingsModal.parentElement !== document.body) {
        document.body.appendChild(settingsModal);
    }
    
    settingsModal.style.display = 'flex';
    document.body.classList.add('modal-open');
    
    const changePasswordOption = document.getElementById('changePasswordOption');
    if (changePasswordOption) {
        changePasswordOption.onclick = function(e) {
            e.preventDefault();
            closeSettingsModal();
            const passwordModal = document.getElementById('passwordModal');
            
            // Ensure password modal is attached to body
            if (passwordModal && passwordModal.parentElement !== document.body) {
                document.body.appendChild(passwordModal);
            }
            
            if (passwordModal) passwordModal.style.display = 'flex';
        };
    }
    
    const deleteAccountOption = document.getElementById('deleteAccountOption');
    if (deleteAccountOption) {
        deleteAccountOption.onclick = async function(e) { 
            e.preventDefault();
            if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    alert('Authentication token not found. Please log in again.');
                    window.location.href = '../auth/login.html';
                    return;
                }

                try {
                    const response = await fetch('http://localhost:8080/api/auth/delete', { 
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        alert('Account deleted successfully.');
                        localStorage.removeItem('authToken');
                        localStorage.removeItem('currentUser');
                        window.location.href = '../auth/login.html';
                    } else {
                        const errorData = await response.json().catch(() => ({ message: 'Failed to delete account. Please try again.' }));
                        alert(`Error: ${errorData.message || response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error deleting account:', error);
                    alert('An error occurred while trying to delete your account. Please check your network connection and try again.');
                }
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

async function changePassword() {
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

    const token = localStorage.getItem('authToken');
    if (!token) {
        alert('Authentication token not found. Please log in again.');
        window.location.href = '../auth/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/change-password', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        if (response.ok) {
            alert('Password changed successfully!');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
            closePasswordModal();
        } else {
            const errorData = await response.json().catch(() => ({ message: 'Failed to change password. Please try again.' }));
            alert(`Error: ${errorData.message || response.statusText}`);
        }
    } catch (error) {
        console.error('Error changing password:', error);
        alert('An error occurred while trying to change your password. Please check your network connection and try again.');
    }
}

function showInbox() {
    console.log("Inbox function called");
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

    // Always move modals to body for proper display
    const settingsModal = document.getElementById('settingsModal');
    const passwordModal = document.getElementById('passwordModal');
    
    if (settingsModal && settingsModal.parentElement !== document.body) {
        document.body.appendChild(settingsModal);
    }
    
    if (passwordModal && passwordModal.parentElement !== document.body) {
        document.body.appendChild(passwordModal);
    }
});
