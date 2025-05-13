console.log('[My-Gigs] script loaded');

const API_BASE = 'http://localhost:8080/api';
const TOKEN    = localStorage.getItem('authToken') || localStorage.getItem('token');

const ok  = typeof successMessage === 'function' ? successMessage : m => alert(m);
const bad = typeof errorMessage   === 'function' ? errorMessage   : m => alert(`❌ ${m}`);

const $  = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const pretty = c => c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, v => v.toUpperCase());

let currentGig = null;

window.deleteGig = async function() {
  if (!currentGig || !currentGig.id) {
    bad('No valid gig selected for deletion.');
    return;
  }
  
  const confirmMsg = `Are you sure you want to delete "${currentGig.title}"?\n\nThis action cannot be undone.`;
  if (!confirm(confirmMsg)) return;

  const deleteButton = document.getElementById('modalDeleteBtn');
  if (deleteButton) {
    deleteButton.disabled = true;
    deleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
  }

  try {
    console.log(`Deleting gig ${currentGig.id}...`);
    const res = await fetch(`${API_BASE}/gigs/${currentGig.id}`, {
      method: 'DELETE',
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
    });
    
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

    const card = document.querySelector(`.order-card[data-id='${currentGig.id}']`);
    if (card) {
      card.style.opacity = '0';
      setTimeout(() => card.remove(), 300);
    }
    
    closeModal();
    ok('Gig successfully deleted');
  } catch (err) {
    console.error('Delete error:', err);
    if (deleteButton) {
      deleteButton.disabled = false;
      deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Gig';
    }
    bad(`Failed to delete gig: ${err.message}`);
  }
};

function getIsPriceFixed(g) {
  const keysToCheck = ['isPriceFixed', 'ispricefixed', 'priceFixed', 'pricefixed'];
  for (const key of keysToCheck) {
    if (g.hasOwnProperty(key)) {
      const value = g[key];
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      if (typeof value === 'number') return value === 1; 
    }
  }
  return false; 
}

function getIsPerHour(g) {
  const keysToCheck = ['isPerHourPricing', 'isperhourpricing', 'isHourlyRate', 'ishourlyrate', 'perHour', 'perhour', 'hourlyRate', 'hourlyrate', 'perHourPricing', 'perhourpricing']; 
  for (const key of keysToCheck) {
    if (g.hasOwnProperty(key)) {
      const value = g[key];
      if (typeof value === 'boolean') return value;
      if (typeof value === 'string') return value.toLowerCase() === 'true';
      if (typeof value === 'number') return value === 1;
    }
  }
  return false; 
}

function getPricingTypeText(g) {
  if (!getIsPriceFixed(g)) {
    return 'Negotiable';
  }
  if (getIsPerHour(g)) {
    return 'Fixed - Hourly';
  }
  return 'Fixed - Per Project';
}

function pricingBadge(g) {
  let badgesHTML = '';
  if (!getIsPriceFixed(g)) {
    badgesHTML = '<span class="badge neg"><i class="fas fa-handshake"></i> Negotiable</span>';
    if (getIsPerHour(g)) {
      badgesHTML += ' <span class="badge per-hour"><i class="fas fa-clock"></i> Hourly</span>';
    } else {
      badgesHTML += ' <span class="badge per-project"><i class="fas fa-file-invoice-dollar"></i> Per Project</span>';
    }
  } else {
    badgesHTML = '<span class="badge fixed"><i class="fas fa-tag"></i> Fixed</span>';
    if (getIsPerHour(g)) {
      badgesHTML += ' <span class="badge per-hour"><i class="fas fa-clock"></i> Hourly</span>';
    } else {
      badgesHTML += ' <span class="badge per-project"><i class="fas fa-file-invoice-dollar"></i> Per Project</span>';
    }
  }
  return badgesHTML;
}

function formatDate(date) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

