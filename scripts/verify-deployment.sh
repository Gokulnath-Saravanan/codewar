#!/bin/bash

# Deployment verification script
# Usage: ./verify-deployment.sh <environment>

set -e

# Configuration
MAX_RETRIES=30
RETRY_INTERVAL=10
HEALTH_CHECK_TIMEOUT=5

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Environment URLs
declare -A URLS=(
  ["development"]="http://localhost:3000"
  ["staging"]="https://staging.codewar.app"
  ["production"]="https://codewar.app"
  ["contest-demo"]="http://localhost:3000"
)

# Log functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if environment is provided
if [ -z "$1" ]; then
    error "Environment not specified"
    echo "Usage: $0 <environment>"
    exit 1
fi

ENVIRONMENT=$1
BASE_URL=${URLS[$ENVIRONMENT]}

if [ -z "$BASE_URL" ]; then
    error "Invalid environment: $ENVIRONMENT"
    exit 1
fi

# Verify API health
verify_health() {
    local health_url="$BASE_URL/api/health"
    local response
    local status_code

    log "Checking API health at $health_url"
    
    response=$(curl -s -w "%{http_code}" -o /dev/null -m $HEALTH_CHECK_TIMEOUT "$health_url")
    status_code=$?

    if [ $status_code -eq 0 ] && [ "$response" -eq 200 ]; then
        return 0
    else
        return 1
    fi
}

# Verify database connectivity
verify_database() {
    local db_health_url="$BASE_URL/api/health/db"
    local response

    log "Verifying database connectivity"
    
    response=$(curl -s "$db_health_url")
    if [[ $response == *"\"database\":{\"status\":\"ok\"}"* ]]; then
        return 0
    else
        return 1
    fi
}

# Verify frontend loading
verify_frontend() {
    local response
    local status_code

    log "Verifying frontend accessibility"
    
    response=$(curl -s -w "%{http_code}" -o /dev/null "$BASE_URL")
    status_code=$?

    if [ $status_code -eq 0 ] && [ "$response" -eq 200 ]; then
        return 0
    else
        return 1
    fi
}

# Check deployment status
check_deployment_status() {
    local retries=0
    local all_checks_passed=false

    while [ $retries -lt $MAX_RETRIES ]; do
        log "Attempt $((retries + 1)) of $MAX_RETRIES"

        # Verify all components
        if verify_health && verify_database && verify_frontend; then
            all_checks_passed=true
            break
        fi

        retries=$((retries + 1))
        if [ $retries -lt $MAX_RETRIES ]; then
            warn "Verification failed, retrying in $RETRY_INTERVAL seconds..."
            sleep $RETRY_INTERVAL
        fi
    done

    if [ "$all_checks_passed" = true ]; then
        log "All verification checks passed successfully!"
        return 0
    else
        error "Deployment verification failed after $MAX_RETRIES attempts"
        return 1
    fi
}

# Verify resource metrics
verify_resources() {
    log "Checking resource utilization"

    # Memory usage check
    local memory_usage
    memory_usage=$(curl -s "$BASE_URL/api/metrics/memory" | jq -r '.usage_percentage')
    if (( $(echo "$memory_usage > 90" | bc -l) )); then
        warn "High memory usage detected: ${memory_usage}%"
    fi

    # CPU usage check
    local cpu_usage
    cpu_usage=$(curl -s "$BASE_URL/api/metrics/cpu" | jq -r '.usage_percentage')
    if (( $(echo "$cpu_usage > 80" | bc -l) )); then
        warn "High CPU usage detected: ${cpu_usage}%"
    fi
}

# Main verification process
main() {
    log "Starting deployment verification for $ENVIRONMENT environment"

    # Run deployment status check
    if ! check_deployment_status; then
        error "Deployment verification failed"
        exit 1
    fi

    # Verify resource utilization
    verify_resources

    log "Deployment verification completed successfully"
}

# Run main function
main 