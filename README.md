# SportsBuddy 🏅

**SportsBuddy** is a scalable, full-stack application designed to connect sports enthusiasts, find nearby players, and discover venue hotspots using machine learning.

## 🚀 Executive Summary

This project was built as part of a 10-week internship plan focusing on backend infrastructure scaling and ML feature integration. It transitions from a simple frontend prototype to a robust architecture capable of handling 10,000+ users.

## 🏗️ Technical Architecture

### **Frontend**
- **Framework:** React 18 with Vite
- **Language:** TypeScript
- **Maps:** React Leaflet + Leaflet Heatmap
- **Styling:** TailwindCSS + Lucide React Icons
- **Design:** Minimalist, clean UI with dark/light mode support

### **Backend**
- **Framework:** FastAPI (Python)
- **Database:** PostgreSQL 15 + PostGIS (Geospatial Data)
- **Caching:** Redis (Session & API Response Caching)
- **ML/AI:** Scikit-Learn (Player Matching), K-Means (Hotspot Detection)
- **Admin Dashboard:** Streamlit

### **Infrastructure**
- **Containerization:** Docker & Docker Compose
- **Services:**
  - `sportsbuddy_db`: PostgreSQL + PostGIS
  - `sportsbuddy_redis`: Redis Cache
  - `backend`: FastAPI Application
  - `dashboard`: Streamlit Admin Panel

---

## ✨ Key Features

1.  **Interactive Map Interface:**
    - Real-time user clustering for performance.
    - Heatmap view to visualize player density.
    - Custom map markers by sport type.

2.  **Advanced Search & Filtering:**
    - Filter by 30+ sports, skill levels (Beginner to Professional), and distance.
    - Full-text search for names and cities.

3.  **Smart Player Matching (ML):**
    - **Collaborative Filtering:** Matches players based on skill level, location proximity, availability overlap, and play style.
    - **Scoring System:** Provides a 0-100 match quality score with explainable insights.

4.  **Hotspot Detection (ML):**
    - Uses **K-Means Clustering** to identify popular playing venues.
    - Analyzes player density to suggest "Hotspots" dynamically.

5.  **Admin Dashboard:**
    - Visualize user growth, city distribution, and popular sports.
    - Interactive geospatial analysis of user base.

---

## 🛠️ Setup & Installation

### Prerequisites
- Docker Desktop installed
- Node.js (v18+) & npm
- Python 3.9+

### 1. Clone & Database Setup
Start the infrastructure using Docker:
```bash
cd backend
docker-compose up -d
```
This spins up PostgreSQL (Port 5432) and Redis (Port 6379).

### 2. Backend Setup
Set up the Python environment and run the API:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r ../backend_requirements.txt

# Run Data Migration (Populate DB with synthetic data)
python migrate_data.py

# Start FastAPI Server
cd app
uvicorn main:app --reload --port 8000
```
*API Documentation available at: http://localhost:8000/api/docs*

### 3. Frontend Setup
Run the React client:
```bash
cd MAPs-main
npm install
npm run dev
```
*Frontend running at: http://localhost:3000*

### 4. Admin Dashboard
Launch the analytics dashboard:
```bash
# From root directory (ensure venv is active)
streamlit run backend/dashboard/app.py
```
*Dashboard running at: http://localhost:8501*

---

## 📂 Project Structure

```
MAPS/
├── MAPs-main/              # React Frontend
│   ├── src/
│   │   ├── components/     # Map, PlayerCard, FilterPanel
│   │   └── App.tsx         # Main UI Logic
│   └── vite.config.ts      # Build Config
│
├── backend/                # Backend Infrastructure
│   ├── app/
│   │   └── main.py         # FastAPI Endpoints
│   ├── dashboard/          # Streamlit Admin Dashboard
│   ├── ml_features/        # Machine Learning Modules
│   │   ├── player_matching.py
│   │   └── hotspot_detection.py
│   ├── database_schema.sql # PostGIS Schema
│   └── docker-compose.yml  # Infrastructure Config
│
├── generate_dataset.py     # Synthetic Data Generator
└── README.md               # Documentation
```

---

## 🧪 API Endpoints

- `GET /api/users/nearby` - Find players within radius.
- `GET /api/users/clusters` - Server-side map clustering.
- `GET /api/users/{id}/matches` - Get ML-based player matches.
- `GET /api/hotspots` - Get detected venue hotspots.
- `GET /api/stats` - System statistics.

---

## 📈 Success Metrics (Internship Goals)
- [x] **Scalability:** 10,000+ users supported via PostGIS & Redis.
- [x] **Performance:** Sub-100ms API response time for spatial queries.
- [x] **Intelligence:** ML-driven matching and analytics.
- [x] **Visualization:** Interactive heatmaps and dashboards.

---
*Created for SportsBuddy Internship Project • 2025*
