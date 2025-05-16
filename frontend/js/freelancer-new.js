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

    const submitBtn = document.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';

    try {
      const bullets = document.getElementById('whatYouGet').value
        .split('\n').map(s=>s.trim()).filter(Boolean);

      const title = document.getElementById('title').value.trim();
      if (title.length < 5) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad('Title must be at least 5 characters.');
      }
      const desc  = document.getElementById('description').value.trim();
      if (desc.length < 20) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad('Description must be at least 20 characters.');
      }

      const priceVal = +document.getElementById('price').value;
      if (!priceVal || priceVal < 1) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad('Enter a valid price ≥ 1.');
      }

      if (!natureSel.value || !unitSel.value) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad('Select Pricing Nature and Billing Unit.');
      }

      const days = selDelivery.value === 'custom' ? +inpCustom.value : +selDelivery.value;
      if (!days) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad('Specify delivery time.');
      }

      console.log('[FreelancerNew] Attempting to get cover image file');
      const coverFileToUpload = window.getCoverImageFileToUpload && window.getCoverImageFileToUpload();
      console.log('[FreelancerNew] Cover file to upload:', coverFileToUpload);
      
      if (!coverFileToUpload) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad('Please upload a cover image for your gig.');
      }

      let coverImageFileName = null;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Cover...';
      console.log('[FreelancerNew] Uploading cover image:', coverFileToUpload.name);
      try {
        const coverUploadResponse = await uploadSingleFile(coverFileToUpload); // from file.js
        console.log('[FreelancerNew] Cover image upload response:', coverUploadResponse);
        coverImageFileName = coverUploadResponse.fileName;
      } catch (uploadError) {
        console.error('[FreelancerNew] Cover image upload failed:', uploadError);
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad(`Cover image upload failed: ${uploadError.message}`);
      }

      console.log('[FreelancerNew] Attempting to get gallery files');
      const galleryFilesToUpload = window.getGalleryFilesToUpload && window.getGalleryFilesToUpload();
      console.log('[FreelancerNew] Gallery files to upload:', galleryFilesToUpload ? galleryFilesToUpload.length : 0);
      
      let galleryFileUrls = [];
      if (galleryFilesToUpload && galleryFilesToUpload.length > 0) {
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading Gallery (0/${galleryFilesToUpload.length})...`;
        try {
          const uploadedGalleryResponses = [];
          for (let i = 0; i < galleryFilesToUpload.length; i++) {
            const currentFile = galleryFilesToUpload[i];
            console.log(`[FreelancerNew] Uploading gallery file ${i+1}/${galleryFilesToUpload.length}:`, currentFile.name);
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading Gallery (${i+1}/${galleryFilesToUpload.length})...`;
            const resp = await uploadSingleFile(currentFile);
            console.log(`[FreelancerNew] Gallery file upload response:`, resp);
            uploadedGalleryResponses.push(resp);
          }
          galleryFileUrls = uploadedGalleryResponses.map(res => res.fileName);
          console.log('[FreelancerNew] All gallery files uploaded. URLs:', galleryFileUrls);
        } catch (uploadError) {
          console.error('[FreelancerNew] Gallery file upload failed:', uploadError);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          return bad(`Gallery file upload failed: ${uploadError.message}`);
        }
      }

      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
      const payload = {
        title,
        description: desc,
        price: priceVal,
        isPriceFixed: natureSel.value === 'fixed_direct',
        isPerHourPricing: unitSel.value === 'hourly',
        category: mapCategory(document.getElementById('category').value),
        deliveryTimeDays: days,
        whatYouGet: bullets,
        toolsAndTechnology: document.getElementById('toolsAndTechnology').value.trim(),
        languages: document.getElementById('languages').value
                    .split(',').map(s=>s.trim()).filter(Boolean),
        coverImageUrl: coverImageFileName,
        fileUrls: galleryFileUrls
      };
      
      console.log('[FreelancerNew] Submitting gig with payload:', payload);
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
        
        const viewGigBtn = document.getElementById('viewGigBtn');
        if (viewGigBtn) {
            viewGigBtn.textContent = 'View Gigs'; 
            viewGigBtn.removeEventListener('click', viewGigBtn.clickHandler);
            viewGigBtn.clickHandler = function() {
                window.location.href = 'my.html';
            };
            viewGigBtn.addEventListener('click', viewGigBtn.clickHandler);
        }
      }

    } catch (err) {
      console.error(err);
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Publish Gig';
      }
      bad(err.message.slice(0, 300));
    }
  });
});