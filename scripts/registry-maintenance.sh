#!/bin/bash

# Registry maintenance script for CodeWar application
# This script manages Docker image cleanup and maintenance tasks

set -e

# Configuration
DOCKERHUB_REPO="yourusername/codewar"
GHCR_REPO="ghcr.io/yourusername/codewar"
MAX_IMAGES_TO_KEEP=10
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Log function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check required tools
check_requirements() {
    log "Checking requirements..."
    
    local REQUIRED_TOOLS="docker curl jq"
    local MISSING_TOOLS=""
    
    for tool in $REQUIRED_TOOLS; do
        if ! command -v "$tool" &> /dev/null; then
            MISSING_TOOLS="$MISSING_TOOLS $tool"
        fi
    done
    
    if [ ! -z "$MISSING_TOOLS" ]; then
        error "Missing required tools:$MISSING_TOOLS"
        exit 1
    fi
}

# Authenticate with registries
authenticate() {
    log "Authenticating with Docker registries..."
    
    if [ -z "$DOCKERHUB_TOKEN" ]; then
        error "DOCKERHUB_TOKEN environment variable not set"
        exit 1
    }
    
    if [ -z "$GITHUB_TOKEN" ]; then
        error "GITHUB_TOKEN environment variable not set"
        exit 1
    }
    
    echo "$DOCKERHUB_TOKEN" | docker login --username "$DOCKERHUB_USERNAME" --password-stdin
    echo "$GITHUB_TOKEN" | docker login ghcr.io --username "$GITHUB_USERNAME" --password-stdin
}

# Clean up old images from DockerHub
cleanup_dockerhub() {
    log "Cleaning up DockerHub images..."
    
    # Get list of images sorted by date
    local IMAGES=$(curl -s -H "Authorization: Bearer $DOCKERHUB_TOKEN" \
        "https://hub.docker.com/v2/repositories/${DOCKERHUB_REPO}/tags/?page_size=100" | \
        jq -r '.results | sort_by(.last_updated) | .[:-10] | .[].name')
    
    for tag in $IMAGES; do
        if [[ ! $tag =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            log "Deleting tag: $tag"
            curl -s -X DELETE -H "Authorization: Bearer $DOCKERHUB_TOKEN" \
                "https://hub.docker.com/v2/repositories/${DOCKERHUB_REPO}/tags/${tag}/"
        fi
    done
}

# Clean up old images from GitHub Container Registry
cleanup_ghcr() {
    log "Cleaning up GitHub Container Registry images..."
    
    local IMAGES=$(curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
        "https://api.github.com/user/packages/container/${GHCR_REPO}/versions" | \
        jq -r '.[] | select(.metadata.container.tags | length == 0) | .id')
    
    for id in $IMAGES; do
        log "Deleting untagged image: $id"
        curl -s -X DELETE -H "Authorization: Bearer $GITHUB_TOKEN" \
            "https://api.github.com/user/packages/container/${GHCR_REPO}/versions/${id}"
    done
}

# Verify image integrity
verify_images() {
    log "Verifying image integrity..."
    
    local LATEST_TAG="latest"
    local VERIFICATION_FAILED=0
    
    # Pull and verify latest images
    for repo in "$DOCKERHUB_REPO" "$GHCR_REPO"; do
        log "Verifying $repo:$LATEST_TAG"
        if ! docker pull "$repo:$LATEST_TAG"; then
            warn "Failed to pull $repo:$LATEST_TAG"
            VERIFICATION_FAILED=1
            continue
        fi
        
        # Run Trivy scan
        if ! trivy image --severity HIGH,CRITICAL "$repo:$LATEST_TAG"; then
            warn "Security vulnerabilities found in $repo:$LATEST_TAG"
            VERIFICATION_FAILED=1
        fi
    done
    
    return $VERIFICATION_FAILED
}

# Main execution
main() {
    log "Starting registry maintenance..."
    
    check_requirements
    authenticate
    
    # Run cleanup operations
    cleanup_dockerhub
    cleanup_ghcr
    
    # Verify images
    if verify_images; then
        log "Image verification completed successfully"
    else
        warn "Image verification found issues"
    fi
    
    log "Registry maintenance completed"
}

# Run main function
main "$@" 