interface CategoriesSkeletonProps {
  count?: number;
}

export function CategoriesSkeleton({ count = 9 }: CategoriesSkeletonProps) {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mx-auto mb-4"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 animate-pulse"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 