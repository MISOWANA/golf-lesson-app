'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, useState } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full min-w-0">
        {label && <label className="mb-1.5 block text-sm font-medium text-[#AEAEB2]">{label}</label>}
        <div className="relative min-w-0">
          <input
            ref={ref}
            type={inputType}
            className={`w-full min-w-0 rounded-xl border border-[#2C2C2E] bg-[#252525] text-white px-4 py-3 text-sm outline-none transition placeholder:text-[#636366] focus:border-[#D4AF37] focus:bg-[#2A2A2A] focus:ring-2 focus:ring-[#D4AF37]/20 ${isPassword ? 'pr-11' : ''} ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#636366] hover:text-[#AEAEB2]"
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
            >
              <EyeIcon open={showPassword} />
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="w-full">
      {label && <label className="mb-1.5 block text-sm font-medium text-[#AEAEB2]">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full rounded-xl border border-[#2C2C2E] bg-[#252525] text-white px-4 py-3 text-sm outline-none transition placeholder:text-[#636366] focus:border-[#D4AF37] focus:bg-[#2A2A2A] focus:ring-2 focus:ring-[#D4AF37]/20 ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = 'Textarea';
