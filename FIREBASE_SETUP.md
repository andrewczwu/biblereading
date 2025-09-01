# Firebase Setup Guide for Bible Reading Schedule App

This guide will walk you through setting up Firebase Authentication and getting the configuration values needed for your `.env` file.

## 📋 Prerequisites

- A Google account
- Access to [Firebase Console](https://console.firebase.google.com/)

## 🚀 Step-by-Step Firebase Setup

### Step 1: Create a Firebase Project

1. **Go to Firebase Console**
   - Navigate to https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click "Create a project" or "Add project"
   - Enter a project name (e.g., "bible-reading-schedule")
   - Click "Continue"

3. **Configure Google Analytics** (Optional)
   - You can disable this if you don't need analytics
   - Click "Create project"
   - Wait for the project to be created (usually takes 30-60 seconds)

### Step 2: Enable Authentication

1. **Navigate to Authentication**
   - In the Firebase Console, click on "Authentication" in the left sidebar
   - Click "Get started"

2. **Enable Email/Password Provider**
   - Go to the "Sign-in method" tab
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### Step 3: Create a Web App

1. **Register Your App**
   - Go to Project Overview (click the home icon)
   - Click the Web icon (</>) to add a web app
   - Enter an app nickname (e.g., "Bible Reading Web App")
   - You can skip "Firebase Hosting" for now
   - Click "Register app"

2. **Get Your Configuration**
   - After registering, you'll see a configuration object that looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDOCAbC123dEf456GhI789jKl012-MnO",
  authDomain: "myapp-project-123.firebaseapp.com",
  projectId: "myapp-project-123",
  storageBucket: "myapp-project-123.appspot.com",
  messagingSenderId: "65211879809",
  appId: "1:65211879909:web:3ae38ef1cdcb2e01fe5f0c"
};
```

### Step 4: Configure Firestore Database

1. **Create Firestore Database**
   - In the Firebase Console, click on "Firestore Database" in the left sidebar
   - Click "Create database"
   - Choose "Start in production mode" (we'll update rules later)
   - Select your preferred location (choose closest to your users)
   - Click "Enable"

2. **Set Security Rules** (Important!)
   - Go to the "Rules" tab in Firestore
   - Replace the default rules with these basic rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own profile
    match /userProfiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read templates
    match /readingTemplates/{template} {
      allow read: if request.auth != null;
      
      match /dailyReadings/{reading} {
        allow read: if request.auth != null;
      }
    }
    
    // Allow authenticated users to manage their schedules
    match /userReadingSchedules/{schedule} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Allow authenticated users to read group schedules they're members of
    match /groupReadingSchedules/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.uid in resource.data.adminIds;
      
      match /members/{memberId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
          request.auth.uid == memberId;
      }
    }
  }
}
```

3. **Click "Publish"** to save the rules

### Step 5: Create the .env File

1. **Navigate to your client directory**
```bash
cd E:\Project\biblereading\client
```

2. **Create/Edit the .env file**
   - Copy `.env.example` to `.env` if you haven't already
   - Open `.env` in a text editor

3. **Fill in the Firebase Configuration**
   Using the values from Step 3, update your `.env` file:

```env
# Firebase Configuration (from your Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSyDOCAbC123dEf456GhI789jKl012-MnO
VITE_FIREBASE_AUTH_DOMAIN=myapp-project-123.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=myapp-project-123
VITE_FIREBASE_STORAGE_BUCKET=myapp-project-123.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=65211879809
VITE_FIREBASE_APP_ID=1:65211879909:web:3ae38ef1cdcb2e01fe5f0c

# API Configuration (keep as is for local development)
VITE_API_BASE_URL=http://localhost:3001/api
```

### Step 6: Get Service Account Key (for Backend)

The backend also needs Firebase access. To set this up:

1. **Generate Service Account Key**
   - In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"
   - Go to the "Service accounts" tab
   - Click "Generate new private key"
   - Click "Generate key" in the dialog
   - Save the downloaded JSON file as `biblereading-pkey.json` in your project root

2. **Move the Key File**
   - Place the downloaded file at: `E:\Project\biblereading\biblereading-pkey.json`
   - ⚠️ **IMPORTANT**: Never commit this file to version control!

3. **Add to .gitignore** (if not already there)
```bash
echo "biblereading-pkey.json" >> .gitignore
```

## ✅ Verification Steps

1. **Test Firebase Connection**
   - Restart your development server
   - Try to register a new account
   - Check Firebase Console > Authentication > Users tab
   - You should see the new user appear

2. **Test Firestore**
   - After registration, check Firestore Database
   - You should see a `userProfiles` collection with the new user's data

## 🔍 Where to Find Each Value

| Environment Variable | Where to Find It |
|---------------------|------------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console > Project Settings > General > Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console > Project Settings > General > authDomain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console > Project Settings > General > Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console > Project Settings > General > storageBucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console > Project Settings > Cloud Messaging > Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase Console > Project Settings > General > App ID |

## 🛠️ Troubleshooting

### Common Issues and Solutions

1. **"Firebase: Error (auth/configuration-not-found)"**
   - Double-check all values in `.env` file
   - Make sure there are no extra spaces or quotes in the values
   - Restart the development server after changing `.env`

2. **"Permission denied" errors**
   - Check Firestore security rules
   - Ensure the user is properly authenticated
   - Verify the collection names match exactly

3. **"Invalid API key" error**
   - Go to Firebase Console > Project Settings
   - Verify the Web API Key is correct
   - Check that the API key is not restricted (or add localhost to allowed domains)

4. **Backend can't connect to Firebase**
   - Ensure `biblereading-pkey.json` exists in the project root
   - Verify the file contains valid JSON
   - Check that the service account has necessary permissions

## 🔒 Security Best Practices

1. **Never commit credentials to Git**
   - Always keep `.env` and `biblereading-pkey.json` in `.gitignore`
   - Use environment variables in production

2. **Restrict API Keys** (for production)
   - In Firebase Console > Project Settings > General
   - Click on "API keys" and add domain restrictions
   - Only allow your production domain

3. **Enable App Check** (optional, for production)
   - Provides additional security against abuse
   - Go to Firebase Console > App Check
   - Follow the setup guide for web apps

## 📝 Example Working Configuration

Here's what a working `.env` file might look like (with fake values):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyBcD3fGhIjKlMnOpQrStUvWxYz1234567
VITE_FIREBASE_AUTH_DOMAIN=bible-reading-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bible-reading-app
VITE_FIREBASE_STORAGE_BUCKET=bible-reading-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789abcdef

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
```

## 🎉 Success Indicators

You'll know everything is working when:
1. ✅ You can register a new account in the app
2. ✅ The user appears in Firebase Authentication
3. ✅ A user profile is created in Firestore
4. ✅ You can log in and see the dashboard
5. ✅ API calls to the backend succeed

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth/web/start)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Console](https://console.firebase.google.com/)

## Need Help?

If you encounter any issues:
1. Check the browser console for error messages
2. Verify all configuration values are correct
3. Ensure both frontend and backend servers are running
4. Check Firebase Console for any service issues

Remember to keep your Firebase credentials secure and never share them publicly!