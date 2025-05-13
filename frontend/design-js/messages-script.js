document.addEventListener('DOMContentLoaded', function() {
    function loadInbox() {
        fetch('/messages/inbox.html')
            .then(response => response.text())
            .then(html => {
                const inboxContainer = document.createElement('div');
                inboxContainer.innerHTML = html;
                document.body.appendChild(inboxContainer);
                const backButton = document.getElementById('backToMenuButton');
                if (backButton) {
                    backButton.addEventListener('click', closeInbox);
                }
            })
            .catch(error => {
                console.error('Error loading inbox:', error);
            });
    }
    function showInbox(e) {
        if (e) e.preventDefault();
        const existingInbox = document.querySelector('.inbox-overlay');
        if (existingInbox) {
            existingInbox.style.display = 'block';
        } else {
            loadInbox();
        }
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu) {
            hamburgerMenu.classList.remove('active');
        }
    }
    function closeInbox() {
        const inboxOverlay = document.querySelector('.inbox-overlay');
        if (inboxOverlay) {
            inboxOverlay.style.display = 'none';
        }
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (hamburgerMenu) {
            hamburgerMenu.classList.add('active');
        }
    }
    window.showInbox = showInbox;
    window.closeInbox = closeInbox;
    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', function() {
            window.history.back();
        });
    }
    const conversationItems = document.querySelectorAll('.conversation-item');
    conversationItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Open conversation with:', this.querySelector('.conversation-name').textContent);
        });
    });
});
