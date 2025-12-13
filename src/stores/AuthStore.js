// src/stores/AuthStore.js

import { defineStore } from 'pinia';
import { supabase } from '@/supabase/supabaseClient';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null, // Objekt prihláseného používateľa
        loadingSession: true,
        authError: null,
    }),
    
    getters: {
        // Vracia UUID prihláseného používateľa
        userId: (state) => state.user?.id || null, 
        isAuthenticated: (state) => !!state.user,
    },

    actions: {
        /**
         * Inicializuje poslucháča pre zmeny stavu Auth.
         * Toto sa spustí raz pri štarte aplikácie.
         */
        initAuthListener() {
            // Poslucháč, ktorý reaguje na prihlásenie/odhlásenie
            supabase.auth.onAuthStateChange((event, session) => {
                this.loadingSession = true;
                this.user = session?.user || null;
                
                // Ak je používateľ prihlásený, inicializujeme jeho parkovací status
                if (this.isAuthenticated) {
                    // POZOR: Tu voláme ParkingStore, ale musíme ho importovať!
                    // Toto zatiaľ necháme ako poznámku, upravíme to v Kroku 9.
                    // useParkingStore().fetchUserStatus(); 
                }
                this.loadingSession = false;
            });
        },
        
        /**
         * Prihlásenie používateľa pomocou e-mailu a hesla.
         */
        async signIn(email, password) {
            this.authError = null;
            try {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                
                if (error) {
                    throw error;
                }
            } catch (error) {
                this.authError = error.message;
            }
        },

        async signOut() {
            try {
                await supabase.auth.signOut();
                this.user = null; // Manuálne resetujeme stav
            } catch (error) {
                console.error('Chyba pri odhlásení:', error);
            }
        },

        // Poznámka: Registráciu necháme zatiaľ bokom, ak už máte účet. Ak by bola potrebná, 
        // použijeme supabase.auth.signUp()
    }
});