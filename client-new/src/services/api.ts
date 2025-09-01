import axios from 'axios';
import { cacheUtils } from '../utils/cache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User Profile API
export const userProfileAPI = {
  create: async (profileData: any) => {
    const response = await api.post('/user-profile', profileData);
    return response.data;
  },

  get: async (uid: string) => {
    console.log('API - Making request to get user profile for uid:', uid);
    console.log('API - Base URL:', API_BASE_URL);
    const response = await api.get(`/user-profile/${uid}`);
    console.log('API - User profile response:', response.data);
    return response.data;
  },

  update: async (uid: string, profileData: any) => {
    const response = await api.put(`/user-profile/${uid}`, profileData);
    return response.data;
  },

  delete: async (uid: string) => {
    const response = await api.delete(`/user-profile/${uid}`);
    return response.data;
  },
};

// User Schedules API
export const userSchedulesAPI = {
  get: async (userId: string, includeInactive: boolean = false) => {
    // Check cache first
    const cacheKey = `${userId}_${includeInactive}`;
    const cached = cacheUtils.getCachedUserSchedules(cacheKey);
    if (cached) {
      console.log('Using cached user schedules');
      return cached;
    }

    // Fetch from API if not cached
    const response = await api.get(`/user-schedules/${userId}`, {
      params: { includeInactive }
    });
    
    // Cache the response
    cacheUtils.cacheUserSchedules(response.data, cacheKey);
    
    return response.data;
  },
};

// Individual Reading Schedule API
export const individualScheduleAPI = {
  create: async (scheduleData: { 
    userId: string; 
    templateId: string; 
    startDate: string;
    completionTasks?: {
      verseText: boolean;
      footnotes: boolean;
      partner: boolean;
    };
  }) => {
    const response = await api.post('/create-reading-schedule', scheduleData);
    
    // Invalidate user schedules cache after creating new schedule
    cacheUtils.invalidateUserSchedules(`${scheduleData.userId}_false`);
    cacheUtils.invalidateUserSchedules(`${scheduleData.userId}_true`);
    
    return response.data;
  },
};

