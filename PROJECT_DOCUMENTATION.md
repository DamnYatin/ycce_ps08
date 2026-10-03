# KrishiMitra Market Estimator & Direct Marketplace — Comprehensive Technical Documentation
**Theme:** Agriculture, Foodtech & Rural Development  
**Product:** KrishiMitra Market Estimator & Direct Procurement Platform  

---

## 1. Executive Summary & Objective

### Core Problem Statement
> **"Strengthening market linkages and price discovery for farmers"**

Smallholder and marginal farmers across India often sell agricultural produce at local village markets or the closest APMC Mandi, missing out on significantly higher prices offered in neighboring markets. However, traveling to a distant market incurs freight charges, loading/unloading labor costs, and statutory market cess. A higher nominal listing price does **not** guarantee higher take-home profit.

### The KrishiMitra Solution
**KrishiMitra Market Estimator** is a decision-support and price discovery platform that computes the **net realized price per quintal** by automatically deducting distance-based transport costs and mandi handling charges from live/mock Agmarknet prices. It ranks all candidate markets descending by net profit and highlights the #1 market that maximizes the farmer's take-home earnings.

### A Second Pillar: Direct Farmer–Buyer Market Linkage
Beyond mandi-based price discovery, KrishiMitra also removes the middleman entirely for farmers who prefer to sell directly. Farmers can **post a live deal** (crop, quantity, asking price, location) that appears instantly in a dedicated **Buyer Marketplace** interface. Buyers browse, filter, and sort these live deals, and can express interest with a single tap. To protect farmers from unsolicited cold-call spam, **a farmer's phone number is never publicly listed on a deal card** — it is only revealed to a buyer after that buyer explicitly registers interest via an "I'm Interested" inquiry, at which point the farmer also sees how many buyers have inquired. This gives farmers a second, disintermediated route to market alongside the mandi-comparison engine, without exposing their contact details to indiscriminate scraping or spam.

---

## 2. Core Mathematical Model & Formulas

Every calculation is implemented as a pure, deterministic function in dedicated backend services.

### Formula 1: Transport Cost
$$\text{Transport Cost (₹)} = \text{Distance (km)} \times \text{Rate (₹/km/quintal)} \times \text{Quantity (quintals)}$$
$$\text{Transport Cost per quintal (₹/qtl)} = \text{Distance (km)} \times \text{Rate (₹/km/quintal)}$$
- **Implemented in:** [`backend/services/transport_cost_calculator.py`](backend/services/transport_cost_calculator.py)
- **Baseline Freight Rate:** ₹0.80 / km / quintal (configurable via Master Settings)

### Formula 2: Other Mandi Handling Costs
$$\text{Other Costs per quintal (₹/qtl)} = \text{Loading Charge} + \text{Unloading Charge} + \text{Market Cess / Handling Fee}$$
$$\text{Total Other Costs (₹)} = \text{Other Costs per quintal} \times \text{Quantity (quintals)}$$
- **Implemented in:** [`backend/services/cost_estimation_service.py`](backend/services/cost_estimation_service.py)

### Formula 3: Total Expenses Deductions
$$\text{Total Cost per quintal (₹/qtl)} = \text{Transport Cost per quintal} + \text{Other Costs per quintal}$$
$$\text{Total Expenses (₹)} = \text{Total Cost per quintal} \times \text{Quantity (quintals)}$$

### Formula 4: Net Realized Price & Total Earnings
$$\text{Net Price per quintal (₹/qtl)} = \text{Mandi Listing Price (₹/qtl)} - \text{Total Cost per quintal (₹/qtl)}$$
$$\text{Total Net Farmer Return (₹)} = \text{Net Price per quintal} \times \text{Quantity (quintals)}$$
- **Implemented in:** [`backend/services/net_price_calculator.py`](backend/services/net_price_calculator.py)

### Formula 5: Net Profit Gain Over Home Mandi
$$\text{Profit Gain per quintal} = \text{Recommended Mandi Net Price} - \text{Home Mandi Net Price}$$
$$\text{Total Profit Gain (₹)} = \text{Profit Gain per quintal} \times \text{Quantity (quintals)}$$

### Formula 6: Total Harvest Cash Breakdown (Full Batch Calculation)
Farmers think in terms of their total crop earnings rather than fractional quintals. KrishiMitra computes the complete batch ledger:
$$\text{Gross Harvest Value (₹)} = \text{Listing Price (₹/qtl)} \times \text{Total Quantity (qtl)}$$
$$\text{Total Freight Cost (₹)} = \text{Transport Cost per qtl} \times \text{Total Quantity (qtl)}$$
$$\text{Total Mandi Cess & Handling (₹)} = \text{Other Costs per qtl} \times \text{Total Quantity (qtl)}$$
$$\mathbf{\text{Net In-Pocket Harvest Cash (₹)}} = \text{Gross Harvest Value} - (\text{Total Freight Cost} + \text{Total Mandi Cess & Handling})$$

---

### 2.2 Proactive Sell vs. Hold AI Advisory Engine & 7-Day Forecasting Model
Beyond discovering today's best mandi, KrishiMitra answers the farmer's most critical dilemma: **"Should I sell today, or hold my crop for a week?"**

#### 1. Future Listing Price Forecast ($P_t$) — SARIMAX Econometric Formulation
Listing price trajectory $P_t$ for $t \in [1..7]$ days is modeled using Seasonal AutoRegressive Integrated Moving Average with eXogenous Regressors:
$$\text{SARIMAX}(p=1, d=1, q=1) \times (P=1, D=1, Q=0, s=7)$$
- **Exogenous Regressors:**
  - $\text{Rainfall\_Index}$: Tracks localized monsoon precipitation disruptions to mandi arrivals.
  - $\text{Fuel\_Price\_Index}$: Tracks diesel rate fluctuations affecting haulage rates.
