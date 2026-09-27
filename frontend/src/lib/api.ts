const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('carecircle_token');
export const setAuthToken = (token: string) => localStorage.setItem('carecircle_token', token);
export const removeAuthToken = () => localStorage.removeItem('carecircle_token');

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
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

export interface MedicationScheduleItem {
  medicationId: string;
  name: string;
  dosage: string;
  timeSlot: string;
  instructions: string;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  logId?: string | null;
  confirmedAt?: string | null;
  confirmationMethod?: 'manual' | 'photo' | 'voice' | null;
  aiVerification?: {
    isMatch: boolean;
    isTaken: boolean;
    confidence: number;
    notes: string;
    detectedDetails?: string;
  } | null;
}

export const medicationApi = {
  getTodaySchedule: () =>
    apiRequest<{
      schedule: MedicationScheduleItem[];
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

  confirmPhoto: (medicationId: string, formData: FormData) =>
    apiRequest<{
      success: boolean;
      message: string;
      log: any;
      analysis: {
        isMatch: boolean;
        isTaken: boolean;
        confidence: number;
        notes: string;
        detectedDetails?: string;
      };
      medication: any;
    }>(`/medications/${medicationId}/confirm-photo`, {
      method: 'POST',
      body: formData,
    }),

  delete: (medicationId: string) =>
    apiRequest(`/medications/${medicationId}`, { method: 'DELETE' }),
};

export const chatApi = {
  getHistory: () =>
    apiRequest<
      Array<{
        _id: string;
        senderId: string | null;
        senderName: string;
        senderType: 'user' | 'ai';
        roleContext: string;
        message: string;
        createdAt: string;
      }>
    >('/chat/history'),

  sendMessage: (message: string) =>
    apiRequest<{
      userMessage: {
        _id: string;
        senderName: string;
        senderType: 'user';
        message: string;
        createdAt: string;
      };
      aiMessage: {
        _id: string;
        senderName: string;
        senderType: 'ai';
        message: string;
        createdAt: string;
      };
    }>('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'completed' | 'skipped';
  completedAt?: string | null;
  estimatedMinutes?: number;
}

export interface ProgressMetric {
  total: number;
  completed: number;
  percentage: number;
}

export interface PlanData {
  _id: string;
  careCircleId: string;
  date: string;
  patientTasks: TaskItem[];
  caregiverTasks: TaskItem[];
  generatedBy: string;
  aiReasoning: string;
}

export const taskApi = {
  getTodayPlan: () =>
    apiRequest<{
      plan: PlanData;
      metrics: {
        patient: ProgressMetric;
        caregiver: ProgressMetric;
        overall: ProgressMetric;
      };
    }>('/tasks/today'),

  toggleTask: (team: 'patient' | 'caregiver', taskId: string, status?: 'completed' | 'pending') =>
    apiRequest<{
      message: string;
      task: TaskItem;
      metrics: {
        patient: ProgressMetric;
        caregiver: ProgressMetric;
        overall: ProgressMetric;
      };
      plan: PlanData;
    }>(`/tasks/${team}/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  addTask: (payload: {
    team: 'patient' | 'caregiver';
    title: string;
    description?: string;
    category?: string;
    estimatedMinutes?: number;
  }) => apiRequest('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
};

export interface MonitoringRecordData {
  stressScore: number;
  fatigueScore: number;
  fallRiskScore?: number | null;
  mood: string;
  expressionSummary?: string;
  recommendation?: string;
  confidence?: number;
  rawAnalysis?: any;
}

export interface MonitoringRecord {
  _id: string;
  careCircleId: string;
  userId: {
    _id: string;
    fullName: string;
    role: string;
  };
  type: string;
  source: string;
  data: MonitoringRecordData;
  timestamp: string;
  createdAt: string;
}

export interface CaregiverBurnoutData {
  burnoutScore: number;
  stressScore: number;
  fatigueScore: number;
  capacityLevel: 'optimal' | 'moderate' | 'pacing_needed' | 'burnout_risk';
  mood?: string;
  expressionSummary: string;
  recommendation: string;
  suggestedActions?: string[];
  sleepQuality?: string;
  hoursActive?: number;
  emotionalLoad?: number;
  physicalFatigue?: number;
  feelingOverwhelmed?: boolean;
  notes?: string;
  confidence?: number;
}

export interface CaregiverBurnoutRecord {
  _id: string;
  careCircleId: string;
  userId: {
    _id: string;
    fullName: string;
    role: string;
  };
  type: 'caregiver_burnout';
  source: string;
  data: CaregiverBurnoutData;
  timestamp: string;
  createdAt: string;
}

export interface CaregiverBurnoutSubmission {
  sleepQuality: 'restful' | 'interrupted' | 'poor';
  hoursActive: number;
  emotionalLoad: number;
  physicalFatigue: number;
  feelingOverwhelmed: boolean;
  notes?: string;
}

export const monitoringApi = {
  submitCheckin: (formData: FormData) =>
    apiRequest<{
      success: boolean;
      message: string;
      record: MonitoringRecord;
    }>('/monitoring/analyze', {
      method: 'POST',
      body: formData,
    }),

  getHistory: () =>
    apiRequest<{
      records: MonitoringRecord[];
    }>('/monitoring/history'),

  getLatest: () =>
    apiRequest<{
      record: MonitoringRecord | null;
    }>('/monitoring/latest'),

  submitCaregiverBurnout: (payload: CaregiverBurnoutSubmission) =>
    apiRequest<{
      success: boolean;
      message: string;
      record: CaregiverBurnoutRecord;
      alert?: AlertItem | null;
    }>('/monitoring/caregiver-burnout', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCaregiverBurnoutLatest: () =>
    apiRequest<{
      record: CaregiverBurnoutRecord | null;
    }>('/monitoring/caregiver-burnout/latest'),

  getCaregiverBurnoutHistory: () =>
    apiRequest<{
      records: CaregiverBurnoutRecord[];
    }>('/monitoring/caregiver-burnout/history'),

  sendCaregiverRespiteNudge: () =>
    apiRequest<{
      success: boolean;
      message: string;
      alert: AlertItem;
    }>('/monitoring/caregiver-burnout/nudge', {
      method: 'POST',
    }),
};

export interface AlertSuggestedAction {
  label: string;
  actionType: 'nav_plan' | 'nav_meds' | 'nav_chat' | 'call' | string;
  param?: string;
}

export interface AlertItem {
  _id: string;
  careCircleId: string;
  triggeredFor?: {
    _id: string;
    fullName: string;
    role: string;
  };
  severity: 'low' | 'medium' | 'high' | 'emergency';
  type: string;
  title: string;
  message: string;
  dataSnapshot?: any;
  status: 'new' | 'acknowledged' | 'resolved' | 'dismissed';
  suggestedActions?: AlertSuggestedAction[];
  acknowledgedBy?: {
    _id: string;
    fullName: string;
    role: string;
  };
  acknowledgedAt?: string;
  resolvedBy?: {
    _id: string;
    fullName: string;
    role: string;
  };
  resolvedAt?: string;
  createdAt: string;
}

export const alertApi = {
  getAll: () =>
    apiRequest<{
      alerts: AlertItem[];
      activeCount: number;
    }>('/alerts'),

  acknowledge: (id: string) =>
    apiRequest<{ success: boolean; alert: AlertItem }>(`/alerts/${id}/acknowledge`, {
      method: 'PATCH',
    }),

  resolve: (id: string) =>
    apiRequest<{ success: boolean; alert: AlertItem }>(`/alerts/${id}/resolve`, {
      method: 'PATCH',
    }),

  create: (payload: {
    type?: string;
    title?: string;
    message?: string;
    severity?: string;
  }) =>
    apiRequest<{ success: boolean; alert: AlertItem }>('/alerts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};


