-- SportsBuddy Database Schema with PostGIS
-- Designed for 10,000+ users with spatial indexing

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm; -- For fuzzy text search

-- Users table with geospatial data
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    age INTEGER CHECK (age >= 13 AND age <= 100),
    gender VARCHAR(10),
    city VARCHAR(100),
    state VARCHAR(100),
    sport VARCHAR(50) NOT NULL,
    skill_level VARCHAR(20) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Professional')),
    bio TEXT,
    availability JSONB, -- {"days": ["Mon", "Wed"], "time": "18:00-20:00"}
    location GEOGRAPHY(POINT, 4326), -- PostGIS point for lat/lng
    profile_image VARCHAR(255),
    instagram_handle VARCHAR(100),
    rating DECIMAL(3, 2) DEFAULT 5.0,
    matches_played INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_active TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Spatial index for fast nearby queries
CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_sport ON users(sport);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_active ON users(is_active);

-- Sports table
CREATE TABLE sports (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    category VARCHAR(50),
    icon VARCHAR(255),
    color VARCHAR(7) -- Hex color for UI
);

-- User connections/matches
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id),
    user2_id INTEGER REFERENCES users(id),
    sport VARCHAR(50),
    scheduled_at TIMESTAMP,
    venue_location GEOGRAPHY(POINT, 4326),
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_match UNIQUE(user1_id, user2_id, scheduled_at)
);

-- User search history for ML recommendations
CREATE TABLE search_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    search_location GEOGRAPHY(POINT, 4326),
    search_radius DECIMAL(5, 2),
    sport_filter VARCHAR(50),
    results_count INTEGER,
    clicked_profiles JSONB, -- Array of user IDs clicked
    searched_at TIMESTAMP DEFAULT NOW()
);

-- Venue hotspots (identified by ML clustering)
CREATE TABLE hotspots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    location GEOGRAPHY(POINT, 4326),
    sport VARCHAR(50),
    peak_hours JSONB, -- {"weekday": "18-20", "weekend": "08-11"}
    avg_players INTEGER,
    discovered_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hotspots_location ON hotspots USING GIST(location);

-- Function to find nearby users (called by API)
CREATE OR REPLACE FUNCTION find_nearby_users(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_km DOUBLE PRECISION,
    sport_filter VARCHAR DEFAULT NULL,
    max_results INTEGER DEFAULT 100
)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    sport VARCHAR,
    skill_level VARCHAR,
    city VARCHAR,
    profile_image VARCHAR,
    dist_km DOUBLE PRECISION,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.sport,
        u.skill_level,
        u.city,
        u.profile_image,
        ST_Distance(
            u.location::geography,
            ST_MakePoint(user_lng, user_lat)::geography
        ) / 1000 AS dist_km,
        ST_Y(u.location::geometry) AS lat,
        ST_X(u.location::geometry) AS lng
    FROM users u
    WHERE 
        u.is_active = true
        AND ST_DWithin(
            u.location::geography,
            ST_MakePoint(user_lng, user_lat)::geography,
            radius_km * 1000  -- Convert km to meters
        )
        AND (sport_filter IS NULL OR u.sport = sport_filter)
    ORDER BY dist_km
    LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Sample data insertion (for testing)
INSERT INTO sports (name, category, color) VALUES
('Cricket', 'Team', '#00ff00'),
('Football', 'Team', '#0088ff'),
('Basketball', 'Team', '#ff8800'),
('Tennis', 'Racquet', '#ffff00'),
('Badminton', 'Racquet', '#ff00ff'),
('Volleyball', 'Team', '#00ffff'),
('Table Tennis', 'Racquet', '#ff0088'),
('Hockey', 'Team', '#8800ff');
