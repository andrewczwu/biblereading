const { db } = require('../config/firebase');

function calculateDate(startDate, dayOffset) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

function getDayOfWeek(dateString) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

async function createReadingSchedule(req, res) {
  try {
    const { 
      userId, 
      templateId, 
      startDate,
      completionTasks = {
        verseText: true,
        footnotes: false,
        partner: false
      }
    } = req.body;

    if (!userId || !templateId || !startDate) {
      return res.status(400).json({
        error: 'Missing required fields: userId, templateId, and startDate are required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format'
      });
    }

    console.log(`Creating reading schedule for user ${userId} using template ${templateId} starting ${startDate}`);

    // Step 1: Get the template
    const templateDoc = await db.collection('readingTemplates').doc(templateId).get();
    if (!templateDoc.exists) {
      return res.status(404).json({
        error: `Template ${templateId} not found`
      });
    }

    const templateData = templateDoc.data();
    console.log(`✓ Found template: ${templateData.name} (${templateData.durationDays} days)`);

    // Step 2: Check if user already has a schedule for this template
    const scheduleId = `${userId}_${templateId}_${startDate}`;
    const existingSchedule = await db.collection('userReadingSchedules').doc(scheduleId).get();
    
    if (existingSchedule.exists) {
      return res.status(409).json({
        error: 'Reading schedule already exists for this user, template, and start date',
        scheduleId: scheduleId
      });
    }

    // Step 3: Get all template daily readings
    const templateReadingsSnapshot = await db
      .collection('readingTemplates')
      .doc(templateId)
      .collection('dailyReadings')
      .get();

    if (templateReadingsSnapshot.empty) {
      return res.status(404).json({
        error: `No daily readings found for template ${templateId}`
      });
    }

    console.log(`✓ Found ${templateReadingsSnapshot.size} daily readings in template`);

    // Step 4: Calculate end date
    const endDate = calculateDate(startDate, templateData.durationDays - 1);

    // Step 5: Create the main schedule document
    const scheduleData = {
      userId: userId,
      templateId: templateId,
      templateName: templateData.name,
      startDate: startDate,
      endDate: endDate,
      durationDays: templateData.durationDays,
      currentDay: 1,
      status: 'active',
      completionTasks: completionTasks, // Store which completion tasks are enabled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('userReadingSchedules').doc(scheduleId).set(scheduleData);
    console.log(`✓ Created main schedule document: ${scheduleId}`);

    // Step 6: Create daily schedule documents in batches
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;
    let processedCount = 0;

    // Sort template readings by document ID to ensure correct order
    const sortedReadings = templateReadingsSnapshot.docs.sort((a, b) => {
      const aNum = parseInt(a.id);
      const bNum = parseInt(b.id);
      return aNum - bNum;
    });

    for (const templateDoc of sortedReadings) {
      const templateReading = templateDoc.data();
      const dayNumber = parseInt(templateDoc.id);
      
      // Calculate the scheduled date for this day
      const scheduledDate = calculateDate(startDate, dayNumber - 1);
      const dayOfWeek = getDayOfWeek(scheduledDate);

      const dailyScheduleRef = db
        .collection('userReadingSchedules')
        .doc(scheduleId)
        .collection('dailySchedule')
        .doc(templateDoc.id); // Use same zero-padded ID as template

      const dailyScheduleData = {
        dayNumber: dayNumber,
        scheduledDate: scheduledDate,
        dayOfWeek: dayOfWeek,
        isCompleted: false,
        completedAt: null,
        // Copy all reading data from template
        startBookName: templateReading.startBookName,
        startBookId: templateReading.startBookId,
        endBookName: templateReading.endBookName,
        endBookId: templateReading.endBookId,
        portions: templateReading.portions
      };

      // Include rawReading if it exists in template
      if (templateReading.rawReading) {
        dailyScheduleData.rawReading = templateReading.rawReading;
      }

      batch.set(dailyScheduleRef, dailyScheduleData);
      batchCount++;
      processedCount++;

      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✓ Created batch of ${batchCount} daily schedule entries`);
        batch = db.batch();
        batchCount = 0;
      }
    }

    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✓ Created final batch of ${batchCount} daily schedule entries`);
    }

    console.log(`✅ Successfully created reading schedule with ${processedCount} daily entries`);

    // Step 7: Return success response with schedule details
    res.status(201).json({
      message: 'Reading schedule created successfully',
      schedule: {
        scheduleId: scheduleId,
        userId: userId,
        templateId: templateId,
        templateName: templateData.name,
        startDate: startDate,
        endDate: endDate,
        durationDays: templateData.durationDays,
        totalDailyReadings: processedCount,
        status: 'active'
      }
    });

  } catch (error) {
    console.error('Error creating reading schedule:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  createReadingSchedule
};