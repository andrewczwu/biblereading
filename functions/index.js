const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

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

// Configure CORS
app.use(cors({ origin: true }));
app.use(express.json());

// User Profile endpoints
app.post('/user-profile', createUserProfile);
app.get('/user-profile/:uid', getUserProfile);
app.put('/user-profile/:uid', updateUserProfile);
app.delete('/user-profile/:uid', deleteUserProfile);

// User Schedules endpoints
app.get('/user-schedules/:userId', getUserSchedules);

// Individual Schedule endpoints
app.post('/create-reading-schedule', createReadingSchedule);

// Group Schedule endpoints
app.post('/create-group-reading-schedule', createGroupReadingSchedule);
app.post('/join-group-reading-schedule', joinGroupReadingSchedule);
app.post('/leave-group-reading-schedule', leaveGroupReadingSchedule);
app.get('/group-members/:groupId', getGroupMembers);
app.get('/available-groups', getAvailableGroups);

// Reading Progress endpoints
app.post('/mark-reading-completed', markReadingCompleted);

// Reading Retrieval endpoints
app.get('/get-reading-schedule-with-progress', getReadingScheduleWithProgress);
app.get('/get-schedule-info', getScheduleInfo);
app.get('/get-schedule-progress', getScheduleProgress);
app.get('/get-day-reading', getDayReading);

// Reading Templates endpoints
app.get('/reading-templates', getReadingTemplates);
app.get('/reading-templates/:templateId', getReadingTemplate);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Bible Reading Schedule API - Firebase Cloud Functions',
    version: '1.0.0',
    description: 'Full-stack Bible reading application API with individual and group reading schedules',
    note: 'All endpoints are now available under /api/* path'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: error.message
  });
});

// Export the Express app as a Cloud Function
exports.api = functions.https.onRequest(app);