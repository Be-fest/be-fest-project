'use client';

export function CategoriesSkeleton() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título estático */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Categorias de Serviços
          </h2>
          <p className="text-gray-600">
            Encontre o serviço perfeito para sua festa
          </p>
        </div>

        {/* Grid de categorias com skeleton apenas nos dados dinâmicos */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              {/* Ícone da categoria - skeleton */}
              <div className="w-16 h-16 mx-auto mb-3 rounded-lg bg-gray-200 animate-pulse"></div>
              
              {/* Nome da categoria - skeleton */}
              <div className="h-4 bg-gray-200 rounded w-20 mx-auto mb-2 animate-pulse"></div>
              
              {/* Contador de serviços - skeleton */}
              <div className="h-3 bg-gray-100 rounded w-16 mx-auto animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}