"""Demo hotels and room types copied into every visitor's session database."""

ROOM_TYPES = {
    "standard": {"label": "Standard Room", "multiplier": 1.0, "max_guests": 2, "icon": "bi-door-closed",
                 "blurb": "Cosy room with a king bed, work desk and city or garden view."},
    "deluxe": {"label": "Deluxe Room", "multiplier": 1.45, "max_guests": 3, "icon": "bi-stars",
               "blurb": "Spacious room with a balcony, lounge corner and premium bath amenities."},
    "suite": {"label": "Premium Suite", "multiplier": 2.2, "max_guests": 4, "icon": "bi-gem",
              "blurb": "Separate living area, panoramic views, butler service and complimentary breakfast."},
}


def _hotel(id, name, city, state, category, tagline, description, price, rating, review_count,
           stars, amenities, image_tags, featured=0):
    return dict(id=id, name=name, city=city, state=state, category=category, tagline=tagline,
                description=description, price=price, rating=rating, review_count=review_count,
                stars=stars, amenities=amenities, image_tags=image_tags, featured=featured)


HOTELS = [
    _hotel(1, "Azure Sands Beach Resort", "Goa", "Goa", "Beach",
           "Wake up to the sound of the Arabian Sea",
           "A palm-fringed beachfront resort with infinity pools, sunset shacks and a full-service spa. "
           "Steps from the sand, ten minutes from Goa's best nightlife.",
           6800, 4.7, 1824, 5, "Free WiFi,Pool,Beach Access,Spa,Restaurant,Bar,Airport Shuttle,Gym", "resort,beach", 1),
    _hotel(2, "Palm Grove Retreat", "Goa", "Goa", "Beach",
           "Laid-back luxury among the coconut palms",
           "Boutique villas set in tropical gardens with private plunge pools, yoga mornings and "
           "farm-to-table dining.",
           5200, 4.5, 960, 4, "Free WiFi,Pool,Yoga,Restaurant,Bicycle Rental,Pet Friendly", "villa,pool", 0),
    _hotel(3, "The Royal Mirage Palace", "Jaipur", "Rajasthan", "Heritage",
           "Sleep like a Maharaja in the Pink City",
           "A restored 18th-century haveli with courtyard dining, folk music evenings and elephant-free "
           "heritage walks through the old city.",
           8900, 4.8, 2310, 5, "Free WiFi,Pool,Spa,Restaurant,Heritage Tours,Bar,Concierge,Parking", "palace,india", 1),
    _hotel(4, "Amber Courtyard Haveli", "Jaipur", "Rajasthan", "Heritage",
           "A family-run haveli with a warm Rajasthani welcome",
           "Hand-painted frescoes, rooftop sunsets over Nahargarh Fort and legendary home-style thalis.",
           3400, 4.4, 740, 3, "Free WiFi,Restaurant,Rooftop,Heritage Tours,Parking", "haveli,india", 0),
    _hotel(5, "Lake Pichola Grand", "Udaipur", "Rajasthan", "Heritage",
           "Waking up on the City of Lakes",
           "Every room faces the shimmering lake and City Palace. Sunset boat rides and candle-lit "
           "terrace dinners are included in our suites.",
           9800, 4.9, 3015, 5, "Free WiFi,Pool,Spa,Restaurant,Lake View,Bar,Concierge,Boat Rides", "lake,palace", 1),
    _hotel(6, "Himalayan Cedar Lodge", "Manali", "Himachal Pradesh", "Mountain",
           "Pine forests, snow peaks and a crackling fireplace",
           "A timber lodge above the Beas valley with heated floors, bonfire evenings and guided "
           "treks to Solang and Rohtang.",
           4600, 4.6, 1190, 4, "Free WiFi,Fireplace,Restaurant,Trekking,Bonfire,Parking,Heater", "mountain,lodge", 1),
    _hotel(7, "Snowline Valley Resort", "Shimla", "Himachal Pradesh", "Mountain",
           "Colonial charm with Himalayan views",
           "Wake up above the clouds in a heritage-style resort with valley-facing balconies "
           "and a toy-train pickup service.",
           4100, 4.3, 880, 4, "Free WiFi,Restaurant,Fireplace,Bar,Parking,Heater,Kids Play Area", "hills,resort", 0),
    _hotel(8, "Backwater Bliss Houseboat", "Alleppey", "Kerala", "Backwater",
           "Drift through Kerala's palm-lined canals",
           "A private teak houseboat with an onboard chef, sundeck and air-conditioned bedrooms. "
           "Fresh-caught karimeen served at sunset.",
           7200, 4.8, 1560, 4, "AC,All Meals,Sundeck,Private Chef,Fishing,Free WiFi", "kerala,backwaters", 1),
    _hotel(9, "Emerald Tea Estate Resort", "Munnar", "Kerala", "Mountain",
           "Sleep among rolling tea gardens",
           "Cottages tucked into misty hills with plantation walks, Ayurvedic massages and "
           "a tea-tasting lounge.",
           5600, 4.6, 1020, 4, "Free WiFi,Spa,Restaurant,Plantation Tours,Bonfire,Parking", "tea,plantation", 0),
    _hotel(10, "Skyline Metropolitan Hotel", "Mumbai", "Maharashtra", "City",
           "Business-class comfort above Marine Drive",
           "A sleek high-rise with sea-view rooms, a rooftop bar and a 24-hour business centre, "
           "minutes from the financial district.",
           8200, 4.5, 2740, 5, "Free WiFi,Gym,Rooftop Bar,Restaurant,Business Center,Spa,Airport Shuttle,Concierge",
           "skyscraper,hotel", 1),
    _hotel(11, "Gateway Harbour Inn", "Mumbai", "Maharashtra", "City",
           "Smart rooms in the heart of South Mumbai",
           "Modern, compact rooms steps from the Gateway of India, perfect for short city breaks.",
           3900, 4.2, 1580, 3, "Free WiFi,Restaurant,Gym,24h Front Desk,Laundry", "mumbai,hotel", 0),
    _hotel(12, "Capital Crown Hotel", "Delhi", "Delhi", "City",
           "Modern luxury close to Connaught Place",
           "A polished five-star hotel with award-winning Mughlai dining, a landscaped pool and "
           "chauffeur service across the capital.",
           7600, 4.6, 2205, 5, "Free WiFi,Pool,Gym,Spa,Restaurant,Bar,Business Center,Airport Shuttle", "delhi,hotel", 0),
]
