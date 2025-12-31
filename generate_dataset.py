import json
import random
import csv

# Indian first names
first_names = [
    "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan",
    "Shaurya", "Atharv", "Advik", "Pranav", "Advaith", "Aaryan", "Dhruv", "Kabir", "Ritvik", "Anirudh",
    "Ananya", "Saanvi", "Aanya", "Aadhya", "Aaradhya", "Anvi", "Prisha", "Myra", "Sara", "Ira",
    "Diya", "Kiara", "Anushka", "Tara", "Anika", "Pari", "Navya", "Avni", "Shanaya", "Siya",
    "Rahul", "Amit", "Priya", "Sneha", "Rohan", "Neha", "Vikram", "Pooja", "Karan", "Anjali",
    "Raj", "Deepika", "Mohit", "Kavita", "Nikhil", "Divya", "Sanjay", "Meera", "Akash", "Ritu",
    "Varun", "Shreya", "Gaurav", "Nisha", "Rajesh", "Sunita", "Manish", "Komal", "Suresh", "Jyoti",
    "Arun", "Rekha", "Vijay", "Shalini", "Rakesh", "Pallavi", "Dinesh", "Swati", "Manoj", "Preeti",
    "Harsh", "Sakshi", "Tushar", "Tanvi", "Kunal", "Kriti", "Sahil", "Aditi", "Yash", "Ishita",
    "Dev", "Aishwarya", "Om", "Bhavya", "Lakshay", "Mahima", "Kartik", "Riya", "Shivam", "Simran"
]

# Indian last names
last_names = [
    "Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Shah", "Mehta", "Joshi", "Rao",
    "Nair", "Menon", "Pillai", "Iyer", "Iyengar", "Reddy", "Naidu", "Choudhary", "Agarwal", "Bansal",
    "Saxena", "Kapoor", "Malhotra", "Khanna", "Chopra", "Bhatia", "Arora", "Sethi", "Kohli", "Dhawan",
    "Chauhan", "Yadav", "Rajput", "Tiwari", "Pandey", "Mishra", "Dubey", "Shukla", "Srivastava", "Awasthi",
    "Das", "Bose", "Sen", "Ghosh", "Mukherjee", "Banerjee", "Chatterjee", "Roy", "Dutta", "Sarkar",
    "Desai", "Parekh", "Modi", "Gandhi", "Thakur", "Rathore", "Shekhawat", "Tanwar", "Gill", "Kaur",
    "Fernandes", "D'Souza", "Rodrigues", "Pereira", "Shetty", "Hegde", "Bhat", "Kulkarni", "Patil", "Jain"
]

# Sports
sports = [
    "Cricket", "Football", "Hockey", "Badminton", "Tennis", "Table Tennis", "Kabaddi", "Wrestling",
    "Boxing", "Shooting", "Archery", "Athletics", "Swimming", "Volleyball", "Basketball",
    "Chess", "Carrom", "Kho Kho", "Squash", "Golf", "Cycling", "Weightlifting", "Gymnastics",
    "Martial Arts", "Yoga", "Running", "Marathon", "Throwball", "Handball", "Baseball"
]

# Skill levels
levels = ["Beginner", "Intermediate", "Advanced", "Professional", "National Level", "State Level", "District Level"]

