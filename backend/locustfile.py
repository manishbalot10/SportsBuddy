import random
from locust import HttpUser, task, between
from typing import Tuple

class SportsBuddyUser(HttpUser):
    wait_time = between(1, 5)  # Simulate human think time
    
    # Mumbai coordinates as base
    BASE_LAT = 19.0760
    BASE_LNG = 72.8777
    
    def on_start(self):
        """Called when a User starts"""
        pass

    def get_random_coords(self) -> Tuple[float, float]:
        """Generate random coordinates near Mumbai"""
        lat_offset = random.uniform(-0.1, 0.1)
        lng_offset = random.uniform(-0.1, 0.1)
        return (self.BASE_LAT + lat_offset, self.BASE_LNG + lng_offset)

    @task(3)
    def get_nearby_users(self):
        """Simulate looking for players nearby"""
        lat, lng = self.get_random_coords()
        self.client.get(
            f"/api/users/nearby?lat={lat}&lng={lng}&radius=10",
            name="/api/users/nearby"
        )

    @task(2)
    def get_clusters(self):
        """Simulate panning the map (fetching clusters)"""
        lat, lng = self.get_random_coords()
        # Create a viewport box around the random point
        north = lat + 0.05
        south = lat - 0.05
        east = lng + 0.05
        west = lng - 0.05
        
        self.client.get(
            f"/api/users/clusters?north={north}&south={south}&east={east}&west={west}&zoom=12",
            name="/api/users/clusters"
        )

    @task(1)
    def get_hotspots(self):
        """Simulate viewing hotspots"""
        self.client.get("/api/hotspots", name="/api/hotspots")

    @task(1)
    def get_stats(self):
        """Simulate viewing stats"""
        self.client.get("/api/stats", name="/api/stats")
    
    @task(1)
    def get_matches(self):
        """Simulate a user checking their matches"""
        # Pick a random user ID between 1 and 1000 (assuming synthetic data exists)
        user_id = random.randint(1, 1000)
        self.client.get(
            f"/api/users/{user_id}/matches",
            name="/api/users/{id}/matches"
        )
