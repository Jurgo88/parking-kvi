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

<style scoped>
  .request-form {
      background-color: white;
      padding: 25px;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
  }
  
  .request-form h2 {
      margin-top: 0;
      color: #007bff;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
  }
  
  input[type="date"],
  select {
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1em;
      width: 100%;
      box-sizing: border-box;
  }
  
  button {
      background-color: #28a745; /* Zelená farba pre Podať žiadosť */
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1.1em;
      transition: background-color 0.2s;
  }
  
  button:hover:not(:disabled) {
      background-color: #218838;
  }
  
  button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
  }
  </style>