interface LogoMarkProps {
  size?: number;
  className?: string;
}

export function LogoMark({ size = 32, className = '' }: LogoMarkProps) {
  const width = (size * 56) / 36;

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 56 36"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Patient Circle - Teal */}
      <circle cx="21" cy="18" r="12.2" stroke="#0D9488" strokeWidth="3.4" />
      {/* Caregiver Circle - Blue */}
      <circle cx="35" cy="18" r="12.2" stroke="#3B82F6" strokeWidth="3.4" />
      {/* Central Heart - Rose */}
      <path
        d="M28 21.8c-3.4-2-5.2-4-5.2-6.3A2.9 2.9 0 0 1 28 13a2.9 2.9 0 0 1 5.2 2.5c0 2.3-1.8 4.3-5.2 6.3z"
        fill="#FB7185"
      />
    </svg>
  );
}
