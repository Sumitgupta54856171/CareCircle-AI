import { Badge } from '../ui/badge';
import { Check, Clock, Circle } from 'lucide-react';
import type { TaskItem } from '../../lib/api';

interface TaskItemRowProps {
  task: TaskItem;
  team: 'patient' | 'caregiver';
  onToggle: (team: 'patient' | 'caregiver', taskId: string) => void;
  isToggling?: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  exercise: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  rehab: 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300',
  medication: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  rest: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
  checkin: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  monitoring: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300',
  support: 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300',
  self_care: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  general: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

export function TaskItemRow({
  task,
  team,
  onToggle,
  isToggling = false,
}: TaskItemRowProps) {
  const isDone = task.status === 'completed';
  const categoryClass = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.general;

  return (
    <div
      onClick={() => onToggle(team, task.id)}
      className={`group flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
        isDone
          ? 'bg-slate-50/70 border-slate-200/60 dark:bg-slate-900/40 dark:border-slate-800/60 opacity-80'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs dark:bg-slate-900 dark:border-slate-800'
      }`}
    >
      {/* Checkbox Icon */}
      <button
        type="button"
        disabled={isToggling}
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
          isDone
            ? 'bg-[#0D9488] border-[#0D9488] text-white'
            : 'border-slate-300 bg-white text-transparent group-hover:border-[#0D9488] dark:border-slate-700 dark:bg-slate-800'
        }`}
        aria-label={`Mark task ${task.title} as ${isDone ? 'incomplete' : 'complete'}`}
      >
        {isDone ? <Check className="h-4 w-4 stroke-[2.5]" /> : <Circle className="h-3 w-3 opacity-0 group-hover:opacity-40" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <Badge
            variant="outline"
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0 border-transparent ${categoryClass}`}
          >
            {task.category.replace('_', ' ')}
          </Badge>

          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Clock className="h-3 w-3" />
              ~{task.estimatedMinutes} mins
            </span>
          )}
        </div>

        <h4
          className={`font-semibold text-sm leading-snug transition-colors ${
            isDone
              ? 'line-through text-slate-400 dark:text-slate-500'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {task.title}
        </h4>

        {task.description && (
          <p
            className={`text-xs mt-1 transition-colors ${
              isDone ? 'text-slate-400/80 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {task.description}
          </p>
        )}
      </div>
    </div>
  );
}
