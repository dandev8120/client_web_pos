# Multi-stage Dockerfile for POS CENTER - Biti's
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definition files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy full application code
COPY . .

# Build application bundle (Vite + Express backend)
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy built dist files from builder
COPY --from=builder /app/dist ./dist

# Expose container port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
