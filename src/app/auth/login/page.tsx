'use client';

import { LoginForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="relative w-full px-4 sm:px-0">
        <div className="w-full max-w-sm mx-auto sm:max-w-md">
          <LoginForm />
        </div>
      </div>
    </AuthLayout>
  );
}
