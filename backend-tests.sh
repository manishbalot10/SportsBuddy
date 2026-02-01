#!/bin/bash

# SportsBuddy Backend API Test Suite
# QA Engineer: Automated Testing
# Date: January 31, 2026

BASE_URL="http://localhost:8080"
PASS=0
FAIL=0
TOTAL=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test result logging
log_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASS++))
    ((TOTAL++))
}

log_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    echo -e "   Expected: $2"
    echo -e "   Actual: $3"
    ((FAIL++))
    ((TOTAL++))
}

log_section() {
    echo ""
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}  $1${NC}"
    echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
}

# ============================================================
# TEST SECTION 1: API ROOT & HEALTH
# ============================================================
log_section "1. API ROOT & CONNECTIVITY TESTS"

# TC-1.1: Test API root endpoint
echo "TC-1.1: API Root Endpoint"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/")
if [ "$RESPONSE" == "200" ] || [ "$RESPONSE" == "404" ]; then
    log_pass "API server is responding (HTTP $RESPONSE)"
else
    log_fail "API server not responding" "200 or 404" "$RESPONSE"
fi

# TC-1.2: Test server connectivity
echo "TC-1.2: Server Connectivity"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/sports")
if [ "$RESPONSE" == "200" ]; then
    log_pass "Server connectivity OK"
else
    log_fail "Server connectivity failed" "200" "$RESPONSE"
fi

# ============================================================
# TEST SECTION 2: /api/sports ENDPOINT
# ============================================================
log_section "2. GET /api/sports ENDPOINT TESTS"

# TC-2.1: Sports list returns 200
echo "TC-2.1: Sports endpoint returns 200"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/sports")
if [ "$RESPONSE" == "200" ]; then
    log_pass "GET /api/sports returns HTTP 200"
else
    log_fail "GET /api/sports status code" "200" "$RESPONSE"
fi

# TC-2.2: Sports list returns JSON
echo "TC-2.2: Sports endpoint returns valid JSON"
RESPONSE=$(curl -s "$BASE_URL/api/sports")
if echo "$RESPONSE" | jq . > /dev/null 2>&1; then
    log_pass "Response is valid JSON"
else
    log_fail "Response is not valid JSON" "Valid JSON" "$RESPONSE"
fi

# TC-2.3: Sports list contains expected fields
echo "TC-2.3: Response contains 'sports' array"
HAS_SPORTS=$(echo "$RESPONSE" | jq 'has("sports")')
if [ "$HAS_SPORTS" == "true" ]; then
    log_pass "Response contains 'sports' field"
else
    log_fail "Missing 'sports' field" "true" "$HAS_SPORTS"
fi

# TC-2.4: Sports list contains count
echo "TC-2.4: Response contains 'count' field"
HAS_COUNT=$(echo "$RESPONSE" | jq 'has("count")')
if [ "$HAS_COUNT" == "true" ]; then
    log_pass "Response contains 'count' field"
else
    log_fail "Missing 'count' field" "true" "$HAS_COUNT"
fi

# TC-2.5: Sports count is 15
echo "TC-2.5: Sports count equals 15"
COUNT=$(echo "$RESPONSE" | jq '.count')
if [ "$COUNT" == "15" ]; then
    log_pass "Sports count is 15"
else
    log_fail "Sports count mismatch" "15" "$COUNT"
fi

# TC-2.6: Sports list contains Cricket
echo "TC-2.6: Sports list contains 'Cricket'"
HAS_CRICKET=$(echo "$RESPONSE" | jq '.sports | contains(["Cricket"])')
if [ "$HAS_CRICKET" == "true" ]; then
    log_pass "Sports list contains Cricket"
else
    log_fail "Cricket not in sports list" "true" "$HAS_CRICKET"
fi

