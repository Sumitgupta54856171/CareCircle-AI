import { LogoMark } from './LogoMark';
import { Badge } from '../ui/badge';
import {
  Home,
  Users,
  Pill,
  Calendar,
  Sparkles,
  Bell,
  Activity,
  User,
} from 'lucide-react';

export type ScreenId = 'home' | 'circle' | 'meds' | 'plan' | 'chat' | 'alerts';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'circle', label: 'Care Circle', icon: Users, badge: 'Feature 1' },
  { id: 'meds', label: 'Medications', icon: Pill, badge: 'Feature 2' },
  { id: 'home', label: 'Home Dashboard', icon: Home },
  { id: 'plan', label: 'Daily Plan', icon: Calendar },
  { id: 'chat', label: 'AI Co-Pilot', icon: Sparkles },
  { id: 'alerts', label: 'Alerts & Safety', icon: Bell },
];

interface SidebarProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  user: {
    fullName: string;
    email: string;
    role: 'patient' | 'caregiver';
  } | null;
}

export function Sidebar({ currentScreen, onNavigate, user }: SidebarProps) {
  const isPatient = user?.role === 'patient';
  const energyScore = isPatient ? 82 : 45; // Baseline demo score

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-5 sticky top-0 z-20 dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1">
          <LogoMark size={32} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight text-slate-900 dark:text-slate-100 text-lg">
                CareCircle
              </span>
              <span className="text-[#0D9488] font-bold text-sm italic">AI</span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              One Adaptive Team
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = currentScreen === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 cursor-pointer ${
                  active
                    ? 'bg-[#0D9488]/12 text-[#0D9488] shadow-xs dark:bg-[#0D9488]/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 ${
                      active ? 'text-[#0D9488]' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <Badge variant="teal" className="text-[10px] px-1.5 py-0 font-bold">
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Energy / Care Load Meter */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {/* Adaptive Meter from ui.html */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#0D9488]" />
              {isPatient ? 'Your Energy' : 'Caregiver Load'}
            </span>
            <span className="tabular-nums font-bold text-[#0D9488]">
              {energyScore}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPatient ? 'bg-[#0D9488]' : 'bg-amber-500'
              }`}
              style={{ width: `${energyScore}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            {isPatient ? 'Optimal steady energy' : 'Manageable care distribution'}
          </p>
        </div>

        {/* User preview */}
        {user && (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                {user.fullName}
              </p>
              <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                {user.email}
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
