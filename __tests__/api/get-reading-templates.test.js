const { describe, test, expect, beforeEach } = require('@jest/globals');
require('../setup');

const { getReadingTemplates, getReadingTemplate } = require('../../api/get-reading-templates');
const {
  createMockRequest,
  createMockResponse,
  createMockQuerySnapshot,
  createMockDocSnapshot,
  expectSuccessResponse,
  expectErrorResponse
} = require('../helpers/testHelpers');

describe('Get Reading Templates API', () => {
  let req, res;

  beforeEach(() => {
    req = createMockRequest();
    res = createMockResponse();
  });

  describe('getReadingTemplates', () => {
    test('should return all reading templates', async () => {
      const mockTemplates = [
        {
          id: 'bellevueYPNT',
          name: 'Bellevue Young People New Testament',
          description: 'A 299-day journey through the New Testament',
          durationDays: 299,
          category: 'New Testament',
          difficulty: 'Beginner',
          isActive: true
        },
        {
          id: 'chronological',
          name: 'Chronological Bible Reading',
          description: 'Read the Bible in chronological order',
          durationDays: 365,
          category: 'Whole Bible',
          difficulty: 'Intermediate',
          isActive: true
        }
      ];

      global.mockDb.get.mockResolvedValueOnce(createMockQuerySnapshot(mockTemplates));

      await getReadingTemplates(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Reading templates retrieved successfully',
          templates: expect.arrayContaining([
            expect.objectContaining({
              id: 'bellevueYPNT',
              name: 'Bellevue Young People New Testament',
              durationDays: 299
            }),
            expect.objectContaining({
              id: 'chronological',
              name: 'Chronological Bible Reading',
              durationDays: 365
            })
          ])
        })
      );
    });

    test('should exclude inactive templates', async () => {
      const mockTemplates = [
        {
          id: 'active-template',
          name: 'Active Template',
          durationDays: 100,
          isActive: true
        },
        {
          id: 'inactive-template',
          name: 'Inactive Template',
          durationDays: 200,
          isActive: false
        }
      ];

      // Firestore query should only return active templates
      global.mockDb.get.mockResolvedValueOnce(createMockQuerySnapshot([mockTemplates[0]]));

      await getReadingTemplates(req, res);

      const response = res.json.mock.calls[0][0];
      expect(response.templates).toHaveLength(1);
      expect(response.templates[0].id).toBe('active-template');
    });

    test('should return empty array when no templates exist', async () => {
      global.mockDb.get.mockResolvedValueOnce(createMockQuerySnapshot([]));

      await getReadingTemplates(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Reading templates retrieved successfully',
          templates: []
        })
      );
    });

    test('should handle database errors gracefully', async () => {
      global.mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      await getReadingTemplates(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('Database connection failed')
        })
      );
    });

    test('should include all template metadata fields', async () => {
      const completeTemplate = {
        id: 'complete-template',
        name: 'Complete Template',
        description: 'A complete template with all fields',
        durationDays: 365,
        category: 'Whole Bible',
        difficulty: 'Advanced',
        author: 'Test Author',
        version: '1.0',
        tags: ['comprehensive', 'study'],
        isActive: true,
        createdAt: { seconds: 1640995200 },
        updatedAt: { seconds: 1640995200 }
      };

      global.mockDb.get.mockResolvedValueOnce(createMockQuerySnapshot([completeTemplate]));

      await getReadingTemplates(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          templates: expect.arrayContaining([
            expect.objectContaining({
              id: 'complete-template',
              name: 'Complete Template',
              description: 'A complete template with all fields',
              durationDays: 365,
              category: 'Whole Bible',
              difficulty: 'Advanced',
              author: 'Test Author',
              version: '1.0',
              tags: ['comprehensive', 'study']
            })
          ])
        })
      );
    });
  });

  describe('getReadingTemplate', () => {
    test('should return specific template by ID', async () => {
      const templateId = 'bellevueYPNT';
      req.params = { templateId };

      const mockTemplate = {
        id: templateId,
        name: 'Bellevue Young People New Testament',
        description: 'A 299-day journey through the New Testament',
        durationDays: 299,
        category: 'New Testament',
        difficulty: 'Beginner',
        isActive: true
      };

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true));

      await getReadingTemplate(req, res);

      expectSuccessResponse(res, 200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Reading template retrieved successfully',
          template: expect.objectContaining({
            id: templateId,
            name: 'Bellevue Young People New Testament',
            durationDays: 299
          })
        })
      );
    });

    test('should return 400 for missing templateId parameter', async () => {
      req.params = {};

      await getReadingTemplate(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.stringContaining('templateId')
        })
      );
    });

    test('should return 404 for non-existent template', async () => {
      req.params = { templateId: 'non-existent-template' };

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(null, false));

      await getReadingTemplate(req, res);

      expectErrorResponse(res, 404, 'Reading template not found');
    });

    test('should return 404 for inactive template', async () => {
      req.params = { templateId: 'inactive-template' };

      const inactiveTemplate = {
        id: 'inactive-template',
        name: 'Inactive Template',
        isActive: false
      };

      global.mockDb.get.mockResolvedValueOnce(createMockDocSnapshot(inactiveTemplate, true));

      await getReadingTemplate(req, res);

      expectErrorResponse(res, 404, 'Reading template not found');
    });

    test('should include daily readings count if available', async () => {
      req.params = { templateId: 'test-template' };

      const mockTemplate = {
        id: 'test-template',
        name: 'Test Template',
        durationDays: 10,
        isActive: true
      };

      const mockDailyReadings = Array.from({ length: 10 }, (_, i) => ({
        dayNumber: i + 1,
        portions: [{ bookName: 'Matthew', startChapter: i + 1 }]
      }));

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockQuerySnapshot(mockDailyReadings));

      await getReadingTemplate(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          template: expect.objectContaining({
            id: 'test-template',
            totalDailyReadings: 10
          })
        })
      );
    });

    test('should handle missing daily readings gracefully', async () => {
      req.params = { templateId: 'test-template' };

      const mockTemplate = {
        id: 'test-template',
        name: 'Test Template',
        durationDays: 10,
        isActive: true
      };

      global.mockDb.get
        .mockResolvedValueOnce(createMockDocSnapshot(mockTemplate, true))
        .mockResolvedValueOnce(createMockQuerySnapshot([])); // No daily readings

      await getReadingTemplate(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          template: expect.objectContaining({
            id: 'test-template',
            totalDailyReadings: 0
          })
        })
      );
    });

    test('should handle database errors gracefully', async () => {
      req.params = { templateId: 'test-template' };

      global.mockDb.get.mockRejectedValueOnce(new Error('Database connection failed'));

      await getReadingTemplate(req, res);

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