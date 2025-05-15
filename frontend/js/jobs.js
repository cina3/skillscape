document.addEventListener('DOMContentLoaded', () => {
  loadLayout();
  initModals();
  document.getElementById('statusFilter')
    .addEventListener('change', filterJobs);
  fetchJobs();
});

let allJobs = [], currentJob = null;

function loadLayout() {
  fetch('../freelancer/header.html')
    .then(r => r.text()).then(html => {
      document.getElementById('header-placeholder').innerHTML = html;
      if (typeof initializeSearch === 'function') initializeSearch();
    })
    .catch(e => console.warn('header load failed', e));

  fetch('../freelancer/hamburger-menu.html')
    .then(r => r.text()).then(html => {
      document.getElementById('hamburger-menu-placeholder').innerHTML = html;
      if (typeof initializeMenu === 'function')
        initializeMenu('jobs.html');
    })
    .catch(e => console.warn('menu load failed', e));
}

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem('authToken');
  opts.headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
    ...(token ? { Authorization: 'Bearer ' + token } : {})
  };
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
  }
  return fetch(path, opts)
    .then(r => {
      if (!r.ok) {
        return r.text().then(text => { 
          throw new Error(`${r.status}: ${r.statusText}. Server says: ${text}`);
        });
      }
      if (r.status === 204) {
        return null; 
      }
      return r.json();
    });
}

function mapApiOrderToJobFormat(dataBundle) {
  const { order, gigDetails } = dataBundle;
  if (!order) return null; 

  const originalGigTitle = (gigDetails && gigDetails.title) 
                ? gigDetails.title 
                : `Gig #${order.gigId}`;
  
  const displayTitle = `Order For ${originalGigTitle}`;

  return {
    id: order.id,
    title: displayTitle, 
    buyer: "",          
    gigId: order.gigId,
    image: '../assets/temp.png', 
    price: `$${order.orderPrice}`,
    priceType: order.priceFixed ? 'fixed' : 'hourly',
    createdAt: formatDate(order.createdAt),
    updatedAt: formatDate(order.updatedAt),
    status: order.status.toLowerCase(),
    description: order.requirements,
    clientFiles: order.uploadUrls || [],
    progress: order.percentage === null || order.percentage === undefined ? 0 : order.percentage,
    deliveredUrls: order.deliveryFileUrls || []
  };
}

async function fetchJobs() {
  try {
    const orders = await apiFetch('http://3.75.88.34:8080/api/orders/seller');

    const jobsWithDetails = await Promise.all(orders.map(async order => {
      let gigDetails = null;
      if (order.gigId != null) {
        try {
          gigDetails = await apiFetch(`/api/gigs/${order.gigId}`);
        } catch (e) {
          console.warn(`No gig for gigId ${order.gigId}:`, e.message);
        }
      }
      return mapApiOrderToJobFormat({ order, gigDetails });
    }));

    allJobs = jobsWithDetails.filter(job => job !== null);
    renderJobs(allJobs);

  } catch (e) {
    console.error('Could not load jobs:', e.message);
    document.getElementById('jobsGrid').innerHTML =
      '<p class="error">Failed to load your jobs.</p>';
  }
}

function filterJobs() {
  const status = document.getElementById('statusFilter').value;
  const jobs = status === 'all'
    ? allJobs.filter(j => j.status !== 'cancelled')
    : allJobs.filter(j => j.status === status);
  renderJobs(jobs);
}