// Group Reading Schedule API
export const groupScheduleAPI = {
  create: async (groupData: { 
    groupName: string; 
    templateId: string; 
    startDate: string; 
    createdBy: string;
    isPublic?: boolean;
    maxMembers?: number;
    customGroupId?: string;
    completionTasks?: {
      verseText: boolean;
      footnotes: boolean;
      partner: boolean;
    };
  }) => {
    const response = await api.post('/create-group-reading-schedule', groupData);
    
    // Invalidate user schedules cache after creating new group
    cacheUtils.invalidateUserSchedules(`${groupData.createdBy}_false`);
    cacheUtils.invalidateUserSchedules(`${groupData.createdBy}_true`);
    
    return response.data;
  },

  join: async (joinData: { userId: string; groupId: string; userName?: string; email?: string }) => {
    const response = await api.post('/join-group-reading-schedule', joinData);
    
    // Invalidate user schedules cache after joining group
    cacheUtils.invalidateUserSchedules(`${joinData.userId}_false`);
    cacheUtils.invalidateUserSchedules(`${joinData.userId}_true`);
    
    return response.data;
  },

  leave: async (leaveData: { userId: string; groupId: string }) => {
    const response = await api.post('/leave-group-reading-schedule', leaveData);
    
    // Invalidate user schedules cache after leaving group
    cacheUtils.invalidateUserSchedules(`${leaveData.userId}_false`);
    cacheUtils.invalidateUserSchedules(`${leaveData.userId}_true`);
    
    return response.data;
  },

  getMembers: async (groupId: string, includeInactive: boolean = false) => {
    const response = await api.get(`/group-members/${groupId}`, {
      params: { includeInactive }
    });
    return response.data;
  },

  getAvailableGroups: async () => {
    const response = await api.get('/available-groups');
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  markCompleted: async (progressData: { 
    userId: string; 
    dayNumber: number; 
    isCompleted?: boolean;  // For backward compatibility
    completionTasks?: {     // New: multiple completion tasks
      verseText: boolean;
      footnotes: boolean;
      partner: boolean;
    };
    scheduleId?: string;
    groupId?: string;
    notes?: string;
    timeSpentMinutes?: number;
  }) => {
    const response = await api.post('/mark-reading-completed', progressData);
    
    // Invalidate relevant caches after marking progress
    cacheUtils.invalidateSchedule(progressData.userId, progressData.scheduleId, progressData.groupId);
    cacheUtils.invalidateProgress(progressData.userId, progressData.scheduleId, progressData.groupId);
    // Also invalidate user schedules cache as progress affects the dashboard
    cacheUtils.invalidateUserSchedules(`${progressData.userId}_false`);
    cacheUtils.invalidateUserSchedules(`${progressData.userId}_true`);
    
    return response.data;
  },

  getScheduleWithProgress: async (params: { 
    userId: string; 
    limit?: number;
    offset?: number;
    scheduleId?: string;
    groupId?: string;
  }) => {
    // Check cache first (only cache if no pagination)
    if (!params.limit && !params.offset) {
      const cached = cacheUtils.getCachedSchedule(params.userId, params.scheduleId, params.groupId);
      if (cached) {
        console.log('Using cached schedule with progress');
        return cached;
      }
    }

    // Fetch from API
    const response = await api.get('/get-reading-schedule-with-progress', { params });
    
    // Cache the response if not paginated
    if (!params.limit && !params.offset) {
      cacheUtils.cacheSchedule(response.data, params.userId, params.scheduleId, params.groupId);
    }
    
    return response.data;
  },

  // New separated endpoints for better caching
  getScheduleInfo: async (params: {
    scheduleId?: string;
    groupId?: string;
  }) => {
    // Check cache first - schedule info rarely changes
    const cacheKey = `schedule_info_${params.scheduleId || params.groupId}`;
    const cached = cacheUtils.getCachedScheduleInfo(cacheKey);
    if (cached) {
      console.log('Using cached schedule info');
      return cached;
    }

    // Fetch from API
    const response = await api.get('/get-schedule-info', { params });
    
    // Cache for 24 hours (schedule info rarely changes)
    cacheUtils.cacheScheduleInfo(response.data, cacheKey);
    
    return response.data;
  },

  getScheduleProgress: async (params: {
    userId: string;
    scheduleId?: string;
    groupId?: string;
  }) => {
    // Check cache first - progress changes more frequently, shorter cache
    const cacheKey = `progress_${params.userId}_${params.scheduleId || params.groupId}`;
    const cached = cacheUtils.getCachedProgress(cacheKey);
    if (cached) {
      console.log('Using cached progress');
      return cached;
    }

    // Fetch from API
    const response = await api.get('/get-schedule-progress', { params });
    
    // Cache for 30 minutes (progress changes more frequently)
    cacheUtils.cacheProgress(response.data, cacheKey);
    
    return response.data;
  },

  getDayReading: async (params: { userId: string; date: string }) => {
    const response = await api.get('/get-day-reading', { params });
    return response.data;
  },

  // Helper function to get schedule with progress using separated caching
  getScheduleWithProgressOptimized: async (params: {
    userId: string;
    scheduleId?: string;
    groupId?: string;
  }) => {
    // Fetch schedule info and progress in parallel
    const [scheduleInfoResponse, progressResponse] = await Promise.all([
      progressAPI.getScheduleInfo({
        scheduleId: params.scheduleId,
        groupId: params.groupId
      }),
      progressAPI.getScheduleProgress({
        userId: params.userId,
        scheduleId: params.scheduleId,
        groupId: params.groupId
      })
    ]);

    // Combine the data to match the original API format
    const combinedReadings = scheduleInfoResponse.readings.map((reading: any) => {
      const progressData = progressResponse.dailyProgress[reading.dayId];
      return {
        ...reading,
        // Add progress information if it exists
        isCompleted: progressData?.isCompleted || false,
        completionTasks: progressData?.completionTasks || null,
        completedAt: progressData?.completedAt || null,
        notes: progressData?.notes || null,
        timeSpentMinutes: progressData?.timeSpentMinutes || null,
        progressUpdatedAt: progressData?.updatedAt || null
      };
    });

    // Calculate summary statistics
    const totalReadings = combinedReadings.length;
    const completedReadings = combinedReadings.filter((r: any) => r.isCompleted).length;
    const completionPercentage = totalReadings > 0 ? Math.round((completedReadings / totalReadings) * 100) : 0;

    return {
      schedule: {
        ...scheduleInfoResponse.schedule,
        // Add progress summary to schedule info
        totalReadings,
        completedReadings,
        completionPercentage,
        pointsEarned: progressResponse.progress.pointsEarned
      },
      progress: {
        totalReadings,
        completedReadings,
        remainingReadings: totalReadings - completedReadings,
        completionPercentage,
        pointsEarned: progressResponse.progress.pointsEarned
      },
      readings: combinedReadings
    };
  },
};

// Reading Template API
export const templateAPI = {
  getAll: async () => {
    const response = await api.get('/reading-templates');
    return response.data.templates;
  },

  getById: async (templateId: string) => {
    const response = await api.get(`/reading-templates/${templateId}`);
    return response.data.template;
  },
};

export default api;