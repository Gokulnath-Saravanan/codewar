#!/bin/bash

# Health check script
# Usage: ./wait-for-health.sh <health_check_url> [timeout_seconds] [interval_seconds]

set -e

# Default values
TIMEOUT=${2:-300}  # 5 minutes default timeout
INTERVAL=${3:-5}   # 5 seconds default interval
START_TIME=$(date +%s)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Log functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check required arguments
if [ -z "$1" ]; then
    error "Usage: $0 <health_check_url> [timeout_seconds] [interval_seconds]"
fi

HEALTH_URL=$1

# Function to check HTTP response
check_http_response() {
    local url=$1
    local response
    local status_code
    
    # Get HTTP status code
    response=$(curl -s -w "%{http_code}" -o /dev/null -m 5 "$url")
    status_code=$?
    
    if [ $status_code -eq 0 ] && [ "$response" -eq 200 ]; then
        return 0
    else
        return 1
    fi
}

# Function to check detailed health status
check_health_status() {
    local url=$1
    local response
    
    # Get full response
    response=$(curl -s -m 5 "$url")
    
    # Check if response contains expected health indicators
    if [[ $response == *"\"status\":\"ok\""* ]] || \
       [[ $response == *"\"healthy\":true"* ]] || \
       [[ $response == *"\"status\":\"healthy\""* ]]; then
        return 0
    else
        return 1
    fi
}

# Main health check loop
log "Starting health check for $HEALTH_URL"
log "Timeout: ${TIMEOUT}s, Interval: ${INTERVAL}s"

while true; do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    if [ $ELAPSED -gt $TIMEOUT ]; then
        error "Health check timed out after ${TIMEOUT} seconds"
    fi
    
    # First check HTTP response
    if check_http_response "$HEALTH_URL"; then
        # If HTTP response is good, check detailed health status
        if check_health_status "$HEALTH_URL"; then
            log "Service is healthy!"
            exit 0
        else
            warn "Service responded but health check failed"
        fi
    else
        warn "Service not responding properly"
    fi
    
    REMAINING=$((TIMEOUT - ELAPSED))
    log "Waiting ${INTERVAL}s... (${REMAINING}s remaining)"
    sleep "$INTERVAL"
done 