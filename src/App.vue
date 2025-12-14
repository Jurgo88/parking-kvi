<template>
  <header>
    <h1>Parkovací Systém KVI</h1>
    <p v-if="authStore.isAuthenticated">
      Prihlásený: {{ authStore.user.email }} | 
      PB: {{ parkingStore.getUserPoints }}
      <button @click="authStore.signOut()">Odhlásiť</button>
    </p>
  </header>

  <main>
    <div v-if="authStore.loadingSession">
      Preverujem stav prihlásenia...
    </div>
    
    <div v-else-if="!authStore.isAuthenticated">
      <AuthForm />
    </div>

    <div v-else>
      <ParkingRequestForm />

      <hr> 
      
      <UserAllocations /> 
    </div>
  </main>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';
import { useAuthStore } from '@/stores/AuthStore';
import ParkingRequestForm from '@/components/ParkingRequestForm.vue';
import AuthForm from '@/components/AuthForm.vue';
// *** NOVÝ IMPORT ***
import UserAllocations from '@/components/UserAllocations.vue'; 

const parkingStore = useParkingStore();
const authStore = useAuthStore();

// Watcher bezo zmeny
watch(() => authStore.userId, (newUserId) => {
  if (newUserId) {
    parkingStore.fetchUserStatus();
  } else {
    parkingStore.$reset();
  }
}, { immediate: true });
</script>