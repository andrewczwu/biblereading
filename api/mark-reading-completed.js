const { ensureFirebaseInitialized } = require('../config/firebase');

// Lazy initialization of db
let db = null;
async function getDb() {
  if (!db) {
    await ensureFirebaseInitialized();
    const firebaseConfig = require('../config/firebase');
    db = firebaseConfig.db;
  }
  return db;
}

async function markReadingCompleted(req, res) {
  try {
    const { 
      userId, 
      scheduleId, 
      groupId = null, 
      dayNumber, 
      isCompleted,  // For backward compatibility
      completionTasks = null,  // New: object with {verseText: bool, footnotes: bool, partner: bool}
      notes = null, 
      timeSpentMinutes = null 
    } = req.body;

    // Validate required fields
    if (!userId || !dayNumber) {
      return res.status(400).json({
        error: 'Missing required fields: userId and dayNumber are required'
      });
    }

    // Support both old (isCompleted) and new (completionTasks) formats
    if (typeof isCompleted !== 'boolean' && !completionTasks) {
      return res.status(400).json({
        error: 'Must provide either isCompleted (boolean) or completionTasks object'
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

    // Handle backward compatibility and determine completion status
    let overallCompleted = false;
    let tasksCompleted = null;
    
    if (completionTasks) {
      // New format with multiple tasks
      tasksCompleted = { ...completionTasks };
      
      // If verse text is not checked, automatically uncheck footnotes and partner
      if (!completionTasks.verseText) {
        tasksCompleted.footnotes = false;
        tasksCompleted.partner = false;
      }
      
      // Consider it complete only if verse text is marked as done
      overallCompleted = tasksCompleted.verseText || false;
    } else {
      // Old format - convert to new format assuming only verse text
      overallCompleted = isCompleted;
      tasksCompleted = {
        verseText: isCompleted,
        footnotes: false,
        partner: false
      };
    }

    console.log(`Marking day ${dayNumber} with completion tasks for user ${userId}`);

    const dayId = String(dayNumber).padStart(3, '0');
    let progressRef;
    let scheduleRef;
    let scheduleName;

    // Determine if this is an individual or group schedule
    if (scheduleId) {
      // Individual schedule
      console.log(`Processing individual schedule: ${scheduleId}`);
      
      // Verify individual schedule exists
      scheduleRef = (await getDb()).collection('userReadingSchedules').doc(scheduleId);
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

      scheduleName = scheduleData.templateName;
      
      // Get the daily schedule to verify day exists
      const dailyScheduleDoc = await scheduleRef
        .collection('dailySchedule')
        .doc(dayId)
        .get();

      if (!dailyScheduleDoc.exists) {
        return res.status(404).json({
          error: `Day ${dayNumber} not found in this reading schedule`
        });
      }

      const dailyData = dailyScheduleDoc.data();
      
      // Reference to progress document
      progressRef = scheduleRef.collection('progress').doc(dayId);

    } else {
      // Group schedule
      console.log(`Processing group schedule: ${groupId}`);
      
      // Verify group schedule exists
      scheduleRef = (await getDb()).collection('groupReadingSchedules').doc(groupId);
      const groupDoc = await scheduleRef.get();
      
      if (!groupDoc.exists) {
        return res.status(404).json({
          error: 'Group reading schedule not found'
        });
      }

      const groupData = groupDoc.data();
      scheduleName = groupData.templateName;

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

      // Get the daily schedule to verify day exists
      const dailyScheduleDoc = await scheduleRef
        .collection('dailySchedule')
        .doc(dayId)
        .get();

      if (!dailyScheduleDoc.exists) {
        return res.status(404).json({
          error: `Day ${dayNumber} not found in this group reading schedule`
        });
      }

      const dailyData = dailyScheduleDoc.data();
      
      // Reference to user's progress document within the group
      progressRef = scheduleRef
        .collection('progress')
        .doc(userId)
        .collection('dailyProgress')
        .doc(dayId);
    }

    // Prepare progress data
    const now = new Date().toISOString();
    const progressData = {
      dayNumber: dayNumber,
      isCompleted: overallCompleted,  // For backward compatibility
      completionTasks: tasksCompleted,  // New detailed completion tracking
      updatedAt: now
    };

    if (overallCompleted) {
      progressData.completedAt = now;
      if (notes) progressData.notes = notes;
      if (timeSpentMinutes) progressData.timeSpentMinutes = timeSpentMinutes;
    } else {
      // If marking as incomplete, clear completion data
      progressData.completedAt = null;
      progressData.notes = null;
      progressData.timeSpentMinutes = null;
    }

    // Get existing progress to preserve scheduledDate
    const existingProgress = await progressRef.get();
    if (existingProgress.exists) {
      const existingData = existingProgress.data();
      progressData.scheduledDate = existingData.scheduledDate;
    } else {
      // If no existing progress, get scheduled date from daily schedule
      const dailyScheduleDoc = await scheduleRef
        .collection('dailySchedule')
        .doc(dayId)
        .get();
      
      if (dailyScheduleDoc.exists) {
        progressData.scheduledDate = dailyScheduleDoc.data().scheduledDate;
      }
    }

    // Save progress
    await progressRef.set(progressData, { merge: true });
    
    console.log(`✓ Updated progress for day ${dayNumber}`);

    // Update user's overall progress counters
    if (scheduleId) {
      // Individual schedule - update currentDay and completedDays count
      await updateIndividualScheduleProgress(scheduleRef, userId, dayNumber, overallCompleted);
    } else {
      // Group schedule - update member's progress counters
      await updateGroupMemberProgress(scheduleRef, userId, dayNumber, overallCompleted);
    }

    res.status(200).json({
      message: `Successfully updated day ${dayNumber} progress`,
      progress: {
        dayNumber: dayNumber,
        isCompleted: overallCompleted,  // For backward compatibility
        completionTasks: tasksCompleted,  // New detailed tracking
        completedAt: progressData.completedAt,
        notes: progressData.notes,
        timeSpentMinutes: progressData.timeSpentMinutes,
        scheduleName: scheduleName
      }
    });

  } catch (error) {
    console.error('Error marking reading completed:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function updateIndividualScheduleProgress(scheduleRef, userId, dayNumber, isCompleted) {
  try {
    // Get current schedule data
    const scheduleDoc = await scheduleRef.get();
    const scheduleData = scheduleDoc.data();

    // Count completed days
    const progressSnapshot = await scheduleRef
      .collection('progress')
      .where('isCompleted', '==', true)
      .get();

    const completedDays = progressSnapshot.size;
    const currentDay = Math.max(dayNumber, scheduleData.currentDay || 1);

    // Update schedule progress
    await scheduleRef.update({
      currentDay: currentDay,
      completedDays: completedDays,
      updatedAt: new Date().toISOString()
    });

    console.log(`✓ Updated individual schedule progress: currentDay=${currentDay}, completedDays=${completedDays}`);

  } catch (error) {
    console.error('Error updating individual schedule progress:', error);
    // Don't throw - this is supplementary data
  }
}

async function updateGroupMemberProgress(groupRef, userId, dayNumber, isCompleted) {
  try {
    // Count user's completed days in this group
    const progressSnapshot = await groupRef
      .collection('progress')
      .doc(userId)
      .collection('dailyProgress')
      .where('isCompleted', '==', true)
      .get();

    const completedDays = progressSnapshot.size;

    // Get current member data
    const memberDoc = await groupRef.collection('members').doc(userId).get();
    const memberData = memberDoc.data();
    
    const currentDay = Math.max(dayNumber, memberData.currentDay || 1);

    // Update member progress
    await groupRef.collection('members').doc(userId).update({
      currentDay: currentDay,
      completedDays: completedDays,
      lastActiveAt: new Date().toISOString()
    });

    console.log(`✓ Updated group member progress: currentDay=${currentDay}, completedDays=${completedDays}`);

  } catch (error) {
    console.error('Error updating group member progress:', error);
    // Don't throw - this is supplementary data
  }
}

module.exports = {
  markReadingCompleted
};