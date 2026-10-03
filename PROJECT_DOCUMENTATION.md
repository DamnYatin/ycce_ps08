# KrishiMitra Market Estimator ("Mandi Compare") — Comprehensive Technical Documentation
### Agricultural Marketplace Price Discovery & Transport Cost Optimizer
**Theme:** Agriculture, Foodtech & Rural Development  
**Product:** KrishiMitra Market Estimator  

---

## 1. Executive Summary & Objective

### Objective
> **"Strengthening market linkages and price discovery for farmers"**

Smallholder and marginal farmers across India often sell agricultural produce at local village markets or the closest APMC Mandi, missing out on significantly higher prices offered in neighboring markets. However, traveling to a distant market incurs freight charges, loading/unloading labor costs, and statutory market cess. A higher nominal listing price does **not** guarantee higher take-home profit.

### The KrishiMitra Solution
**KrishiMitra Market Estimator** is a decision-support and price discovery platform that computes the **net realized price per quintal** by automatically deducting distance-based transport costs and mandi handling charges from live/mock Agmarknet prices. It ranks all candidate markets descending by net profit and highlights the #1 market that maximizes the farmer's take-home earnings.

---

## 2. Core Mathematical Model & Formulas

Every calculation is implemented as a pure, deterministic function in dedicated backend services.

