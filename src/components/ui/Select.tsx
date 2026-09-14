import React, { forwardRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {label}
            {props.required && <span className="text-rose-600 dark:text-rose-400 font-black ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border ${
            error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200/80 dark:border-slate-700 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-700/20'
          } text-slate-900 dark:text-slate-100 text-sm font-semibold rounded-xl px-3.5 py-2.5 transition duration-200 outline-none shadow-xs ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        {error ? (
          <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
