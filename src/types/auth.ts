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

export interface UserProfile {
  id: string;
  role: 'client' | 'provider' | 'admin';
  full_name?: string;
  email?: string;
  organization_name?: string;
  cnpj?: string;
  whatsapp_number?: string;
  logo_url?: string;
  area_of_operation?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileData {
  full_name: string;
  email: string;
  whatsapp_number: string;
}

export interface UpdateAddressData {
  city: string;
  state: string;
  postal_code: string;
}
