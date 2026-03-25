# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copy all files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Install all dependencies
RUN npm ci

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy source (run TypeScript directly via tsx or ts-node)
COPY src ./src
COPY prisma ./prisma

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start app with tsx to run TypeScript directly
CMD ["npx", "tsx", "src/index.ts"]
