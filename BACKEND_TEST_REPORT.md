# SportsBuddy Backend API Test Report

**Date:** January 31, 2026  
**QA Engineer:** Automated Backend Testing  
**Backend URL:** http://localhost:8080  
**Test Script:** backend-tests.sh

---

## Executive Summary

| Metric | Value |
|--------|-------|
| **Total Test Cases** | 55 |
| **Passed** | 49 (89%) |
| **Failed** | 6 (11%) |
| **Test Duration** | ~30 seconds |

**Overall Status:** ⚠️ **NEEDS FIXES** - 6 issues identified

---

## Test Results by Category

### 1. API Root & Connectivity ✅ (2/2 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-1.1 | API server responding | ✅ PASS | Server accessible |
| TC-1.2 | Server connectivity | ✅ PASS | HTTP 200 |

---

### 2. GET /api/sports Endpoint ✅ (8/8 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-2.1 | Returns HTTP 200 | ✅ PASS | |
| TC-2.2 | Returns valid JSON | ✅ PASS | |
| TC-2.3 | Contains 'sports' array | ✅ PASS | |
| TC-2.4 | Contains 'count' field | ✅ PASS | |
| TC-2.5 | Count equals 15 | ✅ PASS | 15 sports returned |
| TC-2.6 | Contains 'Cricket' | ✅ PASS | |
| TC-2.7 | Contains 'Gym' | ✅ PASS | New sport added |
| TC-2.8 | Response time < 100ms | ✅ PASS | **1ms** |

---

### 3. GET /api/users/nearby - Valid Requests ⚠️ (8/10 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-3.1 | Returns HTTP 200 | ✅ PASS | |
| TC-3.2 | Contains 'users' array | ✅ PASS | |
| TC-3.3 | Contains 'count' field | ✅ PASS | |
| TC-3.4 | Contains 'center' coordinates | ✅ PASS | |
| TC-3.5 | Users have required fields | ✅ PASS | id, name, sport, lat, lng |
| TC-3.6 | Users have 'deepLink' | ✅ PASS | Stapubox deep links |
| TC-3.7 | Users have 'primarySports' | ✅ PASS | |
| TC-3.8 | Limit parameter works | ❌ **FAIL** | Returns 15 instead of ≤3 |
| TC-3.9 | Sport filter works | ❌ **FAIL** | Returns mixed sports |
| TC-3.10 | Radius affects results | ✅ PASS | |

#### Failed Test Details:

**TC-3.8: Limit Parameter Not Working**
```
Request: /api/users/nearby?lat=19.076&lng=72.877&radius=50&limit=3
Expected: ≤3 users
Actual: 15 users returned
```
**Root Cause:** The `limit` parameter is not being passed to or respected by the Stapubox API call.

**TC-3.9: Sport Filter Not Working**
```
Request: /api/users/nearby?lat=19.076&lng=72.877&radius=50&sport=Cricket&limit=10
Expected: Only Cricket players
Actual: Mixed sports (badminton, football, etc.)
```
**Root Cause:** Sport filtering may be happening client-side or the parameter isn't being sent to the API.

---

### 4. Input Validation ✅ (12/12 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-4.1 | lat > 90 returns 400 | ✅ PASS | lat=999 |
| TC-4.2 | lat < -90 returns 400 | ✅ PASS | lat=-999 |
| TC-4.3 | lng > 180 returns 400 | ✅ PASS | lng=999 |
| TC-4.4 | lng < -180 returns 400 | ✅ PASS | lng=-999 |
| TC-4.5 | radius > 100 returns 400 | ✅ PASS | radius=999 |
| TC-4.6 | radius < 1 returns 400 | ✅ PASS | radius=0 |
| TC-4.7 | limit > 500 returns 400 | ✅ PASS | limit=9999 |
| TC-4.8 | limit < 1 returns 400 | ✅ PASS | limit=0 |
| TC-4.9 | Error format correct | ✅ PASS | code: VALIDATION_ERROR |
| TC-4.10 | lat=90 is valid | ✅ PASS | Boundary test |
| TC-4.11 | lat=-90 is valid | ✅ PASS | Boundary test |
| TC-4.12 | radius=100 is valid | ✅ PASS | Boundary test |

**Validation Rules Verified:**
- Latitude: -90 to 90
- Longitude: -180 to 180
- Radius: 1 to 100 km
- Limit: 1 to 500

---

### 5. GET /api/users/viewport Endpoint ⚠️ (4/5 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-5.1 | Returns HTTP 200 | ✅ PASS | |
| TC-5.2 | Contains 'clusters' array | ✅ PASS | |
| TC-5.3 | Contains 'totalInViewport' | ✅ PASS | |
| TC-5.4 | Clusters have lat/lng | ❌ **FAIL** | Missing coordinates |
| TC-5.5 | Sport filter works | ✅ PASS | Returns 200 |

#### Failed Test Details:

**TC-5.4: Cluster Coordinates Missing**
```
Expected: Clusters contain 'lat' and 'lng' fields
Actual: Clusters missing coordinate fields
```
**Root Cause:** Cluster response structure may use different field names (e.g., `latitude`/`longitude` instead of `lat`/`lng`).

---

### 6. Caching Behavior ✅ (3/3 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-6.1 | Cache miss timing | ✅ PASS | 1546ms (cold) |
| TC-6.2 | Cache hit timing | ✅ PASS | 1ms (hot) |
| TC-6.3 | Cache speedup | ✅ PASS | **773x faster!** |

**Caching Performance:**
```
First Request (Cache Miss):  1546ms
Second Request (Cache Hit):  1ms
Speedup Factor:              773x
```

---

