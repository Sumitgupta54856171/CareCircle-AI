import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  ExternalLink,
  Check,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAlerts } from '../../hooks/useAlerts';

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const {
    activeAlerts,
    activeCount,
    acknowledgeAlert,
    isAcknowledging,
  } = useAlerts();

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleAcknowledge = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await acknowledgeAlert(id);
    } catch (err: any) {
      console.error('Failed to acknowledge:', err);
    }
  };

  const handleOpenAlerts = () => {
    setIsOpen(false);
    navigate('/alerts');
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'emergency':
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-teal-500 shrink-0" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative h-9 w-9 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-xl cursor-pointer"
        aria-label="Toggle notifications"
        aria-expanded={isOpen}
      >
        <Bell className="h-4 w-4" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white px-1 shadow-xs animate-pulse">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
              {activeCount > 0 && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0 font-bold">
                  {activeCount} new
                </Badge>
              )}
            </div>
            <button
              onClick={handleOpenAlerts}
              className="text-xs text-[#0D9488] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View all</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {/* Alerts List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {activeAlerts.length > 0 ? (
              activeAlerts.map((alert) => {
                const timeAgo = new Date(alert.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={alert._id}
                    onClick={handleOpenAlerts}
                    className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">{getSeverityIcon(alert.severity)}</div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#0D9488] transition-colors">
                            {alert.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {timeAgo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] font-medium text-slate-400">
                            {alert.triggeredFor?.fullName ? `For: ${alert.triggeredFor.fullName}` : 'Circle Alert'}
                          </span>
                          {alert.status === 'new' && (
                            <button
                              type="button"
                              disabled={isAcknowledging}
                              onClick={(e) => handleAcknowledge(e, alert._id)}
                              className="text-[11px] font-semibold text-[#0D9488] hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-teal-50 dark:hover:bg-teal-950/40 cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Empty Notification State */
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/50 text-[#0D9488] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  No new notifications
                </h4>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  Everything in your Care Circle is calm and running on schedule.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-850/40 text-center">
            <button
              onClick={handleOpenAlerts}
              className="w-full py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0D9488] transition-colors cursor-pointer"
            >
              Open Alerts & Safety Center →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
