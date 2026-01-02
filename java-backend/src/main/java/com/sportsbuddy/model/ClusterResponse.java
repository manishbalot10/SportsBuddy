package com.sportsbuddy.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sportsbuddy.util.SpatialCluster;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response model for clustered player data.
 * Supports both individual players and cluster markers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClusterResponse {
    
    private Viewport viewport;
    private int zoom;
    private int totalInViewport;
    private List<ClusterItem> clusters;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Viewport {
        private double minLat;
        private double maxLat;
        private double minLng;
        private double maxLng;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ClusterItem {
        private String id;           // geohash or player id
        private boolean isCluster;   // true = cluster, false = individual
        private double latitude;
        private double longitude;
        private int count;           // 1 for individual, N for cluster
        private Map<String, Integer> sportCounts; // sports breakdown
        private Player player;       // only if isCluster = false
    }
    
    /**
     * Convert SpatialCluster results to API response
     */
    public static ClusterResponse fromClusters(
            List<SpatialCluster.Cluster> clusters,
            double minLat, double maxLat,
            double minLng, double maxLng,
            int zoom) {
        
        List<ClusterItem> items = clusters.stream()
            .map(c -> ClusterItem.builder()
                .id(c.getGeohash())
                .isCluster(c.isCluster())
                .latitude(c.getCenterLat())
                .longitude(c.getCenterLng())
                .count(c.getCount())
                .sportCounts(c.getSportCounts())
                .player(c.getPlayers() != null && !c.getPlayers().isEmpty() 
                    ? c.getPlayers().get(0) : null)
                .build())
            .toList();
        
        int total = clusters.stream().mapToInt(SpatialCluster.Cluster::getCount).sum();
        
        return ClusterResponse.builder()
            .viewport(Viewport.builder()
                .minLat(minLat)
                .maxLat(maxLat)
                .minLng(minLng)
                .maxLng(maxLng)
                .build())
            .zoom(zoom)
            .totalInViewport(total)
            .clusters(items)
            .build();
    }
}
