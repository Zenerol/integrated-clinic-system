import React, { forwardRef, useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            {label}
            {props.required && <span className="text-rose-600 dark:text-rose-400 font-black ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-teal-700 dark:text-teal-400 pointer-events-none shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={currentType}
            className={`w-full min-h-[44px] bg-white dark:bg-slate-900 border ${
              error
                ? 'border-rose-500 text-rose-900 dark:text-rose-100 focus:ring-rose-500'
                : 'border-slate-300 dark:border-slate-700 focus:border-teal-700 dark:focus:border-teal-400 focus:ring-teal-700 dark:focus:ring-teal-400'
            } text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm font-semibold rounded-xl px-3.5 py-2.5 transition duration-200 outline-none focus:ring-2 ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon || isPassword ? 'pr-10' : ''} ${className}`}
            {...props}
          />

          {/* Password Eye Toggle Button */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none transition cursor-pointer p-0.5 rounded-lg"
              title={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : rightIcon ? (
            <div className="absolute right-3.5 text-slate-500 dark:text-slate-400 shrink-0">
              {rightIcon}
            </div>
          ) : null}
        </div>

        {error ? (
          <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
