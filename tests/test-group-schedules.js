const {
  log,
  makeRequest,
  testEndpoint,
  generateTestData,
  cleanupTestData,
  validateResponse,
  validateResponseStructure,
  TEST_USER_ID,
  TEST_GROUP_ID,
  TEST_TEMPLATE_ID
} = require('./test-helpers');

async function testGroupScheduleEndpoints() {
  log('🧪 Testing Group Schedule Endpoints...', 'blue');
  
  const testData = generateTestData();
  let passedTests = 0;
  let totalTests = 0;
  
  // Clean up any existing test data first
  await cleanupTestData();
  
  // Create test user profile first (required for group schedules)
  await makeRequest('POST', '/user-profile', testData.userProfile, 201);
  
  let groupId = null;
  
  // Test 1: Create Group Reading Schedule
  totalTests++;
  if (await testEndpoint('Create group reading schedule', async () => {
    const response = await makeRequest('POST', '/create-group-reading-schedule', testData.groupSchedule, 201);
    
    validateResponseStructure(response, {
      message: 'string',
      group: {
        groupId: 'string',
        groupName: 'string',
        templateId: 'string',
        templateName: 'string',
        startDate: 'string',
        endDate: 'string',
        durationDays: 'number',
        totalDailyReadings: 'number',
        status: 'string',
        createdBy: 'string',
        isPublic: 'boolean',
        maxMembers: 'number',
        memberCount: 'number'
      }
    });
    
    const group = response.data.group;
    groupId = group.groupId;
    
    if (group.groupId !== TEST_GROUP_ID) {
      throw new Error(`Expected groupId ${TEST_GROUP_ID}, got ${group.groupId}`);
    }
    
    if (group.createdBy !== TEST_USER_ID) {
      throw new Error(`Expected createdBy ${TEST_USER_ID}, got ${group.createdBy}`);
    }
    
    if (group.templateId !== TEST_TEMPLATE_ID) {
      throw new Error(`Expected templateId ${TEST_TEMPLATE_ID}, got ${group.templateId}`);
    }
    
    if (group.memberCount !== 1) {
      throw new Error(`Expected initial memberCount 1, got ${group.memberCount}`);
    }
    
    if (group.status !== 'active') {
      throw new Error(`Expected status 'active', got ${group.status}`);
    }
  })) {
    passedTests++;
  }
  
  // Test 2: Create Duplicate Group (should fail)
  totalTests++;
  if (await testEndpoint('Prevent duplicate group creation', async () => {
    const response = await makeRequest('POST', '/create-group-reading-schedule', testData.groupSchedule, 409);
    
    if (response.status !== 409) {
      throw new Error(`Expected 409 conflict, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 3: Join Group Schedule (different user)
  totalTests++;
  if (await testEndpoint('Join group reading schedule', async () => {
    // Create another user first
    const user2Data = {
      uid: 'test-user-67890',
      email: 'test2@example.com',
      displayName: 'Test User 2'
    };
    
    await makeRequest('POST', '/user-profile', user2Data, 201);
    
    const joinData = {
      userId: 'test-user-67890',
      groupId: TEST_GROUP_ID,
      userName: 'Test User 2',
      email: 'test2@example.com'
    };
    
    const response = await makeRequest('POST', '/join-group-reading-schedule', joinData, 200);
    
    validateResponseStructure(response, {
      message: 'string',
      group: {
        groupId: 'string',
        groupName: 'string',
        templateName: 'string',
        startDate: 'string',
        endDate: 'string',
        durationDays: 'number',
        currentDay: 'number',
        memberRole: 'string',
        totalMembers: 'number'
      }
    });
    
    const group = response.data.group;
    
    if (group.memberRole !== 'member') {
      throw new Error(`Expected memberRole 'member', got ${group.memberRole}`);
    }
    
    if (group.totalMembers !== 2) {
      throw new Error(`Expected totalMembers 2, got ${group.totalMembers}`);
    }
  })) {
    passedTests++;
  }
  
  // Test 4: Join Non-Existent Group
  totalTests++;
  if (await testEndpoint('Handle non-existent group join', async () => {
    const joinData = {
      userId: TEST_USER_ID,
      groupId: 'non-existent-group-999'
    };
    
    const response = await makeRequest('POST', '/join-group-reading-schedule', joinData, 404);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 not found, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 5: Join Group Twice (should fail)
  totalTests++;
  if (await testEndpoint('Prevent duplicate group membership', async () => {
    const joinData = {
      userId: 'test-user-67890',
      groupId: TEST_GROUP_ID
    };
    
    const response = await makeRequest('POST', '/join-group-reading-schedule', joinData, 409);
    
    if (response.status !== 409) {
      throw new Error(`Expected 409 conflict, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 6: Leave Group Schedule
  totalTests++;
  if (await testEndpoint('Leave group reading schedule', async () => {
    const leaveData = {
      userId: 'test-user-67890',
      groupId: TEST_GROUP_ID
    };
    
    const response = await makeRequest('POST', '/leave-group-reading-schedule', leaveData, 200);
    
    validateResponse(response, ['message']);
  })) {
    passedTests++;
  }
  
  // Test 7: Leave Non-Existent Group
  totalTests++;
  if (await testEndpoint('Handle leaving non-existent group', async () => {
    const leaveData = {
      userId: TEST_USER_ID,
      groupId: 'non-existent-group-999'
    };
    
    // Should return 404 since user cannot be a member of non-existent group
    const response = await makeRequest('POST', '/leave-group-reading-schedule', leaveData, 404);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 not found, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 8: Leave Group When Not a Member
  totalTests++;
  if (await testEndpoint('Handle leaving group when not a member', async () => {
    // Create another user who is not a member
    const user3Data = {
      uid: 'test-user-11111',
      email: 'test3@example.com',
      displayName: 'Test User 3'
    };
    
    await makeRequest('POST', '/user-profile', user3Data, 201);
    
    const leaveData = {
      userId: 'test-user-11111',
      groupId: TEST_GROUP_ID
    };
    
    const response = await makeRequest('POST', '/leave-group-reading-schedule', leaveData, 404);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 not found, got ${response.status}`);
    }
    
    // Cleanup
    await makeRequest('DELETE', '/user-profile/test-user-11111');
  })) {
    passedTests++;
  }
  
  // Test 9: Admin Cannot Leave If Only Admin
  totalTests++;
  if (await testEndpoint('Prevent only admin from leaving group', async () => {
    const leaveData = {
      userId: TEST_USER_ID, // This is the admin/creator
      groupId: TEST_GROUP_ID
    };
    
    const response = await makeRequest('POST', '/leave-group-reading-schedule', leaveData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
    
    if (!response.data.error.toLowerCase().includes('admin')) {
      throw new Error('Error message should mention admin restriction');
    }
  })) {
    passedTests++;
  }
  
  // Test 10: Create Group with Custom ID
  totalTests++;
  if (await testEndpoint('Create group with custom ID', async () => {
    const customGroupData = {
      ...testData.groupSchedule,
      groupName: 'Custom ID Group',
      customGroupId: 'my-custom-group-id'
    };
    
    const response = await makeRequest('POST', '/create-group-reading-schedule', customGroupData, 201);
    
    const group = response.data.group;
    if (group.groupId !== 'my-custom-group-id') {
      throw new Error(`Expected custom groupId, got ${group.groupId}`);
    }
  })) {
    passedTests++;
  }
  
  // Test 11: Create Group with Non-Existent Template
  totalTests++;
  if (await testEndpoint('Handle non-existent template for group', async () => {
    const invalidGroupData = {
      ...testData.groupSchedule,
      groupName: 'Invalid Template Group',
      templateId: 'non-existent-template',
      customGroupId: 'invalid-template-group'
    };
    
    const response = await makeRequest('POST', '/create-group-reading-schedule', invalidGroupData, 404);
    
    if (response.status !== 404) {
      throw new Error(`Expected 404 not found, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 12: Missing Required Fields for Group Creation
  totalTests++;
  if (await testEndpoint('Reject missing required fields for group creation', async () => {
    const incompleteData = {
      groupName: 'Incomplete Group'
      // Missing templateId, startDate, createdBy
    };
    
    const response = await makeRequest('POST', '/create-group-reading-schedule', incompleteData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Test 13: Invalid Date Format for Group
  totalTests++;
  if (await testEndpoint('Reject invalid date format for group', async () => {
    const invalidDateData = {
      ...testData.groupSchedule,
      groupName: 'Invalid Date Group',
      startDate: 'invalid-date-format',
      customGroupId: 'invalid-date-group'
    };
    
    const response = await makeRequest('POST', '/create-group-reading-schedule', invalidDateData, 400);
    
    if (response.status !== 400) {
      throw new Error(`Expected 400 bad request, got ${response.status}`);
    }
    
    validateResponse(response, ['error']);
  })) {
    passedTests++;
  }
  
  // Clean up test data
  await cleanupTestData();
  await makeRequest('DELETE', '/user-profile/test-user-67890').catch(() => {});
  
  // Summary
  log(`\n📊 Group Schedule Tests Summary:`, 'magenta');
  log(`   Passed: ${passedTests}/${totalTests}`, passedTests === totalTests ? 'green' : 'red');
  
  return { passed: passedTests, total: totalTests, success: passedTests === totalTests };
}

// Run tests if called directly
if (require.main === module) {
  testGroupScheduleEndpoints()
    .then(results => {
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      log(`❌ Test suite failed: ${error.message}`, 'red');
      process.exit(1);
    });
}

module.exports = { testGroupScheduleEndpoints };