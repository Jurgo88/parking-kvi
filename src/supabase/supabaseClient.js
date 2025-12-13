// src/supabase/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

// Čítanie premenných prostredia z .env súboru
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Kontrola, či sa kľúče načítať
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Supabase URL alebo Kľúč nebol nájdený. Skontrolujte súbor .env a prefix VITE_.");
}

// Vytvorenie a export Supabase klienta
export const supabase = createClient(supabaseUrl, supabaseAnonKey);