# Troubleshooting Guide

This guide provides solutions for common issues encountered in the CodeWar contest platform.

## Table of Contents
- [Development Issues](#development-issues)
- [Deployment Issues](#deployment-issues)
- [Contest Issues](#contest-issues)
- [Performance Issues](#performance-issues)
- [Security Issues](#security-issues)

## Development Issues

### Build Failures

#### Problem: npm install fails
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
1. Clear npm cache:
```bash
npm cache clean --force
```

2. Delete node_modules:
```bash
rm -rf node_modules package-lock.json
npm install
```

3. If using Node.js version mismatch:
```bash
nvm use 20
```

#### Problem: TypeScript compilation errors
```bash
error TS2307: Cannot find module '@types/...'
```

**Solution:**
1. Install missing types:
```bash
npm install --save-dev @types/missing-package
```

2. Check tsconfig.json:
```bash
# Verify paths and module resolution
cat tsconfig.json
```

### Test Failures

#### Problem: Jest tests timing out
```bash
Jest did not exit one second after the test run has completed.
```

**Solution:**
1. Check for unhandled promises:
```javascript
afterAll(async () => {
  await new Promise(resolve => setTimeout(resolve, 500));
});
```

2. Update Jest configuration:
```javascript
// jest.config.js
module.exports = {
  testTimeout: 10000,
  setupFilesAfterEnv: ['./jest.setup.js']
};
```

## Deployment Issues

### Kubernetes Deployment Failures

#### Problem: Pods not starting
```bash
kubectl get pods
# STATUS: CrashLoopBackOff
```

**Solution:**
1. Check pod logs:
```bash
kubectl logs pod/codewar-pod-name
```

2. Check pod description:
```bash
kubectl describe pod/codewar-pod-name
```

3. Verify resource limits:
```bash
kubectl describe nodes | grep -A 5 "Resource"
```

#### Problem: Service unavailable
```bash
curl: (7) Failed to connect to service
```

**Solution:**
1. Check service status:
```bash
kubectl get svc
kubectl describe svc codewar-service
```

2. Verify endpoints:
```bash
kubectl get endpoints codewar-service
```

3. Check network policies:
```bash
kubectl get networkpolicies
```

## Contest Issues

### Submission Processing

#### Problem: Submissions stuck in queue
```
Status: Pending for >5 minutes
```

**Solution:**
1. Check worker status:
```bash
kubectl logs -f deployment/codewar-worker
```

2. Verify queue status:
```bash
# Check Redis queue
redis-cli
> LLEN submission_queue
```

3. Reset worker if needed:
```bash
kubectl rollout restart deployment/codewar-worker
```

#### Problem: Evaluation timeouts
```
Error: Evaluation exceeded time limit
```

**Solution:**
1. Check resource limits:
```bash
cat contests/my-contest/config.json
```

2. Verify container resources:
```bash
kubectl describe pod/codewar-worker-pod
```

3. Adjust timeouts:
```javascript
// Update contest configuration
{
  "timeLimit": 5000,
  "memoryLimit": 256
}
```

## Performance Issues

### High Latency

#### Problem: Slow API responses
```
Response time >500ms
```

**Solution:**
1. Check database indexes:
```javascript
// Verify indexes
db.submissions.getIndexes()
```

2. Enable query logging:
```javascript
mongoose.set('debug', true);
```

3. Implement caching:
```javascript
// Add Redis caching
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

#### Problem: Memory leaks
```
Warning: High memory usage detected
```

**Solution:**
1. Take heap snapshot:
```bash
node --inspect app.js
# Use Chrome DevTools to analyze
```

2. Check for memory leaks:
```javascript
// Add memory monitoring
const used = process.memoryUsage();
console.log(`Memory usage: ${used.heapUsed / 1024 / 1024} MB`);
```

## Security Issues

### Authentication

#### Problem: JWT token issues
```
Error: Invalid token
```

**Solution:**
1. Check token expiration:
```javascript
// Verify token configuration
const token = jwt.verify(authToken, process.env.JWT_SECRET);
```

2. Clear stored tokens:
```bash
# Clear Redis tokens
redis-cli
> KEYS "token:*"
> DEL token:user123
```

#### Problem: Rate limiting bypass
```
Warning: Too many requests from IP
```

**Solution:**
1. Check rate limit configuration:
```javascript
// Update rate limits
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

2. Block suspicious IPs:
```bash
# Add to blocked IPs
redis-cli
> SADD blocked_ips "1.2.3.4"
```

## Database Issues

### MongoDB Connection

#### Problem: Connection timeouts
```
MongooseServerSelectionError: connection timed out
```

**Solution:**
1. Check connection string:
```bash
echo $MONGODB_URI
```

2. Verify network access:
```bash
nc -zv mongodb-host 27017
```

3. Check MongoDB status:
```bash
mongo --eval "db.serverStatus()"
```

### Redis Connection

#### Problem: Redis unavailable
```
Error: Redis connection failed
```

**Solution:**
1. Check Redis service:
```bash
redis-cli ping
```

2. Verify Redis configuration:
```bash
redis-cli INFO
```

3. Reset Redis if needed:
```bash
redis-cli FLUSHALL
```

## Monitoring & Logging

### Log Analysis

#### Problem: Missing logs
```
Error: Logs not available
```

**Solution:**
1. Check log configuration:
```javascript
// Update logging
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json()
});
```

2. Verify log storage:
```bash
kubectl logs -f deployment/codewar --tail=1000
```

### Metrics Collection

#### Problem: Metrics not updating
```
Warning: Stale metrics detected
```

**Solution:**
1. Check Prometheus targets:
```bash
curl localhost:9090/targets
```

2. Verify metrics endpoints:
```bash
curl localhost:3000/metrics
```

## Emergency Procedures

### System Recovery

1. Stop incoming traffic:
```bash
kubectl scale deployment codewar --replicas=0
```

2. Backup data:
```bash
mongodump --uri=$MONGODB_URI
```

3. Restore from backup:
```bash
mongorestore --uri=$MONGODB_URI dump/
```

### Contact Information

For urgent issues:
1. DevOps Team: +1-xxx-xxx-xxxx
2. Security Team: security@codewar.example.com
3. On-Call Support: https://pagerduty.com/codewar 