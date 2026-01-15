<template>
  <div class="request-form">
    <h2>Parking request</h2>
    <p v-if="parkingStore.error" style="color: red;">{{ parkingStore.error }}</p>

    <!-- Label pre jasnosť -->
    <label for="date-input" class="input-label">Vyberte dátum:</label>
    <input 
      id="date-input"
      type="date" 
      v-model="selectedDate" 
      placeholder="Vyberte dátum"
    >
    
    <label for="section-select" class="input-label">Vyberte preferovanú sekciu:</label>
    <select id="section-select" v-model="selectedSection">
      <option value="" disabled selected>Preffered section</option>
      <option value="PZ">Podzemná garáž</option>
      <option value="VD">Vonkajšia Dolná</option>
      <option value="VH">Vonkajšia Horná</option>
    </select>

    <button 
      @click="handleSubmission" 
      :disabled="parkingStore.isLoading || !selectedDate"
    >
      {{ parkingStore.isLoading ? 'Sending...' : 'Send request' }}
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
    await parkingStore.submitRequest(selectedDate.value, selectedSection.value);
    
    if (!parkingStore.error) {
        selectedDate.value = '';
        selectedSection.value = '';
    }
};
</script>

<style scoped>
.request-form {
    background-color: var(--qaternary-color);
    padding: 25px;
    border-radius: 0px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    color: var(--primary-color);
}

.request-form h2 {
    margin-top: 0;
    border-bottom: 2px solid var(--primary-color);
    padding-bottom: 10px;
}

.input-label {
    font-size: 0.9rem;
    font-weight: 500;
}

/* Input + select na 100% šírku */
input[type="date"],
select {
  -webkit-appearance: none; /* For Webkit browsers */
  -moz-appearance: textfield; /* For Firefox */
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1em;
    width: 100%;
    box-sizing: border-box;
}

/* Button */
button {
    background-color: #28a745;
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

/* Pre mobil, aby inputy boli väčšie a ľahko klikateľné */
@media (max-width: 640px) {
    input[type="date"],
    select,
    button {
        font-size: 1em;
        padding: 12px;
    }
}
</style>
