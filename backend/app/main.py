"""
SportsBuddy Backend API - Main Application
Built with FastAPI for scalability to 10k+ users
"""

from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Any
from datetime import datetime
import redis
import json
import hashlib
import os
import sys
import pandas as pd
from dotenv import load_dotenv

# Add parent directory to path to import ml_features
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml_features.player_matching import PlayerMatcher
from ml_features.hotspot_detection import HotspotDetector

# Load environment variables
load_dotenv()

# Initialize ML Matcher
matcher = PlayerMatcher()
hotspot_detector = HotspotDetector()

# Redis Setup
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=0,
    decode_responses=True
)

app = FastAPI(
    title="SportsBuddy API",
    description="Backend API for finding nearby sports players",
    version="1.0.0",
    docs_url="/api/docs"
)

# ... (keep existing middleware) ...
# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Connection Helper
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            port=os.getenv('DB_PORT', '5432'),
            database=os.getenv('DB_NAME', 'sportsbuddy'),
            user=os.getenv('DB_USER', 'postgres'),
            password=os.getenv('DB_PASSWORD', 'postgres')
        )
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

# Cache Key Generator
def generate_cache_key(prefix: str, **kwargs):
    key_string = f"{prefix}:" + ":".join(f"{k}={v}" for k, v in sorted(kwargs.items()))
    return hashlib.md5(key_string.encode()).hexdigest()

@app.get("/")
async def root():
    return {
        "app": "SportsBuddy API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/users/nearby")
