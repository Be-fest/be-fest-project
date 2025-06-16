export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  cpf: string;
  whatsapp: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ServiceProviderFormData {
  businessName: string;
  cnpj: string;
  whatsapp: string;
  businessType: string;
  serviceArea: string;
  password: string;
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
