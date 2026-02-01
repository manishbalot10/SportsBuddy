package com.sportsbuddy.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsbuddy.model.Player;
import com.sportsbuddy.model.NearbyPlayersResponse;
import com.sportsbuddy.model.StapuboxMapViewRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;

@Slf4j
@Service
public class StapuboxService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${stapubox.api.base-url}")
    private String stapuboxBaseUrl;

    @Value("${stapubox.api.endpoint}")
    private String apiEndpoint;

    public StapuboxService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }

    /**
     * Fetch nearby players from Stapubox API with caching and circuit breaker
     */
    @Cacheable(value = "nearbyPlayers", key = "T(String).format('%s_%s_%s_%s_%s', #lat, #lng, #radius, #sport ?: 'all', #limit ?: 100)")
    @CircuitBreaker(name = "stapubox", fallbackMethod = "fallbackNearbyPlayers")
    @Retry(name = "stapubox")
    public NearbyPlayersResponse getNearbyPlayers(Double lat, Double lng, Double radius, String sport, String role, Integer limit) {
        log.info("getNearbyPlayers called: lat={}, lng={}, radius={}, sport={}, limit={}", lat, lng, radius, sport, limit);
        try {
            // Build request
            StapuboxMapViewRequest.LocationData location = StapuboxMapViewRequest.LocationData.builder()
                    .type("current")
                    .lat(lat)
                    .lng(lng)
                    .city("") // Can be extracted from reverse geocoding if needed
                    .state("")
                    .country("India")
                    .build();

            // Map role to profile_type
            String profileType = null;
            if (role != null && !role.isEmpty()) {
                profileType = role.equalsIgnoreCase("coach") ? "coach" : "player";
            }

            // Convert radius from km to meters
            Integer searchRadiusMeters = (int) (radius * 1000);

            StapuboxMapViewRequest request = StapuboxMapViewRequest.builder()
                    .playground(true)
                    .work(false)
                    .home(false)
                    .profileType(profileType)
                    .sportsId(List.of()) // TODO: Map sport name to sports_id if needed
                    .skill(List.of("beginner", "intermediate", "advanced", "professional"))
                    .searchRadius(searchRadiusMeters)
                    .searchRadiusMin(0)
                    .searchRadiusMax(100000)
                    .page(1)
                    .pageSize(limit != null ? limit : 100)
                    .format("json")
                    .location(location)
                    .build();

            // Make API call
            String apiUrl = stapuboxBaseUrl + apiEndpoint;
            
            log.debug("Calling Stapubox API: {}", apiUrl);
            
            // Try to get raw response first to see structure
            String rawResponse;
            try {
                rawResponse = webClient.post()
                        .uri(apiUrl)
                        .header("Content-Type", "application/json")
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();
                
                log.debug("API response received, length: {}", rawResponse != null ? rawResponse.length() : 0);
            } catch (Exception e) {
                log.error("Error calling Stapubox API: {}", e.getMessage());
                throw new RuntimeException("Stapubox API call failed", e);
            }

            // Parse response - API might return array directly or wrapped object
            List<Map<String, Object>> profiles = new ArrayList<>();
            try {
                if (rawResponse != null) {
                    Object parsed = objectMapper.readValue(rawResponse, Object.class);
                    
                    if (parsed instanceof List) {
                        // API returns array directly
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> profilesList = (List<Map<String, Object>>) parsed;
                        profiles = profilesList;
                        log.debug("API returned array, count: {}", profiles.size());
                    } else if (parsed instanceof Map) {
                        // API returns wrapped object
                        @SuppressWarnings("unchecked")
                        Map<String, Object> responseMap = (Map<String, Object>) parsed;
                        
                        // Try different possible structures
                        if (responseMap.containsKey("data")) {
                            Object data = responseMap.get("data");
                            if (data instanceof Map) {
                                @SuppressWarnings("unchecked")
                                Map<String, Object> dataMap = (Map<String, Object>) data;
                                if (dataMap.containsKey("profiles")) {
                                    @SuppressWarnings("unchecked")
                                    List<Map<String, Object>> profilesList = (List<Map<String, Object>>) dataMap.get("profiles");
                                    profiles = profilesList;
                                }
                            } else if (data instanceof List) {
                                @SuppressWarnings("unchecked")
                                List<Map<String, Object>> profilesList = (List<Map<String, Object>>) data;
                                profiles = profilesList;
                            }
                        } else if (responseMap.containsKey("profiles")) {
                            @SuppressWarnings("unchecked")
                            List<Map<String, Object>> profilesList = (List<Map<String, Object>>) responseMap.get("profiles");
                            profiles = profilesList;
                        }
                        
                        log.debug("API returned wrapped object, count: {}, status: {}", profiles.size(), responseMap.get("status"));
                    }
                }
            } catch (Exception e) {
                log.error("Error parsing API response: {}", e.getMessage());
                return createEmptyResponse(lat, lng, radius, sport);
            }

            if (profiles.isEmpty()) {
                log.warn("API returned empty profiles list for lat={}, lng={}", lat, lng);
                return createEmptyResponse(lat, lng, radius, sport);
            }

            // Convert API response to Player objects
            List<Player> nearbyPlayers = new ArrayList<>();
            int convertedCount = 0;
            int skippedCount = 0;
            for (Map<String, Object> profile : profiles) {
                Player player = convertProfileToPlayer(profile, lat, lng);
                if (player != null) {
                    convertedCount++;
                    // Apply sport filter if specified
                    if (sport != null && !sport.isEmpty() && !sport.equalsIgnoreCase("All")) {
                        boolean matchesSport = player.getSport() != null && player.getSport().equalsIgnoreCase(sport);
                        if (!matchesSport && player.getPrimarySports() != null) {
                            for (Player.PrimarySport ps : player.getPrimarySports()) {
                                if (ps.getSport().equalsIgnoreCase(sport)) {
                                    matchesSport = true;
                                    break;
                                }
                            }
                        }
                        if (!matchesSport) {
                            skippedCount++;
                            continue;
                        }
                    }
                    nearbyPlayers.add(player);
                } else {
                    skippedCount++;
                }
            }
            log.info("Converted {} profiles, skipped {}, returning {} players", convertedCount, skippedCount, nearbyPlayers.size());

            // Sort by distance
            nearbyPlayers.sort(Comparator.comparing(Player::getDistanceKm));
            
            // Apply limit after sorting (ensures we get the closest players)
            if (limit != null && limit > 0 && nearbyPlayers.size() > limit) {
                nearbyPlayers = nearbyPlayers.subList(0, limit);
                log.debug("Applied limit={}, returning {} players", limit, nearbyPlayers.size());
            }

            Map<String, Double> center = new HashMap<>();
            center.put("lat", lat);
            center.put("lng", lng);

            return NearbyPlayersResponse.builder()
                    .center(center)
                    .radiusKm(radius)
                    .sportFilter(sport)
                    .users(nearbyPlayers)
                    .count(nearbyPlayers.size())
                    .build();

        } catch (Exception e) {
            log.error("Error in getNearbyPlayers: {}", e.getMessage());
            throw e;
        }
    }

    public NearbyPlayersResponse fallbackNearbyPlayers(Double lat, Double lng, Double radius, String sport, String role, Integer limit, Throwable t) {
        log.warn("Circuit breaker fallback triggered for getNearbyPlayers: {}", t.getMessage());
        return createEmptyResponse(lat, lng, radius, sport);
    }

    /**
     * Convert API profile map to Player object
     * API Structure: {"Hpid":"...","profilePic":null,"primarySport":["sport1","sport2"],"currentLocation":{"lat":...,"lng":...,"city":"..."}}
     */
    private Player convertProfileToPlayer(Map<String, Object> profile, Double userLat, Double userLng) {
        try {
            // Extract ID - API uses "Hpid" (hashed profile ID)
            String hpid = extractString(profile, "Hpid", "hpid", "id", "user_id", "profile_id");
            Long id = null;
            if (hpid != null) {
                // Convert string ID to long (use hash code as fallback)
                try {
                    id = (long) hpid.hashCode();
                } catch (Exception e) {
                    id = System.currentTimeMillis() % 1000000; // Fallback ID
                }
            }
            
            // Extract name - API might not have name directly, use Hpid or generate
            String name = extractString(profile, "name", "username", "full_name", "displayName", "profileName");
            if (name == null || name.isEmpty()) {
                name = "Player " + (hpid != null ? hpid.substring(0, Math.min(8, hpid.length())) : "Unknown");
            }
            
            // Extract location from currentLocation object
            Double lat = null;
            Double lng = null;
            String city = null;
            
            if (profile.containsKey("currentLocation") && profile.get("currentLocation") instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> location = (Map<String, Object>) profile.get("currentLocation");
                lat = extractDouble(location, "lat", "latitude");
                lng = extractDouble(location, "lng", "longitude");
                city = extractString(location, "city", "location_city");
            } else {
                // Fallback: try direct fields
                lat = extractDouble(profile, "lat", "latitude");
                lng = extractDouble(profile, "lng", "longitude");
                city = extractString(profile, "city", "location_city");
            }
            
            if (lat == null || lng == null) {
                return null; // Skip if no location
            }

            // Calculate distance
            double distance = calculateDistance(userLat, userLng, lat, lng);

            // Extract primary sport - API has "primarySport" as array of strings
            String sport = null;
            List<Player.PrimarySport> primarySports = null;
            if (profile.containsKey("primarySport") && profile.get("primarySport") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> primarySportList = (List<Object>) profile.get("primarySport");
                if (!primarySportList.isEmpty()) {
                    // Use first sport as main sport
                    Object firstSport = primarySportList.get(0);
                    if (firstSport instanceof String) {
                        sport = (String) firstSport;
                    }
                    
                    // Convert all to PrimarySport objects
                    primarySports = new ArrayList<>();
                    for (Object ps : primarySportList) {
                        if (ps instanceof String) {
                            primarySports.add(new Player.PrimarySport((String) ps, 1)); // Default level 1
                        }
                    }
                }
            }
            
            // Fallback: try other field names
            if (sport == null) {
                sport = extractString(profile, "sport", "primary_sport", "sports");
            }
            
            String level = extractString(profile, "level", "skill_level", "skill");
            
            // Extract avatar
            String avatar = extractString(profile, "profilePic", "avatar", "profile_picture", "image_url", "picture");
            if (avatar == null || avatar.isEmpty() || "null".equals(avatar)) {
                avatar = "https://ui-avatars.com/api/?name=" + 
                        name.replace(" ", "+") + "&background=random";
            }

            // Extract role
            String role = extractString(profile, "role", "profile_type", "type", "profileType");

            // Extract secondary sports - API has "SecondarySport" (capital S)
            List<String> secondarySports = null;
            if (profile.containsKey("SecondarySport") && profile.get("SecondarySport") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> secSports = (List<Object>) profile.get("SecondarySport");
                secondarySports = new ArrayList<>();
                for (Object ss : secSports) {
                    if (ss instanceof String) {
                        secondarySports.add((String) ss);
                    }
                }
            }
            // Also try lowercase version
            if (secondarySports == null && profile.containsKey("secondarySport") && profile.get("secondarySport") instanceof List) {
                @SuppressWarnings("unchecked")
                List<Object> secSports = (List<Object>) profile.get("secondarySport");
                secondarySports = new ArrayList<>();
                for (Object ss : secSports) {
                    if (ss instanceof String) {
                        secondarySports.add((String) ss);
                    }
                }
            }

            // Extract deep link - might be constructed from Hpid
            String deepLink = extractString(profile, "deep_link", "profile_url", "url", "profileLink");
            if (deepLink == null && hpid != null) {
                deepLink = "https://link.stapubox.com/?ref=profile/" + hpid;
            }

            return Player.builder()
                    .id(id)
                    .name(name)
                    .sport(sport)
                    .level(level)
                    .city(city)
                    .latitude(lat)
                    .longitude(lng)
                    .avatar(avatar)
                    .role(role)
                    .primarySports(primarySports)
                    .secondarySports(secondarySports)
                    .distanceKm(Math.round(distance * 10.0) / 10.0)
                    .deepLink(deepLink)
                    .build();

        } catch (Exception e) {
            log.debug("Error converting profile: {}", e.getMessage());
            return null;
        }
    }

    // Helper methods to safely extract values from map
    private String extractString(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null) {
                return value.toString();
            }
        }
        return null;
    }

    private Double extractDouble(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object value = map.get(key);
            if (value != null) {
                if (value instanceof Number) {
                    return ((Number) value).doubleValue();
                } else if (value instanceof String) {
                    try {
                        return Double.parseDouble((String) value);
                    } catch (NumberFormatException e) {
                        // Continue to next key
                    }
                }
            }
        }
        return null;
    }

    private NearbyPlayersResponse createEmptyResponse(Double lat, Double lng, Double radius, String sport) {
        Map<String, Double> center = new HashMap<>();
        center.put("lat", lat);
        center.put("lng", lng);

        return NearbyPlayersResponse.builder()
                .center(center)
                .radiusKm(radius)
                .sportFilter(sport)
                .users(List.of())
                .count(0)
                .build();
    }
    
    // Haversine formula to calculate distance between two points
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Get list of available sports
     * Note: Static list as Stapubox API does not provide a sports list endpoint
     */
    public List<String> getSports() {
        return Arrays.asList(
            "Cricket", "Football", "Badminton", "Tennis", "Basketball",
            "Hockey", "Volleyball", "Table Tennis", "Swimming", "Athletics",
            "Gym", "Padel", "Chess", "Yoga", "Running"
        );
    }

    /**
     * Get player by ID
     * Note: Stapubox API does not support fetching individual profiles by ID.
     * This endpoint is not functional - players should be accessed via deep links.
     */
    public Player getPlayerById(Long id) {
        // Stapubox API does not support individual profile lookup
        // Return null to indicate profile not found
        return null;
    }

    /**
     * Get all players within a viewport for clustering.
     * Now uses REAL API endpoint
     * 
     * NOTE: Since Stapubox API uses radius-based search, we calculate center and radius
     * to cover the viewport, then filter results by viewport bounds.
     */
    public List<Player> getAllPlayersForViewport(
            Double minLat, Double maxLat,
            Double minLng, Double maxLng,
            String sport, String role,
            Double userLat, Double userLng, Double maxDistance) {
        
        try {
            // Calculate viewport center
            Double centerLat = (minLat + maxLat) / 2.0;
            Double centerLng = (minLng + maxLng) / 2.0;
            
            // Calculate radius to cover entire viewport (in km)
            // Use Haversine to calculate distance from center to corner
            double cornerLat = maxLat;
            double cornerLng = maxLng;
            double radiusKm = calculateDistance(centerLat, centerLng, cornerLat, cornerLng);
            // Add 20% buffer to ensure we cover the entire viewport
            radiusKm = radiusKm * 1.2;
            // Cap at reasonable maximum (100km)
            radiusKm = Math.min(radiusKm, 100.0);
            
            // Use user location if provided, otherwise use viewport center
            Double searchLat = userLat != null ? userLat : centerLat;
            Double searchLng = userLng != null ? userLng : centerLng;
            
            // Call real API with calculated radius
            NearbyPlayersResponse apiResponse = getNearbyPlayers(
                searchLat, searchLng, radiusKm, sport, role, 500 // Increased limit for viewport
            );
            
            // Filter results by viewport bounds
            List<Player> result = new ArrayList<>();
            if (apiResponse != null && apiResponse.getUsers() != null) {
                for (Player p : apiResponse.getUsers()) {
                    // Filter by viewport bounds
                    if (p.getLatitude() >= minLat && p.getLatitude() <= maxLat &&
                        p.getLongitude() >= minLng && p.getLongitude() <= maxLng) {
                        result.add(p);
                    }
                }
            }
            
            return result;
            
        } catch (Exception e) {
            log.error("Error fetching viewport data: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
}
