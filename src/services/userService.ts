import api from './api';
import { ApiResponse, User } from '@/types';

export const userService = {
  // Get my profile
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update my profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  // Get user by ID (admin only)
  getUserById: async (id: string): Promise<ApiResponse<User>> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user by ID (admin only)
  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (super admin only)
  deleteUser: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // List all users (admin only)
  listUsers: async (): Promise<ApiResponse<User[]>> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Assign role to user (super admin only)
  assignRole: async (userId: string, role: string, rtoOfficeId?: string): Promise<ApiResponse<User>> => {
    const response = await api.post('/users/assign-role', {
      user_id: userId,
      role,
      rto_office_id: rtoOfficeId,
    });
    return response.data;
  },
};
