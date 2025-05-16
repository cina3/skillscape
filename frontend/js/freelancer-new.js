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
    priceLbl.textContent = perHr ? 'Hourly Price ($)*' : 'Price ($)*';
    priceHint.textContent= perHr
      ? 'Rate charged per hour of work.'
      : 'Fixed amount for entire project/item.';
  }
  natureSel?.addEventListener('change', updatePriceText);
  unitSel?.addEventListener('change',   updatePriceText);

  document.getElementById('newGigForm').addEventListener('submit', async ev => {
    ev.preventDefault();

    const bullets = document.getElementById('whatYouGet').value
      .split('\n').map(s=>s.trim()).filter(Boolean);

    const title = document.getElementById('title').value.trim();
    if (title.length < 5) return bad('Title must be at least 5 characters.');
    const desc  = document.getElementById('description').value.trim();
    if (desc.length < 20) return bad('Description must be at least 20 characters.');

    const priceVal = +document.getElementById('price').value;
    if (!priceVal || priceVal < 1) return bad('Enter a valid price ≥ 1.');

    if (!natureSel.value || !unitSel.value)
      return bad('Select Pricing Nature and Billing Unit.');

    const days = selDelivery.value === 'custom' ? +inpCustom.value : +selDelivery.value;
    if (!days) return bad('Specify delivery time.');

    // Cover image validation
    const coverInput = document.getElementById('coverImage');
    if (!coverInput.files || coverInput.files.length === 0) {
      return bad('Please upload a cover image for your gig.');
    }

    let coverImageUrl = null;
    if (coverInput.files && coverInput.files.length > 0) {
      coverImageUrl = coverInput.files[0].name;
    }

    // Gallery images collection
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
      category:           mapCategory(document.getElementById('category').value),
      deliveryTimeDays:   days,
      whatYouGet:         bullets,
      toolsAndTechnology: document.getElementById('toolsAndTechnology').value.trim(),
      languages:          document.getElementById('languages').value
                            .split(',').map(s=>s.trim()).filter(Boolean),
      coverImageUrl: coverImageUrl,
      fileUrls: galleryFileUrls
    };

    try {
      // Show loading state
      const submitBtn = document.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';

      const res = await fetch(`${BASE}/gigs`, {
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

      // Reset button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;

      const successModal = document.getElementById('successModal');
      if (successModal) {
        successModal.style.display = 'flex'; // Use flex for consistency
        
        // Ensure modal event handlers are attached
        const closeButtons = successModal.querySelectorAll('.close-modal, #closeModalBtn');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                successModal.style.display = 'none';
            });
        });
        
        // Make View Gigs button redirect to my.html
        const viewGigBtn = document.getElementById('viewGigBtn');
        if (viewGigBtn) {
            viewGigBtn.textContent = 'View Gigs'; // Ensure text matches
            viewGigBtn.removeEventListener('click', viewGigBtn.clickHandler);
            viewGigBtn.clickHandler = function() {
                window.location.href = 'my.html';
            };
            viewGigBtn.addEventListener('click', viewGigBtn.clickHandler);
        }
      }

    } catch (err) {
      console.error(err);
      // Reset button state
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Publish Gig';
      }
      bad(err.message.slice(0, 300));
    }
  });
});