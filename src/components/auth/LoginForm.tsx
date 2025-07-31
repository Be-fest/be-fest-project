'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useToastGlobal } from '@/contexts/GlobalToastContext'

export function LoginForm() {
  const { signIn, loading } = useAuth()
  const router = useRouter()
  const toast = useToastGlobal()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const result = await signIn(formData.email, formData.password)
      
      if (result?.user) {
        toast.success('Login realizado com sucesso!', 'Bem-vindo de volta!')
        
        // Aguardar um pouco para garantir que os dados do usuário foram carregados
        setTimeout(() => {
          // Redirecionar baseado no role do usuário
          const userRole = (result as any).userData?.role || result.user.user_metadata?.role
          
          if (userRole === 'provider' || userRole === 'admin') {
            router.push('/dashboard/prestador')
          } else {
            router.push('/dashboard')
          }
        }, 1000)
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
      toast.error('Erro no login', err.message || 'Erro ao fazer login')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          E-mail
        </label>
        <div className="relative">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="seu@email.com"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Senha
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="Sua senha"
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF0080] text-white py-3 rounded-lg font-semibold hover:bg-[#E6006F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  )
}
