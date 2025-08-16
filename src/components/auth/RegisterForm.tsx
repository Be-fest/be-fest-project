'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdPerson, MdEmail, MdLock, MdPhone, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useRouter } from 'next/navigation'
import { registerClientAction } from '@/lib/actions/auth'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    if (formData.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setLoading(true)
    
    try {
      const formDataObj = new FormData()
      formDataObj.append('fullName', formData.fullName)
      formDataObj.append('email', formData.email)
      formDataObj.append('password', formData.password)
      formDataObj.append('confirmPassword', formData.confirmPassword)
      formDataObj.append('cpf', '000.000.000-00') // Campo obrigatório, usar valor padrão
      formDataObj.append('phone', formData.whatsapp)
      
      const result = await registerClientAction(formDataObj)
      
      if (result.success) {
        setSuccess('Conta criada com sucesso!')
        
        // Verificar se o auto-login foi bem-sucedido
        if (result.data?.autoLogin) {
          // Login automático bem-sucedido, redirecionar para a página principal
          setTimeout(() => router.push('/'), 1500)
        } else {
          // Auto-login falhou, redirecionar para login
          setTimeout(() => router.push('/auth/login'), 2000)
        }
      } else {
        setError(result.error || 'Erro ao criar conta')
      }
    } catch (err: any) {
      setError('Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Nome Completo
        </label>
        <div className="relative">
          <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl" />
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="Seu nome completo"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          E-mail
        </label>
        <div className="relative">
          <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl" />
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
          WhatsApp (Opcional)
        </label>
        <div className="relative">
          <MdPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl" />
          <input
            type="tel"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Senha
        </label>
        <div className="relative">
          <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="Mínimo 6 caracteres"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] hover:text-[#520029] transition-colors"
          >
            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Confirmar Senha
        </label>
        <div className="relative">
          <MdLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="Repita sua senha"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] hover:text-[#520029] transition-colors"
          >
            {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF0080] text-white py-3 rounded-lg font-semibold hover:bg-[#E6006F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Criando conta...' : 'Criar Conta'}
      </motion.button>
    </motion.form>
  )
}
