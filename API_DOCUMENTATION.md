# Bible Reading Schedule API Documentation

This document outlines all the API endpoints for the Bible Reading Schedule application.

## Overview

The API supports both individual and group Bible reading schedules based on templates. Users can create schedules, join groups, track progress with multiple completion tasks, earn points, and leverage client-side caching for optimal performance.

## Base URL
All endpoints are relative to your API base URL (e.g., `http://localhost:3000/api`)

## Implementation Status

✅ **FULLY IMPLEMENTED AND TESTED**

### Recent Major Updates (2025)
- **Multiple Completion Tasks**: Track verse text, footnotes, and partner discussion separately
- **Points System**: Gamification with 1 point per completion task
- **API Separation**: Separate endpoints for cacheable schedule data vs dynamic progress data
- **Optimistic UI Updates**: Enhanced user experience with immediate feedback
- **Shared UI Components**: Comprehensive component refactoring for consistency
- **Enhanced Group Management**: Available groups dropdown, admin controls
- **Client-Side Caching**: TTL-based caching system for better performance

### Server Status
- **Running on**: `http://localhost:3000`
- **Database**: Firebase Firestore (connected)
- **Environment**: Node.js with Express
- **Frontend**: React + TypeScript + Vite (http://localhost:5176)

---

## User Profile Management

### Create User Profile
Create a user profile linked to Firebase Authentication. Required fields: `uid`, `email`, `displayName`, and `firstName`.

**Endpoint:** `POST /api/user-profile`

**Request Body:**
```json
{
  "uid": "firebase-auth-uid-123",
  "email": "john.doe@example.com",
  "displayName": "John Doe",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1995-06-15",
  "phoneNumber": "+1234567890"
}
```

**Response (201 Created):**
```json
{
  "message": "User profile created successfully",
  "profile": {
    "uid": "firebase-auth-uid-123",
    "email": "john.doe@example.com",
    "displayName": "John Doe",
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1995-06-15",
    "phoneNumber": "+1234567890",
    "createdAt": "2024-01-15T10:30:00Z",
    "isActive": true
  }
}
```

### Get User Profile
**Endpoint:** `GET /api/user-profile/{uid}`

### Update User Profile
**Endpoint:** `PUT /api/user-profile/{uid}`

### Delete User Profile
**Endpoint:** `DELETE /api/user-profile/{uid}`

---

## User Schedules Dashboard

### Get All User Schedules
Retrieve all individual and group schedules for a user with progress statistics and points.

**Endpoint:** `GET /api/user-schedules/{userId}`

**Response (200 OK):**
```json
{
  "message": "User schedules retrieved successfully",
  "individualSchedules": [
    {
      "scheduleId": "user123_bellevueYPNT_2024-01-01",
      "templateName": "Bellevue Young People New Testament",
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "durationDays": 299,
      "status": "active",
      "completionTasks": {
        "verseText": true,
        "footnotes": false,
        "partner": true
      },
      "progress": {
        "totalReadings": 299,
        "completedReadings": 45,
        "completionPercentage": 15.05,
        "currentDay": 50,
        "pointsEarned": 78
      }
    }
  ],
  "groupSchedules": [
    {
      "groupId": "bellevue-yp-2024-spring",
      "groupName": "Bellevue Young People Spring 2024",
      "templateName": "Bellevue Young People New Testament",
      "memberRole": "member",
      "startDate": "2024-03-01",
      "currentDay": 25,
      "completionTasks": {
        "verseText": true,
        "footnotes": true,
        "partner": true
      },
      "progress": {
        "totalReadings": 299,
        "completedReadings": 22,
        "completionPercentage": 7.36,
        "pointsEarned": 55
      },
      "totalMembers": 12
    }
  ]
}
```

---

## Reading Templates

### Get All Templates
**Endpoint:** `GET /api/reading-templates`

**Response (200 OK):**
```json
{
  "templates": [
    {
      "id": "bellevueYPNT",
      "name": "Bellevue Young People New Testament",
      "description": "A 299-day journey through the New Testament",
      "durationDays": 299,
      "category": "New Testament",
      "difficulty": "Beginner"
    }
  ]
}
```

### Get Specific Template
**Endpoint:** `GET /api/reading-templates/{templateId}`

---

## Individual Reading Schedules

### Create Individual Reading Schedule
Create a personalized reading schedule with configurable completion tasks.

**Endpoint:** `POST /api/create-reading-schedule`

**Request Body:**
```json
{
  "userId": "user123",
  "templateId": "bellevueYPNT",
  "startDate": "2024-01-15",
  "completionTasks": {
    "verseText": true,
    "footnotes": false,
    "partner": true
  }
}
```

**Response (201 Created):**
```json
{
  "message": "Reading schedule created successfully",
  "schedule": {
    "scheduleId": "user123_bellevueYPNT_2024-01-15",
    "userId": "user123",
    "templateId": "bellevueYPNT",
    "templateName": "Bellevue Young People New Testament",
    "startDate": "2024-01-15",
    "endDate": "2024-12-31",
    "durationDays": 299,
    "completionTasks": {
      "verseText": true,
      "footnotes": false,
      "partner": true
    },
    "status": "active"
  }
}
```

---

## Group Reading Schedules

### Create Group Reading Schedule
**Endpoint:** `POST /api/create-group-reading-schedule`

**Request Body:**
```json
{
  "groupName": "Bellevue Young People Spring 2024",
  "templateId": "bellevueYPNT",
  "startDate": "2024-03-01",
  "createdBy": "admin123",
  "isPublic": true,
  "maxMembers": 50,
  "customGroupId": "custom-group-id",
  "completionTasks": {
    "verseText": true,
    "footnotes": true,
    "partner": true
  }
}
```

### Get Available Groups
Get all public groups available to join with member counts and availability.

**Endpoint:** `GET /api/available-groups`

**Response (200 OK):**
```json
{
  "message": "Available groups retrieved successfully",
  "groups": [
    {
      "groupId": "bellevue-yp-2024-spring",
      "groupName": "Bellevue Young People Spring 2024",
      "templateName": "Bellevue Young People New Testament",
      "startDate": "2024-03-01",
      "endDate": "2024-12-15",
      "durationDays": 299,
      "currentDay": 25,
      "memberCount": 12,
      "maxMembers": 50,
      "isFull": false,
      "completionTasks": {
        "verseText": true,
        "footnotes": true,
        "partner": true
      }
    }
  ]
}
```

### Join Group Reading Schedule
**Endpoint:** `POST /api/join-group-reading-schedule`

**Request Body:**
```json
{
  "userId": "user456",
  "groupId": "bellevue-yp-2024-spring",
  "userName": "Jane Doe",
  "email": "jane@example.com"
}
```

### Leave Group Reading Schedule
**Endpoint:** `POST /api/leave-group-reading-schedule`

### Get Group Members
**Endpoint:** `GET /api/group-members/{groupId}`

---

## Reading Progress with Multiple Completion Tasks

### Mark Reading Completed
Mark daily reading tasks as completed/incomplete with points calculation.

**Endpoint:** `POST /api/mark-reading-completed`

**Request Body:**
```json
{
  "userId": "user123",
  "scheduleId": "user123_bellevueYPNT_2024-01-15",
  "dayNumber": 5,
  "completionTasks": {
    "verseText": true,
    "footnotes": false,
    "partner": true
  },
  "scheduleType": "individual"
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully updated completion tasks for day 5",
  "progress": {
    "dayNumber": 5,
    "completionTasks": {
      "verseText": true,
      "footnotes": false,
      "partner": true
    },
    "pointsEarned": 2,
    "overallCompleted": false,
    "completedAt": "2024-01-20T19:45:00Z"
  }
}
```

**Points System:**
- Each completion task = 1 point
- verse text = 1 point
- footnotes = 1 point  
- partner = 1 point
- Maximum 3 points per day

---

## Reading Retrieval (Optimized for Caching)

### Get Schedule Info (Cacheable)
Get schedule metadata and readings only - no progress data for optimal caching.

**Endpoint:** `GET /api/get-schedule-info`

**Query Parameters:**
- `scheduleId` OR `groupId` (required): Schedule identifier
- `scheduleType` (required): "individual" or "group"

**Response (200 OK):**
```json
{
  "schedule": {
    "scheduleId": "user123_bellevueYPNT_2024-01-15",
    "templateName": "Bellevue Young People New Testament",
    "startDate": "2024-01-15",
    "endDate": "2024-12-31",
    "durationDays": 299,
    "status": "active",
    "completionTasks": {
      "verseText": true,
      "footnotes": false,
      "partner": true
    }
  },
  "readings": [
    {
      "dayNumber": 1,
      "scheduledDate": "2024-01-15",
      "portions": [
        {
          "bookName": "Matthew",
          "startChapter": 1,
          "startVerse": 1,
          "endChapter": 2,
          "endVerse": 23
        }
      ],
      "rawReading": "Matthew 1-2"
    }
  ]
}
```

### Get Schedule Progress (Dynamic)
Get user progress data only - separate from schedule for better caching.

**Endpoint:** `GET /api/get-schedule-progress`

**Query Parameters:**
- `userId` (required): User ID
- `scheduleId` OR `groupId` (required): Schedule identifier
- `scheduleType` (required): "individual" or "group"
- `limit` (optional): Number of progress entries to return

**Response (200 OK):**
```json
{
  "progress": [
    {
      "dayNumber": 1,
      "completionTasks": {
        "verseText": true,
        "footnotes": false,
        "partner": true
      },
      "pointsEarned": 2,
      "overallCompleted": false,
      "completedAt": "2024-01-15T19:45:00Z"
    }
  ],
  "summary": {
    "totalDays": 299,
    "completedDays": 45,
    "totalPointsEarned": 98,
    "completionPercentage": 15.05
  }
}
```

### Get Reading Schedule with Progress (Legacy)
Combined endpoint for backward compatibility.

**Endpoint:** `GET /api/get-reading-schedule-with-progress`

### Get Specific Day Reading
**Endpoint:** `GET /api/get-day-reading`

---

## Architecture & Caching Strategy

### API Separation for Performance
- **Schedule Info Endpoint**: Cacheable data (schedule metadata, readings)
- **Progress Endpoint**: Dynamic data (user progress, completion tasks, points)
- **Client-Side Caching**: TTL-based caching with cache invalidation

### Points System
- **Individual Tasks**: Track verse text, footnotes, partner discussion
- **Points Calculation**: 1 point per completed task (max 3 per day)
- **Gamification**: Points displayed on dashboard for motivation

### Database Collections
```
userReadingSchedules/
  └── {scheduleId}/
      ├── (schedule metadata with completionTasks config)
      └── progress/{userId}/
          └── dailyProgress/
              └── {dayNumber} (completionTasks object with points)

groupReadingSchedules/
  └── {groupId}/
      ├── (group metadata with completionTasks config)
      └── progress/{userId}/
          └── dailyProgress/
              └── {dayNumber} (completionTasks object with points)
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "success": false,
  "error": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (access denied)
- `404`: Resource not found
- `409`: Conflict (resource already exists)
- `500`: Internal server error

---

## Frontend Integration

### React Components Architecture
- **Shared UI Components**: Button, Form, Layout, LoadingStates
- **Optimistic Updates**: Immediate UI feedback with error rollback
- **Caching Strategy**: Client-side caching with localStorage and TTL
- **Responsive Design**: Mobile-first approach with styled-components

### API Client Configuration
```typescript
// services/api.ts
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Cache configuration
const CACHE_TTL = {
  scheduleInfo: 30 * 60 * 1000, // 30 minutes
  userSchedules: 5 * 60 * 1000,  // 5 minutes
  progress: 60 * 1000            // 1 minute
};
```

---

## Development & Testing

### Quick Start
```bash
# Start API server
npm start

# Start frontend dev server
cd client-new && npm run dev

# Run tests
API_BASE_URL=http://localhost:3000/api node tests/test-user-profile.js
```

### Environment Variables
```env
# Backend (.env)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
PORT=3000

# Frontend (.env in client-new/)
VITE_FIREBASE_API_KEY=your-web-api-key
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## API Documentation Access

Visit http://localhost:3000 for interactive API documentation with complete endpoint details, request/response schemas, and architecture information.

This comprehensive API provides full functionality for Bible reading schedule management with modern features like multiple completion task tracking, gamification through points, optimized caching strategies, and enhanced user experience through optimistic UI updates.