"""StayVista - hotel booking demo (Flask + per-session SQLite databases)."""
import os
import re
import secrets
import sqlite3
import time
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

from flask import (Flask, abort, flash, g, jsonify, redirect, render_template,
                   request, session, url_for)

from seed_data import HOTELS, ROOM_TYPES

BASE_DIR = Path(__file__).resolve().parent
INSTANCE_DIR = BASE_DIR / "instance"
SESSION_DB_DIR = INSTANCE_DIR / "sessions"
SESSION_DB_DIR.mkdir(parents=True, exist_ok=True)

SESSION_TTL_SECONDS = 24 * 3600
TAX_RATE = 0.12
ROOMS_PER_TYPE = 3
MAX_NIGHTS = 30
SID_PATTERN = re.compile(r"^[0-9a-f]{32}$")

app = Flask(__name__)


def _load_secret_key():
    env_key = os.environ.get("SECRET_KEY")
    if env_key:
        return env_key
    key_file = INSTANCE_DIR / "secret.key"
    if not key_file.exists():
        key_file.write_text(secrets.token_hex(32))
    return key_file.read_text().strip()


app.secret_key = _load_secret_key()
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE="Lax",
                  PERMANENT_SESSION_LIFETIME=timedelta(days=1))


# --------------------------------------------------------------------------
# Per-session database
# --------------------------------------------------------------------------
SCHEMA = """
CREATE TABLE hotels (
    id INTEGER PRIMARY KEY, name TEXT, city TEXT, state TEXT, category TEXT,
    tagline TEXT, description TEXT, price INTEGER, rating REAL,
    review_count INTEGER, stars INTEGER, amenities TEXT, image_tags TEXT,
    featured INTEGER DEFAULT 0
);
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT UNIQUE, hotel_id INTEGER,
    room_type TEXT, check_in TEXT, check_out TEXT, guests INTEGER,
    nights INTEGER, subtotal INTEGER, tax INTEGER, total INTEGER,
    guest_name TEXT, email TEXT, phone TEXT, requests TEXT,
    status TEXT DEFAULT 'confirmed', created_at TEXT
);
CREATE TABLE wishlist (hotel_id INTEGER PRIMARY KEY);
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT,
    subject TEXT, message TEXT, created_at TEXT
);
"""


def purge_old_session_dbs():
    cutoff = time.time() - SESSION_TTL_SECONDS
    for db_file in SESSION_DB_DIR.glob("*.db"):
        try:
            if db_file.stat().st_mtime < cutoff:
                db_file.unlink()
        except OSError:
            pass


def create_session_db(path):
    conn = sqlite3.connect(path)
    conn.executescript(SCHEMA)
    conn.executemany(
        "INSERT INTO hotels (id, name, city, state, category, tagline, description,"
        " price, rating, review_count, stars, amenities, image_tags, featured)"
        " VALUES (:id, :name, :city, :state, :category, :tagline, :description,"
        " :price, :rating, :review_count, :stars, :amenities, :image_tags, :featured)",
        HOTELS)
    conn.commit()
    conn.close()


def session_db_path():
    sid = session.get("sid")
    if not sid or not SID_PATTERN.match(sid):
        sid = uuid.uuid4().hex
        session["sid"] = sid
        session.permanent = True
        purge_old_session_dbs()
    return sid, SESSION_DB_DIR / f"{sid}.db"


def get_db():
    if "db" not in g:
        sid, path = session_db_path()
        if not path.exists():
            create_session_db(path)
        conn = sqlite3.connect(path)
        conn.row_factory = sqlite3.Row
        g.db = conn
        g.sid = sid
        g.db_path = path
    return g.db


@app.teardown_appcontext
def close_db(_exc):
    conn = g.pop("db", None)
    if conn is not None:
        conn.close()


# --------------------------------------------------------------------------
# CSRF + template helpers
# --------------------------------------------------------------------------
def csrf_token():
    if "csrf" not in session:
        session["csrf"] = secrets.token_hex(16)
    return session["csrf"]


@app.before_request
def protect_post():
    if request.method == "POST":
        sent = request.form.get("csrf_token") or request.headers.get("X-CSRF-Token")
        if not sent or not secrets.compare_digest(sent, session.get("csrf", "")):
            abort(400, "Your form expired. Please go back, refresh and try again.")


def hotel_image(hotel, index=0, width=800, height=600):
    return f"https://picsum.photos/seed/stayvista-{hotel['id']}-{index}/{width}/{height}"


def seeded_image(seed, width=800, height=600):
    return f"https://picsum.photos/seed/{seed}/{width}/{height}"


def money(value):
    return f"₹{int(value):,}"


def pretty_date(value):
    return datetime.strptime(value, "%Y-%m-%d").strftime("%d %b %Y")


