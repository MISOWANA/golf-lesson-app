import { HTMLAttributes, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ className = '', children, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 ${className}`}
    {...props}
  >
    {children}
  </div>
));
Card.displayName = 'Card';
