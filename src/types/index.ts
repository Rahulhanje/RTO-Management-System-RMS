// User Roles
export type UserRole = 'CITIZEN' | 'POLICE' | 'RTO_OFFICER' | 'RTO_ADMIN' | 'SUPER_ADMIN' | 'AUDITOR';

// User Status
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

// Vehicle Types
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'TRUCK' | 'BUS' | 'AUTO' | 'OTHER';

// Fuel Types
export type FuelType = 'PETROL' | 'DIESEL' | 'ELECTRIC' | 'HYBRID' | 'CNG' | 'LPG';

// Vehicle Status
export type VehicleStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SCRAPPED';

// License Types
export type LicenseType = 'LMV' | 'HMV' | 'MCWG' | 'MCWOG' | 'TRANS';

// DL Application Status
export type DLApplicationStatus = 'PENDING' | 'DOCUMENTS_VERIFIED' | 'VERIFIED' | 'TEST_SCHEDULED' | 'TEST_PASSED' | 'TEST_FAILED' | 'APPROVED' | 'REJECTED';

// Challan Status
export type ChallanStatus = 'UNPAID' | 'PAID' | 'DISPUTED' | 'RESOLVED';

// Violation Types
export type ViolationType = 'OVER_SPEEDING' | 'SIGNAL_JUMP' | 'NO_HELMET' | 'NO_SEATBELT' | 'DRUNK_DRIVING' | 'WRONG_PARKING' | 'NO_LICENSE' | 'NO_INSURANCE' | 'OTHER';

// Payment Status
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// Payment Method
export type PaymentMethod = 'CARD' | 'UPI' | 'NETBANKING' | 'WALLET';

// Appointment Purpose
export type AppointmentPurpose = 'DL_TEST' | 'VEHICLE_INSPECTION' | 'DOCUMENT_VERIFICATION' | 'OTHER';

// Appointment Status
export type AppointmentStatus = 'SCHEDULED' | 'BOOKED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

// Dispute Resolution
export type DisputeResolution = 'ACCEPTED' | 'REJECTED' | 'PENDING';

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  date_of_birth: string;
  aadhaar_number: string;
  role: UserRole;
  status: UserStatus;
  rto_office_id?: string;
  created_at: string;
  updated_at: string;
}

// Auth Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  date_of_birth: string;
  aadhaar_number: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// RTO Office Interface
export interface RTOOffice {
  id: string;
  name: string;
  code: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
}

// Vehicle Interface
export interface Vehicle {
  id: string;
  owner_id: string;
  registration_number?: string;
  vehicle_type: VehicleType;
  make: string;
  model: string;
  year: number;
  color: string;
  engine_number: string;
  chassis_number: string;
  fuel_type: FuelType;
  rto_office_id: string;
  status: VehicleStatus;
  verified: boolean;
  verified_by?: string;
  verified_at?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

// Driving License Interface
export interface DrivingLicense {
  id: string;
  user_id: string;
  dl_number: string;
  license_type: LicenseType;
  issue_date: string;
  expiry_date: string;
  rto_office_id: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'REVOKED';
  created_at: string;
  updated_at: string;
}

// DL Application Interface
export interface DLApplication {
  id: string;
  user_id: string;
  rto_office_id: string;
  license_type: LicenseType;
  status: DLApplicationStatus;
  documents_verified: boolean;
  documents_verified_by?: string;
  documents_verified_at?: string;
  test_date?: string;
  test_scheduled_at?: string;
  test_result?: 'PASSED' | 'FAILED';
  dl_number?: string;
  rejected_reason?: string;
  created_at: string;
  updated_at: string;
}

// Challan Interface
export interface Challan {
  id: string;
  vehicle_id: string;
  issued_by: string;
  violation_type: ViolationType;
  amount: number;
  status: ChallanStatus;
  dispute_reason?: string;
  dispute_resolution?: DisputeResolution;
  resolution_notes?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

// Payment Interface
export interface Payment {
  id: string;
  user_id: string;
  challan_id?: string;
  amount: number;
  payment_method?: PaymentMethod;
  transaction_id?: string;
  status: PaymentStatus;
  refund_reason?: string;
  created_at: string;
  updated_at: string;
}

// Appointment Interface
export interface Appointment {
  id: string;
  user_id: string;
  rto_office_id: string;
  purpose: AppointmentPurpose;
  appointment_date: string;
  status: AppointmentStatus;
  notes?: string;
  completed_notes?: string;
  created_at: string;
  updated_at: string;
}

// Notification Interface
export interface Notification {
  id: string;
  user_id: string;
  message: string;
  read: boolean;
  created_at: string;
  updated_at: string;
}

// Analytics Interfaces
export interface DashboardStats {
  total_users: number;
  total_vehicles: number;
  total_licenses: number;
  total_challans: number;
  pending_applications: number;
  total_revenue: number;
}

export interface DashboardAnalytics {
  stats: DashboardStats;
  total_users: number;
  total_vehicles: number;
  total_licenses: number;
  total_challans: number;
  pending_applications: number;
  revenue_today: number;
  revenue_month: number;
  recent_activities: Activity[];
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

export interface RevenueData {
  period: string;
  challan_revenue: number;
  dl_revenue: number;
  vehicle_revenue: number;
  total_revenue: number;
}

export interface RevenueAnalytics {
  revenue: RevenueData[];
  total_revenue: number;
  revenue_by_month: { month: string; amount: number }[];
  revenue_by_type: { type: string; amount: number }[];
}

export interface ViolationAnalytics {
  total_violations: number;
  violations_by_type: { type: ViolationType; count: number }[];
  violations_by_month: { month: string; count: number }[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
