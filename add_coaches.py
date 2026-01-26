import json
import random

# Load existing data
with open('java-backend/src/main/resources/people_india_sports.json', 'r') as f:
    data = json.load(f)

# Indian cities with coordinates
cities = [
    {"city": "Mumbai", "state": "India", "latitude": 19.076, "longitude": 72.877},
    {"city": "Delhi", "state": "India", "latitude": 28.6139, "longitude": 77.2090},
    {"city": "Bangalore", "state": "India", "latitude": 12.9716, "longitude": 77.5946},
    {"city": "Hyderabad", "state": "India", "latitude": 17.3850, "longitude": 78.4867},
    {"city": "Chennai", "state": "India", "latitude": 13.0827, "longitude": 80.2707},
    {"city": "Kolkata", "state": "India", "latitude": 22.5726, "longitude": 88.3639},
    {"city": "Pune", "state": "India", "latitude": 18.5204, "longitude": 73.8567},
    {"city": "Ahmedabad", "state": "India", "latitude": 23.0225, "longitude": 72.5714},
    {"city": "Jaipur", "state": "India", "latitude": 26.9124, "longitude": 75.7873},
    {"city": "Lucknow", "state": "India", "latitude": 26.8467, "longitude": 80.9462},
]

# Coach names
coach_names = [
    "Rajesh Kumar", "Priya Sharma", "Vikram Singh", "Anjali Gupta", "Sanjay Patel",
    "Neha Reddy", "Arjun Nair", "Kavita Desai", "Rohit Mehta", "Simran Kaur",
    "Aditya Verma", "Pooja Iyer", "Karan Malhotra", "Divya Joshi", "Rahul Chopra",
    "Sneha Pillai", "Amit Thakur", "Ritu Chopra", "Varun Agarwal", "Meera Bansal"
]

# Sports list
sports = [
    "Cricket", "Football", "Badminton", "Tennis", "Basketball", "Volleyball",
    "Table Tennis", "Hockey", "Swimming", "Athletics", "Kabaddi", "Wrestling",
    "Boxing", "Shooting", "Archery", "Gymnastics", "Weightlifting", "Cycling",
    "Running", "Handball"
]

# Coaching levels
coaching_levels = [
    "Professional Coach", "National Level Coach", "State Level Coach", 
    "Certified Coach", "Advanced Coach"
]

# Generate 20 coaches
coaches = []
start_id = 1001

for i in range(20):
    city_data = random.choice(cities)
    primary_sport = random.choice(sports)
    
    # Add slight variation to coordinates
    lat_offset = random.uniform(-0.05, 0.05)
    lng_offset = random.uniform(-0.05, 0.05)
    
    # Select 1-2 primary sports
    num_primary = random.choice([1, 2])
    primary_sports = [{"sport": primary_sport, "level": random.randint(4, 5)}]
    
    if num_primary == 2:
        secondary_sport = random.choice([s for s in sports if s != primary_sport])
        primary_sports.append({"sport": secondary_sport, "level": random.randint(3, 5)})
    
    # Select 2-3 secondary sports
    available_sports = [s for s in sports if s not in [ps["sport"] for ps in primary_sports]]
    secondary_sports = random.sample(available_sports, random.randint(2, 3))
    
    coach = {
        "id": start_id + i,
        "name": coach_names[i],
        "sport": primary_sport,
        "level": random.choice(coaching_levels),
        "primarySports": primary_sports,
        "secondarySports": secondary_sports,
        "city": city_data["city"],
        "state": city_data["state"],
        "age": random.randint(30, 55),
        "gender": random.choice(["Male", "Female"]),
        "latitude": round(city_data["latitude"] + lat_offset, 6),
        "longitude": round(city_data["longitude"] + lng_offset, 6),
        "role": "coach"
    }
    
    coaches.append(coach)

# Add coaches to existing data
data.extend(coaches)

# Save updated data
with open('java-backend/src/main/resources/people_india_sports.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"✅ Added {len(coaches)} coaches to the data")
print(f"Total records: {len(data)} (1000 players + {len(coaches)} coaches)")
