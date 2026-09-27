import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  ChevronRight,
  Check,
  Eye,
  Phone,
  MessageSquare,
  Calendar,
  Pill,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { AlertItem } from '../../lib/api';

interface AlertCardProps {
  alert: AlertItem;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  isProcessing?: boolean;
}

export function AlertCard({
  alert,
  onAcknowledge,
  onResolve,
  isProcessing = false,
}: AlertCardProps) {
  const navigate = useNavigate();

  const isResolved = alert.status === 'resolved';
  const isAcknowledged = alert.status === 'acknowledged';

  // Severity styles
  const getSeverityConfig = () => {
    switch (alert.severity) {
      case 'emergency':
      case 'high':
        return {
          cardBorder: 'border-rose-300 dark:border-rose-900/60',
          bg: 'bg-rose-50/70 dark:bg-rose-950/20',
          iconColor: 'text-rose-600 dark:text-rose-400',
          badgeVariant: 'destructive' as const,
          label: alert.severity === 'emergency' ? 'Emergency Signal' : 'Needs Attention',
          Icon: AlertTriangle,
        };
      case 'medium':
        return {
          cardBorder: 'border-amber-300 dark:border-amber-900/60',
          bg: 'bg-amber-50/60 dark:bg-amber-950/20',
          iconColor: 'text-amber-600 dark:text-amber-400',
          badgeVariant: 'outline' as const,
          badgeClass: 'border-amber-400 bg-amber-100/70 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
          label: 'Keep an Eye',
          Icon: AlertCircle,
        };
      default:
        return {
          cardBorder: 'border-teal-200 dark:border-teal-900/50',
          bg: 'bg-teal-50/50 dark:bg-teal-950/15',
          iconColor: 'text-teal-600 dark:text-teal-400',
          badgeVariant: 'outline' as const,
          badgeClass: 'border-teal-300 bg-teal-100/60 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
          label: 'Gentle Heads-up',
          Icon: Info,
        };
    }
  };

  const config = getSeverityConfig();
  const IconComponent = config.Icon;

  const formattedDate = new Date(alert.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'nav_plan':
        navigate('/plan');
        break;
      case 'nav_meds':
        navigate('/medications');
        break;
      case 'nav_chat':
        navigate('/chat');
        break;
      case 'call':
        alert.triggeredFor?.fullName
          ? window.open(`tel:`)
          : navigate('/chat');
        break;
      default:
        navigate('/chat');
    }
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'nav_plan':
        return <Calendar className="w-3.5 h-3.5" />;
      case 'nav_meds':
        return <Pill className="w-3.5 h-3.5" />;
      case 'nav_chat':
        return <MessageSquare className="w-3.5 h-3.5" />;
      case 'call':
        return <Phone className="w-3.5 h-3.5" />;
      default:
        return <ChevronRight className="w-3.5 h-3.5" />;
    }
  };

  return (
    <Card
      className={`border transition-all duration-200 shadow-xs ${config.cardBorder} ${config.bg} ${
        isResolved ? 'opacity-70 grayscale-[20%]' : ''
      }`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs shrink-0 ${config.iconColor}`}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {alert.title}
                </CardTitle>
                <Badge
                  variant={config.badgeVariant}
                  className={`text-[11px] py-0 px-2 font-medium ${config.badgeClass || ''}`}
                >
                  {config.label}
                </Badge>
                {isResolved && (
                  <Badge variant="outline" className="text-[11px] py-0 border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40">
                    <Check className="w-3 h-3 mr-1 text-emerald-500" />
                    Resolved
                  </Badge>
                )}
                {isAcknowledged && (
                  <Badge variant="outline" className="text-[11px] py-0 text-slate-600 bg-slate-100 dark:bg-slate-800">
                    <Eye className="w-3 h-3 mr-1 text-slate-500" />
                    Acknowledged
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                {formattedDate}
                {alert.triggeredFor?.fullName && (
                  <>
                    <span>•</span>
                    <span>For: {alert.triggeredFor.fullName}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-2 space-y-3 text-xs sm:text-sm">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {alert.message}
        </p>

        {/* Suggested Action Chips matching build/ui.html */}
        {alert.suggestedActions && alert.suggestedActions.length > 0 && !isResolved && (
          <div className="flex flex-wrap gap-2 pt-1">
            {alert.suggestedActions.map((act, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleActionClick(act.actionType)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                {getActionIcon(act.actionType)}
                <span>{act.label}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 ml-0.5" />
              </button>
            ))}
          </div>
        )}
      </CardContent>

      {/* Action Footer (Acknowledge / Resolve) */}
      {!isResolved && (
        <CardFooter className="pt-2 pb-3 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-end gap-2">
          {alert.status === 'new' && (
            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() => onAcknowledge(alert._id)}
              className="text-xs h-8 cursor-pointer bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100"
            >
              <Eye className="w-3.5 h-3.5 mr-1" />
              Acknowledge
            </Button>
          )}

          <Button
            variant="teal"
            size="sm"
            disabled={isProcessing}
            onClick={() => onResolve(alert._id)}
            className="text-xs h-8 cursor-pointer font-semibold shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            Resolve
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
