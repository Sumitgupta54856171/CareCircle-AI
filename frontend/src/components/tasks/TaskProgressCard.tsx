import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Users, CheckCircle2 } from 'lucide-react';
import type { ProgressMetric } from '../../lib/api';

interface TaskProgressCardProps {
  currentTab: 'patient' | 'caregiver';
  onTabChange: (tab: 'patient' | 'caregiver') => void;
  patientName: string;
  caregiverName: string;
  patientMetric: ProgressMetric;
  caregiverMetric: ProgressMetric;
  overallMetric: ProgressMetric;
}

export function TaskProgressCard({
  currentTab,
  onTabChange,
  patientName,
  caregiverName,
  patientMetric,
  caregiverMetric,
  overallMetric,
}: TaskProgressCardProps) {
  const activeMetric = currentTab === 'patient' ? patientMetric : caregiverMetric;
  const isPatient = currentTab === 'patient';

  return (
    <div className="space-y-4">
      {/* Segmented Switcher matching ui.html lines 1035-1038 */}
      <div className="grid grid-cols-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 p-1">
        <button
          type="button"
          onClick={() => onTabChange('patient')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            currentTab === 'patient'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <span>{patientName} · Patient</span>
          <Badge variant="teal" className="text-[10px] py-0 px-1.5 font-bold">
            {patientMetric.completed}/{patientMetric.total}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('caregiver')}
          className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            currentTab === 'caregiver'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
              : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <span>{caregiverName} · Caregiver</span>
          <Badge variant="amber" className="text-[10px] py-0 px-1.5 font-bold">
            {caregiverMetric.completed}/{caregiverMetric.total}
          </Badge>
        </button>
      </div>

      {/* Progress Metric Card matching ui.html lines 1039-1044 */}
      <Card className="border-slate-200/90 dark:border-slate-800 shadow-sm">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isPatient ? `${patientName}’s Plan` : `${caregiverName}’s Support Plan`}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-[#0D9488]" />
                Circle progress today: <strong className="text-slate-700 dark:text-slate-300">{overallMetric.completed} of {overallMetric.total}</strong> — together.
              </p>
            </div>

            <div className="text-right">
              <span className="text-xl sm:text-2xl font-extrabold text-[#0D9488] tabular-nums">
                {activeMetric.percentage}%
              </span>
              <p className="text-[11px] font-semibold text-slate-400">
                {activeMetric.completed} of {activeMetric.total} complete
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPatient ? 'bg-[#0D9488]' : 'bg-amber-500'
              }`}
              style={{ width: `${activeMetric.percentage}%` }}
            />
          </div>

          {activeMetric.percentage === 100 && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>All tasks for this role are finished today! Remember to rest and recharge.</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
