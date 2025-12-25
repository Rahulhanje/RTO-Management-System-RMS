import api from './api';
import { ApiResponse, Notification } from '@/types';

export const notificationService = {
  // Get my notifications
  getMyNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse<Notification>> => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Send notification (admin)
  sendNotification: async (userId: string, message: string): Promise<ApiResponse<Notification>> => {
    const response = await api.post('/notifications/send', {
      user_id: userId,
      message,
    });
    return response.data;
  },
};
