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

// Helper function to get current member count dynamically
async function getCurrentMemberCount(groupId) {
  const membersSnapshot = await (await getDb())
    .collection('groupReadingSchedules')
    .doc(groupId)
    .collection('members')
    .where('status', '==', 'active')
    .get();
  return membersSnapshot.size;
}

async function joinGroupReadingSchedule(req, res) {
  try {
    const { userId, groupId, userName = null, email = null } = req.body;

    if (!userId || !groupId) {
      return res.status(400).json({
        error: 'Missing required fields: userId and groupId are required'
      });
    }

    console.log(`User ${userId} attempting to join group ${groupId}`);

    // Step 1: Check if group exists and is active
    const groupDoc = await (await getDb()).collection('groupReadingSchedules').doc(groupId).get();
    if (!groupDoc.exists) {
      return res.status(404).json({
        error: 'Group reading schedule not found'
      });
    }

    const groupData = groupDoc.data();
    
    if (groupData.status !== 'active') {
      return res.status(400).json({
        error: `Cannot join group. Group status is: ${groupData.status}`
      });
    }

    console.log(`✓ Found active group: ${groupData.groupName}`);

    // Step 2: Check if user is already a member
    const existingMember = await db
      .collection('groupReadingSchedules')
      .doc(groupId)
      .collection('members')
      .doc(userId)
      .get();

    if (existingMember.exists) {
      const memberData = existingMember.data();
      if (memberData.status === 'active') {
        return res.status(409).json({
          error: 'User is already an active member of this group',
          memberInfo: {
            joinedAt: memberData.joinedAt,
            role: memberData.role,
            currentDay: memberData.currentDay,
            completedDays: memberData.completedDays
          }
        });
      } else {
        // Reactivate inactive member
        await db
          .collection('groupReadingSchedules')
          .doc(groupId)
          .collection('members')
          .doc(userId)
          .update({
            status: 'active',
            lastActiveAt: new Date().toISOString()
          });

        console.log(`✓ Reactivated inactive member ${userId}`);

        return res.status(200).json({
          message: 'Successfully rejoined group reading schedule',
          group: {
            groupId: groupData.groupId,
            groupName: groupData.groupName,
            templateName: groupData.templateName,
            startDate: groupData.startDate,
            endDate: groupData.endDate,
            currentDay: groupData.currentDay,
            memberRole: memberData.role
          }
        });
      }
    }

    // Step 3: Check member limit
    if (groupData.maxMembers) {
      // Count current active members dynamically
      const currentMembersSnapshot = await db
        .collection('groupReadingSchedules')
        .doc(groupId)
        .collection('members')
        .where('status', '==', 'active')
        .get();
      
      if (currentMembersSnapshot.size >= groupData.maxMembers) {
        return res.status(400).json({
          error: `Group is full. Maximum members: ${groupData.maxMembers}`
        });
      }
    }

    // Step 4: Calculate user's starting progress based on group's current day
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(groupData.startDate);
    const todayDate = new Date(today);
    
    let currentDay = 1;
    if (todayDate >= startDate) {
      const daysDiff = Math.floor((todayDate - startDate) / (1000 * 60 * 60 * 24));
      currentDay = Math.min(daysDiff + 1, groupData.durationDays);
    }

    // Step 5: Add user as member
    const memberData = {
      userId: userId,
      userName: userName,
      email: email,
      joinedAt: new Date().toISOString(),
      role: 'member',
      status: 'active',
      currentDay: currentDay,
      completedDays: 0, // They start with 0 completed days
      lastActiveAt: new Date().toISOString()
    };

    await db
      .collection('groupReadingSchedules')
      .doc(groupId)
      .collection('members')
      .doc(userId)
      .set(memberData);

    console.log(`✓ Added ${userId} as group member`);

    // Step 6: Update group timestamp
    await (await getDb()).collection('groupReadingSchedules').doc(groupId).update({
      updatedAt: new Date().toISOString()
    });

    console.log(`✓ User joined group successfully`);

    // Step 7: Initialize user's progress tracking (optional - create first few days)
    const batch = (await getDb()).batch();
    const progressCollection = db
      .collection('groupReadingSchedules')
      .doc(groupId)
      .collection('progress')
      .doc(userId)
      .collection('dailyProgress');

    // Initialize progress for days 1 through current day (all incomplete)
    for (let day = 1; day <= currentDay; day++) {
      const dayId = String(day).padStart(3, '0');
      const dayDate = new Date(startDate);
      dayDate.setDate(dayDate.getDate() + day - 1);
      
      const progressRef = progressCollection.doc(dayId);
      batch.set(progressRef, {
        dayNumber: day,
        scheduledDate: dayDate.toISOString().split('T')[0],
        isCompleted: false,
        completedAt: null,
        notes: null,
        timeSpentMinutes: null
      });
    }

    await batch.commit();
    console.log(`✓ Initialized progress tracking for ${currentDay} days`);

    res.status(200).json({
      message: 'Successfully joined group reading schedule',
      group: {
        groupId: groupData.groupId,
        groupName: groupData.groupName,
        templateName: groupData.templateName,
        startDate: groupData.startDate,
        endDate: groupData.endDate,
        durationDays: groupData.durationDays,
        currentDay: currentDay,
        memberRole: 'member',
        totalMembers: await getCurrentMemberCount(groupId)
      }
    });

  } catch (error) {
    console.error('Error joining group reading schedule:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function leaveGroupReadingSchedule(req, res) {
  try {
    const { userId, groupId } = req.body;

    if (!userId || !groupId) {
      return res.status(400).json({
        error: 'Missing required fields: userId and groupId are required'
      });
    }

    console.log(`User ${userId} attempting to leave group ${groupId}`);

    // Check if user is a member
    const memberDoc = await db
      .collection('groupReadingSchedules')
      .doc(groupId)
      .collection('members')
      .doc(userId)
      .get();

    if (!memberDoc.exists) {
      return res.status(404).json({
        error: 'User is not a member of this group'
      });
    }

    const memberData = memberDoc.data();
    
    // Check if user is the only admin
    if (memberData.role === 'admin') {
      const adminSnapshot = await db
        .collection('groupReadingSchedules')
        .doc(groupId)
        .collection('members')
        .where('role', '==', 'admin')
        .where('status', '==', 'active')
        .get();

      if (adminSnapshot.size === 1) {
        return res.status(400).json({
          error: 'Cannot leave group. You are the only admin. Please assign another admin first or delete the group.'
        });
      }
    }

    // Set member status to inactive instead of deleting
    await db
      .collection('groupReadingSchedules')
      .doc(groupId)
      .collection('members')
      .doc(userId)
      .update({
        status: 'inactive',
        leftAt: new Date().toISOString()
      });

    // Update group member count
    const groupDoc = await (await getDb()).collection('groupReadingSchedules').doc(groupId).get();
    if (groupDoc.exists) {
      await (await getDb()).collection('groupReadingSchedules').doc(groupId).update({
        updatedAt: new Date().toISOString()
      });
    }

    res.status(200).json({
      message: 'Successfully left group reading schedule'
    });

  } catch (error) {
    console.error('Error leaving group reading schedule:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  joinGroupReadingSchedule,
  leaveGroupReadingSchedule
};