- **Graceful Fallback:** If `statsmodels` native C-libraries are unavailable in lightweight cloud containers, an econometric moving-trend drift model provides reliable sub-millisecond forecasts.

#### 2. Warehouse Storage Cost & Crop Moisture Spoilage Decay
Holding agricultural produce involves non-zero daily holding expenditures and physical degradation:
$$\text{Storage\_Cost}_t = C_s \times t \quad (\text{₹/quintal})$$
$$\text{Depreciation\_Loss}_t = \delta \times t \quad (\text{fractional moisture/quality shrinkage})$$
$$\text{Depreciation\_Cost}_t = P_t \times \text{Depreciation\_Loss}_t \quad (\text{₹/quintal})$$
$$\text{Total\_Holding\_Cost}_t = \text{Storage\_Cost}_t + \text{Depreciation\_Cost}_t$$

*Commodity parameters configured in KrishiMitra:*
| Crop | Storage Cost ($C_s$ in ₹/qtl/day) | Daily Spoilage Rate ($\delta$) | 7-Day Storage Cost | 7-Day Quality Decay |
| :--- | :--- | :--- | :--- | :--- |
| **Cotton** | ₹0.60 | 0.05% / day | ₹4.20 / qtl | 0.35% |
| **Soybean** | ₹0.50 | 0.05% / day | ₹3.50 / qtl | 0.35% |
| **Wheat** | ₹0.40 | 0.03% / day | ₹2.80 / qtl | 0.21% |
| **Onion** | ₹1.50 | 0.80% / day | ₹10.50 / qtl | 5.60% (High Perishability) |
| **Tur / Arhar** | ₹0.50 | 0.04% / day | ₹3.50 / qtl | 0.28% |
| **Gram / Chana**| ₹0.45 | 0.04% / day | ₹3.15 / qtl | 0.28% |

#### 3. Expected Net Realized Return & Decision Boundary
$$\text{Expected\_Net\_Price}_t = \Big[ P_t \times (1 - \text{Depreciation\_Loss}_t) \Big] - \text{Storage\_Cost}_t - \text{Logistics\_Cost\_per\_qtl}$$
$$\text{Projected\_Gain\_per\_qtl} = \text{Expected\_Net\_Price}_t - \text{Net\_Price}_{\text{current}}$$

- **Decision Rule:**
  - **$\text{HOLD}$**: If $\text{Projected\_Gain\_per\_qtl} > \text{MINIMUM\_GAIN\_THRESHOLD}$ (₹15.0/qtl). Future price surge safely outpaces storage charges and spoilage.
  - **$\text{SELL}$**: If $\text{Projected\_Gain\_per\_qtl} \le \text{MINIMUM\_GAIN\_THRESHOLD}$. Future prices are flat/falling, and waiting incurs an avoidable loss of $\max(0, -\text{Projected\_Gain\_per\_qtl})$.
  - **$\text{UNAVAILABLE}$**: Returned if historical sample points are $< 15$ days.
- **Implemented in:** [`backend/services/advisory_engine.py`](backend/services/advisory_engine.py) & [`backend/services/forecast_service.py`](backend/services/forecast_service.py)

---

### Step-by-Step Worked Example (Benchmark Scenario)

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
- **Database:** SQLite with normalized relational schema (WAL mode enabled for concurrent read-scalability)
- **Frontend:** Vanilla HTML5, CSS3, JavaScript (no framework overhead; high performance on low-end mobile phones)
- **Progressive Web App (PWA):** `manifest.json` and `sw.js` for standalone home-screen app installation and offline resilience
- **External APIs:**
  - Google Maps JavaScript SDK & Distance Matrix API (`AIzaSyDOkEUdOO0Lnb_7HpOZ41mBxc1RSO4QDeU`)
  - Agmarknet / data.gov.in XML Price Feed API (`579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b`)
- **Multilingual Text-to-Speech (TTS):** gTTS + Web Speech API fallback (English, Hindi, Marathi)
- **Security:** Token-based authentication for Admin & Master Logistics configuration (`admin` / `admin`)
- **Direct Marketplace Module:** Entirely internal — the `deals` and `deal_inquiries` SQLite tables have no external API dependency; deal listings, buyer filtering, and inquiry-gated contact reveal are all served from the same Flask app.

### 3.1 Multi-Tier System Architecture Diagram
```mermaid
graph TD
    subgraph ClientLayer [Presentation Layer / Progressive Web App]
        F1["🌾 Farmer Query Form (index.html)"]
        F2["📊 Comparison & Advisory Dashboard (dashboard.html)"]
        F3["🤝 Direct Buyer Marketplace (buyer/index.html)"]
        F4["⚙️ Logistics & Master Settings (settings.html / admin.html)"]
        SW["⚡ Service Worker (sw.js) & Manifest"]
    end

    subgraph GatewayLayer [Flask Web Server & API Router - app.py]
        R1["POST /api/compare"]
        R2["GET /api/v1/recommendation (Sell vs Hold)"]
        R3["GET/POST /api/deals & /api/deals/:id/inquire"]
        R4["POST /api/speak (Multilingual TTS)"]
        R5["CRUD /api/admin/* & /settings"]
    end

    subgraph LogicLayer [Business Logic & Decision Engines]
        S1["transport_cost_calculator.py (Distance x Rate x Qty)"]
        S2["net_price_calculator.py (Gross - Logistics Deductions)"]
        S3["advisory_engine.py (Sell vs Hold Decision Boundary)"]
        S4["forecast_service.py (SARIMAX Econometric Forecaster)"]
        S5["ranking_recommendation_engine.py (Sorting & Home Delta)"]
        S6["deal_listing_service.py & buyer_feed_service.py"]
    end

    subgraph PersistenceLayer [Data Layer & External Feeds]
        DB[("SQLite Database: krishimitra.db")]
        MAPS["Google Maps Matrix & JavaScript SDK"]
        AGMARK["Agmarknet XML Feed (data.gov.in)"]
        TTS["Google TTS Synthesizer"]
    end

    ClientLayer --> GatewayLayer
    GatewayLayer --> LogicLayer
    LogicLayer --> PersistenceLayer
```

