document.addEventListener('DOMContentLoaded', () => {
    const ordersGrid = document.getElementById('ordersGrid');
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    const ratingModal = document.getElementById('ratingModal');
    const reportIssueModal = document.getElementById('reportIssueModal');
    
    const API_BASE_URL = 'http://localhost:8080/api';
    const TOKEN = localStorage.getItem('authToken') || localStorage.getItem('token');

    let currentOrderForModal = null; 
    let allFetchedOrders = []; 

    function escapeHTML(str) {
        if (str == null) return '';
        return str.toString()
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }

    function getStatusInfo(status) {
        switch (status) {
            case 'PENDING_ACCEPTANCE':
                return { text: 'Waiting for Acceptance', class: 'pending', icon: 'fas fa-clock' };
            case 'IN_PROGRESS':
                return { text: 'Work in progress', class: 'in-progress', icon: 'fas fa-spinner' };
            case 'DELIVERED':
                return { text: 'Delivered', class: 'delivered', icon: 'fas fa-check-double' };
            case 'COMPLETED':
                return { text: 'Work Done!', class: 'completed', icon: 'fas fa-check-circle' };
            case 'CANCELLED':
                return { text: 'Cancelled', class: 'cancelled', icon: 'fas fa-ban' };
            case 'DISPUTED':
                return { text: 'Disputed', class: 'cancelled', icon: 'fas fa-exclamation-triangle' };
            default:
                return { text: status, class: 'pending', icon: 'fas fa-question-circle' };
        }
    }

    function calculateProgress(createdAt, expectedDeliveryDate, status) {
        if (status !== 'IN_PROGRESS' || !createdAt || !expectedDeliveryDate) return 0;
        const start = new Date(createdAt).getTime();
        const end = new Date(expectedDeliveryDate).getTime();
        const now = new Date().getTime();
        if (now >= end) return 100;
        if (now <= start) return 0;
        const totalDuration = end - start;
        const elapsedDuration = now - start;
        return Math.min(100, Math.max(0, Math.round((elapsedDuration / totalDuration) * 100)));
    }

    const allModals = document.querySelectorAll('.order-details-modal, .action-modal');
    const closeModalButtons = document.querySelectorAll('.close-modal-btn, .close-action-modal, .cancel-button');

    function openModal(modalElement) {
        if (modalElement) {
            modalElement.classList.add('visible');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalElement) {
        if (modalElement) {
            modalElement.classList.remove('visible');
            document.body.style.overflow = '';
            if (modalElement.classList.contains('action-modal')) {
                resetRatingForm();
                resetReportIssueForm();
            }
        }
    }
    
    allModals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalToClose = this.closest('.order-details-modal, .action-modal');
            closeModal(modalToClose);
        });
    });
    
    function createOrderCard(order) {
        const statusInfo = getStatusInfo(order.status);
        const card = document.createElement('div');
        card.className = `order-card ${statusInfo.class === 'cancelled' ? 'cancelled' : ''}`;
        card.dataset.orderId = order.id;

        const progress = calculateProgress(order.createdAt, order.expectedDeliveryDate, order.status);
        
        let detailsHtml = `
            <div class="order-detail">
                <span class="detail-label">Total Cost:</span>
                <span class="detail-value">$${parseFloat(order.orderPrice).toFixed(2)}</span>
            </div>
        `;

        if (order.status === 'IN_PROGRESS') {
            detailsHtml += `
                <div class="order-detail">
                    <span class="detail-label">Progress:</span>
                    <span class="detail-value">${formatDate(order.expectedDeliveryDate)} (Expected)</span>
                </div>
                <div class="order-progress">
                    <div class="progress-bar" style="--progress: ${progress}%"></div>
                </div>`;
        } else if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
             detailsHtml += `
                <div class="order-detail">
                    <span class="detail-label">${order.status === 'COMPLETED' ? 'Completed:' : 'Delivered:'}</span>
                    <span class="detail-value">${formatDate(order.deliveredAt || order.updatedAt)}</span>
                </div>`;
            if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
                 detailsHtml += `
                    <div class="order-rating">
                        <button class="leave-rating-btn" data-order-id="${order.id}">
                            <i class="far fa-star"></i>
                            Leave Rating
                        </button>
                    </div>`;
            }
        } else if (order.status === 'PENDING_ACCEPTANCE') {
            detailsHtml += `
                <div class="order-detail">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">Pending provider response</span>
                </div>
                <div class="order-actions">
                    <button class="cancel-order-btn" data-order-id="${order.id}">
                        <i class="fas fa-times"></i>
                        Cancel Request
                    </button>
                </div>`;
        } else if (order.status === 'CANCELLED') {
            detailsHtml += `
                <div class="order-detail">
                    <span class="detail-label">Cancelled:</span>
                    <span class="detail-value">${formatDate(order.updatedAt)}</span>
                </div>
                <div class="order-actions">
                    <button class="reorder-btn" data-gig-id="${order.gigId}">
                        <i class="fas fa-redo"></i>
                        Re-order
                    </button>
                </div>`;
        }

        card.innerHTML = `
            <div class="order-card-left">
                <div class="order-image" style="background-image: url('../assets/temp.png');">
                    <div class="order-provider">by Seller ID: ${escapeHTML(order.sellerId)}</div>
                </div>
            </div>
            <div class="order-card-center">
                <div class="order-status ${statusInfo.class}">
                    <i class="${statusInfo.icon}"></i>
                    ${escapeHTML(statusInfo.text)}
                </div>
                <h3 class="order-title">Order ID: ${escapeHTML(order.id)}</h3>
                <div class="order-details">
                    ${detailsHtml}
                </div>
            </div>
            <div class="order-card-right">
                <button class="view-order-btn" data-order-id="${order.id}">
                    View
                    <i class="fas fa-arrow-right"></i>
                </button>
            </div>
        `;
        return card;
    }

    function populateOrderDetailsModal(order) {
        currentOrderForModal = order;
        const modal = orderDetailsModal;
        const statusInfo = getStatusInfo(order.status);

        modal.querySelector('.modal-header h2').textContent = `Order ID: ${escapeHTML(order.id)}`;
        modal.querySelector('.status-indicator').className = `info-value status-indicator ${statusInfo.class}`;
        modal.querySelector('.status-indicator i').className = statusInfo.icon;
        modal.querySelector('.status-indicator').innerHTML = `<i class="${statusInfo.icon}"></i> ${statusInfo.text}`;
        
        const modalOrderDateEl = modal.querySelector('#modalOrderDate');
        if (modalOrderDateEl) modalOrderDateEl.textContent = formatDate(order.createdAt);
        
        const modalProviderNameEl = modal.querySelector('#modalProviderName');
        if (modalProviderNameEl) modalProviderNameEl.textContent = `Seller ID: ${escapeHTML(order.sellerId)}`;
        
        const modalExpectedDeliveryEl = modal.querySelector('#modalExpectedDelivery');
        if (modalExpectedDeliveryEl) modalExpectedDeliveryEl.textContent = formatDate(order.expectedDeliveryDate);
        
        const modalTotalCostEl = modal.querySelector('#modalTotalCost');
        if (modalTotalCostEl) modalTotalCostEl.textContent = `$${parseFloat(order.orderPrice).toFixed(2)}`;
        
        const modalCategoryEl = modal.querySelector('#modalCategory');
        if (modalCategoryEl) modalCategoryEl.textContent = 'N/A';
        
        modal.querySelector('.request-content p').textContent = escapeHTML(order.requirements || 'No requirements specified.');

        const filesList = modal.querySelector('.files-list');
        filesList.innerHTML = '';
        if (order.uploadUrls && order.uploadUrls.length > 0) {
            order.uploadUrls.forEach(url => {
                const fileName = url.split('/').pop();
                let iconClass = 'fa-file';
                if (/\.(jpe?g|png|gif)$/i.test(fileName)) iconClass = 'fa-file-image';
                else if (/\.(pdf)$/i.test(fileName)) iconClass = 'fa-file-pdf';
                else if (/\.(docx?|txt)$/i.test(fileName)) iconClass = 'fa-file-alt';

                filesList.innerHTML += `
                    <div class="file-item">
                        <i class="fas ${iconClass}"></i>
                        <span class="file-name">${escapeHTML(fileName)}</span>
                        <a href="${escapeHTML(url)}" target="_blank" class="file-download-btn">
                            <i class="fas fa-download"></i>
                        </a>
                    </div>`;
            });
        } else {
            filesList.innerHTML = '<p>No files attached.</p>';
        }
        
        openModal(modal);
    }

    function populateRatingModal(order) {
        currentOrderForModal = order;
        const modal = ratingModal;
        modal.querySelector('.service-info h4').textContent = `Order ID: ${escapeHTML(order.id)}`;
        modal.querySelector('.service-info p').textContent = `by Seller ID: ${escapeHTML(order.sellerId)}`;
        resetRatingForm();
        openModal(modal);
    }

    function populateReportIssueModal(order) {
        currentOrderForModal = order;
        const modal = reportIssueModal;
        modal.querySelector('.service-info h4').textContent = `Order ID: ${escapeHTML(order.id)}`;
        modal.querySelector('.service-info p').textContent = `by Seller ID: ${escapeHTML(order.sellerId)}`;
        resetReportIssueForm();
        openModal(modal);
    }
    
    const ratingStars = ratingModal ? ratingModal.querySelectorAll('.star-item') : [];
    const ratingText = ratingModal ? ratingModal.querySelector('.rating-text') : null;
    const submitRatingBtn = ratingModal ? ratingModal.querySelector('#submitRating') : null;
    let selectedRating = 0;

    function resetRatingForm() {
        selectedRating = 0;
        ratingStars.forEach(s => {
            s.classList.remove('fas', 'active');
            s.classList.add('far');
        });
        if(ratingText) ratingText.textContent = 'Select your rating';
        if(submitRatingBtn) submitRatingBtn.disabled = true;
        const ratingComment = ratingModal ? ratingModal.querySelector('#ratingComment') : null;
        if (ratingComment) ratingComment.value = '';
    }
    
    function getRatingText(rating) {
        switch(rating) {
            case 1: return 'Poor';
            case 2: return 'Fair';
            case 3: return 'Good';
            case 4: return 'Very Good';
            case 5: return 'Excellent';
            default: return 'Select your rating';
        }
    }

    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            selectedRating = parseInt(this.dataset.rating);
            ratingStars.forEach(s => {
                s.classList.toggle('fas', parseInt(s.dataset.rating) <= selectedRating);
                s.classList.toggle('far', parseInt(s.dataset.rating) > selectedRating);
                s.classList.toggle('active', parseInt(s.dataset.rating) <= selectedRating);
            });
            if(ratingText) ratingText.textContent = getRatingText(selectedRating);
            if(submitRatingBtn) submitRatingBtn.disabled = false;
        });
    });

    if (submitRatingBtn) {
        submitRatingBtn.addEventListener('click', async () => {
            if (!currentOrderForModal || selectedRating === 0) {
                alert('Please select a rating.');
                return;
            }
            const comment = ratingModal.querySelector('#ratingComment').value;
            console.log(`Submitting rating for order ${currentOrderForModal.id}: ${selectedRating} stars, Comment: ${comment}`);
            
            try {
                const response = await fetch(`${API_BASE_URL}/reviews`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${TOKEN}`
                    },
                    body: JSON.stringify({
                        gigId: currentOrderForModal.gigId,
                        orderId: currentOrderForModal.id,
                        score: selectedRating,
                        comment: comment
                    })
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Failed to submit review: ${response.status}`);
                }
                alert('Rating submitted successfully!');
                closeModal(ratingModal);
                loadOrders();
            } catch (error) {
                console.error('Error submitting rating:', error);
                alert(`Error: ${error.message}`);
            }
        });
    }

    const submitIssueBtn = reportIssueModal ? reportIssueModal.querySelector('#submitIssue') : null;
    const issueTypeSelect = reportIssueModal ? reportIssueModal.querySelector('#issueType') : null;
    const issueDescriptionField = reportIssueModal ? reportIssueModal.querySelector('#issueDescription') : null;

    function resetReportIssueForm() {
        if(issueTypeSelect) issueTypeSelect.value = '';
        if(issueDescriptionField) issueDescriptionField.value = '';
    }

    if (submitIssueBtn) {
        submitIssueBtn.addEventListener('click', async () => {
            if (!currentOrderForModal) return;
            const issueType = issueTypeSelect.value;
            const description = issueDescriptionField.value;

            if (!issueType || !description) {
                alert('Please fill out all fields for the report.');
                return;
            }
            console.log(`Reporting issue for order ${currentOrderForModal.id}: Type: ${issueType}, Desc: ${description}`);
            alert('Issue reported (mock).');
            closeModal(reportIssueModal);
        });
    }
    
    ordersGrid.addEventListener('click', async (e) => {
        const target = e.target;
        const orderCard = target.closest('.order-card');
        if (!orderCard) return;
        
        const orderId = orderCard.dataset.orderId;

        const orderData = allFetchedOrders.find(o => o.id.toString() === orderId);
        if (!orderData) {
            console.error('Order data not found for ID:', orderId);
            return;
        }

        if (target.closest('.view-order-btn')) {
            populateOrderDetailsModal(orderData);
        } else if (target.closest('.leave-rating-btn')) {
            populateRatingModal(orderData);
        } else if (target.closest('.cancel-order-btn')) {
            if (confirm('Are you sure you want to cancel this order request?')) {
                console.log('Cancel order:', orderId);
                alert('Order cancellation request sent (mock).');
            }
        } else if (target.closest('.reorder-btn')) {
            const gigId = target.closest('.reorder-btn').dataset.gigId;
            alert(`Re-ordering gig ${gigId} (mock).`);
        }
    });

    if (orderDetailsModal) {
        const reportBtnInDetailsModal = orderDetailsModal.querySelector('#reportIssueBtn');
        if (reportBtnInDetailsModal) {
            reportBtnInDetailsModal.addEventListener('click', () => {
                if (currentOrderForModal) {
                    populateReportIssueModal(currentOrderForModal);
                } else {
                    alert('No order selected to report an issue.');
                }
            });
        }
    }

    async function loadOrders() {
        if (!ordersGrid) {
            console.error('Orders grid not found');
            return;
        }
        ordersGrid.innerHTML = '<p>Loading orders...</p>';

        if (!TOKEN) {
            ordersGrid.innerHTML = '<p>Please log in to see your orders. (Auth token not found)</p>';
            console.warn('Auth token not found.');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/orders/my`, {
                headers: {
                    'Authorization': `Bearer ${TOKEN}`
                }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                     ordersGrid.innerHTML = '<p>Authentication failed. Please log in again.</p>';
                } else {
                    ordersGrid.innerHTML = `<p>Error loading orders: ${response.statusText}</p>`;
                }
                throw new Error(`Failed to fetch orders: ${response.status}`);
            }
            allFetchedOrders = await response.json();

            if (allFetchedOrders.length === 0) {
                ordersGrid.innerHTML = '<p>You have no orders yet.</p>';
                return;
            }

            ordersGrid.innerHTML = '';
            allFetchedOrders.forEach(order => {
                const cardElement = createOrderCard(order);
                ordersGrid.appendChild(cardElement);
            });

        } catch (error) {
            console.error('Error loading orders:', error);
            ordersGrid.innerHTML = `<p>Failed to load orders. ${error.message}</p>`;
        }
    }

    loadOrders();
});
