import api from './api';
import { ApiResponse, DashboardAnalytics, RevenueAnalytics, ViolationAnalytics } from '@/types';

export const analyticsService = {
  // Get dashboard analytics
  getDashboardAnalytics: async (): Promise<ApiResponse<DashboardAnalytics>> => {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  // Get revenue analytics
  getRevenueAnalytics: async (): Promise<ApiResponse<RevenueAnalytics>> => {
    const response = await api.get('/analytics/revenue');
    return response.data;
  },

  // Get violation analytics
  getViolationAnalytics: async (): Promise<ApiResponse<ViolationAnalytics>> => {
    const response = await api.get('/analytics/violations');
    return response.data;
  },

  // Get ML risk assessment
  getMLRiskAssessment: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/analytics/ml-risk');
    return response.data;
  },

  // Get recent activities
  getRecentActivities: async (limit?: number): Promise<ApiResponse<any>> => {
    const response = await api.get('/analytics/recent-activity', {
      params: { limit },
    });
    return response.data;
  },

  // Get weekly statistics
  getWeeklyStats: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/analytics/weekly-stats');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse<{ status: string }>> => {
    const response = await api.get('/health');
    return response.data;
  },
};
