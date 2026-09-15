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
    const showRequiredAsterisk = props.required && !label?.includes('*');

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <span>{label}</span>
            {showRequiredAsterisk && <span className="text-rose-500 font-bold ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full min-h-[42px] bg-slate-50/60 hover:bg-white dark:bg-slate-900/60 border ${
            error
              ? 'border-rose-500 focus:ring-rose-500'
              : 'border-slate-200/90 dark:border-slate-700/80 focus:border-teal-600 dark:focus:border-teal-400 focus:ring-2 focus:ring-teal-600/15'
          } text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium rounded-xl px-3.5 py-2.5 transition duration-150 outline-none shadow-xs ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium">
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
