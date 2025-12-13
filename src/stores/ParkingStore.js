// src/stores/ParkingStore.js

import { defineStore } from 'pinia';
import { supabase } from '@/supabase/supabaseClient';
import { useAuthStore } from './AuthStore'; // <--- KROK 9: IMPORT pre získanie user ID

export const useParkingStore = defineStore('parking', {
    state: () => ({
        // Stav užívateľa
        userPoints: 0,
        userRequests: [], // Zoznam žiadostí, vrátane alokácií (JOIN)
        
        // Stav aplikácie
        isLoading: false,
        error: null,
    }),
    
    // 1. GETTERS (Získanie dát zo stavu)
    getters: {
        getUserPoints: (state) => state.userPoints,
        // Getter na získanie aktuálne prijatých alokácií (miest)
        getAllocatedParking: (state) => state.userRequests.filter(req => 
            req.is_successful && req.allocations && req.allocations.length > 0
        ),
    },

    // 2. ACTIONS (Funkcie, ktoré menia stav a komunikujú s API)
    actions: {
        
        /**
         * Načíta prioritné body a všetky žiadosti/alokácie používateľa.
         */
        async fetchUserStatus() {
            this.isLoading = true;
            this.error = null;
            
            const authStore = useAuthStore();
            const userId = authStore.userId; 
            
            if (!userId) {
                this.isLoading = false;
                // Ak nie je prihlásený, nastavíme default stav
                this.userPoints = 0;
                this.userRequests = [];
                return; 
            }
            
            try {
                // 1. Získanie Prioritných Bodov
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('priority_points')
                    .eq('user_id', userId)
                    .single(); 
                
                if (userError && userError.code !== 'PGRST116') { // PGRST116 = Neprázdny výsledok (OK)
                    throw userError;
                }
                this.userPoints = user ? user.priority_points : 0;

                // 2. Získanie všetkých žiadostí s ich alokáciami (KROK 11.C: JOIN)
                const { data: requests, error: reqError } = await supabase
                    .from('requests')
                    .select(`
                        request_id,
                        parking_date,
                        preferred_section,
                        is_successful,
                        allocations (
                            allocation_id, 
                            section_allocated, 
                            is_cancelled, 
                            points_change
                        )
                    `)
                    .eq('user_id', userId)
                    .order('parking_date', { ascending: true });

                if (reqError) throw reqError;
                
                // Formátovanie dát: Zjednodušíme štruktúru alokácií na jeden objekt
                this.userRequests = requests.map(req => ({
                    ...req,
                    // Ak existuje alokácia, pripojíme ju priamo k objektu žiadosti
                    allocation: req.allocations.length > 0 ? req.allocations[0] : null
                }));

            } catch (err) {
                console.error('Chyba pri načítaní stavu používateľa:', err);
                this.error = `Nepodarilo sa načítať dáta: ${err.message}`;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Podá novú žiadosť o parkovacie miesto.
         */
        async submitRequest(parkingDate, preferredSection) {
            this.isLoading = true;
            this.error = null;
            const authStore = useAuthStore();
            const userId = authStore.userId; 

            if (!userId) {
                this.error = "Pre podanie žiadosti sa musíte prihlásiť.";
                this.isLoading = false;
                return;
            }
            
            if (!parkingDate || !preferredSection) {
                this.error = "Vyberte prosím dátum a sekciu.";
                this.isLoading = false;
                return;
            }

            try {
                // Vloženie dát do tabuľky 'requests'
                const { error } = await supabase
                    .from('requests')
                    .insert([
                        { 
                            user_id: userId, 
                            parking_date: parkingDate, 
                            preferred_section: preferredSection 
                        }
                    ]);

                if (error) {
                    // 23505 je kód pre porušenie UNIQUE constraint (žiadosť na ten istý deň)
                    if (error.code === '23505') { 
                         throw new Error('Žiadosť na tento dátum už bola podaná.');
                    }
                    throw error;
                }

                // Obnovenie stavu po úspešnom podaní
                await this.fetchUserStatus();

            } catch (err) {
                console.error('Chyba pri podávaní žiadosti:', err);
                this.error = `Nepodarilo sa podať žiadosť: ${err.message}`;
            } finally {
                this.isLoading = false;
            }
        },

        /**
         * Zruší pridelené parkovacie miesto (Drop-Out) volaním RPC funkcie. (KROK 11.A)
         */
        async cancelAllocation(allocationId) {
            this.isLoading = true;
            this.error = null;
            
            const authStore = useAuthStore();
            const userId = authStore.userId;

            if (!userId) {
                this.error = "Nie ste prihlásený.";
                this.isLoading = false;
                return;
            }

            try {
                // Volanie Supabase RPC (SQL funkcie)
                const { error } = await supabase.rpc('cancel_allocation', {
                    p_allocation_id: allocationId, 
                    p_user_id: userId              
                });

                if (error) {
                    // Tu sa zachytia chyby z PostgreSQL (napr. 'Allocation not found')
                    throw error;
                }

                // Po úspešnom zrušení obnovíme stav
                await this.fetchUserStatus();

            } catch (err) {
                console.error('Chyba pri zrušení alokácie:', err);
                this.error = `Nepodarilo sa zrušiť rezerváciu: ${err.message}`;
            } finally {
                this.isLoading = false;
            }
        },
        
        /**
         * Resetuje stav Store po odhlásení
         */
        $reset() {
            this.userPoints = 0;
            this.userRequests = [];
            this.isLoading = false;
            this.error = null;
        }
    }
});