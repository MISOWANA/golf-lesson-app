'use client';

interface ScoreBarProps {
  label: string;
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
}

export function ScoreBar({ label, value, onChange, readOnly }: ScoreBarProps) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="w-16 shrink-0 text-sm text-[#AEAEB2]">{label}</span>
      <div className="flex flex-1 gap-0.5">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(n)}
            className={`h-7 flex-1 rounded transition-colors ${
              n <= value ? 'bg-[#D4AF37]' : 'bg-[#2C2C2E]'
            } ${readOnly ? 'cursor-default' : 'hover:bg-[#C8A030]'}`}
          />
        ))}
      </div>
      <span className="w-6 shrink-0 text-right text-sm font-bold text-[#D4AF37]">{value}</span>
    </div>
  );
}
