document.addEventListener('DOMContentLoaded', () => {
  const listingsGrid = document.querySelector('.listings-grid');
  const emptyState = document.getElementById('emptyState');
  const modal = document.getElementById('listingDetailsModal');
  const modalBody = modal.querySelector('.modal-body');
  let listingsData = [];

  function fetchListings() {
    fetch('http://3.75.88.34:8080/api/listings/my', {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('authToken') && {
          'Authorization': 'Bearer ' + localStorage.getItem('authToken')
        })
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch listings');
        return res.json();
      })
      .then(data => {
        listingsData = data;
        renderListings();
      })
      .catch(err => {
        console.error(err);
        alert('Error loading listings');
      });
  }

  function renderListings() {
    listingsGrid.innerHTML = '';
    if (!listingsData.length) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';
    listingsData.forEach(l => listingsGrid.appendChild(createListingCard(l)));
  }

  function createListingCard(l) {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.dataset.id = l.id;
    const statusLower = l.status.toLowerCase();
    const statusDisplay = l.status.charAt(0) + l.status.slice(1).toLowerCase();
    const budget = l.priceFixed ? `$${l.price}` : `$${l.price}/hr`;
    const bidsCount = (l.bids || []).length;

    card.innerHTML = `
      <div class="listing-card-left">
        <div class="listing-image" style="background-image:url(${'../assets/temp.png'})"></div>
      </div>
      <div class="listing-card-center">
        <span class="listing-status ${statusLower}">${statusDisplay}</span>
        <h3 class="listing-title">${l.title}</h3>
        <div class="listing-details">
          <div class="listing-detail"><span class="detail-label">Budget:</span><span class="detail-value">${budget}</span></div>
          <div class="listing-detail"><span class="detail-label">Category:</span><span class="detail-value">${l.category}</span></div>
          <div class="listing-detail"><span class="detail-label">Created:</span><span class="detail-value">${formatDate(l.createdAt)}</span></div>
          <div class="listing-detail"><span class="detail-label">${statusLower==='active'?'Bids:':'Status:'}</span><span class="detail-value">${statusLower==='active'?bidsCount:statusDisplay}</span></div>
        </div>
      </div>
      <div class="listing-card-right">
        <button class="view-listing-btn enhanced" data-id="${l.id}"><i class="fas fa-eye"></i> ${statusLower==='active'?'View Bids':'View Details'}</button>
        <button class="delete-listing-btn" data-id="${l.id}"><i class="fas fa-trash-alt"></i> Delete</button>
      </div>
    `;

    card.addEventListener('click', e => {
      if (!e.target.closest('button')) openListingDetails(l.id);
    });
    card.querySelector('.view-listing-btn').addEventListener('click', e => {
      e.stopPropagation(); openListingDetails(l.id);
    });
    card.querySelector('.delete-listing-btn').addEventListener('click', e => {
      e.stopPropagation(); deleteListing(l.id);
    });

    return card;
  }

  function openListingDetails(id) {
    const l = listingsData.find(x => x.id === +id);
    if (!l) return;
    const statusLower = l.status.toLowerCase();
    const statusDisplay = l.status.charAt(0) + l.status.slice(1).toLowerCase();
    const bids = l.bids || [];
    const isActive = statusLower === 'active';

    modal.querySelector('.modal-header h2').textContent = isActive ? 'Review Bids' : 'Listing Details';

    let html = `
      <div class="listing-header">
        <h3>${l.title}</h3>
        <div class="listing-meta">
          <div class="listing-meta-item"><i class="fas fa-tag"></i><span><strong>Budget:</strong> ${l.priceFixed?`$${l.price}`:`$${l.price}/hr`}</span></div>
          <div class="listing-meta-item"><i class="fas fa-folder"></i><span><strong>Category:</strong> ${l.category}</span></div>
          <div class="listing-meta-item"><i class="fas fa-calendar-alt"></i><span><strong>Posted:</strong> ${formatDate(l.createdAt)}</span></div>
          <div class="listing-meta-item"><i class="fas fa-circle ${ statusLower==='active'?'text-primary': statusLower==='awarded'?'text-info':'text-success' }"></i><span><strong>Status:</strong> ${statusDisplay}</span></div>
        </div>
      </div>
      <div class="listing-content">
        <div class="content-section">
          <h4 class="section-title"><i class="fas fa-align-left"></i>Project Description</h4>
          <p class="description-text">${l.description}</p>
        </div>
    `;

    if (isActive) {
      html += `
        <div class="content-section">
          <h4 class="section-title"><i class="fas fa-comments-dollar"></i>Submitted Bids</h4>
          ${bids.length ? `<div class="bids-list">
            ${bids.map(b => {
              const rating = (b.bidderRating!=null) ? `<div class="bidder-rating"><i class="fas fa-star"></i> ${b.bidderRating.toFixed(1)}</div>` : '';
              return `
                <div class="bid-card">
                  <div class="bid-header">
                    <div class="bidder-info">
                      <div class="bidder-avatar">${b.bidderInitials||'?'}</div>
                      <div class="bidder-details">
                        <div class="bidder-name">${b.bidderDisplayName}</div>
                        ${rating}
                      </div>
                    </div>
                    <div class="bid-price">$${b.requestedPrice}</div>
                  </div>
                  <div class="bid-content">${b.description}</div>
                  <div class="bid-actions">
                    <button class="award-btn" data-bid-id="${b.id}"><i class="fas fa-check-circle"></i> Award this freelancer</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>` : `
            <div class="no-bids-container">
              <i class="fas fa-coffee"></i>
              <h5>No bids yet</h5>
              <p>No one’s bid on this yet. Try promoting it!</p>
            </div>
          `}
        </div>
      `;
    } else if (statusLower === 'awarded') {
      html += `
        <div class="content-section">
          <h4 class="section-title"><i class="fas fa-user-check"></i> Awarded Freelancer</h4>
          <div class="awarded-section">
            <div class="awarded-header">
              <div class="freelancer-avatar">${l.awardedInitials||'?'}</div>
              <div class="freelancer-info">
                <h5>${l.awardedToUserDisplayName}</h5>
                ${(l.awardedRating!=null)?`<p><i class="fas fa-star"></i> ${l.awardedRating.toFixed(1)}</p>`:''}
              </div>
            </div>
            <div class="job-progress">
              <div class="progress-stats">
                <span>Progress: <strong>${l.orderProgress}%</strong></span>
                <span>Expected: <strong>${formatDate(l.expectedDelivery)}</strong></span>
              </div>
              <div class="progress-bar-container"><div class="progress-bar-fill" style="width:${l.orderProgress}%"></div></div>
              <button class="btn btn-sm btn-outline-secondary mt-2"><i class="fas fa-comment-alt"></i> Message Freelancer</button>
            </div>
          </div>
        </div>
      `;
    } else {
      html += `
        <div class="content-section">
          <h4 class="section-title"><i class="fas fa-check-circle"></i> Project Completed</h4>
          <div class="awarded-section">
            <div class="awarded-header">
              <div class="freelancer-avatar">${l.awardedInitials||'?'}</div>
              <div class="freelancer-info">
                <h5>${l.awardedToUserDisplayName}</h5>
                ${(l.awardedRating!=null)?`<p><i class="fas fa-star"></i> ${l.awardedRating.toFixed(1)}</p>`:''}
              </div>
            </div>
            <div class="job-progress">
              <div class="progress-stats"><span>Completed: <strong>${formatDate(l.completedDate)}</strong></span></div>
              <div class="progress-bar-container"><div class="progress-bar-fill" style="width:100%"></div></div>
              <div class="mt-3">
                <button class="btn btn-success me-2"><i class="fas fa-download"></i> Download</button>
                <button class="btn btn-outline-primary"><i class="fas fa-star"></i> Leave Feedback</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    html += `</div>`;
    modalBody.innerHTML = html;

    if (isActive) {
      modalBody.querySelectorAll('.award-btn').forEach(btn =>
        btn.addEventListener('click', () => awardBid(id, btn.dataset.bidId))
      );
    }

    modal.classList.add('visible');
    modal.querySelector('.close-modal-btn').onclick = () => modal.classList.remove('visible');
    modal.onclick = e => { if (e.target === modal) modal.classList.remove('visible'); };
  }

  function deleteListing(id) {
    if (!confirm('Delete this listing?')) return;
    fetch(`http://3.75.88.34:8080/api/listings/${id}`, { method:'DELETE', headers:{ 'Content-Type':'application/json', ...(localStorage.getItem('authToken')&&{'Authorization':'Bearer '+localStorage.getItem('authToken')}) }})
      .then(r => { if(!r.ok) throw ''; listingsData = listingsData.filter(x=>x.id!==id); renderListings(); alert('Deleted'); })
      .catch(()=>alert('Delete failed'));
  }

  function awardBid(listingId, bidId) {
    if (!confirm('Award this freelancer?')) return;
    fetch(`http://3.75.88.34:8080/api/listings/${listingId}/award`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json', ...(localStorage.getItem('authToken')&&{'Authorization':'Bearer '+localStorage.getItem('authToken')}) },
      body: JSON.stringify({ bidId: parseInt(bidId) })
    })
      .then(r => { if(!r.ok) throw ''; return r.json() })
      .then(o => { fetchListings(); modal.classList.remove('visible'); alert(`Awarded! Order ${o.id}`); })
      .catch(()=>alert('Award failed'));
  }

  function formatDate(s) {
    return new Date(s).toLocaleDateString(undefined, { year:'numeric',month:'short',day:'numeric' });
  }

  fetchListings();
});