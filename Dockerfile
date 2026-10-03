# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package manifests first for better layer caching
COPY package.json pnpm-lock.yaml* ./

# Install all dependencies (ignore lifecycle scripts — no prepare/husky needed in the image)
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source and build
COPY . .
RUN pnpm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package manifests
COPY package.json pnpm-lock.yaml* ./

# Install only production dependencies (ignore lifecycle scripts)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy built application and runtime assets from builder
COPY --from=builder /app/build ./build
# Icon assets served by the HTTP transport at /icons
COPY --from=builder /app/public ./public

# Default HTTP port (Railway and similar platforms inject PORT; httpTransport
# picks up PORT and binds 0.0.0.0 automatically when MCP_HOST is unset)
EXPOSE 3000

# HTTP transport entrypoint for container deploys
CMD ["node", "build/serverHttp.js"]
