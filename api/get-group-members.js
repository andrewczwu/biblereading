const { db } = require('../config/firebase');

async function getGroupMembers(req, res) {
  try {
    const { groupId } = req.params;
    const { includeInactive = false } = req.query;

    if (!groupId) {
      return res.status(400).json({
        error: 'Missing required parameter: groupId'
      });
    }

    console.log(`Getting members for group ${groupId}`);

    // Step 1: Check if group exists
    const groupDoc = await db.collection('groupReadingSchedules').doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({
        error: 'Group reading schedule not found'
      });
    }

    const groupData = groupDoc.data();
    console.log(`✓ Found group: ${groupData.groupName}`);

    // Step 2: Get all members (or just active ones)
    let membersQuery = db
      .collection('groupReadingSchedules')
      .doc(groupId)
      .collection('members');

    // Filter by status if includeInactive is false
    if (!includeInactive || includeInactive === 'false') {
      membersQuery = membersQuery.where('status', '==', 'active');
    }

    const membersSnapshot = await membersQuery.get();

    if (membersSnapshot.empty) {
      return res.status(200).json({
        message: 'No members found for this group',
        group: {
          groupId: groupData.groupId,
          groupName: groupData.groupName,
          templateName: groupData.templateName,
          memberCount: groupData.memberCount || 0
        },
        members: []
      });
    }

    // Step 3: Get user profile information for each member
    const memberPromises = membersSnapshot.docs.map(async (memberDoc) => {
      const memberData = memberDoc.data();
      
      try {
        // Get user profile information
        const userProfileDoc = await db.collection('userProfiles').doc(memberData.userId).get();
        let userProfile = null;
        
        if (userProfileDoc.exists) {
          const profileData = userProfileDoc.data();
          userProfile = {
            displayName: profileData.displayName,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            timezone: profileData.timezone,
            preferredLanguage: profileData.preferredLanguage
          };
        }

        return {
          userId: memberData.userId,
          userName: memberData.userName,
          email: memberData.email,
          role: memberData.role,
          status: memberData.status,
          joinedAt: memberData.joinedAt,
          leftAt: memberData.leftAt || null,
          currentDay: memberData.currentDay,
          completedDays: memberData.completedDays,
          lastActiveAt: memberData.lastActiveAt,
          userProfile: userProfile
        };
      } catch (error) {
        console.error(`Error fetching profile for user ${memberData.userId}:`, error);
        // Return member data without profile info if profile fetch fails
        return {
          userId: memberData.userId,
          userName: memberData.userName,
          email: memberData.email,
          role: memberData.role,
          status: memberData.status,
          joinedAt: memberData.joinedAt,
          leftAt: memberData.leftAt || null,
          currentDay: memberData.currentDay,
          completedDays: memberData.completedDays,
          lastActiveAt: memberData.lastActiveAt,
          userProfile: null
        };
      }
    });

    const members = await Promise.all(memberPromises);

    // Step 4: Sort members (admins first, then by join date)
    members.sort((a, b) => {
      // Admins first
      if (a.role === 'admin' && b.role !== 'admin') return -1;
      if (a.role !== 'admin' && b.role === 'admin') return 1;
      
      // Then by join date (earliest first)
      return new Date(a.joinedAt) - new Date(b.joinedAt);
    });

    console.log(`✓ Retrieved ${members.length} members for group ${groupId}`);

    res.status(200).json({
      message: 'Group members retrieved successfully',
      group: {
        groupId: groupData.groupId,
        groupName: groupData.groupName,
        templateName: groupData.templateName,
        startDate: groupData.startDate,
        endDate: groupData.endDate,
        currentDay: groupData.currentDay,
        status: groupData.status,
        memberCount: groupData.memberCount || 0,
        createdBy: groupData.createdBy,
        isPublic: groupData.isPublic,
        maxMembers: groupData.maxMembers
      },
      members: members,
      totalMembers: members.length,
      activeMembers: members.filter(member => member.status === 'active').length,
      admins: members.filter(member => member.role === 'admin').length
    });

  } catch (error) {
    console.error('Error getting group members:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  getGroupMembers
};