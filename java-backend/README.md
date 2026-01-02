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
# Replace with actual Stapubox API details
stapubox.api.base-url=https://api.stapubox.com/v1
stapubox.api.key=YOUR_API_KEY_HERE
```

## Current Status

⚠️ **Using Mock Data** - The service returns placeholder data until Stapubox API credentials are configured.
