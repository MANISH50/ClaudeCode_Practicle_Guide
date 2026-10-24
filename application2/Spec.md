# StayVista - Specification

## 1. Purpose

StayVista is a demo hotel-booking website. It shows a complete booking journey (search, filter, compare, save, book, cancel) with a polished UI. Every visitor gets a private, pre-seeded SQLite database, so demo actions never affect other visitors.

## 2. Scope

**In scope**
- Browsing and filtering 12 seeded hotels across India.
- Room selection with date-based pricing, availability and tax.
- Booking, viewing confirmations, cancelling, and saving hotels to a wishlist.
- A contact form and a session-database inspection page.

**Out of scope**
- Real payments, user accounts or login.
- Real hotel photos, real availability feeds, or email sending.
- Multi-user shared data (each session is isolated by design).

## 3. Technology

| Layer | Choice |
| --- | --- |
| Language | Python 3.13 |
| Web framework | Flask 3.x (`requirements.txt`: `Flask>=3.0`) |
| Database | SQLite, one file per browser session |
| Templates | Jinja2 (Flask default) |
| UI | Bootstrap 5.3.3 and Bootstrap Icons 1.11.3 (CDN), Google font Poppins |
| Client scripts | Vanilla JavaScript (no build step) |
| Images | picsum.photos (live, seeded URLs) |

## 4. Project structure

```
application2/
├── app.py              Flask app: routes, session DB, pricing, validation, CSRF
├── seed_data.py        Room types and the 12 hotel records used to seed each session
├── requirements.txt    Python dependencies
├── README.md           Short run guide
├── Spec.md             This document
├── .gitignore          Ignores .venv, __pycache__, instance/
├── templates/
│   ├── base.html            Layout: navbar, flash messages, footer, script includes
│   ├── _macros.html         Reusable hotel card and star macros
│   ├── index.html           Home page
│   ├── hotels.html          Listing with filters and sorting
│   ├── hotel_detail.html    Hotel page with rooms and booking form
│   ├── booking_confirmation.html
│   ├── bookings.html        My bookings with cancel
│   ├── wishlist.html        Saved hotels
│   ├── about.html
│   ├── contact.html
│   ├── demo.html            Session database inspector and reset
│   └── error.html           404 and 400 pages
├── static/
│   ├── css/style.css        Theme, cards, layout, print styles
│   ├── js/main.js           Navbar scroll, image fallback, wishlist toggle, date sync
│   ├── js/booking.js        Live price quote and room selection on hotel page
│   └── img/placeholder.svg  Fallback image when a photo fails to load
└── instance/                Created at runtime (secret key and session databases)
    ├── secret.key
    └── sessions/<session-id>.db
```

## 5. Data model

### 5.1 Session database

Each browser session gets `instance/sessions/<sid>.db`, created on the first request and seeded with the hotel list.

| Table | Columns | Notes |
| --- | --- | --- |
| `hotels` | id, name, city, state, category, tagline, description, price, rating, review_count, stars, amenities, image_tags, featured | Seeded from `seed_data.HOTELS`. `price` is the base nightly rate in INR. `amenities` is comma-separated. |
| `bookings` | id, ref (unique), hotel_id, room_type, check_in, check_out, guests, nights, subtotal, tax, total, guest_name, email, phone, requests, status, created_at | `status` is `confirmed` or `cancelled`. Amounts are whole rupees. |
| `wishlist` | hotel_id (primary key) | One row per saved hotel. |
| `messages` | id, name, email, subject, message, created_at | Contact-form submissions. |

### 5.2 Seed data

- **Room types:** Standard (x1.00, max 2 guests), Deluxe (x1.45, max 3 guests), Premium Suite (x2.20, max 4 guests).
- **Hotels:** 12 across Goa, Jaipur, Udaipur, Manali, Shimla, Alleppey, Munnar, Mumbai (2) and Delhi. Each has a category (Beach, Heritage, Mountain, Backwater, City), a rating, review count, star rating, amenities and a `featured` flag. Six are featured on the home page.

## 6. Business rules

**Pricing**
- Per-night room price = `round(hotel.price x room multiplier)`.
- Subtotal = per-night price x nights.
- Tax = 12% of subtotal, rounded.
- Total = subtotal + tax.
- Example: Royal Mirage Palace (8,900) Deluxe for 3 nights gives subtotal 38,715, tax 4,646, total 43,361.

**Stay validation**
- Check-in must not be in the past.
- Check-out must be after check-in.
- Maximum stay is 30 nights.
- Missing or malformed dates are rejected with a message.

**Availability**
- Each hotel has 3 rooms of each type (`ROOMS_PER_TYPE = 3`).
- A room is unavailable if it has a confirmed booking whose dates overlap the requested stay (check-in < requested check-out and check-out > requested check-in).
- Cancelled bookings free their room.

**Booking form**
- Room type must be one of the three valid types.
- Guest name at least 2 characters.
- Email must match a basic `x@y.z` pattern.
- Phone must be 7 to 15 characters of digits, `+`, `-` or spaces.
- Guests are limited to the chosen room's maximum.
- Special requests are capped at 500 characters.
- A successful booking generates a reference such as `SV3F9A1C` and redirects to the confirmation page.

**Session lifetime**
- Session cookies last 1 day.
- Session database files older than 24 hours are deleted when a new session starts.

## 7. Functional requirements

