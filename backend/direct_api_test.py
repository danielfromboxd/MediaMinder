import requests
import json

# Get your token
token = input("Enter your JWT token (from localStorage): ")

# Base URL
base_url = "http://localhost:5000/api"

# Headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {token}'
}

# Test data
test_data = {
    "media_id": "123456",
    "title": "Test Movie",
    "media_type": "movie",
    "status": "want_to_view",
    "poster_path": "https://example.com/poster.jpg"
}

# Make the request
print(f"Sending POST request to {base_url}/media")
print(f"Headers: {headers}")
print(f"Data: {test_data}")

response = requests.post(f"{base_url}/media", headers=headers, json=test_data)

print(f"Status Code: {response.status_code}")
print("Response Headers:")
for key, value in response.headers.items():
    print(f"  {key}: {value}")
print("Response Body:")
try:
    print(json.dumps(response.json(), indent=2))
except:
    print(response.text)