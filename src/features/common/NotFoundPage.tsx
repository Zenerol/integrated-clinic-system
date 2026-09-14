import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-6 text-slate-100">
      <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
        <FileQuestion className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-100 mb-2">404 - Page Not Found</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        The clinical resource or route you requested could not be located.
      </p>
      <Link to="/login">
        <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Safety
        </Button>
      </Link>
    </div>
  );
};