### 7.1 Routes

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/` | Home: search form, up to 6 destination cards, up to 6 featured hotels, testimonials, CTA. |
| GET | `/hotels` | Listing. Query params: `q`, `city`, `category`, `max_price` (1,000 to 20,000), `min_rating` (0, 4, 4.5, 4.8), `sort` (`popular`, `rating`, `price_asc`, `price_desc`), `guests`, `check_in`, `check_out`. |
| GET | `/hotel/<id>` | Hotel detail with gallery, amenities, room cards (price, total, availability), map and booking form. Invalid dates fall back to defaults with a warning. Unknown id gives 404. |
| POST | `/book` | Creates a booking. Redirects to `/booking/<ref>` on success or back to the hotel page with an error. |
| GET | `/booking/<ref>` | Confirmation page. Unknown ref gives 404. |
| GET | `/bookings` | All bookings in the session, newest first. |
| POST | `/bookings/<ref>/cancel` | Marks a booking as cancelled. |
| GET | `/wishlist` | Saved hotels. |
| POST | `/api/wishlist/<id>` | Toggles a saved hotel. Returns JSON `{saved, count}`. Unknown hotel gives 404. |
| GET | `/api/quote` | JSON quote for `hotel_id`, `room_type`, `check_in`, `check_out`: nights, subtotal, tax, total, rooms left, max guests. Invalid input gives 400. |
| GET | `/about` | Static information page. |
| GET, POST | `/contact` | Shows the form. A valid POST saves a message to the session database. |
| GET | `/demo` | Shows session ID, database file, size, active session count, table counts and the latest messages. |
| POST | `/demo/reset` | Deletes the session database, which is re-seeded on the next request. |

### 7.2 Interaction behaviour

- **Navbar:** turns solid when scrolled. The heart badge shows the wishlist count and updates without reloading.
- **Listing filters:** the destination, type, rating and sort dropdowns submit the form when changed. The price slider updates its label as you drag.
- **Date pairs:** check-out's minimum moves to the day after check-in.
- **Room selection:** the "Select" button on a room sets the room type in the booking form and highlights the card.
- **Live quote:** changing dates or room calls `/api/quote`, showing the total, tax and availability. Sold-out rooms disable the Confirm button. Guest count is capped at the room's maximum.
- **Flash messages:** success, info, warning and error messages appear at the top and auto-dismiss after 5 seconds.
- **Images:** photos fade in when loaded. A failed photo is replaced by the local placeholder.
- **Print:** the confirmation page prints without navigation or footer.

### 7.3 Error handling

- POST requests without a valid CSRF token return 400 with an explanation.
- Unknown routes, hotels or booking references return 404 with a friendly page.

## 8. Security

- **CSRF:** every POST form and AJAX call sends a per-session token, checked on the server with a constant-time comparison.
- **Cookies:** session cookies are HTTP-only and use `SameSite=Lax`.
- **Secret key:** read from the `SECRET_KEY` environment variable. If unset, a random 32-byte key is generated once and stored in `instance/secret.key`.
- **SQL:** all user values are passed as parameters. The only dynamic SQL is the sort column, which is chosen from a fixed whitelist.
- **Output:** Jinja2 auto-escaping is on for all templates.
- **Session isolation:** session IDs must match 32 lowercase hex characters. A malformed or missing ID is replaced with a new one.

## 9. Non-functional requirements

- **Responsive:** Bootstrap grid. Layout adapts from phone to desktop, including the gallery and booking rows.
- **Performance:** images are lazy-loaded. Scripts are at the end of the page.
- **Browser support:** current Chrome, Edge, Firefox and Safari. Needs JavaScript for live quotes and wishlist.
- **Network:** Bootstrap, icons, fonts and photos load from the internet. The site looks plain without them but still works.
- **Data reset:** each session starts with fresh seed data. Data is not shared between browsers.

## 10. Running the application

### 10.1 Prerequisites

- Windows, macOS or Linux.
- Python 3.10 or newer (tested with 3.13).
- Internet access for the CDN assets and photos.

### 10.2 First-time setup

From the `application2` folder:

**Windows (PowerShell or Command Prompt)**

```powershell
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
```

**macOS / Linux**

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
```

If `python` is not found on Windows, use the full path to your interpreter, for example `C:\Users\<you>\AppData\Local\Programs\Python\Python313\python.exe`.

### 10.3 Start the server

**Windows**

```powershell
.venv\Scripts\python app.py
```

**macOS / Linux**

```bash
.venv/bin/python app.py
```

The server listens on port 5000 in debug mode. Open **http://127.0.0.1:5000** in your browser.

To use a fixed secret key, set it before starting:

```powershell
$env:SECRET_KEY = "replace-with-a-long-random-string"
.venv\Scripts\python app.py
```

### 10.4 Stop the server

Press `Ctrl+C` in the terminal.

### 10.5 Reset everything

Delete the `instance/` folder while the server is stopped. A new secret key and empty session store are created on the next start. To reset only your own data while running, use **Demo DB** then **Reset demo data**.

### 10.6 Troubleshooting

| Symptom | Likely cause and fix |
| --- | --- |
| `python` is not recognised | Install Python or use the full interpreter path (see 10.2). |
| `ModuleNotFoundError: flask` | Dependencies were installed into a different interpreter. Re-run the install step using `.venv\Scripts\python`. |
| Pages look unstyled | No internet access, so the Bootstrap CDN did not load. |
| Photos do not appear | The picsum.photos service is unreachable. The placeholder image is shown instead. |
| "Your form expired" error | The session cookie was lost or the page was open too long. Refresh the page and submit again. |
| Port 5000 already in use | Stop the other program, or edit the `app.run(port=...)` line in `app.py`. |

## 11. Known limitations

- Photos are placeholders from a stock photo service, not real hotels.
- Payments, emails and user accounts are not implemented. The booking form shows a demo notice.
- Debug mode is on, so it must not be exposed publicly. Use a production server (for example `waitress` on Windows or `gunicorn` on Linux) before deploying.
- Session databases are local files, so the app is single-machine only.
- Tax is a flat 12% and does not vary by state.
- Room counts are fixed at 3 per type per hotel.
