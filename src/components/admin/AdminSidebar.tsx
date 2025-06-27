'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  MdDashboard, 
  MdReceipt, 
  MdPeople, 
  MdBusinessCenter,
  MdLogout 
} from 'react-icons/md';

interface MenuItem {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: string;
}

export function AdminSidebar() {
  const pathname = usePathname();
  
  const menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: MdDashboard,
      path: '/admin',
      badge: undefined
    },
    {
      label: 'Pedidos',
      icon: MdReceipt,
      path: '/admin/pedidos',
      badge: '12'
    },
    {
      label: 'Clientes',
      icon: MdPeople,
      path: '/admin/clientes',
      badge: undefined
    },
    {
      label: 'Prestadores',
      icon: MdBusinessCenter,
      path: '/admin/prestadores',
      badge: undefined
    }
  ];

  const handleLogout = () => {
    // Implementar logout
    window.location.href = '/';
  };

  return (
    <aside className="w-64 bg-white shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-primary">
          Admin Be Fest
        </h1>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`
                flex items-center justify-between p-3 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-primary-light text-white font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="text-xl" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium"
                >
                  {item.badge}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <MdLogout className="text-xl" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
} 