// Test setup file
// Jest globals are available automatically in setup files

// Create configurable mock responses
let mockQuerySnapshotData = {
  empty: false,
  size: 1,
  docs: [
    {
      id: 'mock-doc-id',
      exists: true,
      data: jest.fn(() => ({
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User'
      }))
    }
  ]
};

let mockDocSnapshotData = {
  exists: true,
  id: 'mock-doc-id',
  data: jest.fn(() => ({
    uid: 'test-user-123',
    email: 'test@example.com',
    displayName: 'Test User'
  }))
};

// Mock Firebase Admin SDK with configurable responses
const mockDb = {
  collection: jest.fn(() => mockDb),
  doc: jest.fn(() => mockDb),
  get: jest.fn(() => {
    // Return mockDocSnapshotData for single document queries
    if (mockDb.doc.mock.calls.length > mockDb.collection.mock.calls.length) {
      return Promise.resolve(mockDocSnapshotData);
    }
    // Return mockQuerySnapshotData for collection queries
    return Promise.resolve({
      ...mockQuerySnapshotData,
      forEach: jest.fn(callback => {
        mockQuerySnapshotData.docs.forEach(callback);
      })
    });
  }),
  set: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
  delete: jest.fn(() => Promise.resolve()),
  where: jest.fn(() => mockDb),
  orderBy: jest.fn(() => mockDb),
  limit: jest.fn(() => mockDb),
  add: jest.fn(() => Promise.resolve({ id: 'mock-doc-id' })),
  batch: jest.fn(() => mockBatch)
};

const mockBatch = {
  set: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  commit: jest.fn(() => Promise.resolve())
};

const mockQuerySnapshot = {
  get empty() { return mockQuerySnapshotData.empty; },
  get size() { return mockQuerySnapshotData.size; },
  get docs() { return mockQuerySnapshotData.docs; },
  forEach: jest.fn(callback => {
    mockQuerySnapshotData.docs.forEach(callback);
  })
};

const mockDocSnapshot = {
  get exists() { return mockDocSnapshotData.exists; },
  get id() { return mockDocSnapshotData.id; },
  data: jest.fn(() => mockDocSnapshotData.data())
};

jest.mock('firebase-admin', () => ({
  initializeApp: jest.fn(),
  apps: [],
  credential: {
    cert: jest.fn()
  },
  firestore: jest.fn(() => mockDb),
  Timestamp: {
    now: jest.fn(() => ({ seconds: 1640995200, nanoseconds: 0 })),
    fromDate: jest.fn(date => ({ seconds: Math.floor(date.getTime() / 1000), nanoseconds: 0 }))
  }
}));

// Mock environment variables
process.env.FIREBASE_PROJECT_ID = 'test-project';
process.env.FIREBASE_PRIVATE_KEY = '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----';
process.env.FIREBASE_CLIENT_EMAIL = 'test@test-project.iam.gserviceaccount.com';

// Helper functions for test configuration
global.setMockQuerySnapshot = (data) => {
  mockQuerySnapshotData = data;
};

global.setMockDocSnapshot = (data) => {
  mockDocSnapshotData = data;
};

global.resetMockData = () => {
  mockQuerySnapshotData = {
    empty: false,
    size: 1,
    docs: [
      {
        id: 'mock-doc-id',
        exists: true,
        data: jest.fn(() => ({
          uid: 'test-user-123',
          email: 'test@example.com',
          displayName: 'Test User'
        }))
      }
    ]
  };
  
  mockDocSnapshotData = {
    exists: true,
    id: 'mock-doc-id',
    data: jest.fn(() => ({
      uid: 'test-user-123',
      email: 'test@example.com',
      displayName: 'Test User'
    }))
  };
};

// Export mocks for use in tests
global.mockDb = mockDb;
global.mockQuerySnapshot = mockQuerySnapshot;
global.mockDocSnapshot = mockDocSnapshot;
global.mockBatch = mockBatch;

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  global.resetMockData();
  mockDb.collection.mockReturnValue(mockDb);
  mockDb.doc.mockReturnValue(mockDb);
});