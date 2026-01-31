package com.sportsbuddy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StapuboxMapViewRequest {
    @JsonProperty("playground")
    private Boolean playground = true;
    
    @JsonProperty("work")
    private Boolean work = false;
    
    @JsonProperty("home")
    private Boolean home = false;
    
    @JsonProperty("profile_type")
    private String profileType; // "player" or "coach"
    
    @JsonProperty("sports_id")
    private List<Integer> sportsId = List.of();
    
    @JsonProperty("skill")
    private List<String> skill = List.of("beginner", "intermediate", "advanced", "professional");
    
    @JsonProperty("search_radius")
    private Integer searchRadius; // in meters
    
    @JsonProperty("search_radius_min")
    private Integer searchRadiusMin = 0;
    
    @JsonProperty("search_radius_max")
    private Integer searchRadiusMax = 100000;
    
    @JsonProperty("page")
    private Integer page = 1;
    
    @JsonProperty("page_size")
    private Integer pageSize = 20;
    
    @JsonProperty("format")
    private String format = "json";
    
    @JsonProperty("location")
    private LocationData location;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationData {
        @JsonProperty("type")
        private String type = "current";
        
        @JsonProperty("address")
        private String address;
        
        @JsonProperty("lat")
        private Double lat;
        
        @JsonProperty("lng")
        private Double lng;
        
        @JsonProperty("city")
        private String city;
        
        @JsonProperty("state")
        private String state;
        
        @JsonProperty("country")
        private String country = "India";
    }
}
