export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  COMPANY_OWNER = 'COMPANY_OWNER',
  CONTRACTOR_EMPLOYEE = 'CONTRACTOR_EMPLOYEE',
  CUSTOMER = 'CUSTOMER'
}

export enum Trade {
  GENERAL = 'General Construction',
  LANDSCAPING = 'Landscaping',
  ELECTRICAL = 'Electrical',
  PLUMBING = 'Plumbing',
  CONCRETE = 'Concrete',
  ROOFING = 'Roofing'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatarUrl?: string;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  businessName: string;
  description: string;
  trades: Trade[];
  rating: number;
  reviewCount: number;
  serviceArea: string; // e.g., "Austin, TX"
  verified: boolean;
  hourlyRate?: number;
  imageUrl: string;
}

export interface Quote {
  id: string;
  contractorId: string;
  customerId: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  totalAmount: number;
  description: string;
  createdAt: string;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
}

export interface SearchFilters {
  trade?: Trade;
  location?: string;
  query?: string;
}
