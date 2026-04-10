import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
    import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
    import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test connection
export const testConnection = async() => {
    try {
        const { data, error } = await supabase.from('patients').select('count', { count: 'exact' });
        if (error) throw error;
        console.log('✅ Supabase connection successful');
        return true;
    } catch (err) {
        console.error('❌ Supabase connection failed:', err.message);
        return false;
    }
};