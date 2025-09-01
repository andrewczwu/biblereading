const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { getUserSchedules } = require('../../api/get-user-schedules');
const {
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
  expectErrorResponse
} = require('../helpers/testHelpers');

describe('Get User Schedules API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('getUserSchedules', () => {
    test('should return user schedules with progress and points', async () => {
      const userId = 'test-user-123';
      req.params = { userId };

      const mockIndividualSchedule = createTestSchedule({
        scheduleId: 'individual-123',
        userId
      });

      const mockGroupMembership = {
        userId,
        groupId: 'group-123',
        role: 'member',
        status: 'active',
        joinedAt: { seconds: 1640995200 }
      };

      const mockGroup = createTestGroup({
        groupId: 'group-123',
        groupName: 'Test Reading Group'
      });

      const mockProgress = [
        createTestProgress({ dayNumber: 1, completionTasks: { verseText: true, footnotes: false, partner: true } }),
        createTestProgress({ dayNumber: 2, completionTasks: { verseText: true, footnotes: true, partner: false } }),
        createTestProgress({ dayNumber: 3, completionTasks: { verseText: false, footnotes: false, partner: true } })
      ];

      // Mock database calls in sequence
      global.mockDb.get
        // Individual schedules query
        .mockResolvedValueOnce(createMockQuerySnapshot([mockIndividualSchedule]))
        // Individual schedule progress query
        .mockResolvedValueOnce(createMockQuerySnapshot(mockProgress))
        // Group memberships query
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroupMembership]))
        // Group details query
        .mockResolvedValueOnce(createMockDocSnapshot(mockGroup))
        // Group progress query
        .mockResolvedValueOnce(createMockQuerySnapshot(mockProgress));

      await getUserSchedules(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User schedules retrieved successfully',
          individualSchedules: expect.arrayContaining([
            expect.objectContaining({
              scheduleId: 'individual-123',
              progress: expect.objectContaining({
                totalReadings: expect.any(Number),
                completedReadings: expect.any(Number),
                pointsEarned: expect.any(Number),
                completionPercentage: expect.any(Number)
              })
            })
          ]),
          groupSchedules: expect.arrayContaining([
            expect.objectContaining({
              groupId: 'group-123',
              groupName: 'Test Reading Group',
              memberRole: 'member',
              progress: expect.objectContaining({
                pointsEarned: expect.any(Number)
              })
            })
          ])
        })
      );
    });

    test('should calculate points correctly', async () => {
      const userId = 'test-user-123';
      req.params = { userId };

      const mockSchedule = createTestSchedule({ userId });
      const mockProgress = [
        // Day 1: 2 points (verseText + partner)
        createTestProgress({ 
          dayNumber: 1, 
          completionTasks: { verseText: true, footnotes: false, partner: true } 
        }),
        // Day 2: 3 points (all tasks)
        createTestProgress({ 
          dayNumber: 2, 
          completionTasks: { verseText: true, footnotes: true, partner: true } 
        }),
        // Day 3: 1 point (footnotes only)
        createTestProgress({ 
          dayNumber: 3, 
          completionTasks: { verseText: false, footnotes: true, partner: false } 
        })
      ];

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockSchedule]))
        .mockResolvedValueOnce(createMockQuerySnapshot(mockProgress))
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // No group memberships

      await getUserSchedules(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          individualSchedules: expect.arrayContaining([
            expect.objectContaining({
              progress: expect.objectContaining({
                pointsEarned: 6 // 2 + 3 + 1 = 6 total points
              })
            })
          ])
        })
      );
    });

    test('should handle backward compatibility for old progress format', async () => {
      const userId = 'test-user-123';
      req.params = { userId };

      const mockSchedule = createTestSchedule({ userId });
      const mockOldProgress = [
        { dayNumber: 1, isCompleted: true }, // Old format - should count as 1 point
        { dayNumber: 2, isCompleted: false }, // Old format - should count as 0 points
        createTestProgress({ 
          dayNumber: 3, 
          completionTasks: { verseText: true, footnotes: false, partner: true } 
        }) // New format - should count as 2 points
      ];

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockSchedule]))
        .mockResolvedValueOnce(createMockQuerySnapshot(mockOldProgress))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      await getUserSchedules(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          individualSchedules: expect.arrayContaining([
            expect.objectContaining({
              progress: expect.objectContaining({
                pointsEarned: 3 // 1 + 0 + 2 = 3 total points
              })
            })
          ])
        })
      );
    });

    test('should return 400 for missing userId parameter', async () => {
      req.params = {};

      await getUserSchedules(req, res);

      expectValidationError(res, 'userId');
    });

    test('should return empty arrays when user has no schedules', async () => {
      const userId = 'test-user-123';
      req.params = { userId };

      // Mock empty results
      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([])) // No individual schedules
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // No group memberships

      await getUserSchedules(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          individualSchedules: [],
          groupSchedules: []
        })
      );
    });

    test('should filter out inactive group memberships', async () => {
      const userId = 'test-user-123';
      req.params = { userId };

      const activeMembership = {
        userId,
        groupId: 'active-group',
        status: 'active',
        role: 'member'
      };

      const inactiveMembership = {
        userId,
        groupId: 'inactive-group',
        status: 'left',
        role: 'member'
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([])) // No individual schedules
        .mockResolvedValueOnce(createMockQuerySnapshot([activeMembership, inactiveMembership]))
        .mockResolvedValueOnce(createMockDocSnapshot(createTestGroup({ groupId: 'active-group' })))
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // No progress

      await getUserSchedules(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          groupSchedules: expect.arrayContaining([
            expect.objectContaining({
              groupId: 'active-group'
            })
          ])
        })
      );

      // Should not include inactive group
      const response = res.json.mock.calls[0][0];
      expect(response.groupSchedules).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            groupId: 'inactive-group'
          })
        ])
      );
    });

    test('should calculate current day correctly', async () => {
      const userId = 'test-user-123';
      req.params = { userId };

      const scheduleStartDate = new Date();
      scheduleStartDate.setDate(scheduleStartDate.getDate() - 5); // Started 5 days ago

      const mockSchedule = createTestSchedule({
        userId,
        startDate: scheduleStartDate.toISOString().split('T')[0]
      });

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockSchedule]))
        .mockResolvedValueOnce(createMockQuerySnapshot([]))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      await getUserSchedules(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          individualSchedules: expect.arrayContaining([
            expect.objectContaining({
              progress: expect.objectContaining({
                currentDay: 6 // Should be day 6 (started 5 days ago + today)
              })
            })
          ])
        })
      );
    });

    test('should handle database errors gracefully', async () => {
      const userId = 'test-user-123';
      req.params = { userId };

      global.mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      await getUserSchedules(req, res);

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