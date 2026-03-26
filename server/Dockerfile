# Build stage with dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy node_modules and source from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/tsconfig.json ./

# Copy application code
COPY package*.json ./
COPY prisma ./prisma
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Create entrypoint script to run migrations before app start
RUN echo '#!/bin/sh\necho "Running database migrations..."\nnpx prisma migrate deploy\necho "Migrations completed"\necho "Starting application..."\nnpm start' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8080

# Use entrypoint to run migrations then start app
ENTRYPOINT ["/app/entrypoint.sh"]