app.jinja_env.globals.update(csrf_token=csrf_token, hotel_image=hotel_image, seeded_image=seeded_image,
                             money=money, pretty_date=pretty_date)


@app.context_processor
def inject_globals():
    wishlist_count = 0
    if request.endpoint and request.endpoint != "static":
        wishlist_count = get_db().execute("SELECT COUNT(*) FROM wishlist").fetchone()[0]
    return dict(room_types=ROOM_TYPES, wishlist_count=wishlist_count, year=date.today().year)


# --------------------------------------------------------------------------
# Business helpers
# --------------------------------------------------------------------------
def parse_stay(check_in, check_out):
    try:
        ci = datetime.strptime(check_in, "%Y-%m-%d").date()
        co = datetime.strptime(check_out, "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return None, None, "Please choose valid check-in and check-out dates."
    if ci < date.today():
        return None, None, "Check-in date cannot be in the past."
    if co <= ci:
        return None, None, "Check-out must be after check-in."
    if (co - ci).days > MAX_NIGHTS:
        return None, None, f"Stays are limited to {MAX_NIGHTS} nights."
    return ci, co, None


def default_stay():
    ci = date.today() + timedelta(days=7)
    return ci.isoformat(), (ci + timedelta(days=2)).isoformat()


def compute_quote(price, room_key, nights):
    multiplier = ROOM_TYPES[room_key]["multiplier"]
    subtotal = round(price * multiplier) * nights
    tax = round(subtotal * TAX_RATE)
    return subtotal, tax, subtotal + tax


def rooms_left(db, hotel_id, room_key, ci, co):
    taken = db.execute(
        "SELECT COUNT(*) FROM bookings WHERE hotel_id=? AND room_type=?"
        " AND status='confirmed' AND check_in < ? AND check_out > ?",
        (hotel_id, room_key, co.isoformat(), ci.isoformat())).fetchone()[0]
    return max(ROOMS_PER_TYPE - taken, 0)


def wishlist_ids(db):
    return {row[0] for row in db.execute("SELECT hotel_id FROM wishlist")}


def to_int(value, default, low, high):
    try:
        return max(low, min(high, int(value)))
    except (TypeError, ValueError):
        return default


# --------------------------------------------------------------------------
# Pages
# --------------------------------------------------------------------------
@app.route("/")
def index():
    db = get_db()
    featured = db.execute(
        "SELECT * FROM hotels WHERE featured=1 ORDER BY rating DESC LIMIT 6").fetchall()
    destinations = db.execute(
        "SELECT city, state, COUNT(*) AS total, MIN(price) AS from_price, MIN(id) AS pic_id,"
        " MIN(image_tags) AS tags FROM hotels GROUP BY city ORDER BY total DESC, city LIMIT 6"
    ).fetchall()
    cities = [r[0] for r in db.execute("SELECT DISTINCT city FROM hotels ORDER BY city")]
    check_in, check_out = default_stay()
    return render_template("index.html", featured=featured, destinations=destinations,
                           cities=cities, wished=wishlist_ids(db),
                           check_in=check_in, check_out=check_out, today=date.today().isoformat())


@app.route("/hotels")
def hotels():
    db = get_db()
    q = request.args.get("q", "").strip()
    city = request.args.get("city", "").strip()
    category = request.args.get("category", "").strip()
    max_price = to_int(request.args.get("max_price"), 20000, 1000, 20000)
    min_rating = request.args.get("min_rating", "0")
    sort = request.args.get("sort", "popular")
    guests = to_int(request.args.get("guests"), 2, 1, 8)
    default_ci, default_co = default_stay()
    check_in = request.args.get("check_in") or default_ci
    check_out = request.args.get("check_out") or default_co

    sql, params = "SELECT * FROM hotels WHERE price <= ?", [max_price]
    if q:
        sql += " AND (name LIKE ? OR city LIKE ? OR state LIKE ? OR category LIKE ?)"
        params += [f"%{q}%"] * 4
    if city:
        sql += " AND city = ?"
        params.append(city)
    if category:
        sql += " AND category = ?"
        params.append(category)
    try:
        sql += " AND rating >= ?"
        params.append(float(min_rating))
    except ValueError:
        min_rating = "0"
    order = {"price_asc": "price ASC", "price_desc": "price DESC",
             "rating": "rating DESC", "popular": "review_count DESC"}.get(sort, "review_count DESC")
    results = db.execute(f"{sql} ORDER BY {order}", params).fetchall()

    cities = [r[0] for r in db.execute("SELECT DISTINCT city FROM hotels ORDER BY city")]
    categories = [r[0] for r in db.execute("SELECT DISTINCT category FROM hotels ORDER BY category")]
    return render_template(
        "hotels.html", hotels=results, cities=cities, categories=categories,
        wished=wishlist_ids(db), q=q, city=city, category=category,
        max_price=max_price, min_rating=min_rating, sort=sort, guests=guests,
        check_in=check_in, check_out=check_out, today=date.today().isoformat())


@app.route("/hotel/<int:hotel_id>")
def hotel_detail(hotel_id):
    db = get_db()
    hotel = db.execute("SELECT * FROM hotels WHERE id=?", (hotel_id,)).fetchone()
    if hotel is None:
        abort(404)
    default_ci, default_co = default_stay()
    check_in = request.args.get("check_in") or default_ci
    check_out = request.args.get("check_out") or default_co
    guests = to_int(request.args.get("guests"), 2, 1, 8)
    ci, co, error = parse_stay(check_in, check_out)
    if error:
        flash(error, "warning")
        check_in, check_out = default_ci, default_co
        ci, co, _ = parse_stay(check_in, check_out)
    nights = (co - ci).days
    rooms = []
    for key, info in ROOM_TYPES.items():
        subtotal, tax, total = compute_quote(hotel["price"], key, nights)
        rooms.append({"key": key, "info": info, "per_night": round(hotel["price"] * info["multiplier"]),
                      "total": total, "left": rooms_left(db, hotel_id, key, ci, co)})
    similar = db.execute(
        "SELECT * FROM hotels WHERE id != ? AND (city=? OR category=?) ORDER BY rating DESC LIMIT 3",
        (hotel_id, hotel["city"], hotel["category"])).fetchall()
    return render_template(
        "hotel_detail.html", hotel=hotel, rooms=rooms, similar=similar, nights=nights,
        amenities=hotel["amenities"].split(","), check_in=check_in, check_out=check_out,
        guests=guests, today=date.today().isoformat(),
        wished=hotel_id in wishlist_ids(db), tax_rate=int(TAX_RATE * 100))


@app.route("/book", methods=["POST"])
def book():
    db = get_db()
    form = request.form
    hotel_id = to_int(form.get("hotel_id"), 0, 0, 10**6)
    hotel = db.execute("SELECT * FROM hotels WHERE id=?", (hotel_id,)).fetchone()
    if hotel is None:
        abort(404)
    back = url_for("hotel_detail", hotel_id=hotel_id, check_in=form.get("check_in"),
                   check_out=form.get("check_out"), guests=form.get("guests"))

    room_key = form.get("room_type", "")
    if room_key not in ROOM_TYPES:
        flash("Please choose a room type.", "danger")
        return redirect(back)
    ci, co, error = parse_stay(form.get("check_in"), form.get("check_out"))
    if error:
        flash(error, "danger")
        return redirect(back)

    name = form.get("guest_name", "").strip()
    email = form.get("email", "").strip()
    phone = form.get("phone", "").strip()
    requests_text = form.get("requests", "").strip()[:500]
    guests = to_int(form.get("guests"), 1, 1, ROOM_TYPES[room_key]["max_guests"])
    if len(name) < 2 or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) \
            or not re.match(r"^[0-9+\-\s]{7,15}$", phone):
        flash("Please enter a valid name, email and phone number.", "danger")
        return redirect(back)
    if rooms_left(db, hotel_id, room_key, ci, co) == 0:
        flash("Sorry, that room type is sold out for your dates. Try other dates or a different room.", "warning")
        return redirect(back)

    nights = (co - ci).days
    subtotal, tax, total = compute_quote(hotel["price"], room_key, nights)
    ref = "SV" + secrets.token_hex(3).upper()
    db.execute(
        "INSERT INTO bookings (ref, hotel_id, room_type, check_in, check_out, guests, nights,"
        " subtotal, tax, total, guest_name, email, phone, requests, created_at)"
        " VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        (ref, hotel_id, room_key, ci.isoformat(), co.isoformat(), guests, nights, subtotal,
         tax, total, name, email, phone, requests_text, datetime.now().strftime("%Y-%m-%d %H:%M")))
    db.commit()
    flash("Your booking is confirmed!", "success")
    return redirect(url_for("booking_confirmation", ref=ref))


