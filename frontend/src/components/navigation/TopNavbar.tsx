import { LogoMark } from './LogoMark';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';

interface TopNavbarProps {
  currentScreenTitle: string;
  user: {
    fullName: string;
    email: string;
    role: 'patient' | 'caregiver';
  } | null;
  onLogout: () => void;
  unreadAlertsCount?: number;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function TopNavbar({
  currentScreenTitle,
  user,
  onLogout,
  unreadAlertsCount = 1,
  isDarkMode,
  onToggleDarkMode,
}: TopNavbarProps) {
  const isPatient = user?.role === 'patient';
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

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
          {currentScreenTitle}
        </h1>
      </div>

      {/* Right Hand Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleDarkMode}
          className="h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl cursor-pointer"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* Notifications Bell with Dot */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl cursor-pointer"
          aria-label="Alerts"
        >
          <Bell className="h-4 w-4" />
          {unreadAlertsCount > 0 && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          )}
        </Button>

        {user && (
          <>
            {/* User Role Badge */}
            <Badge
              variant={isPatient ? 'teal' : 'amber'}
              className="hidden sm:inline-flex text-[11px] font-semibold"
            >
              {isPatient ? 'Patient' : 'Caregiver'}
            </Badge>

            {/* Avatar */}
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs shadow-xs select-none ${
                isPatient
                  ? 'bg-[#0D9488]/15 text-[#0D9488] border border-[#0D9488]/30'
                  : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
              }`}
            >
              {initials}
            </div>

            {/* Logout Button */}
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