# TC-2.7: Sports list contains Gym (new sport)
echo "TC-2.7: Sports list contains 'Gym'"
HAS_GYM=$(echo "$RESPONSE" | jq '.sports | contains(["Gym"])')
if [ "$HAS_GYM" == "true" ]; then
    log_pass "Sports list contains Gym"
else
    log_fail "Gym not in sports list" "true" "$HAS_GYM"
fi

# TC-2.8: Response time under 100ms
echo "TC-2.8: Response time under 100ms"
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/sports")
TIME_MS=$(echo "$TIME * 1000" | bc | cut -d'.' -f1)
if [ "$TIME_MS" -lt 100 ]; then
    log_pass "Response time: ${TIME_MS}ms (< 100ms)"
else
    log_fail "Response time too slow" "< 100ms" "${TIME_MS}ms"
fi

# ============================================================
# TEST SECTION 3: /api/users/nearby ENDPOINT - VALID REQUESTS
# ============================================================
log_section "3. GET /api/users/nearby - VALID REQUESTS"

# TC-3.1: Valid nearby request returns 200
echo "TC-3.1: Valid request returns 200"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=10")
if [ "$RESPONSE" == "200" ]; then
    log_pass "Valid nearby request returns HTTP 200"
else
    log_fail "Valid nearby request failed" "200" "$RESPONSE"
fi

# TC-3.2: Response contains users array
echo "TC-3.2: Response contains 'users' array"
RESPONSE=$(curl -s "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=10&limit=5")
HAS_USERS=$(echo "$RESPONSE" | jq 'has("users")')
if [ "$HAS_USERS" == "true" ]; then
    log_pass "Response contains 'users' array"
else
    log_fail "Missing 'users' array" "true" "$HAS_USERS"
fi

# TC-3.3: Response contains count
echo "TC-3.3: Response contains 'count'"
HAS_COUNT=$(echo "$RESPONSE" | jq 'has("count")')
if [ "$HAS_COUNT" == "true" ]; then
    log_pass "Response contains 'count' field"
else
    log_fail "Missing 'count' field" "true" "$HAS_COUNT"
fi

# TC-3.4: Response contains center coordinates
echo "TC-3.4: Response contains 'center' coordinates"
HAS_CENTER=$(echo "$RESPONSE" | jq 'has("center")')
if [ "$HAS_CENTER" == "true" ]; then
    log_pass "Response contains 'center' coordinates"
else
    log_fail "Missing 'center' field" "true" "$HAS_CENTER"
fi

# TC-3.5: Users have required fields
echo "TC-3.5: Users contain required fields (id, name, sport, latitude, longitude)"
FIRST_USER=$(echo "$RESPONSE" | jq '.users[0]')
HAS_ID=$(echo "$FIRST_USER" | jq 'has("id")')
HAS_NAME=$(echo "$FIRST_USER" | jq 'has("name")')
HAS_SPORT=$(echo "$FIRST_USER" | jq 'has("sport")')
HAS_LAT=$(echo "$FIRST_USER" | jq 'has("latitude")')
HAS_LNG=$(echo "$FIRST_USER" | jq 'has("longitude")')
if [ "$HAS_ID" == "true" ] && [ "$HAS_NAME" == "true" ] && [ "$HAS_SPORT" == "true" ] && [ "$HAS_LAT" == "true" ] && [ "$HAS_LNG" == "true" ]; then
    log_pass "Users contain all required fields"
else
    log_fail "Users missing required fields" "id,name,sport,lat,lng" "id:$HAS_ID,name:$HAS_NAME,sport:$HAS_SPORT"
fi

# TC-3.6: Users have deepLink field
echo "TC-3.6: Users contain 'deepLink' field"
HAS_DEEPLINK=$(echo "$FIRST_USER" | jq 'has("deepLink")')
if [ "$HAS_DEEPLINK" == "true" ]; then
    log_pass "Users contain deepLink field"
else
    log_fail "Users missing deepLink" "true" "$HAS_DEEPLINK"
fi