### 3.2 End-to-End Farmer Decision & Buyer Inquiry Flowchart
```mermaid
sequenceDiagram
    autonumber
    actor Farmer as 🌾 Farmer
    participant UI as KrishiMitra Web App
    participant API as Flask API Engine
    participant DB as SQLite Master DB
    actor Buyer as 🏢 Bulk Buyer

    Farmer->>UI: Selects Crop (Cotton), Home Mandi (Nagpur), Quantity (10 qtl)
    UI->>API: POST /api/compare + GET /api/v1/recommendation
    API->>DB: Query distances, current prices, handling cess, & 7d forecasts
    API->>API: Calculate Transport Costs + Mandi Charges + Net Realized Price
    API->>API: Rank mandis & evaluate Sell vs Hold threshold
    API-->>UI: Return Winner (Amravati: ₹7,134/qtl, +₹340 gain) + HOLD Advisory (+₹548/qtl)
    UI-->>Farmer: Displays Total Harvest Cash (₹71,340) + Interactive Sliders + Voice Audio

    alt Direct Sale Alternative
        Farmer->>UI: Submits "📢 List Your Deal" (10 qtl Cotton @ ₹7,134/qtl)
        UI->>API: POST /api/deals (Stores listing, status='active')
        API->>DB: Insert into deals table (Phone encrypted/stored)
        Buyer->>UI: Opens /buyer feed (Browses live deals)
        UI-->>Buyer: Shows Crop, Qty, Asking Price, Location (Phone is HIDDEN)
        Buyer->>UI: Taps "🤝 I'm Interested" (Submits Name & Phone)
        UI->>API: POST /api/deals/{id}/inquire
        API->>DB: Record buyer inquiry in deal_inquiries
        API-->>UI: Reveal farmer's direct phone number as clickable tel: link
        UI-->>Farmer: Updates live inquiry count in "My Active Deals"
    end
```

### 3.3 Relational Entity-Relationship Diagram (ERD)
```mermaid
erDiagram
    CROPS ||--o{ PRICES : "has live prices"
    CROPS ||--o{ DEALS : "categorizes"
    CROPS ||--o{ PRICE_HISTORY : "tracks daily rates"
    MANDIS ||--o{ PRICES : "lists"
    MANDIS ||--o{ DISTANCES : "origin / destination"
    MANDIS ||--o{ DEALS : "located in"
    DEALS ||--o{ DEAL_INQUIRIES : "receives"

    CROPS {
        int id PK
        string name
    }
    MANDIS {
        int id PK
        string name
        float latitude
        float longitude
    }
    PRICES {
        int id PK
        int crop_id FK
        int mandi_id FK
        float price_per_quintal
        timestamp updated_at
    }
    DISTANCES {
        int id PK
        int from_mandi_id FK
        int to_mandi_id FK
        float distance_km
    }
    DEALS {
        int id PK
        string farmer_name
        string farmer_phone
        int crop_id FK
        string crop_name
        float quantity_quintal
        float price_per_quintal
        string location_name
        string status
        timestamp posted_at
    }
    DEAL_INQUIRIES {
        int id PK
        int deal_id FK
        string buyer_name
        string buyer_phone
        timestamp inquired_at
    }
```

---

## 4. Complete File Inventory & Usage Guide

Below is an exhaustive directory of every file in the codebase, detailing its **Purpose**, **Inputs**, **Outputs**, and **Usage Example**.