# Major Indian cities with approximate lat/long boundaries
indian_locations = [
    {"city": "Mumbai", "lat_range": (18.87, 19.27), "lng_range": (72.77, 72.97)},
    {"city": "Delhi", "lat_range": (28.50, 28.80), "lng_range": (76.95, 77.35)},
    {"city": "Bangalore", "lat_range": (12.85, 13.10), "lng_range": (77.45, 77.75)},
    {"city": "Hyderabad", "lat_range": (17.30, 17.55), "lng_range": (78.35, 78.55)},
    {"city": "Chennai", "lat_range": (12.95, 13.20), "lng_range": (80.15, 80.30)},
    {"city": "Kolkata", "lat_range": (22.45, 22.65), "lng_range": (88.30, 88.45)},
    {"city": "Pune", "lat_range": (18.45, 18.65), "lng_range": (73.75, 73.95)},
    {"city": "Ahmedabad", "lat_range": (22.95, 23.15), "lng_range": (72.50, 72.70)},
    {"city": "Jaipur", "lat_range": (26.80, 27.00), "lng_range": (75.70, 75.90)},
    {"city": "Lucknow", "lat_range": (26.78, 26.95), "lng_range": (80.85, 81.05)},
    {"city": "Kanpur", "lat_range": (26.40, 26.55), "lng_range": (80.30, 80.45)},
    {"city": "Nagpur", "lat_range": (21.10, 21.20), "lng_range": (79.00, 79.15)},
    {"city": "Indore", "lat_range": (22.65, 22.80), "lng_range": (75.80, 75.95)},
    {"city": "Thane", "lat_range": (19.15, 19.30), "lng_range": (72.95, 73.10)},
    {"city": "Bhopal", "lat_range": (23.20, 23.35), "lng_range": (77.35, 77.50)},
    {"city": "Visakhapatnam", "lat_range": (17.65, 17.80), "lng_range": (83.20, 83.35)},
    {"city": "Patna", "lat_range": (25.58, 25.68), "lng_range": (85.08, 85.22)},
    {"city": "Vadodara", "lat_range": (22.28, 22.38), "lng_range": (73.15, 73.25)},
    {"city": "Ghaziabad", "lat_range": (28.63, 28.73), "lng_range": (77.40, 77.50)},
    {"city": "Ludhiana", "lat_range": (30.87, 30.95), "lng_range": (75.82, 75.92)},
    {"city": "Agra", "lat_range": (27.15, 27.25), "lng_range": (77.95, 78.05)},
    {"city": "Nashik", "lat_range": (19.95, 20.05), "lng_range": (73.75, 73.85)},
    {"city": "Faridabad", "lat_range": (28.38, 28.48), "lng_range": (77.28, 77.38)},
    {"city": "Meerut", "lat_range": (28.95, 29.05), "lng_range": (77.68, 77.78)},
    {"city": "Rajkot", "lat_range": (22.28, 22.35), "lng_range": (70.78, 70.85)},
    {"city": "Varanasi", "lat_range": (25.28, 25.38), "lng_range": (82.98, 83.08)},
    {"city": "Srinagar", "lat_range": (34.05, 34.15), "lng_range": (74.78, 74.88)},
    {"city": "Amritsar", "lat_range": (31.60, 31.70), "lng_range": (74.85, 74.95)},
    {"city": "Allahabad", "lat_range": (25.40, 25.50), "lng_range": (81.82, 81.92)},
    {"city": "Coimbatore", "lat_range": (10.98, 11.08), "lng_range": (76.93, 77.03)},
    {"city": "Jabalpur", "lat_range": (23.15, 23.20), "lng_range": (79.93, 80.00)},
    {"city": "Gwalior", "lat_range": (26.20, 26.25), "lng_range": (78.15, 78.22)},
    {"city": "Vijayawada", "lat_range": (16.50, 16.55), "lng_range": (80.62, 80.68)},
    {"city": "Jodhpur", "lat_range": (26.27, 26.32), "lng_range": (73.00, 73.05)},
    {"city": "Madurai", "lat_range": (9.90, 9.95), "lng_range": (78.10, 78.15)},
    {"city": "Raipur", "lat_range": (21.23, 21.28), "lng_range": (81.62, 81.67)},
    {"city": "Kochi", "lat_range": (9.93, 10.00), "lng_range": (76.25, 76.32)},
    {"city": "Chandigarh", "lat_range": (30.72, 30.78), "lng_range": (76.76, 76.82)},
    {"city": "Guwahati", "lat_range": (26.15, 26.20), "lng_range": (91.73, 91.80)},
    {"city": "Thiruvananthapuram", "lat_range": (8.48, 8.55), "lng_range": (76.93, 77.00)},
]

def generate_person(person_id):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    name = f"{first_name} {last_name}"
    
    sport = random.choice(sports)
    level = random.choice(levels)
    
    location = random.choice(indian_locations)
    lat = round(random.uniform(location["lat_range"][0], location["lat_range"][1]), 6)
    lng = round(random.uniform(location["lng_range"][0], location["lng_range"][1]), 6)
    
    age = random.randint(18, 45)
    gender = random.choice(["Male", "Female"])
    state = "India" # Placeholder as city mapping to state is not in indian_locations

    return {
        "id": person_id,
        "name": name,
        "sport": sport,
        "level": level,
        "city": location["city"],
        "state": state,
        "age": age,
        "gender": gender,
        "latitude": lat,
        "longitude": lng
    }

# Generate 1000 people
people = [generate_person(i + 1) for i in range(1000)]

# Save as JSON
with open("people_india_sports.json", "w", encoding="utf-8") as f:
    json.dump(people, f, indent=2, ensure_ascii=False)

# Save as CSV
with open("people_india_sports.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["id", "name", "sport", "level", "city", "state", "age", "gender", "latitude", "longitude"])
    writer.writeheader()
    writer.writerows(people)

print("✅ Generated 1000 people dataset!")
print(f"📁 JSON file: people_india_sports.json")
print(f"📁 CSV file: people_india_sports.csv")
print(f"\n📊 Sample data:")
for person in people[:5]:
    print(f"   {person['name']} | {person['sport']} ({person['level']}) | {person['city']} [{person['latitude']}, {person['longitude']}]")
