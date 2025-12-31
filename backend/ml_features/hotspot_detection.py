"""
Venue Hotspot Detection using K-means Clustering
Identifies popular playing locations and peak times
Perfect task for ML-focused intern
"""

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler
from typing import List, Dict, Tuple
from datetime import datetime, timedelta
import json

class HotspotDetector:
    """
    Detect sports venue hotspots using clustering algorithms
    Analyzes user location data to find popular playing areas
    """
    
    def __init__(self, n_clusters: int = 20):
        self.n_clusters = n_clusters
        self.kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        self.dbscan = DBSCAN(eps=0.5, min_samples=5)  # For density-based clustering
        self.scaler = StandardScaler()
        
    def detect_hotspots(self, users_df: pd.DataFrame) -> List[Dict]:
        """
        Detect hotspot venues from user location data
        Returns list of hotspot dictionaries with metadata
        """
        # Prepare location data
        locations = users_df[['latitude', 'longitude']].values
        
        # Scale for better clustering
        locations_scaled = self.scaler.fit_transform(locations)
        
        # Perform K-means clustering
        clusters = self.kmeans.fit_predict(locations_scaled)
        
        # Add cluster labels to dataframe
        users_df['cluster'] = clusters
        
        hotspots = []
        
        for cluster_id in range(self.n_clusters):
            cluster_users = users_df[users_df['cluster'] == cluster_id]
            
            if len(cluster_users) < 3:  # Skip small clusters
                continue
            
            # Calculate cluster center
            center_lat = cluster_users['latitude'].mean()
            center_lng = cluster_users['longitude'].mean()
            
            # Analyze cluster characteristics
            hotspot = {
                'id': cluster_id,
                'location': {
                    'latitude': center_lat,
                    'longitude': center_lng
                },
                'total_players': len(cluster_users),
                'sports_distribution': self._get_sports_distribution(cluster_users),
                'peak_times': self._analyze_peak_times(cluster_users),
                'age_range': {
                    'min': cluster_users['age'].min(),
                    'max': cluster_users['age'].max(),
                    'avg': cluster_users['age'].mean()
                },
                'skill_distribution': self._get_skill_distribution(cluster_users),
                'city': cluster_users['city'].mode()[0] if len(cluster_users) > 0 else 'Unknown',
                'radius_km': self._calculate_cluster_radius(cluster_users, center_lat, center_lng),
                'density_score': self._calculate_density_score(cluster_users),
                'suggested_name': self._generate_venue_name(cluster_users, center_lat, center_lng)
            }
            
            hotspots.append(hotspot)
        
        # Sort by player count
        hotspots.sort(key=lambda x: x['total_players'], reverse=True)
        
        return hotspots
    
    def _get_sports_distribution(self, cluster_df: pd.DataFrame) -> Dict:
        """Get distribution of sports in a cluster"""
        sports = cluster_df['sport'].value_counts()
        total = len(cluster_df)
        
        distribution = {}
        for sport, count in sports.items():
            distribution[sport] = {
                'count': int(count),
                'percentage': round((count / total) * 100, 1)
            }
        
        return distribution
    
    def _get_skill_distribution(self, cluster_df: pd.DataFrame) -> Dict:
        """Get skill level distribution in cluster"""
        if 'skill_level' not in cluster_df.columns:
            return {}
            
        skills = cluster_df['skill_level'].value_counts()
        total = len(cluster_df)
        
        distribution = {}
        for skill, count in skills.items():
            distribution[skill] = {
                'count': int(count),
                'percentage': round((count / total) * 100, 1)
            }
        
        return distribution
    
    def _analyze_peak_times(self, cluster_df: pd.DataFrame) -> Dict:
        """
        Analyze when players in this cluster are most active
        In production, this would use actual activity logs
        """
        # Simulate based on age and typical patterns
        avg_age = cluster_df['age'].mean()
        
        if avg_age < 25:
            # Younger players - evenings and weekends
            peak_times = {
                'weekday': '18:00-21:00',
                'weekend': '09:00-12:00, 16:00-20:00',
                'preferred_days': ['Friday', 'Saturday', 'Sunday']
            }
        elif avg_age < 35:
            # Working professionals - early mornings and evenings
            peak_times = {
                'weekday': '06:00-08:00, 19:00-21:00',
                'weekend': '07:00-10:00, 17:00-20:00',
                'preferred_days': ['Saturday', 'Sunday']
            }
        else:
            # Older players - mornings
            peak_times = {
                'weekday': '06:00-09:00',
                'weekend': '06:00-10:00',
                'preferred_days': ['Saturday', 'Sunday', 'Wednesday']
            }
        
        return peak_times
    
    def _calculate_cluster_radius(self, cluster_df: pd.DataFrame, 
                                 center_lat: float, center_lng: float) -> float:
        """Calculate the radius of a cluster in km"""
        from math import radians, sin, cos, sqrt, atan2
        
        max_distance = 0
        
        for _, user in cluster_df.iterrows():
            # Haversine formula
            R = 6371  # Earth's radius in km
            
            lat1, lon1 = radians(center_lat), radians(center_lng)
            lat2, lon2 = radians(user['latitude']), radians(user['longitude'])
            
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * atan2(sqrt(a), sqrt(1-a))
            
            distance = R * c
            max_distance = max(max_distance, distance)
        
        return round(max_distance, 2)
    
    def _calculate_density_score(self, cluster_df: pd.DataFrame) -> float:
        """
        Calculate how dense the cluster is (players per sq km)
        Higher density = better venue
        """
        radius_km = self._calculate_cluster_radius(
            cluster_df,
            cluster_df['latitude'].mean(),
            cluster_df['longitude'].mean()
        )
        
        if radius_km == 0:
            return 100.0
        
        area_sq_km = np.pi * (radius_km ** 2)
        density = len(cluster_df) / area_sq_km
        
        # Normalize to 0-100 scale
        # Assume 50 players/sq km is excellent (score 100)
        normalized_density = min(100, (density / 50) * 100)
        
        return round(normalized_density, 1)
    
    def _generate_venue_name(self, cluster_df: pd.DataFrame,
                            center_lat: float, center_lng: float) -> str:
        """Generate a suggested name for the venue"""
        city = cluster_df['city'].mode()[0] if len(cluster_df) > 0 else 'Unknown'
        primary_sport = cluster_df['sport'].mode()[0] if len(cluster_df) > 0 else 'Sports'
        
        # In production, would use reverse geocoding to get actual landmark names
        return f"{city} {primary_sport} Hub"
    
    def predict_venue_popularity(self, venue_features: Dict) -> float:
        """
        Predict how popular a new venue might be
        Based on features like location, facilities, accessibility
        """
        score = 50.0  # Base score
        
        # Factors that increase popularity
        if venue_features.get('parking_available'):
            score += 10
        if venue_features.get('public_transport_nearby'):
            score += 15
        if venue_features.get('lighting_available'):
            score += 10
        if venue_features.get('refreshments_nearby'):
            score += 5
        if venue_features.get('equipment_rental'):
            score += 10
        
        # Normalize to 0-100
        return min(100, score)
    
    def find_underserved_areas(self, users_df: pd.DataFrame,
                              existing_venues: List[Dict]) -> List[Dict]:
        """
        Identify areas with players but no nearby venues
        Great for venue partnership opportunities
        """
        underserved = []
        
        # Create grid of potential locations
        lat_min, lat_max = users_df['latitude'].min(), users_df['latitude'].max()
        lng_min, lng_max = users_df['longitude'].min(), users_df['longitude'].max()
        
        # Grid size (roughly 5km spacing)
        grid_size = 0.045  # Approximately 5km at equator
        
        for lat in np.arange(lat_min, lat_max, grid_size):
            for lng in np.arange(lng_min, lng_max, grid_size):
                # Count players within 5km
                nearby_players = self._count_nearby_players(
                    users_df, lat, lng, radius_km=5
                )
                
                if nearby_players < 10:  # Skip low density areas
                    continue
                
                # Check distance to nearest venue
                nearest_venue_dist = self._nearest_venue_distance(
                    lat, lng, existing_venues
                )
                
                if nearest_venue_dist > 10:  # More than 10km to nearest venue
                    underserved.append({
                        'location': {'latitude': lat, 'longitude': lng},
                        'potential_players': nearby_players,
                        'nearest_venue_km': nearest_venue_dist,
                        'opportunity_score': nearby_players / max(1, nearest_venue_dist) * 10
                    })
        
        # Sort by opportunity score
        underserved.sort(key=lambda x: x['opportunity_score'], reverse=True)
        
        return underserved[:10]  # Top 10 opportunities
    
    def _count_nearby_players(self, users_df: pd.DataFrame,
                             lat: float, lng: float, radius_km: float) -> int:
        """Count players within radius of a point"""
        count = 0
        for _, user in users_df.iterrows():
            distance = self._calculate_distance(
                lat, lng, user['latitude'], user['longitude']
            )
            if distance <= radius_km:
                count += 1
        return count
    
    def _calculate_distance(self, lat1: float, lon1: float,
                          lat2: float, lon2: float) -> float:
        """Calculate distance between two points"""
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Earth's radius in km
        lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * atan2(sqrt(a), sqrt(1-a))
        
        return R * c
    
    def _nearest_venue_distance(self, lat: float, lng: float,
                               venues: List[Dict]) -> float:
        """Find distance to nearest venue"""
        if not venues:
            return float('inf')
        
        min_distance = float('inf')
        for venue in venues:
            distance = self._calculate_distance(
                lat, lng,
                venue['location']['latitude'],
                venue['location']['longitude']
            )
            min_distance = min(min_distance, distance)
        
        return min_distance


# Usage example
if __name__ == "__main__":
    # Create sample data
    sample_users = pd.DataFrame({
        'id': range(100),
        'latitude': np.random.normal(19.0760, 0.05, 100),
        'longitude': np.random.normal(72.8777, 0.05, 100),
        'age': np.random.randint(18, 50, 100),
        'sport': np.random.choice(['Cricket', 'Football', 'Basketball'], 100),
        'skill_level': np.random.choice(['Beginner', 'Intermediate', 'Advanced'], 100),
        'city': ['Mumbai'] * 100
    })
    
    detector = HotspotDetector(n_clusters=5)
    hotspots = detector.detect_hotspots(sample_users)
    
    print("Top 3 Sports Hotspots Detected:\n")
    for i, hotspot in enumerate(hotspots[:3], 1):
        print(f"{i}. {hotspot['suggested_name']}")
        print(f"   Location: ({hotspot['location']['latitude']:.4f}, {hotspot['location']['longitude']:.4f})")
        print(f"   Players: {hotspot['total_players']}")
        print(f"   Density Score: {hotspot['density_score']}/100")
        print(f"   Primary Sport: {list(hotspot['sports_distribution'].keys())[0]}")
        print()
