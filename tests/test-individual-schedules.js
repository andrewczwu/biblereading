const {
  log,
  makeRequest,
  testEndpoint,
  generateTestData,
  cleanupTestData,
  validateResponse,
  validateResponseStructure,
  TEST_USER_ID,
  TEST_TEMPLATE_ID
} = require('./test-helpers');

async function testIndividualScheduleEndpoints() {
  log('🧪 Testing Individual Schedule Endpoints...', 'blue');
  
  const testData = generateTestData();
  let passedTests = 0;
  let totalTests = 0;
  
  // Clean up any existing test data first
  await cleanupTestData();
  
  // Create test user profile first (required for individual schedules)
  await makeRequest('POST', '/user-profile', testData.userProfile, 201);
  
  // Test 1: Create Individual Reading Schedule
  totalTests++;
  let scheduleId = null;
  if (await testEndpoint('Create individual reading schedule', async () => {
    const response = await makeRequest('POST', '/create-reading-schedule', testData.individualSchedule, 201);
    
    validateResponseStructure(response, {
      message: 'string',
      schedule: {
        scheduleId: 'string',
        userId: 'string',
        templateId: 'string',
        templateName: 'string',
        startDate: 'string',
        endDate: 'string',
        durationDays: 'number',
        totalDailyReadings: 'number',
        status: 'string'
      }
    });
    
    const schedule = response.data.schedule;
    scheduleId = schedule.scheduleId;
    
    if (schedule.userId !== TEST_USER_ID) {
      throw new Error(`Expected userId ${TEST_USER_ID}, got ${schedule.userId}`);
    }
    
    if (schedule.templateId !== TEST_TEMPLATE_ID) {
      throw new Error(`Expected templateId ${TEST_TEMPLATE_ID}, got ${schedule.templateId}`);
    }
    
    if (schedule.startDate !== testData.individualSchedule.startDate) {
      throw new Error(`Expected startDate ${testData.individualSchedule.startDate}, got ${schedule.startDate}`);
    }
    
    if (schedule.status !== 'active') {
      throw new Error(`Expected status 'active', got ${schedule.status}`);
    }
    
    if (schedule.durationDays <= 0) {
      throw new Error(`Expected positive durationDays, got ${schedule.durationDays}`);
    }
    
    if (schedule.totalDailyReadings !== schedule.durationDays) {
      throw new Error('totalDailyReadings should equal durationDays');
    }
  })) {
    passedTests++;
  }
  
  // Test 2: Create Duplicate Schedule (should fail)
  totalTests++;
  if (await testEndpoint('Prevent duplicate schedule creation', async () => {
    const response = await makeRequest('POST', '/create-reading-schedule', testData.individualSchedule, 409);
    
    if (response.status !== 409) {
      throw new Error(`Expected 409 conflict, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
    
    if (!response.data.error.toLowerCase().includes('already exists')) {
      throw new Error('Error message should indicate schedule already exists');
    }
  })) {
    passedTests++;
  }
  
  // Test 3: Create Schedule with Different Start Date (should succeed)
  totalTests++;
  if (await testEndpoint('Create schedule with different start date', async () => {
    const differentScheduleData = {
      ...testData.individualSchedule,
      startDate: '2024-03-01'
    };
    
    const response = await makeRequest('POST', '/create-reading-schedule', differentScheduleData, 201);
    
    validateResponse(response, ['message', 'schedule']);
    
    const schedule = response.data.schedule;
    if (schedule.startDate !== '2024-03-01') {
      throw new Error(`Expected startDate 2024-03-01, got ${schedule.startDate}`);
    }
    
    // Verify different schedule ID was generated
    if (schedule.scheduleId === scheduleId) {
      throw new Error('Different start date should generate different schedule ID');
    }
  })) {
    passedTests++;
  }
  
  // Test 4: Create Schedule with Non-Existent Template
  totalTests++;
  if (await testEndpoint('Handle non-existent template', async () => {
    const invalidScheduleData = {
      ...testData.individualSchedule,
      templateId: 'non-existent-template',
      startDate: '2024-04-01'
    };
    
    const response = await makeRequest('POST', '/create-reading-schedule', invalidScheduleData, 404);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 not found, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
    
    if (!response.data.error.toLowerCase().includes('template')) {
      throw new Error('Error message should mention template');
    }
  })) {
    passedTests++;
  }
  
  // Test 5: Missing Required Fields
  totalTests++;
  if (await testEndpoint('Reject missing required fields', async () => {
    const incompleteData = {
      userId: TEST_USER_ID
      // Missing templateId and startDate
    };
    
    const response = await makeRequest('POST', '/create-reading-schedule', incompleteData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 6: Invalid Date Format
  totalTests++;
  if (await testEndpoint('Reject invalid date format', async () => {
    const invalidDateData = {
      ...testData.individualSchedule,
      startDate: 'invalid-date',
      userId: 'different-user' // Use different user to avoid conflict
    };
    
    const response = await makeRequest('POST', '/create-reading-schedule', invalidDateData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
    
    if (!response.data.error.toLowerCase().includes('date format')) {
      throw new Error('Error message should mention date format');
    }
  })) {
    passedTests++;
  }
  
  // Test 7: Create Schedule for Different User
  totalTests++;
  if (await testEndpoint('Create schedule for different user', async () => {
    // First create another user profile
    const anotherUserData = {
      ...testData.userProfile,
      uid: 'test-user-67890',
      email: 'test2@example.com',
      displayName: 'Test User 2'
    };
    
    await makeRequest('POST', '/user-profile', anotherUserData, 201);
    
    const scheduleData = {
      userId: 'test-user-67890',
      templateId: TEST_TEMPLATE_ID,
      startDate: '2024-05-01'
    };
    
    const response = await makeRequest('POST', '/create-reading-schedule', scheduleData, 201);
    
    validateResponse(response, ['message', 'schedule']);
    
    const schedule = response.data.schedule;
    if (schedule.userId !== 'test-user-67890') {
      throw new Error(`Expected userId test-user-67890, got ${schedule.userId}`);
    }
    
    // Cleanup
    await makeRequest('DELETE', '/user-profile/test-user-67890');
  })) {
    passedTests++;
  }
  
  // Test 8: Validate Schedule End Date Calculation
  totalTests++;
  if (await testEndpoint('Validate end date calculation', async () => {
    const testStartDate = '2024-06-01';
    const scheduleData = {
      userId: TEST_USER_ID,
      templateId: TEST_TEMPLATE_ID,
      startDate: testStartDate
    };
    
    const response = await makeRequest('POST', '/create-reading-schedule', scheduleData, 201);
    
    const schedule = response.data.schedule;
    const startDate = new Date(schedule.startDate);
    const endDate = new Date(schedule.endDate);
    const daysDifference = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    if (daysDifference !== schedule.durationDays) {
      throw new Error(`End date calculation incorrect. Expected ${schedule.durationDays} days, got ${daysDifference}`);
    }
  })) {
    passedTests++;
  }
  
  // Clean up test data
  await cleanupTestData();
  
  // Summary
  log(`\n📊 Individual Schedule Tests Summary:`, 'magenta');
  log(`   Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  
  return { passed: passedTests, total: totalTests, success: passedTests === totalTests };
}

// Run tests if called directly
if (require.main === module) {
  testIndividualScheduleEndpoints()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Test suite failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { testIndividualScheduleEndpoints };