document.addEventListener('DOMContentLoaded', function() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const hamburgerMenuPlaceholder = document.getElementById('hamburger-menu-placeholder');

    fetch('../freelancer/header.html')
        .then(response => response.text())
        .then(data => {
            headerPlaceholder.innerHTML = data;
        })
        .catch(error => console.error('Error loading header:', error));

    fetch('../freelancer/hamburger-menu.html')
        .then(response => response.text())
        .then(data => {
            hamburgerMenuPlaceholder.innerHTML = data;
            initializeMenu();
        })
        .catch(error => console.error('Error loading menu:', error));

    const jobsData = [
        {
            id: 'JOB123456',
            title: 'Landing Page Design',
            buyer: 'John Smith',
            image: '../assets/temp.png',
            price: '$120',
            priceType: 'fixed',
            dueDate: 'May 25, 2025',
            createdAt: 'May 15, 2025',
            updatedAt: 'May 18, 2025',
            status: 'active',
            languages: 'JavaScript, HTML, CSS',
            skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Bootstrap']
        },
        {
            id: 'JOB789012',
            title: 'E-commerce API Integration',
            buyer: 'Sarah Johnson',
            image: '../assets/temp.png',
            price: '$45/hr',
            priceType: 'hourly',
            dueDate: 'June 10, 2025',
            createdAt: 'May 20, 2025',
            updatedAt: 'May 20, 2025',
            status: 'active',
            languages: 'JavaScript, Node.js, PHP',
            skills: ['API Integration', 'Node.js', 'Express', 'MongoDB', 'Payment Gateway']
        },
        {
            id: 'JOB345678',
            title: 'Logo Design for Tech Startup',
            buyer: 'Michael Chen',
            image: '../assets/temp.png',
            price: '$85',
            priceType: 'fixed',
            dueDate: 'May 28, 2025',
            createdAt: 'May 18, 2025', 
            updatedAt: 'May 19, 2025',
            status: 'completed',
            languages: 'Illustrator, Photoshop',
            skills: ['Logo Design', 'Branding', 'Vector Art', 'Typography', 'Color Theory']
        },
        {
            id: 'JOB901234',
            title: 'Mobile App UI/UX Design',
            buyer: 'Alex Rodriguez',
            image: '../assets/temp.png',
            price: '$55/hr',
            priceType: 'hourly',
            dueDate: 'June 15, 2025',
            createdAt: 'May 12, 2025',
            updatedAt: 'May 17, 2025',
            status: 'pending',
            languages: 'Figma, Sketch, Adobe XD',
            skills: ['UI Design', 'UX Design', 'Wireframing', 'Prototyping', 'User Research']
        },
        {
            id: 'JOB567890',
            title: 'Content Writing for Blog',
            buyer: 'Emma Wilson',
            image: '../assets/temp.png',
            price: '$75',
            priceType: 'fixed',
            dueDate: 'May 30, 2025',
            createdAt: 'May 22, 2025',
            updatedAt: 'May 22, 2025',
            status: 'cancelled',
            languages: 'English',
            skills: ['Content Writing', 'SEO', 'Blogging', 'Copywriting', 'Editing']
        }
    ];

    renderJobs(jobsData);

    document.getElementById('statusFilter').addEventListener('change', function() {
        const status = this.value;
        let filteredJobs = jobsData;
        
        if (status !== 'all') {
            filteredJobs = jobsData.filter(job => job.status === status);
        }
        
        renderJobs(filteredJobs);
    });

    initModals();
});

