# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a full-stack Bible reading application with a Node.js/Express API backend and a React frontend built with Vite, TypeScript, and styled-components.

### Backend Architecture
- **API Server**: Express.js server with Firebase Admin SDK for Firestore database
- **Modular API Design**: Each endpoint has its own module in `/api/` directory 
- **Firebase Integration**: Uses Firebase Firestore for data persistence and Firebase Auth for user authentication
- **RESTful Endpoints**: User profiles, reading schedules, group schedules, and progress tracking

### Frontend Architecture  
- **React 19 + TypeScript**: Located in `/client-new/` directory
- **Styled Components**: No CSS frameworks - pure styled-components with custom theme system
- **Firebase Authentication**: Client-side auth with React context for state management
- **Mobile-First Design**: Responsive components that adapt from mobile to desktop
- **React Hook Form**: Form validation and state management
- **React Router**: Client-side routing with protected routes

### Key Integration Points
- Frontend communicates with backend via Axios HTTP client in `/client-new/src/services/api.ts`
- Authentication flow: Firebase Auth (frontend) → user profile creation via API (backend) → Firestore (database)
- User registration captures comprehensive profile data including reading preferences
- Backend API expects users to be authenticated via Firebase before profile creation

### Core Features
- **User Authentication**: Firebase Auth with email/password, comprehensive profile creation
- **Individual Reading Schedules**: Create personal Bible reading schedules from templates
- **Group Reading Schedules**: Create and manage group reading schedules with multiple members
- **Group Management**: Join groups by ID, leave groups, admin/member roles
- **Reading Templates**: Pre-defined reading plans (e.g., Bellevue YPNT, Chronological, One-Year)
- **Progress Tracking**: Mark daily readings as complete/incomplete

## Development Commands

### Backend Development
```bash
# Start API server (from root directory)
npm run dev              # Starts server on PORT from .env (default 3000)
npm start               # Production server start
npm run seed            # Seed database with Bible book data
```

### Frontend Development  
```bash
# Frontend development (from client-new/ directory)
npm run dev             # Starts Vite dev server (usually port 5173+)
npm run build           # TypeScript compilation + Vite build
npm run preview         # Preview production build
npm run lint           # ESLint code checking
```

### Testing
```bash
# API Tests (from root directory)
# Individual test files can be run with node:
node tests/test-user-profile.js
node tests/test-individual-schedules.js  
node tests/test-group-schedules.js

# Tests require API_BASE_URL environment variable
API_BASE_URL=http://localhost:3000/api node tests/test-user-profile.js
```

## Environment Configuration

### Backend (.env in root)
```env
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id  
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_DATABASE_URL=https://project.firebaseio.com
PORT=3000
```

### Frontend (.env in client-new/)
```env
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com  
VITE_FIREBASE_MESSAGING_SENDER_ID=sender-id
VITE_FIREBASE_APP_ID=app-id
VITE_API_BASE_URL=http://localhost:3000/api
```

## Firebase Setup Requirements

1. Backend uses Firebase Admin SDK with service account credentials
2. Frontend uses Firebase Web SDK with public web app config
3. Database must be seeded with Bible book data before creating reading schedules
4. User profiles are stored in Firestore after Firebase Auth registration

## Styled Components Theme System

The frontend uses a comprehensive theme system in `/client-new/src/styles/theme.ts`:
- Colors: Primary/gray palettes with 50-900 shades
- Spacing: Consistent spacing scale (1-20)  
- Typography: Font sizes, weights, responsive breakpoints
- Components are mobile-first responsive using theme breakpoints

Theme is consumed via styled-components and should be used consistently across all UI components rather than hardcoded values.

## API Testing Notes

The `/tests/` directory contains manual test scripts that test API endpoints end-to-end. Tests require the server to be running and use real HTTP requests. The test-helpers.js provides utilities for colorized console output and common test patterns.

## Node.js Version Compatibility

Frontend uses Vite 4.5.3 (downgraded from latest) for compatibility with Node.js 20.10.0. If upgrading Node.js, Vite can be upgraded to latest version.