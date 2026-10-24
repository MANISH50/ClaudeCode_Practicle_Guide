(function () {
  const form = document.getElementById('bookingForm');
  const checkIn = document.getElementById('b-in');
  const checkOut = document.getElementById('b-out');
  const room = document.getElementById('b-room');
  const guests = document.getElementById('b-guests');
  const bookBtn = document.getElementById('bookBtn');
  const msg = document.getElementById('q-msg');
  const set = (id, text) => { document.getElementById(id).textContent = text; };

  async function refreshQuote() {
    const params = new URLSearchParams({
      hotel_id: window.BOOKING.hotelId,
      room_type: room.value,
      check_in: checkIn.value,
      check_out: checkOut.value,
    });
    try {
      const res = await fetch(`${window.BOOKING.quoteUrl}?${params}`);
      const data = await res.json();
      if (!res.ok) {
        set('q-sub', '-'); set('q-tax', '-'); set('q-total', '-');
        msg.className = 'small mt-1 text-danger';
        msg.textContent = data.error || 'Please check your dates.';
        bookBtn.disabled = true;
        return;
      }
      set('q-label', `${room.options[room.selectedIndex].text} x ${data.nights} night${data.nights > 1 ? 's' : ''}`);
      set('q-sub', data.subtotal);
      set('q-tax', data.tax);
      set('q-total', data.total);
      guests.max = data.max_guests;
      if (Number(guests.value) > data.max_guests) guests.value = data.max_guests;
      if (data.left === 0) {
        msg.className = 'small mt-1 text-danger';
        msg.textContent = 'Sold out for these dates. Try another room or dates.';
      } else {
        msg.className = 'small mt-1 ' + (data.left === 1 ? 'text-warning' : 'text-success');
        msg.textContent = data.left === 1 ? 'Hurry, only 1 room left!' : `${data.left} rooms available.`;
      }
      bookBtn.disabled = data.left === 0;
    } catch (e) {
      msg.className = 'small mt-1 text-danger';
      msg.textContent = 'Could not load the price. Check your connection.';
    }
  }

  [checkIn, checkOut, room].forEach((el) => el.addEventListener('change', refreshQuote));

  // "Select" buttons in the room list drive the booking form
  document.querySelectorAll('.pick-room').forEach((btn) => {
    btn.addEventListener('click', () => {
      room.value = btn.dataset.room;
      document.querySelectorAll('.room-card').forEach((c) => c.classList.remove('selected'));
      btn.closest('.room-card').classList.add('selected');
      refreshQuote();
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });

  form.addEventListener('submit', (event) => {
    if (!form.checkValidity()) {
      event.preventDefault();
      form.reportValidity();
      return;
    }
    bookBtn.disabled = true;
    bookBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Confirming...';
  });

  refreshQuote();
})();
