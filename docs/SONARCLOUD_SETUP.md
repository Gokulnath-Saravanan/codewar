# SonarCloud Setup Guide for CodeWar Contest

## Overview
This guide provides step-by-step instructions for setting up SonarCloud analysis for the CodeWar MERN stack application, with a focus on maintaining high code quality standards for contest judging.

## Table of Contents
1. [SonarCloud Account Setup](#sonarcloud-account-setup)
2. [Repository Configuration](#repository-configuration)
3. [Quality Gates Setup](#quality-gates-setup)
4. [GitHub Integration](#github-integration)
5. [Badge Configuration](#badge-configuration)
6. [Troubleshooting](#troubleshooting)

## SonarCloud Account Setup

### 1. Create SonarCloud Account
1. Go to [SonarCloud](https://sonarcloud.io/)
2. Click "Log In"
3. Choose "Log in with GitHub"
4. Authorize SonarCloud to access your GitHub account

### 2. Create Organization
1. Click "Create Organization"
2. Select "GitHub Organization"
3. Choose your GitHub account/organization
4. Note down the organization key for configuration

### 3. Import Repository
1. Click "Analyze new project"
2. Select the `codewar` repository
3. Choose "GitHub Actions" as the analysis method
4. Follow the setup instructions provided

## Repository Configuration

### 1. Set Required Secrets
In your GitHub repository settings, add these secrets:
```bash
SONAR_TOKEN=your-sonar-token
SONAR_ORGANIZATION=your-organization-key
```

### 2. Update sonar-project.properties
Replace these values in `sonar-project.properties`:
```properties
sonar.projectKey=your-project-key
sonar.organization=your-organization-key
sonar.pullrequest.github.repository=your-Gokulnath-Saravanan/CampusCodewars
```

## Quality Gates Setup

### 1. Default Quality Gate
The project uses a custom quality gate with these conditions:
- Coverage ≥ 80%
- Code Smells ≤ 50
- Bugs = 0
- Vulnerabilities = 0
- Security Hotspots ≤ 5
- Duplicated Lines ≤ 3%

### 2. Custom Quality Gate Setup
1. Go to Quality Gates in SonarCloud
2. Click "Create"
3. Name it "Contest Requirements"
4. Add conditions:
   ```
   - Coverage is less than 80%
   - Maintainability Rating is worse than A
   - Reliability Rating is worse than A
   - Security Rating is worse than A
   - Duplicated Lines (%) is greater than 3%
   ```

## GitHub Integration

### 1. Pull Request Decoration
1. Enable "Require status checks to pass" in branch protection
2. Add "SonarCloud Code Analysis" as required status check
3. Configure PR comments in SonarCloud settings

### 2. Automatic Analysis
The workflow will run on:
- Push to main, develop, staging
- Pull request events
- Manual trigger

## Badge Configuration

### 1. Add Badges to README
Add these badges to your README.md:
```markdown
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=your-project-key&metric=alert_status)](https://sonarcloud.io/dashboard?id=your-project-key)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=your-project-key&metric=coverage)](https://sonarcloud.io/dashboard?id=your-project-key)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=your-project-key&metric=code_smells)](https://sonarcloud.io/dashboard?id=your-project-key)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=your-project-key&metric=sqale_index)](https://sonarcloud.io/dashboard?id=your-project-key)
```

### 2. Automatic Badge Updates
The workflow automatically updates badges on main branch commits.

## Contest-Specific Configuration

### 1. Code Coverage Requirements
- Frontend: Minimum 80% coverage
- Backend: Minimum 80% coverage
- E2E tests: Required for critical paths

### 2. Code Quality Metrics
- Maintainability Rating: A
- Reliability Rating: A
- Security Rating: A
- Technical Debt: < 5 days

### 3. Documentation Requirements
- API documentation: Complete
- Component documentation: Required
- Test documentation: Required

## Troubleshooting

### Common Issues

1. **Analysis Fails to Start**
   - Check GitHub Actions permissions
   - Verify SONAR_TOKEN is set correctly
   - Ensure sonar-project.properties is properly configured

2. **Coverage Not Reporting**
   - Verify test commands include coverage flag
   - Check lcov.info paths are correct
   - Ensure coverage reports are generated before analysis

3. **Quality Gate Failures**
   - Review SonarCloud dashboard for details
   - Check specific metric failures
   - Use SonarLint in IDE for local analysis

4. **Pull Request Decoration Issues**
   - Verify GitHub token permissions
   - Check repository configuration in SonarCloud
   - Ensure PR analysis is enabled

### Support Resources
1. [SonarCloud Documentation](https://docs.sonarcloud.io/)
2. [GitHub Actions Documentation](https://docs.github.com/en/actions)
3. [SonarCloud Community Forum](https://community.sonarsource.com/)

## Best Practices

1. **Local Analysis**
   - Install SonarLint in your IDE
   - Run local analysis before pushing
   - Fix issues early in development

2. **Code Review Process**
   - Review SonarCloud analysis before merging
   - Address all major issues
   - Document technical debt decisions

3. **Continuous Improvement**
   - Monitor quality trends
   - Regular technical debt cleanup
   - Update quality gates as needed

4. **Team Collaboration**
   - Share SonarCloud dashboard
   - Regular code quality reviews
   - Document quality standards 