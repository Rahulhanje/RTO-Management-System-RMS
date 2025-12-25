import api from './api';
import { ApiResponse, Appointment, AppointmentPurpose } from '@/types';

export interface BookAppointmentData {
  rto_office_id: string;
  purpose: AppointmentPurpose;
  appointment_date: string;
  notes?: string;
}

export const appointmentService = {
  // Book appointment
  bookAppointment: async (data: BookAppointmentData): Promise<ApiResponse<Appointment>> => {
    const response = await api.post('/appointments/book', data);
    return response.data;
  },

  // Get my appointments
  getMyAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments/my');
    return response.data;
  },

  // Get all appointments (admin/officer)
  listAppointments: async (): Promise<ApiResponse<Appointment[]>> => {
    const response = await api.get('/appointments');
    return response.data;
  },

  // Get appointment by ID
  getAppointmentById: async (id: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId: string, newDate: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.put(`/appointments/${appointmentId}/reschedule`, {
      new_date: newDate,
    });
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.put(`/appointments/${appointmentId}/cancel`);
    return response.data;
  },

  // Complete appointment (officer/admin)
  completeAppointment: async (appointmentId: string, notes?: string): Promise<ApiResponse<Appointment>> => {
    const response = await api.put(`/appointments/${appointmentId}/complete`, { notes });
    return response.data;
  },
};
