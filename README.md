# SportsBuddy 🏅

**SportsBuddy** is a web application to connect sports enthusiasts and find nearby players.

## 🏗️ Architecture

```
React Frontend → Java Backend (Spring Boot) → Stapubox APIs
```

### **Frontend**
- **Framework:** React 18 + Vite + TypeScript
- **Maps:** React Leaflet with CartoDB Voyager tiles
- **Features:** Marker clustering, Heatmap view, Filters
- **Styling:** TailwindCSS

### **Backend**
- **Framework:** Spring Boot 3.2 (Java 17)
- **Function:** REST API proxy to Stapubox
- **No Database:** All data from Stapubox APIs

---

## 🛠️ Setup

### Prerequisites
- Java 17+
- Node.js 18+

### 1. Start Java Backend
```bash
cd java-backend
./mvnw spring-boot:run
```
*Backend running at: http://localhost:8080*

### 2. Start React Frontend
```bash
cd MAPs-main
npm install
npm run dev -- --port 3002
```
*Frontend running at: http://localhost:3002*

---

## 📂 Project Structure

```
MAPS/
├── MAPs-main/              # React Frontend
│   ├── components/         # Map, PlayerCard, FilterPanel
│   ├── App.tsx             # Main UI
│   └── constants.ts        # Config
│
├── java-backend/           # Spring Boot Backend
│   ├── src/main/java/com/sportsbuddy/
│   │   ├── controller/     # REST Endpoints
│   │   ├── service/        # Stapubox API Integration
│   │   └── model/          # Data Models
│   └── pom.xml             # Maven Config
│
└── README.md
```

---

## 🧪 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/users/nearby` | GET | Find players by location |
| `/api/sports` | GET | List available sports |
| `/api/users/{id}` | GET | Get player details |
| `/api/health` | GET | Health check |

### Query Parameters for `/api/users/nearby`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| lat | Double | required | Latitude |
| lng | Double | required | Longitude |
| radius | Double | 50 | Radius in km |
| sport | String | null | Filter by sport |
| limit | Integer | 100 | Max results |

---

## ⚠️ Configuration

Update Stapubox API credentials in `java-backend/src/main/resources/application.properties`:

```properties
stapubox.api.base-url=https://api.stapubox.com/v1
stapubox.api.key=YOUR_API_KEY_HERE
```

---
*SportsBuddy • 2025*