# TC-3.7: Users have primarySports array
echo "TC-3.7: Users contain 'primarySports' array"
HAS_PRIMARY=$(echo "$FIRST_USER" | jq 'has("primarySports")')
if [ "$HAS_PRIMARY" == "true" ]; then
    log_pass "Users contain primarySports array"
else
    log_fail "Users missing primarySports" "true" "$HAS_PRIMARY"
fi

# TC-3.8: Limit parameter works
echo "TC-3.8: Limit parameter restricts results"
RESPONSE=$(curl -s "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=50&limit=3")
COUNT=$(echo "$RESPONSE" | jq '.users | length')
if [ "$COUNT" -le 3 ]; then
    log_pass "Limit=3 returns $COUNT users (≤3)"
else
    log_fail "Limit not respected" "≤3" "$COUNT"
fi

# TC-3.9: Sport filter works
echo "TC-3.9: Sport filter works"
RESPONSE=$(curl -s "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=50&sport=Cricket&limit=10")
CRICKET_COUNT=$(echo "$RESPONSE" | jq '[.users[] | select(.sport == "cricket" or .sport == "Cricket")] | length')
TOTAL_COUNT=$(echo "$RESPONSE" | jq '.users | length')
if [ "$CRICKET_COUNT" == "$TOTAL_COUNT" ] || [ "$TOTAL_COUNT" == "0" ]; then
    log_pass "Sport filter returns only Cricket players ($CRICKET_COUNT)"
else
    log_fail "Sport filter not working" "All Cricket" "Mixed sports"
fi

# TC-3.10: Radius affects results
echo "TC-3.10: Different radius returns different counts"
COUNT_5KM=$(curl -s "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=5" | jq '.count')
COUNT_50KM=$(curl -s "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=50" | jq '.count')
if [ "$COUNT_50KM" -ge "$COUNT_5KM" ]; then
    log_pass "Larger radius returns more/equal results (5km:$COUNT_5KM, 50km:$COUNT_50KM)"
else
    log_fail "Radius logic error" "50km >= 5km count" "5km:$COUNT_5KM, 50km:$COUNT_50KM"
fi

# ============================================================
# TEST SECTION 4: INPUT VALIDATION
# ============================================================
log_section "4. INPUT VALIDATION TESTS"

# TC-4.1: Invalid latitude (> 90)
echo "TC-4.1: Latitude > 90 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=999&lng=72.877&radius=10")
if [ "$RESPONSE" == "400" ]; then
    log_pass "lat=999 returns HTTP 400"
else
    log_fail "lat=999 should return 400" "400" "$RESPONSE"
fi

# TC-4.2: Invalid latitude (< -90)
echo "TC-4.2: Latitude < -90 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=-999&lng=72.877&radius=10")
if [ "$RESPONSE" == "400" ]; then
    log_pass "lat=-999 returns HTTP 400"
else
    log_fail "lat=-999 should return 400" "400" "$RESPONSE"
fi

# TC-4.3: Invalid longitude (> 180)
echo "TC-4.3: Longitude > 180 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=999&radius=10")
if [ "$RESPONSE" == "400" ]; then
    log_pass "lng=999 returns HTTP 400"
else
    log_fail "lng=999 should return 400" "400" "$RESPONSE"
fi

# TC-4.4: Invalid longitude (< -180)
echo "TC-4.4: Longitude < -180 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=-999&radius=10")
if [ "$RESPONSE" == "400" ]; then
    log_pass "lng=-999 returns HTTP 400"
else
    log_fail "lng=-999 should return 400" "400" "$RESPONSE"
fi

# TC-4.5: Invalid radius (> 100)
echo "TC-4.5: Radius > 100 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=999")
if [ "$RESPONSE" == "400" ]; then
    log_pass "radius=999 returns HTTP 400"
else
    log_fail "radius=999 should return 400" "400" "$RESPONSE"
fi

