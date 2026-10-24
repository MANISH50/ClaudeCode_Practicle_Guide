# StayVista - Hotel Booking Demo

Flask + SQLite + Bootstrap 5 demo. Every visitor session gets its own private, pre-seeded SQLite database (`instance/sessions/<session-id>.db`), so you can book, cancel and save hotels without affecting anyone else. Session databases older than 24 hours are deleted automatically.

## Run

```powershell
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt
.venv\Scripts\python app.py
```

Open http://127.0.0.1:5000

## Pages

| URL | What it does |
| --- | --- |
| `/` | Hero search, destinations, featured stays, testimonials |
| `/hotels` | Filter by text, city, type, price and rating; sort four ways |
| `/hotel/<id>` | Gallery, amenities, room availability, map and live-priced booking form |
| `/booking/<ref>` | Printable confirmation |
| `/bookings` | Your bookings with one-click cancel |
| `/wishlist` | Saved hotels (heart buttons update instantly) |
| `/demo` | Inspect and reset your session database |
| `/about`, `/contact` | Info page and a contact form saved to your session DB |

## Notes

- All POST requests are CSRF-protected.
- Photos load live from picsum.photos and are illustrative, not real hotel photos.
- Set the `SECRET_KEY` environment variable in production; otherwise a key is generated in `instance/secret.key`.
