import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  
  // PRIDANIE RESOLVERA PRE ALIAS @
  resolve: {
    alias: {
      // Definuje, že alias '@' odkazuje na priečinok './src'
      '@': fileURLToPath(new URL('./src', import.meta.url)) 
    }
  }
})