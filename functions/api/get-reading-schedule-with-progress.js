const { db } = require('../config/firebase');


async function getReadingScheduleWithProgress(req, res) {
  try {
    const { userId, scheduleId = null, groupId = null, limit = null, offset = null } = req.query;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    // Must specify either scheduleId (individual) or groupId (group)
    if (!scheduleId && !groupId) {
      return res.status(400).json({
        error: 'Must specify either scheduleId (for individual schedule) or groupId (for group schedule)'
      });
    }

    if (scheduleId && groupId) {
      return res.status(400).json({
        error: 'Cannot specify both scheduleId and groupId. Choose one.'
      });
    }

    console.log(`Getting reading schedule with progress for user ${userId}`);

    let scheduleRef;
    let scheduleData;
    let progressCollection;
    let isGroupSchedule = false;

    // Determine if this is an individual or group schedule
    if (scheduleId) {
      // Individual schedule
      console.log(`Processing individual schedule: ${scheduleId}`);
      
      scheduleRef = (db).collection('userReadingSchedules').doc(scheduleId);
      const scheduleDoc = await scheduleRef.get();
      
      if (!scheduleDoc.exists) {
        return res.status(404).json({
          error: 'Individual reading schedule not found'
        });
      }

      scheduleData = scheduleDoc.data();
      
      // Verify user owns this schedule
      if (scheduleData.userId !== userId) {
        return res.status(403).json({
          error: 'User does not have access to this reading schedule'
        });
      }

      progressCollection = scheduleRef.collection('progress');
      
    } else {
      // Group schedule
      console.log(`Processing group schedule: ${groupId}`);
      isGroupSchedule = true;
      
      scheduleRef = (db).collection('groupReadingSchedules').doc(groupId);
      const groupDoc = await scheduleRef.get();
      
      if (!groupDoc.exists) {
        return res.status(404).json({
          error: 'Group reading schedule not found'
        });
      }

      scheduleData = groupDoc.data();

      // Verify user is a member of this group
      const memberDoc = await scheduleRef
        .collection('members')
        .doc(userId)
        .get();

      if (!memberDoc.exists) {
        return res.status(403).json({
          error: 'User is not a member of this group reading schedule'
        });
      }

      const memberData = memberDoc.data();
      if (memberData.status !== 'active') {
        return res.status(403).json({
          error: 'User membership is not active'
        });
      }

      // For group schedules, progress is stored per user
      progressCollection = scheduleRef
        .collection('progress')
        .doc(userId)
        .collection('dailyProgress');
    }

    // Get daily schedule (the actual reading assignments)
    let dailyScheduleQuery = scheduleRef.collection('dailySchedule');
    
    // Apply pagination if provided
    if (limit) {
      dailyScheduleQuery = dailyScheduleQuery.limit(parseInt(limit));
    }
    if (offset) {
      dailyScheduleQuery = dailyScheduleQuery.offset(parseInt(offset));
    }

    const dailyScheduleSnapshot = await dailyScheduleQuery.get();
    
    if (dailyScheduleSnapshot.empty) {
      return res.status(404).json({
        error: 'No daily readings found for this schedule'
      });
    }

    console.log(`✓ Found ${dailyScheduleSnapshot.size} daily readings`);

    // Get all progress data for this user
    const progressSnapshot = await progressCollection.get();
    
    // Create a map of progress data by day ID for quick lookup
    const progressMap = new Map();
    progressSnapshot.docs.forEach(doc => {
      progressMap.set(doc.id, doc.data());
    });

    console.log(`✓ Found ${progressSnapshot.size} progress records`);

    // Combine daily schedule with progress data
    const readingsWithProgress = [];
    
    // Sort daily readings by day number
    const sortedDailyReadings = dailyScheduleSnapshot.docs.sort((a, b) => {
      const dayA = parseInt(a.id);
      const dayB = parseInt(b.id);
      return dayA - dayB;
    });

    for (const dailyDoc of sortedDailyReadings) {
      const dailyData = dailyDoc.data();
      const dayId = dailyDoc.id;
      
      // Get progress data for this day (if exists)
      const progressData = progressMap.get(dayId) || {};
      
      // Combine the data
      const readingWithProgress = {
        dayId: dayId,
        dayNumber: dailyData.dayNumber,
        scheduledDate: dailyData.scheduledDate,
        dayOfWeek: dailyData.dayOfWeek,
        
        // Reading content
        startBookName: dailyData.startBookName,
        startBookId: dailyData.startBookId,
        endBookName: dailyData.endBookName,
        endBookId: dailyData.endBookId,
        portions: dailyData.portions,
        
        // Progress information
        isCompleted: progressData.isCompleted || false,
        completionTasks: progressData.completionTasks || null,  // New: detailed completion tracking
        completedAt: progressData.completedAt || null,
        notes: progressData.notes || null,
        timeSpentMinutes: progressData.timeSpentMinutes || null,
        progressUpdatedAt: progressData.updatedAt || null
      };

      // Include raw reading if available
      if (dailyData.rawReading) {
        readingWithProgress.rawReading = dailyData.rawReading;
      }

      readingsWithProgress.push(readingWithProgress);
    }

    // Calculate summary statistics
    const totalReadings = readingsWithProgress.length;
    const completedReadings = readingsWithProgress.filter(r => r.isCompleted).length;
    const completionPercentage = totalReadings > 0 ? Math.round((completedReadings / totalReadings) * 100) : 0;


    // Prepare response data
    const responseData = {
      schedule: {
        scheduleId: isGroupSchedule ? null : scheduleId,
        groupId: isGroupSchedule ? groupId : null,
        scheduleName: scheduleData.templateName,
        groupName: isGroupSchedule ? scheduleData.groupName : null,
        startDate: scheduleData.startDate,
        endDate: scheduleData.endDate,
        durationDays: scheduleData.durationDays,
        currentDay: scheduleData.currentDay,
        status: scheduleData.status,
        isGroupSchedule: isGroupSchedule,
        completionTasks: scheduleData.completionTasks || { verseText: true, footnotes: false, partner: false }  // Include completion tasks config
      },
      progress: {
        totalReadings: totalReadings,
        completedReadings: completedReadings,
        remainingReadings: totalReadings - completedReadings,
        completionPercentage: completionPercentage
      },
      readings: readingsWithProgress,
      pagination: {
        returned: readingsWithProgress.length,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      }
    };

    console.log(`✅ Successfully retrieved schedule with ${totalReadings} readings (${completedReadings} completed)`);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error getting reading schedule with progress:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function getDayReading(req, res) {
  try {
    const { userId, scheduleId = null, groupId = null, dayNumber = null, date = null } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required field: userId'
      });
    }

    if (!scheduleId && !groupId) {
      return res.status(400).json({
        error: 'Must specify either scheduleId or groupId'
      });
    }

    if (!dayNumber && !date) {
      return res.status(400).json({
        error: 'Must specify either dayNumber or date parameter'
      });
    }

    if (dayNumber && date) {
      return res.status(400).json({
        error: 'Cannot specify both dayNumber and date. Choose one.'
      });
    }

    console.log(`Getting reading for user ${userId} - ${dayNumber ? `day ${dayNumber}` : `date ${date}`}`);

    let scheduleRef;
    let progressCollection;

    // Get schedule reference and verify access
    if (scheduleId) {
      scheduleRef = (db).collection('userReadingSchedules').doc(scheduleId);
      const scheduleDoc = await scheduleRef.get();
      
      if (!scheduleDoc.exists || scheduleDoc.data().userId !== userId) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      progressCollection = scheduleRef.collection('progress');
    } else {
      scheduleRef = (db).collection('groupReadingSchedules').doc(groupId);
      const memberDoc = await scheduleRef.collection('members').doc(userId).get();
      
      if (!memberDoc.exists || memberDoc.data().status !== 'active') {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      progressCollection = scheduleRef
        .collection('progress')
        .doc(userId)
        .collection('dailyProgress');
    }

    let readingSnapshot;
    let searchCriteria;

    // Find reading by day number or date
    if (dayNumber) {
      const dayId = String(parseInt(dayNumber)).padStart(3, '0');
      const readingDoc = await scheduleRef.collection('dailySchedule').doc(dayId).get();
      
      if (!readingDoc.exists) {
        return res.status(404).json({
          error: `No reading found for day ${dayNumber}`,
          searchCriteria: { dayNumber: parseInt(dayNumber) }
        });
      }
      
      readingSnapshot = { docs: [readingDoc] };
      searchCriteria = { dayNumber: parseInt(dayNumber) };
    } else {
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        return res.status(400).json({
          error: 'Invalid date format. Use YYYY-MM-DD format'
        });
      }

      readingSnapshot = await scheduleRef
        .collection('dailySchedule')
        .where('scheduledDate', '==', date)
        .limit(1)
        .get();

      if (readingSnapshot.empty) {
        return res.status(404).json({
          error: `No reading scheduled for ${date}`,
          searchCriteria: { date: date }
        });
      }
      
      searchCriteria = { date: date };
    }

    const readingDoc = readingSnapshot.docs[0];
    const reading = readingDoc.data();
    const dayId = readingDoc.id;

    // Get progress for this day
    const progressDoc = await progressCollection.doc(dayId).get();
    const progressData = progressDoc.exists ? progressDoc.data() : {};

    const readingWithProgress = {
      dayId: dayId,
      dayNumber: reading.dayNumber,
      scheduledDate: reading.scheduledDate,
      dayOfWeek: reading.dayOfWeek,
      startBookName: reading.startBookName,
      startBookId: reading.startBookId,
      endBookName: reading.endBookName,
      endBookId: reading.endBookId,
      portions: reading.portions,
      rawReading: reading.rawReading || null,
      isCompleted: progressData.isCompleted || false,
      completedAt: progressData.completedAt || null,
      notes: progressData.notes || null,
      timeSpentMinutes: progressData.timeSpentMinutes || null
    };

    res.status(200).json({
      message: `Reading for ${dayNumber ? `day ${dayNumber}` : `date ${date}`}`,
      searchCriteria: searchCriteria,
      reading: readingWithProgress
    });

  } catch (error) {
    console.error('Error getting day reading:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getReadingScheduleWithProgress,
  getDayReading
};