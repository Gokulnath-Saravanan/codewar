# Stage 1: Frontend Build
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Install dependencies with cache optimization
COPY frontend/package*.json ./
RUN npm ci --only=production

# Build frontend
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend Build
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

# Install dependencies with cache optimization
COPY backend/package*.json ./
RUN npm ci --only=production

# Build backend
COPY backend/ ./
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production
WORKDIR /app

# Install security updates and create non-root user
RUN apk update && \
    apk upgrade && \
    apk add --no-cache dumb-init && \
    addgroup -S appgroup && \
    adduser -S appuser -G appgroup

# Copy built artifacts
COPY --from=frontend-builder /app/frontend/build ./frontend/build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/

# Install production dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    MONGO_URI=mongodb://mongodb:27017/codewar

# Switch to non-root user
USER appuser

# Health check configuration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# Use dumb-init as PID 1
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

# Start the application
CMD ["node", "dist/server.js"]

# Labels for metadata
LABEL maintainer="Your Name <your.email@example.com>" \
      version="1.0" \
      description="CodeWar MERN Stack Application" \
      org.opencontainers.image.source="https://github.com/yourGokulnath-Saravanan/CampusCodewars"

# Expose port
EXPOSE 3000 