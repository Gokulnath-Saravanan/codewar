#!/bin/bash

# Rolling update script for Kubernetes deployments
# Usage: ./rolling-update.sh <environment> <version>

set -e

# Configuration
NAMESPACE="codewar"
DEPLOYMENTS=("frontend" "backend" "api-gateway")
MAX_SURGE="25%"
MAX_UNAVAILABLE="25%"
TIMEOUT="10m"

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
if [ "$#" -ne 2 ]; then
    error "Usage: $0 <environment> <version>"
fi

ENVIRONMENT=$1
VERSION=$2

# Validate environment
case $ENVIRONMENT in
    development|staging|production)
        log "Environment: $ENVIRONMENT"
        ;;
    *)
        error "Invalid environment. Must be one of: development, staging, production"
        ;;
esac

# Validate Kubernetes connection
if ! kubectl get ns "$NAMESPACE" &>/dev/null; then
    error "Cannot access Kubernetes namespace: $NAMESPACE"
fi

# Function to check deployment readiness
check_deployment_ready() {
    local deployment=$1
    local timeout=$2
    
    kubectl rollout status deployment/"$deployment" -n "$NAMESPACE" --timeout="$timeout"
    return $?
}

# Function to verify deployment health
verify_deployment_health() {
    local deployment=$1
    local ready
    local total
    
    ready=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}')
    total=$(kubectl get deployment "$deployment" -n "$NAMESPACE" -o jsonpath='{.status.replicas}')
    
    if [ "$ready" = "$total" ]; then
        return 0
    else
        return 1
    fi
}

# Function to perform rollback
rollback_deployment() {
    local deployment=$1
    log "Rolling back deployment: $deployment"
    
    kubectl rollout undo deployment/"$deployment" -n "$NAMESPACE"
    if ! check_deployment_ready "$deployment" "5m"; then
        error "Rollback failed for deployment: $deployment"
    fi
}

# Function to update a single deployment
update_deployment() {
    local deployment=$1
    log "Updating deployment: $deployment"
    
    # Save current state for potential rollback
    kubectl get deployment/"$deployment" -n "$NAMESPACE" -o yaml > "/tmp/${deployment}-backup.yaml"
    
    # Update container image
    kubectl set image deployment/"$deployment" \
        "${deployment}=${DOCKER_REGISTRY}/${NAMESPACE}/${deployment}:${VERSION}" \
        -n "$NAMESPACE"
    
    # Update deployment strategy
    kubectl patch deployment/"$deployment" -n "$NAMESPACE" -p "{\"spec\":{\"strategy\":{\"rollingUpdate\":{\"maxSurge\":\"${MAX_SURGE}\",\"maxUnavailable\":\"${MAX_UNAVAILABLE}\"}}}}"
    
    # Wait for rollout to complete
    if ! check_deployment_ready "$deployment" "$TIMEOUT"; then
        warn "Deployment timeout for $deployment, initiating rollback..."
        rollback_deployment "$deployment"
        return 1
    fi
    
    # Verify deployment health
    if ! verify_deployment_health "$deployment"; then
        warn "Health check failed for $deployment, initiating rollback..."
        rollback_deployment "$deployment"
        return 1
    fi
    
    log "Successfully updated deployment: $deployment"
    return 0
}

# Main update process
main() {
    log "Starting rolling update process for environment: $ENVIRONMENT"
    
    # Update each deployment
    failed_deployments=()
    for deployment in "${DEPLOYMENTS[@]}"; do
        if ! update_deployment "$deployment"; then
            failed_deployments+=("$deployment")
        fi
    done
    
    # Check for failures
    if [ ${#failed_deployments[@]} -ne 0 ]; then
        error "Failed deployments: ${failed_deployments[*]}"
    fi
    
    log "Rolling update completed successfully"
    
    # Clean up backup files
    rm -f /tmp/*-backup.yaml
}

# Execute main function
main 