const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { joinGroupReadingSchedule, leaveGroupReadingSchedule } = require('../../api/join-group-reading-schedule');
const {
  createTestGroup,
  createTestUser,
  createMockRequest,
  createMockResponse,
  createMockDocSnapshot,
  createMockQuerySnapshot,
  expectValidationError,
  expectSuccessResponse,
  expectErrorResponse
} = require('../helpers/testHelpers');

describe('Join Group Reading Schedule API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('joinGroupReadingSchedule', () => {
    const validJoinRequest = {
      userId: 'test-user-123',
      groupId: 'test-group-123',
      userName: 'Test User',
      email: 'test@example.com'
    };

    test('should join group successfully with valid data', async () => {
      req.body = validJoinRequest;

      const mockGroup = createTestGroup({
        groupId: 'test-group-123',
        status: 'active',
        isPublic: true,
        maxMembers: 50
      });

      const mockUser = createTestUser({
        uid: 'test-user-123',
        displayName: 'Test User',
        email: 'test@example.com'
      });

      // Mock database calls
      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true)) // Group exists
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true)) // User exists
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)) // Not already a member
        .mockResolvedValueOnce(createMockQuerySnapshot(Array.from({ length: 10 }, (_, i) => ({ 
          userId: `user-${i}`, 
          status: 'active' 
        })))); // Current members (10 active)

      global.mockDb.set.mockResolvedValue();

      await joinGroupReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: validJoinRequest.userId,
          groupId: validJoinRequest.groupId,
          userName: validJoinRequest.userName,
          email: validJoinRequest.email,
          role: 'member',
          status: 'active',
          joinedAt: expect.any(Object)
        })
      );

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('joined'),
          group: expect.objectContaining({
            groupId: 'test-group-123',
            memberRole: 'member'
          })
        })
      );
    });

    test('should return 400 for missing required fields', async () => {
      req.body = { userId: 'test-user-123' }; // Missing groupId, userName, email

      await joinGroupReadingSchedule(req, res);

      expectValidationError(res, 'groupId');
    });

    test('should return 404 for non-existent group', async () => {
      req.body = validJoinRequest;

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await joinGroupReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'Group reading schedule not found');
    });

    test('should return 404 for non-existent user', async () => {
      req.body = validJoinRequest;

      const mockGroup = createTestGroup({ groupId: 'test-group-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)); // User doesn't exist

      await joinGroupReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'User not found');
    });

    test('should return 400 for inactive group', async () => {
      req.body = validJoinRequest;

      const inactiveGroup = createTestGroup({
        groupId: 'test-group-123',
        status: 'completed'
      });

      const mockUser = createTestUser({ uid: 'test-user-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(inactiveGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true));

      await joinGroupReadingSchedule(req, res);

      expectErrorResponse(res, 400, 'not active');
    });

    test('should return 400 for private group', async () => {
      req.body = validJoinRequest;

      const privateGroup = createTestGroup({
        groupId: 'test-group-123',
        status: 'active',
        isPublic: false
      });

      const mockUser = createTestUser({ uid: 'test-user-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(privateGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true));

      await joinGroupReadingSchedule(req, res);

      expectErrorResponse(res, 400, 'not public');
    });

    test('should return 400 for full group', async () => {
      req.body = validJoinRequest;

      const fullGroup = createTestGroup({
        groupId: 'test-group-123',
        status: 'active',
        isPublic: true,
        maxMembers: 2
      });

      const mockUser = createTestUser({ uid: 'test-user-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(fullGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)) // Not already a member
        .mockResolvedValueOnce(createMockQuerySnapshot([
          { userId: 'user-1', status: 'active' },
          { userId: 'user-2', status: 'active' }
        ])); // Group is full

      await joinGroupReadingSchedule(req, res);

      expectErrorResponse(res, 400, 'full');
    });

    test('should return 409 for existing active membership', async () => {
      req.body = validJoinRequest;

      const mockGroup = createTestGroup({ groupId: 'test-group-123' });
      const mockUser = createTestUser({ uid: 'test-user-123' });
      const existingMembership = {
        userId: 'test-user-123',
        status: 'active'
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(existingMembership, true)); // Already a member

      await joinGroupReadingSchedule(req, res);

      expectErrorResponse(res, 409, 'already a member');
    });

    test('should allow rejoining after leaving', async () => {
      req.body = validJoinRequest;

      const mockGroup = createTestGroup({ groupId: 'test-group-123' });
      const mockUser = createTestUser({ uid: 'test-user-123' });
      const leftMembership = {
        userId: 'test-user-123',
        status: 'left'
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(leftMembership, true)) // Previously left
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // No active members

      global.mockDb.update.mockResolvedValue();

      await joinGroupReadingSchedule(req, res);

      expect(global.mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'active',
          rejoinedAt: expect.any(Object)
        })
      );

      expectSuccessResponse(res, 200);
    });

    test('should handle unlimited membership groups', async () => {
      req.body = validJoinRequest;

      const unlimitedGroup = createTestGroup({
        groupId: 'test-group-123',
        maxMembers: null // No limit
      });

      const mockUser = createTestUser({ uid: 'test-user-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(unlimitedGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce(createMockQuerySnapshot(Array.from({ length: 100 }, () => ({ status: 'active' }))));

      global.mockDb.set.mockResolvedValue();

      await joinGroupReadingSchedule(req, res);

      expectSuccessResponse(res, 200);
    });
  });

  describe('leaveGroupReadingSchedule', () => {
    const validLeaveRequest = {
      userId: 'test-user-123',
      groupId: 'test-group-123'
    };

    test('should leave group successfully', async () => {
      req.body = validLeaveRequest;

      const mockGroup = createTestGroup({ groupId: 'test-group-123' });
      const activeMembership = {
        userId: 'test-user-123',
        groupId: 'test-group-123',
        status: 'active',
        role: 'member'
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(activeMembership, true));

      global.mockDb.update.mockResolvedValue();

      await leaveGroupReadingSchedule(req, res);

      expect(global.mockDb.update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'left',
          leftAt: expect.any(Object)
        })
      );

      expectSuccessResponse(res, 200);
    });

    test('should return 400 for missing required fields', async () => {
      req.body = { userId: 'test-user-123' }; // Missing groupId

      await leaveGroupReadingSchedule(req, res);

      expectValidationError(res, 'groupId');
    });

    test('should return 404 for non-existent group', async () => {
      req.body = validLeaveRequest;

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await leaveGroupReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'Group reading schedule not found');
    });

    test('should return 404 for non-member user', async () => {
      req.body = validLeaveRequest;

      const mockGroup = createTestGroup({ groupId: 'test-group-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)); // Not a member

      await leaveGroupReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'not a member');
    });

    test('should return 400 for admin trying to leave (if sole admin)', async () => {
      req.body = validLeaveRequest;

      const mockGroup = createTestGroup({ 
        groupId: 'test-group-123',
        createdBy: 'test-user-123' // User is the creator
      });

      const adminMembership = {
        userId: 'test-user-123',
        groupId: 'test-group-123',
        status: 'active',
        role: 'admin'
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(adminMembership, true));

      await leaveGroupReadingSchedule(req, res);

      expectErrorResponse(res, 400, 'admin cannot leave');
    });

    test('should return 400 for already left member', async () => {
      req.body = validLeaveRequest;

      const mockGroup = createTestGroup({ groupId: 'test-group-123' });
      const leftMembership = {
        userId: 'test-user-123',
        groupId: 'test-group-123',
        status: 'left',
        role: 'member'
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(leftMembership, true));

      await leaveGroupReadingSchedule(req, res);

      expectErrorResponse(res, 400, 'not an active member');
    });

    test('should handle database errors gracefully', async () => {
      req.body = validLeaveRequest;

      global.mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      await leaveGroupReadingSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Database connection failed')
        })
      );
    });
  });
});