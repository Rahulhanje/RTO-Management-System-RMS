import api from './api';
import { ApiResponse, RTOOffice } from '@/types';

export interface CreateRTOOfficeData {
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
}

export const rtoService = {
  // Get all RTO offices
  listOffices: async (): Promise<ApiResponse<RTOOffice[]>> => {
    const response = await api.get('/rto/offices');
    return response.data;
  },

  // Get RTO office by ID
  getOfficeById: async (id: string): Promise<ApiResponse<RTOOffice>> => {
    const response = await api.get(`/rto/offices/${id}`);
    return response.data;
  },

  // Create RTO office (super admin)
  createOffice: async (data: CreateRTOOfficeData): Promise<ApiResponse<RTOOffice>> => {
    const response = await api.post('/rto/offices', data);
    return response.data;
  },

  // Update RTO office (super admin)
  updateOffice: async (id: string, data: Partial<CreateRTOOfficeData & { status: string }>): Promise<ApiResponse<RTOOffice>> => {
    const response = await api.put(`/rto/offices/${id}`, data);
    return response.data;
  },

  // Delete RTO office (super admin)
  deleteOffice: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/rto/offices/${id}`);
    return response.data;
  },
};
