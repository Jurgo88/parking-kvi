<template>
    <div class="home-container">
      <div v-if="authStore.loadingSession">
        Preverujem stav prihlásenia...
      </div>
      
      <div v-else-if="!authStore.isAuthenticated">
        <h2>Prihlásenie</h2>
        <AuthForm />
      </div>
  
      <div v-else>
        <h2>Podanie Žiadosti</h2>
        <ParkingRequestForm />
  
        <hr> 
        
        <h2>Vaše Alokácie a Žiadosti</h2>
        <UserAllocations /> 
      </div>
    </div>
  </template>
  
  <script setup>
  import { useAuthStore } from '@/stores/AuthStore';
  import ParkingRequestForm from '@/components/ParkingRequestForm.vue';
  import AuthForm from '@/components/AuthForm.vue';
  import UserAllocations from '@/components/UserAllocations.vue'; 
  
  const authStore = useAuthStore();
  </script>
  
  <style scoped>
  .home-container {
      /* ... (Vaše štýly) ... */
      padding: 30px;
  }
  </style>