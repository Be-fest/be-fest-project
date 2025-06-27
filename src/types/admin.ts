export interface AdminStats {
  activeParties: number;
  pendingOrders: number;
  monthlyRevenue: number;
  newClients: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  serviceName: string;
  value: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  partyDate?: Date;
}

export type OrderStatus = 
  | 'solicitacao_enviada'
  | 'aguardando_pagamento' 
  | 'confirmado'
  | 'cancelado';

export interface ActiveParty {
  id: string;
  name: string;
  client: string;
  status: PartyStatus;
  progress: number;
  date: Date;
  services: PartyService[];
}

export type PartyStatus = 
  | 'contratacao'
  | 'pagamento'
  | 'confirmacao'
  | 'em_andamento'
  | 'concluido';

export interface PartyService {
  id: string;
  name: string;
  provider: string;
  status: OrderStatus;
  value: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  createdAt: Date;
  totalOrders: number;
  totalSpent: number;
}

export interface Provider {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  cnpj: string;
  category: string;
  rating: number;
  totalServices: number;
  isActive: boolean;
  createdAt: Date;
}

export interface StatusFilterOption {
  value: string;
  label: string;
  color?: string;
} 