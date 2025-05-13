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

  const coverInput = document.getElementById('coverImage');
  const coverPrev  = document.querySelector('#coverImagePreview img');
  coverInput?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) return;
    coverPrev.src = URL.createObjectURL(f);
    coverPrev.style.display = 'block';
    coverInput.nextElementSibling
      .querySelector('.no-image-text')?.remove();
  });

  const galleryArea  = document.getElementById('fileUploadArea');
  const galleryInput = document.getElementById('fileInput');
  const galleryList  = document.getElementById('uploadedFiles');

  galleryArea?.addEventListener('click', () => galleryInput.click());
  galleryInput?.addEventListener('change', e => addGallery(e.target.files));

  function addGallery(files) {
    Array.from(files).forEach(f => {
      if (f.size > 5*1024*1024) return bad(`${f.name} exceeds 5 MB`);
      const d = document.createElement('div');
      d.className = 'gallery-thumb';
      d.innerHTML = `
        <img src="${URL.createObjectURL(f)}" alt="">
        <button class="remove-thumb" aria-label="Remove">&times;</button>`;
      d.querySelector('.remove-thumb').onclick = () => d.remove();
      galleryList.appendChild(d);
    });
  }

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
      .split('\n').map(s=>s.trim()).filter(Boolean).slice(0,5);
    if (!bullets.length) return bad('Add at least one “What you get” bullet (max 5).');

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
      coverImageUrl: null,
      fileUrls:      []
    };

    try {
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

      ok('Gig published!');
      document.getElementById('successModal').style.display = 'block';

    } catch (err) {
      console.error(err);
      bad(err.message.slice(0, 300));
    }
  });
});