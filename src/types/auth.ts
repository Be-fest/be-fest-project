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

export interface User {
  id: string;
  email: string;
  fullName?: string;
  companyName?: string;
  type: 'client' | 'service_provider';
}

// Server Action result types
export interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

export interface UserSession {
  userId: string;
  email: string;
  type: 'client' | 'service_provider';
}
