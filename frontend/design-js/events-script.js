document.addEventListener('DOMContentLoaded', function() {
    
    function setActiveEventMenuItem() {
        setTimeout(() => {
            const hamburgerMenu = document.getElementById('hamburgerMenu');
            if (hamburgerMenu) {
                const eventLink = hamburgerMenu.querySelector('a[href="events.html"]');
                if (eventLink && !eventLink.classList.contains('active-menu-item')) {
                    hamburgerMenu.querySelectorAll('.menu-nav a').forEach(link => {
                        link.classList.remove('active-menu-item');
                        const existingDot = link.querySelector('i.fa-circle');
                        if (existingDot) existingDot.remove();
                    });
                    
                    eventLink.classList.add('active-menu-item');
                    const dotIcon = document.createElement('i');
                    dotIcon.className = 'fas fa-circle';
                    dotIcon.style.fontSize = '0.5em';
                    dotIcon.style.verticalAlign = 'middle';
                    dotIcon.style.marginRight = '8px';
                    eventLink.prepend(dotIcon);
                }
            }
        }, 300);
    }

    setActiveEventMenuItem();
    
    const eventData = {
        "cpp-competition": {
            title: "C++ Programming Competition",
            description: "Put your C++ skills to the test in this challenging competition. Participants will need to solve a series of algorithmic problems within a time limit, focusing on data structures, algorithms, and optimizations.",
            host: "SkillScape",
            prize: "900 SkillCoins",
            startDate: "July 15, 2025",
            endDate: "July 25, 2025",
            submissions: 45,
            banner: "../assets/browse/software.png",
            badge: "ACTIVE",
            status: "active",
            rules: [
                "All submissions must be original work",
                "Code must be written in C++17 or later",
                "Solutions must pass all test cases to be eligible for prizes",
                "Time limit: 3 hours for solving all problems",
                "No external libraries allowed except the C++ standard library"
            ],
            criteria: [
                { name: "Correctness", weight: "40%" },
                { name: "Performance", weight: "30%" },
                { name: "Code Quality", weight: "20%" },
                { name: "Time Complexity", weight: "10%" }
            ],
            participants: [
                { name: "codemaster42", avatar: "../assets/temp.png", badge: true },
                { name: "AlgorithmQueen", avatar: "../assets/temp.png", badge: false },
                { name: "CPlusPlusWizard", avatar: "../assets/temp.png", badge: false }
            ]
        },
        "video-editing": {
            title: "Video Editing Competition",
            description: "Create a 60-90 second promotional video on the theme 'Future of Work'. This competition tests your ability to tell a compelling story with visuals, sound, and creative editing techniques.",
            host: "SkillScape Media",
            prize: "900 SkillCoins",
            startDate: "July 18, 2025",
            endDate: "July 23, 2025",
            submissions: 77,
            banner: "../assets/browse/video.png",
            badge: "ENDING SOON",
            status: "active",
            rules: [
                "Video must be 60-90 seconds in length",
                "Theme: Future of Work",
                "All content must be original or properly licensed",
                "Submit in MP4 format, maximum 500MB",
                "Include a brief description of your creative process"
            ],
            criteria: [
                { name: "Storytelling", weight: "30%" },
                { name: "Technical Quality", weight: "30%" },
                { name: "Creativity", weight: "25%" },
                { name: "Sound Design", weight: "15%" }
            ],
            participants: [
                { name: "VisualStudio", avatar: "../assets/temp.png", badge: true },
                { name: "CinemaVision", avatar: "../assets/temp.png", badge: false },
                { name: "EditMaster", avatar: "../assets/temp.png", badge: false }
            ]
        },
        "ai-challenge": {
            title: "AI Challenge: Image Recognition",
            description: "Build an AI model that can accurately identify and categorize objects in images. This competition is designed for machine learning enthusiasts and AI developers looking to showcase their skills.",
            host: "SkillScape AI Labs",
            prize: "1200 SkillCoins",
            startDate: "July 10, 2025",
            endDate: "July 31, 2025",
            submissions: 32,
            banner: "../assets/browse/software.png",
            badge: "ACTIVE",
            status: "active",
            rules: [
                "You may use any programming language or framework",
                "Model must be trained on the provided dataset only",
                "Submissions will be evaluated on a separate test dataset",
                "Must include documentation on your approach",
                "Maximum model size: 1GB"
            ],
            criteria: [
                { name: "Accuracy", weight: "50%" },
                { name: "Efficiency", weight: "25%" },
                { name: "Innovation", weight: "15%" },
                { name: "Documentation", weight: "10%" }
            ],
            participants: [
                { name: "DeepLearner", avatar: "../assets/temp.png", badge: true },
                { name: "NeuralWizard", avatar: "../assets/temp.png", badge: false },
                { name: "TensorMaster", avatar: "../assets/temp.png", badge: false }
            ]
        },
        "music-production": {
            title: "Music Production Challenge",
            description: "Compose an original track in the genre of your choice that captures the theme 'Renewal'. This competition welcomes producers of all experience levels to showcase their musical creativity.",
            host: "SkillScape Audio",
            prize: "750 SkillCoins",
            startDate: "July 12, 2025",
            endDate: "July 28, 2025",
            submissions: 64,
            banner: "../assets/browse/music.png",
            badge: "ACTIVE",
            status: "active",
            rules: [
                "Track must be 2-5 minutes in length",
                "Theme: Renewal",
                "All sounds and samples must be original or properly licensed",
                "Submit in WAV or MP3 format",
                "Include a brief description of your creative process"
            ],
            criteria: [
                { name: "Creativity", weight: "35%" },
                { name: "Production Quality", weight: "30%" },
                { name: "Theme Interpretation", weight: "25%" },
                { name: "Audience Response", weight: "10%" }
            ],
            participants: [
                { name: "BeatMaker99", avatar: "../assets/temp.png", badge: true },
                { name: "MelodyMaster", avatar: "../assets/temp.png", badge: false },
                { name: "SoundArchitect", avatar: "../assets/temp.png", badge: false }
            ]
        },
        "logo-design": {
            title: "Logo Design Challenge",
            description: "Design a modern, versatile logo for a fictional eco-friendly tech startup named 'GreenByte'. This competition tests your ability to create a memorable brand identity that communicates sustainability and innovation.",
            host: "SkillScape Design",
            prize: "800 SkillCoins",
            startDate: "July 27, 2025",
            endDate: "August 10, 2025",
            submissions: 0,
            banner: "../assets/browse/art.png",
            badge: "UPCOMING",
            status: "upcoming",
            rules: [
                "Design must include the name 'GreenByte'",
                "Must work in both color and monochrome",
                "Submit in vector format (AI or EPS) and PNG",
                "Include mock-ups showing the logo in use",
                "Include a brief explanation of your design choices"
            ],
            criteria: [
                { name: "Concept & Originality", weight: "35%" },
                { name: "Relevance to Brief", weight: "25%" },
                { name: "Technical Execution", weight: "25%" },
                { name: "Versatility", weight: "15%" }
            ],
            participants: []
        },
        "web-design-2025": {
            title: "Web Design Competition 2025",
            description: "Create a fully responsive website for a fictional health and wellness platform focused on digital wellness. Your design should showcase innovative UI/UX principles while maintaining accessibility and performance.",
            host: "SkillScape",
            prize: "1500 SkillCoins",
            startDate: "July 5, 2025",
            endDate: "July 29, 2025",
            submissions: 126,
            banner: "../assets/browse/web.png",
            badge: "FEATURED",
            status: "active",
            rules: [
                "Website must be fully responsive and work across all device sizes",
                "Must meet WCAG 2.1 AA accessibility requirements",
                "Use any framework or technology of your choice",
                "Submit GitHub repository with working demo",
                "Include documentation of your design decisions and process"
            ],
            criteria: [
                { name: "Design & Aesthetics", weight: "30%" },
                { name: "Functionality & UX", weight: "30%" },
                { name: "Technical Implementation", weight: "20%" },
                { name: "Accessibility", weight: "10%" },
                { name: "Performance", weight: "10%" }
            ],
            participants: [
                { name: "WebMaster", avatar: "../assets/temp.png", badge: true },
                { name: "UXGenius", avatar: "../assets/temp.png", badge: false },
                { name: "CodeDesigner", avatar: "../assets/temp.png", badge: false },
                { name: "ResponsivePro", avatar: "../assets/temp.png", badge: false }
            ]
        }
    };
    
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.event-modal-close');
    
    closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.querySelectorAll('.event-view-btn, .event-cta-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const eventId = this.getAttribute('data-event-id');
            openModal(eventId);
        });
    });
    
    document.querySelectorAll('.event-notify-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const eventId = this.getAttribute('data-event-id');
            
            if (this.classList.contains('notified')) {
                this.innerHTML = 'Notify Me <i class="fas fa-bell"></i>';
                this.classList.remove('notified');
                this.style.backgroundColor = '#6c757d';
                
                showToast('Notification removed');
            } else {
                this.innerHTML = 'Notified <i class="fas fa-bell-slash"></i>';
                this.classList.add('notified');
                this.style.backgroundColor = '#28a745';
                
                showToast('You will be notified when this event begins');
            }
        });
    });
    
    document.querySelectorAll('.filter-option').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-option').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            showToast('Filter applied: ' + this.textContent);
        });
    });
    
    function openModal(eventId) {
        const event = eventData[eventId];
        if (!event) return;
        
        document.getElementById('modalEventTitle').textContent = event.title;
        document.getElementById('modalEventDescription').textContent = event.description;
        document.getElementById('modalEventHost').textContent = event.host;
        document.getElementById('modalEventPrize').textContent = event.prize;
        document.getElementById('modalEventStart').textContent = event.startDate;
        document.getElementById('modalEventEnd').textContent = event.endDate;
        document.getElementById('modalEventSubmissions').textContent = event.submissions;
        
        document.getElementById('modalEventBanner').style.backgroundImage = `url('${event.banner}')`;
        document.getElementById('modalEventBadge').textContent = event.badge;
        
        const badgeElement = document.getElementById('modalEventBadge');
        if (event.status === 'active') {
            badgeElement.style.backgroundColor = '#28a745';
        } else if (event.status === 'upcoming') {
            badgeElement.style.backgroundColor = '#17a2b8';
        } else {
            badgeElement.style.backgroundColor = '#6c757d';
        }
        
        const rulesList = document.getElementById('modalEventRules');
        rulesList.innerHTML = '';
        event.rules.forEach(rule => {
            const li = document.createElement('li');
            li.textContent = rule;
            rulesList.appendChild(li);
        });
        
        const criteriaGrid = document.getElementById('modalEventCriteria');
        criteriaGrid.innerHTML = '';
        event.criteria.forEach(item => {
            const div = document.createElement('div');
            div.className = 'criteria-item';
            div.innerHTML = `
                <div class="criteria-name">${item.name}</div>
                <div class="criteria-weight">${item.weight}</div>
            `;
            criteriaGrid.appendChild(div);
        });
        
        const participantsList = document.getElementById('modalEventParticipants');
        participantsList.innerHTML = '';
        if (event.participants.length === 0) {
            participantsList.innerHTML = '<div class="empty-participants">No participants yet</div>';
        } else {
            event.participants.forEach(participant => {
                const div = document.createElement('div');
                div.className = 'participant-item';
                div.innerHTML = `
                    <img src="${participant.avatar}" alt="${participant.name}" class="participant-avatar">
                    <span class="participant-name">${participant.name}</span>
                    ${participant.badge ? '<span class="participant-badge"><i class="fas fa-medal"></i></span>' : ''}
                `;
                participantsList.appendChild(div);
            });
        }
        
        const actionBtn = document.getElementById('modalEventAction');
        if (event.status === 'active') {
            actionBtn.textContent = 'Enter Competition';
            actionBtn.disabled = false;
        } else if (event.status === 'upcoming') {
            actionBtn.textContent = 'Notify Me';
            actionBtn.disabled = false;
        } else {
            actionBtn.textContent = 'Competition Ended';
            actionBtn.disabled = true;
        }
        
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
    
    function showToast(message) {
        let toastContainer = document.querySelector('.toast-container');
        
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
            
            const style = document.createElement('style');
            style.textContent = `
                .toast-container {
                    position: fixed;
                    bottom:20px;
                    right:20px;
                    z-index:2000;
                }
                .toast {
                    background-color: rgba(51, 51, 51, 0.9);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 8px;
                    margin-top: 10px;
                    font-size: 0.9rem;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                    animation: fadeInUp 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toastContainer.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });
});
