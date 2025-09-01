// Jest globals are available automatically

// Test data factories
const createTestUser = (overrides = {}) => ({
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  createdAt: { seconds: 1640995200, nanoseconds: 0 },
  ...overrides
});

const createTestSchedule = (overrides = {}) => ({
  scheduleId: 'test-schedule-123',
  userId: 'test-user-123',
  templateId: 'bellevueYPNT',
  templateName: 'Test Template',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  durationDays: 365,
  status: 'active',
  completionTasks: {
    verseText: true,
    footnotes: false,
    partner: true
  },
  createdAt: { seconds: 1640995200, nanoseconds: 0 },
  ...overrides
});

const createTestGroup = (overrides = {}) => ({
  groupId: 'test-group-123',
  groupName: 'Test Group',
  templateId: 'bellevueYPNT',
  templateName: 'Test Template',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  durationDays: 365,
  status: 'active',
  createdBy: 'test-admin-123',
  isPublic: true,
  maxMembers: 50,
  completionTasks: {
    verseText: true,
    footnotes: true,
    partner: true
  },
  createdAt: { seconds: 1640995200, nanoseconds: 0 },
  ...overrides
});

const createTestProgress = (overrides = {}) => ({
  dayNumber: 1,
  completionTasks: {
    verseText: true,
    footnotes: false,
    partner: false
  },
  overallCompleted: false,
  completedAt: { seconds: 1640995200, nanoseconds: 0 },
  updatedAt: { seconds: 1640995200, nanoseconds: 0 },
  ...overrides
});

const createMockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

const createMockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock Firebase Firestore responses
const createMockDocSnapshot = (data, exists = true) => ({
  exists,
  id: 'mock-doc-id',
  data: jest.fn(() => data)
});

const createMockQuerySnapshot = (docs = []) => ({
  empty: docs.length === 0,
  size: docs.length,
  docs: docs.map(doc => createMockDocSnapshot(doc)),
  forEach: jest.fn(callback => {
    docs.forEach((doc, index) => callback(createMockDocSnapshot(doc), index));
  })
});

// Validation helpers
const expectValidationError = (response, expectedMessage) => {
  expect(response.status).toHaveBeenCalledWith(400);
  expect(response.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expect.stringContaining(expectedMessage)
    })
  );
};

const expectSuccessResponse = (response, expectedStatus = 200) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  expect(response.json).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.any(String)
    })
  );
};

const expectErrorResponse = (response, expectedStatus, expectedError) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  expect(response.json).toHaveBeenCalledWith(
    expect.objectContaining({
      error: expectedError
    })
  );
};

// Database mock helpers
const mockDbSuccess = (returnValue = {}) => {
  if (Array.isArray(returnValue)) {
    // Collection query - return multiple docs
    global.setMockQuerySnapshot({
      empty: returnValue.length === 0,
      size: returnValue.length,
      docs: returnValue.map(doc => ({
        id: doc.id || 'mock-doc-id',
        exists: true,
        data: jest.fn(() => doc)
      }))
    });
  } else {
    // Single document query
    global.setMockDocSnapshot({
      exists: true,
      id: returnValue.id || 'mock-doc-id',
      data: jest.fn(() => returnValue)
    });
  }
};

const mockDbError = (error) => {
  global.mockDb.get.mockRejectedValueOnce(error);
  global.mockDb.set.mockRejectedValueOnce(error);
  global.mockDb.update.mockRejectedValueOnce(error);
  global.mockDb.delete.mockRejectedValueOnce(error);
};

const mockDbEmpty = () => {
  global.setMockQuerySnapshot({
    empty: true,
    size: 0,
    docs: []
  });
};

const mockDocNotFound = () => {
  global.setMockDocSnapshot({
    exists: false,
    id: null,
    data: jest.fn(() => null)
  });
};

module.exports = {
  createTestUser,
  createTestSchedule,
  createTestGroup,
  createTestProgress,
  createMockRequest,
  createMockResponse,
  createMockDocSnapshot,
  createMockQuerySnapshot,
  expectValidationError,
  expectSuccessResponse,
  expectErrorResponse,
  mockDbSuccess,
  mockDbError,
  mockDbEmpty,
  mockDocNotFound
};