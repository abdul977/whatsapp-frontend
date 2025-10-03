import axios, { AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Message {
  id: string;
  phone_number: string;
  text: string;
  sender_type: 'incoming' | 'outgoing';
  timestamp: string;
  message_id?: string;
  account_id?: string;
}

export interface Contact {
  phone_number: string;
  display_name?: string;
  name?: string; // For backward compatibility
  last_message?: string;
  last_message_time?: string;
  last_message_type?: string;
  message_count: number;
  unread_count?: number;
  account_id?: string;
}

export interface Account {
  id: string;
  name: string;
  token: string;
  phone_number_id: string;
  business_account_id: string;
  status: 'active' | 'inactive';
}

export interface SendMessageRequest {
  to: string;
  message: string;
  type?: 'text' | 'template';
  business_id?: string;
  phone_id?: string;
}

export interface SendMessageResponse {
  status: 'success' | 'error';
  message_id?: string;
  phone_number?: string;
  account_id?: string;
  delivery_info?: string;
  message?: string;
  details?: any;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  count?: number;
}

export interface ContactsResponse {
  status: 'success' | 'error';
  contacts?: Contact[];
  count?: number;
  account_id?: string;
  message?: string;
}

export interface AccountsResponse {
  status: 'success' | 'error';
  accounts?: Account[];
  count?: number;
  message?: string;
}

export interface MessagesResponse {
  status: 'success' | 'error';
  messages?: Message[];
  count?: number;
  account_id?: string;
  phone_number?: string;
  message?: string;
}

// API Functions

// System Status
export const getSystemStatus = async (): Promise<any> => {
  const response = await api.get('/api/status');
  return response.data;
};

// Messages
export const sendMessage = async (data: SendMessageRequest): Promise<SendMessageResponse> => {
  const response = await api.post('/send', data);
  return response.data;
};

export const sendMessageFromAccount = async (
  accountId: string, 
  data: Omit<SendMessageRequest, 'account_id'>
): Promise<SendMessageResponse> => {
  const response = await api.post(`/api/accounts/${accountId}/send`, data);
  return response.data;
};

export const getMessages = async (
  phoneNumber: string, 
  accountId?: string
): Promise<MessagesResponse> => {
  const params = accountId ? { account_id: accountId } : {};
  const response = await api.get(`/api/messages/${phoneNumber}`, { params });
  return response.data;
};

export const getAccountMessages = async (
  accountId: string, 
  phoneNumber: string
): Promise<ApiResponse<Message[]>> => {
  const response = await api.get(`/api/accounts/${accountId}/messages/${phoneNumber}`);
  return response.data;
};

// Contacts
export const getContacts = async (accountId?: string): Promise<ContactsResponse> => {
  const params = accountId ? { account_id: accountId } : {};
  const response = await api.get('/api/contacts', { params });
  return response.data;
};

export const getAccountContacts = async (accountId: string): Promise<ApiResponse<Contact[]>> => {
  const response = await api.get(`/api/accounts/${accountId}/contacts`);
  return response.data;
};

// Accounts
export const getAccounts = async (): Promise<AccountsResponse> => {
  const response = await api.get('/api/accounts');
  return response.data;
};

export const getAccountDetails = async (accountId: string): Promise<ApiResponse<Account>> => {
  const response = await api.get(`/api/accounts/${accountId}`);
  return response.data;
};

// Templates (if backend supports it)
export const getTemplates = async (accountId?: string): Promise<any> => {
  const params = accountId ? { account_id: accountId } : {};
  const response = await api.get('/api/templates', { params });
  return response.data;
};

export const sendTemplate = async (data: {
  to: string;
  template_name: string;
  account_id?: string;
}): Promise<SendMessageResponse> => {
  const response = await api.post('/send-template', data);
  return response.data;
};

// Webhook testing
export const testWebhook = async (data: any): Promise<any> => {
  const response = await api.post('/test-webhook', data);
  return response.data;
};

export const simulateIncomingMessage = async (data: {
  phone_number: string;
  message: string;
  account_id?: string;
}): Promise<any> => {
  const response = await api.post('/simulate-incoming', data);
  return response.data;
};

// Error handling helper
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Export the axios instance for custom requests
export { api };
export default api;
