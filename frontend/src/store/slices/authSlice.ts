import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getAuthToken, setAuthToken, removeAuthToken } from '../../lib/api';

export interface UserData {
  _id: string;
  email: string;
  fullName: string;
  role: 'patient' | 'caregiver';
  conditions: string[];
  phone?: string;
  burnoutScore?: number;
  capacityLevel?: string;
}

export interface CircleData {
  _id: string;
  name: string;
  inviteCode: string;
  patientId: {
    _id: string;
    fullName: string;
    email: string;
    conditions: string[];
    phone?: string;
  };
  members: Array<{
    userId: {
      _id: string;
      fullName: string;
      email: string;
      role: string;
    };
    roleInCircle: string;
    joinedAt: string;
  }>;
}

interface AuthState {
  user: UserData | null;
  circle: CircleData | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialToken = getAuthToken();

const initialState: AuthState = {
  user: null,
  circle: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: UserData; token: string; circle?: CircleData | null }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.circle = action.payload.circle || null;
      state.isAuthenticated = true;
      setAuthToken(action.payload.token);
    },
    setCircle: (state, action: PayloadAction<CircleData | null>) => {
      state.circle = action.payload;
    },
    setUser: (state, action: PayloadAction<UserData | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.circle = null;
      state.token = null;
      state.isAuthenticated = false;
      removeAuthToken();
    },
  },
});

export const { setCredentials, setCircle, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
