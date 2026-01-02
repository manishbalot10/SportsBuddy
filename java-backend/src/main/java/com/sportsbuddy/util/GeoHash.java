package com.sportsbuddy.util;

/**
 * Geohash implementation for O(1) spatial indexing.
 * 
 * Time Complexity:
 * - encode(): O(precision) ≈ O(1) for fixed precision
 * - decode(): O(precision) ≈ O(1)
 * - getNeighbors(): O(1)
 * 
 * Space Complexity: O(1) per geohash string
 * 
 * With geohash, we can:
 * 1. Group nearby points by prefix matching
 * 2. Query spatial regions in O(1) using hash lookups
 * 3. Enable efficient clustering without scanning all points
 */
public class GeoHash {
    
    private static final String BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
    private static final int[] BITS = {16, 8, 4, 2, 1};
    
    /**
     * Encode lat/lng to geohash string.
     * Precision determines grid cell size:
     * - 1: ~5000km
     * - 2: ~1250km
     * - 3: ~156km
     * - 4: ~39km
     * - 5: ~5km (good for city-level clustering)
     * - 6: ~1.2km (good for neighborhood)
     * - 7: ~150m
     * - 8: ~40m
     */
    public static String encode(double latitude, double longitude, int precision) {
        double[] latRange = {-90.0, 90.0};
        double[] lngRange = {-180.0, 180.0};
        
        StringBuilder geohash = new StringBuilder();
        boolean isEven = true;
        int bit = 0;
        int ch = 0;
        
        while (geohash.length() < precision) {
            if (isEven) {
                double mid = (lngRange[0] + lngRange[1]) / 2;
                if (longitude >= mid) {
                    ch |= BITS[bit];
                    lngRange[0] = mid;
                } else {
                    lngRange[1] = mid;
                }
            } else {
                double mid = (latRange[0] + latRange[1]) / 2;
                if (latitude >= mid) {
                    ch |= BITS[bit];
                    latRange[0] = mid;
                } else {
                    latRange[1] = mid;
                }
            }
            
            isEven = !isEven;
            if (bit < 4) {
                bit++;
            } else {
                geohash.append(BASE32.charAt(ch));
                bit = 0;
                ch = 0;
            }
        }
        
        return geohash.toString();
    }
    
    /**
     * Decode geohash to lat/lng bounds.
     * Returns: [minLat, maxLat, minLng, maxLng]
     */
    public static double[] decode(String geohash) {
        double[] latRange = {-90.0, 90.0};
        double[] lngRange = {-180.0, 180.0};
        boolean isEven = true;
        
        for (int i = 0; i < geohash.length(); i++) {
            int ch = BASE32.indexOf(geohash.charAt(i));
            for (int bit : BITS) {
                if (isEven) {
                    double mid = (lngRange[0] + lngRange[1]) / 2;
                    if ((ch & bit) != 0) {
                        lngRange[0] = mid;
                    } else {
                        lngRange[1] = mid;
                    }
                } else {
                    double mid = (latRange[0] + latRange[1]) / 2;
                    if ((ch & bit) != 0) {
                        latRange[0] = mid;
                    } else {
                        latRange[1] = mid;
                    }
                }
                isEven = !isEven;
            }
        }
        
        return new double[]{latRange[0], latRange[1], lngRange[0], lngRange[1]};
    }
    
    /**
     * Get center point of a geohash cell.
     * Returns: [lat, lng]
     */
    public static double[] decodeCenter(String geohash) {
        double[] bounds = decode(geohash);
        return new double[]{
            (bounds[0] + bounds[1]) / 2,
            (bounds[2] + bounds[3]) / 2
        };
    }
    
    /**
     * Get optimal precision based on zoom level.
     * Higher zoom = more precision = smaller cells = more detail
     */
    public static int getPrecisionForZoom(int zoom) {
        if (zoom <= 3) return 1;      // World view
        if (zoom <= 5) return 2;      // Continent
        if (zoom <= 7) return 3;      // Country
        if (zoom <= 9) return 4;      // State/Region
        if (zoom <= 11) return 5;     // City
        if (zoom <= 13) return 6;     // Neighborhood
        if (zoom <= 15) return 7;     // Street
        return 8;                      // Building level
    }
    
    /**
     * Get all geohashes that cover a bounding box.
     * This is key for viewport-based queries - O(cells) where cells is small.
     */
    public static java.util.Set<String> getCoveringGeohashes(
            double minLat, double maxLat, 
            double minLng, double maxLng, 
            int precision) {
        
        java.util.Set<String> geohashes = new java.util.HashSet<>();
        
        // Calculate step size based on precision
        double[] sampleBounds = decode(encode(minLat, minLng, precision));
        double latStep = (sampleBounds[1] - sampleBounds[0]) * 0.9;
        double lngStep = (sampleBounds[3] - sampleBounds[2]) * 0.9;
        
        // Iterate through the bounding box and collect geohashes
        for (double lat = minLat; lat <= maxLat; lat += latStep) {
            for (double lng = minLng; lng <= maxLng; lng += lngStep) {
                geohashes.add(encode(lat, lng, precision));
            }
        }
        
        // Also add corners and edges
        geohashes.add(encode(minLat, minLng, precision));
        geohashes.add(encode(minLat, maxLng, precision));
        geohashes.add(encode(maxLat, minLng, precision));
        geohashes.add(encode(maxLat, maxLng, precision));
        
        return geohashes;
    }
}
