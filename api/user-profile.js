const { db } = require('../config/firebase');

async function createUserProfile(req, res) {
  try {
    const {
      uid,                    // Firebase Auth UID (required)
      email,                  // From Firebase Auth (required)
      displayName,            // User's preferred display name
      firstName = null,
      lastName = null,
      dateOfBirth = null,
      phoneNumber = null,
      timezone = "UTC",
      preferredLanguage = "en",
      readingPreferences = {},
      privacy = {},
      profileImageUrl = null
    } = req.body;

    // Validate required fields
    if (!uid || !email) {
      return res.status(400).json({
        error: 'Missing required fields: uid and email are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      });
    }

    // Validate date of birth if provided
    if (dateOfBirth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateOfBirth)) {
        return res.status(400).json({
          error: 'Invalid date of birth format. Use YYYY-MM-DD format'
        });
      }
    }

    console.log(`Creating user profile for ${email} (${uid})`);

    // Check if user profile already exists and is active
    const existingProfile = await db.collection('userProfiles').doc(uid).get();
    if (existingProfile.exists) {
      const profileData = existingProfile.data();
      
      // If profile exists and is active, return conflict
      if (profileData.isActive !== false) {
        return res.status(409).json({
          error: 'User profile already exists',
          profile: {
            uid: uid,
            email: profileData.email,
            displayName: profileData.displayName,
            createdAt: profileData.createdAt
          }
        });
      }
      
      // Profile exists but is inactive (soft deleted) - we can reactivate it
      console.log(`Reactivating inactive profile for ${email} (${uid})`);
    }

    // Set default reading preferences
    const defaultReadingPreferences = {
      reminderTime: "08:00",
      enableReminders: true,
      preferredTranslation: "ESV",
      readingGoal: "daily",
      ...readingPreferences
    };

    // Set default privacy settings
    const defaultPrivacy = {
      profileVisibility: "public",
      showReadingProgress: true,
      allowGroupInvitations: true,
      ...privacy
    };

    // Create user profile data
    const now = new Date().toISOString();
    const userProfileData = {
      uid: uid,
      email: email,
      displayName: displayName || email.split('@')[0], // Default to email prefix
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: dateOfBirth,
      phoneNumber: phoneNumber,
      
      // Preferences
      timezone: timezone,
      preferredLanguage: preferredLanguage,
      readingPreferences: defaultReadingPreferences,
      privacy: defaultPrivacy,
      
      // Profile image
      profileImageUrl: profileImageUrl,
      
      // Account status
      isActive: true,
      emailVerified: false, // Will be updated from Firebase Auth
      lastLoginAt: now,
      
      // Metadata
      createdAt: now,
      updatedAt: now,
      
      // Initialize stats
      stats: {
        totalSchedulesCreated: 0,
        totalGroupsJoined: 0,
        totalReadingsCompleted: 0,
        currentActiveSchedules: 0
      }
    };

    // Create the user profile document
    await db.collection('userProfiles').doc(uid).set(userProfileData);
    
    console.log(`✓ Created user profile for ${email}`);

    // Return success response
    res.status(201).json({
      message: 'User profile created successfully',
      profile: {
        uid: uid,
        email: email,
        displayName: userProfileData.displayName,
        timezone: timezone,
        preferredLanguage: preferredLanguage,
        readingPreferences: defaultReadingPreferences,
        privacy: defaultPrivacy,
        createdAt: now
      }
    });

  } catch (error) {
    console.error('Error creating user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function getUserProfile(req, res) {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        error: 'Missing required parameter: uid'
      });
    }

    console.log(`Getting user profile for ${uid}`);

    // Get user profile document
    const profileDoc = await db.collection('userProfiles').doc(uid).get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({
        error: 'User profile not found'
      });
    }

    const profileData = profileDoc.data();

    // Check if requesting user has permission to view this profile
    // For now, return all data - in production, implement privacy controls
    
    res.status(200).json({
      message: 'User profile retrieved successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function updateUserProfile(req, res) {
  try {
    const { uid } = req.params;
    const updateData = req.body;

    if (!uid) {
      return res.status(400).json({
        error: 'Missing required parameter: uid'
      });
    }

    console.log(`Updating user profile for ${uid}`);

    // Check if user profile exists
    const profileDoc = await db.collection('userProfiles').doc(uid).get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({
        error: 'User profile not found'
      });
    }

    // Get current profile data for merging
    const currentProfile = profileDoc.data();
    
    // Remove fields that shouldn't be updated directly
    const restrictedFields = ['uid', 'email', 'createdAt', 'stats'];
    restrictedFields.forEach(field => delete updateData[field]);

    // Validate date of birth if provided
    if (updateData.dateOfBirth) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(updateData.dateOfBirth)) {
        return res.status(400).json({
          error: 'Invalid date of birth format. Use YYYY-MM-DD format'
        });
      }
    }

    // Handle nested object merging for readingPreferences and privacy
    if (updateData.readingPreferences) {
      updateData.readingPreferences = {
        ...currentProfile.readingPreferences,
        ...updateData.readingPreferences
      };
    }
    
    if (updateData.privacy) {
      updateData.privacy = {
        ...currentProfile.privacy,
        ...updateData.privacy
      };
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    // Update the profile
    await db.collection('userProfiles').doc(uid).update(updateData);
    
    console.log(`✓ Updated user profile for ${uid}`);

    // Get updated profile
    const updatedProfile = await db.collection('userProfiles').doc(uid).get();

    res.status(200).json({
      message: 'User profile updated successfully',
      profile: updatedProfile.data()
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

async function updateUserStats(uid, statsUpdate) {
  try {
    const profileRef = db.collection('userProfiles').doc(uid);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      console.warn(`User profile not found for stats update: ${uid}`);
      return;
    }

    const currentStats = profileDoc.data().stats || {};
    const updatedStats = { ...currentStats, ...statsUpdate };

    await profileRef.update({
      stats: updatedStats,
      updatedAt: new Date().toISOString()
    });

    console.log(`✓ Updated stats for user ${uid}:`, statsUpdate);

  } catch (error) {
    console.error(`Error updating user stats for ${uid}:`, error);
    // Don't throw - stats updates should be non-blocking
  }
}

async function deleteUserProfile(req, res) {
  try {
    const { uid } = req.params;

    if (!uid) {
      return res.status(400).json({
        error: 'Missing required parameter: uid'
      });
    }

    console.log(`Deleting user profile for ${uid}`);

    // Check if user profile exists
    const profileDoc = await db.collection('userProfiles').doc(uid).get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({
        error: 'User profile not found'
      });
    }

    // In production, you might want to:
    // 1. Archive the profile instead of deleting
    // 2. Clean up associated data (schedules, group memberships)
    // 3. Require additional authentication/confirmation

    // For now, soft delete by marking as inactive
    await db.collection('userProfiles').doc(uid).update({
      isActive: false,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log(`✓ Soft deleted user profile for ${uid}`);

    res.status(200).json({
      message: 'User profile deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user profile:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}

module.exports = {
  createUserProfile,
  getUserProfile,
  updateUserProfile,
  updateUserStats,
  deleteUserProfile
};