const { db } = require('../config/firebase');

async function getScheduleInfo(req, res) {
  try {
    const { scheduleId = null, groupId = null } = req.query;

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

    console.log(`Getting schedule info for ${scheduleId ? 'individual' : 'group'} schedule`);

    let scheduleRef;
    let scheduleData;
    let isGroupSchedule = false;

    // Determine if this is an individual or group schedule
    if (scheduleId) {
      // Individual schedule
      console.log(`Processing individual schedule: ${scheduleId}`);
      
      scheduleRef = db.collection('userReadingSchedules').doc(scheduleId);
      const scheduleDoc = await scheduleRef.get();
      
      if (!scheduleDoc.exists) {
        return res.status(404).json({
          error: 'Individual reading schedule not found'
        });
      }

      scheduleData = scheduleDoc.data();
      
    } else {
      // Group schedule
      console.log(`Processing group schedule: ${groupId}`);
      isGroupSchedule = true;
      
      scheduleRef = db.collection('groupReadingSchedules').doc(groupId);
      const groupDoc = await scheduleRef.get();
      
      if (!groupDoc.exists) {
        return res.status(404).json({
          error: 'Group reading schedule not found'
        });
      }

      scheduleData = groupDoc.data();
    }

    // Get daily schedule (the actual reading assignments) - this is static data
    const dailyScheduleSnapshot = await scheduleRef.collection('dailySchedule').get();
    
    if (dailyScheduleSnapshot.empty) {
      return res.status(404).json({
        error: 'No daily readings found for this schedule'
      });
    }

    console.log(`✓ Found ${dailyScheduleSnapshot.size} daily readings`);

    // Combine daily schedule data (no progress included)
    const readings = [];
    
    // Sort daily readings by day number
    const sortedDailyReadings = dailyScheduleSnapshot.docs.sort((a, b) => {
      const dayA = parseInt(a.id);
      const dayB = parseInt(b.id);
      return dayA - dayB;
    });

    for (const dailyDoc of sortedDailyReadings) {
      const dailyData = dailyDoc.data();
      
      const reading = {
        dayId: dailyDoc.id,
        dayNumber: dailyData.dayNumber,
        scheduledDate: dailyData.scheduledDate,
        dayOfWeek: dailyData.dayOfWeek,
        
        // Reading content
        startBookName: dailyData.startBookName,
        startBookId: dailyData.startBookId,
        endBookName: dailyData.endBookName,
        endBookId: dailyData.endBookId,
        portions: dailyData.portions
      };

      // Include raw reading if available
      if (dailyData.rawReading) {
        reading.rawReading = dailyData.rawReading;
      }

      readings.push(reading);
    }

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
        completionTasks: scheduleData.completionTasks || { verseText: true, footnotes: false, partner: false },
        createdAt: scheduleData.createdAt,
        updatedAt: scheduleData.updatedAt
      },
      readings: readings
    };

    console.log(`✅ Successfully retrieved schedule info with ${readings.length} readings`);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error getting schedule info:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getScheduleInfo
};