def booking_or_404(db, ref):
    row = db.execute(
        "SELECT b.*, h.name AS hotel_name, h.city, h.state, h.image_tags, h.id AS hid"
        " FROM bookings b JOIN hotels h ON h.id=b.hotel_id WHERE b.ref=?", (ref,)).fetchone()
    if row is None:
        abort(404)
    return row


@app.route("/booking/<ref>")
def booking_confirmation(ref):
    booking = booking_or_404(get_db(), ref)
    return render_template("booking_confirmation.html", booking=booking)


@app.route("/bookings")
def my_bookings():
    rows = get_db().execute(
        "SELECT b.*, h.name AS hotel_name, h.city, h.image_tags, h.id AS hid"
        " FROM bookings b JOIN hotels h ON h.id=b.hotel_id ORDER BY b.id DESC").fetchall()
    return render_template("bookings.html", bookings=rows)


@app.route("/bookings/<ref>/cancel", methods=["POST"])
def cancel_booking(ref):
    db = get_db()
    booking_or_404(db, ref)
    db.execute("UPDATE bookings SET status='cancelled' WHERE ref=?", (ref,))
    db.commit()
    flash(f"Booking {ref} has been cancelled.", "info")
    return redirect(url_for("my_bookings"))


@app.route("/wishlist")
def wishlist():
    db = get_db()
    rows = db.execute(
        "SELECT h.* FROM hotels h JOIN wishlist w ON w.hotel_id=h.id ORDER BY h.rating DESC").fetchall()
    return render_template("wishlist.html", hotels=rows, wished={r["id"] for r in rows},
                           check_in=default_stay()[0], check_out=default_stay()[1])


