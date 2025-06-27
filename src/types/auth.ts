export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cpf: string;
  phone: string;
}

export interface ServiceProviderFormData {
  companyName: string;
  email: string;
  password: string;
  confirmPassword: string;
  cnpj: string;
  phone: string;
  areaOfOperation: string;
}

export interface AuthContextType {
  user: User | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  registerServiceProvider: (data: ServiceProviderFormData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  type: 'client' | 'service_provider';
}

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  userType: 'client' | 'service_provider';
  onUserTypeChange: (type: 'client' | 'service_provider') => void;
  error?: string;
}

export interface ServiceProviderFormProps {
  onSubmit: (data: ServiceProviderFormData) => Promise<void>;
  userType: 'client' | 'service_provider';
  onUserTypeChange: (type: 'client' | 'service_provider') => void;
  error?: string;
}
