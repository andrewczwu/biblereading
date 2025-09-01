const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { getAvailableGroups } = require('../../api/get-available-groups');
const {
  createTestGroup,
  createMockRequest,
  createMockResponse,
  createMockQuerySnapshot,
  expectSuccessResponse
} = require('../helpers/testHelpers');

describe('Get Available Groups API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('getAvailableGroups', () => {
    test('should return available public groups with member counts', async () => {
      const mockGroups = [
        createTestGroup({
          groupId: 'group-1',
          groupName: 'Public Group 1',
          isPublic: true,
          status: 'active',
          maxMembers: 20
        }),
        createTestGroup({
          groupId: 'group-2',
          groupName: 'Public Group 2',
          isPublic: true,
          status: 'active',
          maxMembers: 50
        })
      ];

      const mockMembers1 = [
        { userId: 'user-1', status: 'active' },
        { userId: 'user-2', status: 'active' },
        { userId: 'user-3', status: 'left' } // Inactive member
      ];

      const mockMembers2 = [
        { userId: 'user-4', status: 'active' },
        { userId: 'user-5', status: 'active' },
        { userId: 'user-6', status: 'active' }
      ];

      // Mock the database calls
      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot(mockGroups)) // Groups query
        .mockResolvedValueOnce(createMockQuerySnapshot(mockMembers1)) // Members for group-1
        .mockResolvedValueOnce(createMockQuerySnapshot(mockMembers2)); // Members for group-2

      await getAvailableGroups(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Available groups retrieved successfully',
          groups: expect.arrayContaining([
            expect.objectContaining({
              groupId: 'group-1',
              groupName: 'Public Group 1',
              memberCount: 2, // Only active members
              maxMembers: 20,
              isFull: false
            }),
            expect.objectContaining({
              groupId: 'group-2',
              groupName: 'Public Group 2',
              memberCount: 3,
              maxMembers: 50,
              isFull: false
            })
          ])
        })
      );
    });

    test('should identify full groups correctly', async () => {
      const mockGroup = createTestGroup({
        groupId: 'full-group',
        groupName: 'Full Group',
        isPublic: true,
        status: 'active',
        maxMembers: 2
      });

      const mockMembers = [
        { userId: 'user-1', status: 'active' },
        { userId: 'user-2', status: 'active' }
      ];

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroup]))
        .mockResolvedValueOnce(createMockQuerySnapshot(mockMembers));

      await getAvailableGroups(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: expect.arrayContaining([
            expect.objectContaining({
              groupId: 'full-group',
              memberCount: 2,
              maxMembers: 2,
              isFull: true
            })
          ])
        })
      );
    });

    test('should handle groups with unlimited members', async () => {
      const mockGroup = createTestGroup({
        groupId: 'unlimited-group',
        groupName: 'Unlimited Group',
        isPublic: true,
        status: 'active',
        maxMembers: null // No limit
      });

      const mockMembers = Array.from({ length: 100 }, (_, i) => ({
        userId: `user-${i}`,
        status: 'active'
      }));

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroup]))
        .mockResolvedValueOnce(createMockQuerySnapshot(mockMembers));

      await getAvailableGroups(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: expect.arrayContaining([
            expect.objectContaining({
              groupId: 'unlimited-group',
              memberCount: 100,
              maxMembers: null,
              isFull: false
            })
          ])
        })
      );
    });

    test('should exclude private groups', async () => {
      const mockGroups = [
        createTestGroup({
          groupId: 'public-group',
          groupName: 'Public Group',
          isPublic: true,
          status: 'active'
        }),
        createTestGroup({
          groupId: 'private-group',
          groupName: 'Private Group',
          isPublic: false,
          status: 'active'
        })
      ];

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroups[0]])) // Only public group returned by query
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // No members

      await getAvailableGroups(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.groups).toHaveLength(1);
      expect(response.groups[0].groupId).toBe('public-group');
    });

    test('should exclude inactive groups', async () => {
      const mockGroups = [
        createTestGroup({
          groupId: 'active-group',
          groupName: 'Active Group',
          isPublic: true,
          status: 'active'
        }),
        createTestGroup({
          groupId: 'inactive-group',
          groupName: 'Inactive Group',
          isPublic: true,
          status: 'completed'
        })
      ];

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroups[0]])) // Only active group returned
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      await getAvailableGroups(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.groups).toHaveLength(1);
      expect(response.groups[0].status).toBe('active');
    });

    test('should calculate current day correctly', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 10); // Started 10 days ago

      const mockGroup = createTestGroup({
        groupId: 'test-group',
        startDate: startDate.toISOString().split('T')[0],
        durationDays: 100
      });

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroup]))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      await getAvailableGroups(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: expect.arrayContaining([
            expect.objectContaining({
              currentDay: 11 // Should be day 11 (started 10 days ago + today)
            })
          ])
        })
      );
    });

    test('should include completion tasks configuration', async () => {
      const mockGroup = createTestGroup({
        groupId: 'test-group',
        completionTasks: {
          verseText: true,
          footnotes: true,
          partner: false
        }
      });

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroup]))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      await getAvailableGroups(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: expect.arrayContaining([
            expect.objectContaining({
              completionTasks: {
                verseText: true,
                footnotes: true,
                partner: false
              }
            })
          ])
        })
      );
    });

    test('should return empty array when no groups are available', async () => {
      global.mockDb.get.mockResolvedValueOnce(createMockQuerySnapshot([]));

      await getAvailableGroups(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Available groups retrieved successfully',
          groups: []
        })
      );
    });

    test('should handle database errors gracefully', async () => {
      global.mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      await getAvailableGroups(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Database connection failed')
        })
      );
    });

    test('should handle member count query failures gracefully', async () => {
      const mockGroup = createTestGroup({
        groupId: 'test-group',
        isPublic: true,
        status: 'active'
      });

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([mockGroup]))
        .mockRejectedValueOnce(new Error('Members query failed')); // Members query fails

      await getAvailableGroups(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          groups: expect.arrayContaining([
            expect.objectContaining({
              groupId: 'test-group',
              memberCount: 0, // Should default to 0 on error
              isFull: false
            })
          ])
        })
      );
    });

    test('should sort groups by start date (newest first)', async () => {
      const olderGroup = createTestGroup({
        groupId: 'older-group',
        groupName: 'Older Group',
        startDate: '2024-01-01'
      });

      const newerGroup = createTestGroup({
        groupId: 'newer-group',
        groupName: 'Newer Group',
        startDate: '2024-06-01'
      });

      global.mockDb.get
        .mockResolvedValueOnce(createMockQuerySnapshot([newerGroup, olderGroup])) // Firestore should handle ordering
        .mockResolvedValueOnce(createMockQuerySnapshot([])) // Members for newer group
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // Members for older group

      await getAvailableGroups(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.groups[0].groupId).toBe('newer-group');
      expect(response.groups[1].groupId).toBe('older-group');
    });
  });
});