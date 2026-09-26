import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { medicationApi } from '../../lib/api';
import { Pill, Plus, X, AlertCircle } from 'lucide-react';

interface AddMedicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COMMON_PRESETS = [
  { name: 'Atorvastatin', dosage: '20mg', instructions: 'Take with dinner and water', times: ['20:00'] },
  { name: 'Lisinopril', dosage: '10mg', instructions: 'Take in the morning with food', times: ['08:00'] },
  { name: 'Metformin', dosage: '500mg', instructions: 'Take with meals twice a day', times: ['08:00', '20:00'] },
  { name: 'Aspirin (Low Dose)', dosage: '81mg', instructions: 'Take with a glass of water', times: ['08:00'] },
];

export function AddMedicationDialog({
  isOpen,
  onClose,
  onSuccess,
}: AddMedicationDialogProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [times, setTimes] = useState<string[]>(['08:00']);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePresetSelect = (preset: typeof COMMON_PRESETS[0]) => {
    setName(preset.name);
    setDosage(preset.dosage);
    setInstructions(preset.instructions);
    setTimes(preset.times);
  };

  const toggleTime = (timeStr: string) => {
    if (times.includes(timeStr)) {
      if (times.length > 1) {
        setTimes(times.filter((t) => t !== timeStr));
      }
    } else {
      setTimes([...times, timeStr].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) {
      setError('Please provide medication name and dosage.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await medicationApi.add({
        name: name.trim(),
        dosage: dosage.trim(),
        instructions: instructions.trim() || 'Take with water and food',
        times,
      });
      // Reset form
      setName('');
      setDosage('');
      setInstructions('');
      setTimes(['08:00']);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to add medication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <Card className="w-full max-w-lg shadow-xl border-slate-200 dark:border-slate-800 my-8">
        <CardHeader className="flex flex-row items-start justify-between pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-[#0D9488]" />
              <CardTitle className="text-lg">Add New Medication</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Add a prescribed medication to your Care Circle schedule.
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

            {/* Quick Presets */}
            <div>
              <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className="text-xs rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors cursor-pointer"
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Med Name & Dosage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Medication Name *
                </label>
                <Input
                  placeholder="e.g. Lisinopril"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Dosage *
                </label>
                <Input
                  placeholder="e.g. 10mg / 1 tablet"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Scheduled Times */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Scheduled Daily Times
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { time: '08:00', label: 'Morning (8:00 AM)' },
                  { time: '13:00', label: 'Afternoon (1:00 PM)' },
                  { time: '20:00', label: 'Evening (8:00 PM)' },
                ].map((slot) => {
                  const selected = times.includes(slot.time);
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => toggleTime(slot.time)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        selected
                          ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0D9488] font-semibold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold">{slot.time}</span>
                      <span className="text-[10px] text-slate-500 font-normal">{slot.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Instructions / Notes
              </label>
              <Input
                placeholder="e.g. Take with food and 1 glass of water"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
              />
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
              disabled={submitting}
              className="cursor-pointer font-semibold"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              {submitting ? 'Saving...' : 'Add Medication'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
