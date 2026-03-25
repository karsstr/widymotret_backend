# Build stage
FROM node:22-alpine as builder

WORKDIR /app

# Copy all files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Install dependencies
RUN npm ci

# Build TypeScript
RUN npm run build 2>/dev/null || npx tsc

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy build output and prisma
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start app
CMD ["node", "dist/index.js"]