function renderJobs(jobs) {
  const grid = document.getElementById('jobsGrid');
  if (!jobs.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-briefcase"></i>
        <h3>No jobs found</h3>
        <p>Try a different filter.</p>
      </div>`;
    return;
  }
  grid.innerHTML = '';
  jobs.forEach(job => {
    const card = document.createElement('div');
    card.className = 'job-card';
    card.innerHTML = `
      <div class="job-card-left">
        <div class="job-image" style="background-image:url('${job.image}')">
        </div>
      </div>
      <div class="job-card-center">
        <span class="badge ${job.priceType === 'fixed' ? 'fixed' : 'per-hour'}">
          ${job.priceType === 'fixed' ? 'Fixed Price' : 'Per Hour'}
        </span>
        <h3 class="job-title">${job.title}</h3>
        <p class="job-price">Price: ${job.price}</p>
        <p class="job-gig-id">Gig ID: ${job.gigId}</p>
      </div>
      <div class="job-card-right">
        <button class="view-job-btn">View Details</button>
      </div>`;
    grid.appendChild(card);
    card.querySelector('.view-job-btn')
      .addEventListener('click', () => openJobModal(job));
  });
}

function initModals() {
  document.querySelector('.close-modal-btn')
    .addEventListener('click', closeAllModals);
  document.getElementById('jobDetailsModal')
    .addEventListener('click', e => {
      if (e.target.id==='jobDetailsModal') closeAllModals();
    });

  document.getElementById('deliverWorkBtn')
    .addEventListener('click', () => {
      document.getElementById('deliverWorkModal')
        .classList.add('visible');
    });
  document.querySelector('.close-action-modal')
    .addEventListener('click', closeAllModals);
  document.querySelector('.cancel-button')
    .addEventListener('click', closeAllModals);

  const slider = document.getElementById('progressSlider');
  const display = document.getElementById('progressValue');
  slider.addEventListener('input', () => {
    display.textContent = `${slider.value}%`;
    slider.style.setProperty('--progress-percent', `${slider.value}%`);
  });

  document.getElementById('updateProgressBtn')
    .addEventListener('click', () => {
      if (!currentJob) {
        console.error('Update progress: No current job selected.');
        alert('Error: No job selected to update progress. Please select a job first.');
        return;
      }
      if (currentJob.id === undefined || currentJob.id === null || String(currentJob.id).trim() === "") {
        console.error('Update progress: Current job ID is missing or invalid.', currentJob);
        alert('Error: Cannot update progress because the job ID is missing. Please try reloading or selecting the job again.');
        return;
      }

      const slider = document.getElementById('progressSlider');
      const percentageValue = slider.value;

      apiFetch(
        `http://3.75.88.34:8080/api/orders/${currentJob.id}/percentage`,
        { 
          method: 'PATCH',
          body: parseInt(percentageValue, 10)
        }
      ).then(updatedOrderFromServer => {
        const orderIdToVerify = updatedOrderFromServer ? updatedOrderFromServer.id : currentJob.id;

        if (!updatedOrderFromServer) {
            console.log(`Progress update for job ID ${orderIdToVerify} acknowledged by server (no content). Re-fetching for verification.`);
        } else {
            console.log(`Progress updated for job ID ${orderIdToVerify}. Initial PATCH response percentage: ${updatedOrderFromServer.percentage}`);
        }
        
        apiFetch(`http://3.75.88.34:8080/api/orders/${orderIdToVerify}`)
          .then(verifiedOrder => {
            let newlyMappedJob;
            if (verifiedOrder) {
              console.log(`Verification GET for job ${orderIdToVerify} - RAW percentage from server: ${verifiedOrder.percentage}`);
              newlyMappedJob = mapApiOrderToJobFormat({ order: verifiedOrder, gigDetails: null }); 
              console.log(`Verification GET for job ${orderIdToVerify} - MAPPED progress for frontend: ${newlyMappedJob.progress}`);
            } else {
              console.log(`Verification GET request for job ${orderIdToVerify} - Order not found or no content. Using PATCH response if available.`);
              if (!updatedOrderFromServer) {
                console.error("No data from PATCH response and verification failed. UI may be stale. Re-fetching all jobs.");
                fetchJobs(); 
                return;
              }
              newlyMappedJob = mapApiOrderToJobFormat({ order: updatedOrderFromServer, gigDetails: null });
              console.warn(`Using potentially stale data from PATCH response for job ${orderIdToVerify} as verification failed.`);
            }

            if (currentJob && currentJob.id === newlyMappedJob.id) {
              Object.assign(currentJob, newlyMappedJob);
            }
            const jobIndexInAllJobs = allJobs.findIndex(j => j.id === newlyMappedJob.id);
            if (jobIndexInAllJobs !== -1) {
              allJobs[jobIndexInAllJobs] = newlyMappedJob;
            }
            
            const progressSlider = document.getElementById('progressSlider');
            const progressValueText = document.getElementById('progressValue');
            
            progressValueText.textContent = `${newlyMappedJob.progress}%`;
            progressSlider.value = newlyMappedJob.progress;
            progressSlider.style.setProperty('--progress-percent', `${newlyMappedJob.progress}%`);

            if (document.getElementById('jobDetailsModal').classList.contains('visible') && currentJob && currentJob.id === newlyMappedJob.id) {
              openJobModal(currentJob);
            }
            alert(`Job progress successfully updated to ${newlyMappedJob.progress}%.`);

          })
          .catch(err => {
            console.error(`Error fetching job ${orderIdToVerify} for verification:`, err);
            if (updatedOrderFromServer) {
                const newlyMappedJob = mapApiOrderToJobFormat({ order: updatedOrderFromServer, gigDetails: null });
                console.warn(`Using potentially stale data from PATCH response for job ${orderIdToVerify} due to verification error.`);
                if (currentJob && currentJob.id === newlyMappedJob.id) Object.assign(currentJob, newlyMappedJob);
                const jobIndexInAllJobs = allJobs.findIndex(j => j.id === newlyMappedJob.id);
                if (jobIndexInAllJobs !== -1) allJobs[jobIndexInAllJobs] = newlyMappedJob;
                
                const progressSlider = document.getElementById('progressSlider');
                const progressValueText = document.getElementById('progressValue');
                progressValueText.textContent = `${newlyMappedJob.progress}%`;
                progressSlider.value = newlyMappedJob.progress;
                progressSlider.style.setProperty('--progress-percent', `${newlyMappedJob.progress}%`);
                if (document.getElementById('jobDetailsModal').classList.contains('visible') && currentJob && currentJob.id === newlyMappedJob.id) {
                    openJobModal(currentJob);
                }
                alert(`Job progress successfully updated to ${newlyMappedJob.progress}%.`);
            } else {
                 console.error("No data from PATCH response and verification failed. UI may be stale.");
            }
          });
      }).catch(err => {
        console.error('Failed to update job progress via API:', err);
        alert(`Error updating progress: ${err.message}. Check console for more details.`);
      });
    });

  document.getElementById('submitDelivery')
    .addEventListener('click', () => {
      if (!currentJob) return;
      const uploaded = document.getElementById('uploadedFilesList')
        .querySelectorAll('.uploaded-file-item .uploaded-file-name');
      const urls = Array.from(uploaded).map((el, i) =>
        `/uploads/order_${currentJob.id}/file${i + 1}_${el.textContent.replace(/\s+/g, '_')}`
      );
      currentJob.deliveredUrls = urls;
      currentJob.progress = 100;
      const idx = allJobs.findIndex(j => j.id === currentJob.id);
      if (idx !== -1) allJobs[idx] = currentJob;
      changeStatusAndRefresh('delivered');
      closeAllModals();
    });

  document.getElementById('getTheJobBtn')
    .addEventListener('click', () => {
      if (!currentJob) return;
      const s = currentJob.status;
      if (s === 'pending') changeStatusAndRefresh('in_progress');
      else if (s === 'in_progress') changeStatusAndRefresh('delivered');
      else if (s === 'delivered') changeStatusAndRefresh('in_progress');
    });

  document.querySelectorAll('#jobDetailsModal .status-buttons .status-btn').forEach(button => {
    if (button.id === 'getTheJobBtn') return;

    button.addEventListener('click', () => {
      if (currentJob) {
        const newStatus = button.dataset.status;
        changeStatusAndRefresh(newStatus.toUpperCase());
      }
    });
  });
}

