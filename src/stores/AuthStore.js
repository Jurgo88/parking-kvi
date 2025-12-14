// src/stores/AuthStore.js

import { defineStore } from 'pinia';
import { supabase } from '@/supabase/supabaseClient';
import { useParkingStore } from './ParkingStore'; 

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null, 
        loadingSession: true,
        authError: null,
        userRole: 'guest',
        _listener_initialized: false, // <--- KROK 71: Nový stav pre kontrolu spustenia
    }),
    
    getters: {
        userId: (state) => state.user?.id || null, 
        isAuthenticated: (state) => !!state.user,
        isAdmin: (state) => state.userRole === 'admin',
    },

    actions: {
        
       // KROK 74: Úprava fetchUserRole s asynchrónnym timeoutom
       async fetchUserRole(supabaseUser) {
        this.userRole = 'user'; // Nastavte default
        
        // Vytvoríme promise pre dotaz do DB
        const roleQueryPromise = supabase
           .from('users')
           .select('role')
           .eq('user_id', supabaseUser.id)
           .single();

        // Vytvoríme promise pre timeout 
        const timeoutPromise = new Promise((_, reject) =>
           setTimeout(() => reject(new Error("Timeout: DB dotaz pre rolu trval pridlho.")), 1500) // 1.5 sekundy
        );

        try {
           // Konkurenčný beh: Ktorá promise skončí prvá?
           const { data } = await Promise.race([roleQueryPromise, timeoutPromise]);
           
           if (data && data.role) {
               this.userRole = data.role; // Úspešné načítanie
           }
       } catch (e) {
           // Chyba (vrátane timeoutu) znamená, že prejdeme ďalej s defaultnou rolou ('user')
           console.warn('Načítanie roly zlyhalo alebo bol prekročený časový limit:', e.message);
       }
   },

        async handleUserLoggedIn(supabaseUser) {
            this.user = { 
                id: supabaseUser.id, 
                email: supabaseUser.email || 'N/A'
            };
            
            // Čakáme na rolu, ale kvôli robustnému catch bloku by UI nemalo zamrznúť
            await this.fetchUserRole(supabaseUser); 
        },

        initAuthListener() {
            // KROK 71: Listener sa spustí len raz
            if (this._listener_initialized) return; 
            this._listener_initialized = true; 

            supabase.auth.onAuthStateChange(async (event, session) => {
                this.loadingSession = true; 
                const user = session?.user || null;
                
                try {
                    if (user) {
                        await this.handleUserLoggedIn(user);
                    } else {
                        // KROK 71: Zjednodušený reset pri odhlásení
                        this.user = null;
                        this.userRole = 'guest';
                        // NEVOLAŤ useParkingStore().$reset() tu!
                    }
                } catch (error) {
                    console.error('Kritická chyba počas spracovania relácie:', error);
                    this.user = null;
                    this.userRole = 'guest';
                } finally {
                    // KĽÚČOVÉ: VŽDY nastaviť loadingSession na false.
                    this.loadingSession = false; 
                }
            });
        },
        
        async signIn(email, password) {
             this.authError = null;
             try {
                 const { error } = await supabase.auth.signInWithPassword({ email, password });
                 if (error) { throw error; }
             } catch (error) {
                 this.authError = error.message;
             }
         },
        
        async signOut() {
            // KROK 71: Odstránenie volania useParkingStore pred await
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                // Manuálny reset po úspešnom odhlásení
                this.user = null;
                this.userRole = 'guest';
                // parkingStore.$reset();  <--- Krok 71: Odstránené volanie Store
            } catch (error) {
                console.error('Chyba pri odhlásení:', error);
            }
        },
    }
});