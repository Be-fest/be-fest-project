import React from 'react';
import { MdAdd, MdDelete, MdRefresh } from 'react-icons/md';

interface Service {
  id: string;
  nome: string;
  status: 'Confirmado' | 'Pendente' | 'Recusado' | 'Cancelado';
  categoria: string;
  prestador: {
    id: string;
    nome: string;
    avaliacao: number;
  };
}

interface ServiceManagementProps {
  services: Service[];
  onFindNewProvider: (categoria: string) => void;
  onRemoveService: (serviceId: string) => void;
}

const StatusBadge = ({ status }: { status: Service['status'] }) => {
  const statusStyles: Record<Service['status'], { bg: string; text: string }> = {
    Confirmado: { bg: 'bg-green-100', text: 'text-green-800' },
    Pendente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    Recusado: { bg: 'bg-red-100', text: 'text-red-800' },
    Cancelado: { bg: 'bg-gray-100', text: 'text-gray-800' },
  };

  const style = statusStyles[status];
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
};

export function ServiceManagement({
  services,
  onFindNewProvider,
  onRemoveService,
}: ServiceManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#A502CA]">Serviços Contratados</h2>
        <button
          onClick={() => onFindNewProvider('')}
          className="bg-[#A502CA] text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#8B0A9E] transition-colors"
        >
          <MdAdd />
          Adicionar Serviço
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <p className="text-gray-500">Nenhum serviço contratado ainda.</p>
          <button
            onClick={() => onFindNewProvider('')}
            className="mt-4 text-[#A502CA] hover:underline"
          >
            Começar a adicionar serviços
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-purple-100 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{service.nome}</h3>
                  <p className="text-sm text-gray-500">
                    Prestador: {service.prestador.nome} • Avaliação: {service.prestador.avaliacao}/5
                  </p>
                </div>
                <StatusBadge status={service.status} />
              </div>

              {service.status === 'Pendente' && (
                <div className="mt-3 p-3 bg-yellow-50 rounded-lg flex items-start gap-2">
                  <p className="text-sm text-yellow-800">
                    Aguardando confirmação do prestador. Você será notificado quando houver uma resposta.
                  </p>
                </div>
              )}

              {service.status === 'Recusado' && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg flex items-start gap-2">
                  <p className="text-sm text-red-800">
                    O prestador não pôde atender sua solicitação. Você pode tentar encontrar outro prestador.
                  </p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                {(service.status === 'Recusado' || service.status === 'Cancelado') && (
                  <button
                    onClick={() => onFindNewProvider(service.categoria)}
                    className="text-sm bg-[#A502CA] text-white px-3 py-1 rounded-full hover:bg-[#8B0A9E] transition-colors flex items-center gap-1"
                  >
                    <MdRefresh className="text-lg" />
                    Encontrar Novo Prestador
                  </button>
                )}

                <button
                  onClick={() => onRemoveService(service.id)}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
                >
                  <MdDelete className="text-lg" />
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 