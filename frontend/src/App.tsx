import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';
import { queryClient } from './lib/queryClient';
import { AppLayout } from './components/navigation/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { CirclePage } from './pages/CirclePage';
import { MedicationsPage } from './pages/MedicationsPage';
import { ChatPage } from './pages/ChatPage';
import { RoadmapPage } from './pages/RoadmapPage';

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes wrapped in AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/circle" replace />} />
                <Route path="/circle" element={<CirclePage />} />
                <Route path="/medications" element={<MedicationsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/plan" element={<RoadmapPage />} />
                <Route path="/home" element={<RoadmapPage />} />
                <Route path="/alerts" element={<RoadmapPage />} />
                <Route path="*" element={<Navigate to="/circle" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}
