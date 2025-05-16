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
    
    const submitBtn = ev.target.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Preparing...';

      const bullets = document.getElementById('whatYouGet').value
        .split('\n').map(s=>s.trim()).filter(Boolean);

      const title = document.getElementById('listingTitle').value.trim();
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

      const priceVal = +document.getElementById('budget').value;
      if (!priceVal || priceVal < 1) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        return bad('Enter a valid budget ≥ 1.');
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
        return bad('Specify expected delivery time.');
      }

      let coverImageFileName = null;
      console.log('[CustomerNew] Attempting to get cover image file.');
      const coverFileToUpload = window.getCoverImageFileToUpload && window.getCoverImageFileToUpload();
      console.log('[CustomerNew] Cover file to upload:', coverFileToUpload);

      if (coverFileToUpload) {
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading Cover...';
        console.log('[CustomerNew] Attempting to upload cover image:', coverFileToUpload.name);
        try {
          const uploadResponse = await uploadSingleFile(coverFileToUpload); // from file.js
          console.log('[CustomerNew] Cover image upload response:', uploadResponse);
          coverImageFileName = uploadResponse.fileName;
        } catch (uploadError) {
          console.error('[CustomerNew] Cover image upload failed:', uploadError);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          return bad(`Cover image upload failed: ${uploadError.message}`);
        }
      }

      let galleryFileUrls = [];
      console.log('[CustomerNew] Attempting to get gallery files.');
      const galleryFilesToUpload = window.getGalleryFilesToUpload && window.getGalleryFilesToUpload();
      console.log('[CustomerNew] Gallery files to upload:', galleryFilesToUpload ? galleryFilesToUpload.length : 0, galleryFilesToUpload);

      if (galleryFilesToUpload && galleryFilesToUpload.length > 0) {
        submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading Attachments (0/${galleryFilesToUpload.length})...`;
        try {
          const uploadedGalleryResponses = [];
          for (let i = 0; i < galleryFilesToUpload.length; i++) {
            const currentFile = galleryFilesToUpload[i];
            console.log(`[CustomerNew] Attempting to upload gallery file ${i + 1}/${galleryFilesToUpload.length}:`, currentFile.name);
            submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Uploading Attachments (${i + 1}/${galleryFilesToUpload.length})...`;
            const resp = await uploadSingleFile(currentFile);
            console.log(`[CustomerNew] Gallery file ${currentFile.name} upload response:`, resp);
            uploadedGalleryResponses.push(resp);
          }
          galleryFileUrls = uploadedGalleryResponses.map(res => res.fileName);
          console.log('[CustomerNew] All gallery files processed. URLs:', galleryFileUrls);

        } catch (uploadError) {
          console.error('[CustomerNew] Gallery file upload failed:', uploadError);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          return bad(`Gallery file upload failed: ${uploadError.message}`);
        }
      }
      
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
      console.log('[CustomerNew] Final payload preparation. CoverImageFileName:', coverImageFileName, 'GalleryFileUrls:', galleryFileUrls);

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
        coverImageUrl:      coverImageFileName,
        fileUrls:           galleryFileUrls
      };
      
      console.log('[CustomerNew] Submitting listing with payload:', payload);
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
        console.error('[CustomerNew] Raw backend response for listing creation:', raw);
        throw new Error(raw);
      }
      console.log('[CustomerNew] Listing creation successful. Raw response:', raw);

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
      console.error('[CustomerNew] Error in form submission process:', err);
      const currentSubmitBtn = document.querySelector('#newListingForm button[type="submit"]');
      if (currentSubmitBtn) {
        currentSubmitBtn.disabled = false;
        currentSubmitBtn.innerHTML = originalBtnText || 'Post Listing';
      }
      bad(err.message.slice(0, 300));
    }
  });
});