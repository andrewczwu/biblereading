const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import API endpoint handlers
const { createUserProfile, getUserProfile, updateUserProfile, deleteUserProfile } = require('./api/user-profile');
const { createReadingSchedule } = require('./api/create-reading-schedule');
const { createGroupReadingSchedule } = require('./api/create-group-reading-schedule');
const { joinGroupReadingSchedule, leaveGroupReadingSchedule } = require('./api/join-group-reading-schedule');
const { getGroupMembers } = require('./api/get-group-members');
const { getAvailableGroups } = require('./api/get-available-groups');
const { getUserSchedules } = require('./api/get-user-schedules');
const { markReadingCompleted } = require('./api/mark-reading-completed');
const { getReadingScheduleWithProgress, getDayReading } = require('./api/get-reading-schedule-with-progress');
const { getScheduleInfo } = require('./api/get-schedule-info');
const { getScheduleProgress } = require('./api/get-schedule-progress');
const { getReadingTemplates, getReadingTemplate } = require('./api/get-reading-templates');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// User Profile endpoints
app.post('/api/user-profile', createUserProfile);
app.get('/api/user-profile/:uid', getUserProfile);
app.put('/api/user-profile/:uid', updateUserProfile);
app.delete('/api/user-profile/:uid', deleteUserProfile);

// User Schedules endpoints
app.get('/api/user-schedules/:userId', getUserSchedules);

// Individual Schedule endpoints
app.post('/api/create-reading-schedule', createReadingSchedule);

// Group Schedule endpoints
app.post('/api/create-group-reading-schedule', createGroupReadingSchedule);
app.post('/api/join-group-reading-schedule', joinGroupReadingSchedule);
app.post('/api/leave-group-reading-schedule', leaveGroupReadingSchedule);
app.get('/api/group-members/:groupId', getGroupMembers);
app.get('/api/available-groups', getAvailableGroups);

// Reading Progress endpoints
app.post('/api/mark-reading-completed', markReadingCompleted);

// Reading Retrieval endpoints
app.get('/api/get-reading-schedule-with-progress', getReadingScheduleWithProgress);
app.get('/api/get-schedule-info', getScheduleInfo);
app.get('/api/get-schedule-progress', getScheduleProgress);
app.get('/api/get-day-reading', getDayReading);

// Reading Templates endpoints
app.get('/api/reading-templates', getReadingTemplates);
app.get('/api/reading-templates/:templateId', getReadingTemplate);

