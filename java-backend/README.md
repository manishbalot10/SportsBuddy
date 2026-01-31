# SportsBuddy Java Backend

A lightweight Spring Boot backend that connects to Stapubox APIs.

## Requirements
- Java 17+
- Maven 3.6+

## Quick Start

```bash
cd java-backend
./mvnw spring-boot:run
```

Server runs on `http://localhost:8080`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/` | GET | API info |
| `/api/users/nearby` | GET | Get nearby players |
| `/api/sports` | GET | List of sports |
| `/api/users/{id}` | GET | Get player by ID |
| `/api/health` | GET | Health check |

## Query Parameters for `/api/users/nearby`

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| lat | Double | required | Latitude |
| lng | Double | required | Longitude |
| radius | Double | 50 | Radius in km |
| sport | String | null | Filter by sport |
| limit | Integer | 100 | Max results |

## Configuration

Edit `src/main/resources/application.properties`:

```properties
stapubox.api.base-url=https://practise.stapubox.com
stapubox.api.endpoint=/sportfolio/getMapView
```

## Current Status

✅ **Using Real Stapubox API** - The service fetches real player data from the Stapubox API.

### API Endpoints Status

| Endpoint | Data Source |
|----------|-------------|
| `/api/users/nearby` | ✅ Real Stapubox API |
| `/api/users/viewport` | ✅ Real Stapubox API |
| `/api/sports` | Static list (API doesn't provide) |
| `/api/users/{id}` | ❌ Not supported (use deep links) |