async def get_nearby_users(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"), 
    radius: float = Query(10, description="Radius in kilometers"),
    sport: Optional[str] = Query(None, description="Filter by sport"),
    limit: int = Query(100, description="Maximum results to return")
):
    """
    Get users within specified radius of given coordinates
    Uses PostGIS spatial queries for efficient geolocation search
    """
    # Check Cache
    cache_key = generate_cache_key("nearby", lat=lat, lng=lng, radius=radius, sport=sport, limit=limit)
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Use the stored procedure find_nearby_users
        cursor.execute("""
            SELECT * FROM find_nearby_users(
                %s, %s,  -- lat, lng
                %s,      -- radius_km
                %s,      -- sport_filter
                %s       -- limit_count
            )
        """, (lat, lng, radius, sport, limit))
        
        users = cursor.fetchall()
        
        # Transform results to match frontend expectations if needed
        transformed_users = []
        for user in users:
            transformed_users.append({
                "id": user['id'],
                "name": user['name'],
                "sport": user['sport'],
                "level": user['skill_level'],
                "city": user['city'],
                "latitude": user['lat'],
                "longitude": user['lng'],
                "avatar": user['profile_image'],
                "distance_km": round(user['dist_km'], 2)
            })
            
        response = {
            "center": {"lat": lat, "lng": lng},
            "radius_km": radius,
            "sport_filter": sport,
            "users": transformed_users,
            "count": len(transformed_users)
        }
        
        # Cache Result (expire in 5 minutes)
        redis_client.setex(cache_key, 300, json.dumps(response))
        
        return response
    except Exception as e:
        print(f"Error fetching nearby users: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

def get_cluster_grid_size(zoom: int) -> float:
    """Calculate grid size in degrees based on zoom level"""
    # Approximate logic: Map width is 360 degrees.
    # At zoom 0, 1 tile covers 360 deg.
    # At zoom Z, 360 / 2^Z degrees per tile.
    # We want clusters to be somewhat larger than a pixel but smaller than a tile.
    # Let's say we want ~10x10 grids per tile.
    return 360.0 / (2 ** zoom * 4) 

@app.get("/api/users/clusters")
async def get_user_clusters(
    north: float = Query(..., description="North boundary"),
    south: float = Query(..., description="South boundary"),
    east: float = Query(..., description="East boundary"),
    west: float = Query(..., description="West boundary"),
    zoom: int = Query(..., description="Map zoom level"),
    sport: Optional[str] = Query(None, description="Filter by sport")
):
    """
    Get clustered users for current map viewport
    Uses PostGIS ST_SnapToGrid for server-side clustering
    """
    # Check Cache
    cache_key = generate_cache_key("clusters", n=north, s=south, e=east, w=west, z=zoom, sport=sport)
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        grid_size = get_cluster_grid_size(zoom)
        
        query = """
            WITH clustered AS (
                SELECT
                    ST_SnapToGrid(location::geometry, %s, %s) as grid_point,
                    count(*) as count,
                    mode() WITHIN GROUP (ORDER BY sport) as top_sport
                FROM users
                WHERE 
                    location::geometry && ST_MakeEnvelope(%s, %s, %s, %s, 4326)
                    AND is_active = true
                    AND (%s::text IS NULL OR sport = %s)
                GROUP BY grid_point
            )
            SELECT
                ST_X(ST_Centroid(grid_point)) as lng,
                ST_Y(ST_Centroid(grid_point)) as lat,
                count,
                top_sport
            FROM clustered
        """
        
        cursor.execute(query, (
            grid_size, grid_size, 
            west, south, east, north,
            sport, sport
        ))
        
        clusters = cursor.fetchall()
        
        transformed_clusters = []
        for c in clusters:
            transformed_clusters.append({
                "latitude": c['lat'],
                "longitude": c['lng'],
                "count": c['count'],
                "sport": c['top_sport'],
                "is_cluster": True
            })
            
        response = {
            "bounds": {"north": north, "south": south, "east": east, "west": west},
            "zoom": zoom,
            "clusters": transformed_clusters
        }
        
        # Cache Result (expire in 1 minute - clusters change more often with panning)
        redis_client.setex(cache_key, 60, json.dumps(response))
        
        return response
        
    except Exception as e:
        print(f"Error fetching clusters: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/sports")
async def get_sports():
    """Get list of all available sports"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute("""
            SELECT sport, COUNT(*) as count 
            FROM users 
            GROUP BY sport 
            ORDER BY count DESC
        """)
        results = cursor.fetchall()
        
        # Extract just the sport names for the basic list, or return objects
        sports_list = [row['sport'] for row in results]
        
        return {
            "sports": sports_list,
            "details": results
        }
    except Exception as e:
        print(f"Error fetching sports: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/stats")
async def get_stats():
    """Get application statistics"""
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Total users
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total_users = cursor.fetchone()['total']
        
        # Distinct sports
        cursor.execute("SELECT COUNT(DISTINCT sport) as total FROM users")
        total_sports = cursor.fetchone()['total']
        
        # Distinct cities
        cursor.execute("SELECT COUNT(DISTINCT city) as total FROM users")
        total_cities = cursor.fetchone()['total']
        
        return {
            "total_users": total_users,
            "active_today": int(total_users * 0.42), # Mock active count for now
            "sports_count": total_sports,
            "cities_count": total_cities
        }
    except Exception as e:
        print(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/users/{user_id}/matches")
async def get_player_matches(user_id: int, limit: int = 10):
    """
    Get AI-recommended matches for a specific user
    """
    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # 1. Get Target Player
        cursor.execute("SELECT *, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude FROM users WHERE id = %s", (user_id,))
        target_player = cursor.fetchone()
        
        if not target_player:
            raise HTTPException(status_code=404, detail="User not found")
            
        # 2. Get Candidates (Same sport, within reasonable distance - say 50km)
        # We can reuse the spatial index
        cursor.execute("""
            SELECT *, ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude 
            FROM users 
            WHERE 
                id != %s 
                AND sport = %s
                AND is_active = true
                AND ST_DWithin(
                    location::geography,
                    ST_MakePoint(%s, %s)::geography,
                    50000 -- 50km radius
                )
            LIMIT 100 -- Get top 100 candidates to rank
        """, (user_id, target_player['sport'], target_player['longitude'], target_player['latitude']))
        
        candidates = cursor.fetchall()
        
        # 3. Run ML Matching
        # Convert RealDictRow to dict for the matcher
        target_dict = dict(target_player)
        candidates_dict = [dict(c) for c in candidates]
        
        matches = matcher.find_best_matches(target_dict, candidates_dict, top_k=limit)
        
        # 4. Format Response
        results = []
        for player, score in matches:
            # Recalculate explanation for the response
            _, explanation = matcher.predict_match_quality(target_dict, player)
            
            results.append({
                "user": {
                    "id": player['id'],
                    "name": player['name'],
                    "sport": player['sport'],
                    "level": player['skill_level'],
                    "city": player['city'],
                    "avatar": player['profile_image'],
                    "age": player['age'],
                    "rating": float(player['rating']) if player['rating'] else 5.0
                },
                "match_score": round(score, 1),
                "match_reason": explanation
            })
            
        return {
            "target_user_id": user_id,
            "matches": results
        }
        
    except Exception as e:
        print(f"Error finding matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

@app.get("/api/hotspots")
async def get_hotspots(
    limit: int = Query(20, description="Maximum number of hotspots to return")
):
    """
    Detect sports hotspots/venues based on player activity
    Uses K-means clustering to identify popular locations
    """
    # Check Cache
    cache_key = generate_cache_key("hotspots", limit=limit)
    cached_data = redis_client.get(cache_key)
    if cached_data:
        return json.loads(cached_data)

    conn = get_db_connection()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Fetch active users with location data
        cursor.execute("""
            SELECT 
                id, 
                ST_Y(location::geometry) as latitude, 
                ST_X(location::geometry) as longitude,
                sport,
                age,
                city,
                skill_level
            FROM users 
            WHERE is_active = true
            LIMIT 5000 -- Limit analysis to 5000 users for performance
        """)
        users = cursor.fetchall()
        
        if not users:
            return {"hotspots": []}
            
        # Convert to DataFrame for ML processing
        df = pd.DataFrame(users)
        
        # Detect hotspots
        hotspots = hotspot_detector.detect_hotspots(df)
        
        # Limit results
        hotspots = hotspots[:limit]
        
        response = {
            "count": len(hotspots),
            "hotspots": hotspots
        }
        
        # Cache Result (expire in 1 hour)
        redis_client.setex(cache_key, 3600, json.dumps(response))
        
        return response
        
    except Exception as e:
        print(f"Error detecting hotspots: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