function renderJobs(jobs) {
    const jobsGrid = document.getElementById('jobsGrid');
    
    if (!jobs.length) {
        jobsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-briefcase"></i>
                <h3>No jobs found</h3>
                <p>There are no jobs matching your criteria at this time.</p>
            </div>
        `;
        return;
    }
    
    jobsGrid.innerHTML = '';
    
    jobs.forEach(job => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.dataset.id = job.id;
        
        const statusIcon = getStatusIcon(job.status);
        
        jobCard.innerHTML = `
            <div class="job-card-left">
                <div class="job-image" style="background-image: url('${job.image}')">
                    <div class="job-buyer">From: ${job.buyer}</div>
                </div>
            </div>
            <div class="job-card-center">
                <div>
                    <div class="job-status ${job.status}">
                        ${statusIcon}
                    </div>
                    <h3 class="job-title">${job.title}</h3>
                    <div class="job-details">
                        <div class="job-detail">
                            <span class="detail-label">Order ID:</span>
                            <span class="detail-value">${job.id}</span>
                        </div>
                        <div class="job-detail">
                            <span class="detail-label">Price:</span>
                            <span class="detail-value">${job.price}</span>
                            <span class="badge ${job.priceType}">
                                ${job.priceType === 'fixed' ? 'Fixed' : 'Per Hour'}
                            </span>
                        </div>
                        <div class="job-detail">
                            <span class="detail-label">Due Date:</span>
                            <span class="detail-value">${job.dueDate}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="job-card-right">
                <button class="view-job-btn">View Details</button>
            </div>
        `;
        
        jobsGrid.appendChild(jobCard);
        
        jobCard.querySelector('.view-job-btn').addEventListener('click', () => {
            openJobModal(job);
        });
    });
}

function getStatusIcon(status) {
    switch (status) {
        case 'active':
            return '<i class="fas fa-spinner"></i>';
        case 'completed':
            return '<i class="fas fa-check"></i>';
        case 'pending':
            return '<i class="fas fa-clock"></i>';
        case 'cancelled':
            return '<i class="fas fa-times"></i>';
        default:
            return '<i class="fas fa-circle"></i>';
    }
}

function openJobModal(job) {
    const modal = document.getElementById('jobDetailsModal');
    
    document.getElementById('modalJobTitle').textContent = job.title;
    document.getElementById('modalOrderID').textContent = job.id;
    document.getElementById('modalBuyer').textContent = job.buyer;
    document.getElementById('modalPrice').textContent = job.price;
    document.getElementById('modalCreatedAt').textContent = job.createdAt;
    document.getElementById('modalUpdatedAt').textContent = job.updatedAt;
    document.getElementById('modalDueDate').textContent = job.dueDate;
    document.getElementById('modalLanguages').textContent = job.languages;
    
    const statusElement = document.getElementById('modalStatus');
    const statusLower = job.status.toLowerCase();
    statusElement.className = `info-value status-indicator ${statusLower}`;
    statusElement.innerHTML = `${getStatusIcon(statusLower)} ${job.status.toUpperCase()}`;
    
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.status.toLowerCase() === job.status.toLowerCase()) {
            btn.classList.add('selected');
        }
    });
    
    const progressSlider = document.getElementById('progressSlider');
    const progressValue = document.getElementById('progressValue');
    const progress = job.progress || 0;
    
    progressSlider.value = progress;
    progressValue.textContent = `${progress}%`;
    progressSlider.style.setProperty('--progress-percent', `${progress}%`);
    
    const priceTypeElement = document.getElementById('modalPriceType');
    priceTypeElement.className = `badge ${job.priceType}`;
    priceTypeElement.textContent = job.priceType === 'fixed' ? 'Fixed' : 'Per Hour';
    
    if (job.skills && job.skills.length) {
        const skillsContainer = document.getElementById('modalSkills');
        skillsContainer.textContent = job.skills.join(', ');
    }
    
    modal.classList.add('visible');
    document.body.style.overflow = 'hidden';
}

function initModals() {
    const closeModalBtn = document.querySelector('.close-modal-btn');
    closeModalBtn.addEventListener('click', () => {
        document.getElementById('jobDetailsModal').classList.remove('visible');
        document.body.style.overflow = '';
    });
    
    document.getElementById('jobDetailsModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('jobDetailsModal')) {
            document.getElementById('jobDetailsModal').classList.remove('visible');
            document.body.style.overflow = '';
        }
    });
    
    document.getElementById('deliverWorkBtn').addEventListener('click', () => {
        document.getElementById('deliverWorkModal').classList.add('visible');
    });
    
    document.querySelector('.close-action-modal').addEventListener('click', () => {
        document.getElementById('deliverWorkModal').classList.remove('visible');
    });
    
    document.querySelector('.cancel-button').addEventListener('click', () => {
        document.getElementById('deliverWorkModal').classList.remove('visible');
    });
    
    document.getElementById('submitDelivery').addEventListener('click', () => {
        alert('Your work has been delivered! The client will be notified.');
        document.getElementById('deliverWorkModal').classList.remove('visible');
        document.getElementById('jobDetailsModal').classList.remove('visible');
        document.body.style.overflow = '';
    });
    
    document.querySelectorAll('.status-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.status-btn').forEach(b => {
                b.classList.remove('selected');
            });
            
            this.classList.add('selected');
            
            const status = this.dataset.status;
            document.getElementById('modalStatus').className = `info-value status-indicator ${status.toLowerCase()}`;
            document.getElementById('modalStatus').innerHTML = `${getStatusIcon(status.toLowerCase())} ${status}`;
        });
    });
    
    const progressSlider = document.getElementById('progressSlider');
    const progressValue = document.getElementById('progressValue');
    
    progressSlider.addEventListener('input', function() {
        const value = this.value;
        progressValue.textContent = `${value}%`;
        
        this.style.setProperty('--progress-percent', `${value}%`);
    });
    
    document.getElementById('updateProgressBtn').addEventListener('click', function() {
        const progress = progressSlider.value;
        alert(`Progress updated to ${progress}%`);
        
        if (progress === '100') {
            if (confirm('Would you like to change the job status to DELIVERED?')) {
                const deliveredBtn = document.querySelector('.status-btn.delivered');
                if (deliveredBtn) {
                    deliveredBtn.click();
                }
            }
        }
    });
    
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        fileInput.files = e.dataTransfer.files;
        handleFiles(fileInput.files);
    });
    
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });
}

function handleFiles(files) {
    const uploadedFilesList = document.getElementById('uploadedFilesList');
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileItem = document.createElement('div');
        fileItem.className = 'uploaded-file-item';
        
        let fileIcon = 'fa-file';
        if (file.type.startsWith('image/')) fileIcon = 'fa-file-image';
        else if (file.type.includes('pdf')) fileIcon = 'fa-file-pdf';
        else if (file.type.includes('word')) fileIcon = 'fa-file-word';
        else if (file.type.includes('zip')) fileIcon = 'fa-file-archive';
        
        fileItem.innerHTML = `
            <i class="fas ${fileIcon}"></i>
            <span class="uploaded-file-name">${file.name}</span>
            <button class="remove-file-btn"><i class="fas fa-times"></i></button>
        `;
        
        uploadedFilesList.appendChild(fileItem);
        
        fileItem.querySelector('.remove-file-btn').addEventListener('click', () => {
            fileItem.remove();
        });
    }
}

function initializeMenu() {
    const menuIcon = document.querySelector('.menu-icon');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    
    if (menuIcon && hamburgerMenu && closeMenuBtn) {
        menuIcon.addEventListener('click', () => {
            hamburgerMenu.classList.add('open');
        });
        
        closeMenuBtn.addEventListener('click', () => {
            hamburgerMenu.classList.remove('open');
        });
        
        const menuItems = hamburgerMenu.querySelectorAll('.menu-nav ul li a');
        menuItems.forEach(item => {
            if (item.getAttribute('href') === 'jobs.html') {
                item.classList.add('active-menu-item');
                item.innerHTML += ' <span class="nav-dot"></span>';
            }
        });
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
