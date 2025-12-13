<template>
  <div class="auth-card">
    <h2>Prihlásenie</h2>
    <p v-if="authStore.authError" class="error-msg">{{ authStore.authError }}</p>
    
    <input type="email" v-model="email" placeholder="Email">
    <input type="password" v-model="password" placeholder="Heslo">
    
    <button @click="authStore.signIn(email, password)">Prihlásiť sa</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
</script>