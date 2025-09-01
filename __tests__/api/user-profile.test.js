const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { createUserProfile, getUserProfile, updateUserProfile, deleteUserProfile } = require('../../api/user-profile');
const {
  createTestUser,
  createMockRequest,
  createMockResponse,
  createMockQuerySnapshot,
  createMockDocSnapshot,
  expectValidationError,
  expectSuccessResponse,
  expectErrorResponse,
  mockDbSuccess,
  mockDbError,
  mockDbEmpty
} = require('../helpers/testHelpers');

describe('User Profile API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('createUserProfile', () => {
    test('should create user profile with valid data', async () => {
      const testUser = createTestUser();
      req.body = testUser;

      // Mock that user doesn't exist
      global.mockDb.get.mockResolvedValueOnce({ empty: true });
      // Mock successful creation
      global.mockDb.set.mockResolvedValueOnce();

      await createUserProfile(req, res);

      expect(global.mockDb.collection).toHaveBeenCalledWith('userProfiles');
      expect(global.mockDb.doc).toHaveBeenCalledWith(testUser.uid);
      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: testUser.uid,
          email: testUser.email,
          displayName: testUser.displayName,
          isActive: true
        })
      );
      expectSuccessResponse(res, 201);
    });

    test('should return 400 for missing required fields', async () => {
      req.body = { email: 'test@example.com' }; // Missing uid and displayName

      await createUserProfile(req, res);

      expectValidationError(res, 'uid');
    });

    test('should return 400 for invalid email format', async () => {
      req.body = {
        uid: 'test-user-123',
        email: 'invalid-email',
        displayName: 'Test User'
      };

      await createUserProfile(req, res);

      expectValidationError(res, 'email');
    });

    test('should return 409 if user already exists', async () => {
      const testUser = createTestUser();
      req.body = testUser;

      // Mock that document exists (single document query, not collection)
      global.mockDb.get.mockResolvedValueOnce({
        exists: true,
        data: () => testUser
      });

      await createUserProfile(req, res);

      expectErrorResponse(res, 409, 'User profile already exists');
    });

    test('should handle database errors gracefully', async () => {
      req.body = createTestUser();

      mockDbError(new Error('Database connection failed'));

      await createUserProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
          message: 'Database connection failed'
        })
      );
    });

    test('should validate date format for dateOfBirth', async () => {
      req.body = {
        ...createTestUser(),
        dateOfBirth: 'invalid-date'
      };

      await createUserProfile(req, res);

      expectValidationError(res, 'date');
    });

    test('should set default values for optional fields', async () => {
      const minimalUser = {
        uid: 'test-user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        firstName: 'Test'
      };
      req.body = minimalUser;

      global.mockDb.get.mockResolvedValueOnce({ empty: true });
      global.mockDb.set.mockResolvedValueOnce();

      await createUserProfile(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: true,
          emailVerified: false
        })
      );
    });
  });

  describe('getUserProfile', () => {
    test('should return user profile for valid uid', async () => {
      const testUser = createTestUser();
      req.params = { uid: testUser.uid };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(testUser, true)
      );

      await getUserProfile(req, res);

      expect(global.mockDb.collection).toHaveBeenCalledWith('userProfiles');
      expect(global.mockDb.doc).toHaveBeenCalledWith(testUser.uid);
      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: expect.objectContaining({
            uid: testUser.uid,
            email: testUser.email
          })
        })
      );
    });

    test('should return 400 for missing uid parameter', async () => {
      req.params = {};

      await getUserProfile(req, res);

      expectValidationError(res, 'uid');
    });

    test('should return 404 for non-existent user', async () => {
      req.params = { uid: 'non-existent-user' };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(null, false)
      );

      await getUserProfile(req, res);

      expectErrorResponse(res, 404, 'User profile not found');
    });

    test('should return 200 for inactive user (current API behavior)', async () => {
      const inactiveUser = createTestUser({ isActive: false });
      req.params = { uid: inactiveUser.uid };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(inactiveUser, true)
      );

      await getUserProfile(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: expect.objectContaining({
            uid: inactiveUser.uid,
            isActive: false
          })
        })
      );
    });
  });

  describe('updateUserProfile', () => {
    test('should update user profile with valid data', async () => {
      const testUser = createTestUser();
      req.params = { uid: testUser.uid };
      req.body = {
        displayName: 'Updated Name',
        firstName: 'Updated'
      };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(testUser, true)
      );
      global.mockDb.update.mockResolvedValueOnce();
      // Mock second get() call after update
      const updatedUser = { ...testUser, ...req.body };
      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(updatedUser, true)
      );

      await updateUserProfile(req, res);

      expect(global.mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Updated Name',
          firstName: 'Updated',
          updatedAt: expect.any(String)
        })
      );
      expectSuccessResponse(res, 200);
    });

    test('should return 400 for missing uid parameter', async () => {
      req.params = {};
      req.body = { displayName: 'Updated Name' };

      await updateUserProfile(req, res);

      expectValidationError(res, 'uid');
    });

    test('should return 404 for non-existent user', async () => {
      req.params = { uid: 'non-existent-user' };
      req.body = { displayName: 'Updated Name' };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(null, false)
      );

      await updateUserProfile(req, res);

      expectErrorResponse(res, 404, 'User profile not found');
    });

    test('should not allow updating uid or email', async () => {
      const testUser = createTestUser();
      req.params = { uid: testUser.uid };
      req.body = {
        uid: 'new-uid',
        email: 'new-email@example.com',
        displayName: 'Updated Name'
      };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(testUser, true)
      );
      global.mockDb.update.mockResolvedValueOnce();

      await updateUserProfile(req, res);

      expect(global.mockDb.update).toHaveBeenCalledWith(
        expect.not.objectContaining({
          uid: 'new-uid',
          email: 'new-email@example.com'
        })
      );
    });
  });

  describe('deleteUserProfile', () => {
    test('should soft delete user profile', async () => {
      const testUser = createTestUser();
      req.params = { uid: testUser.uid };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(testUser, true)
      );
      global.mockDb.update.mockResolvedValueOnce();

      await deleteUserProfile(req, res);

      expect(global.mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          deletedAt: expect.any(String),
          updatedAt: expect.any(String)
        })
      );
      expectSuccessResponse(res, 200);
    });

    test('should return 400 for missing uid parameter', async () => {
      req.params = {};

      await deleteUserProfile(req, res);

      expectValidationError(res, 'uid');
    });

    test('should return 404 for non-existent user', async () => {
      req.params = { uid: 'non-existent-user' };

      global.mockDb.get.mockResolvedValueOnce(
        createMockDocSnapshot(null, false)
      );

      await deleteUserProfile(req, res);

      expectErrorResponse(res, 404, 'User profile not found');
    });
  });
});