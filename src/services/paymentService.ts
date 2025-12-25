import api from './api';
import { ApiResponse, Payment, PaymentMethod } from '@/types';

export interface InitiatePaymentData {
  challan_id: string;
  amount: number;
  payment_method: PaymentMethod;
}

export const paymentService = {
  // Initiate payment
  initiatePayment: async (data: InitiatePaymentData): Promise<ApiResponse<Payment>> => {
    const response = await api.post('/payments/initiate', data);
    return response.data;
  },

  // Pay challan (legacy)
  payChallan: async (challanId: string, paymentMethod: PaymentMethod, transactionId: string): Promise<ApiResponse<Payment>> => {
    const response = await api.post(`/payments/pay/${challanId}`, {
      payment_method: paymentMethod,
      transaction_id: transactionId,
    });
    return response.data;
  },

  // Get my payment history
  getMyPaymentHistory: async (): Promise<ApiResponse<Payment[]>> => {
    const response = await api.get('/payments/history');
    return response.data;
  },

  // Get all payments (admin)
  listPayments: async (): Promise<ApiResponse<Payment[]>> => {
    const response = await api.get('/payments');
    return response.data;
  },

  // Get payment by ID
  getPaymentById: async (id: string): Promise<ApiResponse<Payment>> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (paymentId: string, transactionId: string, status: string): Promise<ApiResponse<Payment>> => {
    const response = await api.put(`/payments/${paymentId}/verify`, {
      transaction_id: transactionId,
      status,
    });
    return response.data;
  },

  // Refund payment (admin)
  refundPayment: async (paymentId: string, reason: string): Promise<ApiResponse<Payment>> => {
    const response = await api.post(`/payments/${paymentId}/refund`, {
      refund_reason: reason,
    });
    return response.data;
  },
};
