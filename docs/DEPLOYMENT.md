# Deployment Guide

This guide covers the deployment process for the CodeWar contest platform across different environments.

## Table of Contents
- [Environment Setup](#environment-setup)
- [Deployment Environments](#deployment-environments)
- [Deployment Process](#deployment-process)
- [Rollback Procedures](#rollback-procedures)
- [Monitoring](#monitoring)

## Environment Setup

### Development Environment

1. Local Dependencies:
```bash
# Install Node.js 20.x
nvm install 20
nvm use 20

# Install MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:4.4

# Install Redis
docker run -d -p 6379:6379 --name redis redis:6
```

2. Environment Variables:
```bash
# .env.development
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/codewar
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-dev-secret
```

### Staging Environment

1. Infrastructure Setup:
```bash
# Deploy using Terraform
cd infrastructure/staging
terraform init
terraform apply
```

2. Environment Configuration:
```bash
# .env.staging
NODE_ENV=staging
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@staging-cluster
REDIS_URL=redis://staging-redis:6379
JWT_SECRET=staging-secret
```

### Production Environment

1. Kubernetes Setup:
```bash
# Create production namespace
kubectl create namespace codewar-prod

# Apply configurations
kubectl apply -f k8s/production/
```

2. Environment Configuration:
```bash
# Create secrets
kubectl create secret generic codewar-secrets \
  --from-literal=MONGODB_URI=mongodb+srv://user:pass@prod-cluster \
  --from-literal=REDIS_URL=redis://prod-redis:6379 \
  --from-literal=JWT_SECRET=prod-secret
```

## Deployment Environments

### Development (dev)
- Purpose: Local development and testing
- URL: http://localhost:3000
- Database: Local MongoDB
- Cache: Local Redis
- CI/CD: Manual deployment

### Staging (staging)
- Purpose: Pre-production testing
- URL: https://staging.codewar.example.com
- Database: MongoDB Atlas (staging cluster)
- Cache: AWS ElastiCache
- CI/CD: Automated on merge to develop

### Production (prod)
- Purpose: Live environment
- URL: https://codewar.example.com
- Database: MongoDB Atlas (production cluster)
- Cache: AWS ElastiCache
- CI/CD: Manual approval required

## Deployment Process

### 1. Pre-deployment Checklist
- [ ] All tests passing
- [ ] Security scan completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Change log updated
- [ ] Backup completed

### 2. Deployment Steps

#### Development
```bash
# Start development servers
npm run dev
```

#### Staging
```bash
# Deploy to staging
npm run deploy:staging
```

#### Production
1. Create release:
```bash
npm run release
```

2. Deploy to production:
```bash
# Requires approval in GitHub Actions
npm run deploy:prod
```

### 3. Post-deployment Verification

```bash
# Run smoke tests
npm run test:smoke

# Verify metrics
npm run verify:metrics

# Check logs
npm run logs:tail
```

## Rollback Procedures

### Quick Rollback
```bash
# Rollback to previous version
npm run rollback -- --version=<version>
```

### Manual Rollback Steps
1. Identify the last stable version
2. Update deployment configuration:
```bash
kubectl rollout undo deployment/codewar
```

3. Verify rollback:
```bash
kubectl rollout status deployment/codewar
```

## Monitoring

### Metrics to Monitor
- Application Health
  - API Response Times
  - Error Rates
  - Memory Usage
  - CPU Usage

- Contest Metrics
  - Submission Success Rate
  - Evaluation Time
  - Queue Length
  - Concurrent Users

### Logging
```bash
# View application logs
kubectl logs -f deployment/codewar

# View specific pod logs
kubectl logs -f pod/codewar-pod-name
```

### Alerts
- Configure alerts in Grafana:
  1. High Error Rate (>1%)
  2. Long Response Time (>500ms)
  3. Memory Usage (>85%)
  4. Failed Deployments

## Infrastructure Diagram

```mermaid
graph TB
    subgraph Production
        LB[Load Balancer]
        subgraph Kubernetes
            API[API Servers]
            Worker[Worker Nodes]
        end
        DB[(MongoDB Atlas)]
        Cache[(Redis)]
        CDN[CDN]
    end
    
    Internet --> LB
    LB --> API
    API --> DB
    API --> Cache
    API --> Worker
    CDN --> Internet
```

## Security Considerations

### SSL/TLS
- Certificates managed by cert-manager
- Auto-renewal enabled
- Force HTTPS

### Network Security
- Private VPC
- Security Groups
- Network Policies

### Access Control
- RBAC enabled
- Service Accounts
- Network Policies

## Performance Optimization

### Caching Strategy
1. Application Cache (Redis)
2. CDN Cache
3. Browser Cache

### Resource Limits
```yaml
resources:
  limits:
    cpu: "1"
    memory: "1Gi"
  requests:
    cpu: "500m"
    memory: "512Mi"
```

## Troubleshooting

### Common Issues

1. Database Connection
```bash
# Check MongoDB status
kubectl exec -it mongodb-pod -- mongo --eval "rs.status()"
```

2. Redis Connection
```bash
# Check Redis status
kubectl exec -it redis-pod -- redis-cli ping
```

3. Application Errors
```bash
# Check application logs
kubectl logs -f deployment/codewar --tail=100
```

### Health Checks
```bash
# Endpoint health
curl https://codewar.example.com/health

# Dependency health
curl https://codewar.example.com/health/dependencies
```

## Maintenance

### Backup Schedule
- Database: Daily at 00:00 UTC
- Configuration: On every change
- Logs: Retained for 30 days

### Update Process
1. Dependencies
```bash
# Update dependencies
npm update
npm audit fix
```

2. System Updates
```bash
# Update Kubernetes
kubectl apply -f k8s/updates/
```

## Support

### Contact Information
- DevOps Team: devops@codewar.example.com
- Security Team: security@codewar.example.com
- On-Call Support: +1-xxx-xxx-xxxx

### Documentation
- [API Documentation](./API.md)
- [Monitoring Guide](./MONITORING.md)
- [Security Guide](./SECURITY.md) 