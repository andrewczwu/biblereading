const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { markReadingCompleted } = require('../../api/mark-reading-completed');
const {
  createTestUser,
  createTestSchedule,
  createTestGroup,
  createTestProgress,
  createMockRequest,
  createMockResponse,
  createMockDocSnapshot,
  expectValidationError,
  expectSuccessResponse,
  expectErrorResponse
} = require('../helpers/testHelpers');

describe('Mark Reading Completed API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('markReadingCompleted', () => {
    const validIndividualRequest = {
      userId: 'test-user-123',
      scheduleId: 'schedule-123',
      dayNumber: 5,
      completionTasks: {
        verseText: true,
        footnotes: false,
        partner: true
      },
      scheduleType: 'individual'
    };

    const validGroupRequest = {
      userId: 'test-user-123',
      groupId: 'group-123',
      dayNumber: 5,
      completionTasks: {
        verseText: true,
        footnotes: true,
        partner: false
      },
      scheduleType: 'group'
    };

    test('should mark individual reading as completed with multiple tasks', async () => {
      req.body = validIndividualRequest;

      const mockSchedule = createTestSchedule({
        scheduleId: 'schedule-123',
        userId: 'test-user-123'
      });

      const mockDayReading = {
        dayNumber: 5,
        portions: [{
          bookName: 'Matthew',
          startChapter: 5,
          startVerse: 1,
          endChapter: 5,
          endVerse: 48
        }]
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockSchedule, true)) // Schedule exists
        .mockResolvedValueOnce(createMockDocSnapshot(mockDayReading, true)); // Day exists

      global.mockDb.set.mockResolvedValue();

      await markReadingCompleted(req, res);

      expect(global.mockDb.collection).toHaveBeenCalledWith('userReadingSchedules');
      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          dayNumber: 5,
          completionTasks: {
            verseText: true,
            footnotes: false,
            partner: true
          },
          pointsEarned: 2, // verseText + partner = 2 points
          overallCompleted: false, // Not all tasks completed
          completedAt: expect.any(Object),
          updatedAt: expect.any(Object)
        })
      );

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('day 5'),
          progress: expect.objectContaining({
            pointsEarned: 2,
            overallCompleted: false
          })
        })
      );
    });

    test('should mark group reading as completed', async () => {
      req.body = validGroupRequest;

      const mockGroup = createTestGroup({
        groupId: 'group-123'
      });

      const mockMembership = {
        userId: 'test-user-123',
        groupId: 'group-123',
        status: 'active',
        role: 'member'
      };

      const mockDayReading = {
        dayNumber: 5,
        portions: [{
          bookName: 'Matthew',
          startChapter: 5,
          startVerse: 1,
          endChapter: 5,
          endVerse: 48
        }]
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true)) // Group exists
        .mockResolvedValueOnce(createMockDocSnapshot(mockMembership, true)) // Membership exists
        .mockResolvedValueOnce(createMockDocSnapshot(mockDayReading, true)); // Day exists

      global.mockDb.set.mockResolvedValue();

      await markReadingCompleted(req, res);

      expect(global.mockDb.collection).toHaveBeenCalledWith('groupReadingSchedules');
      expectSuccessResponse(res, 200);
    });

    test('should calculate points correctly for all completion tasks', async () => {
      req.body = {
        ...validIndividualRequest,
        completionTasks: {
          verseText: true,
          footnotes: true,
          partner: true
        }
      };

      const mockSchedule = createTestSchedule();
      const mockDayReading = { dayNumber: 5, portions: [] };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockSchedule, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockDayReading, true));

      global.mockDb.set.mockResolvedValue();

      await markReadingCompleted(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          pointsEarned: 3, // All three tasks = 3 points
          overallCompleted: true // All tasks completed
        })
      );
    });

    test('should return 400 for missing required fields', async () => {
      req.body = { userId: 'test-user-123' }; // Missing other required fields

      await markReadingCompleted(req, res);

      expectValidationError(res, 'dayNumber');
    });

    test('should return 400 for invalid dayNumber', async () => {
      req.body = {
        ...validIndividualRequest,
        dayNumber: 0 // Invalid day number
      };

      await markReadingCompleted(req, res);

      expectValidationError(res, 'dayNumber');
    });

    test('should return 400 for invalid scheduleType', async () => {
      req.body = {
        ...validIndividualRequest,
        scheduleType: 'invalid-type'
      };

      await markReadingCompleted(req, res);

      expectValidationError(res, 'scheduleType');
    });

    test('should return 404 for non-existent individual schedule', async () => {
      req.body = validIndividualRequest;

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await markReadingCompleted(req, res);

      expectErrorResponse(res, 404, 'Reading schedule not found');
    });

    test('should return 404 for non-existent group', async () => {
      req.body = validGroupRequest;

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await markReadingCompleted(req, res);

      expectErrorResponse(res, 404, 'Group reading schedule not found');
    });

    test('should return 403 for unauthorized group access', async () => {
      req.body = validGroupRequest;

      const mockGroup = createTestGroup({ groupId: 'group-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)); // No membership

      await markReadingCompleted(req, res);

      expectErrorResponse(res, 403, 'not a member');
    });

    test('should return 404 for non-existent day reading', async () => {
      req.body = {
        ...validIndividualRequest,
        dayNumber: 999 // Non-existent day
      };

      const mockSchedule = createTestSchedule();

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockSchedule, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)); // Day doesn't exist

      await markReadingCompleted(req, res);

      expectErrorResponse(res, 404, 'Day 999 not found');
    });

    test('should handle inactive group membership', async () => {
      req.body = validGroupRequest;

      const mockGroup = createTestGroup({ groupId: 'group-123' });
      const inactiveMembership = {
        userId: 'test-user-123',
        groupId: 'group-123',
        status: 'left', // Inactive membership
        role: 'member'
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup, true))
        .mockResolvedValueOnce(createMockDocSnapshot(inactiveMembership, true));

      await markReadingCompleted(req, res);

      expectErrorResponse(res, 403, 'not an active member');
    });

    test('should update existing progress entry', async () => {
      req.body = validIndividualRequest;

      const mockSchedule = createTestSchedule();
      const mockDayReading = { dayNumber: 5, portions: [] };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockSchedule, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockDayReading, true));

      global.mockDb.set.mockResolvedValue();

      await markReadingCompleted(req, res);

      // Should set (upsert) the progress document
      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          dayNumber: 5,
          completionTasks: validIndividualRequest.completionTasks,
          updatedAt: expect.any(Object)
        })
      );
    });

    test('should handle database errors gracefully', async () => {
      req.body = validIndividualRequest;

      global.mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      await markReadingCompleted(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Database connection failed')
        })
      );
    });

    test('should validate completion tasks structure', async () => {
      req.body = {
        ...validIndividualRequest,
        completionTasks: {
          verseText: 'invalid', // Should be boolean
          footnotes: false,
          partner: true
        }
      };

      await markReadingCompleted(req, res);

      expectValidationError(res, 'completionTasks');
    });

    test('should require either scheduleId or groupId based on type', async () => {
      req.body = {
        userId: 'test-user-123',
        dayNumber: 5,
        completionTasks: { verseText: true, footnotes: false, partner: false },
        scheduleType: 'individual'
        // Missing scheduleId
      };

      await markReadingCompleted(req, res);

      expectValidationError(res, 'scheduleId');
    });
  });
});