# Bible Reading API

A Node.js API for managing Bible reading plans with Firebase Firestore integration.

## Features

- Complete Bible data with all 66 books, chapters, and verse counts
- Create and manage reading plans
- Track reading progress
- RESTful API endpoints
- Firebase Firestore integration

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Firebase:**
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials:
     ```env
     FIREBASE_PROJECT_ID=your-project-id
     FIREBASE_PRIVATE_KEY_ID=your-private-key-id
     FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour-private-key\n-----END PRIVATE KEY-----\n"
     FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
     FIREBASE_CLIENT_ID=your-client-id
     FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
     PORT=3000
     ```

3. **Seed the database:**
   ```bash
   npm run seed
   # OR
   POST /api/seed
   ```

4. **Start the server:**
   ```bash
   npm start
   # OR
   npm run dev
   ```

## API Endpoints

### Books
- `GET /api/books` - Get all books of the Bible with chapter and verse counts
- `GET /api/books/:bookId` - Get a specific book by ID

### Reading Plans
- `GET /api/reading-plans` - Get all reading plans (supports `?active=true&type=whole-bible`)
- `GET /api/reading-plans/:planId` - Get a specific reading plan
- `POST /api/reading-plans` - Create a new reading plan
- `PUT /api/reading-plans/:planId/progress` - Update reading plan progress
- `DELETE /api/reading-plans/:planId` - Delete a reading plan

### Utility
- `POST /api/seed` - Seed the database with Bible data

## Example Usage

### Create a Reading Plan
```bash
curl -X POST http://localhost:3000/api/reading-plans \
  -H "Content-Type: application/json" \
  -d '{
    "name": "One Year Bible Reading",
    "description": "Complete Bible in 365 days",
    "duration": 365,
    "startDate": "2024-01-01",
    "type": "whole-bible"
  }'
```

### Get All Books
```bash
curl http://localhost:3000/api/books
```

### Get Reading Plans
```bash
curl http://localhost:3000/api/reading-plans?active=true
```

## Data Structure

### Book
```json
{
  "id": "genesis",
  "name": "Genesis",
  "testament": "old",
  "order": 1,
  "chapters": [31, 25, 24, ...],
  "totalChapters": 50,
  "totalVerses": 1533,
  "chaptersWithVerses": [
    {"chapter": 1, "verses": 31},
    {"chapter": 2, "verses": 25},
    ...
  ]
}
```

### Reading Plan
```json
{
  "id": "plan123",
  "name": "One Year Bible Reading",
  "description": "Complete Bible in 365 days",
  "duration": 365,
  "startDate": "2024-01-01T00:00:00Z",
  "type": "whole-bible",
  "books": [...],
  "progress": {
    "completedDays": 0,
    "currentDay": 1,
    "completedBooks": [],
    "currentReading": null
  },
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```