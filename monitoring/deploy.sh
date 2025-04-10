#!/bin/bash

# Deploy Prometheus and Grafana monitoring stack
# This script deploys the monitoring stack using Docker Compose

# Set default values for environment variables
export GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running or not installed"
  exit 1
fi

# Check if Docker Compose is installed
if ! docker-compose --version > /dev/null 2>&1; then
  echo "Error: Docker Compose is not installed"
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file with default values"
  echo "GRAFANA_ADMIN_PASSWORD=admin" > .env
  echo "# SLACK_WEBHOOK_URL=https://hooks.slack.com/services/your/webhook/url" >> .env
  echo "# SMTP_PASSWORD=your_smtp_password" >> .env
  echo ""
  echo "WARNING: Using default admin password for Grafana. Please change it in .env file."
  echo ""
fi

# Deploy the monitoring stack
echo "Deploying Prometheus and Grafana monitoring stack..."
docker-compose up -d

# Check if deployment was successful
if [ $? -eq 0 ]; then
  echo ""
  echo "Monitoring stack deployed successfully!"
  echo ""
  echo "Services:"
  echo "- Prometheus: http://localhost:9090"
  echo "- Grafana: http://localhost:3000 (admin/${GRAFANA_ADMIN_PASSWORD})"
  echo "- AlertManager: http://localhost:9093"
  echo ""
  echo "To stop the monitoring stack, run: docker-compose down"
else
  echo "Error: Failed to deploy monitoring stack"
  exit 1
fi
