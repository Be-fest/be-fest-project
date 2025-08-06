interface ServicesSkeletonProps {
  count?: number;
}

export function ServicesSkeleton({ count = 6 }: ServicesSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Imagem do serviço - skeleton */}
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            <div className="w-full h-full bg-gray-300 animate-pulse"></div>
          </div>

          {/* Conteúdo do card */}
          <div className="p-6">
            <div className="mb-3">
              {/* Nome do serviço - skeleton */}
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-1 animate-pulse"></div>
              {/* Nome do prestador - skeleton */}
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>

            {/* Categoria - skeleton */}
            <div className="mb-4">
              <div className="inline-block bg-gray-200 h-6 w-16 rounded-full animate-pulse"></div>
            </div>

            {/* Descrição - skeleton */}
            <div className="mb-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>

            {/* Preço - skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-300 rounded w-32 animate-pulse"></div>
            </div>

            {/* Botões de ação - estrutura estática */}
            <div className="flex gap-2">
              <div className="flex-1 bg-gray-200 py-3 px-4 rounded-lg animate-pulse">
                <div className="h-5 bg-gray-300 rounded w-20 mx-auto"></div>
              </div>
              
              <div className="bg-gray-200 w-12 h-12 rounded-full animate-pulse flex items-center justify-center">
                <div className="w-5 h-5 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}