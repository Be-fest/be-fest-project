'use client';

import { useState } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { MdMenu, MdClose } from 'react-icons/md';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="theme-admin min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <AdminSidebar />
        </div>

        {/* Mobile Sidebar */}
        {isSidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <div className="fixed left-0 top-0 h-full w-80 z-50 lg:hidden">
              <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
            </div>
          </>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center justify-between px-4 lg:px-6 py-4">
              <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Abrir menu"
                >
                  <MdMenu className="text-xl text-gray-600" />
                </button>
                
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Painel Administrativo
                  </h1>
                  <p className="text-sm text-gray-500">
                    Gerencie sua plataforma Be Fest
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* User menu or other header actions can go here */}
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF4DA6] to-[#A502CA] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
            <div className="p-4 lg:p-6 h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}