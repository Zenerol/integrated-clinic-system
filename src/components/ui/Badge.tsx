import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantMap = {
    default: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700',
    success: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/30',
    warning: 'bg-amber-100 dark:bg-amber-500/15 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
    danger: 'bg-rose-100 dark:bg-rose-500/15 text-rose-900 dark:text-rose-300 border-rose-300 dark:border-rose-500/30',
    info: 'bg-teal-100 dark:bg-teal-500/15 text-teal-950 dark:text-teal-300 border-teal-300 dark:border-teal-500/30',
    purple: 'bg-purple-100 dark:bg-purple-500/15 text-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-500/30',
    outline: 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700',
  };

  const sizeMap = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs font-semibold gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-medium ${variantMap[variant]} ${sizeMap[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
