'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const { login, loading } = useAuth()
  const router = useRouter()
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
      await login(formData)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login')
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
            placeholder="Sua senha"
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

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={loading}
        className="w-full bg-[#FF0080] text-white py-3 rounded-lg font-semibold hover:bg-[#E6006F] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </motion.button>
    </motion.form>
  )
}