function getStatusIconClass(status) {
  const lowerStatus = status.toLowerCase();
  switch (lowerStatus) {
    case 'active':
      return 'fa-spinner';
    case 'in_progress':
    case 'inprogress': 
      return 'fa-tasks';
    case 'pending':
      return 'fa-clock';
    case 'delivered':
      return 'fa-truck';
    case 'completed':
      return 'fa-check-double';
    case 'cancelled':
      return 'fa-times-circle';
    default:
      return 'fa-info-circle';
  }
}

function openJobModal(job) {
  currentJob = job;

  document.getElementById('modalJobTitle').textContent = job.title;
  document.getElementById('modalOrderID').textContent = job.id;
  document.getElementById('modalPrice').textContent = job.price;
  document.getElementById('modalCreatedAt').textContent = job.createdAt;
  document.getElementById('modalUpdatedAt').textContent = job.updatedAt;
  
  const modalGigIDElement = document.getElementById('modalGigID');
  if (modalGigIDElement) {
    modalGigIDElement.textContent = job.gigId;
  }
  
  document.getElementById('modalDescription').textContent = job.description || 'No requirements provided.';

  const modalBuyerInfoItem = document.getElementById('modalBuyer').closest('.info-item');
  if (modalBuyerInfoItem) {
    modalBuyerInfoItem.style.display = 'none';
  }

  const modalStatus = document.getElementById('modalStatus');
  let statusText = job.status.replace(/_/g, ' '); 
  statusText = statusText.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  
  modalStatus.className = `info-value status-indicator ${job.status.toLowerCase()}`;
  modalStatus.innerHTML = `<i class="fas ${getStatusIconClass(job.status)}"></i> ${statusText}`;

  const modalPriceType = document.getElementById('modalPriceType');
  modalPriceType.textContent = job.priceType === 'fixed' ? 'Fixed Price' : 'Hourly Rate';
  modalPriceType.className = `badge ${job.priceType === 'fixed' ? 'fixed' : 'per-hour'}`;

  const filesList = document.getElementById('modalFilesList');
  filesList.innerHTML = ''; 
  if (job.clientFiles && job.clientFiles.length > 0) {
    job.clientFiles.forEach(fileUrl => {
      const fileItem = document.createElement('a');
      fileItem.href = fileUrl;
      fileItem.target = '_blank';
      fileItem.className = 'file-item-link'; 
      try {
        const url = new URL(fileUrl);
        fileItem.textContent = url.pathname.substring(url.pathname.lastIndexOf('/') + 1) || 'Download File';
      } catch (e) {
        fileItem.textContent = fileUrl.substring(fileUrl.lastIndexOf('/') + 1) || 'Download File';
      }
      
      const fileIcon = document.createElement('i');
      fileIcon.className = 'fas fa-download';
      
      const listItem = document.createElement('div');
      listItem.className = 'file-item';
      listItem.appendChild(fileIcon);
      listItem.appendChild(fileItem);
      filesList.appendChild(listItem);
    });
  } else {
    filesList.innerHTML = '<p>No files uploaded by the client.</p>';
  }

  const progressSlider = document.getElementById('progressSlider');
  const progressValue = document.getElementById('progressValue');
  progressSlider.value = job.progress || 0;
  progressValue.textContent = `${job.progress || 0}%`;
  progressSlider.style.setProperty('--progress-percent', `${job.progress || 0}%`);

  const sc = document.querySelector('.status-controls-section');
  const oa = document.querySelector('.order-actions-section');
  const btnA = document.getElementById('getTheJobBtn');
  const btnIP = document.querySelector('.status-buttons [data-status="in_progress"]');
  const btnC = document.querySelector('.status-buttons [data-status="cancelled"]');
  const sliderElement = document.getElementById('progressSlider'); 
  const upBtn = document.getElementById('updateProgressBtn');
  const deliverWorkBtn = document.getElementById('deliverWorkBtn'); 
  const progressSliderContainer = document.querySelector('.progress-slider-container'); 
  const completionProgressHeader = document.querySelector('.status-controls-section h4'); 

  const dueDateModalElement = document.getElementById('modalDueDate');
  if (dueDateModalElement && dueDateModalElement.parentElement.classList.contains('info-item')) {
      dueDateModalElement.parentElement.style.display = 'none';
  }

  sc.style.display = 'block';
  oa.style.display = 'flex';
  [btnA, btnIP, btnC].forEach(b => b && (b.style.display = 'none'));
  sliderElement.style.display = 'block'; 
  upBtn.style.display = 'inline-block';
  deliverWorkBtn.style.display = 'flex'; 
  if (progressSliderContainer) progressSliderContainer.style.display = 'flex'; 
  if (completionProgressHeader) completionProgressHeader.style.display = 'block'; 

  btnA.classList.remove('accept-job-style'); 

  if (job.status === 'pending') {
    btnA.textContent = 'Accept Job';
    btnA.style.display = 'inline-flex';
    btnA.classList.add('accept-job-style'); 
    btnC.style.display = 'inline-flex';
    sliderElement.style.display = 'none'; 
    upBtn.style.display = 'none';
    deliverWorkBtn.style.display = 'none'; 
    if (progressSliderContainer) progressSliderContainer.style.display = 'none'; 
    if (completionProgressHeader) completionProgressHeader.style.display = 'none'; 
  } else if (job.status === 'in_progress') {
    btnA.style.display = 'none'; 
    btnC.style.display = 'inline-flex';
  } else if (job.status === 'delivered') {
    btnIP.textContent = 'Reopen Job';
    btnIP.style.display = 'inline-flex';
    btnC.style.display = 'inline-flex';
    sliderElement.style.display = 'none'; 
    upBtn.style.display = 'none';
    deliverWorkBtn.style.display = 'none'; 
    if (progressSliderContainer) progressSliderContainer.style.display = 'none'; 
    if (completionProgressHeader) completionProgressHeader.style.display = 'none'; 
  } else if (job.status === 'cancelled') {
    sc.style.display = 'none';
    oa.style.display = 'none'; 
    sliderElement.style.display = 'none'; 
    upBtn.style.display = 'none';
    if (progressSliderContainer) progressSliderContainer.style.display = 'none';
    if (completionProgressHeader) completionProgressHeader.style.display = 'none'; 
  } else {
    if (job.status === 'completed') {
        sliderElement.style.display = 'none';
        upBtn.style.display = 'none';
        deliverWorkBtn.style.display = 'none';
        if (progressSliderContainer) progressSliderContainer.style.display = 'none';
        if (completionProgressHeader) completionProgressHeader.style.display = 'none'; 
    }
  }

  document.getElementById('jobDetailsModal').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  document.querySelectorAll('.visible')
    .forEach(m => m.classList.remove('visible'));
  document.body.style.overflow = '';
}

