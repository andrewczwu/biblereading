# Google Cloud Secret Manager Setup

This guide walks you through setting up Google Cloud Secret Manager for your Bible Reading application.

## Prerequisites

1. Google Cloud Project with billing enabled
2. Google Cloud CLI installed (`gcloud`)
3. Application Default Credentials configured

## Step-by-Step Setup

### 1. Install Google Cloud CLI
```bash
# Download and install from: https://cloud.google.com/sdk/docs/install
# Or using package manager:
# Windows: choco install gcloudsdk
# macOS: brew install google-cloud-sdk
```

### 2. Authenticate and Set Project
```bash
# Login to Google Cloud
gcloud auth login

# Set your project ID
gcloud config set project biblereading-f222a

# Set up application default credentials
gcloud auth application-default login
```

### 3. Enable Required APIs
```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com

# Enable Cloud Resource Manager API (if needed)
gcloud services enable cloudresourcemanager.googleapis.com
```

### 4. Create IAM Service Account (Production)
```bash
# Create service account
gcloud iam service-accounts create bible-reading-app \
  --display-name="Bible Reading App" \
  --description="Service account for Bible Reading application"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding biblereading-f222a \
  --member="serviceAccount:bible-reading-app@biblereading-f222a.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Create and download key (for deployment)
gcloud iam service-accounts keys create bible-reading-service-account.json \
  --iam-account=bible-reading-app@biblereading-f222a.iam.gserviceaccount.com
```

### 5. Set Environment Variables
```bash
# For development (uses your user credentials)
export GOOGLE_CLOUD_PROJECT_ID=biblereading-f222a

# For production (uses service account)
export GOOGLE_APPLICATION_CREDENTIALS=./bible-reading-service-account.json
export GOOGLE_CLOUD_PROJECT_ID=biblereading-f222a
```

### 6. Create Secrets
```bash
# Use the provided script
node scripts/create-secrets.js

# Or create manually:
gcloud secrets create firebase-service-account --data-file=biblereading-pkey.json
gcloud secrets create firebase-web-config --data-file=firebase-config.json
gcloud secrets create database-id --data-file=-
```

### 7. Test Secret Access
```bash
# Test retrieving a secret
gcloud secrets versions access latest --secret="firebase-service-account"
```

## Production Deployment

### Environment Variables for Production
```env
GOOGLE_CLOUD_PROJECT_ID=biblereading-f222a
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
NODE_ENV=production
```

### Docker Deployment
```dockerfile
# Add to your Dockerfile
COPY bible-reading-service-account.json /app/
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/bible-reading-service-account.json
ENV GOOGLE_CLOUD_PROJECT_ID=biblereading-f222a
```

### Cloud Run Deployment
```bash
# Deploy with service account
gcloud run deploy bible-reading-api \
  --image gcr.io/biblereading-f222a/bible-reading-api \
  --service-account bible-reading-app@biblereading-f222a.iam.gserviceaccount.com \
  --set-env-vars GOOGLE_CLOUD_PROJECT_ID=biblereading-f222a
```

## Security Best Practices

1. **Principle of Least Privilege**: Only grant `secretmanager.secretAccessor` role
2. **Environment Separation**: Use different secrets for dev/staging/production
3. **Key Rotation**: Regularly rotate service account keys
4. **Audit Logging**: Enable audit logs for secret access
5. **Local Development**: Use `gcloud auth application-default login` instead of service account files

## Troubleshooting

### Permission Denied
```bash
# Check your authentication
gcloud auth list

# Verify project permissions
gcloud projects get-iam-policy biblereading-f222a
```

### Secret Not Found
```bash
# List all secrets
gcloud secrets list

# Check secret versions
gcloud secrets versions list firebase-service-account
```

### Application Authentication Issues
```bash
# Check application default credentials
gcloud auth application-default print-access-token

# Set credentials explicitly
export GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

## Cost Optimization

- **Caching**: Secrets are cached for 5 minutes to reduce API calls
- **Versioning**: Use specific versions in production for consistency
- **Monitoring**: Set up alerts for unusual secret access patterns

## Local Development Fallback

The application includes fallback to local files for development:
1. Tries Google Cloud Secret Manager first
2. Falls back to local `biblereading-pkey.json`
3. Provides clear error messages for debugging