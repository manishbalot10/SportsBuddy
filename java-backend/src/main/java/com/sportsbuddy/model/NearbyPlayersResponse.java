package com.sportsbuddy.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyPlayersResponse {
    private Map<String, Double> center;
    private Double radiusKm;
    private String sportFilter;
    private List<Player> users;
    private Integer count;
}