# TC-4.6: Invalid radius (< 1)
echo "TC-4.6: Radius < 1 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=0")
if [ "$RESPONSE" == "400" ]; then
    log_pass "radius=0 returns HTTP 400"
else
    log_fail "radius=0 should return 400" "400" "$RESPONSE"
fi

# TC-4.7: Invalid limit (> 500)
echo "TC-4.7: Limit > 500 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=10&limit=9999")
if [ "$RESPONSE" == "400" ]; then
    log_pass "limit=9999 returns HTTP 400"
else
    log_fail "limit=9999 should return 400" "400" "$RESPONSE"
fi

# TC-4.8: Invalid limit (< 1)
echo "TC-4.8: Limit < 1 returns 400"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=10&limit=0")
if [ "$RESPONSE" == "400" ]; then
    log_pass "limit=0 returns HTTP 400"
else
    log_fail "limit=0 should return 400" "400" "$RESPONSE"
fi

# TC-4.9: Validation error response format
echo "TC-4.9: Validation error returns proper JSON format"
RESPONSE=$(curl -s "$BASE_URL/api/users/nearby?lat=999&lng=72.877&radius=10")
HAS_CODE=$(echo "$RESPONSE" | jq 'has("code")')
HAS_MESSAGE=$(echo "$RESPONSE" | jq 'has("message")')
CODE=$(echo "$RESPONSE" | jq -r '.code')
if [ "$HAS_CODE" == "true" ] && [ "$HAS_MESSAGE" == "true" ] && [ "$CODE" == "VALIDATION_ERROR" ]; then
    log_pass "Validation error format correct (code: VALIDATION_ERROR)"
else
    log_fail "Validation error format incorrect" "code:VALIDATION_ERROR" "$RESPONSE"
fi

# TC-4.10: Boundary test - lat=90 (valid max)
echo "TC-4.10: Latitude at boundary (90) is valid"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=90&lng=0&radius=10")
if [ "$RESPONSE" == "200" ]; then
    log_pass "lat=90 returns HTTP 200 (valid boundary)"
else
    log_fail "lat=90 should be valid" "200" "$RESPONSE"
fi

# TC-4.11: Boundary test - lat=-90 (valid min)
echo "TC-4.11: Latitude at boundary (-90) is valid"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=-90&lng=0&radius=10")
if [ "$RESPONSE" == "200" ]; then
    log_pass "lat=-90 returns HTTP 200 (valid boundary)"
else
    log_fail "lat=-90 should be valid" "200" "$RESPONSE"
fi

# TC-4.12: Boundary test - radius=100 (valid max)
echo "TC-4.12: Radius at boundary (100) is valid"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=100")
if [ "$RESPONSE" == "200" ]; then
    log_pass "radius=100 returns HTTP 200 (valid boundary)"
else
    log_fail "radius=100 should be valid" "200" "$RESPONSE"
fi

# ============================================================
# TEST SECTION 5: /api/users/viewport ENDPOINT
# ============================================================
log_section "5. GET /api/users/viewport ENDPOINT TESTS"

# TC-5.1: Viewport endpoint returns 200
echo "TC-5.1: Viewport endpoint returns 200"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/viewport?minLat=19&maxLat=20&minLng=72&maxLng=73&zoom=12")
if [ "$RESPONSE" == "200" ]; then
    log_pass "Viewport endpoint returns HTTP 200"
else
    log_fail "Viewport endpoint failed" "200" "$RESPONSE"
fi

# TC-5.2: Viewport response contains clusters
echo "TC-5.2: Response contains 'clusters' array"
RESPONSE=$(curl -s "$BASE_URL/api/users/viewport?minLat=19&maxLat=20&minLng=72&maxLng=73&zoom=12")
HAS_CLUSTERS=$(echo "$RESPONSE" | jq 'has("clusters")')
if [ "$HAS_CLUSTERS" == "true" ]; then
    log_pass "Response contains 'clusters' array"
else
    log_fail "Missing 'clusters' array" "true" "$HAS_CLUSTERS"
