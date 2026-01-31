package com.sportsbuddy.model;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class StapuboxMapViewResponse {
    @JsonProperty("status")
    private String status;
    
    @JsonProperty("data")
    private ResponseData data;
    
    @JsonProperty("message")
    private String message;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResponseData {
        @JsonProperty("profiles")
        private List<Map<String, Object>> profiles;
        
        @JsonProperty("total")
        private Integer total;
        
        @JsonProperty("page")
        private Integer page;
        
        @JsonProperty("page_size")
        private Integer pageSize;
    }
}
