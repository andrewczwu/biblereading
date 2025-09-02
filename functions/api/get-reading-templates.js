const { db } = require('../config/firebase');


async function getReadingTemplates(req, res) {
  try {
    console.log('Fetching reading templates from Firestore...');

    // Get all reading templates from the readingTemplates collection
    const templatesSnapshot = await (db).collection('readingTemplates').get();

    if (templatesSnapshot.empty) {
      return res.status(404).json({
        error: 'No reading templates found',
        message: 'The readingTemplates collection is empty. Please seed the database with template data.'
      });
    }

    // Extract template data
    const templates = [];
    templatesSnapshot.forEach(doc => {
      const templateData = doc.data();
      templates.push({
        id: doc.id,
        name: templateData.name,
        description: templateData.description || null,
        durationDays: templateData.durationDays,
        category: templateData.category || 'general',
        difficulty: templateData.difficulty || 'medium',
        createdAt: templateData.createdAt || null,
        updatedAt: templateData.updatedAt || null
      });
    });

    // Sort templates by name for consistent ordering
    templates.sort((a, b) => a.name.localeCompare(b.name));

    console.log(`✓ Found ${templates.length} reading templates`);

    res.status(200).json({
      message: 'Reading templates retrieved successfully',
      count: templates.length,
      templates: templates
    });

  } catch (error) {
    console.error('Error fetching reading templates:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function getReadingTemplate(req, res) {
  try {
    const { templateId } = req.params;

    if (!templateId) {
      return res.status(400).json({
        error: 'Template ID is required'
      });
    }

    console.log(`Fetching reading template: ${templateId}`);

    // Get the specific template
    const templateDoc = await (db).collection('readingTemplates').doc(templateId).get();

    if (!templateDoc.exists) {
      return res.status(404).json({
        error: `Reading template '${templateId}' not found`
      });
    }

    const templateData = templateDoc.data();

    // Get the daily readings count for this template
    const dailyReadingsSnapshot = await db
      .collection('readingTemplates')
      .doc(templateId)
      .collection('dailyReadings')
      .get();

    const template = {
      id: templateDoc.id,
      name: templateData.name,
      description: templateData.description || null,
      durationDays: templateData.durationDays,
      category: templateData.category || 'general',
      difficulty: templateData.difficulty || 'medium',
      dailyReadingsCount: dailyReadingsSnapshot.size,
      createdAt: templateData.createdAt || null,
      updatedAt: templateData.updatedAt || null
    };

    console.log(`✓ Found template: ${template.name} with ${template.dailyReadingsCount} daily readings`);

    res.status(200).json({
      message: 'Reading template retrieved successfully',
      template: template
    });

  } catch (error) {
    console.error('Error fetching reading template:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getReadingTemplates,
  getReadingTemplate
};