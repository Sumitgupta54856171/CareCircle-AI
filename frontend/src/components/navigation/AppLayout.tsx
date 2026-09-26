import { useState, useEffect } from 'react';
import { Sidebar, type ScreenId } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { BottomNav } from './BottomNav';

interface AppLayoutProps {
  children: React.ReactNode;
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  user: {
    fullName: string;
    email: string;
    role: 'patient' | 'caregiver';
  } | null;
  onLogout: () => void;
}

const SCREEN_TITLES: Record<ScreenId, string> = {
  circle: 'Care Circle Management',
  home: 'Dashboard & Vitals',
  meds: 'Medication Schedule',
  plan: 'Adaptive Daily Plan',
  chat: 'AI Health Co-Pilot',
  alerts: 'Safety & Alerts',
};

export function AppLayout({
  children,
  currentScreen,
  onNavigate,
  user,
  onLogout,
}: AppLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark mode class on documentElement
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={onNavigate}
        user={user}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar
          currentScreenTitle={SCREEN_TITLES[currentScreen]}
          user={user}
          onLogout={onLogout}
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        {/* Dynamic Screen Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 pb-24 lg:pb-10 max-w-5xl mx-auto w-full">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav
          currentScreen={currentScreen}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
