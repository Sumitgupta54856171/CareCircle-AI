const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('carecircle_token');
export const setAuthToken = (token: string) => localStorage.setItem('carecircle_token', token);
export const removeAuthToken = () => localStorage.removeItem('carecircle_token');

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
}

export const authApi = {
  register: (payload: {
    email: string;
    password: string;
    fullName: string;
    role: 'patient' | 'caregiver';
    conditions?: string[];
    phone?: string;
  }) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),

  login: (payload: { email: string; password: string }) =>
    apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),

  me: () => apiRequest('/auth/me'),
};

export const circleApi = {
  getMyCircle: () => apiRequest('/circles/my-circle'),
  joinCircle: (payload: { inviteCode?: string; patientEmail?: string }) =>
    apiRequest('/circles/join', { method: 'POST', body: JSON.stringify(payload) }),
  inviteEmail: (email: string) =>
    apiRequest('/circles/invite-email', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const medicationApi = {
  getTodaySchedule: () => apiRequest<{
    schedule: Array<{
      medicationId: string;
      name: string;
      dosage: string;
      timeSlot: string;
      instructions: string;
      status: 'pending' | 'taken' | 'missed' | 'skipped';
      logId: string | null;
      confirmedAt: string | null;
    }>;
    summary: {
      totalDoses: number;
      takenDoses: number;
      adherenceRate: number;
    };
  }>('/medications/today'),

  getAll: () => apiRequest('/medications'),

  add: (payload: {
    name: string;
    dosage: string;
    frequency?: string;
    times: string[];
    instructions?: string;
  }) => apiRequest('/medications', { method: 'POST', body: JSON.stringify(payload) }),

  logStatus: (
    medicationId: string,
    payload: {
      status: 'taken' | 'missed' | 'skipped';
      timeSlot: string;
      notes?: string;
    }
  ) =>
    apiRequest(`/medications/${medicationId}/log`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  delete: (medicationId: string) =>
    apiRequest(`/medications/${medicationId}`, { method: 'DELETE' }),
};
