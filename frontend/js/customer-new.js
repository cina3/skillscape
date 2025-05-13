document.addEventListener('DOMContentLoaded', () => {
  
  const maxBullets = 5;
  const bulletContainer = document.getElementById('whatYouGetContainer');
  document.getElementById('addBulletBtn').onclick = () => {
    const current = bulletContainer.querySelectorAll('.bullet-input').length;
    if (current < maxBullets) {
      const input = document.createElement('input');
      input.type = 'text';
      input.name = 'whatYouGet';
      input.placeholder = `Bullet ${current + 1}`;
      input.classList.add('bullet-input', 'form-group');
      bulletContainer.appendChild(input);
    }
  };

  document
    .getElementById('newListingForm')
    .addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const budgetInput = document.getElementById('budget').value.trim();
      let price = null;
      if (budgetInput !== '') {
        price = parseFloat(budgetInput);
        if (isNaN(price)) {
          alert('Invalid budget value. Please enter a valid number.');
          return;
        }
      }

      const deliveryTimeInput = document.getElementById('deliveryTimeDays').value.trim();
      let deliveryTimeDays = null;
      if (deliveryTimeInput !== '') {
        deliveryTimeDays = parseInt(deliveryTimeInput, 10);
        if (isNaN(deliveryTimeDays)) {
          alert('Invalid delivery time. Please enter a valid number of days.');
          return;
        }
      }

      const fileUrls = [];

      const payload = {
        title: document.getElementById('listingTitle').value,
        description: document.getElementById('description').value,
        price: price,
        isPriceFixed: document.getElementById('budgetType').value === 'fixed',
        isPerHourPricing: document.getElementById('budgetType').value === 'hourly',
        category: document.getElementById('category').value,
        coverImageUrl: document.getElementById('coverImageUrl').value,
        fileUrls,
        deliveryTimeDays: deliveryTimeDays,
        whatYouGet: Array.from(
          bulletContainer.querySelectorAll('input[name="whatYouGet"]')
        )
          .map((i) => i.value.trim())
          .filter((v) => v),
        toolsAndTechnology: document.getElementById('toolsAndTechnology')
          .value,
        languages: document
          .getElementById('languages')
          .value.split(',')
          .map((s) => s.trim())
          .filter((s) => s),
      };

      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch('http://localhost:8080/api/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error(await res.text());
        document.getElementById('successModal').classList.add('open');
      } catch (err) {
        alert('Error posting listing: ' + err.message);
      }
    });
});