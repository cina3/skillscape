let messageBox;
let messageTextElement;
let messageCloseButton; 
let messageTimeout;  

const boxHTML = `
    <div id="globalMessageBox" class="message-box hidden">
        <span id="globalMessageText"></span>
        <button id="globalMessageCloseBtn" class="message-box-close">&times;</button>
    </div>
`;

function initializeMessageBox() {
    messageBox = document.getElementById('globalMessageBox');
    
    if (!messageBox) {
        document.body.insertAdjacentHTML('beforeend', boxHTML);
        messageBox = document.getElementById('globalMessageBox');
        if (!messageBox) { 
            console.error('Failed to create and mbox');
            return; 
        }
        console.info('mbox created');
    }

    messageTextElement = document.getElementById('globalMessageText');
    messageCloseButton = document.getElementById('globalMessageCloseBtn');

    if (messageCloseButton) {
        messageCloseButton.addEventListener('click', hideMessage);
    }
}

function showMessage(message, type = 'success', duration = 5000) {
    if (!messageBox || !messageTextElement) {
        console.error('mbox failed');
        initializeMessageBox(); 
        if (!messageBox || !messageTextElement) {
            console.error('mbox failed');
            return;
        }
    }

    clearTimeout(messageTimeout); 

    messageTextElement.textContent = message;
    messageBox.className = 'message-box'; 

    if (type === 'error') {
        messageBox.classList.add('message-box-error');
    } else {
        messageBox.classList.add('message-box-success');
    }

    messageBox.classList.remove('hidden');

    messageTimeout = setTimeout(() => {
        hideMessage();
    }, duration);
}

function hideMessage() {
    if (messageBox) {
        messageBox.classList.add('hidden');
    }
    clearTimeout(messageTimeout);
}

function errorMessage(text, duration = 5000) {
    showMessage(text, 'error', duration);
}

function successMessage(text, duration = 5000) {
    showMessage(text, 'success', duration);
}

document.addEventListener('DOMContentLoaded', initializeMessageBox);