function changeStatus(newStatus) {
  if (!currentJob) return Promise.reject(new Error("No current job selected"));

  return apiFetch(
    `http://3.75.88.34:8080/api/orders/${currentJob.id}/status?status=${newStatus.toUpperCase()}`,
    { method: 'PATCH' }
  ).then(() => {
    fetchJobs();
  });
}

function changeStatusAndRefresh(newStatus) {
    if (!currentJob) return;
    const upperNewStatus = newStatus.toUpperCase();

    changeStatus(upperNewStatus).then(() => {
        setTimeout(() => {
            const updatedJob = allJobs.find(j => j.id === currentJob.id);
            if (updatedJob) {
                currentJob = updatedJob; 
                openJobModal(currentJob);
            } else {
                closeAllModals();
            }
            let displayStatusAlert = upperNewStatus.toLowerCase().replace(/_/g, ' ');
            displayStatusAlert = displayStatusAlert.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            alert(`Job status has been successfully updated to '${displayStatusAlert}'.`);
        }, 500);
    }).catch(err => {
        console.error(`Failed to change status to ${upperNewStatus}`, err);
        alert(`Failed to change status: ${err.message}`);
        const stillCurrentJob = allJobs.find(j => j.id === currentJob.id);
        if (stillCurrentJob) openJobModal(stillCurrentJob);
    });
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined,{
    year:'numeric', month:'short', day:'numeric'
  });
}