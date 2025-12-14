<template>
  <header>
    <nav class="main-nav">
        <router-link to="/" class="nav-link">Domov</router-link>
        <span v-if="authStore.isAuthenticated"> | </span>
        <router-link v-if="authStore.isAdmin" to="/admin" class="nav-link">Admin Dashboard</router-link>
    </nav>
    
    <h1>Parkovací Systém KVI</h1>
    
    <p v-if="authStore.isAuthenticated">
      Prihlásený: {{ authStore.user.email }} | 
      PB: {{ parkingStore.getUserPoints }}
      <button @click="authStore.signOut()">Odhlásiť</button>
    </p>
  </header>

  <main>
    <router-view /> 
  </main>
</template>

<script setup>
import { watch } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';
import { useAuthStore } from '@/stores/AuthStore';
// DÔLEŽITÉ: Odstránili sme importy: ParkingRequestForm, AuthForm, UserAllocations

const parkingStore = useParkingStore();
const authStore = useAuthStore();

// Watcher zostáva
watch(() => authStore.userId, (newUserId) => {
  if (newUserId) {
    parkingStore.fetchUserStatus();
  } else {
    parkingStore.$reset();
  }
}, { immediate: true });
</script>

<style scoped>
/* Vaše štýly */
</style>