<template>
  <div class="request-form">
    <h2>Podať Žiadosť o Parkovacie Miesto</h2>
    <p v-if="parkingStore.error" style="color: red;">{{ parkingStore.error }}</p>

    <input type="date" v-model="selectedDate">
    
    <select v-model="selectedSection">
      <option value="" disabled>Vyberte sekciu</option>
      <option value="PZ">PZ (Podzemná)</option>
      <option value="VD">VD (Vonkajšia Dolná)</option>
      <option value="VH">VH (Vonkajšia Horná)</option>
    </select>

    <button 
      @click="handleSubmission" 
      :disabled="parkingStore.isLoading || !selectedDate || !selectedSection"
    >
      {{ parkingStore.isLoading ? 'Odosielam...' : 'Podať žiadosť' }}
    </button>

    <div v-if="parkingStore.userRequests.length">
        <h3>Aktuálne žiadosti ({{ parkingStore.userRequests.length }})</h3>
        <ul>
            <li v-for="req in parkingStore.userRequests" :key="req.request_id">
                {{ req.parking_date }} - {{ req.preferred_section }} 
                ({{ req.is_successful ? 'PRIDELENÉ' : 'ČAKÁ' }})
            </li>
        </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';

const parkingStore = useParkingStore();

const selectedDate = ref('');
const selectedSection = ref('');

const handleSubmission = async () => {
    // Odstránime validáciu dátumu (D-2) z frontendu, 
    // aby sme to mali jednoduché. Systém bude akceptovať akýkoľvek budúci dátum.
    
    await parkingStore.submitRequest(selectedDate.value, selectedSection.value);
    
    // Ak bola žiadosť úspešná (error je null), resetujeme formulár
    if (!parkingStore.error) {
        selectedDate.value = '';
        selectedSection.value = '';
    }
};
</script>