import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database';

let supabaseClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const createClient = () => {
    if (supabaseClient) return supabaseClient;

    supabaseClient = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                storage: {
                    getItem: (key: string) => {
                        if (typeof window === 'undefined') return null;
                        try {
                            const item = localStorage.getItem(key);
                            return item ? JSON.parse(item) : null;
                        } catch (error) {
                            console.error('Erro ao ler do localStorage:', error);
                            return null;
                        }
                    },
                    setItem: (key: string, value: string) => {
                        if (typeof window === 'undefined') return;
                        try {
                            localStorage.setItem(key, value);
                        } catch (error) {
                            console.error('Erro ao salvar no localStorage:', error);
                        }
                    },
                    removeItem: (key: string) => {
                        if (typeof window === 'undefined') return;
                        try {
                            localStorage.removeItem(key);
                        } catch (error) {
                            console.error('Erro ao remover do localStorage:', error);
                        }
                    }
                },
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        }
    );

    return supabaseClient;
};

export const supabase = createClient();

export const checkEmailExists = async (email: string) => {
  try {
    console.log('Checking email:', email);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Error checking email:', error);
      throw new Error(`Erro ao verificar email: ${error.message}`);
    }

    console.log('Email check result:', data);
    return !!data;
  } catch (error) {
    console.error('Error in checkEmailExists:', error);
    throw error;
  }
};

export const checkDocumentExists = async (document: string) => {
  try {
    console.log('Checking document:', document);
    const supabase = createClient();
    
    // Verificar CPF
    console.log('Checking CPF...');
    const { data: cpfData, error: cpfError } = await supabase
      .from('users')
      .select('id')
      .eq('cpf', document)
      .maybeSingle();

    if (cpfError) {
      console.error('Error checking CPF:', cpfError);
      throw new Error(`Erro ao verificar CPF: ${cpfError.message}`);
    }

    // Se encontrou um CPF, retorna true imediatamente
    if (cpfData) {
      console.log('CPF found:', cpfData);
      return true;
    }

    // Verificar CNPJ
    console.log('Checking CNPJ...');
    const { data: cnpjData, error: cnpjError } = await supabase
      .from('users')
      .select('id')
      .eq('cnpj', document)
      .maybeSingle();

    if (cnpjError) {
      console.error('Error checking CNPJ:', cnpjError);
      throw new Error(`Erro ao verificar CNPJ: ${cnpjError.message}`);
    }

    // Se encontrou um CNPJ, retorna true
    if (cnpjData) {
      console.log('CNPJ found:', cnpjData);
      return true;
    }

    // Se não encontrou nenhum dos dois, retorna false
    console.log('No document found');
    return false;
  } catch (error) {
    console.error('Error in checkDocumentExists:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Erro desconhecido ao verificar documento');
    }
  }
}; 