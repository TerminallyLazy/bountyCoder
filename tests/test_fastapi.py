import requests

urls = [
    "http://localhost:8020/health",
    "http://127.0.0.1:8020/health",
    "http://0.0.0.0:8020/health"
]

for url in urls:
    print(f"Testing {url}")
    try:
        response = requests.get(url, timeout=2)
        print(f"Status: {response.status_code}")
        print(f"Content: {response.json()}")
        print("Success!")
        break
    except Exception as e:
        print(f"Error: {str(e)}")
        print("----") 