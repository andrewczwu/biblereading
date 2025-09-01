const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { createReadingSchedule } = require('../../api/create-reading-schedule');
const {
  createTestUser,
  createTestSchedule,
  createMockRequest,
  createMockResponse,
  createMockDocSnapshot,
  expectValidationError,
  expectSuccessResponse,
  expectErrorResponse,
  mockDbError
} = require('../helpers/testHelpers');

describe('Create Reading Schedule API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('createReadingSchedule', () => {
    const validScheduleData = {
      userId: 'test-user-123',
      templateId: 'bellevueYPNT',
      startDate: '2024-01-01',
      completionTasks: {
        verseText: true,
        footnotes: false,
        partner: true
      }
    };

    test('should create individual reading schedule with valid data', async () => {
      req.body = validScheduleData;

      // Mock template exists
      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot({
          id: 'bellevueYPNT',
          name: 'Bellevue Young People New Testament',
          durationDays: 299
        }, true))
        // Mock user exists
        .mockResolvedValueOnce(createMockDocSnapshot(createTestUser(), true))
        // Mock schedule doesn't exist
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        // Mock template readings
        .mockResolvedValueOnce({
          docs: Array.from({ length: 5 }, (_, i) => createMockDocSnapshot({
            dayNumber: i + 1,
            portions: [{
              bookName: 'Matthew',
              startChapter: i + 1,
              startVerse: 1,
              endChapter: i + 1,
              endVerse: 25
            }]
          }))
        });

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createReadingSchedule(req, res);

      expect(global.mockDb.collection).toHaveBeenCalledWith('readingTemplates');
      expect(global.mockDb.collection).toHaveBeenCalledWith('userProfiles');
      expect(global.mockDb.collection).toHaveBeenCalledWith('userReadingSchedules');
      
      expectSuccessResponse(res, 201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('created successfully'),
          schedule: expect.objectContaining({
            userId: validScheduleData.userId,
            templateId: validScheduleData.templateId,
            startDate: validScheduleData.startDate,
            completionTasks: validScheduleData.completionTasks
          })
        })
      );
    });

    test('should return 400 for missing required fields', async () => {
      req.body = { userId: 'test-user-123' }; // Missing templateId and startDate

      await createReadingSchedule(req, res);

      expectValidationError(res, 'templateId');
    });

    test('should return 400 for invalid date format', async () => {
      req.body = {
        ...validScheduleData,
        startDate: 'invalid-date'
      };

      await createReadingSchedule(req, res);

      expectValidationError(res, 'date');
    });

    test('should return 400 for past start date', async () => {
      req.body = {
        ...validScheduleData,
        startDate: '2020-01-01' // Past date
      };

      await createReadingSchedule(req, res);

      expectValidationError(res, 'future');
    });

    test('should return 404 for non-existent template', async () => {
      req.body = {
        ...validScheduleData,
        templateId: 'non-existent-template'
      };

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await createReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'Reading template not found');
    });

    test('should return 404 for non-existent user', async () => {
      req.body = validScheduleData;

      // Mock template exists
      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot({
          id: 'bellevueYPNT',
          name: 'Test Template',
          durationDays: 299
        }, true))
        // Mock user doesn't exist
        .mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await createReadingSchedule(req, res);

      expectErrorResponse(res, 404, 'User not found');
    });

    test('should return 409 for existing schedule', async () => {
      req.body = validScheduleData;

      // Mock template exists
      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot({
          id: 'bellevueYPNT',
          name: 'Test Template',
          durationDays: 299
        }, true))
        // Mock user exists
        .mockResolvedValueOnce(createMockDocSnapshot(createTestUser(), true))
        // Mock schedule already exists
        .mockResolvedValueOnce(createMockDocSnapshot(createTestSchedule(), true));

      await createReadingSchedule(req, res);

      expectErrorResponse(res, 409, 'already exists');
    });

    test('should use default completion tasks if not provided', async () => {
      const scheduleDataWithoutTasks = {
        userId: 'test-user-123',
        templateId: 'bellevueYPNT',
        startDate: '2024-01-01'
      };
      req.body = scheduleDataWithoutTasks;

      // Mock successful creation flow
      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot({
          id: 'bellevueYPNT',
          name: 'Test Template',
          durationDays: 299
        }, true))
        .mockResolvedValueOnce(createMockDocSnapshot(createTestUser(), true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce({ docs: [] });

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createReadingSchedule(req, res);

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
      req.body = validScheduleData;

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot({
          id: 'bellevueYPNT',
          name: 'Test Template',
          durationDays: 10 // 10 day template
        }, true))
        .mockResolvedValueOnce(createMockDocSnapshot(createTestUser(), true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce({ docs: [] });

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createReadingSchedule(req, res);

      expect(global.mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: '2024-01-10' // Start date + 9 days (10 total days)
        })
      );
    });

    test('should handle database errors gracefully', async () => {
      req.body = validScheduleData;

      mockDbError(new Error('Database connection failed'));

      await createReadingSchedule(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Database connection failed')
        })
      );
    });

    test('should create daily schedule entries', async () => {
      req.body = validScheduleData;

      const mockTemplateReadings = Array.from({ length: 3 }, (_, i) => 
        createMockDocSnapshot({
          dayNumber: i + 1,
          portions: [{
            bookName: 'Matthew',
            startChapter: i + 1,
            startVerse: 1,
            endChapter: i + 1,
            endVerse: 25
          }]
        })
      );

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot({
          id: 'bellevueYPNT',
          name: 'Test Template',
          durationDays: 3
        }, true))
        .mockResolvedValueOnce(createMockDocSnapshot(createTestUser(), true))
        .mockResolvedValueOnce(createMockDocSnapshot(null, false))
        .mockResolvedValueOnce({ docs: mockTemplateReadings });

      global.mockDb.set.mockResolvedValue();
      global.mockBatch.commit.mockResolvedValue();

      await createReadingSchedule(req, res);

      expect(global.mockBatch.set).toHaveBeenCalledTimes(3); // One for each day
      expect(global.mockBatch.commit).toHaveBeenCalled();
    });
  });
});