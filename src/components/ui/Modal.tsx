import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`w-full ${sizeMap[size]} bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans transition-all duration-200`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 shrink-0">
          <div className="pr-4">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 font-medium">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/50 flex items-center justify-end gap-2.5 shrink-0 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
