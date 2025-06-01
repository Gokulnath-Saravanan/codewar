# CodeWar Contest Platform

[![Release](https://github.com/Gokulnath-Saravanan/CampusCodewars/actions/workflows/release.yml/badge.svg)](https://github.com/Gokulnath-Saravanan/CampusCodewars/actions/workflows/release.yml)
[![Test Suite](https://github.com/Gokulnath-Saravanan/CampusCodewars/actions/workflows/test.yml/badge.svg)](https://github.com/Gokulnath-Saravanan/CampusCodewars/actions/workflows/test.yml)
[![Contest Validation](https://github.com/Gokulnath-Saravanan/CampusCodewars/actions/workflows/contest-submission.yml/badge.svg)](https://github.com/Gokulnath-Saravanan/CampusCodewars/actions/workflows/contest-submission.yml)
[![Coverage](https://codecov.io/gh/Gokulnath-Saravanan/CampusCodewars/branch/main/graph/badge.svg)](https://codecov.io/gh/Gokulnath-Saravanan/CampusCodewars)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=username_codewar&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=username_codewar)

A modern MERN stack contest platform with comprehensive CI/CD implementation for secure and efficient contest management.

## 🏗️ Architecture Overview

```mermaid
graph TB
    subgraph Frontend
        React[React Application]
        Redux[Redux State]
        RTK[RTK Query]
    end
    
    subgraph Backend
        Express[Express Server]
        MongoDB[MongoDB]
        Redis[Redis Cache]
    end
    
    subgraph ContestEngine
        Executor[Code Executor]
        Validator[Submission Validator]
        Queue[Processing Queue]
    end
    
    subgraph CI/CD
        GH[GitHub Actions]
        Docker[Docker Registry]
        K8s[Kubernetes]
    end
    
    React --> RTK
    RTK --> Express
    Express --> MongoDB
    Express --> Redis
    Express --> Queue
    Queue --> Executor
    Executor --> Validator
    GH --> Docker
    Docker --> K8s
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- MongoDB 4.4+
- Redis 6+
- Docker & Docker Compose
- Kubernetes (for production)

### Local Development Setup

1. Clone the repository:
```bash
git clone https://github.com/Gokulnath-Saravanan/CampusCodewars.git
cd codewar
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development servers:
```bash
# Terminal 1: Start MongoDB and Redis
docker-compose up -d

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm start
```

## 🔄 CI/CD Pipeline

Our CI/CD pipeline ensures code quality and secure deployments:

```mermaid
graph LR
    PR[Pull Request] --> Tests[Test Suite]
    Tests --> Security[Security Scan]
    Security --> Quality[Quality Gate]
    Quality --> Review[Code Review]
    Review --> Merge[Merge to Main]
    Merge --> Release[Create Release]
    Release --> Deploy[Deploy]
```

## 🏆 Contest Management

### Creating a New Contest

1. Create a contest branch:
```bash
git checkout -b contest/my-new-contest
```

2. Use the contest template:
```bash
npm run create-contest
```

3. Follow the validation workflow:
```bash
npm run validate-contest
```

### Contest Structure
```
contests/
├── my-contest/
│   ├── config.json
│   ├── description.md
│   ├── test-cases/
│   │   ├── sample/
│   │   └── hidden/
│   ├── solutions/
│   └── validators/
```

## 🔒 Security Features

- JWT-based authentication
- Rate limiting
- Input validation
- XSS protection
- CSRF protection
- Security headers
- Dependency scanning
- Container security

## 📊 Monitoring & Metrics

Access the monitoring dashboard:
- Development: http://localhost:3000/monitoring
- Production: https://codewar.example.com/monitoring

Key metrics:
- Contest submission success rate
- API response times
- Error rates
- System resource usage
- Security incidents

## 🛠️ Troubleshooting

Common issues and solutions are documented in [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

For more detailed guides, see:
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Security Guide](./docs/SECURITY.md)
- [Performance Guide](./docs/PERFORMANCE.md)
- [Contest Guide](./docs/CONTEST.md)

## 📚 Documentation

- [API Documentation](./docs/API.md)
- [Architecture Decision Records](./docs/adr/)
- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)

## 🤝 Contributing

Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## CI/CD Pipeline Documentation

This project implements a comprehensive CI/CD pipeline using GitHub Actions, SonarCloud, and Render.com.

### Pipeline Stages

1. **Test Stage**
   - Runs backend tests with Jest
   - Runs frontend tests
   - Generates coverage reports
   - Uses MongoDB service container for integration tests

2. **SonarCloud Analysis**
   - Performs code quality analysis
   - Checks test coverage
   - Identifies code smells and security issues
   - Enforces quality gates

3. **Build Stage**
   - Builds frontend application
   - Prepares backend for deployment
   - Creates deployment artifacts

4. **Deployment Stage**
   - Deploys backend to Render.com
   - Deploys frontend to Render.com
   - Automatic deployment on main branch

### Quality Gates

The following quality standards are enforced:
- Minimum 80% test coverage
- Maximum 50 code smells
- Zero critical bugs
- Zero security vulnerabilities
- Maximum 5 security hotspots
- Maximum 3% code duplication

### Environment Setup

1. **Local Development**
   ```bash
   # Install dependencies
   npm run install-all

   # Run tests
   npm test

   # Start development servers
   npm run dev
   ```

2. **CI/CD Setup**
   - Configure GitHub repository secrets:
     - `SONAR_TOKEN`
     - `RENDER_API_KEY`
     - `RENDER_BACKEND_SERVICE_ID`
     - `RENDER_FRONTEND_SERVICE_ID`

3. **Deployment URLs**
   - Frontend: [Your-Frontend-URL]
   - Backend: [Your-Backend-URL]
   - SonarCloud Dashboard: [Your-SonarCloud-URL]

### Monitoring and Maintenance

- CI/CD pipeline status: GitHub Actions tab
- Code quality metrics: SonarCloud dashboard
- Deployment status: Render.com dashboard

### Branch Strategy

- `main`: Production branch, protected
- `develop`: Development branch
- Feature branches: Created from develop
- Pull Request required for merging

### Automated Checks

- Unit tests
- Integration tests
- Code quality analysis
- Security scanning
- Build verification
- Deployment verification