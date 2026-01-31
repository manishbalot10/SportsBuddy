# API Call Flow Documentation

## Overview
This document explains how data flows from the frontend to the Stapubox API and back.

## Architecture Flow

```
Frontend (React) → Java Backend → Stapubox API
     ↓                ↓                ↓
  Port 3000      Port 8080      External API
```

## Step-by-Step Flow

### 1. Frontend Request (React - App.tsx)
**Location**: `MAPs-main/App.tsx` (lines 38-76)

**What happens**:
- User interacts with filters (sport, distance, user type)
- React `useEffect` triggers when filters change
- Builds query parameters:
  ```javascript
  {
    lat: 28.57003694,        // User's latitude
    lng: 77.36745966,        // User's longitude  
    radius: 50,              // Search radius in km
    limit: 100,              // Max results
    sport: "Cricket",        // Optional sport filter
    role: "player"           // Optional: "player" or "coach"
  }
  ```
- Makes GET request to: `http://localhost:8080/api/users/nearby?lat=...&lng=...`

**Code**:
```javascript
const response = await fetch(`http://localhost:8080/api/users/nearby?${params.toString()}`);
const data = await response.json();
```

---

### 2. Backend Controller (Spring Boot)
**Location**: `java-backend/src/main/java/com/sportsbuddy/controller/PlayerController.java` (line 38-48)

**What happens**:
- Receives GET request at `/api/users/nearby`
- Extracts query parameters:
  - `lat`, `lng` (required)
  - `radius` (default: 50 km)
  - `sport` (optional)
  - `role` (optional: "player" or "coach")
  - `limit` (default: 100)
- Calls `stapuboxService.getNearbyPlayers()`

**Code**:
```java
@GetMapping("/users/nearby")
public ResponseEntity<NearbyPlayersResponse> getNearbyPlayers(
    @RequestParam Double lat,
    @RequestParam Double lng,
    @RequestParam(defaultValue = "50") Double radius,
    @RequestParam(required = false) String sport,
    @RequestParam(required = false) String role,
    @RequestParam(defaultValue = "100") Integer limit
) {
    NearbyPlayersResponse response = stapuboxService.getNearbyPlayers(...);
    return ResponseEntity.ok(response);
}
```

---

### 3. Backend Service (StapuboxService)
**Location**: `java-backend/src/main/java/com/sportsbuddy/service/StapuboxService.java` (line 101-190)

**What happens**:
- Maps parameters to Stapubox API format:
  - `radius` (km) → `search_radius` (meters) = radius × 1000
  - `role` → `profile_type` ("player" or "coach")
  - `limit` → `page_size`
- Builds POST request body:
  ```json
  {
    "playground": true,
    "work": false,
    "home": false,
    "profile_type": "player",
    "sports_id": [],
    "skill": ["beginner", "intermediate", "advanced", "professional"],
    "search_radius": 50000,
    "search_radius_min": 0,
    "search_radius_max": 100000,
    "page": 1,
    "page_size": 100,
    "format": "json",
    "location": {
      "type": "current",
      "lat": 28.57003694,
      "lng": 77.36745966,
      "city": "",
      "state": "",
      "country": "India"
    }
  }
  ```
- Makes POST request to: `https://practise.stapubox.com/sportfolio/getMapView`
- Logs request/response for debugging

**Code**:
```java
StapuboxMapViewRequest request = StapuboxMapViewRequest.builder()
    .playground(true)
    .profileType(profileType)
    .searchRadius(searchRadiusMeters)  // Converted from km to meters
    .pageSize(limit)
    .location(location)
    .build();

StapuboxMapViewResponse response = webClient.post()
    .uri(apiUrl)
    .header("Content-Type", "application/json")
    .bodyValue(request)
    .retrieve()
    .bodyToMono(StapuboxMapViewResponse.class)
    .block();
```

---

### 4. Stapubox API Response
**Endpoint**: `POST https://practise.stapubox.com/sportfolio/getMapView`

