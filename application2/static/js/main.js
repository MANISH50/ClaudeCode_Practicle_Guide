(function () {
  const csrf = document.querySelector('meta[name="csrf-token"]').content;
  const placeholder = document.body.dataset.placeholder;

  // Navbar turns solid on scroll
  const nav = document.getElementById('mainNav');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Fade images in, fall back to a placeholder if a live photo fails to load
  document.querySelectorAll('img.img-fade').forEach((img) => {
    const show = () => img.classList.add('loaded');
    img.addEventListener('load', show);
    img.addEventListener('error', () => {
      if (img.src !== placeholder) img.src = placeholder;
      show();
    });
    if (img.complete) show();
  });

  // Auto-dismiss flash messages
  document.querySelectorAll('.flash-wrap .alert').forEach((el) => {
    setTimeout(() => bootstrap.Alert.getOrCreateInstance(el).close(), 5000);
  });

  // Keep check-out after check-in on any date pair
  document.querySelectorAll('input[name="check_in"]').forEach((checkIn) => {
    const checkOut = checkIn.form.querySelector('input[name="check_out"]');
    if (!checkOut) return;
    const sync = () => {
      if (!checkIn.value) return;
      const next = new Date(checkIn.value);
      next.setDate(next.getDate() + 1);
      const min = next.toISOString().slice(0, 10);
      checkOut.min = min;
      if (!checkOut.value || checkOut.value < min) checkOut.value = min;
    };
    checkIn.addEventListener('change', sync);
    sync();
  });

  // Wishlist hearts (event delegation so every card works)
  document.addEventListener('click', async (event) => {
    const btn = event.target.closest('.wish-btn');
    if (!btn) return;
    event.preventDefault();
    try {
      const res = await fetch(`/api/wishlist/${btn.dataset.id}`, {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrf },
      });
      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      btn.classList.toggle('active', data.saved);
      const icon = btn.querySelector('i');
      icon.className = 'bi ' + (data.saved ? 'bi-heart-fill' : 'bi-heart') + (btn.querySelector('.wish-label') ? ' me-1' : '');
      const label = btn.querySelector('.wish-label');
      if (label) label.textContent = data.saved ? 'Saved' : 'Save';
      const badge = document.getElementById('wishCount');
      badge.textContent = data.count;
      badge.classList.toggle('d-none', data.count === 0);
    } catch (err) {
      alert('Could not update your saved hotels. Please refresh and try again.');
    }
  });
})();