### Formula 1: Transport Cost
$$\text{Transport Cost (₹)} = \text{Distance (km)} \times \text{Rate (₹/km/quintal)} \times \text{Quantity (quintals)}$$
$$\text{Transport Cost per quintal (₹/qtl)} = \text{Distance (km)} \times \text{Rate (₹/km/quintal)}$$
- **Implemented in:** [`backend/services/transport_cost_calculator.py`](file:///c:/Users/HP-PC/Documents/KrishiMitra/backend/services/transport_cost_calculator.py)
- **Baseline Freight Rate:** ₹0.80 / km / quintal (configurable via Admin Panel)

### Formula 2: Other Mandi Handling Costs
$$\text{Other Costs per quintal (₹/qtl)} = \text{Loading Charge} + \text{Unloading Charge} + \text{Market Cess / Handling Fee}$$
$$\text{Total Other Costs (₹)} = \text{Other Costs per quintal} \times \text{Quantity (quintals)}$$
- **Implemented in:** [`backend/services/cost_estimation_service.py`](file:///c:/Users/HP-PC/Documents/KrishiMitra/backend/services/cost_estimation_service.py)

### Formula 3: Total Expenses Deductions
$$\text{Total Cost per quintal (₹/qtl)} = \text{Transport Cost per quintal} + \text{Other Costs per quintal}$$
$$\text{Total Expenses (₹)} = \text{Total Cost per quintal} \times \text{Quantity (quintals)}$$

### Formula 4: Net Realized Price & Total Earnings
$$\text{Net Price per quintal (₹/qtl)} = \text{Mandi Listing Price (₹/qtl)} - \text{Total Cost per quintal (₹/qtl)}$$
$$\text{Total Net Farmer Return (₹)} = \text{Net Price per quintal} \times \text{Quantity (quintals)}$$
- **Implemented in:** [`backend/services/net_price_calculator.py`](file:///c:/Users/HP-PC/Documents/KrishiMitra/backend/services/net_price_calculator.py)

### Formula 5: Net Profit Gain Over Home Mandi
$$\text{Profit Gain per quintal} = \text{Recommended Mandi Net Price} - \text{Home Mandi Net Price}$$
$$\text{Total Profit Gain (₹)} = \text{Profit Gain per quintal} \times \text{Quantity (quintals)}$$

---

### Step-by-Step Worked Example (Benchmark Calculation)

**Farmer Input:**
- **Crop:** Cotton (कपास / कापूस)
- **Home Mandi:** Nagpur (नागपूर)
- **Quantity:** 10 Quintals
- **Transport Freight Rate:** ₹0.80 / km / quintal

#### Step 1: Candidate Market Evaluation

1. **Amravati (Distance: 145 km, Listing Price: ₹7,250/qtl, Other Costs: ₹0/qtl)**
   $$\text{Transport Cost per qtl} = 145 \times 0.80 = ₹116.00$$
   $$\text{Total Cost per qtl} = 116.00 + 0.00 = ₹116.00$$
   $$\text{Net Price per qtl} = 7250.00 - 116.00 = \mathbf{₹7,134.00 / \text{qtl}}$$
   $$\text{Total Net Return (10 qtl)} = 7134.00 \times 10 = \mathbf{₹71,340.00}$$

2. **Nagpur (Home Mandi, Distance: 0 km, Listing Price: ₹7,216/qtl, Other Costs: ₹116/qtl)**
   $$\text{Transport Cost per qtl} = 0 \times 0.80 = ₹0.00$$
   $$\text{Total Cost per qtl} = 0.00 + 116.00 = ₹116.00$$
   $$\text{Net Price per qtl} = 7216.00 - 116.00 = \mathbf{₹7,100.00 / \text{qtl}}$$
   $$\text{Total Net Return (10 qtl)} = 7100.00 \times 10 = \mathbf{₹71,000.00}$$

3. **Pune (Distance: 600 km, Listing Price: ₹7,348/qtl, Other Costs: ₹0/qtl)**
   $$\text{Transport Cost per qtl} = 600 \times 0.80 = ₹480.00$$
   $$\text{Total Cost per qtl} = 480.00 + 0.00 = ₹480.00$$
   $$\text{Net Price per qtl} = 7348.00 - 480.00 = \mathbf{₹6,868.00 / \text{qtl}}$$

4. **Akola (Distance: 312.5 km, Listing Price: ₹7,013/qtl, Other Costs: ₹0/qtl)**
   $$\text{Transport Cost per qtl} = 312.5 \times 0.80 = ₹250.00$$
   $$\text{Total Cost per qtl} = 250.00 + 0.00 = ₹250.00$$
   $$\text{Net Price per qtl} = 7013.00 - 250.00 = \mathbf{₹6,763.00 / \text{qtl}}$$

5. **Nashik (Distance: 875 km, Listing Price: ₹7,090/qtl, Other Costs: ₹100/qtl)**
   $$\text{Transport Cost per qtl} = 875 \times 0.80 = ₹700.00$$
   $$\text{Total Cost per qtl} = 700.00 + 100.00 = ₹800.00$$
   $$\text{Net Price per qtl} = 7090.00 - 800.00 = \mathbf{₹6,290.00 / \text{qtl}}$$

#### Step 2: Recommendation & Advantage Output
- **🏆 Champion Recommendation:** **Amravati** with **₹7,134 / qtl**
- **Profit Advantage Over Local Market:**
  $$\text{Extra Return} = ₹7,134 - ₹7,100 = \mathbf{₹34 / \text{quintal}} \quad (\mathbf{₹340} \text{ extra on 10 quintals})$$

---

## 3. Technology Stack & Design Architecture

- **Backend:** Python 3 + Flask REST API
- **Database:** SQLite with normalized relational schema
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (no framework overhead; high performance on low-end mobile phones)
- **External APIs:**
  - Google Maps JavaScript SDK & Distance Matrix API (`AIzaSyDOkEUdOO0Lnb_7HpOZ41mBxc1RSO4QDeU`)
  - Agmarknet / data.gov.in XML Price Feed API (`579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b`)
- **Multilingual Text-to-Speech (TTS):** gTTS + Web Speech API fallback (English, Hindi, Marathi)
- **Security:** Token-based authentication for Admin configuration (`admin` / `admin`)

---

## 4. Complete File Inventory & Usage Guide

Below is an exhaustive directory of every file in the codebase, detailing its **Purpose**, **Inputs**, **Outputs**, and **Usage Example**.

```
krishimitra/
├── backend/
│   ├── app.py                          # Flask entrypoint & API routing
│   ├── config.py                       # App constants, mock toggle, DB paths, API keys
│   ├── database/
│   │   ├── db_connection.py            # SQLite context manager & connection pool
│   │   ├── db_init.py                  # DDL table creation scripts
│   │   └── seed_data.py                # Realistic seed data matching pitch deck
│   ├── models/
│   │   ├── crop_model.py               # Crop entity queries
│   │   ├── mandi_model.py              # Mandi coordinates & entity queries
│   │   ├── price_model.py              # Prices and historical trend queries
│   │   ├── distance_model.py           # Inter-mandi distance matrix queries
│   │   └── cost_model.py               # Handling charges & transport rate queries
│   ├── services/
│   │   ├── transport_cost_calculator.py# Distance x Rate x Qty pure calculator
│   │   ├── net_price_calculator.py     # Mandi Price - Total Cost pure calculator
│   │   ├── cost_estimation_service.py  # Loading/unloading/cess fee lookup
│   │   ├── maps_distance_service.py    # Distance lookup & GPS Haversine fallback
│   │   ├── data_fetcher_service.py     # Agmarknet / e-NAM XML API price fetcher
│   │   ├── price_comparison_engine.py  # Mandi price alignment across markets
│   │   ├── ranking_recommendation_engine.py # Descending net return ranking engine
│   │   ├── tts_engine.py               # Multilingual voice synthesis (EN/HI/MR)
│   │   ├── analytics_reports_service.py# 7-day historical trends & spread stats
│   │   └── notification_service.py     # Price surge alerts & market advisories
│   ├── admin/
│   │   └── admin_panel.py              # Admin CRUD controller & authentication
│   └── requirements.txt                # Python dependencies
├── frontend/
│   ├── index.html                      # Screen 1: Farmer Input Form
│   ├── dashboard.html                  # Screen 2: Mandi Compare & Map Dashboard
│   ├── admin.html                      # Screen 3: Admin Management & Login Screen
│   ├── css/style.css                   # Mobile-first high contrast stylesheet
│   └── js/
│       ├── app.js                      # Farmer input handling & localization
│       ├── dashboard.js                # Comparison table, summary card, TTS, Maps
│       └── admin.js                    # Admin panel login & CRUD operations
├── test_services.py                    # Automated test verification suite
├── PROJECT_DOCUMENTATION.md            # Comprehensive project documentation
└── README.md                           # Quick start & deployment guide
```

---

### Backend Files

#### 1. `backend/config.py`
- **Purpose:** Central application configuration, environment variables, SQLite database path, external API keys, and admin credentials.
- **Inputs:** OS environment variables or default values.
- **Outputs:** `Config` class attributes (`DB_PATH`, `GOOGLE_MAPS_API_KEY`, `AGMARKNET_API_KEY`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, etc.).
- **Usage Example:**
  ```python
  from config import Config
  print(Config.GOOGLE_MAPS_API_KEY)
  print(Config.ADMIN_USERNAME) # 'admin'
  ```

#### 2. `backend/database/db_connection.py`
- **Purpose:** Thread-safe SQLite connection manager with dictionary row formatting (`dict_factory`).
- **Inputs:** Optional database path.
- **Outputs:** Managed `sqlite3.Connection` context yielding dictionary rows.
- **Usage Example:**
  ```python
  from database.db_connection import query_db, execute_db
  crops = query_db("SELECT * FROM crops;")
  crop_id = execute_db("INSERT INTO crops (name) VALUES (?);", ("Maize",))
  ```

#### 3. `backend/database/db_init.py`
- **Purpose:** Executes Data Definition Language (DDL) to initialize tables: `crops`, `mandis`, `prices`, `distances`, `transport_rates`, `other_costs`, `users`, `price_history`.
- **Inputs:** None (or DB path).
- **Outputs:** Created SQLite tables.
- **Usage Example:**
  ```python
  from database.db_init import init_db
  init_db()
  ```

#### 4. `backend/database/seed_data.py`
- **Purpose:** Populates the database with realistic sample data (Cotton in Nagpur, Amravati, Pune, Akola, Nashik; realistic lat/lng; freight rates; 7-day historical prices).
- **Inputs:** None (or DB path).
- **Outputs:** Seeded database records.
- **Usage Example:**
  ```python
  from database.seed_data import seed_db
  seed_db()
  ```

#### 5. `backend/models/crop_model.py`
- **Purpose:** Encapsulates data access and CRUD operations for agricultural crops.
- **Inputs:** Crop names, crop IDs.
- **Outputs:** Dictionaries with `id` and `name`.
- **Usage Example:**
  ```python
  from models.crop_model import CropModel
  all_crops = CropModel.get_all()
  crop = CropModel.get_by_id(1)
  ```

#### 6. `backend/models/mandi_model.py`
- **Purpose:** Encapsulates data access and CRUD operations for APMC Mandis (including latitude and longitude coordinates).
- **Inputs:** Mandi name, latitude, longitude, mandi ID.
- **Outputs:** Dictionaries with `id`, `name`, `latitude`, `longitude`.
- **Usage Example:**
  ```python
  from models.mandi_model import MandiModel
  mandis = MandiModel.get_all()
  mandi = MandiModel.get_by_id(2)
  ```

#### 7. `backend/models/price_model.py`
- **Purpose:** Manages current and historical crop prices across regional mandis.
- **Inputs:** `crop_id`, `mandi_id`, `price_per_quintal`.
- **Outputs:** Current price records and historical 7-day series.
- **Usage Example:**
  ```python
  from models.price_model import PriceModel
  prices = PriceModel.get_by_crop_id(1)
  PriceModel.upsert_price(crop_id=1, mandi_id=2, price_per_quintal=7250.0)
  ```

#### 8. `backend/models/distance_model.py`
- **Purpose:** Manages distance matrix data (in kilometers) between pairs of mandis/villages.
- **Inputs:** `from_id`, `to_id`, `distance_km`.
- **Outputs:** Distance in km (float).
- **Usage Example:**
  ```python
  from models.distance_model import DistanceModel
  dist = DistanceModel.get_distance(from_id=1, to_id=2) # 145.0
  ```

#### 9. `backend/models/cost_model.py`
- **Purpose:** Manages loading, unloading, and statutory market fee records for each mandi, as well as baseline transport rates.
- **Inputs:** `mandi_id`, `loading`, `unloading`, `market_charge`, `rate_per_km_per_quintal`.
- **Outputs:** Breakdown dictionaries and baseline freight rate.
- **Usage Example:**
  ```python
  from models.cost_model import CostModel
  costs = CostModel.get_other_costs_by_mandi(1)
  rate = CostModel.get_transport_rate() # 0.80
  ```

#### 10. `backend/services/transport_cost_calculator.py`
- **Purpose:** Pure mathematical function to compute transport freight costs.
- **Formula:** `Distance (km) × Rate (₹/km/qtl) × Quantity (qtl)`.
- **Inputs:** `distance_km` (float), `rate_per_km_per_quintal` (float), `quantity_quintal` (float).
- **Outputs:** Dict with `per_quintal` and `total` transport costs in INR.
- **Usage Example:**
  ```python
  from services.transport_cost_calculator import calculate_transport_cost
  res = calculate_transport_cost(distance_km=145.0, rate_per_km_per_quintal=0.80, quantity_quintal=10)
  # {'per_quintal': 116.0, 'total': 1160.0, 'distance_km': 145.0, ...}
  ```

#### 11. `backend/services/cost_estimation_service.py`
- **Purpose:** Aggregates handling expenses (loading, unloading, statutory market cess) per mandi.
- **Inputs:** `mandi_id` (int), `quantity_quintal` (float).
- **Outputs:** Dict with itemized and aggregated handling expenses in INR.
- **Usage Example:**
  ```python
  from services.cost_estimation_service import estimate_other_costs
  charges = estimate_other_costs(mandi_id=1, quantity_quintal=10)
  # {'loading_per_qtl': 40.0, 'unloading_per_qtl': 36.0, 'market_charge_per_qtl': 40.0, 'per_quintal': 116.0, 'total': 1160.0}
  ```

#### 12. `backend/services/net_price_calculator.py`
- **Purpose:** Pure mathematical function to calculate net realized price and total farmer earnings after all logistical and operational deductions.
- **Formula:** `Net Price = Mandi Price − (Transport Cost + Other Costs)`.
- **Inputs:** `mandi_price_per_qtl`, `transport_cost_per_qtl`, `other_costs_per_qtl`, `quantity_quintal`.
- **Outputs:** Dict with `net_price_per_qtl`, `total_cost_per_qtl`, `gross_mandi_revenue`, `total_expenses`, `total_net_return`.
- **Usage Example:**
  ```python
  from services.net_price_calculator import calculate_net_price
  net = calculate_net_price(mandi_price_per_qtl=7250.0, transport_cost_per_qtl=116.0, other_costs_per_qtl=0.0, quantity_quintal=10)
  # {'net_price_per_qtl': 7134.0, 'total_net_return': 71340.0, ...}
  ```

#### 13. `backend/services/maps_distance_service.py`
- **Purpose:** Resolves driving distance between two mandis using Google Maps Distance Matrix API, falling back to local database or Haversine GPS formula calculation from lat/lng coordinates.
- **Inputs:** `from_mandi_id` (int), `to_mandi_id` (int).
- **Outputs:** Tuple `(distance_km: float, source: str)`.
- **Usage Example:**
  ```python
  from services.maps_distance_service import get_distance_km
  dist, src = get_distance_km(from_mandi_id=1, to_mandi_id=2)
  # (145.0, 'database')
  ```

#### 14. `backend/services/data_fetcher_service.py`
- **Purpose:** Pulls live commodity mandi prices from government portal **Agmarknet (data.gov.in)** in XML format using `xml.etree.ElementTree`, or simulates realistic market movements when offline.
- **Inputs:** Optional `crop_id`.
- **Outputs:** Dict with update summary, updated count, and price records.
- **Usage Example:**
  ```python
  from services.data_fetcher_service import DataFetcherService
  res = DataFetcherService.fetch_and_update_prices()
  ```

#### 15. `backend/services/price_comparison_engine.py`
- **Purpose:** Aggregates and aligns prices across all candidate mandis for a chosen crop, pairing each candidate with its distance from the farmer's origin mandi.
- **Inputs:** `crop_id` (int), `home_mandi_id` (int).
- **Outputs:** List of candidate mandi listings with listing prices and distances.
- **Usage Example:**
  ```python
  from services.price_comparison_engine import get_aligned_mandi_prices
  candidates = get_aligned_mandi_prices(crop_id=1, home_mandi_id=1)
  ```

#### 16. `backend/services/ranking_recommendation_engine.py`
- **Purpose:** Evaluates all reachable mandis by running candidate markets through transport and handling cost models, computes net farmer returns, and ranks mandis descending by net price per quintal.
- **Inputs:** `crop_id` (int), `home_mandi_id` (int), `quantity_quintal` (float).
- **Outputs:** Dict with `ranked_mandis`, `recommended_mandi`, `effective_price_summary`, and profit gain statistics.
- **Usage Example:**
  ```python
  from services.ranking_recommendation_engine import rank_and_recommend_mandis
  report = rank_and_recommend_mandis(crop_id=1, home_mandi_id=1, quantity_quintal=10)
  print(report["recommended_mandi"]["mandi_name"]) # 'Amravati'
  ```

#### 17. `backend/services/tts_engine.py`
- **Purpose:** Multilingual voice synthesizer supporting **Marathi (mr)**, **Hindi (hi)**, and **English (en)**. Generates base64 MP3 audio using gTTS and creates natural localized audio scripts for low-literacy farmers.
- **Inputs:** `mandi_name` (str), `crop_name` (str), `net_price` (float), `language` (str).
- **Outputs:** Dict with audio base64 data, script, language, and MIME type.
- **Usage Example:**
  ```python
  from services.tts_engine import generate_speech
  audio = generate_speech("Amravati", "Cotton", 7134.0, language="mr")
  print(audio["script"])
  # 'तुमच्या कापूससाठी सर्वात उत्तम मंडी अमरावती आहे. येथे सर्व वाहतूक आणि खर्च वजा करून निव्वळ नफा 7134 रुपये प्रति क्विंटल मिळेल.'
  ```

#### 18. `backend/services/analytics_reports_service.py`
- **Purpose:** Computes 7-day historical price movements, regional price spread (Max − Min), average prices, and market direction (up/down/stable) for agricultural commodities.
- **Inputs:** `crop_id` (int).
- **Outputs:** Dict with summary metrics, 7-day percent changes, and historical series.
- **Usage Example:**
  ```python
  from services.analytics_reports_service import get_crop_analytics
  analytics = get_crop_analytics(crop_id=1)
  print(analytics["summary"]["spread"])
  ```

#### 19. `backend/services/notification_service.py`
- **Purpose:** Generates price surge alerts, commodity advisories, and freight optimization notices for farmers.
- **Inputs:** Optional `crop_id`, `mandi_id`.
- **Outputs:** List of notification alert dictionaries.
- **Usage Example:**
  ```python
  from services.notification_service import get_active_notifications
  alerts = get_active_notifications()
  ```

#### 20. `backend/admin/admin_panel.py`
- **Purpose:** Administrative controller handling credentials verification (`admin`/`admin`), token generation, and full CRUD operations for crops, mandis, transport rates, distances, costs, and prices.
- **Inputs:** Credentials, entity payloads, record IDs.
- **Outputs:** Authentication status and administrative datasets.
- **Usage Example:**
  ```python
  from admin.admin_panel import AdminController
  auth = AdminController.authenticate("admin", "admin") # {'status': 'success', 'token': '...'}
  AdminController.update_transport_rate(0.85)
  ```

#### 21. `backend/app.py`
- **Purpose:** Main Flask web application entrypoint exposing REST APIs (`/api/crops`, `/api/mandis`, `/api/compare`, `/api/speak`, `/api/analytics/<id>`, `/api/notifications`, `/api/admin/*`) and serving static frontend HTML/CSS/JS files.
- **Inputs:** HTTP REST requests.
- **Outputs:** JSON responses and web pages.
- **Usage Example:**
  ```bash
  python backend/app.py
  ```

---

### Frontend Files

#### 22. `frontend/index.html` (Screen 1: Farmer Input)
- **Purpose:** Clean, high-contrast, mobile-first interface for rural farmers to select crop, choose their home mandi, specify harvest quantity, select language (EN/HI/MR), and initiate price discovery.
- **Inputs:** User dropdown selections and number inputs.
- **Outputs:** Navigates to `/dashboard` with query parameters.

#### 23. `frontend/dashboard.html` (Screen 2: Mandi Compare & Map)
- **Purpose:** Visual comparison dashboard featuring:
  - 🏆 Champion recommended market card (Amravati ₹7,134/qtl)
  - Effective Price Summary card breakdown
  - Ranked list of nearby markets
  - "🔊 Speak Result" multilingual voice button
  - Interactive Google Maps route visualizer with fallback
  - 7-Day price trend analytics
- **Inputs:** Reads URL parameters or localStorage data.
- **Outputs:** Visual cards, voice audio playback, Google Maps directions.

#### 24. `frontend/admin.html` (Screen 3: Admin Management)
- **Purpose:** Protected administrative console with password-based authentication (`admin` / `admin`). Allows government/FPO operators to configure freight rates, add crops, update mandi coordinates, edit inter-mandi distances, and override prices.
- **Inputs:** Admin username, password, CRUD form inputs.
- **Outputs:** Live database record updates with toast notifications.

#### 25. `frontend/css/style.css`
- **Purpose:** Responsive stylesheet with an emerald/forest green agricultural color palette, large accessible tap targets (≥ 52px), high-contrast typography (≥ 16px), gold badge accents, and voice pulse animations.

#### 26. `frontend/js/app.js`
- **Purpose:** Powers Screen 1 (`index.html`). Fetches crops and mandis from `/api/crops` and `/api/mandis`, handles instant language toggling, loads live market notification ticker, and validates farmer form submission.

#### 27. `frontend/js/dashboard.js`
- **Purpose:** Powers Screen 2 (`dashboard.html`). Calls `POST /api/compare`, renders winner cards, generates audio playback via `POST /api/speak` with Web Speech API fallback, and initializes Google Maps JavaScript API with markers and polylines.

#### 28. `frontend/js/admin.js`
- **Purpose:** Powers Screen 3 (`admin.html`). Manages authentication state in `localStorage`, performs login checks against `/api/admin/login`, injects `Authorization: Bearer <token>` in CRUD requests, and manages tabs.

---

### Testing & Verification Files

#### 29. `test_services.py`
- **Purpose:** Standalone test suite that verifies all 10 backend calculation services, mathematical formulas, and the Cotton/Nagpur benchmark without needing a browser.
- **Usage Example:**
  ```bash
  python test_services.py
  ```

#### 30. `README.md`
- **Purpose:** High-level project summary, installation instructions, benchmark calculation table, and API integration guides.

---

## 5. Admin Authentication & Security Reference

To protect master logistics data from unauthorized modification, the Admin Panel (`/admin`) is protected with password-based authentication:

- **Default Username:** `admin`
- **Default Password:** `admin`
- **Auth Endpoint:** `POST /api/admin/login`
- **Header Structure:** `Authorization: Bearer krishimitra-admin-auth-token-prod`
- **Protected Endpoints:** All `/api/admin/*` CRUD endpoints return `401 Unauthorized` unless a valid token is provided.

---

## 6. Live API Integrations Reference

### 1. Agmarknet Mandi Price Feed (data.gov.in XML API)
- **Resource ID:** `9ef84268-d588-465a-a308-a864a43d0070`
- **API Key:** `579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b`
- **Format:** `xml`
- **URL Schema:**
  ```
  https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=xml&limit=25&filters[commodity]=Cotton&filters[market]=Amravati
  ```

### 2. Google Maps Platform
- **API Key:** `AIzaSyDOkEUdOO0Lnb_7HpOZ41mBxc1RSO4QDeU`
- **Distance Matrix API:** Queries driving distances between origin and destination mandi coordinates.
- **JavaScript API SDK:** Renders interactive maps on the Dashboard with custom marker icons for Home Mandi (🏠), Recommended Market (🏆), and driving route lines.

---

## 7. How to Run the Application

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Run test verification suite
python test_services.py

# 3. Launch Flask server
python backend/app.py
```

Open in your browser:
- **Farmer Interface:** [http://127.0.0.1:5000](http://127.0.0.1:5000)
- **Mandi Compare Dashboard:** [http://127.0.0.1:5000/dashboard](http://127.0.0.1:5000/dashboard)
- **Admin Management Panel:** [http://127.0.0.1:5000/admin](http://127.0.0.1:5000/admin) (Credentials: `admin` / `admin`)

---

## 8. Free Cloud Deployment Guide

### Option 1: Deploy on Vercel (100% Free Serverless)
The project includes `vercel.json` and `api/index.py` for immediate zero-config serverless deployment:
1. Initialize git and push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial KrishiMitra release"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **"Add New..."** $\rightarrow$ **"Project"** $\rightarrow$ Select your `KrishiMitra` repository.
4. Leave build settings as default (Vercel will detect `vercel.json` and `@vercel/python`).
5. Click **"Deploy"**. Your live prototype will be accessible worldwide on a `.vercel.app` domain.

### Option 2: Deploy on Render.com (100% Free Web Service — Recommended)
Render runs the persistent Python WSGI server (`gunicorn backend.app:app`):
1. Push code to GitHub.
2. Sign up on [Render.com](https://render.com).
3. Click **"New +"** $\rightarrow$ **"Web Service"** $\rightarrow$ Select your GitHub repo.
4. Fill in:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn --chdir backend app:app`
5. Click **"Create Web Service"**. Render will deploy your application on a free `.onrender.com` domain.

### Option 3: Deploy on Railway.app / Koyeb
1. Connect your repository to [Railway.app](https://railway.app) or [Koyeb.com](https://koyeb.com).
2. Railway and Koyeb automatically read `Procfile` and deploy the application.
