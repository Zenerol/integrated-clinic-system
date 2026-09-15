import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost' | 'cancel';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98] min-h-[44px] cursor-pointer';

  const variantClasses = {
    primary: 'bg-teal-700 hover:bg-teal-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-extrabold shadow-xs hover:shadow-sm border border-teal-800/30 dark:border-teal-400/30 focus:ring-2 focus:ring-teal-700/30',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300/80 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 shadow-xs focus:ring-2 focus:ring-slate-400/30',
    danger: 'bg-rose-700 hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-extrabold shadow-xs hover:shadow-sm border border-rose-800/30 dark:border-rose-400/30 focus:ring-2 focus:ring-rose-500/30',
    cancel: 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200/90 dark:bg-slate-800/90 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 font-bold shadow-xs focus:ring-2 focus:ring-slate-400/20',
    success: 'bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold shadow-xs hover:shadow-sm border border-emerald-800/30 dark:border-emerald-400/30 focus:ring-2 focus:ring-emerald-500/30',
    outline: 'bg-white hover:bg-teal-50 text-teal-800 border border-teal-700/80 dark:bg-slate-900/90 dark:hover:bg-slate-800 dark:text-teal-300 dark:border-teal-500/80 shadow-xs focus:ring-2 focus:ring-teal-500/30',
    ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white focus:ring-2 focus:ring-slate-400/30',
  };

  const sizeClasses = {
    sm: 'px-3.5 py-2 text-xs gap-1.5 min-h-[40px]',
    md: 'px-5 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[48px]',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
