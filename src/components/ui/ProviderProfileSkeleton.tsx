import { motion } from 'framer-motion';

export function ProviderProfileSkeleton() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Cabeçalho estático */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Perfil do Prestador</h1>
          <p className="text-gray-600">Gerencie suas informações pessoais e empresariais</p>
        </div>
        <button className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors">
          Salvar Alterações
        </button>
      </div>

      {/* Formulário de perfil */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Seção do logo */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Logo da Empresa
          </label>
          <div className="flex items-center gap-4">
            {/* Logo - skeleton */}
            <div className="w-20 h-20 rounded-xl bg-gray-300 animate-pulse"></div>
            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              Alterar Logo
            </button>
          </div>
        </div>

        {/* Campos do formulário com labels estáticos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome da Empresa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa *
            </label>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Nome do Proprietário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Proprietário *
            </label>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp *
            </label>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CNPJ
            </label>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Área de Atuação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área de Atuação *
            </label>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Descrição */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição da Empresa
          </label>
          <div className="h-24 w-full bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>

      {/* Estatísticas com skeleton apenas nos valores */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Estatísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Serviços Ativos" },
            { label: "Avaliação Média" },
            { label: "Total de Clientes" },
            { label: "Receita do Mês" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              {/* Valor - skeleton */}
              <div className="h-8 w-16 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}