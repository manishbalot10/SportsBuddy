package com.sportsbuddy.controller;

import com.sportsbuddy.model.Player;
import com.sportsbuddy.model.NearbyPlayersResponse;
import com.sportsbuddy.model.ClusterResponse;
import com.sportsbuddy.service.StapuboxService;
import com.sportsbuddy.util.SpatialCluster;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3002", "http://localhost:3003", "http://localhost:5173", "http://127.0.0.1:3002", "http://127.0.0.1:3003"})
public class PlayerController {

    private final StapuboxService stapuboxService;

    public PlayerController(StapuboxService stapuboxService) {
        this.stapuboxService = stapuboxService;
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "app", "SportsBuddy API",
            "version", "1.0.0",
            "status", "running",
            "endpoints", List.of("/api/users/nearby", "/api/sports", "/api/users/{id}")
        ));
    }

    /**
     * Get nearby players based on location and filters
     */
    @GetMapping("/users/nearby")
    public ResponseEntity<NearbyPlayersResponse> getNearbyPlayers(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "50") Double radius,
            @RequestParam(required = false) String sport,
            @RequestParam(defaultValue = "100") Integer limit
    ) {
        NearbyPlayersResponse response = stapuboxService.getNearbyPlayers(lat, lng, radius, sport, limit);
        return ResponseEntity.ok(response);
    }

    /**
     * Get list of available sports
     */
    @GetMapping("/sports")
    public ResponseEntity<Map<String, Object>> getSports() {
        List<String> sports = stapuboxService.getSports();
        return ResponseEntity.ok(Map.of(
            "sports", sports,
            "count", sports.size()
        ));
    }

    /**
     * Get player by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<Player> getPlayerById(@PathVariable Long id) {
        Player player = stapuboxService.getPlayerById(id);
        return ResponseEntity.ok(player);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "healthy"));
    }

    /**
     * SCALABLE ENDPOINT: Viewport-based clustered players
     * 
     * This endpoint handles millions of users efficiently:
     * 1. Only returns data within visible viewport (not entire dataset)
     * 2. Server-side clustering based on zoom level
     * 3. Geohash-based spatial indexing for O(1) lookups
     * 
     * Time Complexity: O(n) where n = players in viewport (not total)
     * With geohash index: O(k) where k = visible cells << n
     */
    @GetMapping("/users/viewport")
    public ResponseEntity<ClusterResponse> getPlayersInViewport(
            @RequestParam Double minLat,
            @RequestParam Double maxLat,
            @RequestParam Double minLng,
            @RequestParam Double maxLng,
            @RequestParam(defaultValue = "11") Integer zoom,
            @RequestParam(required = false) String sport
    ) {
        // Get all players from data source (in production, this would query with bounds)
        List<Player> allPlayers = stapuboxService.getAllPlayersForViewport(
            minLat, maxLat, minLng, maxLng, sport
        );
        
        // Filter by viewport using geohash - O(n/cells) instead of O(n)
        int precision = com.sportsbuddy.util.GeoHash.getPrecisionForZoom(zoom);
        List<Player> viewportPlayers = SpatialCluster.filterByViewport(
            allPlayers, minLat, maxLat, minLng, maxLng, precision
        );
        
        // Cluster based on zoom level - O(n)
        // Hybrid approach: Send more individual points to let client handle smooth animations
        // Only cluster server-side if density is extremely high (> 100 per cell)
        int maxBeforeCluster = 100;
        List<SpatialCluster.Cluster> clusters = SpatialCluster.clusterPlayers(
            viewportPlayers, zoom, maxBeforeCluster
        );
        
        // Build response
        ClusterResponse response = ClusterResponse.fromClusters(
            clusters, minLat, maxLat, minLng, maxLng, zoom
        );
        
        return ResponseEntity.ok(response);
    }
}
