export default function ServicosLoading() {
  return (
    <div className="min-h-screen bg-[#FFF6FB]">
      {/* Cabeçalho estático */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="py-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <span className="text-pink-600 font-bold">🎉</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Serviços para Festas</h1>
              <p className="text-gray-600">Encontre os melhores prestadores para sua festa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        {/* Filtros com estrutura estática */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar serviços
              </label>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Título da seção */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Prestadores de Serviços</h2>
          <p className="text-gray-600">Explore nossa seleção de prestadores qualificados</p>
        </div>

        {/* Grid de prestadores com skeleton apenas nos dados dinâmicos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              {/* Imagem - skeleton */}
              <div className="aspect-w-16 aspect-h-9 bg-gray-200 animate-pulse" />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    {/* Nome do prestador - skeleton */}
                    <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                    {/* Categoria - skeleton */}
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                  </div>
                  {/* Avaliação - skeleton */}
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                
                {/* Descrição - skeleton */}
                <div className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-4 animate-pulse" />
                
                <div className="flex items-center justify-between">
                  {/* Preço - skeleton */}
                  <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
                  
                  {/* Botão estático */}
                  <button className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
                    Ver Detalhes
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}