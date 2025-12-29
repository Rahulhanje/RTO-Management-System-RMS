import api from './api';
import { ApiResponse } from '@/types';

export interface Document {
  id: string;
  user_id: string;
  entity_type: 'VEHICLE' | 'DL_APPLICATION' | 'USER';
  entity_id: string;
  document_type: 'AADHAAR' | 'PAN' | 'ADDRESS_PROOF' | 'PHOTO' | 'SIGNATURE' | 'INSURANCE' | 'OTHER';
  file_path: string;
  file_name: string;
  mime_type: string;
  size: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  rejection_reason?: string;
  // Computed/alias fields for frontend convenience
  type?: 'VEHICLE' | 'DL_APPLICATION' | 'USER';
  name?: string;
  uploaded_at?: string;
}


export const documentService = {
  // Upload document
  uploadDocument: async (
    file: File,
    entityType: string,
    entityId: string,
    documentType: string
  ): Promise<ApiResponse<{ document: Document }>> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('entity_type', entityType);
    formData.append('entity_id', entityId);
    formData.append('document_type', documentType);

    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get documents by entity
  getDocumentsByEntity: async (entityId: string): Promise<ApiResponse<{ documents: Document[] }>> => {
    const response = await api.get(`/documents/entity/${entityId}`);
    return response.data;
  },

  // Get my documents (user's documents)
  getMyDocuments: async (): Promise<ApiResponse<{ documents: Document[] }>> => {
    const response = await api.get('/documents/my');
    return response.data;
  },

  // Download document
  downloadDocument: async (documentId: string): Promise<Blob> => {
    const response = await api.get(`/documents/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/documents/${documentId}`);
    return response.data;
  },
};
