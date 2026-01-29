'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export const GlassCard = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'relative rounded-2xl border border-white/5 bg-[#0a101f] shadow-lg shadow-black/20 overflow-hidden transition-all duration-300 hover:border-blue-500/30 hover:shadow-blue-500/10 hover:bg-[#0a101f]/80 group',
      className
    )}
    {...props
    }
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500" />
    <div className="relative z-10">{children}</div>
  </div>
);

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
    destructive: 'bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20',
    outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-white',
    secondary: 'bg-white/10 text-white hover:bg-white/20',
    ghost: 'hover:bg-white/5 text-white',
    link: 'text-blue-400 underline-offset-4 hover:underline',
  };
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 hover:-translate-y-0.5 active:translate-y-0',
        variants[variant],
        className
      )}
      {...props}
    />
  );
});
Button.displayName = 'Button';

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}) => {
  const variants = {
    default:
      'border-transparent bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    secondary: 'border-transparent bg-white/10 text-slate-300',
    destructive:
      'border-transparent bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    outline: 'text-white',
  };
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-bold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

export const Progress = ({
  value,
  className,
  indicatorColor,
}: {
  value: number;
  className?: string;
  indicatorColor?: string;
}) => (
  <div className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-white/10', className)}>
    <div
      className={cn(
        'h-full w-full flex-1 transition-all bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]',
        indicatorColor
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
);

