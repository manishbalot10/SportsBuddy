package com.sportsbuddy.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sportsbuddy.model.Player;
import com.sportsbuddy.model.NearbyPlayersResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
@SuppressWarnings("unused")
public class StapuboxService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    // Loaded from JSON file
    private List<Player> allPlayers = new ArrayList<>();

    @Value("${stapubox.api.base-url}")
    private String stapuboxBaseUrl;

    @Value("${stapubox.api.key}")
    private String apiKey;

    public StapuboxService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    
    @PostConstruct
    public void loadPlayersFromJson() {
        try {
            ClassPathResource resource = new ClassPathResource("people_india_sports.json");
            InputStream inputStream = resource.getInputStream();
            List<Map<String, Object>> rawData = objectMapper.readValue(inputStream, new TypeReference<>() {});
            
            for (Map<String, Object> item : rawData) {
                // Parse primarySports
                List<Player.PrimarySport> primarySports = null;
                if (item.containsKey("primarySports") && item.get("primarySports") != null) {
                    List<Map<String, Object>> primarySportsRaw = (List<Map<String, Object>>) item.get("primarySports");
                    primarySports = new ArrayList<>();
                    for (Map<String, Object> ps : primarySportsRaw) {
                        primarySports.add(new Player.PrimarySport(
                            (String) ps.get("sport"),
                            ((Number) ps.get("level")).intValue()
                        ));
                    }
                }
                
                // Parse secondarySports
                List<String> secondarySports = null;
                if (item.containsKey("secondarySports") && item.get("secondarySports") != null) {
                    secondarySports = (List<String>) item.get("secondarySports");
                }
                
                allPlayers.add(Player.builder()
                    .id(((Number) item.get("id")).longValue())
                    .name((String) item.get("name"))
                    .sport((String) item.get("sport"))
                    .level((String) item.get("level"))
                    .city((String) item.get("city"))
                    .latitude(((Number) item.get("latitude")).doubleValue())
                    .longitude(((Number) item.get("longitude")).doubleValue())
                    .avatar("https://ui-avatars.com/api/?name=" + ((String) item.get("name")).replace(" ", "+") + "&background=random")
                    .primarySports(primarySports)
                    .secondarySports(secondarySports)
                    .distanceKm(0.0)
                    .build());
            }
            System.out.println("Loaded " + allPlayers.size() + " players from JSON");
        } catch (IOException e) {
            System.err.println("Failed to load players JSON: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Fetch nearby players from Stapubox API
     * PLACEHOLDER: Replace with actual Stapubox API call when available
     */
    public NearbyPlayersResponse getNearbyPlayers(Double lat, Double lng, Double radius, String sport, Integer limit) {
        // Use loaded players from JSON file
        List<Player> nearbyPlayers = new ArrayList<>();
        
        for (Player player : allPlayers) {
            // Calculate distance
            double distance = calculateDistance(lat, lng, player.getLatitude(), player.getLongitude());
            
            if (distance <= radius) {
                // Filter by sport if specified
                if (sport != null && !sport.isEmpty() && !sport.equalsIgnoreCase("All")) {
                    // Check primary sports
                    boolean matchesSport = player.getSport().equalsIgnoreCase(sport);
                    if (!matchesSport && player.getPrimarySports() != null) {
                        for (Player.PrimarySport ps : player.getPrimarySports()) {
                            if (ps.getSport().equalsIgnoreCase(sport)) {
                                matchesSport = true;
                                break;
                            }
                        }
                    }
                    if (!matchesSport) continue;
                }
                
                // Clone player and set distance
                Player playerWithDistance = Player.builder()
                    .id(player.getId())
                    .name(player.getName())
                    .sport(player.getSport())
                    .level(player.getLevel())
                    .city(player.getCity())
                    .latitude(player.getLatitude())
                    .longitude(player.getLongitude())
                    .avatar(player.getAvatar())
                    .primarySports(player.getPrimarySports())
                    .secondarySports(player.getSecondarySports())
                    .distanceKm(Math.round(distance * 10.0) / 10.0)
                    .build();
                    
                nearbyPlayers.add(playerWithDistance);
            }
        }
        
        // Sort by distance
        nearbyPlayers.sort(Comparator.comparing(Player::getDistanceKm));
        
        // Apply limit
        if (limit != null && nearbyPlayers.size() > limit) {
            nearbyPlayers = nearbyPlayers.subList(0, limit);
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
     * Get list of available sports from Stapubox API
     * PLACEHOLDER: Replace with actual API call
     */
    public List<String> getSports() {
        // TODO: Replace with actual Stapubox API call
        return Arrays.asList(
            "Cricket", "Football", "Badminton", "Tennis", "Basketball",
            "Hockey", "Volleyball", "Table Tennis", "Swimming", "Athletics"
        );
    }

    /**
     * Get player by ID from Stapubox API
     * PLACEHOLDER: Replace with actual API call
     */
    public Player getPlayerById(Long id) {
        // TODO: Replace with actual Stapubox API call
        return Player.builder()
                .id(id)
                .name("Player " + id)
                .sport("Cricket")
                .level("Intermediate")
                .city("Mumbai")
                .latitude(19.076 + (id % 10) * 0.01)
                .longitude(72.877 + (id % 8) * 0.01)
                .avatar("https://ui-avatars.com/api/?name=Player+" + id + "&background=random")
                .distanceKm(id * 0.5)
                .build();
    }

    /**
     * Get all players within a viewport for clustering.
     * Now uses REAL data from people_india_sports.json
     */
    public List<Player> getAllPlayersForViewport(
            Double minLat, Double maxLat,
            Double minLng, Double maxLng,
            String sport) {
        
        List<Player> result = new ArrayList<>();
        for (Player p : allPlayers) {
            // Filter by viewport bounds
            if (p.getLatitude() >= minLat && p.getLatitude() <= maxLat &&
                p.getLongitude() >= minLng && p.getLongitude() <= maxLng) {
                
                // Filter by sport if specified
                if (sport != null && !sport.isEmpty() && !sport.equalsIgnoreCase("All") 
                    && !p.getSport().equalsIgnoreCase(sport)) {
                    continue;
                }
                result.add(p);
            }
        }
        return result;
    }

    // Helper: Generate STABLE mock players around CITIES only (no ocean!)
    private List<Player> generateMockPlayersInBounds(
            Double minLat, Double maxLat,
            Double minLng, Double maxLng,
            String sport, int count) {
        
        List<Player> players = new ArrayList<>();
        String[] sports = {"Cricket", "Football", "Badminton", "Tennis", "Basketball", 
                          "Hockey", "Volleyball", "Swimming", "Athletics", "Table Tennis"};
        String[] levels = {"Beginner", "Intermediate", "Advanced", "Professional"};
        
        // City centers (only generate players near these)
        double[][] cityData = {
            {19.076, 72.877},  // Mumbai
            {19.218, 72.978},  // Thane  
            {19.033, 73.029},  // Navi Mumbai
            {18.520, 73.856},  // Pune
            {19.180, 72.850},  // Andheri
            {19.120, 72.905},  // Kurla
            {19.230, 73.130},  // Kalyan
            {18.980, 72.840},  // Colaba
        };
        String[] cityNames = {"Mumbai", "Thane", "Navi Mumbai", "Pune", "Andheri", "Kurla", "Kalyan", "Colaba"};
        
        // For each city in viewport, generate players around it
        for (int c = 0; c < cityData.length; c++) {
            double cityLat = cityData[c][0];
            double cityLng = cityData[c][1];
            
            // Skip if city not in viewport
            if (cityLat < minLat - 0.1 || cityLat > maxLat + 0.1 ||
                cityLng < minLng - 0.1 || cityLng > maxLng + 0.1) {
                continue;
            }
            
            // Generate ~50 players per visible city
            Random cityRandom = new Random((long)(cityLat * 1000 + cityLng * 100));
            for (int i = 0; i < 50; i++) {
                long id = Math.abs((long)(cityLat * 10000 + cityLng * 1000 + i));
                String playerSport = sports[cityRandom.nextInt(sports.length)];
                
                if (sport != null && !sport.isEmpty() && !sport.equalsIgnoreCase("All") 
                    && !playerSport.equalsIgnoreCase(sport)) {
                    continue;
                }
                
                // Spread around city center (radius ~5km)
                double lat = cityLat + (cityRandom.nextGaussian() * 0.03);
                double lng = cityLng + (cityRandom.nextGaussian() * 0.03);
                
                // Skip if outside viewport
                if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) continue;
                
                players.add(Player.builder()
                    .id(id)
                    .name("Player " + (id % 1000))
                    .sport(playerSport)
                    .level(levels[cityRandom.nextInt(levels.length)])
                    .city(cityNames[c])
                    .latitude(lat)
                    .longitude(lng)
                    .avatar("https://ui-avatars.com/api/?name=P" + (id % 100) + "&background=random")
                    .distanceKm(Math.round(cityRandom.nextDouble() * 10 * 10.0) / 10.0)
                    .build());
            }
        }
        
        return players;
    }

    // Helper method to generate mock players for demo
    private List<Player> generateMockPlayers(Double lat, Double lng, Double radius, String sport, Integer limit) {
        List<Player> players = new ArrayList<>();
        String[] sports = {"Cricket", "Football", "Badminton", "Tennis", "Basketball"};
        String[] levels = {"Beginner", "Intermediate", "Advanced", "Professional"};
        String[] cities = {"Mumbai", "Delhi", "Bangalore", "Chennai", "Pune"};

        int count = limit != null ? Math.min(limit, 50) : 50;

        for (int i = 1; i <= count; i++) {
            String playerSport = sports[i % sports.length];
            
            // Skip if sport filter is applied and doesn't match
            if (sport != null && !sport.isEmpty() && !sport.equalsIgnoreCase("All") 
                && !playerSport.equalsIgnoreCase(sport)) {
                continue;
            }

            players.add(Player.builder()
                    .id((long) i)
                    .name("Player " + i)
                    .sport(playerSport)
                    .level(levels[i % levels.length])
                    .city(cities[i % cities.length])
                    .latitude(lat + (i % 10) * 0.01 - 0.05)
                    .longitude(lng + (i % 8) * 0.01 - 0.04)
                    .avatar("https://ui-avatars.com/api/?name=Player+" + i + "&background=random")
                    .distanceKm(Math.round(i * 0.5 * 10.0) / 10.0)
                    .build());
        }

        return players;
    }
}
