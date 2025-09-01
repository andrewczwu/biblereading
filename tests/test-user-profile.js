const {
  log,
  makeRequest,
  testEndpoint,
  generateTestData,
  cleanupTestData,
  validateResponse,
  validateResponseStructure,
  TEST_USER_ID
} = require('./test-helpers');

async function testUserProfileEndpoints() {
  log('🧪 Testing User Profile Endpoints...', 'blue');
  
  const testData = generateTestData();
  let passedTests = 0;
  let totalTests = 0;
  
  // Clean up any existing test data first
  await cleanupTestData();
  
  // Test 1: Create User Profile
  totalTests++;
  if (await testEndpoint('Create user profile', async () => {
    const response = await makeRequest('POST', '/user-profile', testData.userProfile, 201);
    
    validateResponseStructure(response, {
      message: 'string',
      profile: {
        uid: 'string',
        email: 'string',
        displayName: 'string',
        timezone: 'string',
        preferredLanguage: 'string',
        readingPreferences: 'object',
        privacy: 'object',
        createdAt: 'string'
      }
    });
    
    if (response.data.profile.uid !== TEST_USER_ID) {
      throw new Error(`Expected uid ${TEST_USER_ID}, got ${response.data.profile.uid}`);
    }
    
    if (response.data.profile.email !== testData.userProfile.email) {
      throw new Error(`Expected email ${testData.userProfile.email}, got ${response.data.profile.email}`);
    }
  })) {
    passedTests++;
  }
  
  // Test 2: Get User Profile
  totalTests++;
  if (await testEndpoint('Get user profile', async () => {
    const response = await makeRequest('GET', `/user-profile/${TEST_USER_ID}`, null, 200);
    
    validateResponseStructure(response, {
      message: 'string',
      profile: {
        uid: 'string',
        email: 'string',
        displayName: 'string',
        firstName: 'string',
        lastName: 'string',
        timezone: 'string',
        preferredLanguage: 'string',
        readingPreferences: 'object',
        privacy: 'object',
        isActive: 'boolean',
        createdAt: 'string',
        updatedAt: 'string',
        stats: 'object'
      }
    });
    
    const profile = response.data.profile;
    if (profile.uid !== TEST_USER_ID) {
      throw new Error(`Expected uid ${TEST_USER_ID}, got ${profile.uid}`);
    }
    
    if (profile.stats.totalSchedulesCreated !== 0) {
      throw new Error(`Expected initial stats to be 0, got ${profile.stats.totalSchedulesCreated}`);
    }
  })) {
    passedTests++;
  }
  
  // Test 3: Update User Profile
  totalTests++;
  if (await testEndpoint('Update user profile', async () => {
    const updateData = {
      displayName: 'Updated Test User',
      timezone: 'America/Los_Angeles',
      readingPreferences: {
        reminderTime: '07:00',
        preferredTranslation: 'NIV'
      }
    };
    
    const response = await makeRequest('PUT', `/user-profile/${TEST_USER_ID}`, updateData, 200);
    
    validateResponse(response, ['message', 'profile']);
    
    const profile = response.data.profile;
    if (profile.displayName !== 'Updated Test User') {
      throw new Error(`Expected updated displayName, got ${profile.displayName}`);
    }
    
    if (profile.timezone !== 'America/Los_Angeles') {
      throw new Error(`Expected updated timezone, got ${profile.timezone}`);
    }
    
    if (profile.readingPreferences.reminderTime !== '07:00') {
      throw new Error(`Expected updated reminderTime, got ${profile.readingPreferences.reminderTime}`);
    }
    
    // Verify partial update - other fields should remain
    if (profile.readingPreferences.enableReminders !== true) {
      throw new Error('Partial update should preserve existing fields');
    }
  })) {
    passedTests++;
  }
  
  // Test 4: Create Duplicate User Profile (should fail)
  totalTests++;
  if (await testEndpoint('Prevent duplicate user profile creation', async () => {
    const response = await makeRequest('POST', '/user-profile', testData.userProfile, 409);
    
    if (response.status !== 409) {
      throw new Error(`Expected 409 conflict, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 5: Get Non-Existent User Profile
  totalTests++;
  if (await testEndpoint('Handle non-existent user profile', async () => {
    const nonExistentUserId = 'non-existent-user-99999';
    const response = await makeRequest('GET', `/user-profile/${nonExistentUserId}`, null, 404);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 not found, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 6: Update Non-Existent User Profile
  totalTests++;
  if (await testEndpoint('Handle update of non-existent user profile', async () => {
    const nonExistentUserId = 'non-existent-user-99999';
    const updateData = { displayName: 'Should Not Work' };
    const response = await makeRequest('PUT', `/user-profile/${nonExistentUserId}`, updateData, 404);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 not found, got ${response.status}`);
    }
  })) {
    passedTests++;
  }
  
  // Test 7: Invalid Email Format
  totalTests++;
  if (await testEndpoint('Reject invalid email format', async () => {
    const invalidData = {
      ...testData.userProfile,
      uid: 'test-invalid-email',
      email: 'invalid-email-format'
    };
    
    const response = await makeRequest('POST', '/user-profile', invalidData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 8: Invalid Date of Birth Format
  totalTests++;
  if (await testEndpoint('Reject invalid date format', async () => {
    const invalidData = {
      ...testData.userProfile,
      uid: 'test-invalid-date',
      email: 'test-date@example.com',
      dateOfBirth: 'invalid-date'
    };
    
    const response = await makeRequest('POST', '/user-profile', invalidData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 9: Missing Required Fields
  totalTests++;
  if (await testEndpoint('Reject missing required fields', async () => {
    const incompleteData = {
      displayName: 'Missing UID and Email'
    };
    
    const response = await makeRequest('POST', '/user-profile', incompleteData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 10: Delete User Profile
  totalTests++;
  if (await testEndpoint('Delete user profile', async () => {
    const response = await makeRequest('DELETE', `/user-profile/${TEST_USER_ID}`, null, 200);
    
    validateResponse(response, ['message']);
    
    // Verify profile is marked as inactive
    const getResponse = await makeRequest('GET', `/user-profile/${TEST_USER_ID}`, null, 200);
    const profile = getResponse.data.profile;
    
    if (profile.isActive !== false) {
      throw new Error('Profile should be marked as inactive after deletion');
    }
    
    if (!profile.deletedAt) {
      throw new Error('Profile should have deletedAt timestamp after deletion');
    }
  })) {
    passedTests++;
  }
  
  // Clean up test data
  await cleanupTestData();
  
  // Summary
  log(`\n📊 User Profile Tests Summary:`, 'magenta');
  log(`   Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  
  return { passed: passedTests, total: totalTests, success: passedTests === totalTests };
}

// Run tests if called directly
if (require.main === module) {
  testUserProfileEndpoints()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Test suite failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { testUserProfileEndpoints };