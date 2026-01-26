import json
import random

# Read the existing JSON file
with open('people_india_sports.json', 'r') as f:
    data = json.load(f)

# Add role and deepLink to existing players
for person in data:
    person['role'] = 'player'
    person['deepLink'] = f"sportsbuddy://profile/{person['id']}?name={person['name'].replace(' ', '%20')}&sport={person['sport'].replace(' ', '%20')}"

# Coach data to add
coaches = [
    {
        "id": 1001,
        "name": "Rajesh Kumar",
        "sport": "Cricket",
        "level": "Professional Coach",
        "city": "Mumbai",
        "state": "India",
        "age": 45,
        "gender": "Male",
        "latitude": 19.076090,
        "longitude": 72.877426,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1001?name=Rajesh%20Kumar&sport=Cricket"
    },
    {
        "id": 1002,
        "name": "Priya Sharma",
        "sport": "Badminton",
        "level": "National Level Coach",
        "city": "Delhi",
        "state": "India",
        "age": 38,
        "gender": "Female",
        "latitude": 28.704060,
        "longitude": 77.102493,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1002?name=Priya%20Sharma&sport=Badminton"
    },
    {
        "id": 1003,
        "name": "Amit Patel",
        "sport": "Football",
        "level": "Professional Coach",
        "city": "Bangalore",
        "state": "India",
        "age": 42,
        "gender": "Male",
        "latitude": 12.971599,
        "longitude": 77.594566,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1003?name=Amit%20Patel&sport=Football"
    },
    {
        "id": 1004,
        "name": "Sneha Reddy",
        "sport": "Basketball",
        "level": "State Level Coach",
        "city": "Hyderabad",
        "state": "India",
        "age": 35,
        "gender": "Female",
        "latitude": 17.385044,
        "longitude": 78.486671,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1004?name=Sneha%20Reddy&sport=Basketball"
    },
    {
        "id": 1005,
        "name": "Vikram Singh",
        "sport": "Hockey",
        "level": "National Level Coach",
        "city": "Chandigarh",
        "state": "India",
        "age": 50,
        "gender": "Male",
        "latitude": 30.733315,
        "longitude": 76.779419,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1005?name=Vikram%20Singh&sport=Hockey"
    },
    {
        "id": 1006,
        "name": "Anjali Desai",
        "sport": "Tennis",
        "level": "Professional Coach",
        "city": "Pune",
        "state": "India",
        "age": 40,
        "gender": "Female",
        "latitude": 18.520430,
        "longitude": 73.856744,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1006?name=Anjali%20Desai&sport=Tennis"
    },
    {
        "id": 1007,
        "name": "Karan Mehta",
        "sport": "Swimming",
        "level": "State Level Coach",
        "city": "Ahmedabad",
        "state": "India",
        "age": 37,
        "gender": "Male",
        "latitude": 23.022505,
        "longitude": 72.571362,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1007?name=Karan%20Mehta&sport=Swimming"
    },
    {
        "id": 1008,
        "name": "Meera Iyer",
        "sport": "Gymnastics",
        "level": "National Level Coach",
        "city": "Chennai",
        "state": "India",
        "age": 43,
        "gender": "Female",
        "latitude": 13.082680,
        "longitude": 80.270721,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1008?name=Meera%20Iyer&sport=Gymnastics"
    },
    {
        "id": 1009,
        "name": "Arjun Nair",
        "sport": "Kabaddi",
        "level": "Professional Coach",
        "city": "Jaipur",
        "state": "India",
        "age": 48,
        "gender": "Male",
        "latitude": 26.912434,
        "longitude": 75.787270,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1009?name=Arjun%20Nair&sport=Kabaddi"
    },
    {
        "id": 1010,
        "name": "Divya Kulkarni",
        "sport": "Volleyball",
        "level": "State Level Coach",
        "city": "Kolkata",
        "state": "India",
        "age": 39,
        "gender": "Female",
        "latitude": 22.572646,
        "longitude": 88.363895,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1010?name=Divya%20Kulkarni&sport=Volleyball"
    },
    {
        "id": 1011,
        "name": "Rohan Gupta",
        "sport": "Athletics",
        "level": "National Level Coach",
        "city": "Lucknow",
        "state": "India",
        "age": 44,
        "gender": "Male",
        "latitude": 26.846694,
        "longitude": 80.946166,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1011?name=Rohan%20Gupta&sport=Athletics"
    },
    {
        "id": 1012,
        "name": "Kavita Joshi",
        "sport": "Boxing",
        "level": "Professional Coach",
        "city": "Nagpur",
        "state": "India",
        "age": 41,
        "gender": "Female",
        "latitude": 21.145800,
        "longitude": 79.088158,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1012?name=Kavita%20Joshi&sport=Boxing"
    },
    {
        "id": 1013,
        "name": "Sanjay Thakur",
        "sport": "Wrestling",
        "level": "National Level Coach",
        "city": "Ludhiana",
        "state": "India",
        "age": 46,
        "gender": "Male",
        "latitude": 30.900965,
        "longitude": 75.857276,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1013?name=Sanjay%20Thakur&sport=Wrestling"
    },
    {
        "id": 1014,
        "name": "Pooja Bansal",
        "sport": "Table Tennis",
        "level": "State Level Coach",
        "city": "Indore",
        "state": "India",
        "age": 36,
        "gender": "Female",
        "latitude": 22.719568,
        "longitude": 75.857727,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1014?name=Pooja%20Bansal&sport=Table%20Tennis"
    },
    {
        "id": 1015,
        "name": "Aditya Malhotra",
        "sport": "Archery",
        "level": "Professional Coach",
        "city": "Bhopal",
        "state": "India",
        "age": 47,
        "gender": "Male",
        "latitude": 23.259933,
        "longitude": 77.412615,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1015?name=Aditya%20Malhotra&sport=Archery"
    },
    {
        "id": 1016,
        "name": "Ritu Chopra",
        "sport": "Shooting",
        "level": "National Level Coach",
        "city": "Ghaziabad",
        "state": "India",
        "age": 40,
        "gender": "Female",
        "latitude": 28.669155,
        "longitude": 77.453758,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1016?name=Ritu%20Chopra&sport=Shooting"
    },
    {
        "id": 1017,
        "name": "Manish Saxena",
        "sport": "Cycling",
        "level": "State Level Coach",
        "city": "Kochi",
        "state": "India",
        "age": 38,
        "gender": "Male",
        "latitude": 9.931233,
        "longitude": 76.267303,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1017?name=Manish%20Saxena&sport=Cycling"
    },
    {
        "id": 1018,
        "name": "Neha Agarwal",
        "sport": "Yoga",
        "level": "Professional Coach",
        "city": "Varanasi",
        "state": "India",
        "age": 34,
        "gender": "Female",
        "latitude": 25.321684,
        "longitude": 82.987289,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1018?name=Neha%20Agarwal&sport=Yoga"
    },
    {
        "id": 1019,
        "name": "Rahul Verma",
        "sport": "Martial Arts",
        "level": "National Level Coach",
        "city": "Surat",
        "state": "India",
        "age": 45,
        "gender": "Male",
        "latitude": 21.170240,
        "longitude": 72.831062,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1019?name=Rahul%20Verma&sport=Martial%20Arts"
    },
    {
        "id": 1020,
        "name": "Simran Kaur",
        "sport": "Handball",
        "level": "State Level Coach",
        "city": "Amritsar",
        "state": "India",
        "age": 37,
        "gender": "Female",
        "latitude": 31.633980,
        "longitude": 74.872261,
        "role": "coach",
        "deepLink": "sportsbuddy://profile/1020?name=Simran%20Kaur&sport=Handball"
    }
]

# Add coaches to the data
data.extend(coaches)

# Write the updated JSON back to file
with open('people_india_sports.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"✅ Updated JSON file successfully!")
print(f"   - Added 'role' field to all {len(data) - len(coaches)} existing players")
print(f"   - Added 'deepLink' field to all {len(data)} users")
print(f"   - Added {len(coaches)} new coaches")
print(f"   - Total users: {len(data)}")
