document.addEventListener('DOMContentLoaded', () => {
  const ok  = typeof successMessage === 'function' ? successMessage : m => alert(m);
  const bad = typeof errorMessage   === 'function' ? errorMessage   : m => alert(`❌ ${m}`);

  const BASE  = 'http://localhost:8080/api';
  const TOKEN = localStorage.getItem('authToken') || localStorage.getItem('token');

  const mapCategory = v => ({
    webdesign:    'WEB_DESIGN',
    engineering:  'ENGINEERING',
    artdesign:    'ART_DESIGN',
    music:        'MUSIC',
    videoediting: 'VIDEO_EDITING',
    itsoftware:   'IT_SOFTWARE',
    aiservices:   'AI_SERVICES',
    marketing:    'MARKETING',
    finance:      'FINANCE',
    other:        'OTHER'
  }[v] || 'OTHER');

  const selDelivery = document.getElementById('deliveryTimeDays');
  const grpCustom   = document.getElementById('customDeliveryTimeGroup');
  const inpCustom   = document.getElementById('customDeliveryTime');
  selDelivery?.addEventListener('change', () => {
    grpCustom.style.display = selDelivery.value === 'custom' ? 'block' : 'none';
    if (selDelivery.value !== 'custom') inpCustom.value = '';
  });

  const natureSel  = document.getElementById('pricingNature');
  const unitSel    = document.getElementById('billingUnit');
  const priceLbl   = document.getElementById('priceLabel');
  const priceHint  = document.getElementById('priceHint');
  function updatePriceText() {
    const perHr = unitSel.value === 'hourly';
    priceLbl.textContent = perHr ? 'Hourly Budget ($)*' : 'Budget ($)*';
    priceHint.textContent= perHr
      ? 'Amount you are willing to pay per hour of work.'
      : 'Total budget for the entire project.';
  }
  natureSel?.addEventListener('change', updatePriceText);
  unitSel?.addEventListener('change',   updatePriceText);

  document.getElementById('newListingForm').addEventListener('submit', async ev => {
    ev.preventDefault();

    const bullets = document.getElementById('whatYouGet').value
      .split('\n').map(s=>s.trim()).filter(Boolean);

    const title = document.getElementById('listingTitle').value.trim();
    if (title.length < 5) return bad('Title must be at least 5 characters.');
    const desc  = document.getElementById('description').value.trim();
    if (desc.length < 20) return bad('Description must be at least 20 characters.');

    const priceVal = +document.getElementById('budget').value;
    if (!priceVal || priceVal < 1) return bad('Enter a valid budget ≥ 1.');

    if (!natureSel.value || !unitSel.value)
      return bad('Select Pricing Nature and Billing Unit.');

    const days = selDelivery.value === 'custom' ? +inpCustom.value : +selDelivery.value;
    if (!days) return bad('Specify expected delivery time.');

    let coverImageUrl = null;
    const coverInput = document.getElementById('coverImage');
    if (coverInput.files && coverInput.files.length > 0) {
      coverImageUrl = coverInput.files[0].name;
    }

    const uploadedFiles = document.getElementById('uploadedFiles');
    const galleryFileUrls = [];
    
    if (uploadedFiles) {
      const galleryItems = uploadedFiles.querySelectorAll('.gallery-thumb');
      galleryItems.forEach(item => {
        if (item.dataset.filename) {
          galleryFileUrls.push(item.dataset.filename);
        }
      });
    }

    const payload = {
      title,
      description:        desc,
      price:              priceVal,
      isPriceFixed:       natureSel.value === 'fixed_direct',
      isPerHourPricing:   unitSel.value === 'hourly',
      category:           document.getElementById('category').value,
      deliveryTimeDays:   days,
      whatYouGet:         bullets,
      toolsAndTechnology: document.getElementById('toolsAndTechnology').value.trim(),
      languages:          document.getElementById('languages').value
                            .split(',').map(s=>s.trim()).filter(Boolean),
      coverImageUrl:      coverImageUrl,
      fileUrls:           galleryFileUrls
    };

    try {
      
      const submitBtn = document.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

      const res = await fetch(`${BASE}/listings`, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(TOKEN && { Authorization: `Bearer ${TOKEN}` })
        },
        body: JSON.stringify(payload)
      });

      const raw = await res.text();
      if (!res.ok) {
        console.error('Raw backend response:', raw);
        throw new Error(raw);
      }

      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      const successModal = document.getElementById('successModal');
      if (successModal) {
        successModal.style.display = 'flex';
        
        const closeButtons = successModal.querySelectorAll('.close-modal, #closeModalBtn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                successModal.style.display = 'none';
            });
        });
        
        const viewListingBtn = document.getElementById('viewListingBtn');
        if (viewListingBtn) {
            viewListingBtn.removeEventListener('click', viewListingBtn.clickHandler);
            viewListingBtn.clickHandler = function() {
                window.location.href = 'my.html';
            };
            viewListingBtn.addEventListener('click', viewListingBtn.clickHandler);
        }
      }

    } catch (err) {
      console.error(err);
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Post Listing';
      }
      bad(err.message.slice(0, 300));
    }
  });
});