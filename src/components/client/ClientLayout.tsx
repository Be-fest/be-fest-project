'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdMenu, MdClose } from 'react-icons/md';
import { ClientSidebar } from './ClientSidebar';

interface ClientLayoutProps {
  children: React.ReactNode;
  user?: {
    full_name?: string | null;
    email?: string | null;
  };
}

export function ClientLayout({ children, user }: ClientLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userInitial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : 
                     user?.email ? user.email.charAt(0).toUpperCase() : 'U';
  const userName = user?.full_name || user?.email?.split('@')[0] || 'Usuário';

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <div className="fixed inset-y-0 left-0 w-64 z-30">
          <ClientSidebar 
            userInitial={userInitial}
            userName={userName}
          />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -264 }}
            animate={{ x: 0 }}
            exit={{ x: -264 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
          >
            <ClientSidebar 
              onClose={() => setSidebarOpen(false)}
              userInitial={userInitial}
              userName={userName}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MdMenu className="text-xl text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-[#520029]">Área do Cliente</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 