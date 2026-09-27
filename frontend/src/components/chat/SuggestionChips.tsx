interface SuggestionChipsProps {
  role: 'patient' | 'caregiver';
  patientName?: string;
  onSelectChip: (text: string) => void;
  disabled?: boolean;
}

export function SuggestionChips({
  role,
  patientName = 'the patient',
  onSelectChip,
  disabled = false,
}: SuggestionChipsProps) {
  const patientChips = [
    'What are my medications today?',
    'I’m feeling a little tired',
    'What’s my plan for today?',
    'Tips for better sleep and recovery',
  ];

  const caregiverChips = [
    `How is ${patientName} doing today?`,
    'What needs my attention today?',
    'I’m feeling a bit overwhelmed',
    `Check ${patientName}'s medication schedule`,
  ];

  const chips = role === 'caregiver' ? caregiverChips : patientChips;

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          disabled={disabled}
          onClick={() => onSelectChip(chip)}
          className="whitespace-nowrap rounded-full border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs hover:border-[#0D9488]/40 hover:bg-[#0D9488]/10 hover:text-[#0D9488] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
