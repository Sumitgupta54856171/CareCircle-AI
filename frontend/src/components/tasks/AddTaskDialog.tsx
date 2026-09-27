import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select';
import { useTasks } from '../../hooks/useTasks';
import { CalendarPlus, X, AlertCircle } from 'lucide-react';

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTeam: 'patient' | 'caregiver';
}

const CATEGORIES = [
  { id: 'exercise', label: 'Exercise & Physical Rehab' },
  { id: 'medication', label: 'Medication Routine' },
  { id: 'rest', label: 'Rest & Mental Wellness' },
  { id: 'monitoring', label: 'Vital Monitoring' },
  { id: 'support', label: 'Caregiver Support' },
  { id: 'self_care', label: 'Caregiver Respite & Self-Care' },
  { id: 'general', label: 'General Task' },
];

export function AddTaskDialog({
  isOpen,
  onClose,
  defaultTeam,
}: AddTaskDialogProps) {
  const { addTask, isAdding } = useTasks();
  const [team, setTeam] = useState<'patient' | 'caregiver'>(defaultTeam);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('exercise');
  const [estimatedMinutes, setEstimatedMinutes] = useState('15');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setError('');
    try {
      await addTask({
        team,
        title: title.trim(),
        description: description.trim(),
        category,
        estimatedMinutes: parseInt(estimatedMinutes, 10) || 15,
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add task.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-xl border-slate-200 dark:border-slate-800 my-8">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div>
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-[#0D9488]" />
              <CardTitle className="text-lg">Add Daily Task</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Create an action item for the Patient or Caregiver daily plan.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-2">
            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Target Team */}
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                Assign To
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTeam('patient')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    team === 'patient'
                      ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] ring-1 ring-[#0D9488]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Patient Plan
                </button>
                <button
                  type="button"
                  onClick={() => setTeam('caregiver')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    team === 'caregiver'
                      ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] ring-1 ring-[#0D9488]'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  Caregiver Plan
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Task Title *
              </label>
              <Input
                placeholder="e.g. 15-minute gentle mobility walk outdoors"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Description / Notes
              </label>
              <Input
                placeholder="e.g. Focus on deep breathing and steady posture"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Category & Minutes using shadcn Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Category
                </label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Estimated Minutes
                </label>
                <Input
                  type="number"
                  min="1"
                  max="180"
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="teal"
              disabled={isAdding}
              className="cursor-pointer font-semibold shadow-xs"
            >
              {isAdding ? 'Adding...' : 'Add Task'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
