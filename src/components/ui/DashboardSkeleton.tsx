export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFF6FB]">
      <div className="flex">
        {/* Sidebar com estrutura estática */}
        <div className="w-80 bg-white min-h-screen shadow-lg">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
            <p className="text-gray-600 mb-6">Painel do Prestador</p>
            
            <nav className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <span className="text-gray-700">Visão Geral</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <span className="text-gray-700">Meus Serviços</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <span className="text-gray-700">Solicitações</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
                <span className="text-gray-700">Perfil</span>
              </div>
            </nav>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Cabeçalho estático */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Bem-vindo ao seu Dashboard
              </h1>
              <p className="text-gray-600">
                Gerencie seus serviços e acompanhe suas estatísticas
              </p>
            </div>

            {/* Cards de estatísticas com skeleton nos dados dinâmicos */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { title: "Total de Serviços", icon: "📋" },
                { title: "Solicitações Pendentes", icon: "⏳" },
                { title: "Avaliação Média", icon: "⭐" },
                { title: "Receita do Mês", icon: "💰" }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center text-2xl">
                      {stat.icon}
                    </div>
                    <div>
                      {/* Valor dinâmico - skeleton */}
                      <div className="h-6 bg-gray-200 rounded w-8 mb-2 animate-pulse"></div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ações rápidas */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Ações Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Adicionar Serviço", description: "Cadastre um novo serviço", icon: "➕" },
                  { title: "Ver Solicitações", description: "Gerencie suas solicitações", icon: "📨" },
                  { title: "Editar Perfil", description: "Atualize suas informações", icon: "👤" }
                ].map((action, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-xl">
                        {action.icon}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{action.title}</h4>
                        <p className="text-sm text-gray-600">{action.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}