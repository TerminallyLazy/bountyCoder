FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Expose the application port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production

# Run database migrations and start the application
CMD ["sh", "-c", "npm run migrate && npm start"]
