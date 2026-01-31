# Testing Guide - API Call Flow

## Quick Start

### 1. Start Backend Server
```bash
cd java-backend
./mvnw spring-boot:run
```
**Expected**: Server starts on `http://localhost:8080`
**Check**: Look for "Tomcat started on port 8080" in logs

### 2. Start Frontend Server
```bash
cd MAPs-main
npm run dev
```
**Expected**: Server starts on `http://localhost:3000`
**Check**: Look for "Local: http://localhost:3000/" in terminal

---

## Testing the API Flow

### Step 1: Test Backend Health
Open browser or use curl:
```
http://localhost:8080/api/health
```
**Expected Response**:
```json
{"status": "healthy"}
```

### Step 2: Test Backend API Endpoint
Test the `/api/users/nearby` endpoint directly:
```
http://localhost:8080/api/users/nearby?lat=28.57003694&lng=77.36745966&radius=50&limit=10
```

**What to check**:
- ✅ Response status is 200
- ✅ Response contains `users` array
- ✅ Backend logs show "=== Stapubox API Call ==="
- ✅ Backend logs show API request/response details

### Step 3: Test Frontend
1. Open browser: `http://localhost:3000`
2. Open DevTools (F12 or Cmd+Option+I)
3. Go to **Network** tab
4. Filter by "nearby" or "api"
5. Interact with filters (change sport, distance, etc.)

**What to check**:
- ✅ Network tab shows request to `http://localhost:8080/api/users/nearby`
- ✅ Request has query parameters (lat, lng, radius, etc.)
- ✅ Response status is 200
- ✅ Response contains `users` array with player data
- ✅ Map displays markers for players

### Step 4: Check Backend Logs
Look for these log messages in backend terminal:

```
=== Stapubox API Call ===
URL: https://practise.stapubox.com/sportfolio/getMapView
Request: {"playground":true,"work":false,"home":false,...}
Response Status: success
Response Message: ...
Profiles Count: 25
```

---

## Understanding the API Call Flow

### Frontend → Backend Request
**URL**: `http://localhost:8080/api/users/nearby`
**Method**: GET
**Parameters**:
- `lat` - Latitude (required)
- `lng` - Longitude (required)
- `radius` - Search radius in km (default: 50)
- `sport` - Sport filter (optional, e.g., "Cricket")
- `role` - User type (optional: "player" or "coach")
- `limit` - Max results (default: 100)

**Example**:
```
http://localhost:8080/api/users/nearby?lat=28.57&lng=77.36&radius=50&sport=Cricket&role=player&limit=20
```

### Backend → Stapubox API Request
**URL**: `https://practise.stapubox.com/sportfolio/getMapView`
**Method**: POST
**Headers**: `Content-Type: application/json`
**Body**:
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

**Key Mappings**:
- `radius` (km) → `search_radius` (meters) = radius × 1000
- `role` → `profile_type` ("player" or "coach")
- `limit` → `page_size`

### Stapubox API → Backend Response
**Expected Format**:
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
        "city": "New Delhi"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 100
  }
}
```

### Backend → Frontend Response
**Format**:
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
      "city": "New Delhi",
      "role": "player"
    }
  ],
  "count": 25
}
```

---

## Debugging Checklist

### ✅ Backend Issues
- [ ] Backend server is running (`http://localhost:8080/api/health`)
- [ ] Backend logs show API call attempts
- [ ] No errors in backend console
- [ ] CORS is configured correctly

### ✅ API Issues
- [ ] Stapubox API endpoint is accessible
- [ ] API request format matches expected structure
- [ ] API response format matches DTOs
- [ ] Check backend logs for API errors

### ✅ Frontend Issues
- [ ] Frontend server is running (`http://localhost:3000`)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Response data is being processed correctly

### ✅ Data Issues
- [ ] API returns profiles in response
- [ ] Profile data is converted to Player objects
- [ ] Distance calculations are correct
- [ ] Filters are applied correctly

---

## Common Errors & Solutions

### 1. "Failed to fetch players"
**Cause**: Backend not running or CORS issue
**Solution**: 
- Check backend is running on port 8080
- Check browser console for CORS errors
- Verify CORS config in `CorsConfig.java`

### 2. "API returned null or empty response"
**Cause**: Stapubox API returned empty data or error
**Solution**:
- Check backend logs for API response
- Verify API endpoint URL is correct
- Check if API requires authentication
- Verify request format matches API expectations

### 3. "No players displayed on map"
**Cause**: Data conversion issue or empty response
**Solution**:
- Check backend logs for "Profiles Count"
- Verify `convertProfileToPlayer()` is working
- Check if API response structure matches DTOs
- Verify frontend is receiving `data.users` array

### 4. CORS Error
**Cause**: Frontend origin not allowed
**Solution**:
- Check `CorsConfig.java` allows all origins (it does)
- Verify frontend URL matches allowed origins
- Check browser console for specific CORS error

---

## Testing Commands

### Test Backend Health
```bash
curl http://localhost:8080/api/health
```

### Test Backend API
```bash
curl "http://localhost:8080/api/users/nearby?lat=28.57003694&lng=77.36745966&radius=50&limit=10"
```

### Test with Filters
```bash
curl "http://localhost:8080/api/users/nearby?lat=28.57&lng=77.36&radius=50&sport=Cricket&role=player&limit=20"
```

### Check Server Status
```bash
# Check backend
lsof -ti:8080 && echo "Backend running" || echo "Backend NOT running"

# Check frontend
lsof -ti:3000 && echo "Frontend running" || echo "Frontend NOT running"
```

---

## Next Steps

1. **Open Browser**: `http://localhost:3000`
2. **Open DevTools**: Network tab
3. **Interact with Filters**: Change sport, distance, user type
4. **Watch Network Tab**: See API calls being made
5. **Check Backend Logs**: See API request/response details
6. **Verify Map**: Players should appear on map

For detailed API flow documentation, see `API_CALL_FLOW.md`
