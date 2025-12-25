import api from './api';
import { ApiResponse, DrivingLicense, DLApplication, LicenseType } from '@/types';

export const dlService = {
  // Apply for driving license
  apply: async (rtoOfficeId: string, licenseType: LicenseType): Promise<ApiResponse<DLApplication>> => {
    const response = await api.post('/dl/apply', {
      rto_office_id: rtoOfficeId,
      license_type: licenseType,
    });
    return response.data;
  },

  // Get my DL applications
  getMyApplications: async (): Promise<ApiResponse<DLApplication[]>> => {
    const response = await api.get('/dl/applications/my');
    return response.data;
  },

  // Get my driving license
  getMyLicense: async (): Promise<ApiResponse<DrivingLicense>> => {
    const response = await api.get('/dl/my');
    return response.data;
  },

  // Get DL by number
  getLicenseByNumber: async (dlNumber: string): Promise<ApiResponse<DrivingLicense>> => {
    const response = await api.get(`/dl/${dlNumber}`);
    return response.data;
  },

  // Renew driving license
  renewLicense: async (dlNumber: string): Promise<ApiResponse<DrivingLicense>> => {
    const response = await api.post(`/dl/${dlNumber}/renew`);
    return response.data;
  },

  // Get all applications (admin/officer)
  listApplications: async (): Promise<ApiResponse<DLApplication[]>> => {
    const response = await api.get('/dl/applications');
    return response.data;
  },

  // Get application by ID
  getApplicationById: async (id: string): Promise<ApiResponse<DLApplication>> => {
    const response = await api.get(`/dl/applications/${id}`);
    return response.data;
  },

  // Verify application documents (officer)
  verifyDocuments: async (applicationId: string, verified: boolean, notes: string): Promise<ApiResponse<DLApplication>> => {
    const response = await api.put(`/dl/applications/${applicationId}/verify`, { verified, notes });
    return response.data;
  },

  // Schedule DL test (admin)
  scheduleTest: async (applicationId: string, testDate: string): Promise<ApiResponse<DLApplication>> => {
    const response = await api.post(`/dl/applications/${applicationId}/schedule-test`, {
      test_date: testDate,
    });
    return response.data;
  },

  // Approve DL application (admin)
  approveApplication: async (applicationId: string, dlNumber: string, testResult: string): Promise<ApiResponse<DLApplication>> => {
    const response = await api.put(`/dl/applications/${applicationId}/approve`, {
      dl_number: dlNumber,
      test_result: testResult,
    });
    return response.data;
  },

  // Reject DL application (admin)
  rejectApplication: async (applicationId: string, reason: string): Promise<ApiResponse<DLApplication>> => {
    const response = await api.put(`/dl/applications/${applicationId}/reject`, {
      rejected_reason: reason,
    });
    return response.data;
  },
};