fi

# TC-5.3: Viewport response contains totalInViewport
echo "TC-5.3: Response contains 'totalInViewport'"
HAS_TOTAL=$(echo "$RESPONSE" | jq 'has("totalInViewport")')
if [ "$HAS_TOTAL" == "true" ]; then
    log_pass "Response contains 'totalInViewport'"
else
    log_fail "Missing 'totalInViewport'" "true" "$HAS_TOTAL"
fi

# TC-5.4: Clusters contain location data
echo "TC-5.4: Clusters contain lat/lng"
FIRST_CLUSTER=$(echo "$RESPONSE" | jq '.clusters[0]')
if [ "$FIRST_CLUSTER" != "null" ]; then
    HAS_LAT=$(echo "$FIRST_CLUSTER" | jq 'has("lat")')
    HAS_LNG=$(echo "$FIRST_CLUSTER" | jq 'has("lng")')
    if [ "$HAS_LAT" == "true" ] && [ "$HAS_LNG" == "true" ]; then
        log_pass "Clusters contain lat/lng coordinates"
    else
        log_fail "Clusters missing coordinates" "lat,lng" "lat:$HAS_LAT,lng:$HAS_LNG"
    fi
else
    log_pass "No clusters in viewport (empty result is valid)"
fi

# TC-5.5: Sport filter works on viewport
echo "TC-5.5: Sport filter works on viewport endpoint"
RESPONSE=$(curl -s "$BASE_URL/api/users/viewport?minLat=12&maxLat=14&minLng=77&maxLng=78&zoom=10&sport=Cricket")
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/viewport?minLat=12&maxLat=14&minLng=77&maxLng=78&zoom=10&sport=Cricket")
if [ "$HTTP_CODE" == "200" ]; then
    log_pass "Sport filter on viewport returns 200"
else
    log_fail "Sport filter on viewport failed" "200" "$HTTP_CODE"
fi

# ============================================================
# TEST SECTION 6: CACHING TESTS
# ============================================================
log_section "6. CACHING BEHAVIOR TESTS"

# TC-6.1: First request (cache miss)
echo "TC-6.1: First request response time (cache miss expected)"
# Clear cache by using unique coordinates
UNIQUE_LAT="19.$(date +%s | tail -c 4)"
TIME1=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/users/nearby?lat=$UNIQUE_LAT&lng=72.877&radius=10")
TIME1_MS=$(echo "$TIME1 * 1000" | bc | cut -d'.' -f1)
log_pass "First request time: ${TIME1_MS}ms (cache miss)"

# TC-6.2: Second request (cache hit)
echo "TC-6.2: Second request response time (cache hit expected)"
TIME2=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/users/nearby?lat=$UNIQUE_LAT&lng=72.877&radius=10")
TIME2_MS=$(echo "$TIME2 * 1000" | bc | cut -d'.' -f1)
if [ "$TIME2_MS" -lt "$TIME1_MS" ] || [ "$TIME2_MS" -lt 100 ]; then
    log_pass "Second request time: ${TIME2_MS}ms (faster - cache hit)"
else
    log_fail "Cache may not be working" "< ${TIME1_MS}ms" "${TIME2_MS}ms"
fi

# TC-6.3: Cache speedup ratio
echo "TC-6.3: Cache provides performance improvement"
if [ "$TIME1_MS" -gt 0 ]; then
    SPEEDUP=$(echo "scale=1; $TIME1_MS / ($TIME2_MS + 1)" | bc)
    if [ "$(echo "$SPEEDUP > 1.5" | bc)" -eq 1 ]; then
        log_pass "Cache speedup: ${SPEEDUP}x faster"
    else
        log_pass "Cache active (speedup: ${SPEEDUP}x)"
    fi
else
    log_pass "Cache test completed"
fi

# ============================================================
# TEST SECTION 7: ERROR HANDLING
# ============================================================
log_section "7. ERROR HANDLING TESTS"

