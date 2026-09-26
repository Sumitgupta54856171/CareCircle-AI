const COMMON_CONDITIONS = [
  'Stroke Recovery',
  'Type 2 Diabetes',
  'Elderly Care',
  'Hypertension',
  'Postnatal Recovery',
  'Mobility Support',
];

interface ConditionSelectorProps {
  selectedConditions: string[];
  onChange: (conditions: string[]) => void;
}

export function ConditionSelector({ selectedConditions, onChange }: ConditionSelectorProps) {
  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      onChange(selectedConditions.filter((c) => c !== cond));
    } else {
      onChange([...selectedConditions, cond]);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Primary Conditions / Care Focus
      </label>
      <div className="flex flex-wrap gap-1.5">
        {COMMON_CONDITIONS.map((cond) => {
          const active = selectedConditions.includes(cond);
          return (
            <button
              key={cond}
              type="button"
              onClick={() => toggleCondition(cond)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-all cursor-pointer ${
                active
                  ? 'bg-[#0D9488] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cond}
            </button>
          );
        })}
      </div>
    </div>
  );
}
