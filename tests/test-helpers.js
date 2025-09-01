const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const DEBUG = process.env.DEBUG === 'true';

// Test data constants
const TEST_USER_ID = 'test-user-12345';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_GROUP_ID = 'test-group-12345';
const TEST_TEMPLATE_ID = 'bellevueYPNT';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function debug(message, data = null) {
  if (DEBUG) {
    log(`🐛 ${message}`, 'cyan');
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
}

async function makeRequest(method, endpoint, data = null, expectedStatus = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  debug(`Making ${method.toUpperCase()} request to ${endpoint}`, data);
  
  try {
    const config = {
      method: method.toLowerCase(),
      url: url,
      ...(data && { data })
    };
    
    const response = await axios(config);
    
    debug(`Response (${response.status}):`, response.data);
    
    if (expectedStatus && response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    
    return response;
  } catch (error) {
    if (error.response) {
      debug(`Error Response (${error.response.status}):`, error.response.data);
      
      if (expectedStatus && error.response.status === expectedStatus) {
        return error.response;
      }
    }
    
    throw error;
  }
}

async function testEndpoint(description, testFunction) {
  try {
    await testFunction();
    log(`✅ ${description}`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description}`, 'red');
    log(`   Error: ${error.message}`, 'red');
    if (DEBUG && error.response) {
      log(`   Response: ${JSON.stringify(error.response.data, null, 2)}`, 'red');
    }
    return false;
  }
}

function generateTestData() {
  return {
    userProfile: {
      uid: TEST_USER_ID,
      email: TEST_USER_EMAIL,
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      timezone: 'America/New_York',
      preferredLanguage: 'en',
      readingPreferences: {
        reminderTime: '08:00',
        enableReminders: true,
        preferredTranslation: 'ESV',
        readingGoal: 'daily'
      },
      privacy: {
        profileVisibility: 'public',
        showReadingProgress: true,
        allowGroupInvitations: true
      }
    },
    
    groupSchedule: {
      groupName: 'Test Group 12345',
      templateId: TEST_TEMPLATE_ID,
      startDate: '2024-01-15',
      createdBy: TEST_USER_ID,
      isPublic: true,
      maxMembers: 10,
      customGroupId: TEST_GROUP_ID
    },
    
    individualSchedule: {
      userId: TEST_USER_ID,
      templateId: TEST_TEMPLATE_ID,
      startDate: '2024-02-01'
    }
  };
}

async function cleanupTestData() {
  log('🧹 Cleaning up test data...', 'yellow');
  
  const cleanupTasks = [
    // Delete test user profile
    async () => {
      try {
        await makeRequest('DELETE', `/user-profile/${TEST_USER_ID}`);
        debug('Deleted test user profile');
      } catch (error) {
        debug('Test user profile not found or already deleted');
      }
    },
    
    // Note: In a real implementation, you'd also clean up:
    // - Test individual schedules
    // - Test group schedules  
    // - Test progress data
    // For now, we'll rely on Firestore document expiration or manual cleanup
  ];
  
  for (const task of cleanupTasks) {
    try {
      await task();
    } catch (error) {
      debug(`Cleanup task failed: ${error.message}`);
    }
  }
  
  debug('Cleanup completed');
}

function validateResponse(response, expectedFields = []) {
  if (!response.data) {
    throw new Error('Response has no data field');
  }
  
  for (const field of expectedFields) {
    if (!(field in response.data)) {
      throw new Error(`Response missing expected field: ${field}`);
    }
  }
  
  return true;
}

function validateResponseStructure(response, structure) {
  if (!response.data) {
    throw new Error('Response has no data field');
  }
  
  function validateObject(obj, expectedStructure, path = '') {
    for (const [key, expectedType] of Object.entries(expectedStructure)) {
      const fullPath = path ? `${path}.${key}` : key;
      
      if (!(key in obj)) {
        throw new Error(`Missing field: ${fullPath}`);
      }
      
      const value = obj[key];
      
      if (typeof expectedType === 'string') {
        if (typeof value !== expectedType) {
          throw new Error(`Field ${fullPath} should be ${expectedType}, got ${typeof value}`);
        }
      } else if (typeof expectedType === 'object' && expectedType !== null) {
        if (typeof value !== 'object' || value === null) {
          throw new Error(`Field ${fullPath} should be an object`);
        }
        validateObject(value, expectedType, fullPath);
      }
    }
  }
  
  validateObject(response.data, structure);
  return true;
}

async function waitForCondition(conditionFn, timeoutMs = 5000, intervalMs = 100) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    if (await conditionFn()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  throw new Error(`Condition not met within ${timeoutMs}ms`);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  API_BASE_URL,
  TEST_USER_ID,
  TEST_USER_EMAIL,
  TEST_GROUP_ID,
  TEST_TEMPLATE_ID,
  log,
  debug,
  makeRequest,
  testEndpoint,
  generateTestData,
  cleanupTestData,
  validateResponse,
  validateResponseStructure,
  waitForCondition,
  sleep,
  colors
};