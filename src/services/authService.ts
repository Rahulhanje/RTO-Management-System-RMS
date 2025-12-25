import api from './api';
import { AuthResponse, LoginCredentials, RegisterData, ApiResponse, User } from '@/types';

export const authService = {
  // Register a new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.success && response.data.data) {
      const { accessToken, refreshToken, user } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return response.data;
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (email: string, otp: string): Promise<ApiResponse<{ resetToken: string }>> => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Reset password
  resetPassword: async (resetToken: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.post('/auth/reset-password', { resetToken, newPassword });
    return response.data;
  },

  // Change password
  changePassword: async (oldPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    const response = await api.put('/auth/change-password', { 
      currentPassword: oldPassword, 
      newPassword 
    });
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
    }
    return response.data;
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('accessToken');
  },

  // Get access token
  getAccessToken: (): string | null => {
    return localStorage.getItem('accessToken');
  },
};
