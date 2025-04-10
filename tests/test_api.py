import requests
import json
import time

# Let's test various possible endpoints
endpoints = [
    "http://localhost:8007",
    "http://127.0.0.1:8007",
    "http://localhost:8005",
    "http://127.0.0.1:8005",
    "http://0.0.0.0:8005",
    "http://localhost:8000",
    "http://127.0.0.1:8000"
]

# Test health endpoint first
for url in endpoints:
    health_url = f"{url}/health"
    print(f"Testing health at {health_url}")
    try:
        response = requests.get(health_url, timeout=2)
        print(f"Success! Status code: {response.status_code}")
        print(f"Response: {response.json()}")
        working_url = url
        break
    except Exception as e:
        print(f"Error: {str(e)}")
        print("----")
else:
    print("Couldn't connect to any endpoint.")
    working_url = None

# If we found a working URL, try to generate something
if working_url:
    generate_url = f"{working_url}/generate"
    print(f"\nTesting generation at {generate_url}")
    payload = {
        "prompt": "Write a function to calculate fibonacci numbers",
        "max_tokens": 512,
        "temperature": 0.7,
        "top_p": 1.0,
        "api_key_id": "test-key"
    }
    
    try:
        response = requests.post(generate_url, json=payload, timeout=10)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {str(e)}") 