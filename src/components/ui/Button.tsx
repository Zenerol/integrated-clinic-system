import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline' | 'ghost';
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
    primary: 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/25 border border-teal-400/30 focus:ring-teal-400',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600/80 focus:ring-slate-400',
    danger: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-lg shadow-rose-600/25 border border-rose-400/30 focus:ring-rose-500',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/30 focus:ring-emerald-500',
    outline: 'bg-slate-900/80 hover:bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-500 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-slate-800/80 text-slate-200 hover:text-white focus:ring-slate-400',
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
