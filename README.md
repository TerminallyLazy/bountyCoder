# BountyCoder: Admin Dashboard for Qwen 32B API Service

This repository contains the admin dashboard web application for hosting and managing a Qwen 32B coder API service.

## Features

- API key management for individual customers
- Minimum performance of 30 tokens/second
- Custom rate limits per customer
- Scalability up to 10,000 users
- 3-month uptime guarantee
- Cloud GPU provider integration

## Project Structure

- **frontend/**: React.js frontend application
- **backend/**: Node.js Express backend API
- **llm-service/**: Qwen 32B model service
- **monitoring/**: Prometheus and Grafana monitoring
- **cloud/**: Cloud GPU provider configurations
- **tests/**: Testing and optimization tools

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Docker (for LLM service)
- NVIDIA GPU (for local LLM service)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/TerminallyLazy/bountyCoder.git
   cd bountyCoder
   ```

2. Install backend dependencies
   ```bash
   cd backend
   npm install
   ```

3. Set up the database
   ```bash
   npm run migrate
   ```

4. Install frontend dependencies
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend (runs on port 3030)
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the dashboard at http://localhost:3030

## Configuration

### Frontend

The frontend application runs on port 3030 by default. You can modify this by creating a `.env` file in the frontend directory:

```
PORT=3030
```

### Backend

Configure the backend by modifying the `.env` file in the backend directory:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bountycoder"
```

## Deployment

For production deployment, follow the instructions in the [Cloud Deployment Guide](cloud/DEPLOYMENT.md).

## Monitoring

The monitoring system uses Prometheus and Grafana to track:
- Token generation rate
- API key usage
- System performance
- Custom rate limits

## Testing

Use the testing tools in the `tests/` directory to verify:
- Performance (30 tokens/second)
- Scalability (up to 10,000 users)
- Custom rate limits
- System reliability

## License

This project is proprietary and confidential.


