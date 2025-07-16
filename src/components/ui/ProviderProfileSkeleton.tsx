import { motion } from 'framer-motion';

export function ProviderProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <div>
          <div className="h-8 w-48 bg-gray-300 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>

      {/* Profile Form Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Logo Section Skeleton */}
        <div className="mb-6">
          <div className="h-5 w-32 bg-gray-300 rounded animate-pulse mb-3"></div>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-gray-300 animate-pulse"></div>
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* Form Fields Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nome da Empresa */}
          <div>
            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Nome do Proprietário */}
          <div>
            <div className="h-4 w-36 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Email */}
          <div>
            <div className="h-4 w-16 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* WhatsApp */}
          <div>
            <div className="h-4 w-20 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* CNPJ */}
          <div>
            <div className="h-4 w-16 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Área de Atuação */}
          <div>
            <div className="h-4 w-28 bg-gray-300 rounded animate-pulse mb-2"></div>
            <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Statistics Skeleton */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="h-6 w-48 bg-gray-300 rounded animate-pulse mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center">
              <div className="h-8 w-16 bg-gray-300 rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 