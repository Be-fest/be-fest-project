import React from 'react';
import { Input } from '../ui/Input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MdClose, MdLocationOn } from 'react-icons/md';

const partySchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  data: z.string().min(1, 'Data é obrigatória'),
  horario: z.string().min(1, 'Horário é obrigatório'),
  // Campos separados de endereço
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().min(1, 'Estado é obrigatório'),
  zipcode: z.string().min(8, 'CEP deve ter 8 dígitos'),
  // Campo gerado automaticamente
  endereco: z.string().optional(),
  convidados: z.number().min(1, 'Número de convidados deve ser maior que 0'),
  observacoes: z.string().optional(),
});

type PartyFormData = z.infer<typeof partySchema>;

interface PartyEditFormProps {
  initialData: {
    nome: string;
    data: string;
    horario: string;
    endereco: string;
    convidados: number;
    observacoes?: string;
  };
  onSubmit: (data: PartyFormData) => void;
  onClose: () => void;
}

// Função para gerar endereço completo
const generateFullAddress = (data: {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipcode?: string;
}) => {
  const parts = [];
  
  if (data.street) {
    let streetPart = data.street;
    if (data.number) {
      streetPart += `, ${data.number}`;
    }
    parts.push(streetPart);
  }
  
  if (data.neighborhood) {
    parts.push(data.neighborhood);
  }
  
  if (data.city) {
    let cityPart = data.city;
    if (data.state) {
      cityPart += `, ${data.state}`;
    }
    parts.push(cityPart);
  }
  
  if (data.zipcode) {
    parts.push(data.zipcode);
  }
  
  return parts.join(' - ');
};

// Função para extrair componentes do endereço
const parseAddress = (endereco: string) => {
  // Esta é uma implementação básica - pode ser melhorada
  const parts = endereco.split(' - ');
  
  let street = '';
  let number = '';
  let neighborhood = '';
  let city = '';
  let state = '';
  let zipcode = '';
  
  if (parts[0]) {
    const streetParts = parts[0].split(', ');
    street = streetParts[0] || '';
    number = streetParts[1] || '';
  }
  
  neighborhood = parts[1] || '';
  
  if (parts[2]) {
    const cityParts = parts[2].split(', ');
    city = cityParts[0] || '';
    state = cityParts[1] || '';
  }
  
  zipcode = parts[3] || '';
  
  return { street, number, neighborhood, city, state, zipcode };
};

export function PartyEditForm({ initialData, onSubmit, onClose }: PartyEditFormProps) {
  // Parse do endereço inicial
  const addressComponents = parseAddress(initialData.endereco);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PartyFormData>({
    resolver: zodResolver(partySchema),
    defaultValues: {
      ...initialData,
      data: initialData.data.split('T')[0], // Ensure date is in YYYY-MM-DD format
      ...addressComponents,
    },
  });

  const handleFormSubmit = (data: PartyFormData) => {
    // Gerar endereço completo antes de enviar
    const fullAddress = generateFullAddress(data);
    const formDataWithAddress = {
      ...data,
      endereco: fullAddress,
    };
    onSubmit(formDataWithAddress);
  };

  return (
          <div className="fixed inset-0 backdrop-blur-md bg-white/20 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#520029]">Editar Festa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose className="text-2xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <Input
            label="Nome da Festa"
            placeholder="Ex: Aniversário da Ana"
            error={errors.nome?.message}
            {...register('nome')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              error={errors.data?.message}
              {...register('data')}
            />

            <Input
              label="Horário"
              type="time"
              error={errors.horario?.message}
              {...register('horario')}
            />
          </div>

          {/* Endereço do Evento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <MdLocationOn className="inline mr-1" />
              Endereço do Evento
            </label>
            
            <div className="space-y-3">
              {/* Rua e Número */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <Input
                    label="Rua/Avenida"
                    placeholder="Ex: Rua das Flores"
                    error={errors.street?.message}
                    {...register('street')}
                  />
                </div>
                <div>
                  <Input
                    label="Número"
                    placeholder="123"
                    error={errors.number?.message}
                    {...register('number')}
                  />
                </div>
              </div>

              {/* Bairro e CEP */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Bairro"
                  placeholder="Ex: Jardins"
                  error={errors.neighborhood?.message}
                  {...register('neighborhood')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    {...register('zipcode')}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 transition-all"
                    placeholder="00000-000"
                    maxLength={9}
                    onChange={(e) => {
                      // Formatação automática do CEP
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length > 5) {
                        value = value.replace(/(\d{5})(\d)/, '$1-$2');
                      }
                      e.target.value = value;
                    }}
                  />
                  {errors.zipcode && (
                    <p className="text-red-500 text-sm mt-1">{errors.zipcode.message}</p>
                  )}
                </div>
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Cidade"
                  placeholder="Ex: São Paulo"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    {...register('state')}
                    className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                  {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
                  )}
                </div>
              </div>

              {/* Preview do endereço */}
              {(() => {
                const street = watch('street');
                const number = watch('number');
                const neighborhood = watch('neighborhood');
                const city = watch('city');
                const state = watch('state');
                const zipcode = watch('zipcode');
                
                const previewData = { street, number, neighborhood, city, state, zipcode };
                const preview = generateFullAddress(previewData);
                
                if (preview) {
                  return (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-800 mb-1">Preview do endereço:</p>
                      <p className="text-sm text-blue-700">{preview}</p>
                    </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <Input
            label="Número de Convidados"
            type="number"
            placeholder="Ex: 50"
            error={errors.convidados?.message}
            {...register('convidados', { valueAsNumber: true })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Observações
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 transition-all"
              rows={4}
              placeholder="Observações adicionais sobre a festa..."
              {...register('observacoes')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}