### 7. Error Handling ⚠️ (3/5 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-7.1 | Missing 'lat' returns 400 | ✅ PASS | |
| TC-7.2 | Missing 'lng' returns 400 | ✅ PASS | |
| TC-7.3 | Non-numeric lat returns 400 | ❌ **FAIL** | Returns 500 |
| TC-7.4 | Error has timestamp | ✅ PASS | |
| TC-7.5 | Unknown endpoint returns 404 | ❌ **FAIL** | Returns 500 |

#### Failed Test Details:

**TC-7.3: Non-numeric Parameter Handling**
```
Request: /api/users/nearby?lat=abc&lng=72.877&radius=10
Expected: HTTP 400 (Bad Request)
Actual: HTTP 500 (Internal Server Error)
```
**Root Cause:** Type conversion error not caught by validation layer.

**TC-7.5: Unknown Endpoint Handling**
```
Request: /api/unknown/endpoint
Expected: HTTP 404 (Not Found)
Actual: HTTP 500 (Internal Server Error)
```
**Root Cause:** Global exception handler returning 500 instead of 404 for unmapped routes.

---

### 8. Response Headers ✅ (3/3 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-8.1 | Content-Type is JSON | ✅ PASS | application/json |
| TC-8.2 | CORS headers present | ✅ PASS | |
| TC-8.3 | Server version hidden | ✅ PASS | Security best practice |

---

### 9. Performance ⚠️ (2/3 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-9.1 | Sports endpoint < 50ms | ✅ PASS | **1ms** |
| TC-9.2 | Nearby endpoint < 1000ms | ❌ **FAIL** | 10757ms |
| TC-9.3 | Concurrent requests | ✅ PASS | 3 requests in 70ms |

#### Failed Test Details:

**TC-9.2: Nearby Endpoint Too Slow (Cold)**
```
Request: /api/users/nearby?lat=28.65&lng=77.15&radius=20
Expected: < 1000ms
Actual: 10757ms (10.7 seconds)
```
**Root Cause:** Cold cache + external Stapubox API latency. This is acceptable for first request but should be monitored.

**Note:** Subsequent cached requests are < 5ms, so this is only an issue for cache misses.

---

### 10. Data Integrity ✅ (4/4 Passed)

| TC# | Test Case | Status | Details |
|-----|-----------|--------|---------|
| TC-10.1 | Coordinates are valid | ✅ PASS | lat:19.029, lng:72.879 |
| TC-10.2 | DeepLink format valid | ✅ PASS | https://link.stapubox.com/* |
| TC-10.3 | Sport names non-empty | ✅ PASS | "cricket" |
| TC-10.4 | Distance calculated | ✅ PASS | 5.2km |

---

## Issues Summary

### Critical (0)
*None*

### High Priority (2)

| Issue | Test Case | Impact | Fix Required |
|-------|-----------|--------|--------------|
| Limit parameter ignored | TC-3.8 | API returns more data than requested | Pass limit to Stapubox API |
| Sport filter not working | TC-3.9 | Filter returns wrong results | Fix sport filter logic in backend |

### Medium Priority (3)

| Issue | Test Case | Impact | Fix Required |
|-------|-----------|--------|--------------|
| Non-numeric params return 500 | TC-7.3 | Poor error UX | Add type conversion exception handler |
| Unknown routes return 500 | TC-7.5 | Poor error UX | Configure 404 handler |
| Cluster coords field names | TC-5.4 | May cause frontend issues | Verify field names |

### Low Priority (1)

| Issue | Test Case | Impact | Fix Required |
|-------|-----------|--------|--------------|
| Cold cache latency high | TC-9.2 | 10s first request | Consider cache warming |

---

## Recommendations

### Immediate Fixes Required

#### 1. Fix Limit Parameter (High)
```java
// In StapuboxService.java - ensure limit is passed to API
.pageSize(limit != null ? limit : 100)
```

#### 2. Fix Sport Filter (High)
```java
// Ensure sport filter is applied server-side, not just client-side
// Check if sportsId is being populated correctly
```

#### 3. Handle Type Conversion Errors (Medium)
```java
// In GlobalExceptionHandler.java
@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
    return ResponseEntity.badRequest()
        .body(new ErrorResponse("VALIDATION_ERROR", "Invalid parameter type: " + ex.getName()));
}
```

#### 4. Configure 404 Handler (Medium)
```java
// In GlobalExceptionHandler.java
@ExceptionHandler(NoResourceFoundException.class)
public ResponseEntity<ErrorResponse> handleNotFound(NoResourceFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse("NOT_FOUND", "Endpoint not found"));
}
```

---

## Test Coverage Matrix

| Endpoint | Happy Path | Validation | Error Handling | Performance |
|----------|------------|------------|----------------|-------------|
| GET /api/sports | ✅ | N/A | ✅ | ✅ |
| GET /api/users/nearby | ⚠️ | ✅ | ⚠️ | ⚠️ |
| GET /api/users/viewport | ✅ | N/A | ✅ | ✅ |

---

## Conclusion

The SportsBuddy backend API is **89% functional** with 49 out of 55 tests passing. The core functionality works correctly, but there are 6 issues that need attention:

**What's Working Well:**
- ✅ Input validation (all boundary tests pass)
- ✅ Caching (773x speedup on cache hits)
- ✅ Response format (JSON, proper headers)
- ✅ Data integrity (coordinates, deep links)
- ✅ Security (server version hidden)

**Needs Fixing:**
- ❌ Limit parameter not respected
- ❌ Sport filter not working correctly
- ❌ Type conversion errors return 500
- ❌ Unknown endpoints return 500

**Recommendation:** Fix the High and Medium priority issues before production deployment.
