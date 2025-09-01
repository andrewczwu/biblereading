const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import API endpoint handlers
const { createUserProfile, getUserProfile, updateUserProfile, deleteUserProfile } = require('./api/user-profile');
const { createReadingSchedule } = require('./api/create-reading-schedule');
const { createGroupReadingSchedule } = require('./api/create-group-reading-schedule');
const { joinGroupReadingSchedule, leaveGroupReadingSchedule } = require('./api/join-group-reading-schedule');
const { markReadingCompleted } = require('./api/mark-reading-completed');
const { getReadingScheduleWithProgress, getDayReading } = require('./api/get-reading-schedule-with-progress');
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

// Individual Schedule endpoints
app.post('/api/create-reading-schedule', createReadingSchedule);

// Group Schedule endpoints
app.post('/api/create-group-reading-schedule', createGroupReadingSchedule);
app.post('/api/join-group-reading-schedule', joinGroupReadingSchedule);
app.post('/api/leave-group-reading-schedule', leaveGroupReadingSchedule);

// Reading Progress endpoints
app.post('/api/mark-reading-completed', markReadingCompleted);

// Reading Retrieval endpoints
app.get('/api/get-reading-schedule-with-progress', getReadingScheduleWithProgress);
app.get('/api/get-day-reading', getDayReading);

// Reading Templates endpoints
app.get('/api/reading-templates', getReadingTemplates);
app.get('/api/reading-templates/:templateId', getReadingTemplate);

app.get('/', (req, res) => {
  res.json({
    message: 'Bible Reading Schedule API',
    version: '1.0.0',
    endpoints: {
      userProfile: {
        'POST /api/user-profile': 'Create user profile',
        'GET /api/user-profile/:uid': 'Get user profile',
        'PUT /api/user-profile/:uid': 'Update user profile',
        'DELETE /api/user-profile/:uid': 'Delete user profile'
      },
      individualSchedules: {
        'POST /api/create-reading-schedule': 'Create individual reading schedule'
      },
      groupSchedules: {
        'POST /api/create-group-reading-schedule': 'Create group reading schedule',
        'POST /api/join-group-reading-schedule': 'Join group reading schedule',
        'POST /api/leave-group-reading-schedule': 'Leave group reading schedule'
      },
      readingProgress: {
        'POST /api/mark-reading-completed': 'Mark reading as completed/incomplete'
      },
      readingRetrieval: {
        'GET /api/get-reading-schedule-with-progress': 'Get readings with progress',
        'GET /api/get-day-reading': 'Get specific day reading'
      },
      readingTemplates: {
        'GET /api/reading-templates': 'Get all available reading templates',
        'GET /api/reading-templates/:templateId': 'Get specific reading template details'
      }
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