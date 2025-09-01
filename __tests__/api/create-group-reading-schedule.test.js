const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { createGroupReadingSchedule } = require('../../api/create-group-reading-schedule');
const {
  createTestUser,
  createTestGroup,
  createMockRequest,
  createMockResponse,
  createMockDocSnapshot,
  createMockQuerySnapshot,
  expectValidationError,
  expectSuccessResponse,
  expectErrorResponse
} = require('../helpers/testHelpers');

describe('Create Group Reading Schedule API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('createGroupReadingSchedule', () => {
    const validGroupData = {
      groupName: 'Test Reading Group',
      templateId: 'bellevueYPNT',
      startDate: '2024-06-01',
      createdBy: 'test-admin-123',
      isPublic: true,
      maxMembers: 50,
      customGroupId: 'test-custom-group',
      completionTasks: {
        verseText: true,
        footnotes: true,
        partner: false
      }
    };

    test('should create group reading schedule with valid data', async () => {
      req.body = validGroupData;

      const mockTemplate = {
        id: 'bellevueYPNT',
        name: 'Bellevue Young People New Testament',
        durationDays: 299
      };

      const mockUser = createTestUser({
        uid: 'test-admin-123',
        displayName: 'Test Admin'
      });

      const mockTemplateReadings = Array.from({ length: 3 }, (_, i) => ({
        dayNumber: i + 1,
        portions: [{
          bookName: 'Matthew',
          startChapter: i + 1,
          startVerse: 1,
          endChapter: i + 1,
          endVerse: 25
        }]
      }));

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true)) // Template exists
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true)) // User exists
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)) // Custom group ID available
        .mockResolvedValueOnce(createMockQuerySnapshot(mockTemplateReadings)); // Template readings

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createGroupReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: 'test-custom-group',
          groupName: 'Test Reading Group',
          templateId: 'bellevueYPNT',
          createdBy: 'test-admin-123',
          status: 'active',
          isPublic: true,
          maxMembers: 50,
          completionTasks: {
            verseText: true,
            footnotes: true,
            partner: false
          }
        })
      );

      expectSuccessResponse(res, 201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('created successfully'),
          group: expect.objectContaining({
            groupId: 'test-custom-group',
            groupName: 'Test Reading Group'
          })
        })
      );
    });

    test('should auto-generate group ID when not provided', async () => {
      const dataWithoutCustomId = { ...validGroupData };
      delete dataWithoutCustomId.customGroupId;
      req.body = dataWithoutCustomId;

      const mockTemplate = { id: 'bellevueYPNT', name: 'Test Template', durationDays: 299 };
      const mockUser = createTestUser({ uid: 'test-admin-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // Template readings

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createGroupReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          groupId: expect.stringMatching(/^test-reading-group-\d{4}-\d{2}-\d{2}$/),
          groupName: 'Test Reading Group'
        })
      );
    });

    test('should return 400 for missing required fields', async () => {
      req.body = { groupName: 'Test Group' }; // Missing required fields

      await createGroupReadingSchedule(req, res);

      expectValidationError(res, 'templateId');
    });

    test('should return 400 for invalid group name', async () => {
      req.body = {
        ...validGroupData,
        groupName: 'A' // Too short
      };

      await createGroupReadingSchedule(req, res);

      expectValidationError(res, 'groupName');
    });

    test('should return 400 for invalid date format', async () => {
      req.body = {
        ...validGroupData,
        startDate: 'invalid-date'
      };

      await createGroupReadingSchedule(req, res);

      expectValidationError(res, 'date');
    });

    test('should return 400 for past start date', async () => {
      req.body = {
        ...validGroupData,
        startDate: '2020-01-01'
      };

      await createGroupReadingSchedule(req, res);

      expectValidationError(res, 'future');
    });

    test('should return 404 for non-existent template', async () => {
      req.body = {
        ...validGroupData,
        templateId: 'non-existent-template'
      };

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await createGroupReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'Reading template not found');
    });

    test('should return 404 for non-existent creator', async () => {
      req.body = validGroupData;

      const mockTemplate = { id: 'bellevueYPNT', name: 'Test Template', durationDays: 299 };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false)); // User doesn't exist

      await createGroupReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'User not found');
    });

    test('should return 409 for existing group ID', async () => {
      req.body = validGroupData;

      const mockTemplate = { id: 'bellevueYPNT', name: 'Test Template', durationDays: 299 };
      const mockUser = createTestUser({ uid: 'test-admin-123' });
      const existingGroup = createTestGroup({ groupId: 'test-custom-group' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(existingGroup, true)); // Group ID already exists

      await createGroupReadingSchedule(req, res);

      expectErrorResponse(res, 409, 'Group ID already exists');
    });

    test('should validate maxMembers range', async () => {
      req.body = {
        ...validGroupData,
        maxMembers: 1 // Below minimum
      };

      await createGroupReadingSchedule(req, res);

      expectValidationError(res, 'maxMembers');
    });

    test('should allow unlimited members when maxMembers is null', async () => {
      req.body = {
        ...validGroupData,
        maxMembers: null
      };

      const mockTemplate = { id: 'bellevueYPNT', name: 'Test Template', durationDays: 299 };
      const mockUser = createTestUser({ uid: 'test-admin-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createGroupReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          maxMembers: null
        })
      );
    });

    test('should use default completion tasks if not provided', async () => {
      const dataWithoutTasks = { ...validGroupData };
      delete dataWithoutTasks.completionTasks;
      req.body = dataWithoutTasks;

      const mockTemplate = { id: 'bellevueYPNT', name: 'Test Template', durationDays: 299 };
      const mockUser = createTestUser({ uid: 'test-admin-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createGroupReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          completionTasks: {
            verseText: true,
            footnotes: false,
            partner: false
          }
        })
      );
    });

    test('should calculate correct end date based on template duration', async () => {
      req.body = {
        ...validGroupData,
        startDate: '2024-01-01'
      };

      const mockTemplate = {
        id: 'bellevueYPNT',
        name: 'Test Template',
        durationDays: 10
      };
      const mockUser = createTestUser({ uid: 'test-admin-123' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createGroupReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: '2024-01-10' // Start date + 9 days (10 total days)
        })
      );
    });

    test('should create admin membership for creator', async () => {
      req.body = validGroupData;

      const mockTemplate = { id: 'bellevueYPNT', name: 'Test Template', durationDays: 299 };
      const mockUser = createTestUser({ uid: 'test-admin-123', displayName: 'Test Admin' });

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce(createMockQuerySnapshot([]));

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createGroupReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'test-admin-123',
          groupId: 'test-custom-group',
          role: 'admin',
          status: 'active',
          userName: 'Test Admin'
        })
      );
    });

    test('should create daily schedule entries', async () => {
      req.body = validGroupData;

      const mockTemplate = { id: 'bellevueYPNT', name: 'Test Template', durationDays: 3 };
      const mockUser = createTestUser({ uid: 'test-admin-123' });
      const mockTemplateReadings = Array.from({ length: 3 }, (_, i) => ({
        dayNumber: i + 1,
        portions: [{ bookName: 'Matthew', startChapter: i + 1 }]
      }));

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockDocSnapshot(mockUser, true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce(createMockQuerySnapshot(mockTemplateReadings));

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createGroupReadingSchedule(req, res);

      expect(global.mockBatch.set).toHaveBeenCalledTimes(5); // 3 daily schedule + 1 group + 1 membership
      expect(global.mockBatch.commit).toHaveBeenCalled();
    });

    test('should handle database errors gracefully', async () => {
      req.body = validGroupData;

      global.mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      await createGroupReadingSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Database connection failed')
        })
      );
    });

    test('should validate custom group ID format', async () => {
      req.body = {
        ...validGroupData,
        customGroupId: 'Invalid Group ID!' // Invalid characters
      };

      await createGroupReadingSchedule(req, res);

      expectValidationError(res, 'customGroupId');
    });
  });
});