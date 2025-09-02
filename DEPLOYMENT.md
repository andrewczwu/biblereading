# Firebase Cloud Functions Deployment Guide

## Setup Complete

Your Bible Reading API has been configured for Firebase Cloud Functions deployment.

## Project Structure

```
/biblereading
├── functions/          # Cloud Functions code
│   ├── index.js       # Main function entry point
│   ├── api/           # API endpoint handlers
│   └── config/        # Firebase configuration
├── client-new/        # React frontend
└── firebase.json      # Firebase configuration
```

## Deployment Steps

1. **Login to Firebase CLI**
   ```bash
   firebase login
   ```

2. **Deploy Functions**
   ```bash
   firebase deploy --only functions
   ```

3. **Deploy Frontend to Firebase Hosting (optional)**
   ```bash
   cd client-new
   npm run build
   firebase deploy --only hosting
   ```

## Environment Configuration

### Development
- API runs locally: `http://localhost:3000/api`
- Frontend uses `.env` file

### Production
- API URL: `https://us-central1-biblereading-f222a.cloudfunctions.net/api`
- Frontend uses `.env.production` file

## Testing

### Local Testing with Emulator
```bash
cd functions
npm run serve
```

The API will be available at:
`http://127.0.0.1:5001/biblereading-f222a/us-central1/api`

### Production Testing
Once deployed, test the API at:
`https://us-central1-biblereading-f222a.cloudfunctions.net/api`

## Troubleshooting

1. **Permission Issues**: Ensure you have proper Google Cloud permissions for the project
2. **API Enablement**: The first deployment may take time as it enables required APIs
3. **Cold Starts**: Cloud Functions may have initial latency on first requests

## Next Steps

1. Enable Google Cloud IAM permissions for deployment
2. Set up CI/CD pipeline for automatic deployments
3. Configure Firebase Hosting for the frontend
4. Set up monitoring and logging in Google Cloud Console