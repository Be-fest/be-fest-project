'use client';

export function CategoriesSkeleton() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title Skeleton */}
        <div className="text-center mb-8">
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse"></div>
        </div>

        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 text-center shadow-md animate-pulse"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gray-200"></div>
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 