FROM node:22-alpine

WORKDIR /app

# Copy project files
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

# Install all dependencies (including dev deps for ts-node runtime)
RUN npm ci

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start app using explicit start command
CMD ["npm", "start"]
