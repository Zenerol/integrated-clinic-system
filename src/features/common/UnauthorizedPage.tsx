import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-100 mb-2">Access Restricted</h2>
      <p className="text-sm text-slate-400 max-w-md mb-6">
        You do not have the necessary clinical role permissions to access this area. If you believe this is an error, please contact the clinic administrator.
      </p>
      <Link to="/login">
        <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
          Return to Portal
        </Button>
      </Link>
    </div>
  );
};
