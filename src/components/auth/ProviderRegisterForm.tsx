'use client';

import { useState, useEffect } from 'react';
import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { MdVisibility, MdVisibilityOff, MdBusiness, MdEmail, MdLock, MdPhone, MdLocationOn } from 'react-icons/md';

import { AddressFields } from '@/components/ui/AddressFields';
import AreaOfOperationSelect from '@/components/ui/AreaOfOperationSelect';
import { registerProviderAction } from '@/lib/actions/auth';
import { geocodingService } from '@/lib/services/geocoding';

export function ProviderRegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    organizationName: '',
    cnpj: '',
    email: '',
    password: '',
    confirmPassword: '',
    whatsapp: '',
    areaOfOperation: '',
  })
  
  // Estado para campos de endereço
  const [addressData, setAddressData] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: ''
  });
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Função para gerar endereço completo
  const generateFullAddress = (address: typeof addressData): string => {
    const parts = [];
    
    // Formato: "Rua, Número, Bairro, Cidade, Estado"
    if (address.street && address.street.trim()) {
      parts.push(address.street.trim());
    }
    
    if (address.number && address.number.trim()) {
      parts.push(address.number.trim());
    }
    
    if (address.neighborhood && address.neighborhood.trim()) {
      parts.push(address.neighborhood.trim());
    }
    
    if (address.city && address.city.trim()) {
      parts.push(address.city.trim());
    }
    
    if (address.state && address.state.trim()) {
      parts.push(address.state.trim());
    }
    
    return parts.join(', ');
  };

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
      const fullAddress = generateFullAddress(addressData);
      
      const formDataObj = new FormData()
      formDataObj.append('companyName', formData.organizationName)
      formDataObj.append('cnpj', formData.cnpj)
      formDataObj.append('email', formData.email)
      formDataObj.append('password', formData.password)
      formDataObj.append('confirmPassword', formData.confirmPassword)
      formDataObj.append('phone', formData.whatsapp)
      formDataObj.append('areaOfOperation', formData.areaOfOperation)
      formDataObj.append('address', fullAddress)
      
      // Fazer geocoding do endereço
      if (fullAddress && fullAddress.trim()) {
        const geocodingResult = await geocodingService.geocodeAddress(fullAddress);
        if (geocodingResult) {
          formDataObj.append('latitude', geocodingResult.latitude.toString());
          formDataObj.append('longitude', geocodingResult.longitude.toString());
        }
      }
      
      const result = await registerProviderAction(formDataObj)
      
      if (result.success) {
        setSuccess('Conta de prestador criada com sucesso!')
        setTimeout(() => router.push('/auth/login'), 2000)
      } else {
        setError(result.error || 'Erro ao criar conta de prestador')
      }
    } catch (err: any) {
      setError('Erro ao criar conta de prestador')
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

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value)
    setFormData(prev => ({
      ...prev,
      cnpj: formatted
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
          Nome da Empresa
        </label>
        <div className="relative">
          <MdBusiness className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl" />
          <input
            type="text"
            name="organizationName"
            value={formData.organizationName}
            onChange={handleChange}
            required
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="Nome da sua empresa"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          CNPJ
        </label>
        <div className="relative">
          <MdBusiness className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl" />
          <input
            type="text"
            name="cnpj"
            value={formData.cnpj}
            onChange={handleCNPJChange}
            required
            maxLength={18}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
            placeholder="00.000.000/0000-00"
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
            placeholder="contato@empresa.com"
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

      {/* Campos de Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[#520029]">Endereço</h3>
        <AddressFields
          value={addressData}
          onChange={setAddressData}
          className="space-y-4"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#520029] mb-2">
          Subcategoria (Opcional)
        </label>
        <div className="relative">
          <MdLocationOn className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6E5963] text-xl z-10" />
          <AreaOfOperationSelect
            value={formData.areaOfOperation}
            onChange={(value) => setFormData(prev => ({ ...prev, areaOfOperation: value }))}
            name="areaOfOperation"
            placeholder="Selecione uma subcategoria"
            className="pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#FF0080] focus:ring-2 focus:ring-[#FF0080]/20 outline-none transition-all"
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
        {loading ? 'Criando conta...' : 'Criar Conta de Prestador'}
      </motion.button>
    </motion.form>
  )
}
