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
      const fileUrls = [];

      const payload = {
        title: document.getElementById('listingTitle').value,
        description: document.getElementById('description').value,
        price: parseFloat(document.getElementById('budget').value),
        isPriceFixed: document.getElementById('budgetType').value === 'fixed',
        isPerHourPricing: document.getElementById('budgetType').value === 'hourly',
        category: document.getElementById('category').value,
        coverImageUrl: document.getElementById('coverImageUrl').value,
        fileUrls,
        deliveryTimeDays: parseInt(
          document.getElementById('deliveryTimeDays').value,
          10
        ),
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