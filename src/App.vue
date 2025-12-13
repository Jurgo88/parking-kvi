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
    </div>
  </main>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';
import { useAuthStore } from '@/stores/AuthStore'; // <--- NOVÝ IMPORT
import ParkingRequestForm from '@/components/ParkingRequestForm.vue';
import AuthForm from '@/components/AuthForm.vue'; // <--- NOVÝ IMPORT

const parkingStore = useParkingStore();
const authStore = useAuthStore();

// Odstránime onMounted, pretože dáta budeme načítať pomocou WATCHERA
// parkovací status sa bude načítať len ak sa zmení stav prihlásenia
watch(() => authStore.userId, (newUserId) => {
  if (newUserId) {
    // Ak sa používateľ prihlási, musíme načítať jeho status
    parkingStore.fetchUserStatus();
  } else {
    // Ak sa používateľ odhlási, vyčistíme dáta
    parkingStore.$reset();
  }
}, { immediate: true }); // Spustiť aj pri štarte
</script>