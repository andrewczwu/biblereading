import axios from 'axios';

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

// Individual Reading Schedule API
export const individualScheduleAPI = {
  create: async (scheduleData: { userId: string; templateId: string; startDate: string }) => {
    const response = await api.post('/create-reading-schedule', scheduleData);
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
  }) => {
    const response = await api.post('/create-group-reading-schedule', groupData);
    return response.data;
  },

  join: async (joinData: { userId: string; groupId: string; userName?: string; email?: string }) => {
    const response = await api.post('/join-group-reading-schedule', joinData);
    return response.data;
  },

  leave: async (leaveData: { userId: string; groupId: string }) => {
    const response = await api.post('/leave-group-reading-schedule', leaveData);
    return response.data;
  },

  getMembers: async (groupId: string, includeInactive: boolean = false) => {
    const response = await api.get(`/group-members/${groupId}`, {
      params: { includeInactive }
    });
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  markCompleted: async (progressData: { userId: string; dayNumber: number; isCompleted: boolean }) => {
    const response = await api.post('/mark-reading-completed', progressData);
    return response.data;
  },

  getScheduleWithProgress: async (params: { userId: string; limit?: number }) => {
    const response = await api.get('/get-reading-schedule-with-progress', { params });
    return response.data;
  },

  getDayReading: async (params: { userId: string; date: string }) => {
    const response = await api.get('/get-day-reading', { params });
    return response.data;
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