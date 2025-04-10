import requests
import json
import time
import subprocess
import sys
import os
import signal

def start_llm_service():
    """Start the LLM service in a separate process"""
    print("Starting LLM service...")
    # Change directory to the llm-service directory
    service_dir = os.path.join(os.getcwd(), "llm-service")
    
    # Run the service without reload mode
    cmd = [sys.executable, "-c", 
           "import sys; sys.path.append('{}'); ".format(service_dir) + 
           "from app import app; " + 
           "import uvicorn; " + 
           "uvicorn.run(app, host='127.0.0.1', port=8007, log_level='info')"]
    
    # Start the process
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    
    # Give it time to start
    time.sleep(3)
    
    # Check if process is still running and show any output
    if process.poll() is not None:
        stdout, stderr = process.communicate()
        print("Service failed to start!")
        print("STDOUT:", stdout)
        print("STDERR:", stderr)
        return None
    
    return process

def stop_service(process):
    """Stop the LLM service process"""
    if process:
        print("Stopping LLM service...")
        os.kill(process.pid, signal.SIGTERM)
        process.wait()
        print("Service stopped.")

def test_health(base_url="http://127.0.0.1:8007"):
    """Test the health endpoint"""
    urls = [
        f"{base_url}/health",
        f"{base_url.replace('127.0.0.1', 'localhost')}/health"
    ]
    
    for url in urls:
        print(f"Testing health at {url}")
        try:
            response = requests.get(url, timeout=5)
            print(f"Success! Status code: {response.status_code}")
            print(f"Response: {response.json()}")
            return True, base_url
        except Exception as e:
            print(f"Error: {str(e)}")
    
    return False, None

def test_generate(base_url, prompt="Write a function to calculate fibonacci numbers"):
    """Test the generate endpoint"""
    url = f"{base_url}/generate"
    print(f"Testing generation at {url}")
    
    payload = {
        "prompt": prompt,
        "max_tokens": 512,
        "temperature": 0.7,
        "top_p": 1.0,
        "api_key_id": "test-key"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        print(f"Status code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True, response.json()
    except Exception as e:
        print(f"Error: {str(e)}")
        return False, None

if __name__ == "__main__":
    # Start the service
    service_process = start_llm_service()
    
    try:
        # Test the health endpoint
        success, base_url = test_health()
        
        if success and base_url:
            # Test the generate endpoint
            test_generate(base_url)
        else:
            print("Health check failed - cannot test generation.")
    finally:
        # Stop the service
        stop_service(service_process) 