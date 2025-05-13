document.addEventListener('DOMContentLoaded', function() {

    function loadHTMLFragment(url, placeholderId) {
        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} for ${url}`);
                }
                return response.text();
            })
            .then(data => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = data;
                } else {
                    throw new Error(`[CustomerSharedScript] Placeholder with ID '${placeholderId}' not found.`);
                }
            })
            .catch(error => {
                const placeholder = document.getElementById(placeholderId);
                if (placeholder) {
                    placeholder.innerHTML = `<p style="color:red; border:1px solid red; padding:10px;">Failed to load component from ${url}. Check console for details.</p>`;
                }
                throw error; 
            });
    }

    function setActiveMenuItem() {
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        if (!hamburgerMenu) return;

        const navLinks = hamburgerMenu.querySelectorAll('.menu-nav > ul > li > a');
        const currentPagePath = window.location.pathname;
        const currentPageFilename = currentPagePath.substring(currentPagePath.lastIndexOf('/') + 1) || 'home.html';

        navLinks.forEach(link => {
            link.classList.remove('active-menu-item');
            const existingDot = link.querySelector('i.fa-circle');
            if (existingDot) {
                existingDot.remove();
            }

            const linkHref = link.getAttribute('href');
            if (linkHref) {
                const linkFilename = linkHref.substring(linkHref.lastIndexOf('/') + 1);
                const linkPageName = linkFilename.split('?')[0];

                if (linkPageName === currentPageFilename) {
                    link.classList.add('active-menu-item');
                    const dotIcon = document.createElement('i');
                    dotIcon.className = 'fas fa-circle';
                    dotIcon.style.fontSize = '0.5em';
                    dotIcon.style.verticalAlign = 'middle';
                    dotIcon.style.marginRight = '8px';
                    link.prepend(dotIcon);
                }
            }
        });
    }

    let headerPath;
    let menuPath;
    const currentPath = window.location.pathname;

    headerPath = '../customer/header.html';
    menuPath = '../customer/hamburger-menu.html';

    Promise.all([
        loadHTMLFragment(headerPath, 'header-placeholder'),
        loadHTMLFragment(menuPath, 'hamburger-menu-placeholder')
    ])
    .then(() => {
        setupEventListeners();
        setActiveMenuItem(); 
    })
    .catch(error => {
        const body = document.querySelector('body');
        if (body && !document.getElementById('critical-load-error')) {
            const errorDiv = document.createElement('div');
            errorDiv.id = 'critical-load-error';
            errorDiv.innerHTML = '<p style="color:red; background-color:pink; text-align:center; padding:20px; font-weight:bold;">Critical error: Could not load page components. Please open the browser console (F12) for details.</p>';
            body.prepend(errorDiv);
        }
    });

    function setupEventListeners() {
        const menuIcon = document.querySelector('.site-header .menu-icon');
        const hamburgerMenu = document.getElementById('hamburgerMenu');
        const closeMenuBtn = document.getElementById('closeMenuBtn');

        if (menuIcon && hamburgerMenu) {
            menuIcon.addEventListener('click', () => {
                hamburgerMenu.classList.toggle('open');
                menuIcon.classList.toggle('menu-open');
            });
        }

        if (closeMenuBtn && hamburgerMenu) {
            closeMenuBtn.addEventListener('click', () => {
                closeMenuBtn.classList.add('spinning');
                hamburgerMenu.classList.remove('open');
                if (menuIcon) {
                    menuIcon.classList.remove('menu-open');
                }
                const onAnimationEnd = () => {
                    closeMenuBtn.classList.remove('spinning');
                    closeMenuBtn.removeEventListener('animationend', onAnimationEnd);
                };
                closeMenuBtn.addEventListener('animationend', onAnimationEnd);
            });
        }

        document.addEventListener('click', function(event) {
            const currentHamburgerMenu = document.getElementById('hamburgerMenu'); 
            if (currentHamburgerMenu && currentHamburgerMenu.classList.contains('open')) {
                const currentMenuIcon = document.querySelector('.site-header .menu-icon');
                const isClickInsideMenu = currentHamburgerMenu.contains(event.target);
                const isClickOnMenuIcon = currentMenuIcon ? currentMenuIcon.contains(event.target) : false;

                if (!isClickInsideMenu && !isClickOnMenuIcon) {
                    currentHamburgerMenu.classList.remove('open');
                    if (currentMenuIcon) {
                        currentMenuIcon.classList.remove('menu-open');
                    }
                }
            }
        });
    }
});

window.showInbox = function(e) {
    if (e) e.preventDefault();
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (!hamburgerMenu) return;
    const existingInbox = hamburgerMenu.querySelector('.inbox-panel');
    if (existingInbox) {
        const menuNav = hamburgerMenu.querySelector('.menu-nav');
        const menuSection = hamburgerMenu.querySelector('.menu-section');
        const menuFooter = hamburgerMenu.querySelector('.menu-footer');
        if (menuNav) menuNav.style.display = 'none';
        if (menuSection) menuSection.style.display = 'none';
        if (menuFooter) menuFooter.style.display = 'none';
        existingInbox.style.display = 'block';
    } else {
        const inboxPanel = document.createElement('div');
        inboxPanel.className = 'inbox-panel';
        inboxPanel.innerHTML = `
            <div class="inbox-header">
                <button id="backToMenuButton" class="back-button">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h2>Inbox</h2>
            </div>

            <div class="conversations-list">
                <div class="conversation-item" data-username="janedoe" data-avatar="../assets/temp.png">
                    <div class="conversation-avatar">
                        <img src="../assets/temp.png" alt="Jane Doe">
                    </div>
                    <div class="conversation-content">
                        <div class="conversation-name">janedoe</div>
                        <div class="conversation-preview">that will be $100 in total</div>
                    </div>
                    <div class="conversation-action">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="conversation-item" data-username="webdesigner" data-avatar="../assets/temp.png">
                    <div class="conversation-avatar">
                        <img src="../assets/temp.png" alt="Web Designer">
                    </div>
                    <div class="conversation-content">
                        <div class="conversation-name">webdesigner</div>
                        <div class="conversation-preview">You: thats too expensive</div>
                    </div>
                    <div class="conversation-action">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
                
                <div class="conversation-item" data-username="Donald Trump" data-avatar="../assets/temp.png">
                    <div class="conversation-avatar">
                        <img src="../assets/temp.png" alt="Donald Trump">
                    </div>
                    <div class="conversation-content">
                        <div class="conversation-name">Donald Trump</div>
                        <div class="conversation-preview">yeah I am going to finish your pro...</div>
                    </div>
                    <div class="conversation-action">
                        <i class="fas fa-chevron-right"></i>
                    </div>
                </div>
            </div>
        `;
        const menuNav = hamburgerMenu.querySelector('.menu-nav');
        const menuSection = hamburgerMenu.querySelector('.menu-section');
        const menuFooter = hamburgerMenu.querySelector('.menu-footer');
        if (menuNav) menuNav.style.display = 'none';
        if (menuSection) menuSection.style.display = 'none';
        if (menuFooter) menuFooter.style.display = 'none';
        hamburgerMenu.appendChild(inboxPanel);
        if (!document.getElementById('inbox-styles')) {
            const style = document.createElement('style');
            style.id = 'inbox-styles';
            style.textContent = `
                .inbox-panel {
                    display: block;
                    height: calc(100% - 40px);
                    padding: 0;
                    margin: 0;
                    overflow-y: auto;
                }
                
                .inbox-header {
                    display: flex;
                    align-items: center;
                    padding: 20px 10px;
                    border-bottom: 1px solid #eaeaea;
                    margin-bottom: 10px;
                }
                
                .back-button {
                    background: none;
                    border: none;
                    font-size: 1rem;
                    color: var(--text-dark, #212529);
                    cursor: pointer;
                    padding: 8px;
                    margin-right: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease;
                }
                
                .back-button:hover {
                    transform: translateX(-2px);
                }
                
                .inbox-header h2 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                    color: var(--text-dark, #212529);
                }
                
                .conversations-list {
                    display: flex;
                    flex-direction: column;
                    padding: 0 10px;
                }
                
                .conversation-item {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 12px;
                    background-color: white;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .conversation-item:hover {
                    background-color: #f5f5f5;
                    transform: translateY(-2px);
                }
                
                .conversation-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                    margin-right: 12px;
                    flex-shrink: 0;
                }
                
                .conversation-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .conversation-content {
                    flex-grow: 1;
                    overflow: hidden;
                }
                
                .conversation-name {
                    font-size: 0.95rem;
                    font-weight: 600;
                    color: var(--text-dark, #212529);
                    margin-bottom: 3px;
                }
                
                .conversation-preview {
                    font-size: 0.85rem;
                    color: var(--text-muted, #6c757d);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .conversation-action {
                    color: var(--text-muted, #6c757d);
                    padding: 5px;
                    transition: transform 0.2s ease;
                }
                
                .conversation-item:hover .conversation-action {
                    transform: translateX(2px);
                    color: var(--brand-blue, #27435E);
                }
                
                .chat-panel {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 340px;
                    height: 100%;
                    background-color: #f5f5f5;
                    z-index: 2000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: -5px 0 15px rgba(0,0,0,0.1);
                }
                
                @media (max-width: 480px) {
                    .chat-panel {
                        width: 100%;
                    }
                }
                
                .chat-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 15px;
                    background-color: white;
                    border-bottom: 1px solid #eee;
                }
                
                .chat-header-left {
                    display: flex;
                    align-items: center;
                }
                
                .chat-header-right {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    overflow: hidden;
                }
                
                .chat-header-right img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                .chat-username {
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin: 0 auto 0 15px;
                    color: #333;
                }
                
                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    background-color: #f5f5f5;
                }
                
                .message {
                    max-width: 75%;
                    margin-bottom: 10px;
                    padding: 10px 12px;
                    border-radius: 18px;
                    word-wrap: break-word;
                    position: relative;
                    font-size: 0.95rem;
                    line-height: 1.4;
                }
                
                .message-sent {
                    align-self: flex-end;
                    background-color: #334f71;
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                
                .message-received {
                    align-self: flex-start;
                    background-color: #6c757d;
                    color: white;
                    border-bottom-left-radius: 4px;
                }
                
                .message-input-container {
                    padding: 10px 15px;
                    background-color: white;
                    border-top: 1px solid #eee;
                    position: relative;
                    display: flex;
                    align-items: center;
                }
                
                .message-input {
                    width: 100%;
                    padding: 10px 45px 10px 15px;
                    border: none;
                    border-radius: 20px;
                    font-size: 15px;
                    background: #f0f0f0;
                    outline: none;
                    resize: none;
                }
                
                .send-button {
                    position: absolute;
                    right: 25px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    color: #334f71;
                }
                
                .back-button {
                    background: none;
                    border: none;
                    color: #555;
                    cursor: pointer;
                    padding: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .back-button:hover {
                    color: #222;
                }
            `;
            document.head.appendChild(style);
        }
        const backButton = document.getElementById('backToMenuButton');
        if (backButton) {
            backButton.addEventListener('click', window.closeInbox);
        }
        const conversations = inboxPanel.querySelectorAll('.conversation-item');
        conversations.forEach(conv => {
            conv.addEventListener('click', function() {
                const username = this.dataset.username;
                const avatar = this.dataset.avatar;
                window.openChat(username, avatar);
            });
        });
    }
};

window.closeInbox = function() {
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    if (!hamburgerMenu) return;
    const menuNav = hamburgerMenu.querySelector('.menu-nav');
    const menuSection = hamburgerMenu.querySelector('.menu-section');
    const menuFooter = hamburgerMenu.querySelector('.menu-footer');
    const inboxPanel = hamburgerMenu.querySelector('.inbox-panel');
    if (menuNav) menuNav.style.display = 'block';
    if (menuSection) menuSection.style.display = 'block';
    if (menuFooter) menuFooter.style.display = 'block';
    if (inboxPanel) inboxPanel.style.display = 'none';
};

window.openChat = function(username, avatarUrl) {
    const existingChat = document.querySelector('.chat-panel');
    if (existingChat) {
        existingChat.remove();
    }
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const inboxPanel = hamburgerMenu.querySelector('.inbox-panel');
    if (inboxPanel) {
        inboxPanel.style.display = 'none';
    }
    const chatPanel = document.createElement('div');
    chatPanel.className = 'chat-panel';
    chatPanel.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-left">
                <button id="backToChatListButton" class="back-button">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h3 class="chat-username">${username}</h3>
            </div>
            <div class="chat-header-right">
                <img src="${avatarUrl}" alt="${username}">
            </div>
        </div>
        <div class="chat-messages">
            <div class="message message-sent">
                Hi there!
            </div>
            <div class="message message-sent">
                I wanted to discuss the project with you
            </div>
            <div class="message message-received">
                Hello
            </div>
            <div class="message message-received">
                Sure, what do you need to know?
            </div>
            <div class="message message-sent">
                that will be $100 in total
            </div>
            <div class="message message-received">
                Sounds reasonable, when can you start?
            </div>
            <div class="message message-sent">
                I can start right away!
            </div>
        </div>
        <div class="message-input-container">
            <input type="text" class="message-input" placeholder="Message">
            <button class="send-button">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    document.body.appendChild(chatPanel);
    if (document.getElementById('chat-styles')) {
        document.getElementById('chat-styles').remove();
    }
    const chatStyles = document.createElement('style');
    chatStyles.id = 'chat-styles';
    chatStyles.textContent = `
        .chat-panel {
            position: fixed;
            top: 0;
            right: 0;
            width: 340px;
            height: 100%;
            background-color: #f5f5f5;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        }
        
        @media (max-width: 480px) {
            .chat-panel {
                width: 100%;
            }
        }
        
        .chat-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px 15px;
            background-color: white;
            border-bottom: 1px solid #eee;
        }
        
        .chat-header-left {
            display: flex;
            align-items: center;
        }
        
        .chat-header-right {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            overflow: hidden;
        }
        
        .chat-header-right img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .chat-username {
            font-size: 1.2rem;
            font-weight: 700;
            margin: 0 auto 0 15px;
            color: #333;
        }
        
        .chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            display: flex;
            flex-direction: column;
            background-color: #f5f5f5;
        }
        
        .message {
            max-width: 75%;
            margin-bottom: 10px;
            padding: 10px 12px;
            border-radius: 18px;
            word-wrap: break-word;
            position: relative;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        
        .message-sent {
            align-self: flex-end;
            background-color: #334f71;
            color: white;
            border-bottom-right-radius: 4px;
        }
        
        .message-received {
            align-self: flex-start;
            background-color: #6c757d;
            color: white;
            border-bottom-left-radius: 4px;
        }
        
        .message-input-container {
            padding: 10px 15px;
            background-color: white;
            border-top: 1px solid #eee;
            position: relative;
            display: flex;
            align-items: center;
        }
        
        .message-input {
            width: 100%;
            padding: 10px 45px 10px 15px;
            border: none;
            border-radius: 20px;
            font-size: 15px;
            background: #f0f0f0;
            outline: none;
            resize: none;
        }
        
        .send-button {
            position: absolute;
            right: 25px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            color: #334f71;
        }
        
        .back-button {
            background: none;
            border: none;
            color: #555;
            cursor: pointer;
            padding: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .back-button:hover {
            color: #222;
        }
    `;
    document.head.appendChild(chatStyles);
    const backButton = chatPanel.querySelector('#backToChatListButton');
    backButton.addEventListener('click', function() {
        chatPanel.remove();
        if (inboxPanel) {
            inboxPanel.style.display = 'block';
        }
    });
    const messageInput = chatPanel.querySelector('.message-input');
    const sendButton = chatPanel.querySelector('.send-button');
    const sendMessage = function() {
        const message = messageInput.value.trim();
        if (message) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message message-received';
            messageElement.textContent = message;
            const messagesContainer = chatPanel.querySelector('.chat-messages');
            messagesContainer.appendChild(messageElement);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
            messageInput.value = '';
        }
    };
    sendButton.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    messageInput.focus();
    const messagesContainer = chatPanel.querySelector('.chat-messages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};