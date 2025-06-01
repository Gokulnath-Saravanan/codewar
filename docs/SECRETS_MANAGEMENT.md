# Secrets Management Guide

## Overview
This document outlines the secrets management strategy for the MERN stack application's CI/CD pipeline. It includes instructions for setting up environment variables and secrets across different environments.

## Environment Structure
The application uses four environments:
- Development (local)
- Testing (CI/CD)
- Staging
- Production

## Required Secrets
### GitHub Secrets Setup
Follow these steps to set up secrets in GitHub:

1. Navigate to your repository's settings
2. Go to "Secrets and variables" → "Actions"
3. Click "New repository secret"

### Core Application Secrets
```bash
# Database Credentials
MONGODB_URI="mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority"
MONGODB_USER="your_mongodb_user"
MONGODB_PASSWORD="your_mongodb_password"

# JWT Authentication
JWT_SECRET="your_secure_jwt_secret_min_32_chars"
REFRESH_TOKEN_SECRET="your_secure_refresh_token_secret_min_32_chars"
```

### Deployment Secrets
```bash
# Railway Deployment
RAILWAY_TOKEN="your_railway_token"

# Heroku Deployment
HEROKU_API_KEY="your_heroku_api_key"
HEROKU_EMAIL="your_email@example.com"

# Docker Registry
DOCKER_REGISTRY="ghcr.io"
DOCKERHUB_USERNAME="your_dockerhub_username"
DOCKERHUB_TOKEN="your_dockerhub_token"
```

### Security & Monitoring
```bash
# Security Tools
SNYK_TOKEN="your_snyk_token"
SONAR_TOKEN="your_sonar_token"
CODECOV_TOKEN="your_codecov_token"
GITGUARDIAN_API_KEY="your_gitguardian_key"

# Monitoring
SENTRY_DSN="your_sentry_dsn"
SLACK_WEBHOOK_URL="your_slack_webhook_url"
```

## Setting Up Secrets

### 1. Database Secrets
```bash
# Generate MongoDB URI for each environment
MONGODB_URI_DEV="mongodb://localhost:27017/codewar"
MONGODB_URI_TEST="mongodb://localhost:27017/codewar_test"
MONGODB_URI_STAGING="mongodb+srv://user:pass@cluster.mongodb.net/codewar_staging"
MONGODB_URI_PROD="mongodb+srv://user:pass@cluster.mongodb.net/codewar_prod"
```

### 2. JWT Secrets
```bash
# Generate secure random strings for JWT secrets
JWT_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
```

### 3. API Keys
1. Railway:
   - Go to Railway Dashboard → Settings → API Tokens
   - Create new token with deployment permissions
   - Add as `RAILWAY_TOKEN`

2. Heroku:
   - Go to Heroku Dashboard → Account Settings → API Key
   - Reveal and copy API Key
   - Add as `HEROKU_API_KEY`

3. Docker:
   - Go to Docker Hub → Account Settings → Security
   - Create new access token
   - Add as `DOCKERHUB_TOKEN`

### 4. Security Tools
1. Snyk:
   - Go to Snyk Dashboard → Settings → General
   - Copy API token
   - Add as `SNYK_TOKEN`

2. SonarCloud:
   - Go to SonarCloud → Account → Security
   - Generate token
   - Add as `SONAR_TOKEN`

3. GitGuardian:
   - Go to GitGuardian Dashboard → API
   - Create new API key
   - Add as `GITGUARDIAN_API_KEY`

## Environment-Specific Configuration

### Development
- Use `.env.development` for local development
- Never commit this file to version control
- Use environment variables for sensitive data

### Testing
- Use GitHub Actions secrets for CI/CD
- Configure test-specific variables in workflow files

### Staging
- Use Railway environment variables
- Configure through Railway dashboard

### Production
- Use Heroku config vars
- Set through Heroku CLI or dashboard

## Security Best Practices

1. **Secret Rotation**
   - Rotate secrets every 90 days
   - Use automated rotation where possible
   - Update GitHub Actions secrets immediately after rotation

2. **Access Control**
   - Limit access to production secrets
   - Use separate credentials for each environment
   - Implement least privilege principle

3. **Monitoring**
   - Enable secret scanning
   - Monitor for exposed secrets
   - Set up alerts for secret usage

4. **Validation**
   - Run `scripts/validate-env.js` before deployment
   - Validate secret format and length
   - Check for required secrets per environment

## Troubleshooting

### Common Issues
1. Missing secrets in GitHub Actions
   - Check repository settings
   - Verify secret names match workflow files
   - Ensure proper access permissions

2. Invalid secret format
   - Verify secret format matches requirements
   - Check for special characters
   - Ensure proper encoding

### Support
For security-related issues:
1. Contact security team
2. Do not share secrets in communication
3. Use secure channels for secret transmission 