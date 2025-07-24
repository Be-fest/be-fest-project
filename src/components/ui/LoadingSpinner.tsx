'use client';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="w-8 h-8 border-3 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
} 