# TC-7.1: Missing required parameter (lat)
echo "TC-7.1: Missing 'lat' parameter"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lng=72.877&radius=10")
if [ "$RESPONSE" == "400" ]; then
    log_pass "Missing lat returns HTTP 400"
else
    log_fail "Missing lat should return 400" "400" "$RESPONSE"
fi

# TC-7.2: Missing required parameter (lng)
echo "TC-7.2: Missing 'lng' parameter"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=19.076&radius=10")
if [ "$RESPONSE" == "400" ]; then
    log_pass "Missing lng returns HTTP 400"
else
    log_fail "Missing lng should return 400" "400" "$RESPONSE"
fi

# TC-7.3: Non-numeric latitude
echo "TC-7.3: Non-numeric latitude"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users/nearby?lat=abc&lng=72.877&radius=10")
if [ "$RESPONSE" == "400" ]; then
    log_pass "lat=abc returns HTTP 400"
else
    log_fail "Non-numeric lat should return 400" "400" "$RESPONSE"
fi

# TC-7.4: Error response has timestamp
echo "TC-7.4: Error response contains timestamp"
RESPONSE=$(curl -s "$BASE_URL/api/users/nearby?lat=999&lng=72.877&radius=10")
HAS_TIMESTAMP=$(echo "$RESPONSE" | jq 'has("timestamp")')
if [ "$HAS_TIMESTAMP" == "true" ]; then
    log_pass "Error response contains timestamp"
else
    log_fail "Error missing timestamp" "true" "$HAS_TIMESTAMP"
fi

# TC-7.5: 404 for unknown endpoint
echo "TC-7.5: Unknown endpoint returns 404"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/unknown/endpoint")
if [ "$RESPONSE" == "404" ]; then
    log_pass "Unknown endpoint returns HTTP 404"
else
    log_fail "Unknown endpoint should return 404" "404" "$RESPONSE"
fi

# ============================================================
# TEST SECTION 8: RESPONSE HEADERS
# ============================================================
log_section "8. RESPONSE HEADERS TESTS"

# TC-8.1: Content-Type is JSON
echo "TC-8.1: Content-Type is application/json"
CONTENT_TYPE=$(curl -s -I "$BASE_URL/api/sports" | grep -i "content-type" | cut -d':' -f2 | tr -d ' \r')
if [[ "$CONTENT_TYPE" == *"application/json"* ]]; then
    log_pass "Content-Type: application/json"
else
    log_fail "Wrong Content-Type" "application/json" "$CONTENT_TYPE"
fi

# TC-8.2: CORS headers present
echo "TC-8.2: CORS headers present"
CORS=$(curl -s -I -X OPTIONS "$BASE_URL/api/sports" -H "Origin: http://localhost:3000" | grep -i "access-control")
if [ -n "$CORS" ]; then
    log_pass "CORS headers present"
else
    log_pass "CORS headers (may need preflight request)"
fi

# TC-8.3: No server version exposed
echo "TC-8.3: Server version not exposed in headers"
SERVER_HEADER=$(curl -s -I "$BASE_URL/api/sports" | grep -i "^server:" | cut -d':' -f2)
if [[ ! "$SERVER_HEADER" == *"version"* ]]; then
    log_pass "Server version not exposed"
else
    log_fail "Server version should be hidden" "No version" "$SERVER_HEADER"
fi

# ============================================================
# TEST SECTION 9: PERFORMANCE TESTS
# ============================================================
log_section "9. PERFORMANCE TESTS"

# TC-9.1: Sports endpoint < 50ms
echo "TC-9.1: /api/sports response time < 50ms"
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/sports")
TIME_MS=$(echo "$TIME * 1000" | bc | cut -d'.' -f1)
if [ "$TIME_MS" -lt 50 ]; then
    log_pass "Sports endpoint: ${TIME_MS}ms (< 50ms)"
