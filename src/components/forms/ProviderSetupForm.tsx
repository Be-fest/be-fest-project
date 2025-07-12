import { useState, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const categoryOptions = [
  { value: '', label: 'Selecione uma subcategoria' },
  // COMIDA E BEBIDA
  { value: 'buffet', label: 'Buffet' },
  { value: 'buffet-de-pizzas', label: 'Buffet de Pizzas' },
  { value: 'churrasco', label: 'Churrasco' },
  { value: 'confeitaria', label: 'Confeitaria' },
  { value: 'estacoes-de-festa', label: 'Estações de Festa' },
  { value: 'open-bar', label: 'Open-Bar' },
  { value: 'chopp', label: 'Chopp' },
  // ENTRETENIMENTO
  { value: 'musica', label: 'Música' },
  { value: 'dj', label: 'DJ' },
  { value: 'animacao', label: 'Animação' },
  // ESPAÇO
  { value: 'salao-de-festas', label: 'Salão de Festas' },
  { value: 'espaco-ao-ar-livre', label: 'Espaço ao Ar Livre' },
  { value: 'casa-de-eventos', label: 'Casa de Eventos' },
  // ORGANIZAÇÃO
  { value: 'decoracao', label: 'Decoração' },
  { value: 'fotografia', label: 'Fotografia' },
  { value: 'seguranca', label: 'Segurança' },
  { value: 'limpeza', label: 'Limpeza' },
  { value: 'other', label: 'Outro' }
]

// Server Action para completar setup do provider
async function completeProviderSetupAction(prevState: { success: boolean; error?: string }, formData: FormData): Promise<{ success: boolean; error?: string }> {
  'use server'
  
  // Por enquanto, apenas simula sucesso
  // Esta função seria implementada com a lógica real de setup
  console.log('Provider setup completed')
  return { success: true }
}

export const ProviderSetupForm = () => {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(completeProviderSetupAction, { success: false })

  return (
    <div className="max-w-md mx-auto p-4 md:p-6">
      <form action={formAction} className="space-y-4 md:space-y-6">
        {state.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {state.error}
          </div>
        )}
        <div>
          <Input
            type="text"
            name="businessName"
            placeholder="Business Name"
            required
            disabled={isPending}
          />
        </div>
        <div>
          <textarea
            name="description"
            placeholder="Business Description"
            className="w-full p-2 md:p-3 border rounded-md text-sm md:text-base"
            rows={4}
            required
            disabled={isPending}
          />
        </div>
        <div>
          <Select
            name="category"
            options={categoryOptions}
            required
            disabled={isPending}
          />
        </div>
        <div>
          <Input
            type="text"
            name="address"
            placeholder="Address"
            required
            disabled={isPending}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            name="city"
            placeholder="City"
            required
            disabled={isPending}
          />
          <Input
            type="text"
            name="state"
            placeholder="State"
            required
            disabled={isPending}
          />
        </div>
        <Button
          type="submit"
          className="w-full text-sm md:text-base"
          disabled={isPending}
        >
          {isPending ? 'Creating profile...' : 'Complete setup'}
        </Button>
      </form>
    </div>
  )
} 