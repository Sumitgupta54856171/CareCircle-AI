import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Pill, Calendar, Sparkles, Camera, Bell } from 'lucide-react';
import { useAlerts } from '../../hooks/useAlerts';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCount } = useAlerts();

  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  // Always show bottom bar on route change
  useEffect(() => {
    setIsVisible(true);
  }, [location.pathname]);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Always visible near top of page
          if (currentScrollY <= 30) {
            setIsVisible(true);
          } else if (Math.abs(currentScrollY - lastScrollY.current) > 10) {
            // Scroll down -> hide; scroll up -> show
            if (currentScrollY > lastScrollY.current) {
              setIsVisible(false);
            } else {
              setIsVisible(true);
            }
          }

          lastScrollY.current = Math.max(0, currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/circle', label: 'Circle', icon: Users },
    { path: '/medications', label: 'Meds', icon: Pill },
    { path: '/checkin', label: 'Check-in', icon: Camera },
    { path: '/chat', label: 'Chat', icon: Sparkles },
    { path: '/plan', label: 'Plan', icon: Calendar },
    { path: '/alerts', label: 'Alerts', icon: Bell, badge: activeCount },
  ];

  return (
    <div
      className={`fixed bottom-4 inset-x-3 sm:inset-x-6 max-w-lg mx-auto z-40 transition-all duration-300 ease-in-out lg:hidden ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-28 opacity-0 pointer-events-none'
      }`}
    >
      <nav
        className="flex items-center justify-between rounded-2xl sm:rounded-full border border-slate-200/90 bg-white/90 px-2 py-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/90 dark:shadow-black/40"
        aria-label="Mobile Floating Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 cursor-pointer ${
                active
                  ? 'text-[#0D9488] font-bold dark:text-[#0D9488]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
                    active
                      ? 'bg-[#0D9488]/15 text-[#0D9488] shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>

                {/* Dynamic alert badge */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
