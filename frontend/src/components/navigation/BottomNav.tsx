import { Users, Home, Pill, Calendar, Sparkles } from 'lucide-react';
import type { ScreenId } from './Sidebar';

interface BottomNavProps {
  currentScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

const MOBILE_NAV_ITEMS: { id: ScreenId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'circle', label: 'Circle', icon: Users },
  { id: 'home', label: 'Home', icon: Home },
  { id: 'meds', label: 'Meds', icon: Pill },
  { id: 'plan', label: 'Plan', icon: Calendar },
  { id: 'chat', label: 'Chat', icon: Sparkles },
];

export function BottomNav({ currentScreen, onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:hidden"
      aria-label="Mobile Bottom Navigation"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = currentScreen === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-1.5 transition-all duration-150 cursor-pointer ${
              active
                ? 'text-[#0D9488] font-bold dark:text-[#0D9488]'
                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
            }`}
          >
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                active ? 'bg-[#0D9488]/15 text-[#0D9488]' : ''
              }`}
            >
              <Icon className="h-4.5 w-4.5" />
            </div>
            <span className="text-[10px] tracking-tight">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
