# Multi-stage Dockerfile for POS CENTER - Biti's
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package definition files
COPY package.json pnpm-lock.yaml ./

# Enable pnpm through Corepack
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy full application code
COPY . .

# Build application bundle (Vite + Express backend)
RUN pnpm run build

# Production runtime stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate
RUN pnpm install --prod --frozen-lockfile

# Copy built dist files from builder
COPY --from=builder /app/dist ./dist

# Expose container port
EXPOSE 3000

# Start server
CMD ["node", "dist/server.cjs"]
