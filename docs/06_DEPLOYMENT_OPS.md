# Deployment and Operations

## Deployment Pipeline (CI/CD)

**CI/CD Platform**: GitHub Actions + Vercel

**Pipeline Overview:**

The deployment pipeline is configured via GitHub Actions (`.github/workflows/ci.yml`) and integrates with Vercel for automatic deployments.

**CI Pipeline Stages:**

1. **Check Build Configuration**
   - Validates `next.config.ts` for `ignoreBuildErrors` flag
   - Prevents deployment with disabled type checking
   - Runs on: `main`, `master`, `develop` branches and pull requests

2. **Type Check**
   - Runs TypeScript type checking (`tsc --noEmit`)
   - Ensures no type errors before build
   - Fails build if type errors are found

3. **Lint**
   - Runs ESLint with Next.js configuration
   - Validates code quality and style
   - Reports linting errors

4. **Build**
   - Compiles Next.js application
   - Generates production-optimized bundle
   - Only runs if previous stages pass

**Deployment Triggers:**

- **Production Deployment**: 
  - Triggered by: Push to `main` or `master` branch
  - Platform: Vercel (automatic via GitHub integration)
  - Environment: Production
  - URL: `https://team-directory-delta.vercel.app/`

- **Preview Deployment**:
  - Triggered by: Pull requests to `main`, `master`, or `develop`
  - Platform: Vercel (automatic preview deployments)
  - Environment: Preview/Staging
  - URL: Unique preview URL per PR

- **Staging Deployment** (if configured):
  - Triggered by: Push to `develop` branch
  - Platform: Vercel
  - Environment: Staging
  - URL: Staging-specific domain

**Deployment Process:**

1. Code pushed to GitHub
2. GitHub Actions CI pipeline runs
3. If CI passes, Vercel automatically deploys
4. Build runs on Vercel's infrastructure
5. Application goes live after successful build

**Rollback Procedure:**

- Access Vercel dashboard
- Navigate to Deployments section
- Select previous successful deployment
- Click "Promote to Production"

## Production Environment Variables

**Required Environment Variables:**

The following environment variables must be configured in the Vercel dashboard for production:

```env
# GraphQL API Configuration
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://api.production.com/graphql

# API Mode (set to 'false' for production)
NEXT_PUBLIC_USE_MOCK_API=false

# Optional: Analytics & Monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# Optional: Feature Flags
NEXT_PUBLIC_ENABLE_FEATURE_X=true
```

**Environment Variable Configuration:**

1. **Vercel Dashboard**:
   - Navigate to Project Settings → Environment Variables
   - Add variables for Production, Preview, and Development environments
   - Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser

2. **Security Best Practices**:
   - Never commit sensitive keys to repository
   - Use Vercel's environment variable encryption
   - Rotate keys regularly
   - Use different keys for staging and production

**Environment-Specific Configuration:**

- **Production**: Real GraphQL endpoint, monitoring enabled, analytics active
- **Preview/Staging**: Staging GraphQL endpoint, limited monitoring
- **Development**: Mock API enabled, local GraphQL endpoint

## Monitoring & Logging

**Current Monitoring Setup:**

**Vercel Analytics** (if enabled):
- **Purpose**: Performance monitoring and user analytics
- **Access**: Vercel Dashboard → Analytics
- **Metrics**: Page views, performance metrics, Core Web Vitals
- **Configuration**: Enable in Vercel project settings

**Vercel Logs**:
- **Purpose**: Application logs and error tracking
- **Access**: Vercel Dashboard → Deployments → Select deployment → Logs
- **Log Types**: 
  - Build logs
  - Runtime logs
  - Function logs
- **Retention**: 30 days (Vercel Pro plan)

**Error Tracking** (Recommended for Production):

**Sentry Integration** (Future Implementation):
```typescript
// Example: Sentry configuration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**Accessing Production Logs:**

1. **Via Vercel Dashboard**:
   - Login to Vercel
   - Select project: "team-directory"
   - Navigate to Deployments
   - Click on deployment → View Logs

2. **Via Vercel CLI**:
   ```bash
   vercel logs team-directory --follow
   ```

**Monitoring Best Practices:**

- **Set Up Alerts**: Configure alerts for build failures and errors
- **Regular Review**: Review logs weekly for anomalies
- **Performance Monitoring**: Track Core Web Vitals (LCP, FID, CLS)
- **Error Rate Tracking**: Monitor error rates and trends
- **Uptime Monitoring**: Use external services (e.g., UptimeRobot) for availability

**Recommended Monitoring Tools:**

- **Application Performance**: Vercel Analytics, Lighthouse CI
- **Error Tracking**: Sentry (recommended for production)
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **User Analytics**: Google Analytics, Plausible (privacy-focused)

---

**Previous**: [Best Practices and Conventions](./05_CONVENTIONS.md) | **Back to Index**: [Documentation Index](./README.md)

