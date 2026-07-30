import { User, ContractorProfile, Quote, SearchFilters, Trade, Role, ApiError } from './types';

// ==========================================
// 1. INTERFACES (The Contract)
// ==========================================

export interface IAuthService {
  login(email: string, password: string): Promise<{ user: User; token: string }>;
  loginWithProvider(provider: 'google' | 'facebook'): Promise<{ user: User; token: string }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface IContractorService {
  getProfile(id: string): Promise<ContractorProfile>;
  searchContractors(filters: SearchFilters): Promise<ContractorProfile[]>;
}

export interface IQuoteService {
  listQuotesForUser(userId: string, role: Role): Promise<Quote[]>;
  createQuote(data: Partial<Quote>): Promise<Quote>;
}

// ==========================================
// 2. MOCK IMPLEMENTATIONS (For Demo/Testing)
// ==========================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MOCK_USERS: Record<string, User> = {
  'user-1': { id: 'user-1', email: 'customer@test.com', firstName: 'John', lastName: 'Doe', role: Role.CUSTOMER },
  'user-2': { id: 'user-2', email: 'contractor@test.com', firstName: 'Bob', lastName: 'Builder', role: Role.COMPANY_OWNER }
};

const MOCK_CONTRACTORS: ContractorProfile[] = [
  {
    id: 'c-1', userId: 'user-2', businessName: 'Bob\'s Quality Builds', description: 'Top tier general construction and concrete work.',
    trades: [Trade.GENERAL, Trade.CONCRETE], rating: 4.8, reviewCount: 124, serviceArea: 'Austin, TX', verified: true,
    imageUrl: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: 'c-2', userId: 'user-3', businessName: 'Sparky Electrical', description: 'Licensed and insured residential electrical services.',
    trades: [Trade.ELECTRICAL], rating: 4.9, reviewCount: 89, serviceArea: 'Austin, TX', verified: true,
    imageUrl: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: 'c-3', userId: 'user-4', businessName: 'Green Thumb Landscaping', description: 'Transforming backyards since 2010.',
    trades: [Trade.LANDSCAPING], rating: 4.5, reviewCount: 42, serviceArea: 'Dallas, TX', verified: false,
    imageUrl: 'https://picsum.photos/400/300?random=3'
  }
];

const MOCK_QUOTES: Quote[] = [
  { id: 'q-1', contractorId: 'c-1', customerId: 'user-1', status: 'SENT', totalAmount: 1500, description: 'Patio concrete pouring', createdAt: new Date().toISOString() },
  { id: 'q-2', contractorId: 'c-2', customerId: 'user-1', status: 'ACCEPTED', totalAmount: 350, description: 'Install new ceiling fans', createdAt: new Date().toISOString() }
];

export class MockAuthService implements IAuthService {
  async login(email: string, password: string) {
    await delay(800);
    if (email === 'contractor@test.com') return { user: MOCK_USERS['user-2'], token: 'mock-jwt-token' };
    return { user: MOCK_USERS['user-1'], token: 'mock-jwt-token' };
  }
  async loginWithProvider(provider: 'google' | 'facebook') {
    await delay(800);
    // Mocking a successful social login, returning a customer user
    return { user: MOCK_USERS['user-1'], token: `mock-jwt-token-${provider}` };
  }
  async logout() { await delay(300); }
  async getCurrentUser() { await delay(300); return null; } // Simplified for demo
}

export class MockContractorService implements IContractorService {
  async getProfile(id: string) {
    await delay(500);
    const profile = MOCK_CONTRACTORS.find(c => c.id === id);
    if (!profile) throw { status: 404, code: 'NOT_FOUND', message: 'Contractor not found' } as ApiError;
    return profile;
  }
  async searchContractors(filters: SearchFilters) {
    await delay(800);
    let results = [...MOCK_CONTRACTORS];
    if (filters.trade) results = results.filter(c => c.trades.includes(filters.trade!));
    if (filters.location) results = results.filter(c => c.serviceArea.toLowerCase().includes(filters.location!.toLowerCase()));
    if (filters.query) results = results.filter(c => c.businessName.toLowerCase().includes(filters.query!.toLowerCase()));
    return results;
  }
}

export class MockQuoteService implements IQuoteService {
  async listQuotesForUser(userId: string, role: Role) {
    await delay(600);
    if (role === Role.CUSTOMER) return MOCK_QUOTES.filter(q => q.customerId === userId);
    return MOCK_QUOTES.filter(q => q.contractorId === userId); // Simplified
  }
  async createQuote(data: Partial<Quote>) {
    await delay(800);
    const newQuote: Quote = {
      id: `q-${Math.random().toString(36).substr(2, 9)}`,
      contractorId: data.contractorId || 'c-1',
      customerId: data.customerId || 'user-1',
      status: 'DRAFT',
      totalAmount: data.totalAmount || 0,
      description: data.description || '',
      createdAt: new Date().toISOString()
    };
    MOCK_QUOTES.push(newQuote);
    return newQuote;
  }
}

// ==========================================
// 3. REAL IMPLEMENTATIONS (Stubs for Spring Boot)
// ==========================================

// A simple wrapper around fetch to simulate Axios interceptors
const httpClient = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
  
  const response = await fetch(`/api${url}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw { status: response.status, code: errorData.code || 'UNKNOWN', message: errorData.message || 'API Error' } as ApiError;
  }
  return response.json();
};

export class AuthService implements IAuthService {
  async login(email: string, password: string) { return httpClient<{user: User, token: string}>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); }
  async loginWithProvider(provider: 'google' | 'facebook') { return httpClient<{user: User, token: string}>(`/auth/social/${provider}`, { method: 'POST' }); }
  async logout() { return httpClient<void>('/auth/logout', { method: 'POST' }); }
  async getCurrentUser() { return httpClient<User>('/auth/me'); }
}

export class ContractorService implements IContractorService {
  async getProfile(id: string) { return httpClient<ContractorProfile>(`/contractors/${id}`); }
  async searchContractors(filters: SearchFilters) { 
    const params = new URLSearchParams(filters as any).toString();
    return httpClient<ContractorProfile[]>(`/contractors/search?${params}`); 
  }
}

export class QuoteService implements IQuoteService {
  async listQuotesForUser(userId: string, role: Role) { return httpClient<Quote[]>(`/quotes`); }
  async createQuote(data: Partial<Quote>) { return httpClient<Quote>('/quotes', { method: 'POST', body: JSON.stringify(data) }); }
}

// ==========================================
// 4. SERVICE FACTORY
// ==========================================

// In a real app, this would be `import.meta.env.VITE_USE_MOCKS === 'true'`
// For this demo environment, we force it to true so the app works without a backend.
const USE_MOCKS = true; 

export const authService: IAuthService = USE_MOCKS ? new MockAuthService() : new AuthService();
export const contractorService: IContractorService = USE_MOCKS ? new MockContractorService() : new ContractorService();
export const quoteService: IQuoteService = USE_MOCKS ? new MockQuoteService() : new QuoteService();
