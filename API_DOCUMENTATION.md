# Bible Reading Schedule API Documentation

This document outlines all the API endpoints for the Bible Reading Schedule application.

## Overview

The API supports both individual and group Bible reading schedules based on templates. Users can create schedules, join groups, track progress, and mark daily readings as complete.

## Base URL
All endpoints are relative to your API base URL (e.g., `http://localhost:3000/api`)

---

## Reading Templates

### Get Available Templates
Templates are stored in Firestore under the `readingTemplates` collection and can be queried directly. The current available template is:

- **bellevueYPNT**: Bellevue Young People New Testament (299 days)

---

## Individual Reading Schedules

### Create Individual Reading Schedule
Create a personalized reading schedule from a template.

**Endpoint:** `POST /api/create-reading-schedule`

**Request Body:**
```json
{
  "userId": "user123",
  "templateId": "bellevueYPNT", 
  "startDate": "2024-01-15"
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
    "totalDailyReadings": 299,
    "status": "active"
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid date format
- `404`: Template not found
- `409`: Schedule already exists

---

## Group Reading Schedules

### Create Group Reading Schedule
Create a group reading schedule that multiple users can join.

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
  "customGroupId": "custom-group-id" // Optional
}
```

**Response (201 Created):**
```json
{
  "message": "Group reading schedule created successfully",
  "group": {
    "groupId": "bellevue-yp-2024-spring",
    "groupName": "Bellevue Young People Spring 2024",
    "templateId": "bellevueYPNT",
    "templateName": "Bellevue Young People New Testament",
    "startDate": "2024-03-01",
    "endDate": "2024-12-15",
    "durationDays": 299,
    "totalDailyReadings": 299,
    "status": "active",
    "createdBy": "admin123",
    "isPublic": true,
    "maxMembers": 50,
    "memberCount": 1
  }
}
```

**Error Responses:**
- `400`: Missing required fields or invalid date format
- `404`: Template not found
- `409`: Group ID already exists

### Join Group Reading Schedule
Allow a user to join an existing group schedule.

**Endpoint:** `POST /api/join-group-reading-schedule`

**Request Body:**
```json
{
  "userId": "user456",
  "groupId": "bellevue-yp-2024-spring",
  "userName": "Jane Doe", // Optional
  "email": "jane@example.com" // Optional
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully joined group reading schedule",
  "group": {
    "groupId": "bellevue-yp-2024-spring",
    "groupName": "Bellevue Young People Spring 2024",
    "templateName": "Bellevue Young People New Testament",
    "startDate": "2024-03-01",
    "endDate": "2024-12-15",
    "durationDays": 299,
    "currentDay": 15,
    "memberRole": "member",
    "totalMembers": 12
  }
}
```

**Error Responses:**
- `400`: Missing fields, group full, or invalid group status
- `404`: Group not found
- `409`: User already a member

### Leave Group Reading Schedule
Allow a user to leave a group schedule.

**Endpoint:** `POST /api/leave-group-reading-schedule`

**Request Body:**
```json
{
  "userId": "user456",
  "groupId": "bellevue-yp-2024-spring"
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully left group reading schedule"
}
```

**Error Responses:**
- `400`: Cannot leave (only admin), or missing fields
- `404`: User not a member

---

## Reading Progress

### Mark Reading as Completed/Incomplete
Mark a specific day's reading as completed or incomplete.

**Endpoint:** `POST /api/mark-reading-completed`

**Individual Schedule Request:**
```json
{
  "userId": "user123",
  "scheduleId": "user123_bellevueYPNT_2024-01-15",
  "dayNumber": 5,
  "isCompleted": true,
  "notes": "Great chapters about the Sermon on the Mount!", // Optional
  "timeSpentMinutes": 25 // Optional
}
```

**Group Schedule Request:**
```json
{
  "userId": "user123", 
  "groupId": "bellevue-yp-2024-spring",
  "dayNumber": 5,
  "isCompleted": true,
  "notes": "Loved discussing this with the group", // Optional
  "timeSpentMinutes": 20 // Optional
}
```

**Response (200 OK):**
```json
{
  "message": "Successfully marked day 5 as completed",
  "progress": {
    "dayNumber": 5,
    "isCompleted": true,
    "completedAt": "2024-01-20T19:45:00Z",
    "notes": "Great chapters about the Sermon on the Mount!",
    "timeSpentMinutes": 25,
    "scheduleName": "Bellevue Young People New Testament"
  }
}
```

**Error Responses:**
- `400`: Missing required fields
- `403`: Access denied or invalid membership
- `404`: Schedule or day not found

---

## Reading Retrieval

### Get All Readings with Progress
Retrieve all readings in a schedule with completion status.

**Endpoint:** `GET /api/get-reading-schedule-with-progress`

**Query Parameters:**
- `userId` (required): User ID
- `scheduleId` OR `groupId` (required): Schedule identifier  
- `limit` (optional): Number of readings to return
- `offset` (optional): Number of readings to skip

**Example:**
```
/api/get-reading-schedule-with-progress?userId=user123&groupId=bellevue-yp-2024-spring&limit=10
```

