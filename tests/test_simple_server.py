import requests

urls = [
    "http://localhost:8010",
    "http://127.0.0.1:8010",
    "http://0.0.0.0:8010"
]

for url in urls:
    print(f"Testing {url}")
    try:
        response = requests.get(url, timeout=2)
        print(f"Status: {response.status_code}")
        print(f"Content: {response.text}")
        print("Success!")
        break
    except Exception as e:
        print(f"Error: {str(e)}")
        print("----") 