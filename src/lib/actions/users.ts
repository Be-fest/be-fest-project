'use server';

import { supabase } from '@/lib/supabase';

interface UpdateProfileData {
  full_name: string;
  email: string;
  whatsapp_number: string;
}

interface UpdateAddressData {
  city: string;
  state: string;
  postal_code: string;
}

interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
}

export async function updateUserProfileAction(data: UpdateProfileData) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        full_name: data.full_name,
        email: data.email,
        whatsapp_number: data.whatsapp_number,
        updated_at: new Date().toISOString()
      })
      .eq('id', supabase.auth.getUser().then(({ data }) => data.user?.id));

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return {
      success: false,
      error: 'Erro ao atualizar perfil. Por favor, tente novamente.'
    };
  }
}

export async function updateUserAddressAction(data: UpdateAddressData) {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        city: data.city,
        state: data.state,
        postal_code: data.postal_code,
        updated_at: new Date().toISOString()
      })
      .eq('id', supabase.auth.getUser().then(({ data }) => data.user?.id));

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar endereço:', error);
    return {
      success: false,
      error: 'Erro ao atualizar endereço. Por favor, tente novamente.'
    };
  }
}

export async function updatePasswordAction(data: UpdatePasswordData) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    return {
      success: false,
      error: 'Erro ao atualizar senha. Por favor, tente novamente.'
    };
  }
} 