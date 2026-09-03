import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// A URL reserva permite abrir a interface e exibir uma mensagem clara de
// configuração, em vez de encerrar o aplicativo antes da tela de login.
export const supabase = createClient(
    supabaseUrl || 'https://configurar-supabase.supabase.co',
    supabaseAnonKey || 'supabase-nao-configurado',
    {
        auth: {
            storage: AsyncStorage,
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
        },
    },
);
