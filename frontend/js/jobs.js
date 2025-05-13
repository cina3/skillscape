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

function mapApiOrderToJobFormat(o) {
  if (!o) return null; 
  return {
    id: o.id,
    title: `Gig #${o.gigId}`,
    buyer: `Buyer #${o.buyerId}`,
    image: '../assets/temp.png', 
    price: `$${o.orderPrice}`,
    priceType: o.priceFixed ? 'fixed' : 'hourly',
    dueDate: formatDate(o.expectedDeliveryDate),
    createdAt: formatDate(o.createdAt),
    updatedAt: formatDate(o.updatedAt),
    status: o.status.toLowerCase(),
    description: o.requirements,
    clientFiles: o.uploadUrls || [],
    progress: o.percentage === null || o.percentage === undefined ? 0 : o.percentage 
  };
}

async function fetchJobs() {
  try {
    const data = await apiFetch('http://localhost:8080/api/orders/seller');
    allJobs = data.map(mapApiOrderToJobFormat).filter(job => job !== null); 
    renderJobs(allJobs);
  } catch (e) {
    console.error('could not load jobs', e);
    document.getElementById('jobsGrid').innerHTML =
      '<p class="error">Failed to load your jobs.</p>';
  }
}

function filterJobs() {
  const status = document.getElementById('statusFilter').value;
  renderJobs(
    status === 'all'
      ? allJobs
      : allJobs.filter(j => j.status === status)
  );
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
      <div class="job-image" style="background-image:url('${job.image}')">
        <div class="job-buyer">From: ${job.buyer}</div>
      </div>
      <div class="job-info">
        <span class="badge ${job.priceType}">
          ${job.priceType==='fixed'?'Fixed':'Per Hour'}
        </span>
        <h3>${job.title}</h3>
        <p>Price: ${job.price}</p>
        <p>Due: ${job.dueDate}</p>
      </div>
      <button class="view-job-btn">View Details</button>`;
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
        `http://localhost:8080/api/orders/${currentJob.id}/percentage`,
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
        
        apiFetch(`http://localhost:8080/api/orders/${orderIdToVerify}`)
          .then(verifiedOrder => {
            if (verifiedOrder) {
              console.log(`Verification GET for job ${orderIdToVerify} - RAW percentage from server: ${verifiedOrder.percentage}`);
              
              const newlyMappedJob = mapApiOrderToJobFormat(verifiedOrder); 
              console.log(`Verification GET for job ${orderIdToVerify} - MAPPED progress for frontend: ${newlyMappedJob.progress}`);


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

              if (String(newlyMappedJob.progress) === '100') {
                if (confirm('Progress is 100%. Mark job as DELIVERED?')) {
                  changeStatus('DELIVERED')
                    .then(() => {
                      alert('Job successfully marked as DELIVERED.');
                      if (document.getElementById('jobDetailsModal').classList.contains('visible') && currentJob) {
                          const finalUpdatedJob = allJobs.find(j => j.id === currentJob.id);
                          if (finalUpdatedJob) openJobModal(finalUpdatedJob);
                      }
                    })
                    .catch(err => {
                      console.error('Failed to mark job as DELIVERED after progress update:', err);
                      alert(`Failed to mark job as DELIVERED: ${err.message}`);
                    });
                } else {
                  fetchJobs(); 
                }
              } else {
                fetchJobs();
              }
            } else {
              console.log(`Verification GET request for job ${orderIdToVerify} - Order not found or no content. Display may not reflect true server state if PATCH response was also empty.`);
              if (!updatedOrderFromServer) {
                fetchJobs(); 
                return;
              }
              const newlyMappedJob = mapApiOrderToJobFormat(updatedOrderFromServer);
              console.warn(`Using potentially stale data from PATCH response for job ${orderIdToVerify} as verification failed.`);
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
              if (String(newlyMappedJob.progress) === '100') {
                fetchJobs();
              }
            }
          })
          .catch(err => {
            console.error(`Error fetching job ${orderIdToVerify} for verification:`, err);
            if (!updatedOrderFromServer) {
                console.error("No data from PATCH response and verification failed. UI may be stale.");
                fetchJobs(); 
                return;
            }
            const newlyMappedJob = mapApiOrderToJobFormat(updatedOrderFromServer);
            console.warn(`Using potentially stale data from PATCH response for job ${orderIdToVerify} due to verification error.`);
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
            if (String(newlyMappedJob.progress) === '100') {
              fetchJobs();
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
      changeStatus('DELIVERED').then(() => {
        alert('Work delivered!');
        closeAllModals();
      });
    });

  document.querySelectorAll('#jobDetailsModal .status-buttons .status-btn').forEach(button => {
    button.addEventListener('click', () => {
      if (currentJob) {
        const newStatus = button.dataset.status;
        changeStatus(newStatus.toUpperCase()).then(() => {
          currentJob.status = newStatus; 
          openJobModal(currentJob);
          alert(`Job status changed to ${newStatus.toUpperCase()}`);
        }).catch(err => {
          console.error('Failed to change status', err);
          alert(`Failed to change status: ${err.message}`);
        });
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
  document.getElementById('modalBuyer').textContent = job.buyer;
  document.getElementById('modalPrice').textContent = job.price;
  document.getElementById('modalCreatedAt').textContent = job.createdAt;
  document.getElementById('modalUpdatedAt').textContent = job.updatedAt;
  document.getElementById('modalDueDate').textContent = job.dueDate;
  document.getElementById('modalDescription').textContent = job.description || 'No requirements provided.';

  const modalStatus = document.getElementById('modalStatus');
  const statusText = job.status.charAt(0).toUpperCase() + job.status.slice(1);
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

  document.querySelectorAll('#jobDetailsModal .status-buttons .status-btn').forEach(button => {
    button.classList.remove('selected');
    if (button.dataset.status === job.status.toLowerCase()) {
      button.classList.add('selected');
    }
  });
  
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
    `http://localhost:8080/api/orders/${currentJob.id}/status?status=${newStatus.toUpperCase()}`,
    { method: 'PATCH' }
  ).then(() => {
    fetchJobs();
  });
}

function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined,{
    year:'numeric', month:'short', day:'numeric'
  });
}