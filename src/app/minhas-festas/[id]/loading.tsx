export default function PartyDetailsLoading() {
  return (
    <div className="min-h-screen bg-[#FFF6FB] animate-pulse">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full" />
              <div>
                <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-10 w-24 bg-gray-200 rounded-lg" />
              <div className="h-10 w-24 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Party Info Skeleton */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div>
                  <div className="h-5 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-32 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Services Skeleton */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <div className="h-8 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-40 bg-gray-200 rounded-lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="h-6 w-32 bg-gray-200 rounded mb-2" />
                        <div className="h-4 w-24 bg-gray-200 rounded" />
                      </div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="h-6 w-20 bg-gray-200 rounded" />
                      <div className="h-6 w-24 bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 