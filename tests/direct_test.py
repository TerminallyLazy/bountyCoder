import sys
import os
import json
import asyncio
from fastapi import BackgroundTasks

# Path to your LLM service
service_dir = os.path.join(os.getcwd(), "llm-service")
sys.path.append(service_dir)

try:
    from app import app, generate, GenerateRequest
    
    async def test_direct_call():
        """Test direct function call to the LLM service"""
        print("Testing direct function call...")
        
        # Create a request object
        request = GenerateRequest(
            prompt="Write a function to calculate fibonacci numbers",
            max_tokens=512,
            temperature=0.7,
            top_p=1.0, 
            api_key_id="test-key"
        )
        
        # Create a background tasks object
        background_tasks = BackgroundTasks()
        
        try:
            # Call the generate function directly
            response = await generate(request, background_tasks, "test-key")
            print("Response from direct call:")
            print(json.dumps(response, indent=2, default=str))
            return response
        except Exception as e:
            print(f"Error calling generate: {str(e)}")
            return None
    
    # Run the async function
    response = asyncio.run(test_direct_call())
    
    # Test response for a code example
    if response and response.get("choices"):
        generated_code = response["choices"][0]["text"]
        print("\nGenerated Code:")
        print(generated_code)
except Exception as e:
    print(f"Error importing app: {str(e)}") 