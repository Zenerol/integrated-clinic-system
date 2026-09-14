import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            {label}
            {props.required && <span className="text-rose-400 font-extrabold ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-teal-400 pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full min-h-[44px] bg-slate-900/90 border ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-700 focus:border-teal-400 focus:ring-teal-400'
            } text-slate-100 placeholder-slate-400 text-sm rounded-xl px-3.5 py-2.5 transition duration-200 outline-none focus:ring-2 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 text-slate-400 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs sm:text-sm text-rose-400 font-semibold flex items-center gap-1">
            <span>⚠️</span> {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-400 font-medium">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