**Expected Response Format**:
```json
{
  "status": "success",
  "message": "Data retrieved successfully",
  "data": {
    "profiles": [
      {
        "id": 123,
        "name": "John Doe",
        "latitude": 28.57,
        "longitude": 77.36,
        "sport": "Cricket",
        "level": "intermediate",
        "role": "player",
        "avatar": "https://...",
        "city": "New Delhi",
        ...
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 100
  }
}
```

---

### 5. Response Processing (StapuboxService)
**Location**: `StapuboxService.java` (line 154-190)

**What happens**:
- Converts each profile from API response to `Player` object
- Calculates distance from user location
- Applies sport filter (if specified)
- Sorts by distance
- Returns `NearbyPlayersResponse`

**Code**:
```java
List<Player> nearbyPlayers = new ArrayList<>();
for (Map<String, Object> profile : response.getData().getProfiles()) {
    Player player = convertProfileToPlayer(profile, lat, lng);
    // Apply filters...
    nearbyPlayers.add(player);
}
// Sort by distance
nearbyPlayers.sort(Comparator.comparing(Player::getDistanceKm));
```

---

### 6. Backend Response to Frontend
**Response Format**:
```json
{
  "center": {
    "lat": 28.57003694,
    "lng": 77.36745966
  },
  "radiusKm": 50,
  "sportFilter": "Cricket",
  "users": [
    {
      "id": 123,
      "name": "John Doe",
      "sport": "Cricket",
      "level": "intermediate",
      "latitude": 28.57,
      "longitude": 77.36,
      "distanceKm": 2.5,
      "avatar": "https://...",
      ...
    }
  ],
  "count": 25
}
```

---

### 7. Frontend Display (React)
**Location**: `App.tsx` (line 63-66)

**What happens**:
- Receives JSON response
- Updates state: `setAllPlayers(data.users)`
- React re-renders map with new markers
- Displays players on map

---

## Viewport-Based Fetching (Alternative Flow)

For the scalable map view, there's a separate endpoint:

**Frontend**: `Map.tsx` → `http://localhost:8080/api/users/viewport?minLat=...&maxLat=...&minLng=...&maxLng=...&zoom=11`

**Backend**: `PlayerController.java` → `/api/users/viewport`
- Currently uses JSON file data (not real API)
- Returns clustered data for performance
- Used for map panning/zooming

---

## Testing the API Flow

### 1. Check Backend Logs
When you make a request, you should see:
```
=== Stapubox API Call ===
URL: https://practise.stapubox.com/sportfolio/getMapView
Request: {...}
Response Status: success
Response Message: ...
Profiles Count: 25
```

### 2. Test Endpoint Directly
```bash
curl "http://localhost:8080/api/users/nearby?lat=28.57003694&lng=77.36745966&radius=50&limit=10"
```

### 3. Check Browser Console
Open browser DevTools → Network tab
- Look for request to `http://localhost:8080/api/users/nearby`
- Check response status and data

### 4. Check Frontend Console
Open browser DevTools → Console
- Look for any error messages
- Check if `data.users` is populated

---

## Common Issues & Debugging

1. **No data returned**:
   - Check backend logs for API errors
   - Verify API endpoint is correct
   - Check if API response format matches expected structure

2. **CORS errors**:
   - Backend CORS config allows all origins
   - Check `CorsConfig.java`

3. **API timeout**:
   - Check network connectivity
   - Verify API endpoint is accessible
   - Check if API requires authentication

4. **Empty response**:
   - Check if location coordinates are valid
   - Verify search radius is reasonable
   - Check API response structure matches DTOs

---

## Configuration Files

- **Backend API URL**: `java-backend/src/main/resources/application.properties`
  ```
  stapubox.api.base-url=https://practise.stapubox.com
  stapubox.api.endpoint=/sportfolio/getMapView
  ```

- **Frontend API URL**: `MAPs-main/App.tsx` (line 59)
  ```javascript
  http://localhost:8080/api/users/nearby
  ```