app.get('/', (req, res) => {
  res.json({
    message: 'Bible Reading Schedule API',
    version: '1.0.0',
    description: 'Full-stack Bible reading application API with individual and group reading schedules',
    features: [
      'User profile management with Firebase authentication',
      'Individual reading schedules from templates',
      'Group reading schedules with member management', 
      'Multiple completion task tracking (verse text, footnotes, partner)',
      'Points system for gamification',
      'Progress tracking with optimistic updates',
      'Client-side caching support'
    ],
    endpoints: {
      userProfile: {
        'POST /api/user-profile': {
          description: 'Create user profile after Firebase authentication',
          body: {
            uid: 'string (Firebase UID)',
            email: 'string',
            displayName: 'string',
            firstName: 'string',
            lastName: 'string (optional)',
            dateOfBirth: 'string (optional)',
            phoneNumber: 'string (optional)'
          }
        },
        'GET /api/user-profile/:uid': {
          description: 'Get user profile by Firebase UID',
          response: 'User profile object with all fields'
        },
        'PUT /api/user-profile/:uid': {
          description: 'Update user profile',
          body: 'Partial user profile object with fields to update'
        },
        'DELETE /api/user-profile/:uid': {
          description: 'Delete user profile and all associated data'
        }
      },
      userSchedules: {
        'GET /api/user-schedules/:userId': {
          description: 'Get all schedules and group memberships for a user with progress stats',
          response: {
            individualSchedules: 'Array with schedule info, progress stats, and points earned',
            groupSchedules: 'Array with group info, member role, progress stats, and points earned'
          }
        }
      },
      individualSchedules: {
        'POST /api/create-reading-schedule': {
          description: 'Create personal reading schedule from template',
          body: {
            userId: 'string (Firebase UID)',
            templateId: 'string',
            startDate: 'string (YYYY-MM-DD)',
            completionTasks: {
              verseText: 'boolean',
              footnotes: 'boolean', 
              partner: 'boolean'
            }
          }
        }
      },
      groupSchedules: {
        'POST /api/create-group-reading-schedule': {
          description: 'Create group reading schedule',
          body: {
            groupName: 'string',
            templateId: 'string', 
            startDate: 'string (YYYY-MM-DD)',
            createdBy: 'string (Firebase UID)',
            isPublic: 'boolean',
            maxMembers: 'number (optional)',
            customGroupId: 'string (optional)',
            completionTasks: {
              verseText: 'boolean',
              footnotes: 'boolean',
              partner: 'boolean'
            }
          }
        },
        'POST /api/join-group-reading-schedule': {
          description: 'Join existing group by ID',
          body: {
            userId: 'string (Firebase UID)',
            groupId: 'string',
            userName: 'string',
            email: 'string'
          }
        },
        'POST /api/leave-group-reading-schedule': {
          description: 'Leave group reading schedule',
          body: {
            userId: 'string (Firebase UID)',
            groupId: 'string'
          }
        },
        'GET /api/group-members/:groupId': {
          description: 'Get all members of a group with roles and progress',
          response: 'Array of member objects with user info and reading progress'
        },
        'GET /api/available-groups': {
          description: 'Get all public groups available to join',
          response: 'Array of group objects with member counts and capacity info'
        }
      },
      readingProgress: {
        'POST /api/mark-reading-completed': {
          description: 'Mark daily reading tasks as completed/incomplete with points calculation',
          body: {
            userId: 'string (Firebase UID)',
            scheduleId: 'string',
            dayNumber: 'number',
            completionTasks: {
              verseText: 'boolean (1 point)',
              footnotes: 'boolean (1 point)', 
              partner: 'boolean (1 point)'
            },
            scheduleType: 'string (individual or group)'
          }
        }
      },
      readingRetrieval: {
        'GET /api/get-reading-schedule-with-progress': {
          description: 'Get readings with progress (legacy - combined data)',
          query: 'userId, scheduleId, scheduleType, limit (optional)'
        },
        'GET /api/get-schedule-info': {
          description: 'Get schedule metadata and readings only (cacheable)',
          query: 'scheduleId, scheduleType',
          response: 'Schedule info with reading plan data (no progress)'
        },
        'GET /api/get-schedule-progress': {
          description: 'Get user progress data only (separate from schedule for better caching)',
          query: 'userId, scheduleId, scheduleType, limit (optional)',
          response: 'Array of progress entries with completion tasks and points'
        },
        'GET /api/get-day-reading': {
          description: 'Get specific day reading with progress',
          query: 'userId, scheduleId, scheduleType, dayNumber'
        }
      },
      readingTemplates: {
        'GET /api/reading-templates': {
          description: 'Get all available reading plan templates',
          response: 'Array of template objects with name, description, duration'
        },
        'GET /api/reading-templates/:templateId': {
          description: 'Get specific reading template with full details'
        }
      },
      utility: {
        'POST /api/seed': {
          description: 'Seed database with Bible book data (development only)'
        }
      }
    },
    architecture: {
      database: 'Firebase Firestore with nested collections',
      authentication: 'Firebase Auth integration',
      caching: 'Separate endpoints for cacheable schedule data vs dynamic progress data',
      pointsSystem: 'Each completion task worth 1 point for gamification'
    },
    usage: {
      baseUrl: 'http://localhost:3000/api',
      authentication: 'Firebase UID required for user-specific operations',
      errorHandling: 'Consistent JSON error responses with HTTP status codes'
    }
  });
});

app.post('/api/seed', async (req, res) => {
  try {
    await seedBibleData();
    res.json({
      success: true,
      message: 'Bible data seeded successfully'
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding data',
      error: error.message
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

app.listen(PORT, () => {
  console.log(`Bible Reading API server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} for API documentation`);
});

module.exports = app;