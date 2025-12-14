// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
// Importujeme AuthStore, aby sme mohli skontrolovať rolu
import { useAuthStore } from '@/stores/AuthStore'; // <--- NOVÝ IMPORT

import HomeView from '@/views/HomeView.vue';
import AdminView from '@/views/AdminView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, requiresAdmin: true } // Obe metadáta
    }
  ]
});

// Krok 46: Navigačný Guard
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const isAuthenticated = authStore.isAuthenticated;
    const isAdmin = authStore.isAdmin;
    
    // Ak cieľová trasa vyžaduje Admin rolu
    if (to.meta.requiresAdmin) {
        
        // 1. Ak nie je prihlásený, alebo nie je Admin
        if (!isAuthenticated || !isAdmin) {
            
            // 2. Ak sa relácia práve načítava, necháme ho ísť na Home
            if (authStore.loadingSession) {
                // Týmto sa presmeruje na HomeView, kde sa zobrazí loading
                next({ name: 'home' }); 
                return;
            }

            // 3. Ak sa relácia už načítala (a nie je admin/prihlásený), zablokujeme prístup
            // a zabezpečíme presmerovanie na Home
            alert('Prístup zamietnutý. Táto sekcia je len pre administrátorov.');
            
            // POISTKA: Ak už ideme z Home, a Admin View je zablokovaný, 
            // nechceme, aby sa guard spúšťal znova.
            if (from.name !== 'home') {
                next({ name: 'home' });
            } else {
                next(false); // Zastaviť navigáciu a zostať na from (Home), ak už tam bol
            }
            return;
        }
    } 
    
    // 2. Všeobecná ochrana (ak trasa vyžaduje prihlásenie)
    if (to.meta.requiresAuth && !isAuthenticated && !authStore.loadingSession) {
        next({ name: 'home' }); 
        return;
    }
    
    // Povolíme navigáciu
    next();
});

export default router;