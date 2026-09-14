import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { NotificationBanner } from '../common/NotificationBanner';
import { Navbar } from '../common/Navbar';
import { Sidebar } from '../common/Sidebar';
import { Footer } from '../common/Footer';

export const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Dynamic Top-Bar Notification Banner */}
      <NotificationBanner />

      {/* Role-aware Sidebar Navigation (Fixed Left Desktop + Mobile Drawer) */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Layout Wrapper Offset by Sidebar Width on Desktop */}
      <div className="flex-1 flex flex-col lg:pl-64 transition-all duration-200">
        {/* Main Navbar */}
        <Navbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

        {/* Main Content Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};
