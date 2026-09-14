import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, subtitle, action, className = '' }) => {
  return (
    <div className={`glass-panel rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            {title && <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
