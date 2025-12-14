// src/main.js

// import './assets/main.css'
import './style.css' // <--- AKTUALIZOVANÝ ŠTÝL SÚBOR

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Importujeme nový Auth Store
import { useAuthStore } from '@/stores/AuthStore' // <--- NOVÝ IMPORT

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Inicializácia AuthListenera HNEĎ po vytvorení Pinia
const authStore = useAuthStore() 
authStore.initAuthListener()

app.mount('#app')