```
krishimitra/
├── api/
│   └── index.py                        # Vercel serverless WSGI entrypoint
├── backend/
│   ├── app.py                          # Flask entrypoint & API routing
│   ├── config.py                       # App constants, mock toggle, DB paths, API keys
│   ├── database/
│   │   ├── db_connection.py            # SQLite context manager & connection pool
│   │   ├── db_init.py                  # DDL table creation scripts (incl. deals, deal_inquiries)
│   │   └── seed_data.py                # Realistic seed data for Maharashtra mandis + demo deals
│   ├── models/
│   │   ├── crop_model.py               # Crop entity queries
│   │   ├── mandi_model.py              # Mandi coordinates & entity queries
│   │   ├── price_model.py              # Prices and historical trend queries
│   │   ├── distance_model.py           # Inter-mandi distance matrix queries
│   │   ├── cost_model.py               # Handling charges & transport rate queries
│   │   └── deal_model.py               # Direct-sale deal listing & inquiry data access
│   ├── services/
│   │   ├── transport_cost_calculator.py# Distance x Rate x Qty pure calculator
│   │   ├── net_price_calculator.py     # Mandi Price - Total Cost pure calculator
│   │   ├── cost_estimation_service.py  # Loading/unloading/cess fee lookup
│   │   ├── maps_distance_service.py    # Distance lookup & GPS Haversine fallback
│   │   ├── data_fetcher_service.py     # Agmarknet / e-NAM XML API price fetcher
│   │   ├── price_comparison_engine.py  # Mandi price alignment across markets
│   │   ├── ranking_recommendation_engine.py # Descending net return ranking engine
│   │   ├── advisory_engine.py          # Phase 4 Sell vs. Hold proactive recommendation
│   │   ├── forecast_service.py         # SARIMAX batch econometric time series forecaster
│   │   ├── tts_engine.py               # Multilingual voice synthesis (EN/HI/MR)
│   │   ├── analytics_reports_service.py# 7-day historical trends & spread stats
│   │   ├── notification_service.py     # Price surge alerts & market advisories
│   │   ├── deal_listing_service.py     # Validates & creates farmer direct-sale deals
│   │   ├── buyer_feed_service.py       # Buyer feed: filter/sort active deals
│   │   └── deal_inquiry_service.py     # Logs buyer inquiry, releases farmer contact
│   ├── admin/
│   │   └── admin_panel.py              # Admin CRUD controller & authentication
│   └── requirements.txt                # Python dependencies
├── frontend/
│   ├── index.html                      # Screen 1: Farmer Input Form & PWA Shell
│   ├── dashboard.html                  # Screen 2: Mandi Compare, Sensitivity Sliders & Deals
│   ├── settings.html                   # Screen 3a: Master Data & Logistics Configuration
│   ├── admin.html                      # Screen 3b: Admin Login & Secure Dashboard
│   ├── buyer/
│   │   ├── index.html                  # Screen 4: Buyer Marketplace — live deal feed
│   │   └── js/
│   │       └── buyer.js                # Buyer feed fetch/filter/sort + inquiry flow
│   ├── css/style.css                   # Mobile-first high contrast stylesheet (shared)
│   ├── js/
│   │   ├── app.js                      # Farmer input handling & localization
│   │   ├── dashboard.js                # Comparison, Harvest Cash, Sensitivity Sliders, Advisory
│   │   ├── settings.js                 # Master logistics & mandi CRUD controller
│   │   └── admin.js                    # Admin panel login & authentication state
│   ├── manifest.json                   # Web App Manifest for mobile PWA installation
│   └── sw.js                           # Lightweight service worker for 2G/3G caching
├── docs/
│   └── SELL_VS_HOLD_MATHEMATICAL_MODEL.md # Full mathematical advisory documentation
├── test_services.py                    # Core calculation & marketplace verification suite
├── test_advisory_engine.py             # Phase 4 Sell vs. Hold advisory test suite
├── render.yaml                         # Production persistent web service spec
├── vercel.json                         # Serverless deployment configuration
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
- **Purpose:** Executes Data Definition Language (DDL) to initialize tables: `crops`, `mandis`, `prices`, `distances`, `transport_rates`, `other_costs`, `users`, `price_history`, `deals`, `deal_inquiries`.
- **Inputs:** None (or DB path).
- **Outputs:** Created SQLite tables.
- **Usage Example:**
  ```python
  from database.db_init import init_db
  init_db()
  ```
- **New tables added for the Direct Marketplace module:**
  ```sql
  CREATE TABLE IF NOT EXISTS deals (
      id                INTEGER PRIMARY KEY AUTOINCREMENT,
      farmer_name       TEXT NOT NULL,
      farmer_phone      TEXT,
      crop_id           INTEGER NOT NULL REFERENCES crops(id),
      crop_name         TEXT NOT NULL,
      quantity_quintal  REAL NOT NULL,
      price_per_quintal REAL NOT NULL,
      mandi_id          INTEGER REFERENCES mandis(id),
      location_name     TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'sold' | 'cancelled'
      posted_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS deal_inquiries (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      deal_id       INTEGER NOT NULL REFERENCES deals(id),
      buyer_name    TEXT,
      buyer_phone   TEXT,
      inquired_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  ```

#### 4. `backend/database/seed_data.py`
- **Purpose:** Populates the database with realistic sample data (Cotton in Nagpur, Amravati, Pune, Akola, Nashik; realistic lat/lng; freight rates; 7-day historical prices), plus 5–6 realistic demo deals for the Buyer Marketplace (e.g. Wheat/Nashik/₹10,000, Cotton/Amravati/₹7,300, Soybean/Akola/₹4,800, Onion/Pune/₹1,900, Tur/Nagpur/₹8,200) with staggered `posted_at` timestamps.
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

#### 10. `backend/models/deal_model.py`
- **Purpose:** CRUD data access for direct-sale `deals` and their `deal_inquiries`. Backs both the farmer's "List Your Deal" flow and the Buyer Marketplace feed.
- **Inputs:** `farmer_name`, `farmer_phone`, `crop_id`, `crop_name`, `quantity_quintal`, `price_per_quintal`, `mandi_id`, `location_name`; for inquiries: `deal_id`, `buyer_name`, `buyer_phone`.
- **Outputs:** Deal/inquiry dictionaries and lists (dict_factory rows).
- **Usage Example:**
  ```python
  from models.deal_model import DealModel
  deal = DealModel.create_deal(farmer_name="Ramesh Patil", farmer_phone="9812345670",
                                crop_id=2, crop_name="Wheat", quantity_quintal=8,
                                price_per_quintal=10000.0, mandi_id=5, location_name="Nashik")
  active = DealModel.get_active_deals(crop_filter=None, location_filter=None, sort_by="newest")
  DealModel.mark_deal_sold(deal["id"])
  DealModel.create_inquiry(deal_id=deal["id"], buyer_name="Suresh", buyer_phone="9900011122")
  ```

#### 11. `backend/services/transport_cost_calculator.py`
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

#### 12. `backend/services/cost_estimation_service.py`
- **Purpose:** Aggregates handling expenses (loading, unloading, statutory market cess) per mandi.
- **Inputs:** `mandi_id` (int), `quantity_quintal` (float).
- **Outputs:** Dict with itemized and aggregated handling expenses in INR.
- **Usage Example:**
  ```python
  from services.cost_estimation_service import estimate_other_costs
  charges = estimate_other_costs(mandi_id=1, quantity_quintal=10)
  # {'loading_per_qtl': 40.0, 'unloading_per_qtl': 36.0, 'market_charge_per_qtl': 40.0, 'per_quintal': 116.0, 'total': 1160.0}
  ```

#### 13. `backend/services/net_price_calculator.py`
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

#### 14. `backend/services/maps_distance_service.py`
- **Purpose:** Resolves driving distance between two mandis using Google Maps Distance Matrix API, falling back to local database or Haversine GPS formula calculation from lat/lng coordinates.
- **Inputs:** `from_mandi_id` (int), `to_mandi_id` (int).
- **Outputs:** Tuple `(distance_km: float, source: str)`.
- **Usage Example:**
  ```python
  from services.maps_distance_service import get_distance_km
  dist, src = get_distance_km(from_mandi_id=1, to_mandi_id=2)
  # (145.0, 'database')
  ```

#### 15. `backend/services/data_fetcher_service.py`
- **Purpose:** Pulls live commodity mandi prices from government portal **Agmarknet (data.gov.in)** in XML format using `xml.etree.ElementTree`, or simulates realistic market movements when offline.
- **Inputs:** Optional `crop_id`.
- **Outputs:** Dict with update summary, updated count, and price records.
- **Usage Example:**
  ```python
  from services.data_fetcher_service import DataFetcherService
  res = DataFetcherService.fetch_and_update_prices()
  ```

#### 16. `backend/services/price_comparison_engine.py`
- **Purpose:** Aggregates and aligns prices across all candidate mandis for a chosen crop, pairing each candidate with its distance from the farmer's origin mandi.
- **Inputs:** `crop_id` (int), `home_mandi_id` (int).
- **Outputs:** List of candidate mandi listings with listing prices and distances.
- **Usage Example:**
  ```python
  from services.price_comparison_engine import get_aligned_mandi_prices
  candidates = get_aligned_mandi_prices(crop_id=1, home_mandi_id=1)
  ```

#### 17. `backend/services/ranking_recommendation_engine.py`
- **Purpose:** Evaluates all reachable mandis by running candidate markets through transport and handling cost models, computes net farmer returns, and ranks mandis descending by net price per quintal.
- **Inputs:** `crop_id` (int), `home_mandi_id` (int), `quantity_quintal` (float).
- **Outputs:** Dict with `ranked_mandis`, `recommended_mandi`, `effective_price_summary`, and profit gain statistics.
- **Usage Example:**
  ```python
  from services.ranking_recommendation_engine import rank_and_recommend_mandis
  report = rank_and_recommend_mandis(crop_id=1, home_mandi_id=1, quantity_quintal=10)
  print(report["recommended_mandi"]["mandi_name"]) # 'Amravati'
  ```

#### 18. `backend/services/tts_engine.py`
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

#### 19. `backend/services/analytics_reports_service.py`
- **Purpose:** Computes 7-day historical price movements, regional price spread (Max − Min), average prices, and market direction (up/down/stable) for agricultural commodities.
- **Inputs:** `crop_id` (int).
- **Outputs:** Dict with summary metrics, 7-day percent changes, and historical series.
- **Usage Example:**
  ```python
  from services.analytics_reports_service import get_crop_analytics
  analytics = get_crop_analytics(crop_id=1)
  print(analytics["summary"]["spread"])
  ```

#### 20. `backend/services/notification_service.py`
- **Purpose:** Generates price surge alerts, commodity advisories, and freight optimization notices for farmers.
- **Inputs:** Optional `crop_id`, `mandi_id`.
- **Outputs:** List of notification alert dictionaries.
- **Usage Example:**
  ```python
  from services.notification_service import get_active_notifications
  alerts = get_active_notifications()
  ```

#### 21. `backend/services/deal_listing_service.py`
- **Purpose:** Validates and creates a new farmer direct-sale deal listing (the "List Your Deal" use case). Enforces business rules before writing to the `deals` table.
- **Inputs:** `farmer_name`, `farmer_phone` (optional, 10-digit if present), `crop_id`, `quantity_quintal` (must be > 0), `price_per_quintal` (must be > 0), `mandi_id` or free-text `location_name`.
- **Outputs:** The created deal record, or a structured `{ "error": "..." }` dict describing the specific validation failure for inline frontend display.
- **Usage Example:**
  ```python
  from services.deal_listing_service import create_deal_listing
  result = create_deal_listing(farmer_name="Ramesh Patil", farmer_phone="9812345670",
                                crop_id=2, quantity_quintal=8, price_per_quintal=10000.0,
                                mandi_id=5)
  ```

#### 22. `backend/services/buyer_feed_service.py`
- **Purpose:** Powers the Buyer Marketplace feed — fetches all `status='active'` deals, applies optional crop/location filters, sorts by newest or price, and computes a human-readable `posted_ago` string per deal. **Deliberately excludes `farmer_phone` from its output** — contact details are never part of the general feed response.
- **Inputs:** `crop_filter` (optional str), `location_filter` (optional str), `sort_by` (optional: `newest` | `price_high` | `price_low`).
- **Outputs:** List of deal dicts (crop, price, location, quantity, farmer_name, posted_ago — no phone number).
- **Usage Example:**
  ```python
  from services.buyer_feed_service import get_buyer_feed
  feed = get_buyer_feed(crop_filter="Wheat", sort_by="price_high")
  ```

#### 23. `backend/services/deal_inquiry_service.py`
- **Purpose:** Handles a buyer's "I'm Interested" action — logs the inquiry in `deal_inquiries` and, only at that point, releases the farmer's contact details to the requesting buyer.
- **Inputs:** `deal_id` (int), optional `buyer_name`, optional `buyer_phone`.
- **Outputs:** `{ "farmer_name": ..., "farmer_phone": ..., "deal_summary": {...} }` on success; a clear error if the deal is no longer active (sold/cancelled).
- **Usage Example:**
  ```python
  from services.deal_inquiry_service import register_inquiry
  contact = register_inquiry(deal_id=14, buyer_name="Suresh", buyer_phone="9900011122")
  print(contact["farmer_phone"])  # only returned here, never in the general feed
  ```

#### 24. `backend/admin/admin_panel.py`
- **Purpose:** Administrative controller handling credentials verification (`admin`/`admin`), token generation, and full CRUD operations for crops, mandis, transport rates, distances, costs, and prices.
- **Inputs:** Credentials, entity payloads, record IDs.
- **Outputs:** Authentication status and administrative datasets.
- **Usage Example:**
  ```python
  from admin.admin_panel import AdminController
  auth = AdminController.authenticate("admin", "admin") # {'status': 'success', 'token': '...'}
  AdminController.update_transport_rate(0.85)
  ```

#### 25. `backend/app.py`
- **Purpose:** Main Flask web application entrypoint exposing REST APIs and serving static frontend HTML/CSS/JS files, including the Buyer Marketplace routes.
- **Routes:** `/api/crops`, `/api/mandis`, `/api/compare`, `/api/speak`, `/api/analytics/<id>`, `/api/notifications`, `/api/admin/*`, and the Direct Marketplace routes:
  ```
  POST   /api/deals              -> create a new farmer deal listing
  GET    /api/deals              -> buyer feed (?crop=&location=&sort=newest|price_high|price_low), no phone numbers included
  GET    /api/deals/<id>         -> single deal detail (no phone number)
  PATCH  /api/deals/<id>/sold    -> farmer marks their own deal as sold
  DELETE /api/deals/<id>         -> farmer cancels/removes their listing
  POST   /api/deals/<id>/inquire -> buyer registers interest; returns farmer_name + farmer_phone
  GET    /buyer                  -> serves frontend/buyer/index.html
  ```
- **Inputs:** HTTP REST requests.
- **Outputs:** JSON responses and web pages.
- **Usage Example:**
  ```bash
  python backend/app.py
  ```

---

### Frontend Files

#### 26. `frontend/index.html` (Screen 1: Farmer Input)
- **Purpose:** Clean, high-contrast, mobile-first interface for rural farmers to select crop, choose their home mandi, specify harvest quantity, select language (EN/HI/MR), and initiate price discovery.
- **Inputs:** User dropdown selections and number inputs.
- **Outputs:** Navigates to `/dashboard` with query parameters.

#### 27. `frontend/dashboard.html` (Screen 2: Mandi Compare & Map)
- **Purpose:** Visual comparison dashboard featuring:
  - 🏆 Champion recommended market card (Amravati ₹7,134/qtl)
  - Effective Price Summary card with transparent breakdown
  - Ranked list of nearby markets
  - "🔊 Speak Result" multilingual voice button
  - Interactive Google Maps route visualizer with fallback
  - 7-Day price trend analytics
  - **"📢 List Your Deal — Sell Directly to Buyers"** section: a form (farmer name, phone, crop, quantity, asking price pre-filled with the recommended net price, location) that posts to `POST /api/deals`, plus a **"My Active Deals"** list showing each listing's live **inquiry count** and a **"Mark as Sold"** action.
- **Inputs:** Reads URL parameters or localStorage data; deal-listing form inputs.
- **Outputs:** Visual cards, voice audio playback, Google Maps directions, new deal listings, inquiry counts.

#### 28. `frontend/admin.html` (Screen 3: Admin Management)
- **Purpose:** Protected administrative console with password-based authentication (`admin` / `admin`). Allows government/FPO operators to configure freight rates, add crops, update mandi coordinates, edit inter-mandi distances, and override prices.
- **Inputs:** Admin username, password, CRUD form inputs.
- **Outputs:** Live database record updates with toast notifications.

#### 29. `frontend/buyer/index.html` (Screen 4: Buyer Marketplace)
- **Purpose:** Dedicated buyer-facing interface, visually consistent with the farmer screens (same shared stylesheet, same color palette and button styles), showing a live, auto-refreshing feed of active farmer deals. Each deal card displays Crop, Price per quintal, Location, Quantity available, Posted-time, and the farmer's name — **but not their phone number**. A **"🤝 I'm Interested"** button on each card triggers the inquiry flow: on click, it calls `POST /api/deals/<id>/inquire`, logs the inquiry, and only then reveals the farmer's phone number in place of the button (as a tappable `tel:` link). Includes filter controls (Crop, Location) and a Sort control (Newest / Price High→Low / Price Low→High), plus a manual refresh button and ~15–20s auto-polling.
- **Inputs:** Filter/sort selections; "I'm Interested" clicks with optional buyer name/phone.
- **Outputs:** Rendered deal cards; revealed farmer contact details post-inquiry.

#### 30. `frontend/css/style.css`
- **Purpose:** Responsive stylesheet with an emerald/forest green agricultural color palette, large accessible tap targets (≥ 52px), high-contrast typography (≥ 16px), gold badge accents, and voice pulse animations. **Shared by all four screens**, including the Buyer Marketplace — no separate/forked stylesheet exists, ensuring visual consistency between the farmer and buyer experiences.

#### 31. `frontend/js/app.js`
- **Purpose:** Powers Screen 1 (`index.html`). Fetches crops and mandis from `/api/crops` and `/api/mandis`, handles instant language toggling, loads live market notification ticker, and validates farmer form submission.

#### 32. `frontend/js/dashboard.js`
- **Purpose:** Powers Screen 2 (`dashboard.html`). Calls `POST /api/compare`, renders winner cards, generates audio playback via `POST /api/speak` with Web Speech API fallback, initializes Google Maps JavaScript API with markers and polylines, and additionally: submits the "List Your Deal" form to `POST /api/deals`, renders the farmer's "My Active Deals" list with live inquiry counts, and wires up "Mark as Sold" to `PATCH /api/deals/<id>/sold`.

#### 33. `frontend/js/admin.js`
- **Purpose:** Powers Screen 3 (`admin.html`). Manages authentication state in `localStorage`, performs login checks against `/api/admin/login`, injects `Authorization: Bearer <token>` in CRUD requests, and manages tabs.

#### 34. `frontend/buyer/js/buyer.js`
- **Purpose:** Powers Screen 4 (`buyer/index.html`). Fetches `/api/crops` to populate the crop filter, fetches `GET /api/deals` (with filter/sort query params) on load, on filter/sort change, on the ~15–20s auto-refresh interval, and on manual refresh click. Renders deal cards without any phone number. Handles the "I'm Interested" click: posts to `/api/deals/<id>/inquire`, then swaps the button for the revealed phone number as a `tel:` link and disables re-inquiry for that card within the session.

---

### Testing & Verification Files

#### 35. `test_services.py`
- **Purpose:** Standalone test suite that verifies all backend calculation services, mathematical formulas, the Cotton/Nagpur benchmark scenario, and the Direct Marketplace flow (deal creation → buyer feed exclusion of phone numbers → inquiry-gated contact reveal) without needing a browser.
- **Usage Example:**
  ```bash
  python test_services.py
  ```

#### 36. `README.md`
- **Purpose:** High-level project summary, installation instructions, benchmark scenario table, and API integration guides.

---

## 5. Admin Authentication & Security Reference

To protect master logistics data from unauthorized modification, the Admin Panel (`/admin`) is protected with password-based authentication:

- **Default Username:** `admin`
- **Default Password:** `admin`
- **Auth Endpoint:** `POST /api/admin/login`
- **Header Structure:** `Authorization: Bearer krishimitra-admin-auth-token-secure`
- **Protected Endpoints:** All `/api/admin/*` CRUD endpoints return `401 Unauthorized` unless a valid token is provided.

*Note: the Direct Marketplace endpoints (`/api/deals*`) are intentionally left open (no admin auth) since farmers and buyers are both public, unauthenticated users of the prototype — contact-detail protection instead comes from the inquiry-gating design described in Section 9.*

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

### 3. Direct Marketplace Module — No External Dependency
The `deals` and `deal_inquiries` tables and all associated endpoints are served entirely from local SQLite data. No third-party API, key, or quota is involved in listing, browsing, filtering, or inquiring about a deal.

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
- **Buyer Marketplace:** [http://127.0.0.1:5000/buyer](http://127.0.0.1:5000/buyer)
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

> ⚠️ **Known limitation for the Direct Marketplace module on Vercel:** Vercel's serverless filesystem is ephemeral, so new deal listings and inquiries written to SQLite after deployment will **not persist** across cold starts/redeploys. Fine for a live demo walkthrough in one sitting; not suitable for a persistent marketplace. Use Render (below) if you need deals to persist between demo sessions.

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

### Deploying the Buyer Marketplace Module
No additional deployment steps are required — the Buyer Marketplace (`/buyer`, `/api/deals*`) is served by the same Flask application and deploys automatically with the rest of the app on all three options above.

**Post-deploy verification checklist:**
1. Visit `https://<your-deployed-url>/buyer` — confirm the buyer feed loads and shows seeded demo deals, with **no phone numbers visible** on any card.
2. From the farmer dashboard, submit a test deal via "List Your Deal," then confirm it appears in `/buyer` (within the auto-refresh interval, or after a manual refresh).
3. On `/buyer`, click **"🤝 I'm Interested"** on a deal and confirm the farmer's phone number is revealed only after that click, as a tappable `tel:` link.
4. Confirm `GET /api/deals?crop=Wheat&sort=price_high` returns filtered/sorted JSON **without** a `farmer_phone` field.
5. Confirm `POST /api/deals/<id>/inquire` correctly logs the inquiry and that the farmer's dashboard "My Active Deals" section shows an updated inquiry count for that listing.
6. On Vercel specifically, confirm you understand new deals won't persist across redeploys (see the limitation note above); on Render, confirm they do persist across a manual restart.

---

## 9. Direct Farmer-Buyer Deal Marketplace

### 9.1 Purpose
A disintermediation channel that runs alongside — not instead of — the mandi price-comparison engine. Farmers who prefer to sell directly to a buyer (rather than through any mandi) can post a live deal; buyers browse a dedicated marketplace feed and connect with the farmer directly.

### 9.2 Data Model
```sql
CREATE TABLE IF NOT EXISTS deals (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    farmer_name       TEXT NOT NULL,
    farmer_phone      TEXT,
    crop_id           INTEGER NOT NULL REFERENCES crops(id),
    crop_name         TEXT NOT NULL,
    quantity_quintal  REAL NOT NULL,
    price_per_quintal REAL NOT NULL,
    mandi_id          INTEGER REFERENCES mandis(id),
    location_name     TEXT NOT NULL,
    status            TEXT NOT NULL DEFAULT 'active',   -- 'active' | 'sold' | 'cancelled'
    posted_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deal_inquiries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    deal_id       INTEGER NOT NULL REFERENCES deals(id),
    buyer_name    TEXT,
    buyer_phone   TEXT,
    inquired_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 9.3 API Surface
| Method | Route | Purpose | Returns `farmer_phone`? |
|---|---|---|---|
| `POST` | `/api/deals` | Farmer creates a new deal listing | — |
| `GET` | `/api/deals` | Buyer feed, filterable (`crop`, `location`) and sortable (`newest`, `price_high`, `price_low`) | **No** |
| `GET` | `/api/deals/<id>` | Single deal detail | **No** |
| `PATCH` | `/api/deals/<id>/sold` | Farmer marks their own deal as sold | — |
| `DELETE` | `/api/deals/<id>` | Farmer cancels/removes a listing | — |
| `POST` | `/api/deals/<id>/inquire` | Buyer registers interest | **Yes — only here** |
| `GET` | `/buyer` | Serves the Buyer Marketplace page | — |

### 9.4 User Experience Flow
1. **Farmer** fills out "📢 List Your Deal" on `dashboard.html` (crop, quantity, asking price — pre-filled with the engine's recommended net price as a suggestion — and location). Submitting calls `POST /api/deals`.
2. **Buyer** opens `/buyer`, filters/sorts the live feed, and sees deal cards with Crop, Price, Location, Quantity, Posted-time, and the farmer's name — but **no phone number**.
3. **Buyer** taps **"🤝 I'm Interested"** (optionally entering their own name/phone). This calls `POST /api/deals/<id>/inquire`, which logs the inquiry and returns the farmer's contact details, revealed in place on the card.
4. **Farmer** sees a live inquiry count (and, if provided, buyer name/phone) against each of their active listings in "My Active Deals," and can mark a deal as sold once it's closed.

### 9.5 Privacy & Anti-Spam Design Rationale
Contact details are **inquiry-gated, not publicly listed**. This is a deliberate design choice: publishing a farmer's phone number on every card in an open feed invites scraping and cold-call spam. Gating the reveal behind an explicit "I'm Interested" action means every number a farmer receives corresponds to a buyer who has shown real intent, and gives the farmer a visible count of genuine interest before ever picking up the phone. This is worth calling out explicitly during the pitch as a farmer-protection feature, not just a UX detail.

### 9.6 Theming
The Buyer Marketplace (`buyer/index.html`) shares `frontend/css/style.css` with the rest of the app — same emerald/forest-green palette, same button and card conventions, same accessibility bar (large tap targets, high-contrast text). No separate buyer-specific stylesheet exists, by design, so the product feels like one cohesive app rather than two bolted-together tools.

---

## 10. High-Impact Farmer Experience & Decision Features

### 10.1 Total Harvest Profit Breakdown (Full Batch Calculation)
Smallholder farmers manage cash flow based on their **entire haul**, not abstract rates per quintal. KrishiMitra calculates and highlights total in-pocket earnings directly below the winner card:
- **Gross Harvest Value:** e.g., ₹72,500 (for 10 quintals of cotton @ ₹7,250)
- **Total Freight Deductions:** -₹1,160
- **Total Mandi Handling & Cess:** -₹0
- **Net In-Pocket Harvest Cash:** **₹71,340**
- **Extra Net Profit vs. Local Market:** **+₹340**

### 10.2 Day-by-Day (Day 1 through Day 7) Price & Net Trajectory Strip
Instead of a single black-box badge, the **AI Market Advisory card** renders a horizontal scrollable day-by-day trajectory strip with Day +1 through Day +7 badges showing:
1. **Day Number Badge** (`Day +1` to `Day +7`)
2. **Projected Gross Listing Price** ($P_t$)
3. **Expected Net Realized Return** factoring storage fees and natural produce moisture loss
4. **Daily Profit Gain / Loss Avoidance Pill**
5. **Transparency Footnote:** Clear explanation that forecasts are computed via SARIMAX trained on APMC arrival rates, precipitation disruption indices, and diesel indices, alongside daily crop-specific storage and shrinkage parameters.

### 10.3 Interactive "What-If?" Sensitivity Simulator
Directly below the winner banner, an interactive simulator allows farmers and agricultural extension officers to simulate scenarios without re-submitting forms:
- **Quantity Slider:** 1 to 100 quintals (step 1 qtl)
- **Freight Rate Slider:** ₹0.40 to ₹2.50 / km / quintal (step ₹0.05)
- **Real-Time Client-Side Re-computation:** Moving either slider instantly updates:
  - Recommended mandi ranking order
  - Net return per quintal
  - Total harvest in-pocket cash ledger
  - All candidate comparison cards

### 10.4 Mobile PWA & Rural Accessibility
- **Installable Progressive Web App (`manifest.json`):** Allows farmers to install KrishiMitra directly onto their Android/iOS home screens without an app store download.
- **Offline Shell & Fast Caching (`sw.js`):** Lightweight service worker caches HTML, CSS, JavaScript, and fonts so the app opens instantly on rural 2G/3G connections.
- **Pinch-to-Zoom Accessibility:** Viewport configuration (`width=device-width, initial-scale=1.0`) allows older farmers to easily zoom in on prices and distances.

---

## 11. Competitive Advantage & Evaluator Matrix

| Evaluation Dimension | Traditional Village Middleman | Vanilla Agmarknet Portal | e-NAM Platform | KrishiMitra Platform |
| :--- | :--- | :--- | :--- | :--- |
| **Realized Profit Calculation** | ❌ Opaque, predatory deductions | ❌ Gross listing price only | ❌ Gross price only | ✅ **Automated: Net = Listing − (Distance × Rate) − Handling** |
| **Logistics Integration** | ❌ Farmer pays blind cartage | ❌ None | ⚠️ Manual transport booking | ✅ **Dynamic distance-based freight deduction** |
| **Temporal Advice (Sell vs Hold)**| ❌ Biased towards buying cheap | ❌ None | ❌ None | ✅ **Algorithmic 7-Day SARIMAX + Storage Decay Model** |
| **Direct Buyer Disintermediation** | ❌ 4%–8% middleman commission | ❌ None | ⚠️ Heavy KYC / portal registration | ✅ **Instant deal posting with zero commission** |
| **Farmer Privacy & Spam Shield** | ❌ Numbers widely circulated | ❌ Not applicable | ⚠️ Listed on public bids | ✅ **Inquiry-gated phone number reveal** |
| **Accessibility & Usability** | ⚠️ Verbal only | ❌ Complex English tabular UI | ❌ Desktop portal | ✅ **Multilingual TTS (EN/HI/MR) + PWA Mobile-First** |

---

## 12. Deployment & Data Persistence Architecture

### Why Deals Disappear on Vercel Serverless
Vercel serverless functions run in ephemeral, read-only containers. Any file written to the local filesystem (such as SQLite at `/tmp/krishimitra.db`) is stored in temporary memory and **erased upon container shutdown or cold restart**. 

### Production Persistence Solutions
1. **Option A: Render.com Persistent Web Service (Recommended & Included):**
   - The repository includes [`render.yaml`](render.yaml) which spins up a persistent Python WSGI web service (`gunicorn backend.app:app`) backed by a persistent disk mount. SQLite changes and deal listings persist indefinitely across restarts.
2. **Option B: External PostgreSQL (`DATABASE_URL`):**
   - `backend/database/db_connection.py` can be pointed to a hosted PostgreSQL instance (e.g., Supabase or Neon free tier) by configuring the `DATABASE_URL` environment variable, enabling persistent serverless deployments across any cloud provider.

