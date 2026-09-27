import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../hooks/useAuth';

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Desktop Sidebar with React Router navigation */}
      <Sidebar user={user} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Navbar */}
        <TopNavbar user={user} onLogout={logout} />

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 pb-24 lg:pb-10 max-w-5xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
