'use client';

import { useEffect } from 'react';

export function LoadingSpinner() {
  useEffect(() => {
    // Timer para reload automático a cada 2 segundos
    const timer = setInterval(() => {
      console.log('LoadingSpinner: Reload automático da página');
      window.location.reload();
    }, 2000);

    // Cleanup do timer quando o componente for desmontado
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export function SkeletonLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-4/5"></div>
    </div>
  );
}

// Skeleton para tabelas
export function TableSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-200 rounded mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded mb-2"></div>
      ))}
    </div>
  );
}