const { db } = require('../config/firebase');


async function getAvailableGroups(req, res) {
  try {
    console.log('Getting available public groups');

    // Query for public group reading schedules that are active
    const groupsSnapshot = await (db)
      .collection('groupReadingSchedules')
      .where('isPublic', '==', true)
      .where('status', '==', 'active')
      .get();

    if (groupsSnapshot.empty) {
      return res.status(200).json({
        message: 'No public groups available',
        groups: []
      });
    }

    console.log(`✓ Found ${groupsSnapshot.size} public groups`);

    const groups = [];
    for (const doc of groupsSnapshot.docs) {
      const groupData = doc.data();
      
      // Get current member count
      let memberCount = 0;
      try {
        const membersSnapshot = await (db)
          .collection('groupReadingSchedules')
          .doc(doc.id)
          .collection('members')
          .where('status', '==', 'active')
          .get();
        memberCount = membersSnapshot.size;
      } catch (countError) {
        console.error(`Error counting members for group ${doc.id}:`, countError);
      }

      // Check if group has reached max capacity
      const isFull = groupData.maxMembers && memberCount >= groupData.maxMembers;

      groups.push({
        groupId: doc.id,
        groupName: groupData.groupName,
        templateId: groupData.templateId,
        templateName: groupData.templateName,
        startDate: groupData.startDate,
        endDate: groupData.endDate,
        durationDays: groupData.durationDays,
        currentDay: groupData.currentDay || 1,
        status: groupData.status,
        createdBy: groupData.createdBy,
        createdAt: groupData.createdAt,
        isPublic: groupData.isPublic,
        maxMembers: groupData.maxMembers,
        memberCount: memberCount,
        isFull: isFull,
        completionTasks: groupData.completionTasks || { verseText: true, footnotes: false, partner: false }
      });
    }

    // Sort by creation date, newest first
    groups.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    console.log(`✅ Successfully retrieved ${groups.length} available groups`);

    res.status(200).json({
      message: 'Available groups retrieved successfully',
      groups: groups,
      total: groups.length
    });

  } catch (error) {
    console.error('Error getting available groups:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getAvailableGroups
};