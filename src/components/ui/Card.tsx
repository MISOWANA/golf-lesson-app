import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-2xl bg-[#1C1C1E] p-4 ring-1 ring-[#2C2C2E] ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';
