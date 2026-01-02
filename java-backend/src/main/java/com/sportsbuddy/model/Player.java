package com.sportsbuddy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private Double latitude;
    private Double longitude;
    private String avatar;
    
    @JsonProperty("distance_km")
    private Double distanceKm;
}
