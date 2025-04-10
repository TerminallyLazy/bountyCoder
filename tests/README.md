# Testing and Optimization Tools for Qwen 32B API

This directory contains tools for testing and optimizing the performance of the Qwen 32B API service to ensure it meets the requirements of:

- Minimum performance of 30 tokens/second
- Custom rate limits per customer
- Scalability up to 10,000 users
- 3-month uptime guarantee

## Tools

### Load Testing

The `load_test.js` script performs comprehensive load testing of the API service to verify performance and scalability:

- **Performance Testing**: Verifies the system meets the minimum 30 tokens/second requirement
- **Rate Limit Testing**: Tests custom rate limits for different customers
- **Scalability Testing**: Simulates load from up to 10,000 concurrent users
- **Throughput Analysis**: Measures requests per second and tokens per second over time

#### Usage

```bash
# Basic load test with default settings
node load_test.js

# Custom load test with specific parameters
API_URL=https://api.example.com API_KEY=your-api-key CONCURRENT_USERS=1000 node load_test.js
```

#### Configuration

The load test can be configured using environment variables:

- `API_URL`: URL of the API service (default: http://localhost:5000)
- `API_KEY`: API key for authentication (default: test-api-key)
- `CONCURRENT_USERS`: Number of concurrent users to simulate (default: 100)
- `REQUESTS_PER_USER`: Number of requests per user (default: 10)
- `RAMP_UP_TIME`: Time in seconds to ramp up to full load (default: 30)
- `TEST_DURATION`: Total test duration in seconds (default: 300)

### Performance Optimization

The `performance_optimizer.js` script analyzes and optimizes the system for maximum performance:

- **LLM Service Optimization**: Optimizes the Qwen 32B model configuration
- **Backend Optimization**: Implements request batching and response caching
- **NGINX Optimization**: Configures for optimal load balancing and throughput
- **Docker Compose Optimization**: Sets resource limits and health checks

#### Usage

```bash
# Run the performance optimizer
node performance_optimizer.js
```

## Running Tests

To verify that the system meets all requirements:

1. **Run the Performance Optimizer**
   ```bash
   node performance_optimizer.js
   ```

2. **Run the Load Test**
   ```bash
   node load_test.js
   ```

3. **Analyze Results**
   - Check if tokens per second meets the minimum 30 tokens/second requirement
   - Verify custom rate limits are enforced correctly
   - Confirm the system can scale to 10,000 users
   - Ensure high availability for 3-month uptime guarantee

## Integration with Monitoring

The testing tools integrate with the monitoring system to provide real-time performance metrics:

- Performance metrics are exposed via Prometheus
- Grafana dashboards visualize test results
- Alerts are triggered if performance falls below requirements

## Continuous Testing

For continuous verification of system performance:

1. **Schedule Regular Tests**
   ```bash
   # Add to crontab for daily testing
   0 0 * * * cd /path/to/bountyCoder && node tests/load_test.js >> /var/log/performance_tests.log
   ```

2. **Monitor Results**
   - Check the Grafana dashboard for performance trends
   - Review test logs for any performance degradation
   - Address any alerts from the monitoring system
