import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isDarkMode: boolean;
  unreadAlertsCount: number;
}

const initialState: UIState = {
  isDarkMode: false,
  unreadAlertsCount: 1,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.isDarkMode = action.payload;
      if (state.isDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    setUnreadAlertsCount: (state, action: PayloadAction<number>) => {
      state.unreadAlertsCount = action.payload;
    },
  },
});

export const { toggleDarkMode, setDarkMode, setUnreadAlertsCount } = uiSlice.actions;
export default uiSlice.reducer;
