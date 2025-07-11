interface ServicesSkeletonProps {
  count?: number;
}

export function ServicesSkeleton({ count = 6 }: ServicesSkeletonProps) {
  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md border border-gray-100/50 overflow-hidden animate-pulse"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar skeleton */}
                    <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                    <div>
                      {/* Nome skeleton */}
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                      {/* Serviço skeleton */}
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  {/* Rating skeleton */}
                  <div className="bg-gray-200 rounded-lg px-2 py-1 w-12 h-6"></div>
                </div>

                {/* Categoria skeleton */}
                <div className="mb-3">
                  <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                </div>

                {/* Descrição skeleton */}
                <div className="mb-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>

                {/* Footer skeleton */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 