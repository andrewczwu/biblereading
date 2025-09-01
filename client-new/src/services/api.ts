import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
    const response = await api.get(`/user-profile/${uid}`);
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

// Schedule API
export const scheduleAPI = {
  create: async (scheduleData: any) => {
    const response = await api.post('/schedule', scheduleData);
    return response.data;
  },

  getByUser: async (userId: string) => {
    const response = await api.get(`/schedule/user/${userId}`);
    return response.data;
  },

  update: async (scheduleId: string, scheduleData: any) => {
    const response = await api.put(`/schedule/${scheduleId}`, scheduleData);
    return response.data;
  },

  delete: async (scheduleId: string) => {
    const response = await api.delete(`/schedule/${scheduleId}`);
    return response.data;
  },
};

// Progress API
export const progressAPI = {
  markCompleted: async (progressData: { userId: string; dayNumber: number; isCompleted: boolean }) => {
    const response = await api.post('/progress', progressData);
    return response.data;
  },

  getScheduleWithProgress: async (params: { userId: string; limit?: number }) => {
    const response = await api.get('/progress/schedule-with-progress', { params });
    return response.data;
  },

  getDayReading: async (params: { userId: string; date: string }) => {
    const response = await api.get('/progress/day-reading', { params });
    return response.data;
  },
};

// Groups API
export const groupsAPI = {
  create: async (groupData: any) => {
    const response = await api.post('/groups', groupData);
    return response.data;
  },

  getByUser: async (userId: string) => {
    const response = await api.get(`/groups/user/${userId}`);
    return response.data;
  },

  join: async (groupId: string, userId: string) => {
    const response = await api.post(`/groups/${groupId}/join`, { userId });
    return response.data;
  },

  leave: async (groupId: string, userId: string) => {
    const response = await api.post(`/groups/${groupId}/leave`, { userId });
    return response.data;
  },
};

export default api;