**Response (200 OK):**
```json
{
  "schedule": {
    "scheduleId": null,
    "groupId": "bellevue-yp-2024-spring", 
    "scheduleName": "Bellevue Young People New Testament",
    "groupName": "Bellevue Young People Spring 2024",
    "startDate": "2024-03-01",
    "endDate": "2024-12-15",
    "durationDays": 299,
    "currentDay": 15,
    "status": "active",
    "isGroupSchedule": true
  },
  "progress": {
    "totalReadings": 10,
    "completedReadings": 7,
    "remainingReadings": 3,
    "completionPercentage": 70,
    "currentStreak": 3,
    "longestStreak": 5
  },
  "readings": [
    {
      "dayId": "001",
      "dayNumber": 1,
      "scheduledDate": "2024-03-01",
      "dayOfWeek": "Friday", 
      "startBookName": "Matthew",
      "startBookId": 40,
      "endBookName": "Matthew",
      "endBookId": 40,
      "portions": [
        {
          "bookId": 40,
          "bookName": "Matthew",
          "startChapter": 1,
          "startVerse": 1,
          "endChapter": 2,
          "endVerse": 23,
          "portionOrder": 1
        }
      ],
      "rawReading": "Matthew 1-2",
      "isCompleted": true,
      "completedAt": "2024-03-01T20:30:00Z",
      "notes": "Great introduction to Jesus' genealogy",
      "timeSpentMinutes": 20,
      "progressUpdatedAt": "2024-03-01T20:30:00Z"
    }
    // ... more readings
  ],
  "pagination": {
    "returned": 10,
    "limit": 10,
    "offset": null
  }
}
```

### Get Specific Day's Reading
Retrieve a specific day's reading assignment with completion status.

**Endpoint:** `GET /api/get-day-reading`

**Query Parameters:**
- `userId` (required): User ID
- `scheduleId` OR `groupId` (required): Schedule identifier
- `dayNumber` OR `date` (required): Either day number (1-299) or specific date (YYYY-MM-DD)

**Examples:**

By Day Number:
```
/api/get-day-reading?userId=user123&scheduleId=user123_bellevueYPNT_2024-01-15&dayNumber=15
```

By Specific Date:
```
/api/get-day-reading?userId=user123&groupId=bellevue-yp-2024-spring&date=2024-03-15
```

**Response (200 OK):**
```json
{
  "message": "Reading for day 15",
  "searchCriteria": { "dayNumber": 15 },
  "reading": {
    "dayId": "015",
    "dayNumber": 15,
    "scheduledDate": "2024-01-29",
    "dayOfWeek": "Monday",
    "startBookName": "Matthew",
    "startBookId": 40,
    "endBookName": "Matthew", 
    "endBookId": 40,
    "portions": [
      {
        "bookId": 40,
        "bookName": "Matthew",
        "startChapter": 15,
        "startVerse": 1,
        "endChapter": 16,
        "endVerse": 28,
        "portionOrder": 1
      }
    ],
    "rawReading": "Matthew 15-16",
    "isCompleted": false,
    "completedAt": null,
    "notes": null,
    "timeSpentMinutes": null
  }
}
```

**Error Responses:**
- `400`: Missing/invalid parameters or invalid date format
- `403`: Access denied
- `404`: Day/date not found in schedule

---

## Data Models

### Reading Portion
```json
{
  "bookId": 40,
  "bookName": "Matthew",
  "startChapter": 1,
  "startVerse": 1,
  "endChapter": 2,
  "endVerse": 23,
  "portionOrder": 1
}
```

### User Progress
```json
{
  "dayNumber": 1,
  "scheduledDate": "2024-01-15",
  "isCompleted": true,
  "completedAt": "2024-01-15T19:45:00Z",
  "notes": "Great opening chapters!",
  "timeSpentMinutes": 15,
  "updatedAt": "2024-01-15T19:45:00Z"
}
```

---

## File Structure

The API endpoints are implemented in the following files:

- **Individual Schedules**: `api/create-reading-schedule.js`
- **Group Schedules**: `api/create-group-reading-schedule.js`
- **Group Membership**: `api/join-group-reading-schedule.js`
- **Progress Tracking**: `api/mark-reading-completed.js`
- **Reading Retrieval**: `api/get-reading-schedule-with-progress.js`

---

## Authentication & Authorization

- **Individual Schedules**: Users can only access schedules they created
- **Group Schedules**: Users must be active members to access group data
- **Admin Permissions**: Group creators automatically become admins and have additional permissions

---

## Database Schema

### Collections Structure
```
readingTemplates/
  └── bellevueYPNT/
      └── dailyReadings/ (subcollection)

userReadingSchedules/
  └── {scheduleId}/
      ├── dailySchedule/ (subcollection)
      └── progress/ (subcollection)

groupReadingSchedules/
  └── {groupId}/
      ├── dailySchedule/ (subcollection)
      ├── members/ (subcollection)
      └── progress/{userId}/
          └── dailyProgress/ (subcollection)
```

This API provides complete functionality for creating, managing, and tracking Bible reading schedules for both individual users and groups.