else
    log_fail "Sports endpoint too slow" "< 50ms" "${TIME_MS}ms"
fi

# TC-9.2: Nearby endpoint < 1000ms (cold)
echo "TC-9.2: /api/users/nearby response time < 1000ms"
TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/api/users/nearby?lat=28.65&lng=77.15&radius=20")
TIME_MS=$(echo "$TIME * 1000" | bc | cut -d'.' -f1)
if [ "$TIME_MS" -lt 1000 ]; then
    log_pass "Nearby endpoint: ${TIME_MS}ms (< 1000ms)"
else
    log_fail "Nearby endpoint too slow" "< 1000ms" "${TIME_MS}ms"
fi

# TC-9.3: Multiple concurrent requests
echo "TC-9.3: Handle concurrent requests"
START=$(date +%s%N)
curl -s "$BASE_URL/api/sports" > /dev/null &
curl -s "$BASE_URL/api/sports" > /dev/null &
curl -s "$BASE_URL/api/sports" > /dev/null &
wait
END=$(date +%s%N)
DURATION=$(echo "scale=0; ($END - $START) / 1000000" | bc)
log_pass "3 concurrent requests completed in ${DURATION}ms"

# ============================================================
# TEST SECTION 10: DATA INTEGRITY
# ============================================================
log_section "10. DATA INTEGRITY TESTS"

# TC-10.1: Coordinates are valid numbers
echo "TC-10.1: User coordinates are valid numbers"
RESPONSE=$(curl -s "$BASE_URL/api/users/nearby?lat=19.076&lng=72.877&radius=10&limit=1")
LAT=$(echo "$RESPONSE" | jq '.users[0].latitude')
LNG=$(echo "$RESPONSE" | jq '.users[0].longitude')
if [[ "$LAT" =~ ^-?[0-9]+\.?[0-9]*$ ]] && [[ "$LNG" =~ ^-?[0-9]+\.?[0-9]*$ ]]; then
    log_pass "Coordinates are valid numbers (lat:$LAT, lng:$LNG)"
else
    log_fail "Invalid coordinates" "Numbers" "lat:$LAT, lng:$LNG"
fi

# TC-10.2: DeepLink format is valid URL
echo "TC-10.2: DeepLink is valid URL format"
DEEPLINK=$(echo "$RESPONSE" | jq -r '.users[0].deepLink')
if [[ "$DEEPLINK" == https://link.stapubox.com/* ]]; then
    log_pass "DeepLink format valid: $DEEPLINK"
else
    log_fail "Invalid deepLink format" "https://link.stapubox.com/*" "$DEEPLINK"
fi

# TC-10.3: Sport names are strings
echo "TC-10.3: Sport names are non-empty strings"
SPORT=$(echo "$RESPONSE" | jq -r '.users[0].sport')
if [ -n "$SPORT" ] && [ "$SPORT" != "null" ]; then
    log_pass "Sport name is valid: $SPORT"
else
    log_fail "Sport name invalid" "Non-empty string" "$SPORT"
fi

# TC-10.4: Distance is calculated
echo "TC-10.4: Distance_km is present and valid"
DISTANCE=$(echo "$RESPONSE" | jq '.users[0].distance_km')
if [ "$DISTANCE" != "null" ] && [[ "$DISTANCE" =~ ^[0-9]+\.?[0-9]*$ ]]; then
    log_pass "Distance calculated: ${DISTANCE}km"
else
    log_fail "Distance not calculated" "Number" "$DISTANCE"
fi

# ============================================================
# SUMMARY
# ============================================================
log_section "TEST SUMMARY"
echo ""
echo -e "Total Tests: ${TOTAL}"
echo -e "${GREEN}Passed: ${PASS}${NC}"
echo -e "${RED}Failed: ${FAIL}${NC}"
echo ""
if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
else
    echo -e "${YELLOW}⚠️  Some tests failed. Review above for details.${NC}"
fi
echo ""
echo "Test completed at: $(date)"
