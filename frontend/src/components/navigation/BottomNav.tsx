import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Users, Pill, Calendar, Sparkles, Camera, Bell, HeartPulse } from 'lucide-react';
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

  // Auto-hide bottom bar when mobile keyboard is active (input focused)
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsVisible(false);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsVisible(true);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const navItems = [
    { path: '/circle', label: 'Circle', icon: Users },
    { path: '/medications', label: 'Meds', icon: Pill },
    { path: '/checkin', label: 'Check-in', icon: Camera },
    { path: '/chat', label: 'Chat', icon: Sparkles },
    { path: '/plan', label: 'Plan', icon: Calendar },
    { path: '/burnout', label: 'Resilience', icon: HeartPulse },
    { path: '/alerts', label: 'Alerts', icon: Bell, badge: activeCount },
  ];

  return (
    <div
      className={`fixed bottom-3 inset-x-2 sm:inset-x-6 max-w-xl mx-auto z-40 transition-all duration-300 ease-in-out lg:hidden ${
        isVisible
          ? 'translate-y-0 opacity-100 pointer-events-auto'
          : 'translate-y-28 opacity-0 pointer-events-none'
      }`}
    >
      <nav
        className="flex items-center justify-between rounded-2xl sm:rounded-full border border-slate-200/90 bg-white/95 px-1 sm:px-2 py-1.5 shadow-2xl shadow-slate-900/15 backdrop-blur-xl dark:border-slate-800/90 dark:bg-slate-900/95 dark:shadow-black/40"
        aria-label="Mobile Floating Navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname.startsWith(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 px-0.5 sm:px-1 rounded-xl transition-all duration-150 cursor-pointer ${
                active
                  ? 'text-[#0D9488] font-bold dark:text-[#0D9488]'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`flex h-6.5 w-6.5 sm:h-7 sm:w-7 items-center justify-center rounded-xl transition-all ${
                    active
                      ? 'bg-[#0D9488]/15 text-[#0D9488] shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>

                {/* Dynamic alert badge */}
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-[15px] items-center justify-center rounded-full bg-rose-500 px-0.5 text-[8px] sm:text-[9px] font-extrabold text-white shadow-sm ring-2 ring-white dark:ring-slate-900 animate-in zoom-in-50">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] sm:text-[10px] tracking-tight mt-0.5 truncate max-w-[48px] sm:max-w-none text-center">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