function createCard(g) {
  const div = document.createElement('div');
  div.className = 'order-card';
  div.dataset.id = g.id;
  div.gig = g;                        

  console.log(`RAW GIG DATA for Gig ID ${g.id}:`, JSON.stringify(g, null, 2)); 

  const isFixed = getIsPriceFixed(g);
  const isHourly = getIsPerHour(g);
  console.log(`Gig ${g.id}: Evaluated isPriceFixed=${isFixed}, Evaluated isPerHour=${isHourly}`);

  div.innerHTML = `
    <div class="order-card-left">
      <div class="order-image" style="background-image:url('${g.coverImageUrl || '../assets/temp.png'}')">
        <div class="order-provider">${pretty(g.category)}</div>
      </div>
    </div>

    <div class="order-card-center">
      <div class="order-status"><i class="fas fa-bolt"></i></div>
      <h3 class="order-title">${g.title}</h3>

      <div class="order-details">
        <div class="order-detail">
          <span class="detail-label">Price:</span>
          <span class="detail-value">$${g.price}</span>
          ${pricingBadge(g)}
        </div>
        <div class="order-detail">
          <span class="detail-label">Delivery:</span>
          <span class="detail-value">${g.deliveryTimeDays} days</span>
        </div>
        <div class="order-detail">
          <span class="detail-label">Languages:</span>
          <span class="detail-value">${(g.languages || []).join(', ') || '—'}</span>
        </div>
        <div class="order-detail">
          <span class="detail-label">Created:</span>
          <span class="detail-value">${formatDate(g.createdAt)}</span>
        </div>
      </div>
    </div>

    <div class="order-card-right">
      <a href="#" class="view-order-btn">View Gig <i class="fas fa-arrow-right"></i></a>
    </div>`;
  return div;
}

const modal = $('#orderDetailsModal');

function openModal(g) {
  if (!g || !g.id) {
    console.error('Attempted to open modal with invalid gig data:', g);
    bad('Could not load gig details. Invalid data.');
    return;
  }
  currentGig = g; 
  console.log('Opening modal for gig:', currentGig);

  $('#modalGigTitle').textContent       = g.title || 'Gig Details'; 
  $('#modalCategoryValue').textContent  = g.category ? pretty(g.category) : '—';
  $('#modalPriceValue').textContent     = typeof g.price === 'number' ? `$${g.price}` : '—';
  $('#modalDateValue').textContent      = formatDate(g.createdAt);
  $('#modalDescriptionContent').textContent = g.description;
  $('#modalPricingTypeValue').textContent = getPricingTypeText(g);
  $('#modalLanguagesValue').textContent = (g.languages || []).join(', ') || '—';
  $('#modalToolsValue').textContent = g.toolsAndTechnology || '—';

  const whatYouGetList = $('#modalWhatYouGetList');
  if (g.whatYouGet && g.whatYouGet.length > 0) {
    whatYouGetList.innerHTML = g.whatYouGet
      .map(item => `<li class="what-you-get-item"><i class="fas fa-check-circle"></i> ${item}</li>`)
      .join('');
  } else {
    whatYouGetList.innerHTML = '<li class="what-you-get-item">No features specified</li>';
  }

  const files = $('#modalFilesList');
  files.innerHTML = g.fileUrls && g.fileUrls.length
      ? g.fileUrls.map(u => `<a href="${u}" target="_blank" class="file-item">
          <i class="fas fa-file-alt"></i>
          <span class="file-name">${u.split('/').pop()}</span>
          <i class="fas fa-download file-download-btn"></i>
         </a>`).join('')
      : '<p>No files attached</p>';

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('visible'), 10);
}

function closeModal() {
  modal.classList.remove('visible');
  setTimeout(() => (modal.style.display = 'none'), 300);
  currentGig = null;
}

async function loadGigs() {
  const grid = $('.orders-grid');
  grid.textContent = 'Loading…';
  console.log('[My-Gigs] fetching /gigs/my-gigs – token?', !!TOKEN);

  try {
    const res = await fetch(`${API_BASE}/gigs/my-gigs`, {
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const gigs = await res.json();
    grid.innerHTML = gigs.length ? '' : '<p>You have no gigs yet.</p>';
    gigs.forEach(g => grid.appendChild(createCard(g)));
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="error">Failed to load gigs.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadGigs();

  $('.orders-grid').addEventListener('click', e => {
    const view = e.target.closest('.view-order-btn');
    if (view) {
      e.preventDefault();
      openModal(view.closest('.order-card').gig);
    }
  });

  $('#orderDetailsModal .close-modal-btn').onclick = closeModal;
  
  modal.addEventListener('click', e => {
    if (e.target.id === 'orderDetailsModal') closeModal();
  });
  
  const deleteBtn = $('#modalDeleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', deleteGig);
  } else {
    console.error('Modal delete button (#modalDeleteBtn) not found on DOMContentLoaded.');
  }
});
