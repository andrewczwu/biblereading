const { db } = require('../config/firebase');

async function getUserSchedules(req, res) {
  try {
    const { userId } = req.params;
    const { includeInactive = false } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing required parameter: userId'
      });
    }

    console.log(`Getting schedules for user ${userId}`);

    // Get user's individual reading schedules
    let schedulesQuery = db.collection('userReadingSchedules');

    // Filter by userId prefix (schedules are typically named userId_templateId_startDate)
    schedulesQuery = schedulesQuery.where('userId', '==', userId);

    // Filter by status if includeInactive is false
    if (!includeInactive || includeInactive === 'false') {
      schedulesQuery = schedulesQuery.where('status', '==', 'active');
    }

    const schedulesSnapshot = await schedulesQuery.get();

    const individualSchedules = [];
    for (const doc of schedulesSnapshot.docs) {
      const scheduleData = doc.data();
      
      // Calculate progress statistics
      let progressStats = {
        totalReadings: scheduleData.durationDays || 0,
        completedReadings: 0,
        completionPercentage: 0,
        pointsEarned: 0
      };

      try {
        // Get progress data for this schedule
        const progressSnapshot = await db
          .collection('userReadingSchedules')
          .doc(doc.id)
          .collection('progress')
          .get();

        if (!progressSnapshot.empty) {
          const completedDays = progressSnapshot.docs.filter(doc => doc.data().isCompleted).length;
          progressStats.completedReadings = completedDays;
          progressStats.completionPercentage = Math.round((completedDays / progressStats.totalReadings) * 100);
          
          // Calculate points from completion tasks
          let totalPoints = 0;
          progressSnapshot.docs.forEach(progressDoc => {
            const progressData = progressDoc.data();
            if (progressData.completionTasks) {
              // 1 point for each completed task
              if (progressData.completionTasks.verseText) totalPoints += 1;
              if (progressData.completionTasks.footnotes) totalPoints += 1;
              if (progressData.completionTasks.partner) totalPoints += 1;
            } else if (progressData.isCompleted) {
              // Backward compatibility: if only isCompleted exists, assume 1 point for verse text
              totalPoints += 1;
            }
          });
          progressStats.pointsEarned = totalPoints;
        }
      } catch (progressError) {
        console.error(`Error fetching progress for schedule ${doc.id}:`, progressError);
        // Continue without progress stats
      }

      individualSchedules.push({
        scheduleId: doc.id,
        type: 'individual',
        templateId: scheduleData.templateId,
        templateName: scheduleData.templateName,
        startDate: scheduleData.startDate,
        endDate: scheduleData.endDate,
        durationDays: scheduleData.durationDays,
        currentDay: scheduleData.currentDay || 1,
        status: scheduleData.status,
        createdAt: scheduleData.createdAt,
        progress: progressStats
      });
    }

    // Get user's group memberships
    const groupMemberships = [];
    
    // Query all group schedules where user is a member
    const allGroupsSnapshot = await db.collection('groupReadingSchedules').get();
    
    for (const groupDoc of allGroupsSnapshot.docs) {
      const memberDoc = await db
        .collection('groupReadingSchedules')
        .doc(groupDoc.id)
        .collection('members')
        .doc(userId)
        .get();

      if (memberDoc.exists) {
        const memberData = memberDoc.data();
        const groupData = groupDoc.data();

        // Skip inactive memberships if requested
        if (!includeInactive && memberData.status !== 'active') {
          continue;
        }

        // Calculate group progress for this user
        let groupProgress = {
          totalReadings: groupData.durationDays || 0,
          completedReadings: memberData.completedDays || 0,
          completionPercentage: 0,
          pointsEarned: 0
        };

        if (groupProgress.totalReadings > 0) {
          groupProgress.completionPercentage = Math.round(
            (groupProgress.completedReadings / groupProgress.totalReadings) * 100
          );
        }

        // Calculate points from group progress
        try {
          const groupProgressSnapshot = await db
            .collection('groupReadingSchedules')
            .doc(groupDoc.id)
            .collection('progress')
            .doc(userId)
            .collection('dailyProgress')
            .get();

          if (!groupProgressSnapshot.empty) {
            let totalPoints = 0;
            groupProgressSnapshot.docs.forEach(progressDoc => {
              const progressData = progressDoc.data();
              if (progressData.completionTasks) {
                // 1 point for each completed task
                if (progressData.completionTasks.verseText) totalPoints += 1;
                if (progressData.completionTasks.footnotes) totalPoints += 1;
                if (progressData.completionTasks.partner) totalPoints += 1;
              } else if (progressData.isCompleted) {
                // Backward compatibility: if only isCompleted exists, assume 1 point for verse text
                totalPoints += 1;
              }
            });
            groupProgress.pointsEarned = totalPoints;
          }
        } catch (pointsError) {
          console.error(`Error calculating points for group ${groupDoc.id}:`, pointsError);
          // Continue without points
        }

        // Count active members dynamically to ensure accuracy
        let actualMemberCount = 0;
        try {
          const activeMembersSnapshot = await db
            .collection('groupReadingSchedules')
            .doc(groupDoc.id)
            .collection('members')
            .where('status', '==', 'active')
            .get();
          actualMemberCount = activeMembersSnapshot.size;
        } catch (countError) {
          console.error(`Error counting members for group ${groupDoc.id}:`, countError);
          // Fallback to 0 if there's an error counting
          actualMemberCount = 0;
        }

        groupMemberships.push({
          groupId: groupDoc.id,
          type: 'group',
          groupName: groupData.groupName,
          templateId: groupData.templateId,
          templateName: groupData.templateName,
          startDate: groupData.startDate,
          endDate: groupData.endDate,
          durationDays: groupData.durationDays,
          currentDay: groupData.currentDay || 1,
          status: groupData.status,
          memberRole: memberData.role,
          memberStatus: memberData.status,
          joinedAt: memberData.joinedAt,
          memberCount: actualMemberCount,
          isPublic: groupData.isPublic,
          progress: groupProgress
        });
      }
    }

    console.log(`✓ Found ${individualSchedules.length} individual schedules and ${groupMemberships.length} group memberships for user ${userId}`);

    res.status(200).json({
      message: 'User schedules retrieved successfully',
      userId: userId,
      summary: {
        totalSchedules: individualSchedules.length + groupMemberships.length,
        individualSchedules: individualSchedules.length,
        groupMemberships: groupMemberships.length,
        activeSchedules: [...individualSchedules, ...groupMemberships].filter(s => s.status === 'active').length
      },
      individualSchedules: individualSchedules,
      groupMemberships: groupMemberships,
      allSchedules: [...individualSchedules, ...groupMemberships].sort((a, b) => {
        // Sort by creation/join date, most recent first
        const dateA = new Date(a.createdAt || a.joinedAt);
        const dateB = new Date(b.createdAt || b.joinedAt);
        return dateB.getTime() - dateA.getTime();
      })
    });

  } catch (error) {
    console.error('Error getting user schedules:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getUserSchedules
};