export default function PartyDetailsLoading() {
  return (
    <div className="min-h-screen bg-[#FFF6FB]">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm sticky top-0 z-10 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <div className="h-6 w-48 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-9 w-20 bg-gray-300 rounded-lg"></div>
              <div className="h-9 w-20 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações da Festa Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card Detalhes da Festa */}
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 w-36 bg-gray-300 rounded mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div>
                      <div className="h-3 w-12 bg-gray-200 rounded mb-1"></div>
                      <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="h-3 w-20 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Card Serviços */}
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-24 bg-gray-300 rounded"></div>
                <div className="h-9 w-36 bg-gray-300 rounded-lg"></div>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="h-5 w-40 bg-gray-300 rounded mb-2"></div>
                        <div className="h-4 w-32 bg-gray-200 rounded mb-2"></div>
                        <div className="h-6 w-24 bg-gray-300 rounded"></div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                        <div className="h-8 w-8 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Status da Festa Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 w-28 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-6 w-20 bg-gray-300 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  <div className="h-4 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
              <div className="h-10 w-full bg-gray-300 rounded-lg mt-4"></div>
            </div>

            {/* Resumo Financeiro Skeleton */}
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 w-32 bg-gray-300 rounded mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <div className="h-5 w-10 bg-gray-300 rounded"></div>
                    <div className="h-5 w-20 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 