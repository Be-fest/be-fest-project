'use client';

import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string;
  icon: IconType;
  trend?: string;
  delay?: number;
  color?: string;
}

export function StatCard({ title, value, icon: Icon, trend, delay = 0, color }: StatCardProps) {
  const isPositiveTrend = trend?.startsWith('+');
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              isPositiveTrend ? 'text-green-600' : 'text-red-600'
            }`}>
              <span>{trend}</span>
              <span className="text-gray-500">vs mês anterior</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color ? 'bg-gray-100' : 'bg-primary-light'}`}>
          <Icon className={`text-2xl ${color || 'text-white'}`} />
        </div>
      </div>
    </motion.div>
  );
} 