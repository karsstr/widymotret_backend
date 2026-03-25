# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY src ./src
COPY prisma ./prisma

# Build TypeScript
RUN npx tsc

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy package files for production
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy migrations
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start app
CMD ["node", "dist/index.js"]
