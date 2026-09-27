import { useNavigate, useLocation } from 'react-router-dom';
import { LogoMark } from './LogoMark';
import { Badge } from '../ui/badge';
import { useAlerts } from '../../hooks/useAlerts';
import { useCaregiverBurnout } from '../../hooks/useCaregiverBurnout';
import {
  Home,
  Users,
  Pill,
  Calendar,
  Sparkles,
  Bell,
  Activity,
  Camera,
  HeartPulse,
} from 'lucide-react';

interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/circle', label: 'Care Circle', icon: Users, badge: 'Feature 1' },
  { path: '/medications', label: 'Medications', icon: Pill, badge: 'Feature 2' },
  { path: '/chat', label: 'AI Co-Pilot', icon: Sparkles, badge: 'Feature 3' },
  { path: '/plan', label: 'Daily Plan', icon: Calendar, badge: 'Feature 4' },
  { path: '/checkin', label: 'Camera Check-in', icon: Camera, badge: 'Feature 5' },
  { path: '/alerts', label: 'Alerts & Safety', icon: Bell, badge: 'Feature 7' },
  { path: '/burnout', label: 'Caregiver Load', icon: HeartPulse, badge: 'Feature 8' },
  { path: '/home', label: 'Home Dashboard', icon: Home },
];

interface SidebarProps {
  user: {
    fullName: string;
    email: string;
    role: 'patient' | 'caregiver';
  } | null;
}

export function Sidebar({ user }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCount } = useAlerts();
  const { burnoutScore, capacityLevel } = useCaregiverBurnout();
  const isPatient = user?.role === 'patient';
  const displayScore = isPatient ? 82 : burnoutScore;

  const getCapacityDesc = () => {
    if (isPatient) return 'Optimal steady energy';
    if (capacityLevel === 'optimal') return 'Optimal steady capacity';
    if (capacityLevel === 'moderate') return 'Manageable care distribution';
    if (capacityLevel === 'pacing_needed') return 'High load • Pacing needed';
    return 'Critical burnout risk • Respite needed';
  };

  const getMeterColor = () => {
    if (isPatient) return 'bg-[#0D9488]';
    if (burnoutScore >= 85) return 'bg-rose-500';
    if (burnoutScore >= 68) return 'bg-amber-500';
    if (burnoutScore >= 40) return 'bg-teal-500';
    return 'bg-emerald-500';
  };

  return (
    <aside className="hidden lg:flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-5 sticky top-0 z-20 dark:border-slate-800 dark:bg-slate-900 transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div
          onClick={() => navigate('/circle')}
          className="flex items-center gap-3 px-1 cursor-pointer"
        >
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

        {/* Navigation Links with React Router */}
        <nav className="space-y-1.5" aria-label="Sidebar Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);
            const isAlertsItem = item.path === '/alerts';

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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
                {isAlertsItem && activeCount > 0 ? (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-bold animate-pulse">
                    {activeCount} new
                  </Badge>
                ) : (
                  item.badge && (
                    <Badge variant="teal" className="text-[10px] px-1.5 py-0 font-bold">
                      {item.badge}
                    </Badge>
                  )
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Area with Energy / Care Load Meter */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div
          onClick={() => navigate(isPatient ? '/checkin' : '/burnout')}
          className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40 cursor-pointer hover:border-[#0D9488]/40 transition-colors"
          title="Click to view detailed load & wellness telemetry"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-[#0D9488]" />
              {isPatient ? 'Your Energy' : 'Caregiver Load'}
            </span>
            <span className="tabular-nums font-bold text-[#0D9488]">
              {displayScore}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getMeterColor()}`}
              style={{ width: `${displayScore}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            {getCapacityDesc()}
          </p>
        </div>

        {/* User preview */}
        {user && (
          <div className="flex items-center gap-2.5 px-1 py-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
              {user.fullName?.charAt(0) || 'U'}
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
