import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Zap, CheckCircle2, AlertCircle } from 'lucide-react';

interface AdherenceCardProps {
  adherenceRate: number;
  totalDoses: number;
  takenDoses: number;
}

export function AdherenceCard({
  adherenceRate,
  totalDoses,
  takenDoses,
}: AdherenceCardProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'Today'];

  return (
    <Card className="shadow-sm border-slate-200/90 dark:border-slate-800">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Adherence & Schedule
          </h2>
          <Badge
            variant="teal"
            className="flex items-center gap-1 text-xs py-0.5 px-2.5 font-medium"
          >
            <Zap className="h-3 w-3 fill-white" />
            <span>Active Streak</span>
          </Badge>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          {/* Adherence Percentage ring/stat */}
          <div className="flex items-baseline gap-2.5 sm:border-r sm:border-slate-200 sm:dark:border-slate-800 sm:pr-6 shrink-0">
            <span className="text-4xl font-extrabold tracking-tight text-[#0D9488] tabular-nums">
              {adherenceRate}%
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {takenDoses} of {totalDoses} doses logged
              </span>
            </div>
          </div>

          {/* 7-day mini indicator matching ui.html */}
          <div className="flex-1">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              {days.map((day, idx) => {
                const isToday = idx === 6;

                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-1.5 flex-1"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`h-2.5 w-2.5 rounded-full transition-all ${
                          isToday
                            ? adherenceRate >= 100
                              ? 'bg-emerald-500 ring-2 ring-emerald-200'
                              : takenDoses > 0
                              ? 'bg-amber-500 ring-2 ring-amber-200'
                              : 'bg-slate-300 dark:bg-slate-700'
                            : 'bg-emerald-500'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-semibold ${
                        isToday
                          ? 'text-[#0D9488] font-bold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Status prompt */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            {adherenceRate === 100 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
            )}
            {adherenceRate === 100
              ? 'All scheduled doses for today have been taken!'
              : 'Consistent timing maintains effective therapeutic levels.'}
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {totalDoses - takenDoses} pending
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
