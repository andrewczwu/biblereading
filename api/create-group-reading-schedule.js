const { db } = require('../config/firebase');

function calculateDate(startDate, dayOffset) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + dayOffset);
  return date.toISOString().split('T')[0];
}

function getDayOfWeek(dateString) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
}

function generateGroupId(groupName) {
  // Create a URL-friendly ID from group name
  return groupName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

async function createGroupReadingSchedule(req, res) {
  try {
    const { 
      groupName, 
      templateId, 
      startDate, 
      createdBy,
      isPublic = true,
      maxMembers = null,
      customGroupId = null,
      completionTasks = {
        verseText: true,
        footnotes: false,
        partner: false
      }
    } = req.body;

    if (!groupName || !templateId || !startDate || !createdBy) {
      return res.status(400).json({
        error: 'Missing required fields: groupName, templateId, startDate, and createdBy are required'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format'
      });
    }

    console.log(`Creating group reading schedule: ${groupName} using template ${templateId} starting ${startDate}`);

    // Step 1: Get the template
    const templateDoc = await db.collection('readingTemplates').doc(templateId).get();
    if (!templateDoc.exists) {
      return res.status(404).json({
        error: `Template ${templateId} not found`
      });
    }

    const templateData = templateDoc.data();
    console.log(`✓ Found template: ${templateData.name} (${templateData.durationDays} days)`);

    // Step 2: Generate or validate group ID
    const groupId = customGroupId || generateGroupId(groupName);
    
    const existingGroup = await db.collection('groupReadingSchedules').doc(groupId).get();
    if (existingGroup.exists) {
      return res.status(409).json({
        error: 'Group ID already exists. Please choose a different group name or provide a custom group ID',
        suggestedGroupId: `${groupId}-${Date.now()}`
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

    // Step 5: Create the main group schedule document
    const groupScheduleData = {
      groupId: groupId,
      groupName: groupName,
      templateId: templateId,
      templateName: templateData.name,
      startDate: startDate,
      endDate: endDate,
      durationDays: templateData.durationDays,
      currentDay: 1,
      status: 'active',
      createdBy: createdBy,
      isPublic: isPublic,
      maxMembers: maxMembers,
      completionTasks: completionTasks, // Store which completion tasks are enabled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('groupReadingSchedules').doc(groupId).set(groupScheduleData);
    console.log(`✓ Created group schedule document: ${groupId}`);

    // Step 6: Add creator as the first member with admin role
    const creatorMemberData = {
      userId: createdBy,
      joinedAt: new Date().toISOString(),
      role: 'admin',
      status: 'active',
      currentDay: 1,
      completedDays: 0,
      lastActiveAt: new Date().toISOString()
    };

    await db
      .collection('groupReadingSchedules')
      .doc(groupId)
      .collection('members')
      .doc(createdBy)
      .set(creatorMemberData);

    console.log(`✓ Added creator ${createdBy} as group admin`);

    // Step 7: Create daily schedule documents in batches
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
        .collection('groupReadingSchedules')
        .doc(groupId)
        .collection('dailySchedule')
        .doc(templateDoc.id); // Use same zero-padded ID as template

      const dailyScheduleData = {
        dayNumber: dayNumber,
        scheduledDate: scheduledDate,
        dayOfWeek: dayOfWeek,
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

    console.log(`✅ Successfully created group reading schedule with ${processedCount} daily entries`);

    // Step 8: Return success response with group details
    res.status(201).json({
      message: 'Group reading schedule created successfully',
      group: {
        groupId: groupId,
        groupName: groupName,
        templateId: templateId,
        templateName: templateData.name,
        startDate: startDate,
        endDate: endDate,
        durationDays: templateData.durationDays,
        totalDailyReadings: processedCount,
        status: 'active',
        createdBy: createdBy,
        isPublic: isPublic,
        maxMembers: maxMembers,
      }
    });

  } catch (error) {
    console.error('Error creating group reading schedule:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  createGroupReadingSchedule
};