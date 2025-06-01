FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY contest-exporter.js ./

# Set environment variables
ENV NODE_ENV=production
ENV METRICS_PORT=9090

# Expose metrics port
EXPOSE 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
  CMD wget -q --spider http://localhost:9090/health || exit 1

# Run the exporter
CMD ["node", "contest-exporter.js"] 