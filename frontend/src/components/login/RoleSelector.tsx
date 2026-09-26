import { User, ShieldCheck } from 'lucide-react';

interface RoleSelectorProps {
  role: 'patient' | 'caregiver';
  onChange: (role: 'patient' | 'caregiver') => void;
}

export function RoleSelector({ role, onChange }: RoleSelectorProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700 uppercase tracking-wider">
        Your Role
      </label>
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onChange('patient')}
          className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all cursor-pointer ${
            role === 'patient'
              ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0F766E] font-semibold ring-1 ring-[#0D9488]'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="h-5 w-5 mb-1 text-[#0D9488]" />
          <span className="text-sm">Patient</span>
          <span className="text-[11px] text-slate-500 font-normal">Receiving care</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('caregiver')}
          className={`flex flex-col items-center justify-center rounded-xl border p-3.5 text-center transition-all cursor-pointer ${
            role === 'caregiver'
              ? 'border-[#0D9488] bg-[#0D9488]/10 text-[#0F766E] font-semibold ring-1 ring-[#0D9488]'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="h-5 w-5 mb-1 text-[#0D9488]" />
          <span className="text-sm">Caregiver</span>
          <span className="text-[11px] text-slate-500 font-normal">Supporting patient</span>
        </button>
      </div>
    </div>
  );
}
