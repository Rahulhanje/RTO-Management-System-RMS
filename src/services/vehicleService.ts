import api from './api';
import { ApiResponse, Vehicle, VehicleType, FuelType } from '@/types';

export interface RegisterVehicleData {
  vehicle_type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  engine_number: string;
  chassis_number: string;
  fuel_type: FuelType;
  rto_office_id: string;
}

export const vehicleService = {
  // Register new vehicle
  register: async (data: RegisterVehicleData): Promise<ApiResponse<Vehicle>> => {
    const response = await api.post('/vehicles/register', data);
    return response.data;
  },

  // Get my vehicles
  getMyVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const response = await api.get('/vehicles/my');
    return response.data;
  },

  // Get vehicle by ID
  getVehicleById: async (id: string): Promise<ApiResponse<Vehicle>> => {
    const response = await api.get(`/vehicles/${id}`);
    return response.data;
  },

  // Get all vehicles (admin only)
  listVehicles: async (): Promise<ApiResponse<Vehicle[]>> => {
    const response = await api.get('/vehicles');
    return response.data;
  },

  // Transfer vehicle ownership
  transferOwnership: async (vehicleId: string, toOwnerId: string): Promise<ApiResponse<Vehicle>> => {
    const response = await api.post(`/vehicles/${vehicleId}/transfer`, {
      to_owner_id: toOwnerId,
    });
    return response.data;
  },

  // Verify vehicle documents (officer)
  verifyDocuments: async (vehicleId: string, verified: boolean, notes: string): Promise<ApiResponse<Vehicle>> => {
    const response = await api.put(`/vehicles/${vehicleId}/verify`, { verified, notes });
    return response.data;
  },

  // Approve vehicle registration (admin)
  approveRegistration: async (vehicleId: string, registrationNumber: string): Promise<ApiResponse<Vehicle>> => {
    const response = await api.put(`/vehicles/${vehicleId}/approve`, { 
      registration_number: registrationNumber 
    });
    return response.data;
  },

  // Mark vehicle as scrapped (admin)
  markAsScrapped: async (vehicleId: string): Promise<ApiResponse<Vehicle>> => {
    const response = await api.put(`/vehicles/${vehicleId}/scrap`);
    return response.data;
  },
};