@app.route("/api/wishlist/<int:hotel_id>", methods=["POST"])
def toggle_wishlist(hotel_id):
    db = get_db()
    if db.execute("SELECT 1 FROM hotels WHERE id=?", (hotel_id,)).fetchone() is None:
        return jsonify(error="Hotel not found"), 404
    exists = db.execute("SELECT 1 FROM wishlist WHERE hotel_id=?", (hotel_id,)).fetchone()
    if exists:
        db.execute("DELETE FROM wishlist WHERE hotel_id=?", (hotel_id,))
    else:
        db.execute("INSERT INTO wishlist (hotel_id) VALUES (?)", (hotel_id,))
    db.commit()
    count = db.execute("SELECT COUNT(*) FROM wishlist").fetchone()[0]
    return jsonify(saved=not exists, count=count)


@app.route("/api/quote")
def api_quote():
    db = get_db()
    hotel = db.execute("SELECT price FROM hotels WHERE id=?", (request.args.get("hotel_id", type=int),)).fetchone()
    room_key = request.args.get("room_type", "")
    if hotel is None or room_key not in ROOM_TYPES:
        return jsonify(error="Invalid request"), 400
    ci, co, error = parse_stay(request.args.get("check_in"), request.args.get("check_out"))
    if error:
        return jsonify(error=error), 400
    nights = (co - ci).days
    subtotal, tax, total = compute_quote(hotel["price"], room_key, nights)
    left = rooms_left(db, request.args.get("hotel_id", type=int), room_key, ci, co)
    return jsonify(nights=nights, subtotal=money(subtotal), tax=money(tax), total=money(total),
                   left=left, max_guests=ROOM_TYPES[room_key]["max_guests"])


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/contact", methods=["GET", "POST"])
def contact():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        email = request.form.get("email", "").strip()
        subject = request.form.get("subject", "").strip()[:120]
        message = request.form.get("message", "").strip()[:1000]
        if len(name) < 2 or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email) or len(message) < 5:
            flash("Please fill in your name, a valid email and a message.", "danger")
            return render_template("contact.html", form=request.form)
        db = get_db()
        db.execute("INSERT INTO messages (name, email, subject, message, created_at) VALUES (?,?,?,?,?)",
                   (name, email, subject, message, datetime.now().strftime("%Y-%m-%d %H:%M")))
        db.commit()
        flash("Thanks! Your message has been saved to your demo session.", "success")
        return redirect(url_for("contact"))
    return render_template("contact.html", form={})


@app.route("/demo")
def demo():
    db = get_db()
    counts = {t: db.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
              for t in ("hotels", "bookings", "wishlist", "messages")}
    messages = db.execute("SELECT * FROM messages ORDER BY id DESC LIMIT 5").fetchall()
    size_kb = round(g.db_path.stat().st_size / 1024, 1)
    return render_template("demo.html", sid=g.sid, db_file=g.db_path.name, counts=counts,
                           size_kb=size_kb, messages=messages,
                           active_sessions=len(list(SESSION_DB_DIR.glob("*.db"))))


@app.route("/demo/reset", methods=["POST"])
def reset_demo():
    get_db()
    path = g.db_path
    g.pop("db").close()
    path.unlink(missing_ok=True)
    flash("Demo data reset. A fresh database has been created for your session.", "info")
    return redirect(url_for("demo"))


@app.errorhandler(400)
def bad_request(err):
    return render_template("error.html", code=400, title="Something went wrong",
                           message=getattr(err, "description", "Bad request")), 400


@app.errorhandler(404)
def not_found(_err):
    return render_template("error.html", code=404, title="Page not found",
                           message="The page or booking you are looking for does not exist in this session."), 404


if __name__ == "__main__":
    app.run(debug=True, port=5000)
