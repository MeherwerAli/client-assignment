# 🚀 Deployment Guide

Comprehensive guide for deploying the Smart Chat Frontend to various platforms and environments.

## 📋 Table of Contents

- [🏗️ Build Process](#️-build-process)
- [🐳 Docker Deployment](#-docker-deployment)
- [☁️ Cloud Platforms](#️-cloud-platforms)
- [🔧 Environment Configuration](#-environment-configuration)
- [📊 Performance Optimization](#-performance-optimization)
- [🔍 Monitoring & Analytics](#-monitoring--analytics)
- [🛡️ Security](#️-security)
- [🚦 CI/CD Pipeline](#-cicd-pipeline)

## 🏗️ Build Process

### Local Build

```bash
# Development build
npm run build

# Production build with optimizations
npm run build:prod

# Analyze bundle size
npm run analyze

# Serve production build locally
npm run serve
```

### Build Configuration

```javascript
// package.json scripts
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:prod": "NODE_ENV=production GENERATE_SOURCEMAP=false react-scripts build",
    "build:staging": "NODE_ENV=staging react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "analyze": "npm run build && npx bundle-analyzer build/static/js/*.js",
    "serve": "npx serve -s build -l 3000",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  }
}
```

### Build Output Structure

```
build/
├── static/
│   ├── css/
│   │   ├── main.[hash].css
│   │   └── main.[hash].css.map
│   ├── js/
│   │   ├── main.[hash].js
│   │   ├── main.[hash].js.map
│   │   └── runtime-main.[hash].js
│   └── media/
│       └── [assets]
├── index.html
├── favicon.ico
├── manifest.json
└── asset-manifest.json
```

## 🐳 Docker Deployment

### Multi-Stage Dockerfile

```dockerfile
# chat-frontend/Dockerfile
# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build the application
ARG NODE_ENV=production
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_API_KEY
ARG REACT_APP_NAME
ARG REACT_APP_VERSION

ENV NODE_ENV=$NODE_ENV
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL
ENV REACT_APP_API_KEY=$REACT_APP_API_KEY
ENV REACT_APP_NAME=$REACT_APP_NAME
ENV REACT_APP_VERSION=$REACT_APP_VERSION

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=builder /app/build /usr/share/nginx/html

# Copy environment script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start nginx with custom entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# nginx.conf
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Handle client-side routing
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API proxy (optional - for same-origin requests)
    location /api/ {
        proxy_pass http://chat-service:3000/chats-service/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Docker Entrypoint Script

```bash
#!/bin/sh
# docker-entrypoint.sh

# Generate runtime configuration
cat > /usr/share/nginx/html/config.js << EOF
window.ENV = {
  REACT_APP_API_BASE_URL: "${REACT_APP_API_BASE_URL:-http://localhost:3002/chats-service/api/v1}",
  REACT_APP_API_KEY: "${REACT_APP_API_KEY:-dev-api-key-2024}",
  REACT_APP_NAME: "${REACT_APP_NAME:-Smart Chat}",
  REACT_APP_VERSION: "${REACT_APP_VERSION:-1.0.0}",
  REACT_APP_ENABLE_SMART_CHAT: "${REACT_APP_ENABLE_SMART_CHAT:-true}",
  REACT_APP_AUTO_SAVE: "${REACT_APP_AUTO_SAVE:-true}",
  REACT_APP_ENABLE_FAVORITES: "${REACT_APP_ENABLE_FAVORITES:-true}"
};
EOF

# Start nginx
exec "$@"
```

### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  chat-frontend:
    build:
      context: ./chat-frontend
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
        - REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
        - REACT_APP_API_KEY=${REACT_APP_API_KEY}
    container_name: chat-frontend-prod
    restart: unless-stopped
    environment:
      - REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}
      - REACT_APP_API_KEY=${REACT_APP_API_KEY}
      - REACT_APP_NAME=Smart Chat
      - REACT_APP_VERSION=1.0.0
    ports:
      - "80:3000"
    depends_on:
      - chat-service
    networks:
      - chat-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

networks:
  chat-network:
    driver: bridge
```

### Docker Commands

```bash
# Build production image
docker build -t chat-frontend:prod ./chat-frontend

# Run production container
docker run -d \
  --name chat-frontend-prod \
  -p 80:3000 \
  -e REACT_APP_API_BASE_URL="https://api.example.com/chats-service/api/v1" \
  -e REACT_APP_API_KEY="prod-api-key" \
  chat-frontend:prod

# Start with docker-compose
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f chat-frontend

# Scale horizontally
docker-compose -f docker-compose.prod.yml up -d --scale chat-frontend=3
```

## ☁️ Cloud Platforms

### Vercel Deployment

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "headers": {
        "cache-control": "public, max-age=31536000, immutable"
      }
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_API_BASE_URL": "@api_base_url",
    "REACT_APP_API_KEY": "@api_key"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Netlify Deployment

```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "8"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### AWS S3 + CloudFront

```bash
# Build and deploy to S3
npm run build:prod

# Sync to S3 bucket
aws s3 sync build/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

```yaml
# AWS CloudFormation template snippet
Resources:
  ChatFrontendBucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: !Sub "${ProjectName}-frontend-${Environment}"
      PublicAccessBlockConfiguration:
        BlockPublicAcls: true
        BlockPublicPolicy: true
        IgnorePublicAcls: true
        RestrictPublicBuckets: true
      
  CloudFrontDistribution:
    Type: AWS::CloudFront::Distribution
    Properties:
      DistributionConfig:
        Origins:
          - Id: S3Origin
            DomainName: !GetAtt ChatFrontendBucket.DomainName
            S3OriginConfig:
              OriginAccessIdentity: !Sub "origin-access-identity/cloudfront/${OriginAccessIdentity}"
        DefaultCacheBehavior:
          TargetOriginId: S3Origin
          ViewerProtocolPolicy: redirect-to-https
          CachePolicyId: 4135ea2d-6df8-44a3-9df3-4b5a84be39ad # Managed-CachingOptimized
        CustomErrorResponses:
          - ErrorCode: 404
            ResponseCode: 200
            ResponsePagePath: /index.html
```

### Google Cloud Platform

```yaml
# app.yaml for App Engine
runtime: nodejs18

handlers:
  - url: /static
    static_dir: build/static
    secure: always

  - url: /(.*\.(json|ico|js|css|png|jpg|jpeg|gif|svg))$
    static_files: build/\1
    upload: build/.*\.(json|ico|js|css|png|jpg|jpeg|gif|svg)$
    secure: always

  - url: /.*
    static_files: build/index.html
    upload: build/index.html
    secure: always

env_variables:
  REACT_APP_API_BASE_URL: "https://your-api-domain.com/chats-service/api/v1"
  REACT_APP_API_KEY: "your-production-api-key"
```

## 🔧 Environment Configuration

### Environment Files

```bash
# .env.development
REACT_APP_API_BASE_URL=http://localhost:3002/chats-service/api/v1
REACT_APP_API_KEY=dev-api-key-2024
REACT_APP_NAME=Smart Chat (Dev)
REACT_APP_VERSION=1.0.0-dev
REACT_APP_ENABLE_SMART_CHAT=true
REACT_APP_AUTO_SAVE=true
REACT_APP_ENABLE_FAVORITES=true
GENERATE_SOURCEMAP=true

# .env.staging
REACT_APP_API_BASE_URL=https://staging-api.example.com/chats-service/api/v1
REACT_APP_API_KEY=staging-api-key-2024
REACT_APP_NAME=Smart Chat (Staging)
REACT_APP_VERSION=1.0.0-staging
REACT_APP_ENABLE_SMART_CHAT=true
REACT_APP_AUTO_SAVE=true
REACT_APP_ENABLE_FAVORITES=true
GENERATE_SOURCEMAP=true

# .env.production
REACT_APP_API_BASE_URL=https://api.example.com/chats-service/api/v1
REACT_APP_API_KEY=production-api-key
REACT_APP_NAME=Smart Chat
REACT_APP_VERSION=1.0.0
REACT_APP_ENABLE_SMART_CHAT=true
REACT_APP_AUTO_SAVE=true
REACT_APP_ENABLE_FAVORITES=true
GENERATE_SOURCEMAP=false
```

### Configuration Validation

```typescript
// src/config/validation.ts
import { z } from 'zod';

const configSchema = z.object({
  apiBaseUrl: z.string().url(),
  apiKey: z.string().min(1),
  appName: z.string().min(1),
  appVersion: z.string().min(1),
  enableSmartChat: z.boolean(),
  autoSave: z.boolean(),
  enableFavorites: z.boolean(),
});

export const validateConfig = (config: unknown) => {
  try {
    return configSchema.parse(config);
  } catch (error) {
    console.error('Configuration validation failed:', error);
    throw new Error('Invalid configuration');
  }
};
```

### Runtime Configuration

```typescript
// src/config/runtime.ts
export const getRuntimeConfig = () => {
  // Check if runtime config is available (from docker-entrypoint.sh)
  if (typeof window !== 'undefined' && (window as any).ENV) {
    return (window as any).ENV;
  }

  // Fallback to build-time environment variables
  return {
    REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
    REACT_APP_API_KEY: process.env.REACT_APP_API_KEY,
    REACT_APP_NAME: process.env.REACT_APP_NAME,
    REACT_APP_VERSION: process.env.REACT_APP_VERSION,
    REACT_APP_ENABLE_SMART_CHAT: process.env.REACT_APP_ENABLE_SMART_CHAT,
    REACT_APP_AUTO_SAVE: process.env.REACT_APP_AUTO_SAVE,
    REACT_APP_ENABLE_FAVORITES: process.env.REACT_APP_ENABLE_FAVORITES,
  };
};
```

## 📊 Performance Optimization

### Bundle Optimization

```javascript
// webpack.config.js (if ejected)
const path = require('path');

module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
};
```

### Code Splitting

```typescript
// Lazy load components
import { lazy, Suspense } from 'react';

const ChatInterface = lazy(() => import('./components/ChatInterface'));
const SessionList = lazy(() => import('./components/SessionList'));

// Usage with loading fallback
<Suspense fallback={<div>Loading...</div>}>
  <ChatInterface />
</Suspense>
```

### Image Optimization

```javascript
// vite.config.js (if using Vite)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { createHash } from 'crypto';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
});
```

### Service Worker

```javascript
// public/sw.js
const CACHE_NAME = 'chat-frontend-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});
```

## 🔍 Monitoring & Analytics

### Error Tracking

```typescript
// src/services/errorTracking.ts
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.BrowserTracing(),
  ],
  tracesSampleRate: 1.0,
});

export const captureError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    contexts: context,
  });
};

export const captureMessage = (message: string, level?: Sentry.SeverityLevel) => {
  Sentry.captureMessage(message, level);
};
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

export const trackWebVitals = () => {
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS(console.log);
    getFID(console.log);
    getFCP(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  });
};
```

### Analytics Integration

```typescript
// src/services/analytics.ts
import { gtag } from 'ga-gtag';

export const trackPageView = (path: string) => {
  gtag('config', process.env.REACT_APP_GA_MEASUREMENT_ID, {
    page_path: path,
  });
};

export const trackEvent = (action: string, category: string, label?: string) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
  });
};
```

## 🛡️ Security

### Security Headers

```nginx
# Additional security headers in nginx.conf
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.example.com;" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
```

### Environment Secrets

```bash
# Use environment variable files that are not committed
# .env.local (gitignored)
REACT_APP_API_KEY=actual-secret-key
REACT_APP_SENTRY_DSN=actual-sentry-dsn

# In production, use secret management services
# AWS Secrets Manager, Azure Key Vault, etc.
```

### API Security

```typescript
// src/utils/security.ts
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

export const validateCSRFToken = (token: string): boolean => {
  // Implement CSRF token validation
  return token.length > 0 && /^[a-zA-Z0-9-_]{32,}$/.test(token);
};
```

## 🚦 CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy Frontend

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build application
        run: npm run build:prod
        env:
          REACT_APP_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          REACT_APP_API_KEY: ${{ secrets.API_KEY }}

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to staging
        run: |
          # Deploy to staging environment
          echo "Deploying to staging..."

  deploy-production:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to production
        run: |
          # Deploy to production environment
          echo "Deploying to production..."
```

### Docker Build Pipeline

```yaml
# .github/workflows/docker.yml
name: Build and Push Docker Image

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      
      - name: Login to DockerHub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: your-org/chat-frontend
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          context: ./chat-frontend
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          build-args: |
            NODE_ENV=production
            REACT_APP_API_BASE_URL=${{ secrets.API_BASE_URL }}
            REACT_APP_API_KEY=${{ secrets.API_KEY }}
```

---

**This deployment guide covers all major deployment scenarios for the Smart Chat Frontend. Choose the deployment method that best fits your infrastructure and requirements.**
