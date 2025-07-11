import { ReactNode } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex items-center justify-center px-4 py-8 md:px-6 lg:px-8 bg-white">
        <div className="w-full max-w-sm md:max-w-md">
          {children}
        </div>
      </div>
      
      <div className="hidden lg:block relative flex-1">
        <Image
          src="/bg-auth.jpg"
          alt="Evento elegante com mesa de catering"
          fill
          sizes="50vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </div>
  );
}
