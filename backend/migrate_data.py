"""
Data Migration Script - CSV to PostgreSQL with PostGIS
This script migrates the people_india_sports.csv data to PostgreSQL
Intern can run this in Week 2 after database setup
"""

import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
from typing import List, Dict
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

class DataMigrator:
    def __init__(self):
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': os.getenv('DB_PORT', '5432'),
            'database': os.getenv('DB_NAME', 'sportsbuddy'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', 'postgres')
        }
        
    def connect_db(self):
        """Establish database connection"""
        try:
            conn = psycopg2.connect(**self.db_config)
            logger.info("✅ Connected to PostgreSQL")
            return conn
        except Exception as e:
            logger.error(f"❌ Database connection failed: {e}")
            raise
            
    def load_csv_data(self, filepath: str) -> pd.DataFrame:
        """Load and clean CSV data"""
        logger.info(f"Loading data from {filepath}")
        df = pd.read_csv(filepath)
        
        # Clean column names
        df.columns = df.columns.str.strip()
        
        # Data cleaning
        df['age'] = pd.to_numeric(df['age'], errors='coerce')
        df['latitude'] = pd.to_numeric(df['latitude'], errors='coerce')
        df['longitude'] = pd.to_numeric(df['longitude'], errors='coerce')
        
        # Remove any rows with invalid coordinates
        df = df.dropna(subset=['latitude', 'longitude'])
        
        logger.info(f"✅ Loaded {len(df)} records")
        return df
        
    def determine_skill_level(self, age: int, sport: str) -> str:
        """Simple heuristic to assign skill levels"""
        if age < 20:
            return 'Beginner'
        elif age < 30:
            return 'Intermediate'
        elif age < 40:
            return 'Advanced'
        else:
            return 'Intermediate'
            
    def migrate_users(self, df: pd.DataFrame, conn):
        """Migrate user data to PostgreSQL with PostGIS"""
        cursor = conn.cursor()
        
        insert_query = """
            INSERT INTO users (
                name, age, gender, city, state, sport, skill_level,
                bio, location, profile_image, instagram_handle
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s,
                ST_GeogFromText('POINT(%s %s)'),
                %s, %s
            )
            ON CONFLICT DO NOTHING
        """
        
        success_count = 0
        error_count = 0
        
        for idx, row in df.iterrows():
            try:
                # Prepare user data
                skill_level = self.determine_skill_level(row['age'], row['sport'])
                bio = f"Passionate {row['sport']} player from {row['city']}"
                profile_image = f"https://ui-avatars.com/api/?name={row['name'].replace(' ', '+')}&background=random"
                instagram = f"@{row['name'].lower().replace(' ', '_')}_sports"
                
                # Insert user
                cursor.execute(insert_query, (
                    row['name'],
                    int(row['age']) if pd.notna(row['age']) else 25,
                    row['gender'],
                    row['city'],
                    row['state'],
                    row['sport'],
                    skill_level,
                    bio,
                    row['longitude'],  # Note: PostGIS uses lng, lat order
                    row['latitude'],
                    profile_image,
                    instagram
                ))
                
                success_count += 1
                
                if (idx + 1) % 100 == 0:
                    conn.commit()
                    logger.info(f"Migrated {idx + 1} records...")
                    
            except Exception as e:
                error_count += 1
                logger.error(f"Error migrating row {idx}: {e}")
                conn.rollback()
        
        conn.commit()
        cursor.close()
        
        logger.info(f"✅ Migration complete: {success_count} success, {error_count} errors")
        return success_count, error_count
        
    def verify_migration(self, conn):
        """Verify data was migrated correctly"""
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Check total count
        cursor.execute("SELECT COUNT(*) as total FROM users")
        total = cursor.fetchone()['total']
        
        # Check sports distribution
        cursor.execute("""
            SELECT sport, COUNT(*) as count 
            FROM users 
            GROUP BY sport 
            ORDER BY count DESC
        """)
        sports_dist = cursor.fetchall()
        
        # Test spatial query
        cursor.execute("""
            SELECT * FROM find_nearby_users(
                19.0760, 72.8777,  -- Mumbai coordinates
                50,  -- 50km radius
                NULL,  -- All sports
                10  -- Limit 10 results
            )
        """)
        nearby_users = cursor.fetchall()
        
        cursor.close()
        
        logger.info(f"📊 Total users: {total}")
        logger.info("📊 Sports distribution:")
        for sport in sports_dist:
            logger.info(f"  - {sport['sport']}: {sport['count']} players")
        logger.info(f"📊 Found {len(nearby_users)} users near Mumbai")
        
        return {
            'total_users': total,
            'sports_distribution': sports_dist,
            'sample_nearby': nearby_users
        }

def main():
    """Main migration function"""
    migrator = DataMigrator()
    
    # Connect to database
    conn = migrator.connect_db()
    
    # Load CSV data
    csv_path = '../people_india_sports.csv'
    df = migrator.load_csv_data(csv_path)
    
    # Migrate users
    success, errors = migrator.migrate_users(df, conn)
    
    # Verify migration
    stats = migrator.verify_migration(conn)
    
    # Close connection
    conn.close()
    
    print("\n" + "="*50)
    print("MIGRATION SUMMARY")
    print("="*50)
    print(f"✅ Successfully migrated: {success} users")
    print(f"❌ Errors: {errors}")
    print(f"📊 Total in database: {stats['total_users']}")
    print("="*50)

if __name__ == "__main__":
    main()
