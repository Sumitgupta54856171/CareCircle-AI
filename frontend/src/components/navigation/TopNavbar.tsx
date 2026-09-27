import { useLocation } from 'react-router-dom';
import { LogoMark } from './LogoMark';
import { NotificationDropdown } from './NotificationDropdown';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sun, Moon, LogOut } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleDarkMode } from '../../store/slices/uiSlice';

interface TopNavbarProps {
  user: {
    fullName: string;
    email: string;
    role: 'patient' | 'caregiver';
  } | null;
  onLogout: () => void;
}

const PATH_TITLES: Record<string, string> = {
  '/circle': 'Care Circle Management',
  '/medications': 'Medication Schedule',
  '/chat': 'AI Health Co-Pilot',
  '/plan': 'Daily Plan & Routine',
  '/home': 'Patient Dashboard',
  '/alerts': 'Safety & Alerts',
};

export function TopNavbar({ user, onLogout }: TopNavbarProps) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isDarkMode } = useAppSelector((state) => state.ui);

  const isPatient = user?.role === 'patient';
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const screenTitle = PATH_TITLES[location.pathname] || 'CareCircle AI';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md transition-colors dark:border-slate-800 dark:bg-slate-900/95 sm:px-6">
      {/* Mobile Brand (hidden on lg where Sidebar shows brand) */}
      <div className="flex items-center gap-2.5 lg:hidden">
        <LogoMark size={28} />
        <div>
          <span className="font-bold tracking-tight text-slate-900 dark:text-slate-100 text-base">
            CareCircle <span className="text-[#0D9488] italic">AI</span>
          </span>
        </div>
      </div>

      {/* Screen Title (visible on desktop and tablet) */}
      <div className="hidden lg:block">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          {screenTitle}
        </h1>
      </div>

      {/* Right Hand Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Dark Mode Toggle via Redux */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleDarkMode())}
          className="h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications Popover Dropdown */}
        <NotificationDropdown />

        {user && (
          <>
            <Badge
              variant={isPatient ? 'teal' : 'amber'}
              className="hidden sm:inline-flex text-[11px] font-semibold"
            >
              {isPatient ? 'Patient' : 'Caregiver'}
            </Badge>

            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs shadow-xs select-none ${
                isPatient
                  ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                  : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
              }`}
            >
              {initials}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="h-9 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 cursor-pointer"
            >
              <LogOut className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs font-medium">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
