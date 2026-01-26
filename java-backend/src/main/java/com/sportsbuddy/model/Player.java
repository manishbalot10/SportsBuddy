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
public class Player {
    private Long id;
    private String name;
    private String sport;
    private String level;
    private String city;
    private String state;
    private Integer age;
    private String gender;
    private Double latitude;
    private Double longitude;
    private String avatar;
    private String role;
    private String deepLink;
    
    @JsonProperty("distance_km")
    private Double distanceKm;
    
    // New fields for multi-sport support
    private List<PrimarySport> primarySports;
    private List<String> secondarySports;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PrimarySport {
        private String sport;
        private Integer level; // 1-5 expertise level
    }
}
