console.log('[My-Gigs] script loaded');

const API_BASE = 'http://localhost:8080/api';
const TOKEN    = localStorage.getItem('authToken') || localStorage.getItem('token');

const ok  = typeof successMessage === 'function' ? successMessage : m => alert(m);
const bad = typeof errorMessage   === 'function' ? errorMessage   : m => alert(`❌ ${m}`);

const $  = (sel, scope = document) => scope.querySelector(sel);
const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
const pretty = c => c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, v => v.toUpperCase());

let currentGig = null;

function pricingBadge(g) {
  if (!g.isPriceFixed) return '<span class="badge neg">Negotiable</span>';
  return g.isPerHourPricing
    ? '<span class="badge per-hour">Hourly</span>'
    : '<span class="badge fixed">Fixed</span>';
}

function createCard(g) {
  const div = document.createElement('div');
  div.className = 'order-card';
  div.dataset.id = g.id;
  div.gig = g;                        

  div.innerHTML = `
    <div class="order-card-left">
      <div class="order-image" style="background-image:url('${g.coverImageUrl || '../assets/temp.png'}')">
        <div class="order-provider">${pretty(g.category)}</div>
      </div>
    </div>

    <div class="order-card-center">
      <div class="order-status active"><i class="fas fa-bolt"></i> Active</div>
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
          <span class="detail-label">Tools:</span>
          <span class="detail-value">${g.toolsAndTechnology || '—'}</span>
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
  currentGig = g;
  $('#modalGigTitle').textContent       = g.title;
  $('#modalCategoryValue').textContent  = pretty(g.category);
  $('#modalPriceValue').textContent     = `$${g.price}`;
  $('#modalDateValue').textContent      = new Date(g.createdAt || Date.now()).toLocaleDateString();
  $('#modalDescriptionContent').textContent = g.description;

  const files = $('#modalFilesList');
  files.innerHTML = g.fileUrls && g.fileUrls.length
      ? g.fileUrls.map(u => `<a href="${u}" target="_blank">${u.split('/').pop()}</a>`).join('<br>')
      : '—';

  modal.style.display = 'flex';
  setTimeout(() => modal.classList.add('visible'), 10);
}

function closeModal() {
  modal.classList.remove('visible');
  setTimeout(() => (modal.style.display = 'none'), 300);
  currentGig = null;
}

async function deleteGig() {
  if (!currentGig) return;
  if (!confirm('Delete this gig permanently?')) return;

  try {
    const res = await fetch(`${API_BASE}/gigs/${currentGig.id}`, {
      method:  'DELETE',
      headers: TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    document.querySelector(`.order-card[data-id='${currentGig.id}']`)?.remove();
    closeModal();
    ok('Gig deleted');
  } catch (err) {
    console.error(err);
    bad('Failed to delete gig.');
  }
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
  $('#modalDeleteBtn').onclick = deleteGig;
});
