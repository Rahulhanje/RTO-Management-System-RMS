import api from './api';
import { ApiResponse, Challan, ViolationType, DisputeResolution } from '@/types';

export interface IssueChallanData {
  vehicle_id: string;
  violation_type: ViolationType;
  amount: number;
  location?: string;
}

export const challanService = {
  // Issue challan (police)
  issueChallan: async (data: IssueChallanData): Promise<ApiResponse<Challan>> => {
    const response = await api.post('/challans', data);
    return response.data;
  },

  // Get my challans (citizen)
  getMyChallans: async (): Promise<ApiResponse<Challan[]>> => {
    const response = await api.get('/challans/my');
    return response.data;
  },

  // Get all challans (admin/police)
  listChallans: async (): Promise<ApiResponse<Challan[]>> => {
    const response = await api.get('/challans');
    return response.data;
  },

  // Get challan by ID
  getChallanById: async (id: string): Promise<ApiResponse<Challan>> => {
    const response = await api.get(`/challans/${id}`);
    return response.data;
  },

  // Get vehicle challans
  getVehicleChallans: async (vehicleId: string): Promise<ApiResponse<Challan[]>> => {
    const response = await api.get(`/challans/vehicle/${vehicleId}`);
    return response.data;
  },

  // Dispute a challan (citizen)
  disputeChallan: async (challanId: string, reason: string): Promise<ApiResponse<Challan>> => {
    const response = await api.post(`/challans/${challanId}/dispute`, {
      dispute_reason: reason,
    });
    return response.data;
  },

  // Resolve challan dispute (admin)
  resolveDispute: async (
    challanId: string, 
    resolution: DisputeResolution, 
    notes: string
  ): Promise<ApiResponse<Challan>> => {
    const response = await api.put(`/challans/${challanId}/resolve`, {
      dispute_resolution: resolution,
      resolution_notes: notes,
    });
    return response.data;
  },
};
