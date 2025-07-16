'use client'

import { useState, useEffect } from 'react'
import { getSubcategoriesAction } from '@/lib/actions/services'
import { Subcategory } from '@/types/database'

interface AreaOfOperationSelectProps {
  value: string
  onChange: (value: string) => void
  name?: string
  required?: boolean
  placeholder?: string
  className?: string
}

export default function AreaOfOperationSelect({
  value,
  onChange,
  name = 'areaOfOperation',
  required = false,
  placeholder = 'Selecione a área de atuação',
  className = ''
}: AreaOfOperationSelectProps) {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadSubcategories() {
      try {
        setLoading(true)
        setError(null)
        
        const result = await getSubcategoriesAction()
        
        if (result.success && result.data) {
          setSubcategories(result.data)
        } else {
          setError(result.error || 'Erro ao carregar subcategorias')
        }
      } catch (err) {
        setError('Erro inesperado ao carregar subcategorias')
        console.error('Error loading subcategories:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSubcategories()
  }, [])

  if (loading) {
    return (
      <select 
        disabled 
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-100 ${className}`}
      >
        <option>Carregando subcategorias...</option>
      </select>
    )
  }

  if (error) {
    return (
      <select 
        disabled 
        className={`w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-red-50 ${className}`}
      >
        <option>Erro ao carregar subcategorias</option>
      </select>
    )
  }

  return (
    <select
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
    >
      <option value="">{placeholder}</option>
      {subcategories.map((subcategory) => (
        <option key={subcategory.id} value={subcategory.name}>
          {subcategory.name}
        </option>
      ))}
    </select>
  )
} 