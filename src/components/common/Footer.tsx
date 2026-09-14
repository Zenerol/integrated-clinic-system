import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 py-6 px-4 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Hybrid School & Community Clinic Management System. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
          <span className="hover:text-slate-400 cursor-pointer">Clinical Guidelines</span>
          <span className="hover:text-slate-400 cursor-pointer">Support</span>
        </div>
      </div>
    </footer>
  );
};
