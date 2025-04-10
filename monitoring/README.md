# Monitoring and Analytics for Qwen 32B API

This directory contains the monitoring and analytics configuration for the Qwen 32B API service. The monitoring system is designed to ensure the service meets the requirements of:

- Minimum performance of 30 tokens/second
- Custom rate limits per customer
- Scalability up to 10,000 users
- 3-month uptime guarantee

## Components

### Prometheus

Prometheus is used for metrics collection and alerting. The configuration includes:

- **prometheus.yml**: Main configuration file for Prometheus
- **rules/alerts.yml**: Alert rules for performance, availability, and resource usage

### Grafana

Grafana is used for visualization and dashboards. The configuration includes:

- **grafana.ini**: Main configuration file for Grafana
- **dashboards/overview.json**: Overview dashboard with key metrics
- **dashboards/customer_usage.json**: Customer-specific usage dashboard

## Metrics

The monitoring system tracks the following key metrics:

1. **Performance Metrics**
   - Token generation rate (tokens/second)
   - Request latency (seconds)
   - GPU utilization (%)

2. **Usage Metrics**
   - Total tokens generated
   - Tokens per API key
   - Requests per API key

3. **Rate Limiting Metrics**
   - Rate limited requests
   - Custom rate limit usage

4. **Availability Metrics**
   - Service uptime
   - Error rates
   - Failed requests

## Alerts

The monitoring system includes alerts for:

1. **Performance Alerts**
   - Low token generation rate (below 30 tokens/second)
   - High request latency

2. **Rate Limit Alerts**
   - Rate limit exceeded consistently

3. **Availability Alerts**
   - Service down
   - High error rate

4. **Resource Alerts**
   - High GPU utilization
   - High memory usage
   - High disk usage

## Dashboards

### Overview Dashboard

The overview dashboard provides a high-level view of the system, including:

- Token generation rate
- Request latency
- Service uptime
- GPU utilization
- Total requests and tokens

### Customer Usage Dashboard

The customer usage dashboard provides customer-specific metrics, including:

- Token usage by API key
- Request rate by API key
- Rate limited requests by API key
- Error requests by API key

## Setup

To set up the monitoring system:

1. **Deploy Prometheus**
   ```bash
   docker-compose up -d prometheus
   ```

2. **Deploy Grafana**
   ```bash
   docker-compose up -d grafana
   ```

3. **Access Dashboards**
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000 (admin/admin)

## Integration with LLM Service

The LLM service exposes metrics at `/metrics` endpoint, which are collected by Prometheus. The metrics include:

- `llm_requests_total`: Total number of requests
- `llm_request_latency_seconds`: Request latency in seconds
- `llm_tokens_generated_total`: Total number of tokens generated
- `llm_tokens_processed_total`: Total number of tokens processed

These metrics are used to monitor the performance and usage of the LLM service.
