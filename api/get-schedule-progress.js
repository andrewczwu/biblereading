const { db } = require('../config/firebase');

async function getScheduleProgress(req, res) {
  try {
    const { userId, scheduleId = null, groupId = null } = req.query;

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

    console.log(`Getting progress for user ${userId}`);

    let scheduleRef;
    let progressCollection;
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

      const scheduleData = scheduleDoc.data();
      
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
      
      scheduleRef = db.collection('groupReadingSchedules').doc(groupId);
      const groupDoc = await scheduleRef.get();
      
      if (!groupDoc.exists) {
        return res.status(404).json({
          error: 'Group reading schedule not found'
        });
      }

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

    // Get all progress data for this user
    const progressSnapshot = await progressCollection.get();
    
    // Create a map of progress data by day ID for quick lookup
    const progressMap = new Map();
    progressSnapshot.docs.forEach(doc => {
      const progressData = doc.data();
      progressMap.set(doc.id, {
        dayNumber: progressData.dayNumber,
        isCompleted: progressData.isCompleted || false,
        completionTasks: progressData.completionTasks || null,
        completedAt: progressData.completedAt || null,
        notes: progressData.notes || null,
        timeSpentMinutes: progressData.timeSpentMinutes || null,
        scheduledDate: progressData.scheduledDate,
        updatedAt: progressData.updatedAt || null
      });
    });

    console.log(`✓ Found ${progressSnapshot.size} progress records`);

    // Calculate summary statistics
    const progressArray = Array.from(progressMap.values());
    const completedReadings = progressArray.filter(p => p.isCompleted).length;
    
    // Calculate points from completion tasks
    let totalPoints = 0;
    progressArray.forEach(progress => {
      if (progress.completionTasks) {
        // 1 point for each completed task
        if (progress.completionTasks.verseText) totalPoints += 1;
        if (progress.completionTasks.footnotes) totalPoints += 1;
        if (progress.completionTasks.partner) totalPoints += 1;
      } else if (progress.isCompleted) {
        // Backward compatibility: if only isCompleted exists, assume 1 point for verse text
        totalPoints += 1;
      }
    });

    // Prepare response data
    const responseData = {
      userId: userId,
      scheduleId: isGroupSchedule ? null : scheduleId,
      groupId: isGroupSchedule ? groupId : null,
      isGroupSchedule: isGroupSchedule,
      progress: {
        totalProgressRecords: progressSnapshot.size,
        completedReadings: completedReadings,
        pointsEarned: totalPoints,
        lastUpdated: new Date().toISOString()
      },
      dailyProgress: Object.fromEntries(progressMap)
    };

    console.log(`✅ Successfully retrieved progress data with ${completedReadings} completed readings and ${totalPoints} points`);

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Error getting schedule progress:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getScheduleProgress
};