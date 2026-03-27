# Build stage with dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Compile TypeScript to JavaScript
RUN npm run build

# Runtime stage
FROM node:22-alpine

WORKDIR /app

# Copy only production dependencies and compiled output
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/tsconfig.json ./
COPY package*.json ./
COPY prisma ./prisma

# Expose port
EXPOSE 8080

# Start app
CMD ["npm", "start"]
