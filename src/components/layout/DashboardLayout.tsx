import React from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationBanner } from '../common/NotificationBanner';
import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';

export const DashboardLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Dynamic Top-Bar Notification Banner pinned above Navbar */}
      <NotificationBanner />

      {/* Main Role-aware Navbar */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
