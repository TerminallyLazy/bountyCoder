# BountyCoder: Qwen 32B API Service Documentation

This comprehensive guide documents the BountyCoder platform, which provides a managed API service for the Qwen 32B Coder model. The documentation covers both administrator and end-user perspectives.

## Table of Contents

1. [Platform Overview](#platform-overview)
2. [Admin Dashboard Guide](#admin-dashboard-guide)
3. [API Documentation](#api-documentation)
4. [Customer Integration Guide](#customer-integration-guide)
5. [Monitoring and Analytics](#monitoring-and-analytics)
6. [Deployment and Scaling](#deployment-and-scaling)
7. [Troubleshooting](#troubleshooting)

## Platform Overview

BountyCoder provides a managed API service for the Qwen 32B Coder model, offering:

- **High-performance AI code generation**: Minimum 30 tokens/second generation speed
- **Multi-tenant architecture**: Support for up to 10,000 users
- **Customizable rate limits**: Per-customer API throttling
- **Usage-based billing**: Track token consumption per customer
- **Comprehensive monitoring**: Real-time performance and usage metrics
- **Secure authentication**: API key-based access control

The platform consists of the following components:

- **Admin Dashboard**: Web interface for managing users, API keys, and monitoring usage
- **Backend API**: RESTful API for model interaction and administration
- **LLM Service**: Containerized Qwen 32B model deployment
- **Database**: PostgreSQL for user and API key management
- **Monitoring**: Prometheus and Grafana for performance tracking

## Admin Dashboard Guide

### Initial Setup

1. **Access the Admin Dashboard**
   - URL: `http://localhost:3030` (default) or your custom domain
   - Default admin credentials:
     - Email: `admin@bountycoder.com`
     - Password: `admin123`

2. **Update Admin Password**
   - Navigate to Settings → Change Password
   - Enter current password and create a new secure password

### User Management

1. **View All Users**
   - Navigate to the Customers page
   - View list of all users with role, API key count, and creation date

2. **Create New User**
   - Click "Add Customer" button
   - Fill in required details:
     - Name (optional)
     - Email (required)
     - Password (required, minimum 8 characters)
     - Role (Customer or Admin)

3. **Edit User**
   - Click the edit icon next to a user
   - Modify name, email, password, or role
   - Click "Save" to apply changes

4. **Delete User**
   - Click the delete icon next to a user
   - Confirm deletion in the popup dialog
   - Note: This will delete all associated API keys

### API Key Management

1. **View All API Keys**
   - Navigate to the API Keys page
   - View list of all keys with owner, rate limit, status, and last used date

2. **Create New API Key**
   - Click "Create API Key" button
   - Fill in required details:
     - Name (descriptive label for the API key)
     - Rate Limit (requests per minute, default: 60)
   - If creating as Admin, select user to associate with the key

3. **Edit API Key**
   - Click the edit icon next to an API key
   - Modify name, rate limit, or active status
   - Click "Save" to apply changes

4. **Revoke API Key**
   - Click the delete icon next to an API key
   - Confirm deletion in the popup dialog
   - Note: This action cannot be undone

### Dashboard Overview

The main dashboard provides an overview of:

- Total users and API keys
- Token usage statistics (daily/monthly)
- Active API keys and usage patterns
- System performance metrics

## API Documentation

### Authentication

All API requests require authentication using:

1. **JWT Token** for admin operations:
   - Obtained by logging into the admin dashboard
   - Included in requests as: `Authorization: Bearer <jwt_token>`

2. **API Key ID** for model access:
   - Included in requests as: `x-api-key-id: <api_key_id>`

### API Endpoints

#### Authentication Endpoints

```
POST /api/auth/login
POST /api/auth/register
GET /api/auth/me
```

#### API Key Management

```
GET /api/keys
GET /api/keys/:id
POST /api/keys
PUT /api/keys/:id
DELETE /api/keys/:id
```

#### User Management

```
GET /api/users
GET /api/users/:id
PUT /api/users/:id
DELETE /api/users/:id
```

#### LLM Model Endpoints

```
POST /api/llm/generate
GET /api/llm/models
```

### Text Generation API

#### Request Format

```
POST /api/llm/generate
```

Headers:
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
x-api-key-id: <api_key_id>
```

Body:
```json
{
  "prompt": "Write a function to calculate Fibonacci numbers",
  "maxTokens": 500,
  "temperature": 0.7,
  "topP": 1.0,
  "stop": ["###", "```"] // Optional stop sequences
}
```

#### Response Format

```json
{
  "id": "gen_1234567890",
  "object": "text_completion",
  "created": 1734214455,
  "model": "qwen-32b-coder",
  "choices": [
    {
      "text": "// Function to calculate Fibonacci numbers\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\n",
      "index": 0,
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 25,
    "completion_tokens": 45,
    "total_tokens": 70
  }
}
```

### Rate Limiting

- Each API key has a configurable rate limit (default: 60 requests per minute)
- When rate limit is exceeded, the API returns HTTP 429 with a retry-after header
- Usage counts are reset at the beginning of each minute

## Customer Integration Guide

### Getting Started

1. **Obtain API Credentials**
   - Request API access through the BountyCoder admin
   - Receive API key ID for authentication
   - Store API credentials securely; never expose in client-side code

2. **API Base URL**
   - Production: `https://api.bountycoder.com`
   - Development: `http://localhost:5000`

### Integration Examples

#### cURL Example

```bash
curl -X POST https://api.bountycoder.com/api/llm/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "x-api-key-id: <api_key_id>" \
  -d '{
    "prompt": "Write a function to calculate Fibonacci numbers",
    "maxTokens": 500,
    "temperature": 0.7
  }'
```

#### Python Example

```python
import requests

API_URL = "https://api.bountycoder.com/api/llm/generate"
JWT_TOKEN = "your_jwt_token"
API_KEY_ID = "your_api_key_id"

headers = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {JWT_TOKEN}",
    "x-api-key-id": API_KEY_ID
}

data = {
    "prompt": "Write a function to calculate Fibonacci numbers",
    "maxTokens": 500,
    "temperature": 0.7
}

response = requests.post(API_URL, headers=headers, json=data)
result = response.json()

print(result["choices"][0]["text"])
```

#### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_URL = 'https://api.bountycoder.com/api/llm/generate';
const JWT_TOKEN = 'your_jwt_token';
const API_KEY_ID = 'your_api_key_id';

async function generateText(prompt) {
  try {
    const response = await axios.post(
      API_URL,
      {
        prompt,
        maxTokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JWT_TOKEN}`,
          'x-api-key-id': API_KEY_ID
        }
      }
    );
    
    return response.data.choices[0].text;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

generateText('Write a function to calculate Fibonacci numbers')
  .then(text => console.log(text))
  .catch(err => console.error(err));
```

### Best Practices

1. **Implement Error Handling**
   - Handle rate limit errors (HTTP 429) with exponential backoff
   - Add timeout handling for long-running requests
   - Implement retry logic for transient errors

2. **Optimize Token Usage**
   - Set appropriate maxTokens to avoid unnecessary token consumption
   - Use clear, concise prompts to minimize input tokens
   - Cache common responses when appropriate

3. **Security Considerations**
   - Never expose API credentials in client-side code
   - Use a backend service to proxy requests to the API
   - Implement proper authentication for your own users

## Monitoring and Analytics

### Admin Dashboard Metrics

The admin dashboard provides detailed metrics on:

1. **Usage Statistics**
   - Tokens consumed per API key
   - Requests per minute/hour/day
   - Success/failure rates
   - Average response times

2. **User Activity**
   - Active users and API keys
   - Top users by token consumption
   - Recent activity log

### Monitoring with Grafana

For more detailed monitoring, Grafana dashboards are available at:
`http://localhost:3000` (default) with credentials:
- Username: `admin`
- Password: `admin`

The following dashboards are available:

1. **System Performance**
   - CPU, memory, and GPU utilization
   - Network and disk I/O
   - Container health

2. **API Usage**
   - Request volume and latency
   - Error rates and types
   - Token generation speed

3. **User Analytics**
   - User growth trends
   - API key utilization
   - Token consumption patterns

### Alert Configuration

Configure alerts for:
- High token usage
- Elevated error rates
- System performance degradation
- Rate limit violations

## Deployment and Scaling

### Deployment Options

The BountyCoder platform can be deployed using:

1. **Docker Compose** (Development/Testing)
   ```bash
   docker-compose up -d
   ```

2. **Cloud Provider Deployment** (Production)
   - RunPod (recommended)
   - Lambda Labs (alternative)
   
   See [Cloud Deployment Guide](cloud/DEPLOYMENT.md) for details

### Hardware Requirements

| Requirement | Specification |
|-------------|---------------|
| GPU | NVIDIA A100 80GB or H100 |
| Memory | 80GB+ GPU memory |
| Storage | 100GB+ SSD |
| Network | 10Gbps+ |

### Scaling Strategies

To support up to 10,000 users:

1. **Horizontal Scaling**
   - Auto-scaling based on GPU utilization
   - Minimum 2 replicas for high availability
   - Maximum 10 replicas for peak demand

2. **Load Balancing**
   - NGINX load balancer with least connections algorithm
   - Health checks for service reliability
   - Session affinity for consistent performance

3. **Database Scaling**
   - PostgreSQL replication for high availability
   - Regular backups and monitoring

### Cost Optimization

Estimated monthly costs:
- RunPod A100 80GB: $1,500 - $2,000 per instance
- 3-month projection (2-10 instances): $9,000 - $60,000

Optimization strategies:
- Scale down during low-usage periods
- Implement token caching for common queries
- Monitor and adjust resource allocation

## Troubleshooting

### Common Issues

1. **API Key Authentication Issues**
   - Verify that the API key is active in the admin dashboard
   - Ensure the correct API key ID is being used in the x-api-key-id header
   - Check that the JWT token is valid and not expired

2. **Rate Limit Exceeded**
   - Implement exponential backoff and retry logic
   - Consider requesting a higher rate limit for the API key
   - Optimize request patterns to reduce frequency

3. **High Latency**
   - Check current system load in monitoring dashboard
   - Reduce maxTokens parameter for faster responses
   - Verify network connectivity between client and API

4. **Model Errors**
   - Ensure prompts are well-formed and not too complex
   - Check system logs for model-specific errors
   - Verify GPU health and temperature

### Support Channels

For additional support:
- Email: support@bountycoder.com
- Documentation: https://docs.bountycoder.com
- GitHub Issues: https://github.com/TerminallyLazy/bountyCoder/issues

