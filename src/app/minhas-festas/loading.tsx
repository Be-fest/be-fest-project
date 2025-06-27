export default function MinhasFestasLoading() {
  return (
    <div className="min-h-screen bg-[#FFF6FB] animate-pulse">
      {/* Header Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-64 bg-gray-200 rounded" />
          </div>
          <div className="h-12 w-40 bg-gray-200 rounded-lg" />
        </div>

        {/* Filters Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg" />
            <div className="w-48 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>

        {/* Party Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="h-6 w-48 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full" />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="h-4 w-32 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="h-4 w-48 bg-gray-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-gray-200 rounded-full" />
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 w-20 bg-gray-200 rounded-full" />
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                </div>

                <div className="h-10 w-full bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 